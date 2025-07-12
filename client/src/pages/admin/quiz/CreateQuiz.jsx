import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCreateQuizMutation } from "@/features/api/courseApi";
import { toast } from "sonner";
import { QuizForm } from "./QuizForm";

const CreateQuiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [createQuiz, { isLoading }] = useCreateQuizMutation();

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

  const handleSubmit = async () => {
    try {
      console.log("courseId:", courseId);
  console.log("quizData:", quiz);
      await createQuiz({ courseId, quizData: quiz }).unwrap();
      toast.success("Quiz created successfully");
      navigate(`/admin/course/${courseId}/quiz`); // Redirect to quiz list page
    } catch (error) {
      toast.error("Failed to create quiz");
      console.error(error);
    }
  };

  return (
    <div className="pt-2 px-6 pb-6">
    <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
      <QuizForm
        quiz={quiz}
        setQuiz={setQuiz}
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
      />
    </div>
  );
};

export default CreateQuiz;