import User from "../models/userModel.js";

export const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (err) {
    return next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const name = req.params.id;
    const user = await User.find({ name });
    if (!user) {
      throw new Error("user doesn't exists!");
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    return next(err);
  }
};
