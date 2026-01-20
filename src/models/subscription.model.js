import mongoose,{Schema} from "mongoose";
const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // One Who subscribing
        ref: "User"
    },
    channer:{
        type: Schema.Types.ObjectId,// Subscriber is subscribing
        ref: "User"
    }
},
{
    timestamps: true
}
)

export const subscription = mongoose.model('Subscription', subscriptionSchema)