import express from "express"
import { config } from "dotenv";
import { connectDB } from "./database/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js"
import bookRouter from "./routes/book.routes.js"
import borrowRouter from "./routes/borrow.routes.js"
import userRouter from "./routes/user.routes.js"
import expressfileupload from "express-fileupload"
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import { notifyUsers } from "./services/notifyUsers.js";
import { removeUnverifiedAccounts } from "./services/removeUnverfifiedAccounts.js";


const app=express();

config({path:"./config/config.env"})

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(expressfileupload({
    useTempFiles:true,
    tempFileDir:"/tmp/",
}));
app.use(cookieParser());
app.use(cors({
    origin:[
        process.env.FRONTEND_URL
    ],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true,
}))


 

app.use("/api/v1/auth",authRouter);
app.use("/api/v1/books",bookRouter);
app.use("/api/v1/borrow",borrowRouter);
app.use("/api/v1/user",userRouter);

notifyUsers();
removeUnverifiedAccounts();
connectDB();


app.use(errorMiddleware)
export {app}