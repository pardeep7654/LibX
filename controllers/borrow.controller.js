import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Borrow } from "../models/Borrow.model.js";
import { Books } from "../models/Book.model.js";
import { User } from "../models/User.model.js";
import { calculateFine } from "../utils/fineCalculator.js";
import { use } from "bcrypt/promises.js";
export const borrowedBooks=catchAsyncErrors(async(req,res,next)=>{
try {
    const user=await User.findOne({email:req.user.email});
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }
    res.status(200).json({
        success:true,
        borrowedBooks:user.borrowedBooks
    })
} catch (error) {
    console.log(error.message);
    return next(new ErrorHandler(error.message,500));
}
})

export const recordBorrowedBook=catchAsyncErrors(async(req,res,next)=>{
    try {
          const {id}=req.params;
          console.log(id)
          const {email}=req.body;

          const book=await Books.findById(id);
          if(!book){
              return next(new ErrorHandler("Book not found",404));
          }
          const user= await User.findOne({email});
            if(!user){
                return next(new ErrorHandler("User not found",404));
            }
           if (book.quantity<=0){
               return next(new ErrorHandler("Book not available",400));
            
           } 
           const isAlreadyBorrowed=user.borrowedBooks.find(b=>b.bookId.toString()===id && b.returned===false);
           if(isAlreadyBorrowed){
               return next(new ErrorHandler("Book already borrowed",400));
           }
           book.quantity-=1;
           book.availability=book.quantity>0;
           await book.save();
           user.borrowedBooks.push({bookId:book._id,
            bookTitle:book.title,
            borrowedDate:Date.now(),
            dueDate:Date.now()+7*24*60*60*1000,
            returned:false
           });
           await user.save();
           await Borrow.create({
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            },
            book:book._id,
            price:book.price,
            borrowedDate:Date.now(),
            dueDate:Date.now()+7*24*60*60*1000
        }) 
            res.status(200).json({
                success:true,
                message:"Book borrowed successfully"
            })

    } catch (error) {
        console.log(error);
        return next(new ErrorHandler(error.message,500));
    }
})

export const getBorrowedBooksForAdmin=catchAsyncErrors(async(req,res,next)=>{
    try {
        const borrowedBooks=await Borrow.find({returnDate:null});
        res.status(200).json({
            success:true,
            borrowedBooks
        })
    } catch (error) {
        console.log(error.message);
        return next(new ErrorHandler(error.message,500));
    }
})

export const returnBorrowBook=catchAsyncErrors(async(req,res,next)=>{
    try {
        const {bookId}=req.params;
        const {email}=req.body;
        const book=await Books.findById(bookId);
        if(!book){
            return next(new ErrorHandler("Book not found",404));
        }
        const user=await
        User.findOne({email,accountVerified:true}); 
        if(!user){
            return next(new ErrorHandler("User not found",404));
        }
        const borrowedBook=user.borrowedBooks.find(b=>b.bookId.toString()===bookId && b.returned===false);
        if(!borrowedBook){
            return next(new ErrorHandler("Book not borrowed",400));
        }
        borrowedBook.returned=true;
        borrowedBook.returnDate=Date.now();
        await user.save();
        book.quantity+=1;
        book.availability=true;
        await book.save();
        const borrow=await Borrow.findOne({book:bookId,"user.email":email,returnDate:null});
        if(!borrow){
            return next(new ErrorHandler("Book not borrowed",400));
        }
        borrow.returnDate=Date.now();
         const fine=calculateFine(borrow.dueDate);
            borrow.fine=fine;
            await borrow.save();

        res.status(200).json({
            success:true,
            message:fine!==0?`Book returned successfully, total charges is $${fine+book.price}`:
            `Book returned successfully, total charges is $${book.price}` 
        })

    } catch (error) {
        console.log(error.message);
        return next(new ErrorHandler(error.message,500));
    }
})