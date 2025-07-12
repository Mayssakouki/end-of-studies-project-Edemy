import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createCourse,
  editCourse,
  getCreatorCourses,
  getCourseById,
  createLecture,
  getCourseLecture,
  editLecture,
  removeLecture,
  getLectureById,
  togglePublishCourse,
  getPublishedCourse,
  searchCourse,
  removeCourse,
} from "../controllers/course.controller.js";
import upload from "../utils/multer.js";
import axios from "axios";
import { Course } from "../models/course.model.js";

const router = express.Router();

router.route("/search").get(isAuthenticated, searchCourse);
router.route("/").post(isAuthenticated, createCourse);
router.route("/published-courses").get(getPublishedCourse);
router.route("/").get(isAuthenticated, getCreatorCourses);
router
  .route("/:courseId")
  .put(isAuthenticated, upload.single("courseThumbnail"), editCourse);

router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router
  .route("/:courseId/lecture/:lectureId")
  .post(isAuthenticated, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);
router.route("/:courseId").delete(isAuthenticated, removeCourse);

/*router.route("/recommend/:courseId").get(isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Vérifier que le cours existe et est publié
    const course = await Course.findOne({
      _id: courseId,
      isPublished: true,
    }).populate("creator", "name avatar");
    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not published" });
    }

    // Appeler l’API Flask (sans clé API)
    const flaskResponse = await axios.get(
      `http://localhost:5002/recommend/${courseId}`
    );

    // Récupérer les IDs des cours recommandés
    const recommendedCourseIds = flaskResponse.data.map((rec) => rec.id);

    // Récupérer les données complètes des cours publiés depuis MongoDB avec population du créateur
    const recommendedCourses = await Course.find({
      _id: { $in: recommendedCourseIds },
      isPublished: true,
    })
      .select("courseTitle courseLevel coursePrice courseThumbnail creator")
      .populate("creator", "name avatar");

    // Ajouter le score de similarité aux données des cours
    const enrichedRecommendations = recommendedCourses.map((course) => {
      const flaskData = flaskResponse.data.find(
        (rec) => rec.id === course._id.toString()
      );
      return {
        ...course._doc,
        id: course._id.toString(),
        imageUrl: course.courseThumbnail, // Mapper courseThumbnail vers imageUrl
        price: course.coursePrice, // Mapper coursePrice
        instructor: course.creator, // Inclure les infos du créateur
        similarity: flaskData ? flaskData.similarity : 0,
      };
    });

    console.log("Enriched recommendations:", enrichedRecommendations);

    // Retourner les recommandations enrichies
    return res.status(200).json({
      success: true,
      recommendations: enrichedRecommendations,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
});


*/

// course.route.js
router.route("/recommend/:courseId").get(isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id; // Récupérer l'ID de l'utilisateur authentifié

    // Vérifier que le cours existe et est publié
    const course = await Course.findOne({
      _id: courseId,
      isPublished: true,
    }).populate("creator", "name avatar");
    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or not published" });
    }

    // Appeler l’API Flask avec user_id
    const flaskResponse = await axios.get(
      `http://localhost:5002/recommend/${courseId}?user_id=${userId}`
    );

    // Récupérer les IDs des cours recommandés
    const recommendedCourseIds = flaskResponse.data.map((rec) => rec.id);

    // Récupérer les données complètes des cours publiés depuis MongoDB
    const recommendedCourses = await Course.find({
      _id: { $in: recommendedCourseIds },
      isPublished: true,
    })
      .select("courseTitle courseLevel coursePrice courseThumbnail creator")
      .populate("creator", "name avatar");

    // Ajouter le score de similarité
    const enrichedRecommendations = recommendedCourses.map((course) => {
      const flaskData = flaskResponse.data.find(
        (rec) => rec.id === course._id.toString()
      );
      return {
        ...course._doc,
        id: course._id.toString(),
        imageUrl: course.courseThumbnail,
        price: course.coursePrice,
        instructor: course.creator,
        similarity: flaskData ? flaskData.similarity : 0,
      };
    });

    return res.status(200).json({
      success: true,
      recommendations: enrichedRecommendations,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
});

export default router;
