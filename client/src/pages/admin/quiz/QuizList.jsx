import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetCourseQuizzesQuery, useRemoveQuizMutation } from "@/features/api/courseApi";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Delete } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const QuizList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useGetCourseQuizzesQuery(courseId);
  const [removeQuiz, { isLoading: isRemoving }] = useRemoveQuizMutation();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // Log pour déboguer les données reçues
  console.log("QuizList data:", data);

  // Forcer un refetch au montage pour s'assurer que les données sont à jour
  useEffect(() => {
    refetch();
  }, [courseId, refetch]);

  const handleRemoveQuiz = async () => {
    try {
      await removeQuiz(selectedQuizId).unwrap();
      toast.success("Quiz deleted successfully");
      setOpenDialog(false);
    } catch (error) {
      toast.error("Failed to delete quiz");
      console.error(error);
      setOpenDialog(false);
    }
  };

  if (isLoading) return <div className="p-6">Loading quizzes...</div>;
  if (error) return <div className="p-6">Error: {error.message}</div>;

  const quizzes = data?.quizzes || [];

  return (
    <div className="pt-1 px-6 pb-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Course Quizzes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all quizzes for this course
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/course/${courseId}`)}
            className="flex-1 sm:flex-none"
          >
            Back to Course
          </Button>
          <Link
            to={`/admin/course/${courseId}/quiz/create`}
            className="flex-1 sm:flex-none"
          >
            <Button className="w-full">Create New Quiz</Button>
          </Link>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="border rounded-lg overflow-hidden">
        {quizzes.length > 0 ? (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[200px]">Title</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Passing Score</TableHead>
                <TableHead>Time Limit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz._id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {quiz.questions.length} questions
                    </Badge>
                  </TableCell>
                  <TableCell>{quiz.passingScore}%</TableCell>
                  <TableCell>{quiz.timeLimit} minutes</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Link to={`/admin/course/${courseId}/quiz/${quiz._id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit Quiz"
                        className="text-black hover:text-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete Quiz"
                      className="text-black hover:text-gray-700"
                      onClick={() => {
                        setSelectedQuizId(quiz._id);
                        setOpenDialog(true);
                      }}
                      disabled={isRemoving}
                    >
                      <Delete className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto max-w-md">
              <h3 className="text-lg font-medium">No quizzes yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Get started by creating your first quiz for this course
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AlertDialog for delete confirmation */}
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveQuiz}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizList;