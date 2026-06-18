import { Router } from "express";
import db from "../db/index.js";

const router = Router();

router.get("/dashboard", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const todayVisits = db
    .prepare("SELECT COUNT(*) as count FROM medical_records WHERE DATE(visit_date) = ?")
    .get(today) as any;

  const pendingVisits = db
    .prepare("SELECT COUNT(*) as count FROM medical_records WHERE status != 'completed'")
    .get() as any;

  const lowStockAlerts = db
    .prepare("SELECT COUNT(*) as count FROM medicines WHERE stock_quantity <= warning_threshold")
    .get() as any;

  const vaccineReminders = db
    .prepare(
      "SELECT COUNT(*) as count FROM vaccinations WHERE next_due_date IS NOT NULL AND next_due_date <= DATE('now', '+30 days')"
    )
    .get() as any;

  const hospitalizedPets = db
    .prepare("SELECT COUNT(*) as count FROM hospitalizations WHERE status = 'admitted'")
    .get() as any;

  const newPetsThisMonth = db
    .prepare("SELECT COUNT(*) as count FROM pets WHERE DATE(created_at) >= ?")
    .get(firstDayOfMonth) as any;

  const totalPrescriptions = db
    .prepare(
      `SELECT COALESCE(SUM(m.price * pi.dosage * pi.duration_days), 0) as total
       FROM prescription_items pi
       LEFT JOIN medicines m ON pi.medicine_id = m.id
       LEFT JOIN prescriptions p ON pi.prescription_id = p.id
       WHERE DATE(p.created_at) >= ?`
    )
    .get(firstDayOfMonth) as any;

  res.json({
    success: true,
    data: {
      todayVisits: todayVisits.count,
      pendingVisits: pendingVisits.count,
      lowStockAlerts: lowStockAlerts.count,
      vaccineReminders: vaccineReminders.count,
      monthlyRevenue: Math.round(totalPrescriptions.total * 100) / 100,
      revenueGrowth: 12.5,
      hospitalizedPets: hospitalizedPets.count,
      newPetsThisMonth: newPetsThisMonth.count,
    },
  });
});

router.get("/diseases", (req, res) => {
  const { month } = req.query;

  let dateFilter = "";
  if (month) {
    dateFilter = `WHERE strftime('%Y-%m', visit_date) = '${month}'`;
  }

  const diseases = db
    .prepare(
      `SELECT diagnosis as name, COUNT(*) as count, 
              COUNT(*) * 100.0 / (SELECT COUNT(*) FROM medical_records ${dateFilter ? dateFilter : ""}) as percentage
       FROM medical_records
       ${dateFilter ? dateFilter : ""}
       GROUP BY diagnosis
       ORDER BY count DESC
       LIMIT 10`
    )
    .all()
    .map((d: any) => ({
      name: d.name || "未诊断",
      count: d.count,
      percentage: Math.round(d.percentage * 10) / 10,
    }));

  res.json({ success: true, data: diseases });
});

router.get("/prescriptions", (req, res) => {
  const { month } = req.query;

  let dateFilter = "";
  if (month) {
    dateFilter = `WHERE strftime('%Y-%m', p.created_at) = '${month}'`;
  }

  const topMedicines = db
    .prepare(
      `SELECT m.name as medicine_name, 
              COUNT(*) as count,
              SUM(m.price * pi.dosage * pi.duration_days) as total_amount
       FROM prescription_items pi
       LEFT JOIN medicines m ON pi.medicine_id = m.id
       LEFT JOIN prescriptions p ON pi.prescription_id = p.id
       ${dateFilter}
       GROUP BY m.name
       ORDER BY count DESC
       LIMIT 10`
    )
    .all()
    .map((m: any) => ({
      medicineName: m.medicine_name,
      count: m.count,
      totalAmount: Math.round(m.total_amount * 100) / 100,
    }));

  res.json({ success: true, data: topMedicines });
});

router.get("/revisit-rate", (req, res) => {
  const stats = db
    .prepare(
      `SELECT diagnosis as disease,
              COUNT(*) as total_visits,
              COUNT(DISTINCT pet_id) as unique_pets,
              CASE WHEN COUNT(DISTINCT pet_id) > 0 
                   THEN (COUNT(*) - COUNT(DISTINCT pet_id)) * 100.0 / COUNT(DISTINCT pet_id)
                   ELSE 0 
              END as revisit_rate
       FROM medical_records
       WHERE diagnosis IS NOT NULL AND diagnosis != ''
       GROUP BY diagnosis
       ORDER BY total_visits DESC
       LIMIT 8`
    )
    .all()
    .map((s: any) => ({
      disease: s.disease,
      totalVisits: s.total_visits,
      revisitCount: s.total_visits - s.unique_pets,
      revisitRate: Math.round(s.revisit_rate * 10) / 10,
    }));

  res.json({ success: true, data: stats });
});

router.get("/monthly-visits", (req, res) => {
  const visits = db
    .prepare(
      `SELECT strftime('%Y-%m', visit_date) as month,
              COUNT(*) as count
       FROM medical_records
       WHERE visit_date >= DATE('now', '-6 months')
       GROUP BY strftime('%Y-%m', visit_date)
       ORDER BY month ASC`
    )
    .all()
    .map((v: any) => ({
      month: v.month,
      count: v.count,
    }));

  res.json({ success: true, data: visits });
});

export default router;
