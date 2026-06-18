import { Router } from "express";
import db from "../db/index.js";

const router = Router();

function calcStatus(nextDueDate: string | null, today: string) {
  if (!nextDueDate) return "completed";
  const nextDate = new Date(nextDueDate);
  const todayDate = new Date(today);
  const diffDays = Math.ceil((nextDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "overdue";
  if (diffDays <= 30) return "due";
  return "upcoming";
}

router.get("/", (req, res) => {
  const { petId, type, status } = req.query;
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

  if (type) {
    query += " AND v.type = ?";
    params.push(type);
  }

  query += " ORDER BY v.vaccination_date DESC LIMIT 100";

  let vaccinations = db.prepare(query).all(...params).map((v: any) => ({
    id: v.id,
    petId: v.pet_id,
    type: v.type || "vaccine",
    petName: v.pet_name,
    ownerName: v.owner_name,
    ownerPhone: v.owner_phone,
    vaccineName: v.vaccine_name,
    vaccinationDate: v.vaccination_date,
    nextDueDate: v.next_due_date,
    batchNumber: v.batch_number,
    manufacturer: v.manufacturer,
    status: calcStatus(v.next_due_date, today),
  }));

  if (status && status !== "all") {
    vaccinations = vaccinations.filter((v: any) => v.status === status);
  }

  res.json({ success: true, data: vaccinations });
});

router.get("/reminders", (req, res) => {
  const { type, status } = req.query;
  const today = new Date().toISOString().split("T")[0];
  const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  let query = `
    SELECT v.*, p.name as pet_name, o.name as owner_name, o.phone as owner_phone
    FROM vaccinations v
    LEFT JOIN pets p ON v.pet_id = p.id
    LEFT JOIN owners o ON p.owner_id = o.id
    WHERE v.next_due_date IS NOT NULL
      AND v.next_due_date <= ?
  `;
  const params: any[] = [next30Days];

  if (type && type !== "all") {
    query += " AND v.type = ?";
    params.push(type);
  }

  query += " ORDER BY v.next_due_date ASC";

  let reminders = db
    .prepare(query)
    .all(...params)
    .map((v: any) => {
      const nextDate = new Date(v.next_due_date);
      const todayDate = new Date(today);
      const diffDays = Math.ceil((nextDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      let calcSt = "due";
      if (diffDays < 0) calcSt = "overdue";
      else if (diffDays <= 7) calcSt = "due";
      else calcSt = "upcoming";

      return {
        id: v.id,
        petId: v.pet_id,
        type: v.type || "vaccine",
        petName: v.pet_name,
        ownerName: v.owner_name,
        ownerPhone: v.owner_phone,
        vaccineName: v.vaccine_name,
        vaccinationDate: v.vaccination_date,
        nextDueDate: v.next_due_date,
        daysUntilDue: diffDays,
        status: calcSt,
      };
    });

  if (status && status !== "all") {
    reminders = reminders.filter((r: any) => r.status === status);
  }

  res.json({ success: true, data: reminders });
});

router.post("/", (req, res) => {
  const { petId, type, vaccineName, vaccinationDate, nextDueDate, batchNumber, manufacturer } = req.body;
  const today = new Date().toISOString().split("T")[0];

  const result = db
    .prepare(
      `INSERT INTO vaccinations (pet_id, type, vaccine_name, vaccination_date, next_due_date, batch_number, manufacturer)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(petId, type || "vaccine", vaccineName, vaccinationDate, nextDueDate || null, batchNumber || null, manufacturer || null);

  const vaccination = db.prepare("SELECT * FROM vaccinations WHERE id = ?").get(result.lastInsertRowid) as any;

  res.json({
    success: true,
    data: {
      id: vaccination.id,
      petId: vaccination.pet_id,
      type: vaccination.type || "vaccine",
      vaccineName: vaccination.vaccine_name,
      vaccinationDate: vaccination.vaccination_date,
      nextDueDate: vaccination.next_due_date,
      batchNumber: vaccination.batch_number,
      manufacturer: vaccination.manufacturer,
      status: calcStatus(vaccination.next_due_date, today),
    },
  });
});

export default router;
