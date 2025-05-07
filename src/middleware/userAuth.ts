import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../models/userModel";

export async function userAuthorization(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const accessToken =
      req.cookies.accessToken || req.headers["authorization"]?.split(" ")[1];

    if (!accessToken) {
      throw new Error("please signin");
    }

    const verifiedToken = jwt.verify(
      accessToken,
      process.env.JWTSecretKey!
    ) as JwtPayload;
    console.log(verifiedToken);
    console.log(verifiedToken.userId);
    const user = await User.findById(verifiedToken.userId);

    if (!user) {
      throw new Error("user not found");
    }
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      mobileNumber: user.mobileNumber,
    };
    next();
  } catch (error: any) {
    return next(error);
  }
}
