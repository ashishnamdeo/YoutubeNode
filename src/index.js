//require('dotenv').config({path: '.env'}) // will work

import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

import connectDB from "./db/index.js"
import {app} from './app.js'

connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000, ()=>{
    console.log(`Server is running on the ${process.env.PORT}`)
  })
})
.catch((error)=>{
  console.log('Monogo DB connection failed !!!',error);
})



























/*
import  express from "express "

const app = express();
(async()=>{
    try {
      await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      app.on("erro",(error)=>{
        console.log('error',error);
        throw error;
      })
      app.listen(process.env.PORT, ()=>{
        console.log(`app is listening port ${process.env.PORT}`)
      })
    } catch (error){
        console.log('error', error);
        throw error;
    }
})()
    */