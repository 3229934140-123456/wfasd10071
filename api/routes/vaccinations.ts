import { Router } from "express";
import db from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const { petId } = req.query;
  const today = new Date().toISOString().split("T")[0];

  let query = `
    SELECT v.*, p.name as pet_name, o.name as owner_name, o.phone as owner_phone
    FROM vaccinations v
    LEFT JOIN pets p ON v.pet_id = p.id
    LEFT JOIN owners o ON p.owner_id = o.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (petId) {
    query += " AND v.pet_id = ?";
    params.push(petId);
  }

  query += " ORDER BY v.vaccination_date DESC LIMIT 50";

  const vaccinations = db.prepare(query).all(...params).map((v: any) => {
    let status = "completed";
    if (v.next_due_date) {
      const nextDate = new Date(v.next_due_date);
      const todayDate = new Date(today);
      const diffDays = Math.ceil((nextDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) status = "overdue";
      else if (diffDays <= 30) status = "due";
      else status = "upcoming";
    }
    return {
      id: v.id,
      petId: v.pet_id,
      petName: v.pet_name,
      ownerName: v.owner_name,
      ownerPhone: v.owner_phone,
      vaccineName: v.vaccine_name,
      vaccinationDate: v.vaccination_date,
      nextDueDate: v.next_due_date,
      batchNumber: v.batch_number,
      manufacturer: v.manufacturer,
      status,
    };
  });

  res.json({ success: true, data: vaccinations });
});

router.get("/reminders", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const reminders = db
    .prepare(
      `SELECT v.*, p.name as pet_name, o.name as owner_name, o.phone as owner_phone
       FROM vaccinations v
       LEFT JOIN pets p ON v.pet_id = p.id
       LEFT JOIN owners o ON p.owner_id = o.id
       WHERE v.next_due_date IS NOT NULL 
         AND v.next_due_date <= ?
       ORDER BY v.next_due_date ASC`
    )
    .all(next30Days)
    .map((v: any) => {
      let status = "due";
      const nextDate = new Date(v.next_due_date);
      const todayDate = new Date(today);
      const diffDays = Math.ceil((nextDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) status = "overdue";
      else if (diffDays <= 7) status = "due";
      else status = "upcoming";

      return {
        id: v.id,
        petId: v.pet_id,
        petName: v.pet_name,
        ownerName: v.owner_name,
        ownerPhone: v.owner_phone,
        vaccineName: v.vaccine_name,
        nextDueDate: v.next_due_date,
        daysUntilDue: diffDays,
        status,
      };
    });

  res.json({ success: true, data: reminders });
});

router.post("/", (req, res) => {
  const { petId, vaccineName, vaccinationDate, nextDueDate, batchNumber, manufacturer } = req.body;

  const result = db
    .prepare(
      `INSERT INTO vaccinations (pet_id, vaccine_name, vaccination_date, next_due_date, batch_number, manufacturer)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(petId, vaccineName, vaccinationDate, nextDueDate || null, batchNumber || null, manufacturer || null);

  const vaccination = db.prepare("SELECT * FROM vaccinations WHERE id = ?").get(result.lastInsertRowid) as any;

  res.json({
    success: true,
    data: {
      id: vaccination.id,
      petId: vaccination.pet_id,
      vaccineName: vaccination.vaccine_name,
      vaccinationDate: vaccination.vaccination_date,
      nextDueDate: vaccination.next_due_date,
      batchNumber: vaccination.batch_number,
      manufacturer: vaccination.manufacturer,
      status: "upcoming",
    },
  });
});

export default router;
