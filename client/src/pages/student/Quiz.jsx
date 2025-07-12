import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetQuizByIdQuery,
  useSubmitQuizMutation,
  useGetRecommendedCoursesQuery,
} from "@/features/api/courseApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Repeat } from "lucide-react";
import RecommendedCourse from "./RecommendedCourse";

const Quiz = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { data: quizData, isLoading, error } = useGetQuizByIdQuery({ courseId, quizId });
  const [submitQuiz, { isLoading: isSubmitting }] = useSubmitQuizMutation();
  const { data: recommendedCourses, refetch: refetchRecommendations } =
    useGetRecommendedCoursesQuery(courseId, { skip: !courseId });
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (quizData?.quiz) {
      setAnswers(new Array(quizData.quiz.questions.length).fill(-1));
      setIsTimerRunning(true); // Démarrer le chronomètre automatiquement
      toast.info("Chronomètre démarré automatiquement !");
    }
  }, [quizData]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && !result) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, result]);

  useEffect(() => {
    if (result && recommendedCourses?.recommendations?.length > 0) {
      setIsSheetOpen(true); // Ouvre le Sheet automatiquement après soumission
    }
  }, [result, recommendedCourses]);

  const handleAnswerChange = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      const formattedAnswers = answers
        .map((selectedOption, questionIndex) => ({
          questionIndex,
          selectedOption,
        }))
        .filter((answer) => answer.selectedOption !== -1);
      const response = await submitQuiz({ quizId, answers: formattedAnswers }).unwrap();
      setResult(response.result);
      setIsTimerRunning(false);
      toast.success("Quiz soumis avec succès");
      refetchRecommendations(); // Rafraîchir les recommandations après soumission
    } catch (error) {
      toast.error("Échec de la soumission du quiz");
      console.error(error);
    }
  };

  const handleRepassQuiz = () => {
    setAnswers(new Array(quizData.quiz.questions.length).fill(-1));
    setResult(null);
    setTimer(0);
    setIsTimerRunning(true); // Redémarrer le chronomètre automatiquement
    setIsSheetOpen(false);
    toast.info("Quiz réinitialisé ! Chronomètre redémarré.");
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (isLoading) return <div className="p-4 mt-12">Chargement du quiz...</div>;
  if (error) return <div className="p-4 mt-12">Erreur: {error.message}</div>;
  if (!quizData?.quiz) return <div className="p-4 mt-12">Quiz non trouvé</div>;

  const quiz = quizData.quiz;

  return (
    <div className="p-4 mt-20">
      <Card className={`max-w-2xl mx-auto ${result ? (result.passed ? "bg-green-100" : "bg-red-100") : ""}`}>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Minimum Score: {quiz.passingScore}% | Time Limit: {quiz.timeLimit} minutes
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Time: {formatTime(timer)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-3">
              <div className="flex justify-start">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button>Recommended Courses</Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Recommended Courses</SheetTitle>
                      <SheetDescription>
                        Explore these courses based on your recent completion.
                      </SheetDescription>
                    </SheetHeader>
                    <RecommendedCourse />
                  </SheetContent>
                </Sheet>
              </div>
              <h2 className="text-xl font-bold">Results</h2>
              <p>Score: {result.score.toFixed(2)}%</p>
              <p>Status: {result.passed ? "Passed 😊" : "Failed 😔"}</p>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => navigate(`/course-progress/${courseId}`)}>
                  Back to courses
                </Button>
                <Button variant="outline" onClick={handleRepassQuiz}>
                  <Repeat className="h-4 w-4 mr-2" />
                  Repass the quiz
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {quiz.questions.map((question, qIndex) => (
                <div key={qIndex} className="space-y-2">
                  <h3 className="font-medium">
                    Question {qIndex + 1}: {question.text}
                  </h3>
                  <div className="space-y-1">
                    {question.options.map((option, oIndex) => {
                      const optionLetter = String.fromCharCode(97 + oIndex); // 'a', 'b', ...
                      return (
                        <div key={oIndex} className="flex justify-between items-center">
                          <Label className="ml-4">{`${optionLetter}) ${option}`}</Label>
                          <Input
                            type="radio"
                            name={`question-${qIndex}`}
                            checked={answers[qIndex] === oIndex}
                            onChange={() => handleAnswerChange(qIndex, oIndex)}
                            className="ml-auto h-4 w-4"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/course-progress/${courseId}`)}
                  disabled={!isTimerRunning}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!isTimerRunning || isSubmitting}>
                  {isSubmitting ? "Soumission..." : "Soumettre le quiz"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;