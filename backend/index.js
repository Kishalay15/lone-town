import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { connectDB } from "./config/db.js";
import dailyMatchmaker from "./services/dailyMatchmaker.js";
import cron from "node-cron";
import winston from "winston";
import configureSocket from "./sockets/socket.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";

dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());
app.use(cors());

connectDB();

configureSocket(io);

app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", matchRoutes);

dailyMatchmaker()
  .then(() => console.log("Daily matchmaking complete"))
  .catch((err) => console.error("Matchmaking error:", err));

cron.schedule("0 0 * * *", () => {
  dailyMatchmaker()
    .then(() => console.log("Scheduled matchmaking complete"))
    .catch((err) => console.error("Scheduled matchmaking error:", err));
});

//server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
