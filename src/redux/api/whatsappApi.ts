import { baseApi } from "./baseApi";

export const whatsappApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWhatsAppStatus: builder.query({
      query: () => ({
        url: "/whatsapp/status",
        method: "GET",
      }),
      providesTags: ["example"], // Using existing tag or could add 'whatsapp'
    }),
    getWhatsAppChats: builder.query({
      query: () => ({
        url: "/whatsapp/chats",
        method: "GET",
      }),
      providesTags: ["whatsapp"],
    }),
    getWhatsAppChatMessages: builder.query({
      query: ({ chatId, limit }: { chatId: string, limit?: number }) => ({
        url: `/whatsapp/chats/${chatId}/messages`,
        method: "GET",
        params: { limit },
      }),
      providesTags: ["whatsapp"],
    }),
    sendMessage: builder.mutation({
      query: (body: { phoneNumber: string, message: string }) => ({
        url: "/whatsapp/send-message",
        method: "POST",
        body,
      }),
      invalidatesTags: ["whatsapp"],
    }),
    logoutWhatsApp: builder.mutation({
      query: () => ({
        url: "/whatsapp/logout",
        method: "POST",
      }),
      invalidatesTags: ["example"],
    }),
  }),
});

export const { 
  useGetWhatsAppStatusQuery, 
  useGetWhatsAppChatsQuery,
  useGetWhatsAppChatMessagesQuery,
  useSendMessageMutation,
  useLogoutWhatsAppMutation 
} = whatsappApi;
