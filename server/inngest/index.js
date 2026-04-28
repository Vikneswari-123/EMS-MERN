import { Inngest } from "inngest";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";
import sendEmail from "../config/nodemailer.js";

export const inngest = new Inngest({ id: "emp_mgmt" });

// ── Auto checkout ─────────────────────────────────────────────────────────
const autoCheckOut = inngest.createFunction(
  { id: "auto-check-out", triggers: [{ event: "employee/check-out" }] },
  async ({ event, step }) => {
    const { employeeId, attendanceId } = event.data;

    await step.sleepUntil(
      "wait-for-9-hours",
      new Date(Date.now() + 9 * 60 * 60 * 1000)
    );

    let attendance = await step.run("check-attendance", async () => {
      return await Attendance.findById(attendanceId).lean();
    });

    if (!attendance?.checkOut) {
      await step.run("send-reminder-email", async () => {
        const employee = await Employee.findById(employeeId);
        await sendEmail({
          to: employee.email,
          subject: "Attendance Check-Out Reminder",
          body: `<div style="max-width:600px;">
            <h2>Hi ${employee.firstName}, 👋</h2>
            <p>You checked in at ${new Date(attendance.checkIn).toLocaleTimeString()}.</p>
            <p>Please check out within the next hour.</p>
            <p>Best Regards, EMS</p>
          </div>`,
        });
      });

      await step.sleepUntil(
        "wait-for-1-more-hour",
        new Date(Date.now() + 1 * 60 * 60 * 1000)
      );

      await step.run("auto-checkout", async () => {
        const att = await Attendance.findById(attendanceId);
        if (!att?.checkOut) {
          att.checkOut = new Date(
            new Date(att.checkIn).getTime() + 4 * 60 * 60 * 1000
          );
          att.workingHours = 4;
          att.dayType = "Half Day";
          att.status = "LATE";
          await att.save();
        }
      });
    }
  }
);

// ── Leave application reminder ─────────────────────────────────────────────
const leaveApplicationReminder = inngest.createFunction(
  { id: "leave-application-reminder", triggers: [{ event: "leave/pending" }] },
  async ({ event, step }) => {
    const { leaveApplicationId } = event.data;

    await step.sleepUntil(
      "wait-24-hours",
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );

    await step.run("send-admin-reminder", async () => {
      const leaveApplication = await LeaveApplication.findById(leaveApplicationId);
      if (leaveApplication?.status === "PENDING") {
        const employee = await Employee.findById(leaveApplication.employeeId);
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "Leave Application Reminder",
          body: `<div style="max-width:600px;">
            <h2>Hi Admin, 👋</h2>
            <p>A leave application from ${employee?.firstName} is still pending.</p>
            <p>Start date: ${leaveApplication.startDate?.toLocaleDateString()}</p>
            <p>Please take action.</p>
            <p>Best Regards, EMS</p>
          </div>`,
        });
      }
    });
  }
);

// ── Attendance reminder cron (11:30 AM IST daily) ─────────────────────────
const attendanceReminderCron = inngest.createFunction(
  { id: "attendance-reminder-cron", triggers: [{ cron: "TZ=Asia/Kolkata 30 11 * * *" }] },
  async ({ step }) => {
    // Step 1: Get today's date range
    const today = await step.run("get-today-date", () => {
      const startUTC = new Date(
        new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) +
          "T00:00:00+05:30"
      );
      const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
      return { startUTC: startUTC.toISOString(), endUTC: endUTC.toISOString() };
    });

    // Step 2: Get all active employees
    const activeEmployees = await step.run("get-active-employees", async () => {
      const employees = await Employee.find({
        isDeleted: false,
        employmentStatus: "ACTIVE",
      }).lean();
      return employees.map((e) => ({
        _id: e._id.toString(),
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        department: e.department,
      }));
    });

    // Step 3: Get employees on approved leave today
    const onLeaveIds = await step.run("get-on-leave-ids", async () => {
      const leaves = await LeaveApplication.find({
        status: "APPROVED",
        startDate: { $lte: new Date(today.endUTC) },
        endDate: { $gte: new Date(today.startUTC) },
      }).lean();
      return leaves.map((l) => l.employeeId.toString());
    });

    // Step 4: Get employees who checked in today
    const checkedInIds = await step.run("get-checked-in-ids", async () => {
      const attendances = await Attendance.find({
        date: {
          $gte: new Date(today.startUTC),
          $lt: new Date(today.endUTC),
        },
      }).lean();
      return attendances.map((a) => a.employeeId.toString());
    });

    // Step 5: Filter absent employees
    const absentEmployees = activeEmployees.filter(
      (emp) =>
        !onLeaveIds.includes(emp._id) && // ← fixed: includes not include
        !checkedInIds.includes(emp._id)
    );

    // Step 6: Send reminder emails
    if (absentEmployees.length > 0) {
      await step.run("send-reminder-emails", async () => {
        await Promise.all(
          absentEmployees.map((emp) =>
            sendEmail({
              to: emp.email,
              subject: "Attendance Reminder - Please Mark Your Attendance",
              body: `<div style="max-width:600px; font-family:Arial,sans-serif;">
                <h2>Hi ${emp.firstName}, 👋</h2>
                <p>We noticed you haven't marked your attendance yet today.</p>
                <p>The deadline was <strong>11:30 AM</strong>.</p>
                <p>Department: ${emp.department}</p>
                <p>Best Regards, QuickEMS</p>
              </div>`,
            })
          )
        );
      });
    }
    await Promise.all(emailPromises)

    return {
      totalActive: activeEmployees.length,
      onLeave: onLeaveIds.length,
      checkedIn: checkedInIds.length,
      absent: absentEmployees.length,
    };
  }
);

export const functions = [
  autoCheckOut,
  leaveApplicationReminder,
  attendanceReminderCron,
];