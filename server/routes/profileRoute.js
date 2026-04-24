import { Router } from "express";
import { protect } from "../middleware/auth";
import { getProfile, updateProfile } from "../controllers/profileController";


const profileRouter = Router();

profileRouter.get("/",protect, getProfile);
profileRouter.post("/", protect, updateProfile)

export default profileRouter;