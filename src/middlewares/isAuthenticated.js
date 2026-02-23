import jwt from "jsonwebtoken";
import { ENV } from "../utils/ENV.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const isAuthenticated = (req, res, next) => {
  const token = req.cookies?.refreshToken;
  if (!token)
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, "You are not authenticated"),
    );

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    req.user = decoded;
    return next();
  } catch (error) {
    return next(
      new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Invalid token, authentication failed",
      ),
    );
  }
};
