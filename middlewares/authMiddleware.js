import { catchAsyncErrors } from "./catchAsyncErrors.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "./errorMiddlewares.js";
import {User} from "../models/User.model.js";

export const isAuthenticated=catchAsyncErrors(async(req,res,next)=>{
    const {token}=req.cookies;;
    if (!token) {
        return next(new ErrorHandler("User is Not authenticated",401));
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user=await User.findById(decoded.id);
    next();
})  

export const isAuthorized=(...roles)=>{
    return (req,res,next)=>{
        if (!roles.includes(req.user.role )) {
            return next(new ErrorHandler(`Role ${req.user.role} is not authorized to access this route`,403));
        }
        next();
    }
}  
// })   