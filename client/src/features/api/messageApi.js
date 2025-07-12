import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const MESSAGE_API = "http://localhost:8080/api/v1/message";

export const messageApi = createApi({
  reducerPath: "messageApi",
  tagTypes: ["Messages"],
  baseQuery: fetchBaseQuery({
    baseUrl: MESSAGE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: ({ courseId, content }) => ({
        url: `/${courseId}`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Messages"],
    }),
    getMessages: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
      providesTags: ["Messages"],
    }),
    markMessageAsRead: builder.mutation({
      query: (messageId) => ({
        url: `/read/${messageId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Messages"],
    }),
    editMessage: builder.mutation({
      query: ({ messageId, content }) => ({
        url: `/${messageId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: ["Messages"],
    }),
    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Messages"],
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetMessagesQuery,
  useMarkMessageAsReadMutation,
  useEditMessageMutation,
  useDeleteMessageMutation,
} = messageApi;
