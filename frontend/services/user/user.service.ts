import { fetcher } from "../api";
import { ApiResponse } from "../api";

export interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string;
}

export const getUsers = async (): Promise<User[]> => {
  const res = await fetcher<ApiResponse<User[]>>("/auth/getUsers");
  return res.data;
};
