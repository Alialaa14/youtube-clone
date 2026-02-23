import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { ENV } from "../utils/ENV.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";

import { customAlphabet } from "nanoid";
import { sendEmail } from "../utils/sendEmail.js";
import { forgetPasswordTemp } from "../utils/emailTemplates.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await User.findByIdAndUpdate(userId, { refreshToken }, { new: true });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error While Generating Tokens",
    );
  }
};
export const register = asyncHandler(async (req, res, next) => {
  const { username, email, password, fullname } = req.body;

  // Check if User already exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser)
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "User with email or username already exists",
      ),
    );

  //CREATE NEW USER AND SAVE INTO DATABASE
  const user = await User.create({
    username,
    email,
    password,
    fullname,
  });
  if (!user)
    return next(
      new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Error Creating New User Into Database",
      ),
    );

  // UPLOAD AVATAR IMAGE OR COVERIMAGE IF IT's EXISTED IN REGISTER
  // UPLOAD AVATAR
  let avatar = {};
  if (req.files?.avatar?.[0]) {
    const result = await uploadToCloudinary(req.files.avatar[0].path);
    avatar = { public_id: result.public_id, url: result.secure_url };
  }
  let coverImage = {};
  if (req.files?.coverImage?.[0]) {
    const result = await uploadToCloudinary(req.files.coverImage[0].path);
    coverImage = { public_id: result.public_id, url: result.secure_url };
  }
  if (avatar && Object.keys(avatar).length !== 0) {
    user.avatar = avatar;
  }

  if (coverImage && Object.keys(coverImage).length !== 0) {
    user.coverImage = coverImage;
  }
  const updateUser = await user.save();
  if (!updateUser)
    return next(
      new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Error While Updating User with Avatar , CoverImage In Database",
      ),
    );
  // RETURN RESPONSE TO THE USER
  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        updateUser,
        "User Registered Successfully",
      ),
    );
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;

  // Check if User exists
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user)
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "No User With Email or Username Found",
      ),
    );
  // CHECK IF PASSWORD IS CORRECT
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect)
    return next(new ApiError(StatusCodes.BAD_REQUEST, "Incorrect Password"));

  // GENERATE ACCESS TOKEN AND REFRESH TOKEN
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const cookies_options = {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
  };

  // RETURN RESPONSE TO THE USER
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookies_options)
    .cookie("refreshToken", refreshToken, cookies_options)
    .json(new ApiResponse(200, user, "User Logged In Successfully"));
});

export const logout = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user)
    return next(new ApiError(StatusCodes.BAD_REQUEST, "No User Found"));

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { refreshToken: null },
    { new: true },
  );

  if (!updatedUser)
    return next(
      new ApiError(StatusCodes.BAD_REQUEST, "Error While Logging Out User"),
    );

  const cookies_options = {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookies_options)
    .clearCookie("refreshToken", cookies_options)
    .json(new ApiResponse(200, null, "User Logged Out Successfully"));
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { username, email, fullname } = req.body;

  const user = await User.findById(userId);
  if (!user)
    return next(new ApiError(StatusCodes.BAD_REQUEST, "No User Found"));

  // UPLOAD AVATAR IMAGE OR COVERIMAGE IF IT's EXISTED IN REGISTER
  // UPLOAD AVATAR
  let avatar = {};
  if (req.files?.avatar?.[0]) {
    if (user.avatar?.public_id)
      await deleteFromCloudinary(user.avatar.public_id);
    const result = await uploadToCloudinary(req.files.avatar[0].path);
    avatar = { public_id: result.public_id, url: result.secure_url };
  }
  let coverImage = {};
  if (req.files?.coverImage?.[0]) {
    if (user.coverImage?.public_id)
      await deleteFromCloudinary(user.coverImage.public_id);
    const result = await uploadToCloudinary(req.files.coverImage[0].path);
    coverImage = { public_id: result.public_id, url: result.secure_url };
  }
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      username: username || user.username,
      email: email || user.email,
      fullname: fullname || user.fullname,
      avatar: avatar || user.avatar,
      coverImage: coverImage || user.coverImage,
    },
    { new: true },
  );

  if (!updatedUser) {
    return next(
      new ApiError(StatusCodes.BAD_REQUEST, "Error While Updating User"),
    );
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User Updated Successfully"));
  }
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return next(new ApiError(StatusCodes.BAD_REQUEST, "No User Found"));

  const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);
  user.refreshPasswordToken = nanoid();
  user.refreshPasswordTokenExpiry = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

  await user.save();

  const isEmailSent = await sendEmail(
    user.email,
    "Password Reset",
    forgetPasswordTemp({ otp: user.refreshPasswordToken, name: user.fullname }),
  );

  if (!isEmailSent)
    return next(
      new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Error While Sending Email",
      ),
    );

  // GENERATE ACCESS TOKEN
  const accessToken = jwt.sign({ id: user._id }, ENV.ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 10 * 60 * 1000, // 10 minutes
  });
  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        null,
        "Password Reset Email Sent Successfully",
      ),
    );
});

export const verifyOtp = asyncHandler(async (req, res, next) => {
  const { otp } = req.body;
  const token = req.cookies.accessToken;

  if (!token)
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "No Token Found"));
  const decoded = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);
  if (!decoded)
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid Token"));

  const user = await User.findOne({
    _id: decoded.id,
    refreshPasswordToken: otp,
  });

  if (!user)
    return next(
      new ApiError(StatusCodes.BAD_REQUEST, "Invalid OTP or Expired"),
    );

  if (Date.now() > user.refreshPasswordTokenExpiry) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, "OTP Expired"));
  }
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "OTP Verified Successfully"));
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const token = req.cookies.accessToken;
  if (!token)
    return next(
      new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Only Authorized User Can Reset Password",
      ),
    );

  const decoded = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);
  if (!decoded)
    return next(new ApiError(StatusCodes.UNAUTHORIZED, "Invalid Token"));

  const user = await User.findOne({ _id: decoded.id });
  if (!user)
    return next(new ApiError(StatusCodes.BAD_REQUEST, "User Not Found"));

  user.password = password;
  user.refreshPasswordToken = null;
  user.refreshPasswordTokenExpiry = null;
  await user.save();
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, null, "Password Reset Successfully"));
});

export const getUserProfile = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select(
    "-password -refreshToken -refreshPasswordToken -refreshPasswordTokenExpiry",
  );

  if (!user) {
    return next(new ApiError(StatusCodes.BAD_REQUEST, "User Not Found"));
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        user,
        "User Profile Retrieved Successfully",
      ),
    );
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req?.cookies?.refreshToken;
  if (!refreshToken)
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, "No Refresh Token Found"),
    );

  const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET);
  if (!decoded)
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, "Invalid Refresh Token"),
    );

  const user = await User.findOne({ _id: decoded.id, refreshToken });
  if (!user)
    return next(
      new ApiError(StatusCodes.UNAUTHORIZED, "Invalid Refresh Token"),
    );

  // GENERATE NEW ACCESS TOKEN AND REFRESH TOKEN
  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user?._id);

  const updatedUser = await User.findByIdAndUpdate(user._id, {
    refreshToken: newRefreshToken,
  });
  if (!updatedUser)
    return next(
      new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Error While Updating User With New Refresh Token",
      ),
    );
  const cookies_options = {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
  };
  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, cookies_options)
    .cookie("refreshToken", newRefreshToken, cookies_options)
    .json(new ApiResponse(200, null, "Tokens Refreshed Successfully"));
});

export const getWatchHistory = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId).populate({
    path: "watchHistory",
    populate: { path: "video", select: "title thumbnail views" },
  });
  if (!user)
    return next(new ApiError(StatusCodes.BAD_REQUEST, "User Not Found"));
  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        user,
        "User Watch History Retrieved Successfully",
      ),
    );
});
