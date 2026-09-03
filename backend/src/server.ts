import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/index";

const app: Application = express();

const port: number = 5000;

app.use(cookieParser());

app.use(express.json());

const allowedOrigins = ["http://localhost:5173", "https://lv90n1x3-5173.asse.devtunnels.ms"];

app.use(
  cors({
    credentials: true,
    origin: allowedOrigins,
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  }),
);

app.use("/api", router);

app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
