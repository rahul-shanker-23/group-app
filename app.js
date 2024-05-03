import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRouter.js";
import groupRouter from "./routes/groupRouter.js";
import messageRouter from "./routes/messageRouter.js";
import "dotenv/config";
const app = express();

// DB connection
let DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
if (process.env.NODE_ENV === "test") {
  DB = process.env.DATABASE_TEST.replace(
    "<password>",
    process.env.DATABASE_TEST_PASSWORD
  );
}

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.log(err));

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/hello", (req, res) => {
  res.status(200).json({
    message: "success",
  });
});

// routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/groups", groupRouter);
app.use("/api/v1/messages", messageRouter);

// unhandled routes
app.all("*", (req, res, next) => {
  next(new Error(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
  });
});

export default app;
