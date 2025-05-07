import express from "express";

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        mobileNumber: string;
        email: string;
      };
    }
  }
}
