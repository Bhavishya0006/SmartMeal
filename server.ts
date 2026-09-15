import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Interfaces
interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "RESIDENT" | "STAFF";
  passwordHash: string;
  residentId?: string;
}

interface Resident {
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

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  occupied: number;
  status: "AVAILABLE" | "FULL" | "MAINTENANCE";
}

interface MenuItem {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  items: string[];
  mealTime: string;
  bookingDeadline: string; // HH:mm
}

interface MealBooking {
  id: string;
  date: string; // YYYY-MM-DD
  residentId: string;
  residentName: string;
  roomNumber: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  status: "YES" | "NO";
  updatedAt: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
  status: "GOOD_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  category: string;
  lastUpdated: string;
}

interface FoodWasteRecord {
  id: string;
  date: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  prepared: number;
  served: number;
  leftover: number;
  waste: number;
  wastePercentage: number;
  notes: string;
  recordedBy: string;
}

interface MealFeedback {
  id: string;
  date: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  residentId: string;
  residentName: string;
  tasteRating: number;
  qualityRating: number;
  quantityRating: number;
  varietyRating: number;
  comment: string;
  createdAt: string;
}

interface SystemSettings {
  breakfastDeadline: string;
  lunchDeadline: string;
  dinnerDeadline: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  enforceDeadlines: boolean; // can toggle to test deadline behavior
  messName: string;
  totalCapacity: number;
}

// In-Memory Database
const todayStr = new Date().toISOString().split("T")[0];

const settings: SystemSettings = {
  breakfastDeadline: "07:30",
  lunchDeadline: "11:30",
  dinnerDeadline: "17:30",
  breakfastTime: "08:00 AM - 09:30 AM",
  lunchTime: "01:00 PM - 02:30 PM",
  dinnerTime: "08:00 PM - 09:30 PM",
  enforceDeadlines: false, // Default false for smooth live testing & demonstration, toggleable in admin
  messName: "Green Valley PG & SmartMess",
  totalCapacity: 60,
};

const users: User[] = [
  {
    id: "user-1",
    email: "admin@smartmeal.com",
    name: "Mess Administrator",
    role: "ADMIN",
    passwordHash: "admin123",
  },
  {
    id: "user-2",
    email: "kitchen@smartmeal.com",
    name: "Chef Ramesh",
    role: "STAFF",
    passwordHash: "staff123",
  },
  {
    id: "user-3",
    email: "rahul@pg.com",
    name: "Rahul Sharma",
    role: "RESIDENT",
    residentId: "RES-101",
    passwordHash: "resident123",
  },
  {
    id: "user-4",
    email: "priya@pg.com",
    name: "Priya Patel",
    role: "RESIDENT",
    residentId: "RES-102",
    passwordHash: "resident123",
  },
  {
    id: "user-5",
    email: "amit@pg.com",
    name: "Amit Kumar",
    role: "RESIDENT",
    residentId: "RES-103",
    passwordHash: "resident123",
  },
];

const rooms: Room[] = [
  { id: "room-1", roomNumber: "101", floor: 1, capacity: 2, occupied: 2, status: "FULL" },
  { id: "room-2", roomNumber: "102", floor: 1, capacity: 2, occupied: 2, status: "FULL" },
  { id: "room-3", roomNumber: "103", floor: 1, capacity: 3, occupied: 1, status: "AVAILABLE" },
  { id: "room-4", roomNumber: "201", floor: 2, capacity: 2, occupied: 1, status: "AVAILABLE" },
  { id: "room-5", roomNumber: "202", floor: 2, capacity: 2, occupied: 2, status: "FULL" },
  { id: "room-6", roomNumber: "203", floor: 2, capacity: 3, occupied: 0, status: "AVAILABLE" },
  { id: "room-7", roomNumber: "301", floor: 3, capacity: 1, occupied: 1, status: "FULL" },
  { id: "room-8", roomNumber: "302", floor: 3, capacity: 2, occupied: 1, status: "AVAILABLE" },
];

const residents: Resident[] = [
  { id: "res-1", residentId: "RES-101", name: "Rahul Sharma", email: "rahul@pg.com", phone: "+91 98765 43210", roomNumber: "101", status: "ACTIVE", joinedDate: "2026-01-15", hasChangedPassword: true },
  { id: "res-2", residentId: "RES-102", name: "Priya Patel", email: "priya@pg.com", phone: "+91 98765 43211", roomNumber: "102", status: "ACTIVE", joinedDate: "2026-02-01", hasChangedPassword: false },
  { id: "res-3", residentId: "RES-103", name: "Amit Kumar", email: "amit@pg.com", phone: "+91 98765 43212", roomNumber: "101", status: "ACTIVE", joinedDate: "2026-02-10", hasChangedPassword: false },
  { id: "res-4", residentId: "RES-104", name: "Sneha Reddy", email: "sneha@pg.com", phone: "+91 98765 43213", roomNumber: "102", status: "ACTIVE", joinedDate: "2026-03-01", hasChangedPassword: true },
  { id: "res-5", residentId: "RES-105", name: "Vikram Singh", email: "vikram@pg.com", phone: "+91 98765 43214", roomNumber: "201", status: "ACTIVE", joinedDate: "2026-03-12", hasChangedPassword: false },
  { id: "res-6", residentId: "RES-106", name: "Ananya Verma", email: "ananya@pg.com", phone: "+91 98765 43215", roomNumber: "202", status: "ACTIVE", joinedDate: "2026-04-05", hasChangedPassword: true },
  { id: "res-7", residentId: "RES-107", name: "Rohan Gupta", email: "rohan@pg.com", phone: "+91 98765 43216", roomNumber: "202", status: "ACTIVE", joinedDate: "2026-04-10", hasChangedPassword: false },
  { id: "res-8", residentId: "RES-108", name: "Neha Joshi", email: "neha@pg.com", phone: "+91 98765 43217", roomNumber: "301", status: "ACTIVE", joinedDate: "2026-05-01", hasChangedPassword: false },
];

let menus: MenuItem[] = [
  {
    id: "menu-1",
    date: todayStr,
    mealType: "BREAKFAST",
    items: ["Kanda Poha", "Boiled Sprouts & Eggs", "Masala Ginger Tea", "Banana"],
    mealTime: settings.breakfastTime,
    bookingDeadline: settings.breakfastDeadline,
  },
  {
    id: "menu-2",
    date: todayStr,
    mealType: "LUNCH",
    items: ["Basmati Steamed Rice", "Paneer Butter Masala", "Tadkewali Toor Dal", "Butter Chapati (3 pcs)", "Cucumber-Tomato Salad", "Roasted Papad"],
    mealTime: settings.lunchTime,
    bookingDeadline: settings.lunchDeadline,
  },
  {
    id: "menu-3",
    date: todayStr,
    mealType: "DINNER",
    items: ["Fresh Tawa Roti", "Dal Makhani", "Mixed Veg Handi", "Jeera Rice", "Warm Gulab Jamun (1 pc)"],
    mealTime: settings.dinnerTime,
    bookingDeadline: settings.dinnerDeadline,
  },
  // Tomorrow's sample menu
  {
    id: "menu-4",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    mealType: "BREAKFAST",
    items: ["Soft Idli (3 pcs)", "Medu Vada (1 pc)", "Coconut Chutney", "Vegetable Sambar", "Filter Coffee"],
    mealTime: settings.breakfastTime,
    bookingDeadline: settings.breakfastDeadline,
  },
  {
    id: "menu-5",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    mealType: "LUNCH",
    items: ["Jeera Rice", "Chole Masala", "Bhature / Phulka", "Boondi Raita", "Pickle & Onion Rings"],
    mealTime: settings.lunchTime,
    bookingDeadline: settings.lunchDeadline,
  },
  {
    id: "menu-6",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    mealType: "DINNER",
    items: ["Methi Thepla / Roti", "Aloo Gobi Matar", "Yellow Moong Dal", "Steamed Rice", "Custard Fruit Salad"],
    mealTime: settings.dinnerTime,
    bookingDeadline: settings.dinnerDeadline,
  },
];

let bookings: MealBooking[] = [
  // Breakfast bookings today
  { id: "b-1", date: todayStr, residentId: "RES-101", residentName: "Rahul Sharma", roomNumber: "101", mealType: "BREAKFAST", status: "YES", updatedAt: "2026-09-15 06:45" },
  { id: "b-2", date: todayStr, residentId: "RES-102", residentName: "Priya Patel", roomNumber: "102", mealType: "BREAKFAST", status: "YES", updatedAt: "2026-09-15 06:50" },
  { id: "b-3", date: todayStr, residentId: "RES-103", residentName: "Amit Kumar", roomNumber: "101", mealType: "BREAKFAST", status: "NO", updatedAt: "2026-09-15 07:10" },
  { id: "b-4", date: todayStr, residentId: "RES-104", residentName: "Sneha Reddy", roomNumber: "102", mealType: "BREAKFAST", status: "YES", updatedAt: "2026-09-15 07:15" },
  { id: "b-5", date: todayStr, residentId: "RES-105", residentName: "Vikram Singh", roomNumber: "201", mealType: "BREAKFAST", status: "YES", updatedAt: "2026-09-15 07:20" },
  { id: "b-6", date: todayStr, residentId: "RES-106", residentName: "Ananya Verma", roomNumber: "202", mealType: "BREAKFAST", status: "YES", updatedAt: "2026-09-15 07:22" },
  { id: "b-7", date: todayStr, residentId: "RES-107", residentName: "Rohan Gupta", roomNumber: "202", mealType: "BREAKFAST", status: "YES", updatedAt: "2026-09-15 07:25" },

  // Lunch bookings today
  { id: "b-8", date: todayStr, residentId: "RES-101", residentName: "Rahul Sharma", roomNumber: "101", mealType: "LUNCH", status: "YES", updatedAt: "2026-09-15 09:30" },
  { id: "b-9", date: todayStr, residentId: "RES-102", residentName: "Priya Patel", roomNumber: "102", mealType: "LUNCH", status: "YES", updatedAt: "2026-09-15 10:10" },
  { id: "b-10", date: todayStr, residentId: "RES-103", residentName: "Amit Kumar", roomNumber: "101", mealType: "LUNCH", status: "YES", updatedAt: "2026-09-15 10:45" },
  { id: "b-11", date: todayStr, residentId: "RES-104", residentName: "Sneha Reddy", roomNumber: "102", mealType: "LUNCH", status: "NO", updatedAt: "2026-09-15 11:00" },
  { id: "b-12", date: todayStr, residentId: "RES-105", residentName: "Vikram Singh", roomNumber: "201", mealType: "LUNCH", status: "YES", updatedAt: "2026-09-15 11:15" },
  { id: "b-13", date: todayStr, residentId: "RES-106", residentName: "Ananya Verma", roomNumber: "202", mealType: "LUNCH", status: "YES", updatedAt: "2026-09-15 11:20" },

  // Dinner bookings today
  { id: "b-14", date: todayStr, residentId: "RES-101", residentName: "Rahul Sharma", roomNumber: "101", mealType: "DINNER", status: "YES", updatedAt: "2026-09-15 14:00" },
  { id: "b-15", date: todayStr, residentId: "RES-102", residentName: "Priya Patel", roomNumber: "102", mealType: "DINNER", status: "YES", updatedAt: "2026-09-15 14:30" },
  { id: "b-16", date: todayStr, residentId: "RES-103", residentName: "Amit Kumar", roomNumber: "101", mealType: "DINNER", status: "YES", updatedAt: "2026-09-15 15:00" },
  { id: "b-17", date: todayStr, residentId: "RES-104", residentName: "Sneha Reddy", roomNumber: "102", mealType: "DINNER", status: "YES", updatedAt: "2026-09-15 15:30" },
  { id: "b-18", date: todayStr, residentId: "RES-105", residentName: "Vikram Singh", roomNumber: "201", mealType: "DINNER", status: "NO", updatedAt: "2026-09-15 16:00" },
  { id: "b-19", date: todayStr, residentId: "RES-106", residentName: "Ananya Verma", roomNumber: "202", mealType: "DINNER", status: "YES", updatedAt: "2026-09-15 16:15" },
  { id: "b-20", date: todayStr, residentId: "RES-107", residentName: "Rohan Gupta", roomNumber: "202", mealType: "DINNER", status: "YES", updatedAt: "2026-09-15 16:30" },
  { id: "b-21", date: todayStr, residentId: "RES-108", residentName: "Neha Joshi", roomNumber: "301", mealType: "DINNER", status: "YES", updatedAt: "2026-09-15 16:45" },
];

let inventory: InventoryItem[] = [
  { id: "inv-1", name: "Basmati Rice", quantity: 120, unit: "kg", minStockLevel: 30, status: "GOOD_STOCK", category: "Grains", lastUpdated: "2026-09-15" },
  { id: "inv-2", name: "Toor Dal (Pigeon Pea)", quantity: 42, unit: "kg", minStockLevel: 15, status: "GOOD_STOCK", category: "Pulses", lastUpdated: "2026-09-14" },
  { id: "inv-3", name: "Sunflower Cooking Oil", quantity: 8, unit: "liters", minStockLevel: 15, status: "LOW_STOCK", category: "Oils", lastUpdated: "2026-09-15" },
  { id: "inv-4", name: "Potatoes", quantity: 38, unit: "kg", minStockLevel: 12, status: "GOOD_STOCK", category: "Vegetables", lastUpdated: "2026-09-15" },
  { id: "inv-5", name: "Tomatoes", quantity: 6, unit: "kg", minStockLevel: 10, status: "LOW_STOCK", category: "Vegetables", lastUpdated: "2026-09-15" },
  { id: "inv-6", name: "Onions", quantity: 28, unit: "kg", minStockLevel: 10, status: "GOOD_STOCK", category: "Vegetables", lastUpdated: "2026-09-14" },
  { id: "inv-7", name: "Fresh Paneer", quantity: 12, unit: "kg", minStockLevel: 5, status: "GOOD_STOCK", category: "Dairy", lastUpdated: "2026-09-15" },
  { id: "inv-8", name: "Whole Wheat Flour (Atta)", quantity: 75, unit: "kg", minStockLevel: 25, status: "GOOD_STOCK", category: "Grains", lastUpdated: "2026-09-13" },
  { id: "inv-9", name: "Garam Masala & Spices", quantity: 1.5, unit: "kg", minStockLevel: 2.5, status: "LOW_STOCK", category: "Spices", lastUpdated: "2026-09-12" },
  { id: "inv-10", name: "Fresh Milk", quantity: 0, unit: "liters", minStockLevel: 10, status: "OUT_OF_STOCK", category: "Dairy", lastUpdated: "2026-09-15" },
];

let wasteRecords: FoodWasteRecord[] = [
  { id: "fw-1", date: "2026-09-14", mealType: "BREAKFAST", prepared: 48, served: 46, leftover: 2, waste: 1, wastePercentage: 2.08, notes: "Very minimal waste. Residents liked the Poha.", recordedBy: "Chef Ramesh" },
  { id: "fw-2", date: "2026-09-14", mealType: "LUNCH", prepared: 52, served: 48, leftover: 4, waste: 2, wastePercentage: 3.85, notes: "Leftover rice utilized for evening staff snack.", recordedBy: "Chef Ramesh" },
  { id: "fw-3", date: "2026-09-14", mealType: "DINNER", prepared: 55, served: 50, leftover: 5, waste: 3, wastePercentage: 5.45, notes: "Slight surplus in dal. Adjusted next day recipe.", recordedBy: "Chef Ramesh" },
  { id: "fw-4", date: todayStr, mealType: "BREAKFAST", prepared: 46, served: 44, leftover: 2, waste: 1, wastePercentage: 2.17, notes: "Breakfast completed smoothly.", recordedBy: "Chef Ramesh" },
  { id: "fw-5", date: todayStr, mealType: "LUNCH", prepared: 50, served: 47, leftover: 3, waste: 1, wastePercentage: 2.00, notes: "Accurate head-count adherence.", recordedBy: "Chef Ramesh" },
];

let feedbacks: MealFeedback[] = [
  { id: "fb-1", date: todayStr, mealType: "BREAKFAST", residentId: "RES-101", residentName: "Rahul Sharma", tasteRating: 5, qualityRating: 4, quantityRating: 5, varietyRating: 4, comment: "Poha was warm, fresh and well seasoned. Masala tea was great!", createdAt: "2026-09-15 09:40" },
  { id: "fb-2", date: todayStr, mealType: "LUNCH", residentId: "RES-102", residentName: "Priya Patel", tasteRating: 4, qualityRating: 5, quantityRating: 4, varietyRating: 5, comment: "Paneer butter masala gravy was delicious. Rice was perfectly cooked.", createdAt: "2026-09-15 14:10" },
  { id: "fb-3", date: "2026-09-14", mealType: "DINNER", residentId: "RES-106", residentName: "Ananya Verma", tasteRating: 4, qualityRating: 4, quantityRating: 4, varietyRating: 4, comment: "Gulab jamun was a nice surprise! Please keep rotis softer.", createdAt: "2026-09-14 21:00" },
];

function updateInventoryStatus(item: InventoryItem) {
  if (item.quantity <= 0) {
    item.status = "OUT_OF_STOCK";
  } else if (item.quantity <= item.minStockLevel) {
    item.status = "LOW_STOCK";
  } else {
    item.status = "GOOD_STOCK";
  }
}

// Helper to check deadline
function isDeadlinePassed(mealType: "BREAKFAST" | "LUNCH" | "DINNER", dateStr: string): boolean {
  if (!settings.enforceDeadlines) {
    return false; // Allows flexible testing anytime unless deadline enforcement enabled
  }
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  if (dateStr < today) return true; // Past dates are closed
  if (dateStr > today) return false; // Future dates are open

  let deadlineTimeStr = settings.breakfastDeadline;
  if (mealType === "LUNCH") deadlineTimeStr = settings.lunchDeadline;
  if (mealType === "DINNER") deadlineTimeStr = settings.dinnerDeadline;

  const [hours, minutes] = deadlineTimeStr.split(":").map(Number);
  const deadlineDate = new Date();
  deadlineDate.setHours(hours, minutes, 0, 0);

  return now > deadlineDate;
}

// Helper to calculate food requirements for date
function calculateFoodRequirement(dateStr: string) {
  const dateBookings = bookings.filter((b) => b.date === dateStr);
  const totalRegisteredResidents = residents.filter((r) => r.status === "ACTIVE").length;

  const calcMeal = (type: "BREAKFAST" | "LUNCH" | "DINNER") => {
    const mealBookings = dateBookings.filter((b) => b.mealType === type);
    const confirmedYes = mealBookings.filter((b) => b.status === "YES").length;
    const confirmedNo = mealBookings.filter((b) => b.status === "NO").length;
    const pending = totalRegisteredResidents - (confirmedYes + confirmedNo);

    // Latest waste/prepared stats if logged
    const logged = wasteRecords.find((w) => w.date === dateStr && w.mealType === type);

    return {
      mealType: type,
      confirmedYes,
      confirmedNo,
      pending: Math.max(0, pending),
      totalEligible: totalRegisteredResidents,
      expectedMeals: confirmedYes,
      recommendedPreparation: confirmedYes, // Exactly as required by prompt: "Recommended Preparation: 72 meals based on Yes"
      actualPrepared: logged?.prepared ?? null,
      actualServed: logged?.served ?? null,
      leftover: logged?.leftover ?? null,
      waste: logged?.waste ?? null,
      wastePercentage: logged?.wastePercentage ?? null,
      isClosed: isDeadlinePassed(type, dateStr),
    };
  };

  return {
    date: dateStr,
    totalResidents: totalRegisteredResidents,
    breakfast: calcMeal("BREAKFAST"),
    lunch: calcMeal("LUNCH"),
    dinner: calcMeal("DINNER"),
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==================== REST API ENDPOINTS ====================

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "SmartMeal Backend API (Spring Boot REST compatible)",
      time: new Date().toISOString(),
    });
  });

  // 1. Auth / Login
  app.post("/api/auth/login", (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and password required" });
    }

    const trimmed = identifier.trim().toLowerCase();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === trimmed ||
        (u.residentId && u.residentId.toLowerCase() === trimmed)
    );

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ message: "Invalid Resident ID/Email or password" });
    }

    const residentData = user.residentId
      ? residents.find((r) => r.residentId === user.residentId)
      : null;

    // Simulated JWT token
    const token = `jwt-mock-token-${user.id}-${Date.now()}`;

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        residentId: user.residentId,
        roomNumber: residentData?.roomNumber,
        phone: residentData?.phone,
        hasChangedPassword: residentData?.hasChangedPassword ?? true,
      },
    });
  });

  // Change password
  app.post("/api/auth/change-password", (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.passwordHash !== oldPassword) {
      return res.status(400).json({ message: "Current password does not match" });
    }
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: "New password must be at least 4 characters" });
    }

    user.passwordHash = newPassword;
    if (user.residentId) {
      const resData = residents.find((r) => r.residentId === user.residentId);
      if (resData) resData.hasChangedPassword = true;
    }

    res.json({ success: true, message: "Password updated successfully" });
  });

  // 2. Settings (Deadlines & Configurations)
  app.get("/api/settings", (req, res) => {
    res.json(settings);
  });

  app.put("/api/settings", (req, res) => {
    const updates = req.body;
    Object.assign(settings, updates);
    res.json({ success: true, settings });
  });

  // 3. Residents Management (Admin Only - No Public Registration)
  app.get("/api/residents", (req, res) => {
    const { search, room } = req.query;
    let list = [...residents];
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.residentId.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q)
      );
    }
    if (room && typeof room === "string") {
      list = list.filter((r) => r.roomNumber === room);
    }
    res.json(list);
  });

  app.post("/api/residents", (req, res) => {
    const { residentId, name, email, phone, roomNumber, temporaryPassword } = req.body;
    if (!residentId || !name || !email || !roomNumber) {
      return res.status(400).json({ message: "Resident ID, name, email, and room are required" });
    }

    if (residents.some((r) => r.residentId.toLowerCase() === residentId.toLowerCase())) {
      return res.status(400).json({ message: `Resident ID ${residentId} already exists` });
    }
    if (residents.some((r) => r.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: `Email ${email} is already registered` });
    }

    // Room capacity check
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (room && room.occupied >= room.capacity) {
      return res.status(400).json({ message: `Room ${roomNumber} is already at full capacity (${room.capacity})` });
    }

    const newRes: Resident = {
      id: `res-${Date.now()}`,
      residentId,
      name,
      email,
      phone: phone || "",
      roomNumber,
      status: "ACTIVE",
      joinedDate: new Date().toISOString().split("T")[0],
      hasChangedPassword: false,
    };
    residents.push(newRes);

    // Create user login account
    users.push({
      id: `user-${Date.now()}`,
      email,
      name,
      role: "RESIDENT",
      passwordHash: temporaryPassword || "pg1234",
      residentId,
    });

    if (room) {
      room.occupied += 1;
      if (room.occupied >= room.capacity) room.status = "FULL";
    }

    res.status(201).json(newRes);
  });

  app.put("/api/residents/:id", (req, res) => {
    const { id } = req.params;
    const resIdx = residents.findIndex((r) => r.id === id || r.residentId === id);
    if (resIdx === -1) {
      return res.status(404).json({ message: "Resident not found" });
    }

    const current = residents[resIdx];
    const { name, email, phone, roomNumber, status, resetPassword } = req.body;

    // Handle room occupancy shift
    if (roomNumber && roomNumber !== current.roomNumber) {
      const oldRoom = rooms.find((r) => r.roomNumber === current.roomNumber);
      if (oldRoom && oldRoom.occupied > 0) {
        oldRoom.occupied -= 1;
        oldRoom.status = "AVAILABLE";
      }
      const newRoom = rooms.find((r) => r.roomNumber === roomNumber);
      if (newRoom) {
        newRoom.occupied += 1;
        if (newRoom.occupied >= newRoom.capacity) newRoom.status = "FULL";
      }
      current.roomNumber = roomNumber;
    }

    if (name) current.name = name;
    if (email) current.email = email;
    if (phone !== undefined) current.phone = phone;
    if (status) current.status = status;

    // Password reset by admin
    if (resetPassword) {
      const user = users.find((u) => u.residentId === current.residentId);
      if (user) {
        user.passwordHash = resetPassword;
        current.hasChangedPassword = false;
      }
    }

    res.json(current);
  });

  app.delete("/api/residents/:id", (req, res) => {
    const { id } = req.params;
    const idx = residents.findIndex((r) => r.id === id || r.residentId === id);
    if (idx === -1) {
      return res.status(404).json({ message: "Resident not found" });
    }

    const r = residents[idx];
    const room = rooms.find((rm) => rm.roomNumber === r.roomNumber);
    if (room && room.occupied > 0) {
      room.occupied -= 1;
      room.status = "AVAILABLE";
    }

    residents.splice(idx, 1);
    const userIdx = users.findIndex((u) => u.residentId === r.residentId);
    if (userIdx !== -1) users.splice(userIdx, 1);

    res.json({ success: true, message: `Resident ${r.name} removed successfully` });
  });

  // 4. Rooms Management
  app.get("/api/rooms", (req, res) => {
    // Recalculate occupied counts dynamically to ensure consistency
    rooms.forEach((rm) => {
      const count = residents.filter((r) => r.roomNumber === rm.roomNumber && r.status === "ACTIVE").length;
      rm.occupied = count;
      if (rm.occupied >= rm.capacity) {
        rm.status = "FULL";
      } else {
        rm.status = "AVAILABLE";
      }
    });
    res.json(rooms);
  });

  app.post("/api/rooms", (req, res) => {
    const { roomNumber, floor, capacity } = req.body;
    if (!roomNumber || !capacity) {
      return res.status(400).json({ message: "Room number and capacity are required" });
    }
    if (rooms.some((r) => r.roomNumber === roomNumber)) {
      return res.status(400).json({ message: `Room ${roomNumber} already exists` });
    }

    const newRoom: Room = {
      id: `room-${Date.now()}`,
      roomNumber,
      floor: Number(floor) || 1,
      capacity: Number(capacity) || 2,
      occupied: 0,
      status: "AVAILABLE",
    };
    rooms.push(newRoom);
    res.status(201).json(newRoom);
  });

  app.put("/api/rooms/:id", (req, res) => {
    const { id } = req.params;
    const room = rooms.find((r) => r.id === id || r.roomNumber === id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const { floor, capacity, status } = req.body;
    if (floor !== undefined) room.floor = Number(floor);
    if (capacity !== undefined) room.capacity = Number(capacity);
    if (status) room.status = status;

    if (room.occupied >= room.capacity) {
      room.status = "FULL";
    } else if (room.status !== "MAINTENANCE") {
      room.status = "AVAILABLE";
    }

    res.json(room);
  });

  app.delete("/api/rooms/:id", (req, res) => {
    const { id } = req.params;
    const idx = rooms.findIndex((r) => r.id === id || r.roomNumber === id);
    if (idx === -1) return res.status(404).json({ message: "Room not found" });

    const rm = rooms[idx];
    if (rm.occupied > 0) {
      return res.status(400).json({ message: `Cannot delete room with ${rm.occupied} assigned residents` });
    }

    rooms.splice(idx, 1);
    res.json({ success: true, message: `Room ${rm.roomNumber} deleted` });
  });

  // 5. Menu Management
  app.get("/api/menu", (req, res) => {
    const { date } = req.query;
    if (date && typeof date === "string") {
      const filtered = menus.filter((m) => m.date === date);
      return res.json(filtered);
    }
    res.json(menus);
  });

  app.post("/api/menu", (req, res) => {
    const { date, mealType, items, mealTime, bookingDeadline } = req.body;
    if (!date || !mealType || !items) {
      return res.status(400).json({ message: "Date, meal type, and food items required" });
    }

    const itemsArray = Array.isArray(items)
      ? items
      : String(items).split(",").map((s) => s.trim()).filter(Boolean);

    // Check if menu for this date & mealType already exists -> update it
    const existing = menus.find((m) => m.date === date && m.mealType === mealType);
    if (existing) {
      existing.items = itemsArray;
      if (mealTime) existing.mealTime = mealTime;
      if (bookingDeadline) existing.bookingDeadline = bookingDeadline;
      return res.json(existing);
    }

    const newMenu: MenuItem = {
      id: `menu-${Date.now()}`,
      date,
      mealType,
      items: itemsArray,
      mealTime: mealTime || (mealType === "BREAKFAST" ? settings.breakfastTime : mealType === "LUNCH" ? settings.lunchTime : settings.dinnerTime),
      bookingDeadline: bookingDeadline || (mealType === "BREAKFAST" ? settings.breakfastDeadline : mealType === "LUNCH" ? settings.lunchDeadline : settings.dinnerDeadline),
    };
    menus.push(newMenu);
    res.status(201).json(newMenu);
  });

  app.put("/api/menu/:id", (req, res) => {
    const { id } = req.params;
    const menu = menus.find((m) => m.id === id);
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    const { items, mealTime, bookingDeadline } = req.body;
    if (items) {
      menu.items = Array.isArray(items)
        ? items
        : String(items).split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (mealTime) menu.mealTime = mealTime;
    if (bookingDeadline) menu.bookingDeadline = bookingDeadline;

    res.json(menu);
  });

  app.delete("/api/menu/:id", (req, res) => {
    const { id } = req.params;
    const idx = menus.findIndex((m) => m.id === id);
    if (idx === -1) return res.status(404).json({ message: "Menu not found" });
    menus.splice(idx, 1);
    res.json({ success: true, message: "Menu deleted" });
  });

  // 6. Meal Bookings (Strict YES/NO only! No quantity selection)
  app.get("/api/meal-bookings", (req, res) => {
    const { date, residentId, mealType } = req.query;
    let list = [...bookings];
    if (date && typeof date === "string") {
      list = list.filter((b) => b.date === date);
    }
    if (residentId && typeof residentId === "string") {
      list = list.filter((b) => b.residentId === residentId);
    }
    if (mealType && typeof mealType === "string") {
      list = list.filter((b) => b.mealType === mealType);
    }
    res.json(list);
  });

  app.post("/api/meal-bookings", (req, res) => {
    const { residentId, date, mealType, status } = req.body;
    if (!residentId || !mealType || !status) {
      return res.status(400).json({ message: "Resident ID, meal type, and status (YES/NO) are required" });
    }

    if (status !== "YES" && status !== "NO") {
      return res.status(400).json({ message: "Status must be strictly YES or NO. Quantity selection is forbidden." });
    }

    const bookingDate = date || todayStr;

    // Check deadline enforcement
    if (isDeadlinePassed(mealType, bookingDate)) {
      return res.status(403).json({
        message: "Meal booking is closed for today. The booking deadline has passed.",
        deadlinePassed: true,
      });
    }

    const resident = residents.find((r) => r.residentId === residentId);
    const residentName = resident ? resident.name : residentId;
    const roomNumber = resident ? resident.roomNumber : "N/A";

    const existingIdx = bookings.findIndex(
      (b) => b.residentId === residentId && b.date === bookingDate && b.mealType === mealType
    );

    const nowFormatted = new Date().toISOString().replace("T", " ").substring(0, 16);

    if (existingIdx !== -1) {
      bookings[existingIdx].status = status;
      bookings[existingIdx].updatedAt = nowFormatted;
      return res.json(bookings[existingIdx]);
    }

    const newBooking: MealBooking = {
      id: `b-${Date.now()}`,
      date: bookingDate,
      residentId,
      residentName,
      roomNumber,
      mealType,
      status,
      updatedAt: nowFormatted,
    };
    bookings.push(newBooking);
    res.status(201).json(newBooking);
  });

  // 7. Food Requirement (Counts Yes confirmations for staff/kitchen preparation)
  app.get("/api/food-requirement", (req, res) => {
    const date = (req.query.date as string) || todayStr;
    const requirement = calculateFoodRequirement(date);
    res.json(requirement);
  });

  // 8. Food Waste & Meal Attendance
  app.get("/api/food-waste", (req, res) => {
    const { date } = req.query;
    if (date && typeof date === "string") {
      return res.json(wasteRecords.filter((w) => w.date === date));
    }
    res.json(wasteRecords);
  });

  app.post("/api/food-waste", (req, res) => {
    const { date, mealType, prepared, served, leftover, waste, notes, recordedBy } = req.body;
    if (!mealType || prepared === undefined || served === undefined) {
      return res.status(400).json({ message: "Meal type, prepared count, and served count are required" });
    }

    const targetDate = date || todayStr;
    const prepNum = Number(prepared);
    const servNum = Number(served);
    const leftNum = leftover !== undefined ? Number(leftover) : Math.max(0, prepNum - servNum);
    const wasteNum = waste !== undefined ? Number(waste) : Math.max(0, leftNum);
    const wastePercentage = prepNum > 0 ? Number(((wasteNum / prepNum) * 100).toFixed(2)) : 0;

    const existingIdx = wasteRecords.findIndex(
      (w) => w.date === targetDate && w.mealType === mealType
    );

    if (existingIdx !== -1) {
      wasteRecords[existingIdx] = {
        ...wasteRecords[existingIdx],
        prepared: prepNum,
        served: servNum,
        leftover: leftNum,
        waste: wasteNum,
        wastePercentage,
        notes: notes || wasteRecords[existingIdx].notes,
        recordedBy: recordedBy || wasteRecords[existingIdx].recordedBy,
      };
      return res.json(wasteRecords[existingIdx]);
    }

    const newRecord: FoodWasteRecord = {
      id: `fw-${Date.now()}`,
      date: targetDate,
      mealType,
      prepared: prepNum,
      served: servNum,
      leftover: leftNum,
      waste: wasteNum,
      wastePercentage,
      notes: notes || "",
      recordedBy: recordedBy || "Staff Member",
    };
    wasteRecords.push(newRecord);
    res.status(201).json(newRecord);
  });

  // 9. Inventory Management
  app.get("/api/inventory", (req, res) => {
    const { search, status } = req.query;
    let list = [...inventory];
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter(
        (i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      );
    }
    if (status && typeof status === "string") {
      list = list.filter((i) => i.status === status);
    }
    res.json(list);
  });

  app.post("/api/inventory", (req, res) => {
    const { name, quantity, unit, minStockLevel, category } = req.body;
    if (!name || quantity === undefined || !unit) {
      return res.status(400).json({ message: "Name, quantity, and unit are required" });
    }

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name,
      quantity: Number(quantity),
      unit,
      minStockLevel: Number(minStockLevel) || 10,
      status: "GOOD_STOCK",
      category: category || "General",
      lastUpdated: todayStr,
    };
    updateInventoryStatus(newItem);
    inventory.push(newItem);
    res.status(201).json(newItem);
  });

  app.put("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const item = inventory.find((i) => i.id === id);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });

    const { name, quantity, unit, minStockLevel, category } = req.body;
    if (name) item.name = name;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (unit) item.unit = unit;
    if (minStockLevel !== undefined) item.minStockLevel = Number(minStockLevel);
    if (category) item.category = category;
    item.lastUpdated = todayStr;
    updateInventoryStatus(item);

    res.json(item);
  });

  app.delete("/api/inventory/:id", (req, res) => {
    const { id } = req.params;
    const idx = inventory.findIndex((i) => i.id === id);
    if (idx === -1) return res.status(404).json({ message: "Inventory item not found" });
    inventory.splice(idx, 1);
    res.json({ success: true, message: "Item removed from inventory" });
  });

  // 10. Feedback
  app.get("/api/feedback", (req, res) => {
    res.json(feedbacks);
  });

  app.post("/api/feedback", (req, res) => {
    const { residentId, mealType, tasteRating, qualityRating, quantityRating, varietyRating, comment, date } = req.body;
    if (!residentId || !mealType) {
      return res.status(400).json({ message: "Resident ID and meal type are required" });
    }

    const resident = residents.find((r) => r.residentId === residentId);
    const newFeedback: MealFeedback = {
      id: `fb-${Date.now()}`,
      date: date || todayStr,
      mealType,
      residentId,
      residentName: resident ? resident.name : residentId,
      tasteRating: Number(tasteRating) || 5,
      qualityRating: Number(qualityRating) || 5,
      quantityRating: Number(quantityRating) || 5,
      varietyRating: Number(varietyRating) || 5,
      comment: comment || "",
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    feedbacks.unshift(newFeedback);
    res.status(201).json(newFeedback);
  });

  // 11. Reports & Analytics (Daily, Weekly, Monthly)
  app.get("/api/reports", (req, res) => {
    const totalResidents = residents.filter((r) => r.status === "ACTIVE").length;
    const lowStockCount = inventory.filter((i) => i.status === "LOW_STOCK" || i.status === "OUT_OF_STOCK").length;

    // Daily breakdown for today
    const reqToday = calculateFoodRequirement(todayStr);

    // Aggregate waste metrics
    const totalMealsPrepared = wasteRecords.reduce((acc, r) => acc + r.prepared, 0);
    const totalMealsServed = wasteRecords.reduce((acc, r) => acc + r.served, 0);
    const totalWasteCount = wasteRecords.reduce((acc, r) => acc + r.waste, 0);
    const averageWastePct = totalMealsPrepared > 0
      ? Number(((totalWasteCount / totalMealsPrepared) * 100).toFixed(1))
      : 0;

    // Weekly history (last 7 days trend)
    const weeklyData = [
      { day: "Mon", date: "09/09", confirmed: 45, prepared: 46, served: 44, waste: 2, wastePct: 4.3 },
      { day: "Tue", date: "10/09", confirmed: 48, prepared: 50, served: 47, waste: 3, wastePct: 6.0 },
      { day: "Wed", date: "11/09", confirmed: 50, prepared: 50, served: 49, waste: 1, wastePct: 2.0 },
      { day: "Thu", date: "12/09", confirmed: 47, prepared: 48, served: 46, waste: 2, wastePct: 4.1 },
      { day: "Fri", date: "13/09", confirmed: 52, prepared: 52, served: 50, waste: 2, wastePct: 3.8 },
      { day: "Sat", date: "14/09", confirmed: 55, prepared: 55, served: 52, waste: 3, wastePct: 5.4 },
      { day: "Today", date: "15/09", confirmed: reqToday.breakfast.confirmedYes + reqToday.lunch.confirmedYes + reqToday.dinner.confirmedYes, prepared: 50, served: 48, waste: 2, wastePct: 4.0 },
    ];

    // Meal type breakdown comparison
    const mealComparison = [
      { name: "Breakfast", confirmed: reqToday.breakfast.confirmedYes, prepared: 46, served: 44, waste: 1 },
      { name: "Lunch", confirmed: reqToday.lunch.confirmedYes, prepared: 50, served: 47, waste: 1 },
      { name: "Dinner", confirmed: reqToday.dinner.confirmedYes, prepared: reqToday.dinner.recommendedPreparation, served: 0, waste: 0 },
    ];

    res.json({
      summary: {
        totalResidents,
        totalRooms: rooms.length,
        occupancyRate: Math.round((residents.length / rooms.reduce((a, r) => a + r.capacity, 0)) * 100),
        todayConfirmedTotal: reqToday.breakfast.confirmedYes + reqToday.lunch.confirmedYes + reqToday.dinner.confirmedYes,
        mealsPrepared: totalMealsPrepared,
        mealsServed: totalMealsServed,
        totalWaste: totalWasteCount,
        averageWastePct,
        lowStockItems: lowStockCount,
      },
      today: reqToday,
      weeklyTrend: weeklyData,
      mealComparison,
      recentWasteLogs: wasteRecords.slice(-5).reverse(),
      inventoryStats: {
        good: inventory.filter((i) => i.status === "GOOD_STOCK").length,
        low: inventory.filter((i) => i.status === "LOW_STOCK").length,
        out: inventory.filter((i) => i.status === "OUT_OF_STOCK").length,
      },
    });
  });

  // ==================== VITE & STATIC SERVING ====================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SmartMeal] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
