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
    logoutWhatsApp: builder.mutation({
      query: () => ({
        url: "/whatsapp/logout",
        method: "POST",
      }),
      invalidatesTags: ["example"],
    }),
  }),
});

export const { useGetWhatsAppStatusQuery, useLogoutWhatsAppMutation } = whatsappApi;
