import express from "express";
import { ENV } from "./src/utils/ENV.js";
import { connectDB } from "./src/config/db.js";

const app = express();

connectDB();
app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
