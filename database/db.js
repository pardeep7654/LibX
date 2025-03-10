import mongoose from "mongoose";

export const connectDB=async()=>{
    mongoose.connect(process.env.DB_URL).then((res)=>{
        console.log("Database connected successfuly");
        
    }).catch((e)=>{
        console.log("DbConnection Failed "+e);
        
    })
}