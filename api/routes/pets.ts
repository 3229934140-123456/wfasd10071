import { Router } from "express";
import db from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const { search, species } = req.query;

  let query = `
    SELECT p.*, o.name as owner_name, o.phone as owner_phone,
           (SELECT MAX(visit_date) FROM medical_records WHERE pet_id = p.id) as last_visit_date
    FROM pets p
    LEFT JOIN owners o ON p.owner_id = o.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    query += " AND (p.name LIKE ? OR o.name LIKE ? OR o.phone LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (species) {
    query += " AND p.species = ?";
    params.push(species);
  }

  query += " ORDER BY p.created_at DESC LIMIT 50";

  const pets = db.prepare(query).all(...params).map((pet: any) => ({
    id: pet.id,
    ownerId: pet.owner_id,
    ownerName: pet.owner_name,
    ownerPhone: pet.owner_phone,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    birthDate: pet.birth_date,
    weight: pet.weight,
    neutered: !!pet.neutered,
    avatar: pet.avatar,
    createdAt: pet.created_at,
    lastVisitDate: pet.last_visit_date,
  }));

  res.json({ success: true, data: pets });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const pet = db
    .prepare(
      `SELECT p.*, o.name as owner_name, o.phone as owner_phone, o.email as owner_email
       FROM pets p
       LEFT JOIN owners o ON p.owner_id = o.id
       WHERE p.id = ?`
    )
    .get(id) as any;

  if (!pet) {
    return res.status(404).json({ success: false, message: "宠物不存在" });
  }

  res.json({
    success: true,
    data: {
      id: pet.id,
      ownerId: pet.owner_id,
      ownerName: pet.owner_name,
      ownerPhone: pet.owner_phone,
      ownerEmail: pet.owner_email,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      birthDate: pet.birth_date,
      weight: pet.weight,
      neutered: !!pet.neutered,
      avatar: pet.avatar,
      createdAt: pet.created_at,
    },
  });
});

router.post("/", (req, res) => {
  const { ownerName, ownerPhone, name, species, breed, gender, birthDate, weight, neutered, vaccinations } = req.body;

  let owner = db.prepare("SELECT id FROM owners WHERE phone = ?").get(ownerPhone) as any;

  if (!owner) {
    const result = db.prepare("INSERT INTO owners (name, phone) VALUES (?, ?)").run(ownerName, ownerPhone);
    owner = { id: result.lastInsertRowid };
  }

  const result = db
    .prepare(
      `INSERT INTO pets (owner_id, name, species, breed, gender, birth_date, weight, neutered)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(owner.id, name, species, breed, gender, birthDate, weight, neutered ? 1 : 0);

  const petId = result.lastInsertRowid as number;

  if (Array.isArray(vaccinations) && vaccinations.length > 0) {
    const insertVac = db.prepare(
      `INSERT INTO vaccinations (pet_id, type, vaccine_name, vaccination_date, next_due_date, manufacturer)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const insertAll = db.transaction((records: any[]) => {
      for (const v of records) {
        if (v.vaccineName && v.vaccinationDate) {
          insertVac.run(
            petId,
            v.type || "vaccine",
            v.vaccineName,
            v.vaccinationDate,
            v.nextDueDate || null,
            v.manufacturer || null
          );
        }
      }
    });
    insertAll(vaccinations);
  }

  const pet = db
    .prepare(
      `SELECT p.*, o.name as owner_name, o.phone as owner_phone
       FROM pets p
       LEFT JOIN owners o ON p.owner_id = o.id
       WHERE p.id = ?`
    )
    .get(petId) as any;

  res.json({
    success: true,
    data: {
      id: pet.id,
      ownerId: pet.owner_id,
      ownerName: pet.owner_name,
      ownerPhone: pet.owner_phone,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      birthDate: pet.birth_date,
      weight: pet.weight,
      neutered: !!pet.neutered,
      createdAt: pet.created_at,
    },
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, species, breed, gender, birthDate, weight, neutered } = req.body;

  db.prepare(
    `UPDATE pets SET name = ?, species = ?, breed = ?, gender = ?, birth_date = ?, weight = ?, neutered = ?
     WHERE id = ?`
  ).run(name, species, breed, gender, birthDate, weight, neutered ? 1 : 0, id);

  const pet = db.prepare("SELECT * FROM pets WHERE id = ?").get(id) as any;

  res.json({
    success: true,
    data: {
      id: pet.id,
      ownerId: pet.owner_id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      gender: pet.gender,
      birthDate: pet.birth_date,
      weight: pet.weight,
      neutered: !!pet.neutered,
      createdAt: pet.created_at,
    },
  });
});

router.get("/:id/medical-records", (req, res) => {
  const { id } = req.params;

  const records = db
    .prepare(
      `SELECT mr.*, u.name as doctor_name
       FROM medical_records mr
       LEFT JOIN users u ON mr.doctor_id = u.id
       WHERE mr.pet_id = ?
       ORDER BY mr.visit_date DESC`
    )
    .all(id)
    .map((record: any) => ({
      id: record.id,
      petId: record.pet_id,
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
    }));

  res.json({ success: true, data: records });
});

router.get("/:id/vaccinations", (req, res) => {
  const { id } = req.params;
  const today = new Date().toISOString().split("T")[0];

  const vaccinations = db
    .prepare("SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY vaccination_date DESC")
    .all(id)
    .map((v: any) => {
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
        type: v.type || "vaccine",
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

export default router;
