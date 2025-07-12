import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

//Ce fichier définit une API Redux Toolkit Query (RTK Query) pour gérer les requêtes liées à l’authentification et aux utilisateurs,
// telles que l’inscription, la connexion, la déconnexion, et la gestion du profil.

const USER_API = "http://localhost:8080/api/v1/user/";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include", // credentials: "include" pour envoyer automatiquement les cookies JWT
  }),
  tagTypes: ["User", "Favorites"], // Assurez-vous que "Favorites" est dans tagTypes

  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
    }),
    loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
          // Invalider le cache des favoris après la connexion
          dispatch(authApi.util.invalidateTags(["Favorites"]));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    /*loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          console.log("Login API result:", result);
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.log(error);
        }
      },
    }),*/
    /*logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          dispatch(userLoggedOut());
        } catch (error) {
          console.log(error);
        }
      },
    }),*/
    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
          // Invalider le cache des favoris après la déconnexion
          dispatch(authApi.util.invalidateTags(["Favorites"]));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    updateUser: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
        credentials: "include",
      }),
    }),

    updateInstructorApproval: builder.mutation({
      query: ({ id, approvalStatus }) => ({
        url: `/${id}/approval`, // Modifier cette ligne
        method: "PATCH",
        body: { approvalStatus },
      }),
      invalidatesTags: ["User"], // Changer le tag si nécessaire
    }),
    getAllInstructors: builder.query({
      query: () => ({
        url: "instructors", // Assure-toi que ton backend répond à cette route
        method: "GET",
      }),
    }),
    toggleFavoriteCourse: builder.mutation({
      query: (courseId) => ({
        url: `favorite/${courseId}`,
        method: "POST",
      }),
      invalidatesTags: ["Favorites"], // Rafraîchit les favoris après l’action
    }),
    getFavoriteCourses: builder.query({
      query: () => ({
        url: "favorites",
        method: "GET",
      }),
      providesTags: ["Favorites"], // Permet de mettre à jour cette donnée automatiquement
    }),
  }),
});
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLoadUserQuery,
  useUpdateUserMutation,
  useLogoutUserMutation,
  //useApproveTeacherMutation,
  //useDisapproveTeacherMutation,
  useUpdateInstructorApprovalMutation,
  useGetAllInstructorsQuery,
  useToggleFavoriteCourseMutation,
  useGetFavoriteCoursesQuery,
} = authApi; // Ces hooks sont utilisés dans les composants React pour déclencher les appels API
