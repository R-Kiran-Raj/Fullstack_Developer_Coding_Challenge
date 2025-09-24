import request from 'supertest';
import { createApp } from '../app.js';

describe('GitHub API', () => {
  let app: any;

  beforeEach(() => {
    app = createApp();
  });

  describe('GET /api/github/repos', () => {
    it('should fetch repos for valid username', async () => {
      const response = await request(app)
        .get('/api/github/repos?username=octocat')
        .expect(200);

      expect(response.body).toHaveProperty('repos');
      expect(response.body).toHaveProperty('cached');
      expect(Array.isArray(response.body.repos)).toBe(true);
      
      if (response.body.repos.length > 0) {
        const repo = response.body.repos[0];
        expect(repo).toHaveProperty('id');
        expect(repo).toHaveProperty('name');
        expect(repo).toHaveProperty('html_url');
        expect(repo).toHaveProperty('stargazers_count');
      }
    });

    it('should reject empty username', async () => {
      await request(app)
        .get('/api/github/repos?username=')
        .expect(400);
    });

    it('should reject missing username', async () => {
      await request(app)
        .get('/api/github/repos')
        .expect(400);
    });

    it('should handle non-existent username', async () => {
      const response = await request(app)
        .get('/api/github/repos?username=thisusernamedoesnotexist12345')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should trim whitespace from username', async () => {
      const response = await request(app)
        .get('/api/github/repos?username=  octocat  ')
        .expect(200);

      expect(response.body).toHaveProperty('repos');
    });

    it('should cache results', async () => {
      // Use a real GitHub username for this test
      const testUsername = 'torvalds';
      
      // First request
      const response1 = await request(app)
        .get(`/api/github/repos?username=${testUsername}`)
        .expect(200);

      // Second request should be cached
      const response2 = await request(app)
        .get(`/api/github/repos?username=${testUsername}`)
        .expect(200);

      expect(response1.body.cached).toBe(false);
      expect(response2.body.cached).toBe(true);
      expect(response1.body.repos).toEqual(response2.body.repos);
    });
  });
});
