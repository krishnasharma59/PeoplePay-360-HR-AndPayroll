import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import apiRoutes from "./routes/apiRoutes.js";

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Permit the local Vite dev server even when its default port is busy.
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || origin === process.env.CLIENT_URL) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => res.json({ status: "ok", service: "peoplepay360-api" }));
app.use("/api", apiRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((error, req, res, next) => {
  console.error(error);
  if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
  if (error.code === 11000) return res.status(409).json({ message: `Duplicate value for ${Object.keys(error.keyPattern).join(", ")}.` });
  res.status(500).json({ message: "Unexpected server error." });
});

const port = process.env.PORT || 8001;
connectDB().then(() => app.listen(port, () => console.log(`PeoplePay360 API running on port ${port}`)));
