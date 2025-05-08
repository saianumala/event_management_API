import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/userModel";
import { Activity } from "../models/activityModel";
const activityZodSchema = z.object({
  title: z.string(),
  description: z.string(),
  location: z.string(),
  date: z.string().datetime(),
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

    const { title, description, location, date } = activityResult;
    const newActivity = await Activity.create({
      title,
      description,
      location,
      date,
    });
    if (!newActivity) {
      res
        .status(400)
        .json({ message: "error while creating activity. Try again" });
      return;
    }
    res.status(200).json({ message: "success", newActivity });
  } catch (error) {
    res
      .status(500)
      .json({ message: "error while creating activity. Try again" });
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
    const { title, description, location, date } = activityResult.data;

    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      { title, description, location, date },
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
    res.status(500).json({ message: "Error updating activity" });
  }
}

export async function getAllActivities(req: Request, res: Response) {
  try {
    const activities = await Activity.find();
    res
      .status(200)
      .json({ message: "Activities retrieved successfully", activities });
  } catch (error) {
    res.status(500).json({ message: "Error fetching activities" });
  }
}

export async function getActivity(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id);

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
