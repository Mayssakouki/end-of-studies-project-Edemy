import express from "express";
import {
  register,
  login,
  getUserProfile,
  logout,
  updateProfile,
  getAllInstructors,
  updateUserApproval,
  toggleFavoriteCourse,
  getFavoriteCourses,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router
  .route("/profile/update")
  .put(isAuthenticated, upload.single("profilePhoto"), updateProfile);
router.get("/instructors", isAuthenticated, getAllInstructors);
//router.put("/instructor/:id/approve", isAuthenticated, approveInstructor);
//router.put("/instructor/:id/disapprove", isAuthenticated, disapproveInstructor);
router.patch("/:id/approval", updateUserApproval);
// Nouvelles routes pour les favoris
router.route("/favorite/:courseId").post(isAuthenticated, toggleFavoriteCourse);
router.route("/favorites").get(isAuthenticated, getFavoriteCourses);

export default router;
