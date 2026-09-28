import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // TODO: Student implementation - Part 1: Authentication Middleware
  // Store the authenticated userId on res.locals.userId
  // Get the userId from the request header 'x-user-id'

  const bareUserId = req.header('x-user-id');
  res.locals.userId = bareUserId;

  // Check if the userId exists in the request header
  if(!bareUserId) {
    res.status(401).json({error: 'Unauthorized: Missing user ID'});
    return;
  }

  const userId = Number(bareUserId);

  // EdgeCases: floatinf point, NaN, negative numbers, zero
  if (isNaN(userId) || !Number.isInteger(userId) || userId <= 0){
    res.status(402).json({ error: 'Unauthorized: Invalid User ID'});
    return;
  }

  // Attach valid number ID to res.locals.userId
  res.locals.userId = userId;
  next();
}

export default authMiddleware;
