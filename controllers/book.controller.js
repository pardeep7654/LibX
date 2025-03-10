import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Books } from "../models/Book.model.js";
import  ErrorHandler  from "../middlewares/errorMiddlewares.js";
import { User } from "../models/User.model.js";

export const addBook=catchAsyncErrors(async(req,res,next)=>{
    const {title,author,description,price,quantity,availability}=req.body;
    if (!title || !author || !description || !price || !quantity || !availability) {
        return next(new ErrorHandler("Please fill all the fields",400));
    }
    const book=await Books.create({
        title,
        author,
        description,
        price,
        quantity,
        availability
    });
    res.status(201).json({
        success:true,
        message:"Book added successfully",
        book
    })
});

export const getAllBooks=catchAsyncErrors(async(req,res,next)=>{
    try {
        const books=await Books.find();
        res.status(200).json({
            success:true,
            books
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
});

export const deleteBook=catchAsyncErrors(async(req,res,next)=>{
    try {
        const book=await Books.findById(req.params.id);
        if (!book) {
            return next(new ErrorHandler("Book not found",404));
        }
        await Books.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success:true,
            message:"Book deleted successfully"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message,500));  
        
    }
});