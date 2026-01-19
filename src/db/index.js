import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

 const connectDB = async () =>{
    try { 
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`Mongodb connected !!!!!!  ${connectionInstance.connection.host}`)// where is hosting means where is connectiong dev or prod etc
        
    }catch(error){
        console.log('Mongodb connection error', error)
        process.exit(1);
    }
}
export default connectDB;