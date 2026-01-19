import {v2 as cloudnary} from 'cloudinary';
import  fs from 'fs';

// Configuration
cloudnary.config({ 
        cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
        api_key: process.env.CLOUDNARY_API_KEY, 
        api_secret:process.env.CLOUDNARY_API_SECRET
    });

 const uploadOnCloudnary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null
        // upload the file on cloudnary
      const response = await cloudnary.uploader.upload(localFilePath, {
            resource_type : "auto"
        } )

        console.log("file uploaded on the cloudnary !!!!!!!!", response.url);
        return response
    }catch(error){
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed.
        return null
    }
 }

 export {uploadOnCloudnary}