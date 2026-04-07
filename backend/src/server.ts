import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// const router = require("./routes/index");
import router from "./routes/index";

const app: Application = express();

const port: number = 3000;

dotenv.config();
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: "*",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  }),
);

app.use("/api", router);

app.get("/api/check-token", (req: Request, res: Response) => {
  res.json({ cookies: req.cookies });
});

app.get("/api/read-cookies", (req: Request, res: Response) => {
  const myCookie = req.cookies.myCookie;
  if (myCookie) {
    res.send(`Cookie's value: ${myCookie}`);
  } else {
    res.send(`No cookie found!`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on PORT:${port}`);
});
