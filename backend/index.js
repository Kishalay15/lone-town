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
import freezeManager from "./cron/freezeManager.js";
import milestoneTracker from "./cron/milestoneTracker.js";
import { setIO } from "./sockets/ioInstance.js";
import notificationRoutes from "./routes/notificationRoutes.js";

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
    origin: process.env.FRONTEND_URI,
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

connectDB();
setIO(io);
configureSocket(io);

freezeManager();
milestoneTracker();

app.use("/api", userRoutes);
app.use("/api", matchRoutes);
app.use("/api/notifications", notificationRoutes);

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
