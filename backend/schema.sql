-- Campus Ride - base database schema
-- Creates the database and the core tables. Run this first, then apply
-- backend/migrate_schema.sql and backend/seed_bus_routes.sql.
-- Idempotent: re-running is safe.

CREATE DATABASE IF NOT EXISTS CGC_campus_ride;
USE CGC_campus_ride;

-- users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    roll_no VARCHAR(30),
    role VARCHAR(20) DEFAULT 'student',
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_roll_no (roll_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- buses
CREATE TABLE IF NOT EXISTS buses (
    bus_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_number VARCHAR(30) NOT NULL UNIQUE,
    driver_name VARCHAR(100) DEFAULT NULL,
    status ENUM('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- routes
CREATE TABLE IF NOT EXISTS routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    bus_id INT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- stops
CREATE TABLE IF NOT EXISTS stops (
    stop_id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    stop_name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    stop_order INT NOT NULL DEFAULT 0,
    KEY idx_stops_route (route_id),
    CONSTRAINT fk_stops_route FOREIGN KEY (route_id) REFERENCES routes (route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
