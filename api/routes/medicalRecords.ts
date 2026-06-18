import { Router } from "express";
import db from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const { date, status, petId } = req.query;

  let query = `
    SELECT mr.*, p.name as pet_name, o.name as owner_name, u.name as doctor_name,
           EXISTS(SELECT 1 FROM prescriptions WHERE medical_record_id = mr.id) as has_prescription
    FROM medical_records mr
    LEFT JOIN pets p ON mr.pet_id = p.id
    LEFT JOIN owners o ON p.owner_id = o.id
    LEFT JOIN users u ON mr.doctor_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (date) {
    query += " AND DATE(mr.visit_date) = ?";
    params.push(date);
  }

  if (status) {
    query += " AND mr.status = ?";
    params.push(status);
  }

  if (petId) {
    query += " AND mr.pet_id = ?";
    params.push(petId);
  }

  query += " ORDER BY mr.visit_date DESC LIMIT 50";

  const records = db.prepare(query).all(...params).map((record: any) => ({
    id: record.id,
    petId: record.pet_id,
    petName: record.pet_name,
    ownerName: record.owner_name,
    doctorId: record.doctor_id,
    doctorName: record.doctor_name,
    visitDate: record.visit_date,
    chiefComplaint: record.chief_complaint,
    examination: record.examination,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    weight: record.weight,
    temperature: record.temperature,
    status: record.status,
    hasPrescription: !!record.has_prescription,
  }));

  res.json({ success: true, data: records });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const record = db
    .prepare(
      `SELECT mr.*, p.name as pet_name, p.species as pet_species, p.breed as pet_breed,
              o.name as owner_name, o.phone as owner_phone, u.name as doctor_name
       FROM medical_records mr
       LEFT JOIN pets p ON mr.pet_id = p.id
       LEFT JOIN owners o ON p.owner_id = o.id
       LEFT JOIN users u ON mr.doctor_id = u.id
       WHERE mr.id = ?`
    )
    .get(id) as any;

  if (!record) {
    return res.status(404).json({ success: false, message: "就诊记录不存在" });
  }

  res.json({
    success: true,
    data: {
      id: record.id,
      petId: record.pet_id,
      petName: record.pet_name,
      petSpecies: record.pet_species,
      petBreed: record.pet_breed,
      ownerName: record.owner_name,
      ownerPhone: record.owner_phone,
      doctorId: record.doctor_id,
      doctorName: record.doctor_name,
      visitDate: record.visit_date,
      chiefComplaint: record.chief_complaint,
      examination: record.examination,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      weight: record.weight,
      temperature: record.temperature,
      status: record.status,
    },
  });
});

router.post("/", (req, res) => {
  const { petId, doctorId, chiefComplaint, examination, diagnosis, treatment, weight, temperature, status } = req.body;

  const visitDate = new Date().toISOString().replace("T", " ").substring(0, 19);

  const result = db
    .prepare(
      `INSERT INTO medical_records (pet_id, doctor_id, visit_date, chief_complaint, examination, diagnosis, treatment, weight, temperature, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      petId,
      doctorId || null,
      visitDate,
      chiefComplaint || "",
      examination || "",
      diagnosis || "",
      treatment || "",
      weight || null,
      temperature || null,
      status || "in-progress"
    );

  const record = db
    .prepare(
      `SELECT mr.*, p.name as pet_name, o.name as owner_name, u.name as doctor_name
       FROM medical_records mr
       LEFT JOIN pets p ON mr.pet_id = p.id
       LEFT JOIN owners o ON p.owner_id = o.id
       LEFT JOIN users u ON mr.doctor_id = u.id
       WHERE mr.id = ?`
    )
    .get(result.lastInsertRowid) as any;

  res.json({
    success: true,
    data: {
      id: record.id,
      petId: record.pet_id,
      petName: record.pet_name,
      ownerName: record.owner_name,
      doctorId: record.doctor_id,
      doctorName: record.doctor_name,
      visitDate: record.visit_date,
      chiefComplaint: record.chief_complaint,
      examination: record.examination,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      weight: record.weight,
      temperature: record.temperature,
      status: record.status,
      hasPrescription: false,
    },
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { chiefComplaint, examination, diagnosis, treatment, weight, temperature, status, doctorId } = req.body;

  db.prepare(
    `UPDATE medical_records 
     SET chief_complaint = ?, examination = ?, diagnosis = ?, treatment = ?, 
         weight = ?, temperature = ?, status = ?, doctor_id = ?
     WHERE id = ?`
  ).run(chiefComplaint, examination, diagnosis, treatment, weight, temperature, status, doctorId || null, id);

  const record = db
    .prepare(
      `SELECT mr.*, p.name as pet_name, o.name as owner_name, u.name as doctor_name,
              EXISTS(SELECT 1 FROM prescriptions WHERE medical_record_id = mr.id) as has_prescription
       FROM medical_records mr
       LEFT JOIN pets p ON mr.pet_id = p.id
       LEFT JOIN owners o ON p.owner_id = o.id
       LEFT JOIN users u ON mr.doctor_id = u.id
       WHERE mr.id = ?`
    )
    .get(id) as any;

  res.json({
    success: true,
    data: {
      id: record.id,
      petId: record.pet_id,
      petName: record.pet_name,
      ownerName: record.owner_name,
      doctorId: record.doctor_id,
      doctorName: record.doctor_name,
      visitDate: record.visit_date,
      chiefComplaint: record.chief_complaint,
      examination: record.examination,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      weight: record.weight,
      temperature: record.temperature,
      status: record.status,
      hasPrescription: !!record.has_prescription,
    },
  });
});

router.get("/:id/prescription", (req, res) => {
  const { id } = req.params;

  const prescription = db
    .prepare("SELECT * FROM prescriptions WHERE medical_record_id = ?")
    .get(id) as any;

  if (!prescription) {
    return res.json({ success: true, data: null });
  }

  const items = db
    .prepare(
      `SELECT pi.*, m.name as medicine_name, m.specification as specification
       FROM prescription_items pi
       LEFT JOIN medicines m ON pi.medicine_id = m.id
       WHERE pi.prescription_id = ?`
    )
    .all(prescription.id)
    .map((item: any) => ({
      id: item.id,
      prescriptionId: item.prescription_id,
      medicineId: item.medicine_id,
      medicineName: item.medicine_name,
      specification: item.specification,
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
