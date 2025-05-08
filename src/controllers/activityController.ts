import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/userModel";
import { Activity } from "../models/activityModel";
import { Booking } from "../models/bookingModel";
import mongoose from "mongoose";

const activityZodSchema = z.object({
  title: z.string(),
  description: z.string(),
  seats: z.number().min(1),
  location: z.string(),
  date: z.string().datetime(),
  activityType: z.enum(["free", "paid"]),
  price: z.number().optional(),
});
const updateActivityZodSchema = activityZodSchema.partial();
export async function createActivity(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(400).json({ message: "user not found" });
      return;
    }
    if (user.role !== "organizer") {
      res.status(400).json({ message: "Not Authorized to create activity" });
      return;
    }
    const activityResult = activityZodSchema.parse(req.body);
    if (!activityResult) {
      res.status(400).json({ message: "all fields are required" });
      return;
    }

    const { title, description, seats, location, date, price, activityType } =
      activityResult;
    const newActivity = await Activity.create({
      title,
      organizer: req.user.userId,
      description,
      totalSeats: seats,
      activityType,
      availableSeats: seats,
      location,
      date,
      price: price,
    });
    if (!newActivity) {
      res
        .status(400)
        .json({ message: "error while creating activity. Try again" });
      return;
    }
    res.status(200).json({ message: "success", newActivity });
  } catch (error) {
    res.status(500).json({
      message: "error while creating activity. Try again",
      error: error,
    });
    return;
  }
}

export async function updateActivity(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    if (user.role !== "organizer") {
      res.status(403).json({ message: "Not authorized to update activity" });
      return;
    }

    const activityResult = updateActivityZodSchema.safeParse(req.body);
    if (!activityResult.success) {
      res
        .status(400)
        .json({ message: "Invalid data format", error: activityResult.error });
      return;
    }

    const { id } = req.params;
    const { title, description, seats, location, date, price, activityType } =
      activityResult.data;

    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      { title, description, seats, location, date, price, activityType },
      { new: true }
    );

    if (!updatedActivity) {
      res.status(404).json({ message: "Activity not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Activity updated successfully", updatedActivity });
  } catch (error) {
    res.status(500).json({ message: "Error updating activity", error: error });
  }
}

export async function getAllActivities(req: Request, res: Response) {
  try {
    const activities = await Activity.find().populate("organizer", "-password");
    res
      .status(200)
      .json({ message: "Activities retrieved successfully", activities });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching activities", error: error });
  }
}

export async function getActivity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id).populate(
      "organizer",
      "-password"
    );

    if (!activity) {
      res.status(404).json({ message: "Activity not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Activity retrieved successfully", activity });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving activity" });
  }
}

export async function deleteActivity(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    if (user.role !== "organizer") {
      res.status(403).json({ message: "Not authorized to delete activity" });
      return;
    }

    const { id } = req.params;
    const deletedActivity = await Activity.findByIdAndDelete(id);

    if (!deletedActivity) {
      res.status(404).json({ message: "Activity not found" });
      return;
    }

    res.status(200).json({ message: "Activity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting activity" });
  }
}

export async function bookActivity(req: Request, res: Response) {
  const { activityId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const activity = await Activity.findById(activityId).session(session);
    if (!activity) {
      res.status(404).json({ message: "Activity not found" });
      return;
    }
    if (new Date(activity.date) < new Date()) {
      res.status(400).json({ message: "Cannot book past activities" });
      return;
    }
    if (
      Number.isFinite(activity.availableSeats) &&
      activity.availableSeats! <= 0
    ) {
      res.status(400).json({ message: "No seats available" });
      return;
    }
    const existingBooking = await Booking.findOne({
      bookingUser: req.user.userId,
      activity: activity._id,
    });
    if (existingBooking) {
      res
        .status(400)
        .json({ message: "You have already booked this activity" });
      return;
    }
    if (activity.activityType === "paid") {
      // Handle payment gateway
      // If payment fails, throw an error to rollback
    }
    const newBooking = await Booking.create(
      [
        {
          activity: activity._id,
          bookingUser: req.user.userId,
          paymentStatus: "paid",
          bookingStatus: "confirmed",
        },
      ],
      { session }
    );
    activity.availableSeats =
      (activity.availableSeats || activity.totalSeats) - 1;
    await activity.save({ session });
    await session.commitTransaction();
    res.status(201).json({ message: "Booking successful", newBooking });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: "Error during booking", error: error });
  } finally {
    session.endSession();
  }
}

export async function userBookings(req: Request, res: Response) {
  try {
    const bookings = await Booking.find({ bookingUser: req.user.userId })
      .populate("activity", "title date location activityType price")
      .populate("bookingUser", "name email");
    res
      .status(200)
      .json({ message: "User bookings retrieved successfully", bookings });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving bookings", error });
  }
}
