import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  let testUserId: number;
  let testTicketId: number;

  // Test user creation (POST /users)
    it('should create a new user successfully', async () => {
      const newUser = { name: 'Test User', email: 'testuser@example.com' };
      const res = await request(app)
        .post('/users')
        .send(newUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newUser.name);

      testUserId = res.body.id;
    });
  
  // Test ticket creation (POST /tickets)
  it('should create a new ticket when authenticated', async () => {
    const newTicket = {
      title: 'Test Ticket',
      description: 'This is a test ticket',
      status: 'open'
    };

    const res = await request(app)
      .post('/tickets')
      .set('X-User-Id', testUserId.toString())
      .send(newTicket);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(newTicket.title);

    testTicketId = res.body.id;
  });


  // Test auth middleware rejection (401 when X-User-Id is missing or invalid)
  it('should return 401 when X-User-Id header is missing', async () => {
    const res = await request(app)
      .post('/tickets')
      .send({ title: 'Unauthorized Ticket' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 401 when X-User-Id header is invalid', async () => {
    const res = await request(app)
      .post('/tickets')
      .set('X-User-Id', 'invalid')
      .send({ title: 'Unauthorized Ticket' });

    expect(res.status).toBe(401);
  });

  // Test 404 responses for non-existent users and tickets
  it('should return 404 for a non exsistent user', async () => {
    const res = await request(app)
      .get('/users/999999')
      .set('X-User-Id', testUserId.toString());

    expect(res.status).toBe(404);
  });

  it('should return 404 for a non exsistent ticket', async () => {
    const res = await request(app)
      .get('/tickets/999999')
      .set('X-User-Id', testUserId.toString());

    expect(res.status).toBe(404);
  });

  // Test pagination and filtering on GET /tickets
  it('should filter tickets by status', async () => {
    const res = await request(app)
      .get('/tickets?status=open')
      .query({ status: 'open' })
      .set('X-User-Id', testUserId.toString());

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should support pagination params on GET /tickets', async () => {
    const res = await request(app)
      .get('/tickets?page=1&limit=2')
      .set('X-User-Id', testUserId.toString());

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
