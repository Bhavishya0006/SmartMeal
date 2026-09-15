import axios from "axios";
import {
  User,
  Resident,
  Room,
  MenuItem,
  MealBooking,
  FoodRequirementData,
  InventoryItem,
  FoodWasteRecord,
  MealFeedback,
  ReportsData,
  SystemSettings,
  MealType,
  BookingStatus,
} from "../types";

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("smartmeal_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Methods
export const authApi = {
  login: async (identifier: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>("/auth/login", {
      identifier,
      password,
    });
    return res.data;
  },
  changePassword: async (userId: string, oldPassword: string, newPassword: string) => {
    const res = await api.post<{ success: boolean; message: string }>("/auth/change-password", {
      userId,
      oldPassword,
      newPassword,
    });
    return res.data;
  },
};

export const settingsApi = {
  get: async () => {
    const res = await api.get<SystemSettings>("/settings");
    return res.data;
  },
  update: async (settings: Partial<SystemSettings>) => {
    const res = await api.put<{ success: boolean; settings: SystemSettings }>("/settings", settings);
    return res.data;
  },
};

export const residentApi = {
  getAll: async (params?: { search?: string; room?: string }) => {
    const res = await api.get<Resident[]>("/residents", { params });
    return res.data;
  },
  create: async (data: {
    residentId: string;
    name: string;
    email: string;
    phone?: string;
    roomNumber: string;
    temporaryPassword?: string;
  }) => {
    const res = await api.post<Resident>("/residents", data);
    return res.data;
  },
  update: async (
    id: string,
    data: Partial<Resident> & { resetPassword?: string }
  ) => {
    const res = await api.put<Resident>(`/residents/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/residents/${id}`);
    return res.data;
  },
};

export const roomApi = {
  getAll: async () => {
    const res = await api.get<Room[]>("/rooms");
    return res.data;
  },
  create: async (data: { roomNumber: string; floor: number; capacity: number }) => {
    const res = await api.post<Room>("/rooms", data);
    return res.data;
  },
  update: async (id: string, data: Partial<Room>) => {
    const res = await api.put<Room>(`/rooms/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/rooms/${id}`);
    return res.data;
  },
};

export const menuApi = {
  getMenu: async (date?: string) => {
    const res = await api.get<MenuItem[]>("/menu", { params: { date } });
    return res.data;
  },
  saveMenu: async (data: {
    date: string;
    mealType: MealType;
    items: string[] | string;
    mealTime?: string;
    bookingDeadline?: string;
  }) => {
    const res = await api.post<MenuItem>("/menu", data);
    return res.data;
  },
  updateMenu: async (id: string, data: Partial<MenuItem>) => {
    const res = await api.put<MenuItem>(`/menu/${id}`, data);
    return res.data;
  },
  deleteMenu: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/menu/${id}`);
    return res.data;
  },
};

export const bookingApi = {
  getBookings: async (params?: { date?: string; residentId?: string; mealType?: MealType }) => {
    const res = await api.get<MealBooking[]>("/meal-bookings", { params });
    return res.data;
  },
  submitBooking: async (data: {
    residentId: string;
    date: string;
    mealType: MealType;
    status: BookingStatus;
  }) => {
    const res = await api.post<MealBooking>("/meal-bookings", data);
    return res.data;
  },
};

export const foodRequirementApi = {
  get: async (date?: string) => {
    const res = await api.get<FoodRequirementData>("/food-requirement", { params: { date } });
    return res.data;
  },
};

export const wasteApi = {
  getRecords: async (date?: string) => {
    const res = await api.get<FoodWasteRecord[]>("/food-waste", { params: { date } });
    return res.data;
  },
  getAll: async (date?: string) => {
    const res = await api.get<FoodWasteRecord[]>("/food-waste", { params: { date } });
    return res.data;
  },
  saveRecord: async (data: {
    date: string;
    mealType: MealType;
    prepared: number;
    served: number;
    leftover?: number;
    waste?: number;
    notes?: string;
    recordedBy?: string;
  }) => {
    const res = await api.post<FoodWasteRecord>("/food-waste", data);
    return res.data;
  },
  create: async (data: {
    date: string;
    mealType: MealType;
    prepared: number;
    served: number;
    leftover?: number;
    waste?: number;
    notes?: string;
    recordedBy?: string;
  }) => {
    const res = await api.post<FoodWasteRecord>("/food-waste", data);
    return res.data;
  },
};

export const inventoryApi = {
  getAll: async (params?: { search?: string; status?: string }) => {
    const res = await api.get<InventoryItem[]>("/inventory", { params });
    return res.data;
  },
  create: async (data: {
    name: string;
    quantity: number;
    unit: string;
    minStockLevel: number;
    category?: string;
  }) => {
    const res = await api.post<InventoryItem>("/inventory", data);
    return res.data;
  },
  update: async (id: string, data: Partial<InventoryItem>) => {
    const res = await api.put<InventoryItem>(`/inventory/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/inventory/${id}`);
    return res.data;
  },
};

export const feedbackApi = {
  getAll: async () => {
    const res = await api.get<MealFeedback[]>("/feedback");
    return res.data;
  },
  submit: async (data: {
    residentId: string;
    mealType: MealType;
    tasteRating: number;
    qualityRating: number;
    quantityRating: number;
    varietyRating: number;
    comment: string;
    date?: string;
  }) => {
    const res = await api.post<MealFeedback>("/feedback", data);
    return res.data;
  },
};

export const reportApi = {
  getReports: async () => {
    const res = await api.get<ReportsData>("/reports");
    return res.data;
  },
};

export default api;
