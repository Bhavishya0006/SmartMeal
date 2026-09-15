export type UserRole = "ADMIN" | "RESIDENT" | "STAFF";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  residentId?: string;
  roomNumber?: string;
  phone?: string;
  hasChangedPassword?: boolean;
}

export interface Resident {
  id: string;
  residentId: string;
  name: string;
  email: string;
  phone: string;
  roomNumber: string;
  status: "ACTIVE" | "INACTIVE";
  joinedDate: string;
  hasChangedPassword?: boolean;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupied: number;
  status: "AVAILABLE" | "FULL" | "MAINTENANCE";
}

export type MealType = "BREAKFAST" | "LUNCH" | "DINNER";
export type BookingStatus = "YES" | "NO";

export interface MenuItem {
  id: string;
  date: string;
  mealType: MealType;
  items: string[];
  mealTime: string;
  bookingDeadline: string;
}

export interface MealBooking {
  id: string;
  date: string;
  residentId: string;
  residentName: string;
  roomNumber: string;
  mealType: MealType;
  status: BookingStatus;
  updatedAt: string;
}

export interface MealRequirement {
  mealType: MealType;
  confirmedYes: number;
  confirmedNo: number;
  pending: number;
  totalEligible: number;
  expectedMeals: number;
  recommendedPreparation: number;
  actualPrepared: number | null;
  actualServed: number | null;
  leftover: number | null;
  waste: number | null;
  wastePercentage: number | null;
  isClosed: boolean;
}

export interface FoodRequirementData {
  date: string;
  totalResidents: number;
  breakfast: MealRequirement;
  lunch: MealRequirement;
  dinner: MealRequirement;
}

export type InventoryStatus = "GOOD_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  status: InventoryStatus;
  category: string;
  lastUpdated: string;
}

export interface FoodWasteRecord {
  id: string;
  date: string;
  mealType: MealType;
  prepared: number;
  served: number;
  leftover: number;
  waste: number;
  wastePercentage: number;
  notes: string;
  recordedBy: string;
}

export type WasteRecord = FoodWasteRecord;

export interface MealFeedback {
  id: string;
  date: string;
  mealType: MealType;
  residentId: string;
  residentName: string;
  tasteRating: number;
  qualityRating: number;
  quantityRating: number;
  varietyRating: number;
  comment: string;
  createdAt: string;
}

export interface SystemSettings {
  breakfastDeadline: string;
  lunchDeadline: string;
  dinnerDeadline: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  enforceDeadlines: boolean;
  messName: string;
  totalCapacity: number;
}

export interface ReportsSummary {
  totalResidents: number;
  totalRooms: number;
  occupancyRate: number;
  todayConfirmedTotal: number;
  mealsPrepared: number;
  mealsServed: number;
  totalWaste: number;
  averageWastePct: number;
  lowStockItems: number;
}

export interface ReportsData {
  summary: ReportsSummary;
  today: FoodRequirementData;
  weeklyTrend: Array<{
    day: string;
    date: string;
    confirmed: number;
    prepared: number;
    served: number;
    waste: number;
    wastePct: number;
  }>;
  mealComparison: Array<{
    name: string;
    confirmed: number;
    prepared: number;
    served: number;
    waste: number;
  }>;
  recentWasteLogs: FoodWasteRecord[];
  inventoryStats: {
    good: number;
    low: number;
    out: number;
  };
}
