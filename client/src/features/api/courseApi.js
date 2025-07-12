//import CreateLecture from "@/pages/admin/lecture/CreateLecture";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_API = "http://localhost:8080/api/v1/course";

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: ["Refetch_Creator_Course", "Refetch_Lecture"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      // builder.mutation pour les requetes create , delete et modifier
      query: ({ courseTitle, category }) => ({
        url: "",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),

    getCreatorCourse: builder.query({
      // builder.query ==> Pour les requêtes GET ( pour juste lire la requete )
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: ["Refetch_Creator_Course"],
    }),
    editCourse: builder.mutation({
      query: ({ formData, courseId }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
    }),
    createLecture: builder.mutation({
      query: ({ lectureTitle, courseId }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle },
      }),
    }),
    getSearchCourse: builder.query({
      query: ({ searchQuery, categories, sortByPrice }) => {
        // Build qiery string
        let queryString = `/search?query=${encodeURIComponent(searchQuery)}`;

        // append cateogry
        if (categories && categories.length > 0) {
          const categoriesString = categories.map(encodeURIComponent).join(",");
          queryString += `&categories=${categoriesString}`;
        }

        // Append sortByPrice is available
        if (sortByPrice) {
          queryString += `&sortByPrice=${encodeURIComponent(sortByPrice)}`;
        }

        return {
          url: queryString,
          method: "GET",
        };
      },
    }),

    getPublishedCourse: builder.query({
      query: () => ({
        url: "/published-courses",
        method: "GET",
      }),
      providesTags: ["Refetch_Creator_Course"], //j'ai ajouté ça
    }),
    getCourseLecture: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags: ["Refetch_Lecture"],
    }),
    editLecture: builder.mutation({
      query: ({
        lectureTitle,
        videoInfo,
        isPreviewFree,
        courseId,
        lectureId,
      }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: { lectureTitle, videoInfo, isPreviewFree },
      }),
      invalidatesTags: ["Refetch_Lecture"],
    }),
    removeLecture: builder.mutation({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Lecture"],
    }),
    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "GET",
      }),
    }),
    publishCourse: builder.mutation({
      query: ({ courseId, query }) => ({
        url: `/${courseId}?publish=${query}`,
        method: "PATCH",
      }),
    }),
    removeCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    // Pour créer un quiz
    createQuiz: builder.mutation({
      query: ({ courseId, quizData }) => ({
        url: `/${courseId}/quiz`,
        method: "POST",
        body: quizData,
      }),
      invalidatesTags: ["Refetch_Quiz"],
    }),

    // Pour obtenir les quizs d'un cours
    getCourseQuizzes: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/quiz`,
        method: "GET",
      }),
      providesTags: ["Refetch_Quiz"],
    }),

    // Pour obtenir un quiz spécifique
    getQuizById: builder.query({
      query: ({ courseId, quizId }) => ({
        url: `/${courseId}/quiz/${quizId}`,
        method: "GET",
      }),
      providesTags: ["Refetch_Quiz"], // Assurez-vous que ceci est présent
    }),
    submitQuiz: builder.mutation({
      query: ({ quizId, answers }) => ({
        url: `/quiz/${quizId}/submit`,
        method: "POST",
        body: { answers },
      }),
    }),

    // Pour supprimer un quiz
    /*deleteQuiz: builder.mutation({
      query: ({ courseId, quizId }) => ({
        url: `/${courseId}/quiz/${quizId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Quiz"],
    }),

*/
    updateQuiz: builder.mutation({
      query: ({ courseId, quizId, quizData }) => ({
        url: `/quiz/${quizId}`,
        method: "PUT",
        body: quizData,
      }),
      invalidatesTags: ["Refetch_Quiz"],
    }),
    removeQuiz: builder.mutation({
      query: (quizId) => ({
        url: `/quiz/${quizId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Quiz"],
    }),

    getRecommendedCourses: builder.query({
      query: (courseId) => ({
        url: `/recommend/${courseId}`,
        method: "GET",
      }),
    }),

    getQuizResults: builder.query({
      query: ({ courseId }) => ({
        url: `/${courseId}/quiz-results`,
        method: "GET",
      }),
      providesTags: ["Refetch_QuizResults"],
    }),
  }),
});
export const {
  useCreateCourseMutation,
  useGetSearchCourseQuery,
  useGetPublishedCourseQuery,
  useGetCreatorCourseQuery,
  useEditCourseMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation,
  useRemoveCourseMutation,
  useCreateQuizMutation,
  useGetCourseQuizzesQuery,
  useGetQuizByIdQuery,

  useUpdateQuizMutation,
  useGetRecommendedCoursesQuery,
  useRemoveQuizMutation,
  useSubmitQuizMutation,
  useGetQuizResultsQuery,
} = courseApi;
