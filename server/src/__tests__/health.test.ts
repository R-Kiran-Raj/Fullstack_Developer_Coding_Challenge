import request from 'supertest';
import { createApp } from '../app.js';

describe('Health Check API', () => {
  let app: any;

  beforeEach(() => {
    app = createApp();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
    });
  });
});
