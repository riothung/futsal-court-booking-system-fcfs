import { fetcher } from "../api";
import { ApiResponse } from "../api";

export interface Court {
  id: number;
  court_name: string;
  price_per_hour: number;
}

export const getCourts = async (): Promise<Court[]> => {
  const res = await fetcher<ApiResponse<Court[]>>("/data/getCourt");
  return res.data;
};
