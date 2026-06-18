import { Router } from "express";
import db from "../db/index.js";

const router = Router();

router.get("/", (req, res) => {
  const { search, category, lowStock } = req.query;

  let query = "SELECT * FROM medicines WHERE 1=1";
  const params: any[] = [];

  if (search) {
    query += " AND (name LIKE ? OR manufacturer LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (lowStock === "true") {
    query += " AND stock_quantity <= warning_threshold";
  }

  query += " ORDER BY name ASC";

  const medicines = db.prepare(query).all(...params).map((m: any) => ({
    id: m.id,
    name: m.name,
    specification: m.specification,
    unit: m.unit,
    stockQuantity: m.stock_quantity,
    warningThreshold: m.warning_threshold,
    price: m.price,
    manufacturer: m.manufacturer,
    category: m.category,
    description: m.description,
  }));

  res.json({ success: true, data: medicines });
});

router.get("/low-stock", (req, res) => {
  const medicines = db
    .prepare("SELECT * FROM medicines WHERE stock_quantity <= warning_threshold ORDER BY stock_quantity ASC")
    .all()
    .map((m: any) => ({
      id: m.id,
      name: m.name,
      specification: m.specification,
      unit: m.unit,
      stockQuantity: m.stock_quantity,
      warningThreshold: m.warning_threshold,
      price: m.price,
      manufacturer: m.manufacturer,
      category: m.category,
    }));

  res.json({ success: true, data: medicines });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const medicine = db.prepare("SELECT * FROM medicines WHERE id = ?").get(id) as any;

  if (!medicine) {
    return res.status(404).json({ success: false, message: "药品不存在" });
  }

  res.json({
    success: true,
    data: {
      id: medicine.id,
      name: medicine.name,
      specification: medicine.specification,
      unit: medicine.unit,
      stockQuantity: medicine.stock_quantity,
      warningThreshold: medicine.warning_threshold,
      price: medicine.price,
      manufacturer: medicine.manufacturer,
      category: medicine.category,
      description: medicine.description,
    },
  });
});

router.post("/", (req, res) => {
  const { name, specification, unit, stockQuantity, warningThreshold, price, manufacturer, category, description } =
    req.body;

  const result = db
    .prepare(
      `INSERT INTO medicines (name, specification, unit, stock_quantity, warning_threshold, price, manufacturer, category, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      name,
      specification || "",
      unit || "盒",
      stockQuantity || 0,
      warningThreshold || 10,
      price || 0,
      manufacturer || "",
      category || "",
      description || ""
    );

  const medicine = db.prepare("SELECT * FROM medicines WHERE id = ?").get(result.lastInsertRowid) as any;

  if (stockQuantity > 0) {
    db.prepare(
      "INSERT INTO stock_records (medicine_id, type, quantity, notes) VALUES (?, 'in', ?, '初始库存')"
    ).run(medicine.id, stockQuantity);
  }

  res.json({
    success: true,
    data: {
      id: medicine.id,
      name: medicine.name,
      specification: medicine.specification,
      unit: medicine.unit,
      stockQuantity: medicine.stock_quantity,
      warningThreshold: medicine.warning_threshold,
      price: medicine.price,
      manufacturer: medicine.manufacturer,
      category: medicine.category,
    },
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, specification, unit, warningThreshold, price, manufacturer, category, description } = req.body;

  db.prepare(
    `UPDATE medicines SET name = ?, specification = ?, unit = ?, warning_threshold = ?, price = ?, manufacturer = ?, category = ?, description = ?
     WHERE id = ?`
  ).run(name, specification, unit, warningThreshold, price, manufacturer, category, description, id);

  const medicine = db.prepare("SELECT * FROM medicines WHERE id = ?").get(id) as any;

  res.json({
    success: true,
    data: {
      id: medicine.id,
      name: medicine.name,
      specification: medicine.specification,
      unit: medicine.unit,
      stockQuantity: medicine.stock_quantity,
      warningThreshold: medicine.warning_threshold,
      price: medicine.price,
      manufacturer: medicine.manufacturer,
      category: medicine.category,
    },
  });
});

router.post("/:id/stock-in", (req, res) => {
  const { id } = req.params;
  const { quantity, batchNumber, expiryDate, supplier } = req.body;

  const medicine = db.prepare("SELECT * FROM medicines WHERE id = ?").get(id);
  if (!medicine) {
    return res.status(404).json({ success: false, message: "药品不存在" });
  }

  db.prepare("UPDATE medicines SET stock_quantity = stock_quantity + ? WHERE id = ?").run(quantity, id);

  db.prepare(
    `INSERT INTO stock_records (medicine_id, type, quantity, batch_number, expiry_date, supplier)
     VALUES (?, 'in', ?, ?, ?, ?)`
  ).run(id, quantity, batchNumber || null, expiryDate || null, supplier || null);

  const updatedMedicine = db.prepare("SELECT * FROM medicines WHERE id = ?").get(id) as any;

  res.json({
    success: true,
    data: {
      id: updatedMedicine.id,
      name: updatedMedicine.name,
      stockQuantity: updatedMedicine.stock_quantity,
    },
  });
});

router.get("/:id/stock-records", (req, res) => {
  const { id } = req.params;

  const records = db
    .prepare("SELECT * FROM stock_records WHERE medicine_id = ? ORDER BY created_at DESC LIMIT 20")
    .all(id)
    .map((r: any) => ({
      id: r.id,
      medicineId: r.medicine_id,
      type: r.type,
      quantity: r.quantity,
      batchNumber: r.batch_number,
      expiryDate: r.expiry_date,
      supplier: r.supplier,
      createdAt: r.created_at,
      notes: r.notes,
    }));

  res.json({ success: true, data: records });
});

export default router;
