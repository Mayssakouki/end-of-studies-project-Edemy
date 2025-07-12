import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // L'étudiant qui envoie le message
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // L'enseignant qui reçoit le message
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false, // Indique si le message a été lu par l'enseignant
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
