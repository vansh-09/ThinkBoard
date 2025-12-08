import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();

// ❗R A I L W A Y   F I X — MUST USE THEIR PORT
const PORT = process.env.PORT;

if (!PORT) {
  console.error("❌ ERROR: Railway did NOT provide PORT");
  process.exit(1);
}

const __dirname = path.resolve();

// middleware
if (process.env.NODE_ENV !== "production") {
  app.use(cors({ origin: "http://localhost:5173" }));
} else {
  app.use(cors());
}

app.use(express.json());
app.use(rateLimiter);

app.use("/api/notes", notesRoutes);

// -------------------------
// PRODUCTION STATIC FILES
// -------------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("🚀 Server started on PORT:", PORT);
  });
});
