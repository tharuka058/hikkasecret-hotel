import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import roomsRouter from "./routes/rooms.js";
import bookingsRouter from "./routes/bookings.js";
import offersRouter from "./routes/offers.js";
import adminRouter from "./routes/admin.js";
import diningRouter from "./routes/dining.js";
import contactRouter from "./routes/contact.js";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Hikka Secret Lake Villa API",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/rooms", roomsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/offers", offersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/dining", diningRouter);
app.use("/api/contact", contactRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏨 Hikka Secret Lake Villa API`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS: Allowing requests from ${FRONTEND_URL}\n`);
});

export default app;
