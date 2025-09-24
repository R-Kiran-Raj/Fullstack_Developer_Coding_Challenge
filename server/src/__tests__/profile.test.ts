import request from 'supertest';
import { createApp } from '../app.js';
import { db } from '../db/memory.js';
import jwt from 'jsonwebtoken';

describe('Profile API', () => {
  let app: any;
  let token: string;

  beforeEach(() => {
    app = createApp();
    // Clear database
    (db as any).users?.clear?.();
    
    // Create a valid token
    const secret = process.env.JWT_SECRET || 'dev-secret';
    token = jwt.sign({ sub: 'test@example.com' }, secret, { expiresIn: '2h' });
  });

  describe('GET /api/profile', () => {
    it('should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('name', '');
    });

    it('should reject request without token', async () => {
      await request(app)
        .get('/api/profile')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject request with malformed authorization header', async () => {
      await request(app)
        .get('/api/profile')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });
  });

  describe('PUT /api/profile', () => {
    it('should update profile with valid data', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'John Doe' })
        .expect(200);

      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('name', 'John Doe');
    });

    it('should reject empty name', async () => {
      await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);
    });

    it('should reject name that is too long', async () => {
      const longName = 'a'.repeat(101);
      await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: longName })
        .expect(400);
    });

    it('should trim whitespace from name', async () => {
      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '  John Doe  ' })
        .expect(200);

      expect(response.body.name).toBe('John Doe');
    });

    it('should reject request without token', async () => {
      await request(app)
        .put('/api/profile')
        .send({ name: 'John Doe' })
        .expect(401);
    });
  });
});
