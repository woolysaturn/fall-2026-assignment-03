import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
    it('should log time and correctly aggregate total hours for a ticket', async () => {
      const ticketRes = await request(app)
        .post('/tickets')
        .set('X-User-Id', '1')
        .send({
          title: 'Test Ticket',
          description: 'Test Description',
          status: 'open',
        });
      expect(ticketRes.status).toBe(201);
      const ticketId = ticketRes.body.id;

      // Log hours for the ticket every 2.5 hours
      const log1 = await request(app)
        .post(`/tickets/${ticketId}/time`)
        .set('X-User-Id', '1')
        .send({ hours: 2.5 });
      expect(log1.status).toBe(201);
      expect(log1.body).toHaveProperty('id');

        // Log second 3.5 hours for the ticket
      const log2 = await request(app)
        .post(`/tickets/${ticketId}/time`)
        .set('X-User-Id', '1')
        .send({ hours: 3.5 });
      expect(log2.status).toBe(201);
      
      // Get the total logged hours for the ticket
      const totalRes = await request(app)
        .get(`/tickets/${ticketId}/time`)
      .set('X-User-Id', '1');
      expect(totalRes.status).toBe(200);
      expect(totalRes.body).toEqual({
        ticket_id: ticketId,
        total_hours: 6,
      });

  });
});
