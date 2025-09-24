import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth.js';
import profileRouter from './routes/profile.js';
import githubRouter from './routes/github.js';

export const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: true, credentials: true }));
  app.use(helmet());
  app.use(rateLimit({ windowMs: 60_000, max: 60 }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/github', githubRouter);

  // basic error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  });

  return app;
};
