import Group from "./../models/groupModel.js";
import User from "./../models/userModel.js";

export const getOne = async (req, res, next) => {
  try {
    const groupName = req.params.id;
    const group = await Group.findOne({
      name: groupName,
    });

    if (!group) {
      throw new Error("group not exists!");
    }
    res.status(200).json({
      status: "success",
      data: {
        group,
      },
    });
  } catch (err) {
    return next(new Error(err.message));
  }
};

export const getAll = async (req, res, next) => {
  try {
    const group = await Group.find();
    res.status(200).json({
      status: "success",
      data: {
        group,
      },
    });
  } catch (err) {
    return next(new Error(err.message));
  }
};

export const create = async (req, res, next) => {
  try {
    const group = await Group.create({
      name: req.body.name,
      owner: req.user.email,
    });
    res.status(201).json({
      status: "success",
      data: {
        group,
      },
    });
  } catch (err) {
    return next(new Error(err.message));
  }
};

export const deleteOne = async (req, res, next) => {
  try {
    const groupName = req.params.id;
    const group = await Group.deleteOne({
      name: groupName,
    });

    if (group.deletedCount === 0) {
      throw new Error("group not exists!");
    }
    res.status(204).json({
      status: "success",
      message: "deleted successfully",
      data: {
        group,
      },
    });
  } catch (err) {
    return next(new Error(err.message));
  }
};

export const addUser = async (req, res, next) => {
  try {
    const name = req.body.group;
    const user = req.body.email;
    const group = await Group.findOne({
      name,
    });

    if (!group) {
      throw new Error("group not exists!");
    }

    if (group.owner != req.user.email) {
      throw new Error("you are not the owner of the group!");
    }

    if (group.users.includes(user)) {
      throw new Error("user already exits!");
    }

    const checkUser = await User.findOne({ email: user });

    if (!checkUser) {
      throw new Error("user not exists!");
    }
    group.users.push(user);
    await group.save();

    res.status(201).json({
      status: "success",
      data: {
        group,
      },
    });
  } catch (err) {
    return next(new Error(err.message));
  }
};
