import jwt from 'jsonwebtoken';

export const sendToken = (user, statusCode, message, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  res.status(statusCode).cookie("token",token,{
    expires:new Date(Date.now()+process.env.COOKIE_EXPIRE*24*60*60*1000),
  }).json({
    success: true,
    message,
    token,
    user,
  });
  
}