import { Request, Response, NextFunction, Router } from 'express';
import { db } from '../db/database.js';

const router = Router();

// TODO: Student implementation - Part 1: User Routes

// GET /users
// Route to fetch all users
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await db
            .selectFrom('users')
            .selectAll()
            .execute();

        res.json(users);
    } catch (error){
        next(error);
    }
});

// GET /users/:id
// Create new user 
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Convert id to int if DB uses int prim keys
        const userId = parseInt(id);
        if(isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        // Fetch the user by ID from the database
        const user = await db.selectFrom('users')
            .selectAll()
            .where('id', '=', userId)
            .executeTakeFirst();
        // If no user is found, return a 404 response
        if(!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
});

// POST /users
// Route to create a new user
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email} = req.body;
        // Validate the input data
        if(!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        // Insert the new user into the database
        const newUser = await db.insertInto('users')
            .values({ name, email})
            .returningAll()
            .executeTakeFirstOrThrow();

        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
});

export default router;
