import { Context, Next } from "@hono/hono";
import { create, verify } from "jwt";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "";

async function getCryptoKey(secret: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    return await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

export async function generateToken(userId: number, role:string, email: string): Promise<string> {
    const payload = {
        userId,
        role,
        email,
        exp: new Date().getTime() + 24 * 60 * 60 * 1000 // 24 hours
    };
    
    const key = await getCryptoKey(JWT_SECRET);
    return await create({ alg: "HS256", typ: "JWT" }, payload, key);
}

export async function authMiddleware(c: Context, next: Next) {
    try {
        const authorization = c.req.header("Authorization");
        
        if (!authorization || !authorization.startsWith("Bearer ")) {
            return c.json({ 
                success: false, 
                error: "Unauthorized - No token provided" 
            }, 401);
        }

        const token = authorization.split(" ")[1];
        const key = await getCryptoKey(JWT_SECRET);
        const payload = await verify(token, key);
        
        if (!payload || !payload.userId) {
            return c.json({ 
                success: false, 
                error: "Unauthorized - Invalid token" 
            }, 401);
        }

        c.set("userId", payload.userId);
        c.set("userRole",payload.role);
        c.set("email",payload?.email || "");
        await next();
    } catch (error) {
        return c.json({ 
            success: false, 
            error: "Unauthorized - Invalid token" 
        }, 401);
    }
}