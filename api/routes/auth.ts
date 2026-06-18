import { Router } from "express";
import db from "../db/index.js";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = db
    .prepare("SELECT id, username, role, name, phone FROM users WHERE username = ? AND password_hash = ?")
    .get(username, password) as any;

  if (!user) {
    return res.json({ success: false, message: "用户名或密码错误" });
  }

  const token = "mock-jwt-token-" + user.id + "-" + Date.now();

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      phone: user.phone,
    },
  });
});

router.post("/owner-login", (req, res) => {
  const { phone } = req.body;

  const owner = db
    .prepare("SELECT id, name, phone, email FROM owners WHERE phone = ?")
    .get(phone) as any;

  if (!owner) {
    return res.json({ success: false, message: "未找到该手机号对应的主人信息" });
  }

  const token = "mock-owner-token-" + owner.id + "-" + Date.now();

  res.json({
    success: true,
    token,
    owner: {
      id: owner.id,
      name: owner.name,
      phone: owner.phone,
      email: owner.email,
    },
  });
});

export default router;
