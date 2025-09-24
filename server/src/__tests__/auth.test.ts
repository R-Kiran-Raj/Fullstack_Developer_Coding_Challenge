import request from 'supertest';
import { createApp } from '../app.js';
import { db } from '../db/memory.js';
import jwt from 'jsonwebtoken';

describe('Authentication API', () => {
  let app: any;

  beforeEach(() => {
    app = createApp();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid email');
    });

    it('should normalize email (lowercase, trim)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'TEST@EXAMPLE.COM' })
        .expect(200);

      const token = response.body.token;
      const decoded = jwt.decode(token) as any;
      expect(decoded.sub).toBe('test@example.com');
    });

    it('should reject missing email', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });
});
