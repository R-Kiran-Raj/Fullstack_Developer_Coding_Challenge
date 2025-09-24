import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../db/memory.js';

const router = Router();

router.get('/', authenticate, (req: AuthenticatedRequest, res) => {
  const email = req.userEmail!;
  const profile = db.getUser(email) || { email, name: '' };
  res.json(profile);
});

const ProfileSchema = z.object({
  name: z.string().min(1).max(100).transform((v) => v.trim())
});

router.put('/', authenticate, (req: AuthenticatedRequest, res) => {
  const email = req.userEmail!;
  const parsed = ProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid profile' });
  }
  const updated = db.upsertUser({ email, name: parsed.data.name });
  res.json(updated);
});

export default router;
