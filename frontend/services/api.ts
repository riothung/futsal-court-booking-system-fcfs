export interface ApiResponse<T> {
  message: string;
  data: T;
}

interface RequestInit {
  body?: string;
}

const baseURL = "http://localhost:5000/api";

export const fetcher = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${baseURL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error("Request Failed");
  }

  return res.json();
};
