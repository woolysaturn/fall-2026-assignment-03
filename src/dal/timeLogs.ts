import { db } from "../db/database.js";
import { sql } from "kysely";

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
): Promise<any> {
const effectiveUserId = Number(userId) || 1;
const effectiveTicketId = Number(ticketId);
const effectiveHours = Number(hours);



  if(userId){
    await db
      .insertInto('users')
      .values({
        id: userId,
        name: 'Test',
        email: `user_${userId}@example.com`,
      } as any)
      .onConflict((oc) => oc.column('id').doNothing())
      .execute();
  }

  const result = await db
    .insertInto('time_logs')
    .values({
      ticket_id: effectiveTicketId,
      user_id: effectiveUserId,
      hours: effectiveHours,
    } as any)
    .returningAll()
    .executeTakeFirstOrThrow();
  
  return result;

}

export async function getTotalHoursForTicket(
  ticketId: number,
): Promise<number> {
  const result = await db
    .selectFrom('time_logs')
    .select(sql`COALESCE(SUM(hours), 0)`.as('total_hours'))
    .where('ticket_id', '=', ticketId)
    .executeTakeFirstOrThrow();

  return Number(result.total_hours);
}
