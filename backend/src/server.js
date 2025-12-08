import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

//middleware
app.use(express.json());

// Enable CORS during development so the Vite dev server can call the API.
// In production the frontend is served from the same origin so stricter
// cors isn't necessary. Allow explicitly in development for localhost:5173.
if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: "http://localhost:5173",
    })
  );
} else {
  // keep a safe default for production builds
  app.use(cors());
}

app.use(rateLimiter);

app.use("/api/notes", notesRoutes);
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server started on PORT: ${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Try one of:
  - Kill the process using the port: \`lsof -nP -iTCP:${PORT} -sTCP:LISTEN\` then \`kill -9 <PID>\`
  - Or start the server on a different port: \`PORT=${parseInt(PORT) + 1} npm run start\`
`);
      process.exit(1);
    }
    console.error("Server error:", err);
    process.exit(1);
  });
});
