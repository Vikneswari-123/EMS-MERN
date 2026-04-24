import { Router } from "express"
import { protect } from "../middleware/auth";
import { clockInOut, getAttendance } from "../controllers/attendanceController.js";

const attendanceRouter = Router();

attendanceRouter.post("/", protect, clockInOut)
attendanceRouter.get("/", protect, getAttendance)

export default attendanceRouter;