import mongoose from "mongoose";
export const todoScheme = new mongoose.Schema({
    ownerId: {
        type: String,
    },
    task: {
        type: String,
    },
    urgency: {
        type: Number,
    },
    importance: {
        type: Number,
    },
}, { timestamps: true });
const Todo = mongoose.model("Todo", todoScheme);
export default Todo;
