import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../error.js";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  sameSite: "none",
  secure: isProduction,
};

// Sign Up
export const signup = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({ ...req.body, password: hash });

    await newUser.save();

    res.status(200).send("User has been created");
  } catch (err) {
    next(err);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: { password: hash },
      },
      { new: true }
    );

    res.status(200).send("Password has been changed");
  } catch (err) {
    next(err);
  }
};

// Sign in
export const signin = async (req, res, next) => {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (!user) return next(createError(404, "User not found"));

    const isCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isCorrect) return next(createError(404, "Wrong credentials"));

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "7d",
    });

    const { password, ...others } = user._doc;

    // Set the access token as an HTTP-only cookie
    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: 1 * 60 * 60 * 1000,
      domain: isProduction ? "tubeland-eu-api.onrender.com" : "localhost",
    });

    // Set the refresh token as an HTTP-only cookie
    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: isProduction ? "tubeland-eu-api.onrender.com" : "localhost",
    });

    res.status(200).json(others);
  } catch (err) {
    next(err);
  }
};

// Google sign in
export const googleAuth = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const accessToken = jwt.sign({ id: user._id }, process.env.JWT, {
        expiresIn: "1h",
      });

      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT, {
        expiresIn: "7d",
      });

      // Set the access token as an HTTP-only cookie
      res.cookie("access_token", accessToken, {
        ...cookieOptions,
        maxAge: 1 * 60 * 60 * 1000,
        domain: isProduction ? "tubeland-eu-api.onrender.com" : "localhost",
      });

      // Set the refresh token as an HTTP-only cookie
      res.cookie("refresh_token", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: isProduction ? "tubeland-eu-api.onrender.com" : "localhost",
      });

      res.status(200).json(user._doc);
    } else {
      const newUser = new User({
        ...req.body,
        fromGoogle: true,
      });
      const savedUser = await newUser.save();

      const accessToken = jwt.sign({ id: user._id }, process.env.JWT, {
        expiresIn: "1m",
      });

      const refreshToken = jwt.sign({ id: user._id }, process.env.JWT, {
        expiresIn: "7d",
      });

      // Set the access token as an HTTP-only cookie
      res.cookie("access_token", accessToken, {
        ...cookieOptions,
        maxAge: 1 * 60 * 60 * 1000,
        domain: isProduction ? "tubeland-eu-api.onrender.com" : "localhost",
      });

      // Set the refresh token as an HTTP-only cookie
      res.cookie("refresh_token", refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: isProduction ? "tubeland-eu-api.onrender.com" : "localhost",
      });

      res.status(200).json(savedUser._doc);
    }
  } catch (err) {
    console.error(err.message);
    next(err);
  }
};

// Log out
export const logout = async (req, res, next) => {
  try {
    res
      .clearCookie("access_token", {
        ...cookieOptions,
        domain: isProduction ? "tubeland-eu-api.onrender.com" : "localhost",
      })
      .clearCookie("refresh_token", {
        ...cookieOptions,
        domain: isProduction ? "tubeland-eu-api.onrender.com" : "localhost",
      })
      .status(200)
      .send("Cookie cleared");
  } catch (error) {
    next(error);
  }
};
