import express from "express";
import {
  createQuiz,
  getCourseQuizzes,
  getQuizById,
  getQuizResults,
  removeQuiz,
  submitQuiz,
  updateQuiz,
} from "../controllers/quiz.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Modification des endpoints pour s'aligner sur courseApi
router.post("/:courseId/quiz", isAuthenticated, createQuiz); // POST /api/v1/course/:courseId/quiz
router.get("/:courseId/quiz", isAuthenticated, getCourseQuizzes); // GET /api/v1/course/:courseId/quiz
router.get("/:courseId/quiz/:quizId", isAuthenticated, getQuizById); // New route
router.post("/quiz/:quizId/submit", isAuthenticated, submitQuiz); // Nouvelle route
router.put("/quiz/:quizId", isAuthenticated, updateQuiz);
//router.delete("/quiz/:quizId", isAuthenticated, removeQuiz); // DELETE /api/v1/course/quiz/:quizId
router.delete("/quiz/:quizId", isAuthenticated, removeQuiz);
router.get("/:courseId/quiz-results", isAuthenticated, getQuizResults);

export default router;
