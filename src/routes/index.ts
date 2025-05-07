import { Router } from "express";
import userRoute from "./userRoute";
import activityRoute from "./activityRoute";

const router = Router();

router.use("/user", userRoute);
router.use("/activity", activityRoute);

export default router;
