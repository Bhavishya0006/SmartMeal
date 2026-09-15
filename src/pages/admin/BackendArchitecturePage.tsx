import React, { useState } from "react";
import {
  Code2,
  Database,
  Server,
  Layers,
  FileCode,
  Shield,
  Copy,
  Check,
} from "lucide-react";

export const BackendArchitecturePage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const springBootControllerSnippet = `// Java / Spring Boot REST Controller Blueprint
package com.smartmeal.controller;

import com.smartmeal.dto.*;
import com.smartmeal.model.*;
import com.smartmeal.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SmartMealApiController {

    private final BookingService bookingService;
    private final ResidentService residentService;
    private final FoodWasteService wasteService;
    private final InventoryService inventoryService;

    public SmartMealApiController(
        BookingService bookingService,
        ResidentService residentService,
        FoodWasteService wasteService,
        InventoryService inventoryService
    ) {
        this.bookingService = bookingService;
        this.residentService = residentService;
        this.wasteService = wasteService;
        this.inventoryService = inventoryService;
    }

    // Resident Meal Confirmation (Yes / No)
    @PostMapping("/bookings")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<MealBooking> submitMealDecision(@RequestBody MealBookingRequest request) {
        // Enforces strict deadline & Yes/No status
        return ResponseEntity.ok(bookingService.saveDecision(request));
    }

    // Kitchen Live Food Requirement Calculation
    @GetMapping("/food-requirement")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<FoodRequirementDTO> getPreparationDemand(
        @RequestParam(required = false) LocalDate date
    ) {
        return ResponseEntity.ok(bookingService.calculateKitchenRequirement(date));
    }

    // Admin-Only Resident Creation (No Public Registration)
    @PostMapping("/residents")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resident> provisionResidentAccount(@RequestBody ResidentRegistrationDTO dto) {
        return ResponseEntity.ok(residentService.createResidentWithTempPassword(dto));
    }

    // Food Waste Audit Logging
    @PostMapping("/waste")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<WasteRecord> logMealWaste(@RequestBody WasteLogDTO dto) {
        return ResponseEntity.ok(wasteService.recordWaste(dto));
    }
}`;

  const mysqlSchemaSnippet = `-- MySQL Database DDL Schema for SmartMeal PG System
CREATE DATABASE IF NOT EXISTS smartmeal_db;
USE smartmeal_db;

-- 1. Users & Roles Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'RESIDENT', 'STAFF') NOT NULL,
    resident_id VARCHAR(50),
    room_number VARCHAR(20),
    has_changed_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PG Rooms Table
CREATE TABLE rooms (
    id VARCHAR(36) PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    floor INT NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    occupied INT NOT NULL DEFAULT 0,
    status ENUM('AVAILABLE', 'FULL') DEFAULT 'AVAILABLE'
);

-- 3. Daily Mess Menus Table
CREATE TABLE menus (
    id VARCHAR(36) PRIMARY KEY,
    date DATE NOT NULL,
    meal_type ENUM('BREAKFAST', 'LUNCH', 'DINNER') NOT NULL,
    items JSON NOT NULL,
    meal_time VARCHAR(50) NOT NULL,
    booking_deadline VARCHAR(20) NOT NULL,
    UNIQUE KEY uq_date_meal (date, meal_type)
);

-- 4. Resident Meal Bookings (Strictly YES or NO, No portion plates)
CREATE TABLE meal_bookings (
    id VARCHAR(36) PRIMARY KEY,
    resident_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    meal_type ENUM('BREAKFAST', 'LUNCH', 'DINNER') NOT NULL,
    status ENUM('YES', 'NO') NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_res_date_meal (resident_id, date, meal_type)
);

-- 5. Kitchen Grocery Inventory Table
CREATE TABLE inventory (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    min_stock_level DECIMAL(10,2) NOT NULL DEFAULT 10,
    status ENUM('GOOD', 'LOW_STOCK', 'OUT_OF_STOCK') NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Food Waste & Leftover Records Table
CREATE TABLE waste_records (
    id VARCHAR(36) PRIMARY KEY,
    date DATE NOT NULL,
    meal_type ENUM('BREAKFAST', 'LUNCH', 'DINNER') NOT NULL,
    meals_prepared INT NOT NULL,
    meals_served INT NOT NULL,
    leftover_food INT NOT NULL,
    wasted_food INT NOT NULL,
    waste_percentage DECIMAL(5,2) GENERATED ALWAYS AS ((wasted_food / meals_prepared) * 100) STORED,
    notes TEXT,
    recorded_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Resident Meal Feedback Table
CREATE TABLE meal_feedback (
    id VARCHAR(36) PRIMARY KEY,
    resident_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    meal_type ENUM('BREAKFAST', 'LUNCH', 'DINNER') NOT NULL,
    taste_rating INT CHECK (taste_rating BETWEEN 1 AND 5),
    quality_rating INT CHECK (quality_rating BETWEEN 1 AND 5),
    quantity_rating INT CHECK (quantity_rating BETWEEN 1 AND 5), -- Serving size satisfaction
    variety_rating INT CHECK (variety_rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-900">
            Full-Stack Java / Spring Boot & MySQL Specifications
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Reference architecture documentation showing the Spring Boot REST API endpoints, JPA domain models, and MySQL database relational schemas.
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Service Layer Logic</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Automatic demand calculation formula: Kitchen prepared count = Confirmed Yes + Buffer. Strictly rejects bookings after the deadline cut-off.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Role-Based Spring Security</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            PreAuthorize endpoints for ADMIN, RESIDENT, and STAFF. Public registration endpoints are explicitly excluded from SecurityFilterChain.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>MySQL Ingestion</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Composite unique keys on (resident_id, date, meal_type) prevent duplicate responses and guarantee mathematical head-count accuracy.
          </p>
        </div>
      </div>

      {/* Java Spring Boot Controller Snippet */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-slate-200">
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400">
            <FileCode className="w-4 h-4" />
            <span>SmartMealApiController.java (Spring Boot 3.x / Java 17+)</span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(springBootControllerSnippet, "java")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            {copiedKey === "java" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
        <div className="p-5 text-xs font-mono overflow-x-auto text-slate-300 leading-relaxed">
          <pre>{springBootControllerSnippet}</pre>
        </div>
      </div>

      {/* MySQL Schema Snippet */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-slate-200">
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
            <Database className="w-4 h-4" />
            <span>schema.sql (Production MySQL Relational DDL)</span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(mysqlSchemaSnippet, "sql")}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            {copiedKey === "sql" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy DDL</span>
              </>
            )}
          </button>
        </div>
        <div className="p-5 text-xs font-mono overflow-x-auto text-slate-300 leading-relaxed">
          <pre>{mysqlSchemaSnippet}</pre>
        </div>
      </div>
    </div>
  );
};
