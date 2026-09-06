-- Campus Ride database upgrade
-- Safe, non-destructive changes (no drops of tables or data).
-- Re-runnable: each column/index/FK is added only if absent.

USE CGC_campus_ride;


-- 0. Ensure the live GPS location table exists.
CREATE TABLE IF NOT EXISTS bus_locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    speed DECIMAL(7,2) DEFAULT NULL,
    heading DECIMAL(6,2) DEFAULT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_bus_locations_bus_updated (bus_id, updated_at),
    CONSTRAINT fk_bus_locations_bus FOREIGN KEY (bus_id) REFERENCES buses(bus_id) ON DELETE CASCADE
);

-- 1. bus_locations.heading
SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'bus_locations'
      AND COLUMN_NAME = 'heading'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE bus_locations ADD COLUMN heading DECIMAL(5,2) DEFAULT NULL AFTER speed',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Index on bus_locations(bus_id, updated_at) for latest-location queries
SET @idx_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'bus_locations'
      AND INDEX_NAME = 'idx_bus_updated'
);
SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE bus_locations ADD INDEX idx_bus_updated (bus_id, updated_at)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. buses: driver_id, capacity, created_at
SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'buses'
      AND COLUMN_NAME = 'driver_id'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE buses ADD COLUMN driver_id INT DEFAULT NULL AFTER driver_name',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'buses'
      AND COLUMN_NAME = 'capacity'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE buses ADD COLUMN capacity INT DEFAULT NULL AFTER driver_id',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'buses'
      AND COLUMN_NAME = 'created_at'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE buses ADD COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER status',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- buses.driver_id index + FK to users(id)
SET @idx_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'buses'
      AND INDEX_NAME = 'idx_buses_driver_id'
);
SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE buses ADD INDEX idx_buses_driver_id (driver_id)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'CGC_campus_ride'
      AND CONSTRAINT_NAME = 'fk_buses_driver'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE buses ADD CONSTRAINT fk_buses_driver FOREIGN KEY (driver_id) REFERENCES users (id)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. routes.created_at
SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'routes'
      AND COLUMN_NAME = 'created_at'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE routes ADD COLUMN created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER bus_id',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. users: nullable fields (contact_no, branch, college, pickup_point,
--    pass_issue_date, pass_valid_upto, fee_receipt_no, route_id, created_at)
--    Each column is added only if missing so the script is re-runnable.
-- Iterate over the desired new columns and add any that are missing.
DROP PROCEDURE IF EXISTS add_users_columns;
DELIMITER $$
CREATE PROCEDURE add_users_columns()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE col_name VARCHAR(64);
    DECLARE col_def VARCHAR(255);
    DECLARE v_count INT;
    DECLARE cur CURSOR FOR
        SELECT
            TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(cd, ' ', 1), ' ', 1)) AS name,
            cd AS def
        FROM (
            SELECT 1 AS ord, 'contact_no VARCHAR(15) DEFAULT NULL AFTER role' AS cd
            UNION ALL SELECT 2, 'branch VARCHAR(50) DEFAULT NULL'
            UNION ALL SELECT 3, 'college VARCHAR(100) DEFAULT NULL'
            UNION ALL SELECT 4, 'pickup_point VARCHAR(100) DEFAULT NULL'
            UNION ALL SELECT 5, 'pass_issue_date DATE DEFAULT NULL'
            UNION ALL SELECT 6, 'pass_valid_upto DATE DEFAULT NULL'
            UNION ALL SELECT 7, 'fee_receipt_no VARCHAR(50) DEFAULT NULL'
            UNION ALL SELECT 8, 'route_id INT DEFAULT NULL'
            UNION ALL SELECT 9, 'created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP'
            UNION ALL SELECT 10, 'department VARCHAR(100) DEFAULT NULL'
            UNION ALL SELECT 11, 'avatar LONGTEXT DEFAULT NULL'
            UNION ALL SELECT 12, 'relation_type VARCHAR(10) DEFAULT NULL'
            UNION ALL SELECT 13, 'relation_value VARCHAR(100) DEFAULT NULL'
            UNION ALL SELECT 14, 'fee_date DATE DEFAULT NULL'
            UNION ALL SELECT 15, 'fee_place VARCHAR(100) DEFAULT NULL'
            UNION ALL SELECT 16, 'designation VARCHAR(100) DEFAULT NULL'
            UNION ALL SELECT 17, 'dob DATE DEFAULT NULL'
            UNION ALL SELECT 18, 'gender VARCHAR(20) DEFAULT NULL'
            UNION ALL SELECT 19, 'address VARCHAR(255) DEFAULT NULL'
            UNION ALL SELECT 20, 'blood_group VARCHAR(10) DEFAULT NULL'
            UNION ALL SELECT 21, 'emergency_contact VARCHAR(15) DEFAULT NULL'
            ORDER BY ord
        ) cols;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO col_name, col_def;
        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        SET v_count = (
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'CGC_campus_ride'
              AND TABLE_NAME = 'users'
              AND COLUMN_NAME = col_name
        );

        IF v_count = 0 THEN
            SET @ddl = CONCAT('ALTER TABLE users ADD COLUMN ', col_def);
            PREPARE s FROM @ddl;
            EXECUTE s;
            DEALLOCATE PREPARE s;
        END IF;
    END LOOP;
    CLOSE cur;
END$$
DELIMITER ;

CALL add_users_columns();
DROP PROCEDURE IF EXISTS add_users_columns;

-- users.route_id index + FK to routes(route_id)
SET @idx_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'users'
      AND INDEX_NAME = 'idx_users_route_id'
);
SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE users ADD INDEX idx_users_route_id (route_id)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'CGC_campus_ride'
      AND CONSTRAINT_NAME = 'fk_users_route'
);
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_users_route FOREIGN KEY (route_id) REFERENCES routes (route_id)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. trips table (multiple buses on the same route)
CREATE TABLE IF NOT EXISTS trips (
    trip_id INT NOT NULL AUTO_INCREMENT,
    route_id INT NOT NULL,
    bus_id INT NOT NULL,
    driver_id INT DEFAULT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    status ENUM('active','always_active') DEFAULT 'active',
    PRIMARY KEY (trip_id),
    KEY idx_trips_route (route_id),
    KEY idx_trips_bus (bus_id),
    KEY idx_trips_driver (driver_id),
    CONSTRAINT fk_trips_route FOREIGN KEY (route_id) REFERENCES routes (route_id),
    CONSTRAINT fk_trips_bus FOREIGN KEY (bus_id) REFERENCES buses (bus_id),
    CONSTRAINT fk_trips_driver FOREIGN KEY (driver_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. users.role extended to include 'faculty'.
--    'faculty' is APPENDED after 'admin' so the existing ENUM index
--    values (student=1, driver=2, admin=3) are unchanged — existing rows
--    keep their role.
SET @role_has_faculty = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'role'
      AND COLUMN_TYPE LIKE '%faculty%'
);
SET @sql = IF(@role_has_faculty = 0,
    "ALTER TABLE users MODIFY role ENUM('student','driver','admin','faculty') NOT NULL DEFAULT 'student'",
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 8. users.email unique (already declared UNIQUE in the original CREATE —
--    this is a safe re-check that only adds the constraint if it is missing
--    and no duplicate emails exist).
SET @email_uniq_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'users'
      AND NON_UNIQUE = 0
      AND COLUMN_NAME = 'email'
);
SET @email_dupes = (
    SELECT COUNT(*) FROM (
        SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1
    ) d
);
SET @sql = IF(@email_uniq_exists = 0 AND @email_dupes = 0,
    'ALTER TABLE users ADD UNIQUE KEY uq_users_email (email)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 9. users.roll_no is already UNIQUE (verified against the live schema),
--    which also enforces a unique Employee/Faculty ID. No further index
--    is needed here.

-- ════════════════════════════════════════════════════════════════════
-- ADMIN PORTAL / DYNAMIC ROUTE MANAGEMENT UPGRADE
-- (re-runnable; no drops of tables or data)
-- ════════════════════════════════════════════════════════════════════

-- 10. routes: dynamic-route management columns
--     route_code, description, start_location, end_location, geometry
--     (road-following polyline JSON: [[lat,lng],...]), status, updated_at
DROP PROCEDURE IF EXISTS add_routes_columns;
DELIMITER $$
CREATE PROCEDURE add_routes_columns()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE col_name VARCHAR(64);
    DECLARE col_def VARCHAR(255);
    DECLARE v_count INT;
    DECLARE cur CURSOR FOR
        SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(cd, ' ', 1), ' ', 1)) AS name, cd AS def
        FROM (
            SELECT 1 AS ord, 'route_code VARCHAR(20) DEFAULT NULL' AS cd
            UNION ALL SELECT 2, 'description TEXT DEFAULT NULL'
            UNION ALL SELECT 3, 'start_location VARCHAR(150) DEFAULT NULL'
            UNION ALL SELECT 4, 'end_location VARCHAR(150) DEFAULT NULL'
            UNION ALL SELECT 5, 'geometry LONGTEXT DEFAULT NULL'
            UNION ALL SELECT 6, "status ENUM('active','inactive') DEFAULT 'active'"
            UNION ALL SELECT 7, 'updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
            ORDER BY ord
        ) cols;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO col_name, col_def;
        IF done = 1 THEN
            LEAVE read_loop;
        END IF;

        SET v_count = (
            SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'CGC_campus_ride'
              AND TABLE_NAME = 'routes'
              AND COLUMN_NAME = col_name
        );

        IF v_count = 0 THEN
            SET @ddl = CONCAT('ALTER TABLE routes ADD COLUMN ', col_def);
            PREPARE s FROM @ddl;
            EXECUTE s;
            DEALLOCATE PREPARE s;
        END IF;
    END LOOP;
    CLOSE cur;
END$$
DELIMITER ;

CALL add_routes_columns();
DROP PROCEDURE IF EXISTS add_routes_columns;

-- routes.route_code unique (when populated)
SET @idx_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'routes'
      AND INDEX_NAME = 'uq_routes_route_code'
);
SET @dupes = (
    SELECT COUNT(*) FROM (
        SELECT route_code FROM routes
        WHERE route_code IS NOT NULL AND route_code <> ''
        GROUP BY route_code HAVING COUNT(*) > 1
    ) d
);
SET @sql = IF(@idx_exists = 0 AND @dupes = 0,
    'ALTER TABLE routes ADD UNIQUE KEY uq_routes_route_code (route_code)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- routes.bus_id unique — one bus can serve only one route
-- (prevents conflicting Bus→Route assignments)
SET @idx_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'routes'
      AND INDEX_NAME = 'uq_routes_bus_id'
);
SET @dupes = (
    SELECT COUNT(*) FROM (
        SELECT bus_id FROM routes WHERE bus_id IS NOT NULL GROUP BY bus_id HAVING COUNT(*) > 1
    ) d
);
SET @sql = IF(@idx_exists = 0 AND @dupes = 0,
    'ALTER TABLE routes ADD UNIQUE KEY uq_routes_bus_id (bus_id)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 11. stops: optional estimated arrival time + description
SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'stops'
      AND COLUMN_NAME = 'estimated_time'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE stops ADD COLUMN estimated_time TIME DEFAULT NULL AFTER stop_order',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'stops'
      AND COLUMN_NAME = 'description'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE stops ADD COLUMN description VARCHAR(255) DEFAULT NULL AFTER estimated_time',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 12. users.account_status — Admin-controlled active/inactive flag.
--     Inactive accounts cannot sign in (enforced in the backend).
SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'account_status'
);
SET @sql = IF(@col_exists = 0,
    "ALTER TABLE users ADD COLUMN account_status ENUM('active','inactive') NOT NULL DEFAULT 'active' AFTER role",
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 13. buses.driver_id unique — one driver can be assigned to only one bus
--     (prevents conflicting Driver→Bus assignments).
SET @idx_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'buses'
      AND INDEX_NAME = 'uq_buses_driver_id'
);
SET @dupes = (
    SELECT COUNT(*) FROM (
        SELECT driver_id FROM buses
        WHERE driver_id IS NOT NULL GROUP BY driver_id HAVING COUNT(*) > 1
    ) d
);
SET @sql = IF(@idx_exists = 0 AND @dupes = 0,
    'ALTER TABLE buses ADD UNIQUE KEY uq_buses_driver_id (driver_id)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 14. routes.status index for fast active/inactive filtering
SET @idx_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'routes'
      AND INDEX_NAME = 'idx_routes_status'
);
SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE routes ADD INDEX idx_routes_status (status)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 15. Central notifications system (shared by students, faculty and drivers).
--     One row = one message delivered to one recipient; a driver broadcast to
--     N recipients produces N rows that all share the same thread_id.
--     Replies reference the row they answer via reply_to. bus/route fields are
--     snapshotted so history stays stable even if assignments later change.
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    thread_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role VARCHAR(20) NOT NULL,
    recipient_id INT NOT NULL,
    recipient_role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    bus_id INT NULL,
    bus_number VARCHAR(30) NULL,
    route_id INT NULL,
    route_name VARCHAR(255) NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    reply_to INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_notif_recipient (recipient_id, is_read),
    KEY idx_notif_thread (thread_id),
    KEY idx_notif_sender (sender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ════════════════════════════════════════════════════════════════════
-- BUS ROUTES HIERARCHY UPGRADE
-- BUS Routes → Assigned Bus → Ordered Stations
-- (re-runnable; no drops of tables or data)
-- ════════════════════════════════════════════════════════════════════

-- 16. route_buses — which buses are assigned to which route.
--     (Many-to-many; a route can carry several buses and a bus belongs to
--     exactly one route. `routes.bus_id` keeps serving the legacy
--     single-bus tracking model.)
CREATE TABLE IF NOT EXISTS route_buses (
    route_id INT NOT NULL,
    bus_id INT NOT NULL,
    PRIMARY KEY (route_id, bus_id),
    KEY idx_route_buses_bus (bus_id),
    CONSTRAINT fk_route_buses_route FOREIGN KEY (route_id) REFERENCES routes (route_id),
    CONSTRAINT fk_route_buses_bus FOREIGN KEY (bus_id) REFERENCES buses (bus_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 17. bus_stations — ordered list of stations served by one assigned bus.
--     The map opens on a station's latitude/longitude.
CREATE TABLE IF NOT EXISTS bus_stations (
    station_id INT NOT NULL AUTO_INCREMENT,
    route_id INT NOT NULL,
    bus_id INT NOT NULL,
    station_name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    stop_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (station_id),
    KEY idx_bus_stations_route (route_id),
    KEY idx_bus_stations_bus (bus_id, stop_order),
    CONSTRAINT fk_bus_stations_route FOREIGN KEY (route_id) REFERENCES routes (route_id),
    CONSTRAINT fk_bus_stations_bus FOREIGN KEY (bus_id) REFERENCES buses (bus_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 18. bus_stations.estimated_time — optional per-station arrival time for the
--     BUS Routes → Assigned Bus → Ordered Stations model. Mirrors the same
--     TIME convention already used by stops.estimated_time so route schedule
--     data is shown consistently across the portal.
SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'CGC_campus_ride'
      AND TABLE_NAME = 'bus_stations'
      AND COLUMN_NAME = 'estimated_time'
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE bus_stations ADD COLUMN estimated_time TIME DEFAULT NULL AFTER stop_order',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;