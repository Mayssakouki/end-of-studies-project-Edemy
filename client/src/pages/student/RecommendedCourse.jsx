import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Course from "./Course";
import { useGetRecommendedCoursesQuery } from "@/features/api/courseApi";
import { useParams } from "react-router-dom";

const RecommendedCourse = () => {
  const { courseId } = useParams();
  const { data, isLoading, isError } = useGetRecommendedCoursesQuery(courseId);

  console.log("Recommended courses data:", data);

  if (isLoading) {
    return (
      <div className="max-h-[80vh] overflow-y-auto">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="mb-8">
            <CourseSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data?.recommendations) {
    return <p>Failed to load recommendations.</p>;
  }

  const recommendations = data.recommendations;

  return (
    <div className="space-y-6">
      
      {recommendations.length === 0 ? (
        <p>No recommendations available.</p>
      ) : (
        <div className="max-h-[80vh] overflow-y-auto">
          {recommendations.map((course) => (
            <div key={course.id} className="mb-8">
              <Course course={course} showSimilarity />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedCourse;

// Réutiliser CourseSkeleton depuis Courses.jsx
const CourseSkeleton = () => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <Skeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-1/4" />
      </div>
    </div>
  );
};