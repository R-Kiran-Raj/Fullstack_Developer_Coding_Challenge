import { Router } from 'express';
import { z } from 'zod';
import { InMemoryCache } from '../utils/cache.js';
import { fetch } from 'undici';

const router = Router();
const cache = new InMemoryCache<any[]>(60_000); // 1 minute cache

const QuerySchema = z.object({
  username: z.string().min(1).max(100).transform((v) => v.trim())
});

router.get('/repos', async (req, res) => {
  const parsed = QuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid username' });
  }
  const { username } = parsed.data as any;
  const cacheKey = `repos:${username}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ cached: true, repos: cached });
  }
  try {
    const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos`, {
      headers: { 'User-Agent': 'UserProfileManager', Accept: 'application/vnd.github+json' }
    });
    if (!ghRes.ok) {
      return res.status(ghRes.status).json({ error: 'GitHub fetch failed' });
    }
    const data = (await ghRes.json()) as any[];
    const simplified = data.map(r => ({ id: r.id, name: r.name, html_url: r.html_url, stargazers_count: r.stargazers_count }));
    cache.set(cacheKey, simplified);
    res.json({ cached: false, repos: simplified });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch repos' });
  }
});

export default router;
