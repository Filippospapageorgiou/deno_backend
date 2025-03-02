import { mysqlTable, mysqlSchema, AnyMySqlColumn, varchar, timestamp } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"
import { bigint } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	email: varchar({ length: 54 }),
	password: varchar({ length: 256 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	role: varchar({ length: 54 }),
});
