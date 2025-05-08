import { Router } from "express";
import { userAuthorization } from "../middleware/userAuth";
import {
  createActivity,
  deleteActivity,
  getActivity,
  getAllActivities,
  updateActivity,
} from "../controllers/activityController";

const router = Router();

router.post("/create", userAuthorization, createActivity);
router.patch("/update/:id", userAuthorization, updateActivity);
router.delete("/delete/:id", userAuthorization, deleteActivity);
router.get("/all", userAuthorization, getAllActivities);
router.get("/:id", userAuthorization, getActivity);

export default router;
