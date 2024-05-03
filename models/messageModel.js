import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  group: {
    type: String,
    required: [true, "Please provide a group name!"],
  },
  user: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: [true, "Please provide your message!"],
  },
  likedBy: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
