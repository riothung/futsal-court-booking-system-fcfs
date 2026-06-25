import { fetcher, ApiResponse } from "../api";
import { Court } from "../court/court.service";

export interface Booking {
  id: number;
  id_user: number;
  id_court: number;
  start_time: string;
  end_time: string;
  status: string;
  payment_type?: string;
  down_payment?: number;
  lock_expires_at?: string;
  created_at: string;
  court: Court;
  user?: {
    id: number;
    username: string;
    email: string;
    phone_number?: string;
  };
}

export interface CreateBookingResponse {
  id: number;
  id_user: number;
  id_court: number;
  start_time: string;
  end_time: string;
  status: string;
  lock_expires_at: string;
  total_price: number;
  lock_duration_minutes: number;
  created_at: string;
  court: Court;
  user?: { id: number; username: string; email: string };
}

export const getCourtSchedule = async (courtId: number, date: string): Promise<Booking[]> => {
  const res = await fetcher<ApiResponse<Booking[]>>(`/data/getCourtSchedule?courtId=${courtId}&date=${date}`);
  return res.data;
};

export const createBookingWithLock = async (data: {
  id_court: number;
  start_time: string;
  end_time: string;
}): Promise<CreateBookingResponse> => {
  const res = await fetcher<ApiResponse<CreateBookingResponse>>("/data/createBooking", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
};

export const confirmPayment = async (data: {
  booking_id: number;
  payment_type: "DP" | "FULL";
}): Promise<Booking> => {
  const res = await fetcher<ApiResponse<Booking>>("/data/confirmPayment", {
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
