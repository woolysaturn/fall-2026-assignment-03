import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { db } from '../db/database.js';
import { parse } from 'path/win32';

const router = Router();

// TODO: Student implementation - Part 1: Ticket Routes
// GET /tickets
// Retrieves a list of all tickets
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tickets = await db.selectFrom('tickets').selectAll().execute();
        res.json(tickets);
    } catch (error) {
        next(error);
    }
});

// GET /tickets/:id
// Retrieves a specific ticket by its ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate ticket ID
        const ticketId = parseInt(req.params.id, 10);
        if(isNaN(ticketId)) {
        res.status(400).json({ error: 'Invalid ticket ID' });
        return 
        }
        // Fetch the ticket from the database by its ID
        const ticket = await db
            .selectFrom('tickets')
            .selectAll()   
            .where('id', '=', ticketId)
            .executeTakeFirst();
            // Check if the ticket exists
            if(!ticket){
                res.status(404).json({ error: 'Ticket not found' });
                return;
            }
            res.json(ticket);
    } catch (error) {
        next(error);
    }
});


// POST /tickets
// Creates a new ticket
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {title, description, status, assignee_id} = req.body;

        // Validate required fields
        // Check if the title is provided
        if(!title){
            res.status(400).json({ error: 'Title is required' });
            return;
        }
        // New ticket creation
        const newTicket = await db
            .insertInto('tickets')
            .values({
                title,
                description: description || null,
                status: status || 'open',
                assignee_id: assignee_id || null,
                creator_id: req.user?.id || 1,
            })
            .returningAll()
            .executeTakeFirstOrThrow();
        // Respond with the newly created ticket
        res.status(201).json(newTicket);
    } catch (error) {
        next(error);
    }
});

// PATCH /tickets/:id/status
// Updates the status of a specific ticket by its ID
router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticketId = parseInt(req.params.id, 10);
        const { status } = req.body;
        // Validate ticket ID
        if (isNaN(ticketId)) {
        res.status(400).json({ error: 'Invalid ticket ID' });
        return;
        }
        // Validate status
        if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
        }
        // Update the ticket's status
        const updatedTicket = await db
            .updateTable('tickets')
            .set({ status })
            .where('id', '=', ticketId)
            .returningAll()
            .executeTakeFirstOrThrow();
        // Check if the ticket was updated successfully
        if(!updatedTicket){
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }

        res.json(updatedTicket);
    } catch (error) {
        next(error);
    }
});

// TODO: Student implementation - Part 2: Time Log Routes
// POST /tickets/:id/time
router.post('/:id/time', async (req: Request, res: Response, next: NextFunction) => {
    try {
    const ticketId = parseInt(req.params.id, 10);
    const { hours, comment, user_id } = req.body;
    
    if (isNaN(ticketId)) {
      res.status(400).json({ error: 'Invalid ticket ID' });
      return;
    }
    
    if (!hours || isNaN(Number(hours))) {
      res.status(400).json({ error: 'Valid hours spent required' });
      return;
    }

    const newTimeLog = await db
      .insertInto('time_logs')
      .values({
        ticket_id: ticketId,
        user_id: user_id || null,
        hours: Number(hours),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    res.status(201).json(newTimeLog);
    } catch (error) {
        next(error);
    }
});


// GET /tickets/:id/time

router.get('/:id/time', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ticketId = parseInt(req.params.id, 10);
        if (isNaN(ticketId)) {
            res.status(400).json({ error: 'Invalid ticket ID' });
            return;
        }
        const timeLogs = await db
            .selectFrom('time_logs')
            .selectAll()
            .where('ticket_id', '=', ticketId)
            .execute();
        res.json(timeLogs);
    } catch (error) {
        next(error);
    }
});

export default router;