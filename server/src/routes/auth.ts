import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();
const LoginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim())
});

router.post('/login', (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  const { email } = parsed.data;
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ sub: email }, secret, { expiresIn: '2h' });
  res.json({ token });
});

export default router;
