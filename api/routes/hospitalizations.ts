import { Router } from "express";
import db from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT h.*, p.name as pet_name, p.species as pet_species, 
           o.name as owner_name, o.phone as owner_phone,
           (SELECT COUNT(*) FROM daily_records WHERE hospitalization_id = h.id) as record_count
    FROM hospitalizations h
    LEFT JOIN pets p ON h.pet_id = p.id
    LEFT JOIN owners o ON p.owner_id = o.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status) {
    query += " AND h.status = ?";
    params.push(status);
  }

  query += " ORDER BY h.admit_date DESC";

  const hospitalizations = db.prepare(query).all(...params).map((h: any) => ({
    id: h.id,
    petId: h.pet_id,
    petName: h.pet_name,
    petSpecies: h.pet_species,
    ownerName: h.owner_name,
    ownerPhone: h.owner_phone,
    admitDate: h.admit_date,
    dischargeDate: h.discharge_date,
    ward: h.ward,
    diagnosis: h.diagnosis,
    status: h.status,
    notes: h.notes,
    recordCount: h.record_count,
  }));

  res.json({ success: true, data: hospitalizations });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const hospitalization = db
    .prepare(
      `SELECT h.*, p.name as pet_name, p.species as pet_species, p.breed as pet_breed,
              o.name as owner_name, o.phone as owner_phone
       FROM hospitalizations h
       LEFT JOIN pets p ON h.pet_id = p.id
       LEFT JOIN owners o ON p.owner_id = o.id
       WHERE h.id = ?`
    )
    .get(id) as any;

  if (!hospitalization) {
    return res.status(404).json({ success: false, message: "住院记录不存在" });
  }

  const dailyRecords = db
    .prepare("SELECT * FROM daily_records WHERE hospitalization_id = ? ORDER BY record_date DESC, record_time DESC")
    .all(id)
    .map((r: any) => ({
      id: r.id,
      hospitalizationId: r.hospitalization_id,
      recordDate: r.record_date,
      recordTime: r.record_time,
      appetite: r.appetite,
      spirit: r.spirit,
      temperature: r.temperature,
      weight: r.weight,
      notes: r.notes,
      notifiedOwner: !!r.notified_owner,
    }));

  res.json({
    success: true,
    data: {
      id: hospitalization.id,
      petId: hospitalization.pet_id,
      petName: hospitalization.pet_name,
      petSpecies: hospitalization.pet_species,
      petBreed: hospitalization.pet_breed,
      ownerName: hospitalization.owner_name,
      ownerPhone: hospitalization.owner_phone,
      admitDate: hospitalization.admit_date,
      dischargeDate: hospitalization.discharge_date,
      ward: hospitalization.ward,
      diagnosis: hospitalization.diagnosis,
      status: hospitalization.status,
      notes: hospitalization.notes,
      dailyRecords,
    },
  });
});

router.post("/", (req, res) => {
  const { petId, ward, diagnosis, notes } = req.body;

  const admitDate = new Date().toISOString().replace("T", " ").substring(0, 19);

  const result = db
    .prepare(
      `INSERT INTO hospitalizations (pet_id, admit_date, ward, diagnosis, status, notes)
       VALUES (?, ?, ?, ?, 'admitted', ?)`
    )
    .run(petId, admitDate, ward || "", diagnosis || "", notes || "");

  const hospitalization = db
    .prepare(
      `SELECT h.*, p.name as pet_name, o.name as owner_name, o.phone as owner_phone
       FROM hospitalizations h
       LEFT JOIN pets p ON h.pet_id = p.id
       LEFT JOIN owners o ON p.owner_id = o.id
       WHERE h.id = ?`
    )
    .get(result.lastInsertRowid) as any;

  res.json({
    success: true,
    data: {
      id: hospitalization.id,
      petId: hospitalization.pet_id,
      petName: hospitalization.pet_name,
      ownerName: hospitalization.owner_name,
      ownerPhone: hospitalization.owner_phone,
      admitDate: hospitalization.admit_date,
      ward: hospitalization.ward,
      diagnosis: hospitalization.diagnosis,
      status: hospitalization.status,
    },
  });
});

router.post("/:id/daily-records", (req, res) => {
  const { id } = req.params;
  const { recordDate, recordTime, appetite, spirit, temperature, weight, notes, notifiedOwner } = req.body;

  const result = db
    .prepare(
      `INSERT INTO daily_records (hospitalization_id, record_date, record_time, appetite, spirit, temperature, weight, notes, notified_owner)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      recordDate || new Date().toISOString().split("T")[0],
      recordTime || null,
      appetite,
      spirit,
      temperature || null,
      weight || null,
      notes || "",
      notifiedOwner ? 1 : 0
    );

  const dailyRecord = db.prepare("SELECT * FROM daily_records WHERE id = ?").get(result.lastInsertRowid) as any;

  res.json({
    success: true,
    data: {
      id: dailyRecord.id,
      hospitalizationId: dailyRecord.hospitalization_id,
      recordDate: dailyRecord.record_date,
      recordTime: dailyRecord.record_time,
      appetite: dailyRecord.appetite,
      spirit: dailyRecord.spirit,
      temperature: dailyRecord.temperature,
      weight: dailyRecord.weight,
      notes: dailyRecord.notes,
      notifiedOwner: !!dailyRecord.notified_owner,
    },
  });
});

router.put("/:id/discharge", (req, res) => {
  const { id } = req.params;

  const dischargeDate = new Date().toISOString().replace("T", " ").substring(0, 19);

  db.prepare("UPDATE hospitalizations SET status = 'discharged', discharge_date = ? WHERE id = ?").run(dischargeDate, id);

  const hospitalization = db.prepare("SELECT * FROM hospitalizations WHERE id = ?").get(id) as any;

  res.json({
    success: true,
    data: {
      id: hospitalization.id,
      status: hospitalization.status,
      dischargeDate: hospitalization.discharge_date,
    },
  });
});

export default router;
