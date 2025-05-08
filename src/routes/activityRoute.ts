import { Router } from "express";
import { userAuthorization } from "../middleware/userAuth";
import {
  bookActivity,
  createActivity,
  deleteActivity,
  getActivity,
  getAllActivities,
  updateActivity,
  userBookings,
} from "../controllers/activityController";

const router = Router();

router.post("/create", userAuthorization, createActivity);
router.patch("/update/:id", userAuthorization, updateActivity);
router.delete("/delete/:id", userAuthorization, deleteActivity);
router.get("/all", userAuthorization, getAllActivities);
router.get("/:id", userAuthorization, getActivity);
router.post("/book/:activityId", userAuthorization, bookActivity);
router.get("/bookings", userAuthorization, userBookings);

export default router;
