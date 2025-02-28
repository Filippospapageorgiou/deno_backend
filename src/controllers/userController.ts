import { Context } from "@hono/hono";
import { UserModel } from "../models/userModel.ts";
import { NewUser } from "../db/types.ts";
import { hashPasword, verifyPassword } from "../utils/password.ts";
import { generateToken } from "../middleware/auth.ts";

interface LoginRequest {
    email: string;
    password: string;
}

const ERROR_MESSAGES = {
    INVALID_JSON: "Expecting json data",
    MISSING_FIELDS: "Email and password are required",
    DATABASE_ERROR: "Database error occurred",
    INVALID_EMAIL: "Invalid email format",
    INVALID_PASSWORD: "Password must be at least 8 characters long",
    INVALID_CREDENTIALS: "Invalid credentials",
    SERVER_ERROR: "An unexpected error occurred",
    USER_NOT_FOUND: "User not found",
    EMAIL_EXISTS: "Email already registered"
} as const;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const userController = {
    // Protected route - Get all users
    getAllUsers: async (c: Context) => {
        try {
            const data = await UserModel.findAll();
            return c.json({
                success: true,
                data,
                timestamp: new Date().toISOString()
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : ERROR_MESSAGES.SERVER_ERROR;
            
            return c.json({ 
                success: false, 
                error: errorMessage || ERROR_MESSAGES.DATABASE_ERROR
            }, 500);
        }
    },

    // Public route - Login
    login: async (c: Context) => {
        try {
            const data = await c.req.json<LoginRequest>();
            if (!data?.email || !data?.password) {
                return c.json({
                    success: false,
                    error: ERROR_MESSAGES.MISSING_FIELDS
                }, 400);
            }

            const user = await UserModel.findByEmail(data.email);
            
            if (!user || !user.password) {
                return c.json({
                    success: false,
                    error: ERROR_MESSAGES.INVALID_CREDENTIALS
                }, 401);
            }

            const isValidPassword = await verifyPassword(data.password, user.password);

            if (!isValidPassword) {
                return c.json({
                    success: false,
                    error: ERROR_MESSAGES.INVALID_CREDENTIALS
                }, 401);
            }

            const token = await generateToken(user.id);

            return c.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        email: user.email
                    }
                },
                timestamp: new Date().toISOString()
            });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : ERROR_MESSAGES.SERVER_ERROR;
            
            return c.json({
                success: false,
                error: errorMessage
            }, 500);
        }
    },

    delete: async (c: Context) => {
        try{
            const data = await c.req.json()

            if (!data || !data.id) {
                return c.json({
                    success: false,
                    error: ERROR_MESSAGES.INVALID_JSON
                }, 400);
            }

            const result = await UserModel.delete(data.id);

            if(result === null){
                return c.json({
                    success: false,
                    message: `User with id: ${data.id} doesnt exists in the database`
                })
            }

            return c.json({
                success: true,
                data: {
                    result: result,
                    message: `User with id: ${data.id} deleted succesfull`
                },
                timestamp: new Date().toISOString()
            }, 201);



        }catch (error: unknown) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : ERROR_MESSAGES.SERVER_ERROR;
            
            return c.json({
                success: false,
                error: errorMessage
            }, 500);
        }
    },

    // Public route - Register
    register: async (c: Context) => {
        try {
            const data = await c.req.json();
            
            if (!data) {
                return c.json({
                    success: false,
                    error: ERROR_MESSAGES.INVALID_JSON
                }, 400);
            }

            const body: NewUser = data;
            
            if (!body.email || !body.password) {
                return c.json({
                    success: false,
                    error: ERROR_MESSAGES.MISSING_FIELDS
                }, 400);
            }

            if (!emailRegex.test(body.email)) {
                return c.json({
                    success: false,
                    error: ERROR_MESSAGES.INVALID_EMAIL
                }, 400);
            }

            if (body.password.length < 8) {
                return c.json({
                    success: false,
                    error: ERROR_MESSAGES.INVALID_PASSWORD
                }, 400);
            }

            const existingUser = await UserModel.findByEmail(body.email);
            if (existingUser) {
                return c.json({
                    success: false,
                    error: ERROR_MESSAGES.EMAIL_EXISTS
                }, 409);
            }

            const hashedPassword = await hashPasword(body.password);

            const userData: NewUser = {
                email: body.email,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await UserModel.create(userData);

            return c.json({
                success: true,
                data: {
                    id: result,
                    email: userData.email,
                    createdAt: userData.createdAt
                },
                timestamp: new Date().toISOString()
            }, 201);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : ERROR_MESSAGES.SERVER_ERROR;
            
            return c.json({
                success: false,
                error: errorMessage
            }, 500);
        }
    }
};