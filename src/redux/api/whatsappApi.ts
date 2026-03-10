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
  useLogoutWhatsAppMutation 
} = whatsappApi;
