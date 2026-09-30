import { db } from "../db/database.js";
import { sql } from "kysely";

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
): Promise<any> {
  if(userId){
    await db
      .insertInto('time_logs')
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
      ticket_id: ticketId,
      user_id: userId,
      hours,
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
