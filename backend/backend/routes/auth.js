import express from "express";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/token.js";

const router = express.Router();

/**
 * @route   POST /logout
 * @desc    Logout user
 * @access  Public
 */
router.post("/logout", async (req, res) => {
  try {
    // Clear the JWT cookie by setting its maxAge to 0
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route   POST /login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate and set a new JWT token for the user
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
    });
  } catch (error) {
    console.log("Error in login", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * @route   POST /signup
 * @desc    Signup user
 * @access  Public
 */
router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    const {email, picture:profilePic, given_name, family_name, username, email_verified } = data;
    const fullName = `${given_name} ${family_name}`;

    const user = await User.findOne({ email });
    if (user) {
      // res.status(201).json({ message: "Username already exists" });
      generateToken(user._id, res);
      return res.status(200).json({
        _id: user._id,
        email: user.email,
        fullName,
        profilePic,
        username,
        email_verified,
      });
    }

    const newUser = new User({email, fullName, profilePic, username, email_verified});

    if (newUser) {
      // Generate and set a new JWT token for the new user
      generateToken(newUser._id, res);

      await newUser.save();
      res.status(201).json(newUser);
    } else {
      res.status(400).json({ error: "User data is invalid" });
    }
  } catch (error) {
    console.log("Error in Signup", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
