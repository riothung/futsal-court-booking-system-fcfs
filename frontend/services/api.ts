export interface ApiResponse<T> {
  message: string;
  data: T;
}

const APIURLS = {
  local: "http://localhost:5000/api",
  tunnel: "https://lv90n1x3-5000.asse.devtunnels.ms/api",
};

// const baseURL = "http://localhost:5000/api";
// const baseURL = "https://lv90n1x3-5000.asse.devtunnels.ms/api";
const baseURL = window.location.hostname === "localhost" ? APIURLS.local : APIURLS.tunnel;

export const setRole = (role: string): void => {
  localStorage.setItem("role", role);
};

export const getRole = (): string | null => {
  return localStorage.getItem("role");
};

export const removeRole = (): void => {
  localStorage.removeItem("role");
};

export const fetcher = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${baseURL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (res.status === 401) {
    removeRole();
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Request Failed" }));
    throw new Error(errorData.message || "Request Failed");
  }

  return res.json();
};
