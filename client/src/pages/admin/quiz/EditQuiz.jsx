import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetQuizByIdQuery,
  useUpdateQuizMutation,
} from "@/features/api/courseApi";
import { toast } from "sonner";
import { QuizForm } from "./QuizForm";

const EditQuiz = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { data: quizData, isLoading: isFetching, error: fetchError,refetch } = useGetQuizByIdQuery({
    courseId,
    quizId,
  });
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();

  const [quiz, setQuiz] = useState({
    title: "",
    passingScore: 70,
    timeLimit: 30,
    questions: [
      {
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        points: 1,
      },
    ],
  });
  // Forcer un refetch au montage du composant
  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (quizData?.quiz) {
      setQuiz({
        title: quizData.quiz.title || "",
        passingScore: quizData.quiz.passingScore || 70,
        timeLimit: quizData.quiz.timeLimit || 30,
        questions: quizData.quiz.questions?.length > 0
          ? quizData.quiz.questions.map((q) => ({
              text: q.text || "",
              options: q.options || ["", "", "", ""],
              correctAnswer: q.correctAnswer || 0,
              points: q.points || 1,
            }))
          : [
              {
                text: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
                points: 1,
              },
            ],
      });
    }
  }, [quizData]);

  const handleSubmit = async () => {
    try {
      // Validate quiz data before submission
      if (!quiz.title || !quiz.questions?.length) {
        toast.error("Quiz title and at least one question are required");
        return;
      }
      for (const question of quiz.questions) {
        if (!question.text || !question.options.every((opt) => opt.trim())) {
          toast.error("All questions must have text and valid options");
          return;
        }
        if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
          toast.error("Invalid correct answer index");
          return;
        }
      }

      await updateQuiz({ courseId, quizId, quizData: quiz }).unwrap();
      toast.success("Quiz updated successfully");
      navigate(`/admin/course/${courseId}/quiz`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update quiz");
      console.error(error);
    }
  };

  if (isFetching) return <div className="p-6">Loading quiz...</div>;
  if (fetchError) return <div className="p-6">Error: {fetchError.message || "Failed to load quiz"}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Quiz</h1>
      <QuizForm
        quiz={quiz}
        setQuiz={setQuiz}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />
    </div>
  );
};

export default EditQuiz;