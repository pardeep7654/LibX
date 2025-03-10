import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/User.model.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import ErrorHandler from "../middlewares/errorMiddlewares.js";

export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  try {
    const users = await User.find({
      accountVerified: true,
    });
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("Admin Avatar required", 400));
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }
    const isRegistered = await User.findOne({
      email,
      accountVerified: true,
    });
    if (isRegistered) {
      return next(new ErrorHandler("User already registered", 400));
    }
    if (password.length < 8 || password.length > 16) {
      return next(
        new ErrorHandler("Password must between 8 and 16 characters ", 400)
      );
    }
    const { avatar } = req.files;
    const allowedImageTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (!allowedImageTypes.includes(avatar.mimetype)) {
      return next(new ErrorHandler("Invalid image file", 400));
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const cloudinaryResponse = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      { folder: "library_management_system/admins" }
    );
    if (!cloudinaryResponse) {
      console.error("Error uploading image", cloudinaryResponse.error);
      return next(new ErrorHandler("Error uploading image", 500));
    }
    const admin= await User.create({
      name,
      email,
      password: hashedPassword,
      avatar: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
      accountVerified: true,
      role: "Admin",
    });
    res.status(201).json({
      success: true,
      message: "Admin added successfully",
      admin,
    });
  } catch (error) {
    console.log(error.message); 
    return next(new ErrorHandler(error.message, 500));
  }
});
