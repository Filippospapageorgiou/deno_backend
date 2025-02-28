import { Hono } from "@hono/hono";
import { userController } from "../controllers/userController.ts";
import { authMiddleware } from "../middleware/auth.ts";

// Initialize routers
const publicRoutes = new Hono()
  .get("/health", (c) => c.json({ status: "OK", timestamp: new Date().toISOString() }))
  .post("/auth/login", userController.login)
  .post("/auth/register", userController.register);

// Protected routes
const protectedRoutes = new Hono()
  .use("*", authMiddleware) // Protect all routes under this router
  .post("/deleteUser",userController.delete)
  .get("/users", userController.getAllUsers);

// Create and export the main API router
export const apiRouter = new Hono()
  .route("/public", publicRoutes)  // Mount public routes under /public
  .route("/", protectedRoutes);    // Mount protected routes at root level