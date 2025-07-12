import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { CheckCircle, CheckCircle2, CirclePlay } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation
} from '@/features/api/courseProgressApi';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useGetCourseByIdQuery } from "@/features/api/courseApi";
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(courseId);
  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [completeCourse, { data: markCompleteData, isSuccess: completedSuccess }] = useCompleteCourseMutation();
  const [inCompleteCourse, { data: markInCompleteData, isSuccess: inCompletedSuccess }] = useInCompleteCourseMutation();
  const { data: courseData } = useGetCourseByIdQuery(courseId);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const [width, height] = useWindowSize();

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess, refetch, markCompleteData, markInCompleteData]);

  useEffect(() => {
    if (data?.data?.completed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [data]);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load course details...</p>;

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  const initialLecture = currentLecture || (courseDetails.lectures && courseDetails.lectures[0]);

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
  };

  const handleLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };

  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
  };

  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  return (
    <div className='max-w-7xl mx-auto p-4 mt-20'>
      {showConfetti && <Confetti width={width} height={height} />}

      {/* Titre + Boutons */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4'>
        <h1 className='text-2xl font-bold mb-2 md:mb-0'>{courseTitle}</h1>
        <div className='flex items-center gap-4'>
          <Button
            onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
            variant={completed ? "outline" : "default"}
          >
            {completed ? (
              <div className='flex items-center'>
                <CheckCircle className='h-4 w-4 mr-2' />
                <span>Completed</span>
              </div>
            ) : (
              "Mark as completed"
            )}
          </Button>
        </div>
      </div>

      {/* Vidéo + Leçons */}
      <div className='flex flex-col md:flex-row gap-6'>
        <div className='flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4'>
          <video
            src={currentLecture?.videoUrl || initialLecture.videoUrl}
            controls
            className='w-full h-auto md:rounded-lg'
            onPlay={() => handleLectureProgress(currentLecture?._id || initialLecture._id)}
          />
          <div className='mt-2'>
            <h3 className='font-medium text-lg'>
              {`Lecture ${
                courseDetails.lectures.findIndex(
                  (lec) => lec._id === (currentLecture?._id || initialLecture._id)
                ) + 1
              }: ${currentLecture?.lectureTitle || initialLecture.lectureTitle}`}
            </h3>
          </div>
        </div>

        <div className='flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0'>
          <h2 className='font-semibold text-xl mb-4'>Course Lecture</h2>
          <div className='flex-1 overflow-y-auto'>
            {courseDetails?.lectures.map((lecture) => (
              <Card
                key={lecture._id}
                className={`mb-3 hover:cursor-pointer transition transform ${
                  lecture._id === currentLecture?._id ? 'bg-gray-200' : 'dark:bg-gray-800'
                }`}
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className='flex items-center'>
                    {isLectureCompleted(lecture._id) ? (
                      <CheckCircle2 size={24} className='text-green-500 mr-2' />
                    ) : (
                      <CirclePlay className='text-gray-500 mr-2' />
                    )}
                    <CardTitle className="text-lg font-medium">{lecture.lectureTitle}</CardTitle>
                  </div>
                  {isLectureCompleted(lecture._id) && (
                    <Badge variant="outline" className="bg-green-200 text-green-600">
                      Completed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz */}
      <div className="mt-8">
        <h2 className="font-semibold text-xl mb-4">Course Quizzes</h2>
        {courseData?.course?.quizzes?.length > 0 ? (
          <div className="space-y-4">
            {courseData.course.quizzes.map((quiz) => (
              <div key={quiz._id} className="flex items-center gap-4">
                {/* Quiz Card */}
                <Card className="flex-1">
                  <CardContent className="flex justify-between items-center p-4">
                    <div>
                      <CardTitle className="text-lg font-medium">{quiz.title}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Minimum Score: {quiz.passingScore}% | Time Limit: {quiz.timeLimit} minutes
                      </p>
                    </div>
                    <Link to={`/course-progress/${courseId}/quiz/${quiz._id}`}>
                      <Button>Pass the quiz</Button>
                    </Link>
                  </CardContent>
                </Card>
                {/* Rectangle for Score and Status */}
                <div className="w-24 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col justify-center items-center text-sm">
                  <span className="font-medium">
                    Score: {quiz.score ? `${quiz.score}%` : "N/A"}
                  </span>
                  <span className={`text-xs ${quiz.status === "Passed" ? "text-green-600" : "text-red-600"}`}>
                    {quiz.status || "Non Started"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No Quiz Available</p>
        )}
      </div>
    </div>
  );
};

export default CourseProgress;