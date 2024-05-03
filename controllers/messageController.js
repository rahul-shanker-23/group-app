import Group from "../models/groupModel.js";
import Message from "../models/messageModel.js";

export const create = async (req, res, next) => {
  try {
    const user = req.user.email;
    const message = req.body.message;
    const group = req.body.group;

    const validateGroup = await Group.findOne({
      name: group,
    });

    if (!validateGroup) {
      throw new Error("group not exists!");
    }

    if (!validateGroup.users.includes(user) && validateGroup.owner !== user) {
      throw new Error(`you are not member of the group ${group}!`);
    }

    const newMessage = await Message.create({
      user,
      message,
      group,
    });

    res.status(201).json({
      status: "success",
      data: {
        newMessage,
      },
    });
  } catch (err) {
    return next(new Error(err.message));
  }
};

export const getAll = async (req, res, next) => {
  try {
    const user = req.user.email;
    const group = req.params.id;
    const validateGroup = await Group.findOne({ name: group });

    // check if group exists
    if (!validateGroup) {
      throw new Error("group not exists!");
    }

    // check if user is added in the requested group
    if (
      !validateGroup.users.includes(req.user.email) &&
      validateGroup.owner !== user
    ) {
      throw new Error(`you are not member of the group ${group}`);
    }

    const message = await Message.find({
      group,
    });

    res.status(200).json({
      status: "success",
      data: {
        message,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const like = async (req, res, next) => {
  try {
    const messageId = req.body.messageId;
    const user = req.user.email;

    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error("message not found!");
    }

    const group = message.group;

    const validateGroup = await Group.findOne({ name: group });
    if (!validateGroup.users.includes(user) && validateGroup.owner !== user) {
      throw new Error(`you are not member of the group ${group}!`);
    }
    if (message.likedBy.includes(user)) {
      throw new Error("you already liked the message");
    }
    message.likedBy.push(user);
    await message.save();

    res.status(200).json({
      status: "success",
      data: {
        message,
      },
    });
  } catch (err) {
    next(new Error(err));
  }
};

export const unlike = async (req, res, next) => {
  try {
    const messageId = req.body.messageId;
    const user = req.user.email;

    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error("message not found!");
    }

    const group = message.group;

    const validateGroup = await Group.findOne({ name: group });
    if (!validateGroup.users.includes(user) && validateGroup.owner !== user) {
      throw new Error(`you are not member of the group ${group}!`);
    }

    if (!message.likedBy.includes(user)) {
      throw new Error("you haven't liked this message!");
    }
    message.likedBy = message.likedBy.filter((email) => email != user);
    await message.save();

    res.status(200).json({
      status: "success",
      data: {
        message,
      },
    });
  } catch (err) {
    next(new Error(err));
  }
};
