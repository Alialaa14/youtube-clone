import { Router } from "express";
import {
  forgetPassword,
  getWatchHistory,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  updateProfile,
  verifyOtp,
} from "../controllers/user.controller.js";
import upload from "../utils/multer.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = Router();

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  register,
);

router.post("/login", login);
router.patch(
  "/update-profile",
  isAuthenticated,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateProfile,
);

router.post("/logout", isAuthenticated, logout);

router.post("/forget-password", forgetPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);
router.get("/watch-history", isAuthenticated, getWatchHistory);

export default router;
