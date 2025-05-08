import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/userModel";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const userCreateSchema = z.object({
  name: z.string(),
  mobileNumber: z.string(),
  email: z.string(),
  password: z.string().min(8),
});
const userUpdateSchema = userCreateSchema.partial();

export async function register(req: Request, res: Response) {
  try {
    const userCreateSchemaResponse = userCreateSchema.parse(req.body);
    if (!userCreateSchemaResponse) {
      res.status(400).json({ message: "all fields are required" });
      return;
    }
    const { name, mobileNumber, email, password } = userCreateSchemaResponse;
    const hashedPassword = await bcryptjs.hash(password, 9);
    const user = await User.create({
      email: email,
      name: name,
      mobileNumber: mobileNumber,
      password: hashedPassword,
    });
    if (!user) {
      res.status(400).json({
        message: "failed to create user, try again",
      });
      return;
    }
    res.status(200).json({ message: "success", user: user });
  } catch (error: any) {
    res.status(500).json({ message: "server error", error: error });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field?.trim() === "")) {
      res.status(400).json({ message: "all fields are required" });
      return;
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(400).json({
        message: "user not found",
      });
      return;
    }
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ message: "incorrect password" });
      return;
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.ACCESSTOKENSECRET!,
      { expiresIn: Date.now() + 86400000 }
    );

    res
      .status(200)
      .cookie("accessToken", token, {
        sameSite: "none",
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: "logged in successfully",
        user: {
          userId: user._id,
          email: user.email,
          mobileNumber: user.mobileNumber,
        },
      });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error });
    return;
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const result = userUpdateSchema.parse(req.body);

    if (!result) {
      res.status(400).json({ message: "update data not found", error: result });
      return;
    }

    const { name, mobileNumber, email, password } = result;
    console.log(result);
    const existingUser = await User.findById(req.user.userId);
    if (!existingUser) {
      res.status(400).json({ error: "User does not exist" });
      return;
    }
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, {
      email: email && email,
      name: name && name,
      mobileNumber: mobileNumber && mobileNumber,
      password: password && (await bcryptjs.hash(password, 10)),
    }).select("-password");
    if (!updatedUser) {
      res.status(400).json({ error: "Failed to update user" });
      return;
    }
    res.status(200).json({ message: "success", updatedUserData: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.userId);
    if (!deletedUser) {
      res.status(400).json({ error: "Failed to delete user" });
      return;
    }
    res.status(200).json({ message: "successfully deleted the account" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error });
    return;
  }
}

export async function logout(req: Request, res: Response) {
  res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({ message: "loggedOut successfully" });
}

export async function getUser(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password");
    res.status(200).json({
      message: "success",
      data: {
        user,
      },
    });
    return;
  } catch (error: any) {
    res.status(400).json({
      message: error.message,
      error: error,
    });
    return;
  }
}
