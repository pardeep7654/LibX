class ErrorHandler extends Error{
    constructor(mess,stCode){
        super(mess);
        this.statusCode=stCode;
    }
}

export const errorMiddleware=async(err,req,res,next)=>{
    err.message=err.message||"Internal Server error";
    err.statusCode=err.statusCode||500;
    if (err.code===11000) {
        const statusCode=400;
       const mess="Duplicate field value found";
        err=new ErrorHandler(mess,statusCode);
    }
    if(err.name==="JsonWebToken"){
        const statusCode=400;
        const mess="Json web token is Invalid,Try Again";
        err=new ErrorHandler(mess,statusCode);
    }
    if (err.name==="TokenExpiredError") {
        const stCode=400;
        const mess="Json web Token is expired ,try Again"
        err=new ErrorHandler(mess,stCode);
    }
    if (err.name==="CastError") {
        const stCode=400;
        const mess="Resource not found,try Again"
        err=new ErrorHandler(mess,stCode);
    }
    const errMessages=err.errors ? Object.values(err.errors).map((val)=>val.message).join(" "):err.message;

    return res.status(err.statusCode).json({
        success:false,
        message:errMessages
    })

}

export default ErrorHandler;