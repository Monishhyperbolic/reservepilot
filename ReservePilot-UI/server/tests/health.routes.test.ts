import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
describe('health route', () => {
  it('returns an opaque health response and request id', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', service: 'reservepilot-api', version: '1.0.0' });
    expect(response.headers['x-request-id']).toBeTruthy();
  });
});
