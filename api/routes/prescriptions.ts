import { Router } from "express";
import db from "../db/index.js";

const router = Router();

router.post("/", (req, res) => {
  const { medicalRecordId, items, notes } = req.body;

  const existingPrescription = db
    .prepare("SELECT id FROM prescriptions WHERE medical_record_id = ?")
    .get(medicalRecordId);

  if (existingPrescription) {
    return res.json({ success: false, message: "该就诊记录已有处方" });
  }

  const result = db
    .prepare("INSERT INTO prescriptions (medical_record_id, notes) VALUES (?, ?)")
    .run(medicalRecordId, notes || "");

  const prescriptionId = result.lastInsertRowid as number;

  const insertItem = db.prepare(
    `INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration_days, instructions)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  const insertStockOut = db.prepare(
    "INSERT INTO stock_records (medicine_id, type, quantity, notes) VALUES (?, 'out', ?, '处方发药')"
  );

  const updateStock = db.prepare("UPDATE medicines SET stock_quantity = stock_quantity - ? WHERE id = ?");

  const itemsResult: any[] = [];

  const transaction = db.transaction(() => {
    for (const item of items) {
      const itemResult = insertItem.run(
        prescriptionId,
        item.medicineId,
        item.dosage,
        item.frequency,
        item.durationDays,
        item.instructions || ""
      );

      const medicine = db.prepare("SELECT * FROM medicines WHERE id = ?").get(item.medicineId) as any;
      const totalQty = Math.ceil(item.dosage * item.durationDays);
      updateStock.run(totalQty, item.medicineId);
      insertStockOut.run(item.medicineId, totalQty);

      itemsResult.push({
        id: itemResult.lastInsertRowid,
        prescriptionId,
        medicineId: item.medicineId,
        medicineName: medicine?.name,
        specification: medicine?.specification,
        dosage: item.dosage,
        frequency: item.frequency,
        durationDays: item.durationDays,
        instructions: item.instructions,
      });
    }
  });

  transaction();

  db.prepare("UPDATE medical_records SET status = 'completed' WHERE id = ?").run(medicalRecordId);

  res.json({
    success: true,
    data: {
      id: prescriptionId,
      medicalRecordId,
      notes,
      items: itemsResult,
    },
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const prescription = db.prepare("SELECT * FROM prescriptions WHERE id = ?").get(id) as any;

  if (!prescription) {
    return res.status(404).json({ success: false, message: "处方不存在" });
  }

  const items = db
    .prepare(
      `SELECT pi.*, m.name as medicine_name, m.specification, m.unit, m.price
       FROM prescription_items pi
       LEFT JOIN medicines m ON pi.medicine_id = m.id
       WHERE pi.prescription_id = ?`
    )
    .all(id)
    .map((item: any) => ({
      id: item.id,
      prescriptionId: item.prescription_id,
      medicineId: item.medicine_id,
      medicineName: item.medicine_name,
      specification: item.specification,
      unit: item.unit,
      price: item.price,
      dosage: item.dosage,
      frequency: item.frequency,
      durationDays: item.duration_days,
      instructions: item.instructions,
    }));

  res.json({
    success: true,
    data: {
      id: prescription.id,
      medicalRecordId: prescription.medical_record_id,
      notes: prescription.notes,
      createdAt: prescription.created_at,
      items,
    },
  });
});

export default router;
