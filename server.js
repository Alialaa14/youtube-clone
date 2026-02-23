import express from "express";
import { ENV } from "./src/utils/ENV.js";
import { connectDB } from "./src/config/db.js";
import userRouter from "./src/routers/user.router.js";
import { StatusCodes } from "http-status-codes";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/auth/", userRouter);

app.use((req, res, next) => {
  return res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: "Page Not Found",
  });
});
app.use((err, req, res, next) => {
  const statusCode = Number.isInteger(err.statusCode)
    ? err.statusCode
    : StatusCodes.INTERNAL_SERVER_ERROR;
  return res.status(statusCode).json({
    success: typeof err.success === "boolean" ? err.success : false,
    message: err.message || "Internal Server Error",
    data: err.data ?? null,
    errors: err.errors ?? [],
    stack: err.stack ?? null,
  });
});
connectDB();
app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
