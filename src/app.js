import express from  "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"})) // For the Url reading
app.use(express.static("public"))
app.use(cookieParser())




// import Routes
import userRouter from './routes/user.routes.js'

// Routes Decalarationo9 

app.use("/api/v1/users", userRouter) // http://locahost:8000/api/v1/users/register


export {app}