import { Hono } from "@hono/hono";
import { userController } from "../controllers/userController.ts";
import { authMiddleware } from "../middleware/auth.ts";

// Initialize routers
const publicRoutes = new Hono()
  .get("/health", (c) => c.json({ status: "OK", timestamp: new Date().toISOString() }))
  .post("/auth/login", userController.login)


const protectedRoutes = new Hono()
  .use("*", authMiddleware) 
  .post("/deleteUser",userController.delete)
  .post("/auth/register", userController.register)
  .get("/users", userController.getAllUsers);


export const apiRouter = new Hono()
  .route("/public", publicRoutes)  
  .route("/", protectedRoutes);