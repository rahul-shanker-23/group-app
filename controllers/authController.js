import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "./../models/userModel.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // cookie cannot be accessed or modified in any way by the browser
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    res.status(201).json({
      status: "success",
      message: "user successfully created",
      data: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    if (err.code == 11000) {
      err = new Error("User already Exists!");
    }
    return next(new Error(err));
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const email = req.body.email;
    const data = req.body.data;

    // remove email and password from updating
    if (data) {
      delete data.email;
      delete data.password;
    }

    const newUser = await User.findOneAndUpdate(
      {
        email,
      },
      data,
      { new: true }
    );

    if (!newUser) {
      throw new Error("user not exits!");
    }

    res.status(200).json({
      status: "success",
      data: {
        newUser,
      },
    });
  } catch (err) {
    return next(new Error(err));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new Error("Please provide email and password!", 400));
    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new Error("Incorrect email or password"));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, req, res);
  } catch (err) {
    return next(new Error(err.message));
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: "success" });
  } catch (err) {
    return next(new Error(err.message));
  }
};

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new Error("You are not logged in! Please log in to get access.", 401)
      );
    }

    // Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new Error("The user belonging to this token does no longer exist!", 401)
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    return next(err);
  }
};

export const restrictTo = (role) => {
  return (req, res, next) => {
    if (role != req.user.role) {
      return next(
        new Error("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};
