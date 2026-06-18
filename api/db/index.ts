import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, "..", "..", "database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "clinic.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'doctor', 'receptionist')),
      name TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS owners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      species TEXT NOT NULL CHECK(species IN ('dog', 'cat', 'other')),
      breed TEXT,
      gender TEXT CHECK(gender IN ('male', 'female')),
      birth_date DATE,
      weight REAL,
      neutered INTEGER DEFAULT 0,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vaccinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      vaccine_name TEXT NOT NULL,
      vaccination_date DATE NOT NULL,
      next_due_date DATE,
      batch_number TEXT,
      manufacturer TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      doctor_id INTEGER,
      visit_date DATETIME NOT NULL,
      chief_complaint TEXT,
      examination TEXT,
      diagnosis TEXT,
      treatment TEXT,
      weight REAL,
      temperature REAL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in-progress', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medical_record_id INTEGER NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specification TEXT,
      unit TEXT DEFAULT '盒',
      stock_quantity INTEGER DEFAULT 0,
      warning_threshold INTEGER DEFAULT 10,
      price REAL DEFAULT 0,
      manufacturer TEXT,
      category TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prescription_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescription_id INTEGER NOT NULL,
      medicine_id INTEGER NOT NULL,
      dosage REAL NOT NULL,
      frequency TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      instructions TEXT,
      FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id)
    );

    CREATE TABLE IF NOT EXISTS stock_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicine_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('in', 'out')),
      quantity INTEGER NOT NULL,
      batch_number TEXT,
      expiry_date DATE,
      supplier TEXT,
      operator_id INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS hospitalizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      admit_date DATETIME NOT NULL,
      discharge_date DATETIME,
      ward TEXT,
      diagnosis TEXT,
      status TEXT DEFAULT 'admitted' CHECK(status IN ('admitted', 'discharged')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospitalization_id INTEGER NOT NULL,
      record_date DATE NOT NULL,
      record_time TEXT,
      appetite TEXT CHECK(appetite IN ('good', 'normal', 'poor', 'none')),
      spirit TEXT CHECK(spirit IN ('good', 'normal', 'depressed')),
      temperature REAL,
      weight REAL,
      notes TEXT,
      notified_owner INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hospitalization_id) REFERENCES hospitalizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER,
      owner_id INTEGER,
      appointment_date DATETIME NOT NULL,
      type TEXT,
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL,
      FOREIGN KEY (owner_id) REFERENCES owners(id) ON DELETE SET NULL
    );
  `);

  seedData();
}

function seedData() {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count > 0) return;

  const insertUser = db.prepare(
    "INSERT INTO users (username, password_hash, role, name, phone) VALUES (?, ?, ?, ?, ?)"
  );
  insertUser.run("admin", "admin123", "admin", "张管理员", "13800138000");
  insertUser.run("doctor1", "doctor123", "doctor", "李医生", "13800138001");
  insertUser.run("doctor2", "doctor123", "doctor", "王医生", "13800138002");
  insertUser.run("reception", "reception123", "receptionist", "刘前台", "13800138003");

  const insertOwner = db.prepare(
    "INSERT INTO owners (name, phone, email) VALUES (?, ?, ?)"
  );
  const owner1 = insertOwner.run("陈小明", "13900139001", "chen@example.com").lastInsertRowid;
  const owner2 = insertOwner.run("林小红", "13900139002", "lin@example.com").lastInsertRowid;
  const owner3 = insertOwner.run("黄大伟", "13900139003", "huang@example.com").lastInsertRowid;
  const owner4 = insertOwner.run("周美丽", "13900139004", "zhou@example.com").lastInsertRowid;

  const insertPet = db.prepare(
    "INSERT INTO pets (owner_id, name, species, breed, gender, birth_date, weight, neutered) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const pet1 = insertPet.run(owner1, "豆豆", "dog", "金毛", "male", "2020-03-15", 28.5, 1).lastInsertRowid;
  const pet2 = insertPet.run(owner1, "咪咪", "cat", "英短蓝猫", "female", "2022-01-20", 4.2, 0).lastInsertRowid;
  const pet3 = insertPet.run(owner2, "旺财", "dog", "柴犬", "male", "2021-06-10", 12.3, 1).lastInsertRowid;
  const pet4 = insertPet.run(owner3, "小白", "cat", "布偶", "female", "2023-02-14", 3.8, 0).lastInsertRowid;
  const pet5 = insertPet.run(owner4, "黑豆", "dog", "拉布拉多", "male", "2019-08-01", 32.0, 1).lastInsertRowid;

  const insertVaccine = db.prepare(
    "INSERT INTO vaccinations (pet_id, vaccine_name, vaccination_date, next_due_date, manufacturer) VALUES (?, ?, ?, ?, ?)"
  );
  insertVaccine.run(pet1, "犬四联疫苗", "2025-01-15", "2026-01-15", "辉瑞");
  insertVaccine.run(pet1, "狂犬疫苗", "2025-01-15", "2026-01-15", "默沙东");
  insertVaccine.run(pet2, "猫三联疫苗", "2025-02-20", "2026-02-20", "英特威");
  insertVaccine.run(pet3, "犬四联疫苗", "2025-03-10", "2026-03-10", "辉瑞");
  insertVaccine.run(pet4, "猫三联疫苗", "2025-04-01", "2026-04-01", "英特威");
  insertVaccine.run(pet5, "犬六联疫苗", "2025-02-01", "2026-02-01", "梅里亚");

  const insertMedical = db.prepare(
    "INSERT INTO medical_records (pet_id, doctor_id, visit_date, chief_complaint, examination, diagnosis, treatment, weight, temperature, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const mr1 = insertMedical.run(
    pet1,
    2,
    "2025-06-10 09:30:00",
    "食欲下降，呕吐2次",
    "体温39.2°C，精神萎靡，腹部触诊敏感",
    "急性肠胃炎",
    "止吐+益生菌调理，禁食24小时",
    27.8,
    39.2,
    "completed"
  ).lastInsertRowid;
  const mr2 = insertMedical.run(
    pet2,
    3,
    "2025-06-12 14:00:00",
    "频繁抓耳朵，有异味",
    "外耳道分泌物增多，镜检见大量耳螨",
    "耳螨感染",
    "耳漂清洗+耳肤灵，每日2次",
    4.0,
    38.5,
    "completed"
  ).lastInsertRowid;
  const mr3 = insertMedical.run(
    pet3,
    2,
    "2025-06-15 10:15:00",
    "年度体检",
    "血常规正常，生化指标正常，心音正常",
    "健康体检",
    "建议每年体检1次，按时驱虫",
    12.5,
    38.7,
    "completed"
  ).lastInsertRowid;
  const mr4 = insertMedical.run(
    pet5,
    2,
    "2025-06-16 11:00:00",
    "后腿跛行，不愿活动",
    "右后腿不敢负重，触诊髋关节疼痛",
    "髋关节发育不良",
    "关节康+止痛药，控制体重，限制运动",
    33.5,
    38.9,
    "completed"
  ).lastInsertRowid;
  insertMedical.run(
    pet4,
    3,
    "2025-06-18 09:00:00",
    "打喷嚏，流清鼻涕",
    "体温38.8°C，精神尚可，食欲正常",
    "上呼吸道感染",
    "观察，多饮水，必要时抗病毒治疗",
    3.9,
    38.8,
    "in-progress"
  ).lastInsertRowid;

  const insertMedicine = db.prepare(
    "INSERT INTO medicines (name, specification, unit, stock_quantity, warning_threshold, price, manufacturer, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  const m1 = insertMedicine.run("阿莫西林克拉维酸钾", "0.5g*6片", "盒", 45, 20, 68.00, "硕腾", "抗生素").lastInsertRowid;
  const m2 = insertMedicine.run("头孢氨苄片", "250mg*10片", "盒", 32, 15, 45.00, "礼来", "抗生素").lastInsertRowid;
  const m3 = insertMedicine.run("益生菌粉剂", "5g*10袋", "盒", 28, 10, 56.00, "麦德氏", "消化道").lastInsertRowid;
  const m4 = insertMedicine.run("耳肤灵", "10g", "支", 15, 5, 85.00, "威隆", "外用药").lastInsertRowid;
  const m5 = insertMedicine.run("耳漂", "60ml", "瓶", 12, 5, 78.00, "维克", "外用药").lastInsertRowid;
  const m6 = insertMedicine.run("大宠爱驱虫药", "0.75ml", "支", 8, 10, 120.00, "硕腾", "驱虫药").lastInsertRowid;
  const m7 = insertMedicine.run("福来恩滴剂", "0.67ml", "支", 5, 10, 95.00, "梅里亚", "驱虫药").lastInsertRowid;
  const m8 = insertMedicine.run("关节康片", "500mg*60片", "瓶", 20, 10, 168.00, "麦德氏", "关节用药").lastInsertRowid;
  const m9 = insertMedicine.run("美洛昔康片", "7.5mg*10片", "盒", 18, 8, 58.00, "勃林格", "止痛药").lastInsertRowid;
  const m10 = insertMedicine.run("拜宠清驱虫药", "2片装", "盒", 6, 10, 48.00, "拜耳", "驱虫药").lastInsertRowid;

  const insertPrescription = db.prepare(
    "INSERT INTO prescriptions (medical_record_id, notes) VALUES (?, ?)"
  );
  const p1 = insertPrescription.run(mr1, "饭后服用，多饮水").lastInsertRowid;
  const p2 = insertPrescription.run(mr2, "使用前先清洁耳道").lastInsertRowid;
  const p4 = insertPrescription.run(mr4, "配合减肥，控制体重").lastInsertRowid;

  const insertPresItem = db.prepare(
    "INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration_days, instructions) VALUES (?, ?, ?, ?, ?, ?)"
  );
  insertPresItem.run(p1, m1, 1, "每日2次", 7, "每次1片，饭后服用");
  insertPresItem.run(p1, m3, 1, "每日1次", 14, "每次1袋，温水冲服");
  insertPresItem.run(p2, m5, 2, "每日2次", 7, "每次2-3滴，清洗耳道");
  insertPresItem.run(p2, m4, 0.5, "每日2次", 14, "每次约0.5g，涂入耳道");
  insertPresItem.run(p4, m8, 2, "每日2次", 30, "每次2片，饭后服用");
  insertPresItem.run(p4, m9, 0.5, "每日1次", 7, "每次半片，止痛用");

  const insertStockIn = db.prepare(
    "INSERT INTO stock_records (medicine_id, type, quantity, batch_number, expiry_date, supplier) VALUES (?, 'in', ?, ?, ?, ?)"
  );
  insertStockIn.run(m1, 50, "AMX202501", "2027-01-01", "硕腾总代理");
  insertStockIn.run(m2, 30, "CFB202502", "2026-12-01", "礼来药业");
  insertStockIn.run(m6, 10, "DCA202503", "2026-06-01", "硕腾总代理");
  insertStockIn.run(m7, 8, "FLN202501", "2026-03-01", "梅里亚");
  insertStockIn.run(m10, 6, "BPC202502", "2026-08-01", "拜耳");

  const insertHospital = db.prepare(
    "INSERT INTO hospitalizations (pet_id, admit_date, ward, diagnosis, status, notes) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const h1 = insertHospital.run(
    pet1,
    "2025-06-16 10:00:00",
    "1号病房",
    "急性肠胃炎，需要输液治疗",
    "admitted",
    "观察2-3天，输液治疗"
  ).lastInsertRowid;

  const insertDaily = db.prepare(
    "INSERT INTO daily_records (hospitalization_id, record_date, record_time, appetite, spirit, temperature, notes, notified_owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  insertDaily.run(h1, "2025-06-16", "12:00", "poor", "depressed", 39.1, "入院后输液，精神较差", 1);
  insertDaily.run(h1, "2025-06-16", "18:00", "poor", "normal", 38.8, "下午略有好转", 1);
  insertDaily.run(h1, "2025-06-17", "08:00", "normal", "normal", 38.6, "夜间平稳，早晨有食欲", 1);
  insertDaily.run(h1, "2025-06-17", "18:00", "good", "good", 38.5, "下午进食良好", 0);
  insertDaily.run(h1, "2025-06-18", "09:00", "good", "good", 38.4, "今日情况稳定，观察中", 0);
}

export default db;
