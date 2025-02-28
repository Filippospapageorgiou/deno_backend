// deno-lint-ignore-file no-explicit-any
import * as mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { safeEnv, string, number } from "@safe-env/safe-env";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";


// Define and validate environment variables without defaults
const env = safeEnv({
    DB_HOST: string(),
    DB_PORT: number(),
    DB_USER: string(),
    DB_PASSWORD: string(),
    DB_NAME: string()
});

const dbConfig = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
};

// Create the connection pool
const pool = mysql.createPool({
    ...dbConfig,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 60000
});

// Test the connection
try {
    console.log("🔄 Connecting to Database...");
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully to TiDB Cloud");
    
    // Test a simple query
    const [result] = await connection.query('SELECT 1 + 1 AS test');
    console.log("Test query result:", result);
    
    connection.release();
} catch (error) {
    console.error("❌ Database connection failed:", error);
    if (error instanceof Error) {
        console.error("Detailed error:", {
            message: error.message,
            name: error.name,
            code: (error as any).code,
            errno: (error as any).errno,
            sqlState: (error as any).sqlState,
            sqlMessage: (error as any).sqlMessage
        });
    }
    throw error;
}

// Create and export the drizzle db instance
export const db = drizzle(pool);