import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Course } from "../models/course.model.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    return res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to register" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect email or password" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect email or password" });
    }
    console.log("Sending response with message:", `Welcome back ${user.name}`);
    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Failed to login" });
  }
};

export const logout = async (_, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate("enrolledCourses");
    //.lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    let courses = await CoursePurchase.find({ userId: userId });

    let courseIds = courses.map((course) => course.courseId);
    let enrolledCourses = await Course.find({ _id: { $in: courseIds } });
    user.enrolledCourses = enrolledCourses;
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load user " });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    // extract public id of the old image from the url is it exists;
    if (user.photoURL) {
      const publicId = user.photoURL.split("/").pop().split(".")[0]; // extract public id
      deleteMediaFromCloudinary(publicId);
    }

    // upload new photo
    const cloudResponse = await uploadMedia(profilePhoto.path);
    const photoURL = cloudResponse.secure_url;

    const updatedData = { name, photoURL };
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// Approuver un instructeur
/*export const approveInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    ).select("-password");

    if (!updatedUser || updatedUser.role !== "instructor") {
      return res
        .status(404)
        .json({ success: false, message: "Instructor not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Instructor approved",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to approve instructor" });
  }
};

// Désapprouver un instructeur
export const disapproveInstructor = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isApproved: false },
      { new: true }
    ).select("-password");

    if (!updatedUser || updatedUser.role !== "instructor") {
      return res
        .status(404)
        .json({ success: false, message: "Instructor not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Instructor disapproved",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to disapprove instructor" });
  }
};*/
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: "instructor" }); // ou ta propre logique
    res.status(200).json(instructors);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Dans votre contrôleur d'instructeurs
// Dans controllers/userController.js
export const updateUserApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    // Vérifier que l'utilisateur existe et est un instructeur
    const user = await User.findById(id);
    if (!user || user.role !== "instructor") {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // Mettre à jour le statut
    user.approvalStatus = approvalStatus;
    await user.save();

    res.json({
      success: true,
      message: "Approval status updated",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleFavoriteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Vérifier si le cours est déjà dans les favoris
    const isFavorited = user.favoriteCourses.includes(courseId);

    if (isFavorited) {
      // Retirer des favoris
      user.favoriteCourses = user.favoriteCourses.filter(
        (id) => id.toString() !== courseId
      );
      await user.save();
      return res.status(200).json({ message: "Course removed from favorites" });
    } else {
      // Ajouter aux favoris
      user.favoriteCourses.push(courseId);
      await user.save();
      return res.status(200).json({ message: "Course added to favorites" });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to toggle favorite course" });
  }
};

// Récupérer les cours favoris
export const getFavoriteCourses = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).populate({
      path: "favoriteCourses",
      select: "courseTitle courseLevel coursePrice courseThumbnail creator",
      populate: { path: "creator", select: "name photoURL" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      favoriteCourses: user.favoriteCourses,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to fetch favorite courses" });
  }
};
