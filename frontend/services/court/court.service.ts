import { fetcher, ApiResponse } from "../api";

export interface Court {
  id: number;
  court_name: string;
  price_per_hour: number;
  created_at?: string;
}

export const getCourts = async (): Promise<Court[]> => {
  const res = await fetcher<ApiResponse<Court[]>>("/data/getCourt");
  return res.data;
};

export const createCourt = async (data: { court_name: string; price_per_hour: number }): Promise<Court> => {
  const res = await fetcher<ApiResponse<Court>>("/data/createCourt", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
};

export const updateCourt = async (data: { id: number; court_name?: string; price_per_hour?: number }): Promise<Court> => {
  const res = await fetcher<ApiResponse<Court>>("/data/updateCourt", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
};

export const deleteCourt = async (id: number): Promise<void> => {
  await fetcher("/data/deleteCourt", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
};
