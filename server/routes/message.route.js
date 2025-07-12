import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  sendMessage,
  getMessages,
  markMessageAsRead,
  editMessage,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.route("/:courseId").post(isAuthenticated, sendMessage);
router.route("/:courseId").get(isAuthenticated, getMessages);
router.route("/read/:messageId").patch(isAuthenticated, markMessageAsRead);
router.route("/:messageId").put(isAuthenticated, editMessage); // New route for editing
router.route("/:messageId").delete(isAuthenticated, deleteMessage); // New route for deleting

export default router;
