import mongoose from mongoose;

const userSchema = new mongoose.schema({
    username:{
        type:String,
        required: true,
        unqiue: true,
        lowercase:true,
        index:true
    },
    email: {
        type: String,
        required:true,
        unique: true,
        lowercase: true
    },
    passwored: {
        type: String,
        required: [ true, "Password is required"]
    },
},
{
    timestamps: true,
}
);

export const User = mongoose.mode('User', userSchema)