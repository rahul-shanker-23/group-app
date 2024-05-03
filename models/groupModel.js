import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "Please provide a group name!"],
  },
  owner: {
    type: String,
    required: true,
  },
  users: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Group = mongoose.model("Group", groupSchema);

export default Group;
