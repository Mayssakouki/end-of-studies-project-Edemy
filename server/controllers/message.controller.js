import { Message } from "../models/message.model.js";
import { Course } from "../models/course.model.js";

// Envoyer un message
export const sendMessage = async (req, res) => {
  try {
    const courseId = req.params.courseId; // Use req.params
    const { content } = req.body; // Only content in body
    const senderId = req.id;
    console.log("Received data:", { courseId, content, senderId }); // Log for debugging

    if (!courseId || !content) {
      return res
        .status(400)
        .json({ message: "Course ID and content are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const message = await Message.create({
      courseId,
      senderId,
      recipientId: course.creator,
      content,
    });

    // Populate senderId and recipientId in the response
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name photoURL")
      .populate("recipientId", "name photoURL");

    return res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.log("Server error:", error);
    return res.status(500).json({ message: "Failed to send message" });
  }
};

// Récupérer les messages pour un cours (pour étudiant ou enseignant)
export const getMessages = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id; // Utilisateur authentifié (étudiant ou enseignant)

    // Vérifier que le cours existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Récupérer les messages où l'utilisateur est soit l'expéditeur, soit le destinataire
    const messages = await Message.find({
      courseId,
      $or: [{ senderId: userId }, { recipientId: userId }],
    })
      .populate("senderId", "name photoURL") // Include photoURL for sender
      .populate("recipientId", "name photoURL"); // Include photoURL for recipient

    return res.status(200).json({
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to retrieve messages" });
  }
};

// Marquer un message comme lu
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Vérifier que l'utilisateur est le destinataire
    if (message.recipientId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to mark this message as read" });
    }

    message.isRead = true;
    await message.save();

    return res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to mark message as read" });
  }
};

// Modifier un message
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.id;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Vérifier que l'utilisateur est l'expéditeur
    if (message.senderId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this message" });
    }

    message.content = content;
    message.updatedAt = Date.now(); // Update timestamp
    await message.save();

    // Populate senderId and recipientId in the response
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name photoURL")
      .populate("recipientId", "name photoURL");

    return res.status(200).json({
      message: "Message updated successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to update message" });
  }
};

// Supprimer un message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Vérifier que l'utilisateur est l'expéditeur
    if (message.senderId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this message" });
    }

    await Message.findByIdAndDelete(messageId);

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to delete message" });
  }
};
