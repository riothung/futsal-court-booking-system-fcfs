import { fetcher, ApiResponse } from "../api";
import { Court } from "../court/court.service";

export interface Booking {
  id: number;
  id_user: number;
  id_court: number;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
  court: Court;
  user?: {
    id: number;
    username: string;
    email: string;
    phone_number?: string;
  };
}

export const createBooking = async (data: { id_court: number; start_time: string; end_time: string }): Promise<Booking> => {
  const res = await fetcher<ApiResponse<Booking>>("/data/createBooking", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const res = await fetcher<ApiResponse<Booking[]>>("/data/getMyBookings");
  return res.data;
};

export const getAllBookings = async (): Promise<Booking[]> => {
  const res = await fetcher<ApiResponse<Booking[]>>("/data/getAllBookings");
  return res.data;
};

export const updateBookingStatus = async (data: { id: number; status: string }): Promise<Booking> => {
  const res = await fetcher<ApiResponse<Booking>>("/data/updateBookingStatus", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
};
