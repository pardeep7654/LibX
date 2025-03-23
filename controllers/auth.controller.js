import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { User } from "../models/User.model.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { forgotPasswordTemplate } from "../utils/forgotPasswordTemplate.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }
    const isRegistered = await User.findOne({ email, accountVerified: true });
    if (isRegistered) {
      return next(new ErrorHandler("User already Exists ", 404));
    }
    const registerationAttemptsByUser = await User.countDocuments({
      email,
      accountVerified: false,
    });
    if (registerationAttemptsByUser.length >= 5) {
      return next(
        new ErrorHandler(
          "You have exceeded the number of registration attempts",
          404
        )
      );
    }
    if (password.length < 8 || password.length > 16) {
      return next(
        new ErrorHandler("Password must be between 8 and 16 letters", 400)
      );
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPass,
    });
    const verificationCode = await user.genrateVerificationCode();
    await user.save();
    await sendVerificationCode(verificationCode, email, res);
  } catch (error) {
    next(error);
  }
});

export const verifyOtp = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }
    const userAllentries = await User.find({
      email,
      accountVerified: false,
    }).sort({ createdAt: -1 });
    if (!userAllentries) {
      return next(new ErrorHandler("User not found", 404));
    }
    if (userAllentries.length > 1) {
      const user = userAllentries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        email,
        accountVerified: false,
      });
    } else {
      const user = userAllentries[0];
      if (user.verificationCode !== Number(otp)) {
        return next(new ErrorHandler("Invalid OTP", 400));
      }
      const currentTime = Date.now();

      const verificationCodeTime = new Date(
        user.verificationCodeExpire
      ).getTime();
      if (verificationCodeTime < currentTime) {
        return next(new ErrorHandler("OTP has expired", 400));
      }
      user.accountVerified = true;
      user.verificationCode = undefined;
      user.verificationCodeExpire = undefined;
      await user.save({ validateModifiedOnly: true });
      sendToken(user, 200, "Account Verifieds", res);
    }
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Internl server error", 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Please enter all fields", 400));
    }
    const user = await User.findOne({ email, accountVerified: true }).select(
      "+password"
    );
    if (!user) {
      return next(new ErrorHandler("Invalid Credentials", 401));
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Password", 401));
    }
    sendToken(user, 200, "Login Success", res);
  } catch (error) {
    console.log(error);

    throw new ErrorHandler("Internal server error", 500);
  }
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ErrorHandler("Please enter email", 400));
  }
  const user = await User.findOne({ email ,accountVerified:true});
  if (!user) {
    return next(new ErrorHandler("Invalid Email", 404));
  }
  const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
    const message = forgotPasswordTemplate(resetUrl);
  
  try {
    await sendEmail({
        email: user.email,
        subject: "Password Recovery",
        message,
      });
    res.status(200).json({
      success: true,
      message: "Recoverylink sent to your email",
    });
  } catch (error) {
    // console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Internal server", 500));
  }
});


export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const {token}= req.params;
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
  if (!user) {
    return next(new ErrorHandler("Invalid Token", 400));
  } 
  if (req.body.password !== req.body.confirmNewPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }
  if (req.body.password.length < 8 || req.body.password.length > 16) {
    return next(
      new ErrorHandler("Password must be between 8 and 16 letters", 400)
    );
    
  }
  const hashedPass = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPass;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, "Password Reset Success", res);
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => { 
  console.log(req.body)
    try {

        const user = await User.findById(req.user._id).select("+password"); 
      
        const {oldPassword,newPassword,confirmNewPassword} = req.body;
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return next(new ErrorHandler("Please enter all fields", 400));
        }

        const isMatched = await bcrypt.compare(oldPassword, user.password);
        if (!isMatched) {
            return next(new ErrorHandler("Old Password is incorrect", 400));
        }
        if (newPassword !== confirmNewPassword) {
            return next(new ErrorHandler("Password does not match", 400));
        }
        if (newPassword.length < 8 || confirmNewPassword > 16) {
            return next(
            new ErrorHandler("Password must be between 8 and 16 letters", 400)
            );
        }
        const hashedPass = await bcrypt.hash(newPassword, 10);
        user.password = hashedPass;
        await user.save();
        sendToken(user, 200, "Password Updated", res);
    } catch (error) {
        console.log(error); 
        next(new ErrorHandler("Internal server error", 500));
        
    }
})