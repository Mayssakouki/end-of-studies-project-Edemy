import { Quiz } from "../models/quiz.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { QuizResult } from "../models/quizResult.model.js";

// Créer un quiz (identique au style createCourse)
export const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, questions, passingScore, timeLimit } = req.body;

    // Validation minimale comme dans createCourse
    if (!title || !questions?.length) {
      return res.status(400).json({
        message: "Le titre et au moins une question sont requis",
      });
    }

    // Vérifier que le cours existe et appartient à l'utilisateur
    const course = await Course.findOne({
      _id: courseId,
      creator: req.id,
    });

    if (!course) {
      return res.status(403).json({
        message: "Action non autorisée",
      });
    }

    // Création comme dans createLecture
    const quiz = await Quiz.create({
      title,
      course: courseId,
      questions,
      passingScore: passingScore || 70,
      timeLimit: timeLimit || 30,
    });

    // Lier au cours comme pour les lectures
    course.quizzes.push(quiz._id);
    await course.save();

    return res.status(201).json({
      message: "Quiz créé avec succès",
      quiz,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Échec de la création du quiz",
    });
  }
};

// Obtenir tous les quizs d'un cours (comme getCourseLecture)
export const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findOne({
      _id: courseId,
      creator: userId,
    }).populate({
      path: "quizzes",
      select: "title passingScore timeLimit questions",
    });

    if (!course) {
      return res.status(403).json({
        message: "Action non autorisée",
      });
    }

    console.log("Quizzes found for course", courseId, ":", course.quizzes);

    return res.status(200).json({
      quizzes: course.quizzes,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Échec de la récupération des quiz",
    });
  }
};
// Supprimer un quiz (comme removeLecture)
export const removeQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByIdAndDelete(quizId);

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz non trouvé",
      });
    }

    // Retirer le quiz du cours comme pour removeLecture
    await Course.updateOne({ quizzes: quizId }, { $pull: { quizzes: quizId } });

    return res.status(200).json({
      message: "Quiz supprimé avec succès",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Échec de la suppression du quiz",
    });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const userId = req.id;
    if (!courseId || !quizId) {
      return res
        .status(400)
        .json({ message: "Course ID or Quiz ID is missing" });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const isCreator = course.creator.toString() === userId;
    const isEnrolled = course.enrolledStudents.includes(userId);
    if (!isCreator && !isEnrolled) {
      return res.status(403).json({
        message:
          "Unauthorized: You are not the creator or enrolled in this course",
      });
    }
    const quiz = await Quiz.findOne({ _id: quizId, course: courseId });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    return res.status(200).json({ quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return res.status(500).json({ message: "Failed to fetch quiz" });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.id;
    const quizData = req.body;

    // Validate input
    if (!quizData.title || !quizData.questions?.length) {
      return res.status(400).json({
        message: "Quiz title and at least one question are required",
      });
    }

    // Check if quiz exists and user is authorized
    const quiz = await Quiz.findOne({
      _id: quizId,
    });
    const course = await Course.findOne({
      _id: quiz.course,
      creator: userId,
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }
    if (!course) {
      return res.status(403).json({
        message: "Unauthorized: You are not the creator of this course",
      });
    }

    // Update quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      { $set: quizData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return res.status(500).json({
      message: "Failed to update quiz",
      error: error.message,
    });
  }
};

// Soumettre un quiz
/*export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.id;
    const { answers } = req.body; // answers: [{ questionIndex, selectedOption }]

    const quiz = await Quiz.findById(quizId).populate("course");
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz non trouvé",
      });
    }

    // Vérifier si l'étudiant est inscrit au cours
    const purchase = await CoursePurchase.findOne({
      userId,
      courseId: quiz.course._id,
      status: "completed",
    });

    if (!purchase) {
      return res.status(403).json({
        message: "Vous devez être inscrit au cours pour soumettre ce quiz",
      });
    }

    // Calculer le score
    let score = 0;
    answers.forEach((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (question && answer.selectedOption === question.correctAnswer) {
        score += question.points;
      }
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const scorePercentage = (score / totalPoints) * 100;
    const passed = scorePercentage >= quiz.passingScore;

    // Enregistrer le résultat
    const quizResult = await QuizResult.create({
      userId,
      quizId,
      courseId: quiz.course._id,
      answers,
      score: scorePercentage,
      passed,
    });

    return res.status(200).json({
      message: "Quiz soumis avec succès",
      result: {
        score: scorePercentage,
        passed,
        totalPoints,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Échec de la soumission du quiz",
    });
  }
};*/

// quiz.controller.js
export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.id;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId).populate("course");
    if (!quiz) {
      return res.status(404).json({
        message: "Quiz non trouvé",
      });
    }

    const purchase = await CoursePurchase.findOne({
      userId,
      courseId: quiz.course._id,
      status: "completed",
    });

    if (!purchase) {
      return res.status(403).json({
        message: "Vous devez être inscrit au cours pour soumettre ce quiz",
      });
    }

    let score = 0;
    answers.forEach((answer) => {
      const question = quiz.questions[answer.questionIndex];
      if (question && answer.selectedOption === question.correctAnswer) {
        score += question.points;
      }
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const scorePercentage = (score / totalPoints) * 100;
    const passed = scorePercentage >= quiz.passingScore;

    const quizResult = await QuizResult.create({
      userId,
      quizId,
      courseId: quiz.course._id,
      category: quiz.course.category, // Ajouter la catégorie du cours
      answers,
      score: scorePercentage,
      passed,
    });

    return res.status(200).json({
      message: "Quiz soumis avec succès",
      result: {
        score: scorePercentage,
        passed,
        totalPoints,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Échec de la soumission du quiz",
    });
  }
};

export const getQuizResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Check if user is enrolled
    const purchase = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed",
    });
    if (!purchase) {
      return res.status(403).json({
        message: "You are not enrolled in this course",
      });
    }

    // Fetch quiz results
    const quizResults = await QuizResult.find({
      courseId,
      userId,
    }).populate({
      path: "quizId",
      select: "title",
    });

    return res.status(200).json({
      quizResults,
    });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return res.status(500).json({
      message: "Failed to fetch quiz results",
    });
  }
};
