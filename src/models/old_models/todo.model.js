import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    content : {
        type: String,
        requierd: true
    },
    complete: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subTodos: [
        {
        type:mongoose.Schema.Types.ObjectId,
        ref: "SubTodo"
    }
    ]
},{
    timeStamps: true
}
)

export const todo = mongoose.model('Todo', todoSchema)