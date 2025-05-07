import express from "express";
import "dotenv/config";
import apiRouter from "./routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import { DBConnect } from "./utils/dbConnect";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", apiRouter);

DBConnect()
  .then(() => {
    app.listen(process.env.PORT || 3000),
      () => {
        console.log(`server is running on ${process.env.PORT}`);
      };
  })
  .catch((error) => console.log("mongo db connection failed: ", error));
