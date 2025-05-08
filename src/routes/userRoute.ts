import { Router } from "express";
import { userAuthorization } from "../middleware/userAuth";
import {
  register,
  deleteUser,
  getUser,
  login,
  logout,
  updateUser,
} from "../controllers/userController";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", userAuthorization, logout);
router.patch("/update", userAuthorization, updateUser);
router.delete("/delete", userAuthorization, deleteUser);
router.get("/:id", getUser);

export default router;
