import { eq } from "drizzle-orm";
import { db } from "../db/db.ts";
import { users } from "../db/schema.ts";
import { NewUser } from "../db/types.ts";

export class UserModel {

    static async findAll(){
      const count: number = await db.$count(users);
      const result:NewUser[] =  await db.select().from(users);
      return {
        total:count,
        users:result
      }
    }

    static async findById(id: number) {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.id, id))
          .limit(1);
        return result[0];
      }

      static async create(userData: NewUser) {
        const result = await db.insert(users).values(userData);
        return result;
      }
    
      static async update(id: number, userData: Partial<NewUser>) {
        const result = await db
          .update(users)
          .set(userData)
          .where(eq(users.id, id));
        return result;
      }

    
    static async delete(id: number) {
        // δες αν ο user υπάρχει 
        const userToDelete = await db.select()
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        if (!userToDelete || userToDelete.length === 0) {
          return null;
        }
        return await db.delete(users)
          .where(eq(users.id, id));
      }

      static async findByEmail(email: string){
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        return result[0];
      }
}