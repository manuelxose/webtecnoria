import { Router } from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";

const router = Router();

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  service1: z.string().optional(),
  service2: z.string().optional(),
  message: z.string().min(3),
});

router.post("/", async (req, res) => {
  const parsed = ContactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_INPUT", message: "Invalid payload" });
    return;
  }

  const body = parsed.data;
  const query = await pool.query(
    "INSERT INTO contact_messages (name, email, phone, company, service_1, service_2, message) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
    [body.name, body.email, body.phone ?? null, body.company ?? null, body.service1 ?? null, body.service2 ?? null, body.message]
  );

  res.status(201).json({ id: query.rows[0].id });
});

export default router;
