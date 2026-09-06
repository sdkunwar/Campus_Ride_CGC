-- Campus Ride — BUS Routes hierarchy seed
-- Model: BUS Routes → Assigned Bus → Ordered Stations
--
-- Routes: 1 "Route 1", 2 Doraha, 3 Ludhiana, 4 Nangal
-- Route 1 reuses the existing bus records 1/2/3 (numbers updated to the
-- confirmed plates). Routes 2–4 get NEW bus records. Because buses.bus_number
-- is UNIQUE, placeholder plates of the form PB-XX-0001..0004 are used until
-- the real plates are provided (rename them from the admin/DB).
-- Station latitude/longitude are required by the map feature; the confirmed
-- structure only named the stations, so coordinates are approximate and can
-- be corrected via the admin backend/DB.
--
-- Idempotent: safe to run repeatedly (no drops, no duplicates).

USE CGC_campus_ride;

DROP PROCEDURE IF EXISTS seed_bus_routes;
DELIMITER $$
CREATE PROCEDURE seed_bus_routes()
BEGIN
    DECLARE v_n INT;
    DECLARE v_bus INT;
    DECLARE v_max INT;

    -- ── 1. The four routes ────────────────────────────────────────────
    UPDATE routes SET route_name = 'Route 1' WHERE route_id = 1 AND route_name <> 'Route 1';
    UPDATE routes SET route_name = 'Doraha' WHERE route_id = 2 AND route_name <> 'Doraha';
    INSERT INTO routes (route_id, route_code, route_name, status, start_location, end_location)
    VALUES (3, 'R-03', 'Ludhiana', 'active', 'Ludhiana', 'CGC Landran Campus')
    ON DUPLICATE KEY UPDATE route_code = 'R-03', route_name = 'Ludhiana', status = 'active';
    INSERT INTO routes (route_id, route_code, route_name, status, start_location, end_location)
    VALUES (4, 'R-04', 'Nangal', 'active', 'Nangal', 'CGC Landran Campus')
    ON DUPLICATE KEY UPDATE route_code = 'R-04', route_name = 'Nangal', status = 'active';

    -- ── 2. Zirakpur buses: reuse existing records, update plates ──────
    UPDATE buses SET bus_number = 'PB-65-Z-4615' WHERE bus_id = 1 AND bus_number <> 'PB-65-Z-4615';
    UPDATE buses SET bus_number = 'PB-64-R-4617' WHERE bus_id = 2 AND bus_number <> 'PB-64-R-4617';
    UPDATE buses SET bus_number = 'PB-83-G-3839', status = 'active' WHERE bus_id = 3 AND bus_number <> 'PB-83-G-3839';

    -- ── 3. Route ↔ bus assignments ────────────────────────────────────
    INSERT IGNORE INTO route_buses (route_id, bus_id) VALUES (1, 1), (1, 2), (1, 3);

    -- Normalize any legacy 'Bus Number' placeholder left by an earlier run
    UPDATE buses SET bus_number = 'PB-XX-0001' WHERE bus_number = 'Bus Number';

    -- Next placeholder plate index (PB-XX-0001 ...)
    SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(bus_number, '-', -1) AS UNSIGNED)), 0)
    INTO v_max FROM buses WHERE bus_number LIKE 'PB-XX-%';

    -- Route 2 (Doraha) needs 1 bus
    SELECT COUNT(*) INTO v_n FROM route_buses WHERE route_id = 2;
    WHILE v_n < 1 DO
        SET v_max = v_max + 1;
        INSERT INTO buses (bus_number, status) VALUES (CONCAT('PB-XX-', LPAD(v_max, 4, '0')), 'active');
        SET v_bus = LAST_INSERT_ID();
        INSERT IGNORE INTO route_buses (route_id, bus_id) VALUES (2, v_bus);
        SET v_n = v_n + 1;
    END WHILE;

    -- Route 3 (Ludhiana) needs 2 buses
    SELECT COUNT(*) INTO v_n FROM route_buses WHERE route_id = 3;
    WHILE v_n < 2 DO
        SET v_max = v_max + 1;
        INSERT INTO buses (bus_number, status) VALUES (CONCAT('PB-XX-', LPAD(v_max, 4, '0')), 'active');
        SET v_bus = LAST_INSERT_ID();
        INSERT IGNORE INTO route_buses (route_id, bus_id) VALUES (3, v_bus);
        SET v_n = v_n + 1;
    END WHILE;

    -- Route 4 (Nangal) needs 1 bus
    SELECT COUNT(*) INTO v_n FROM route_buses WHERE route_id = 4;
    WHILE v_n < 1 DO
        SET v_max = v_max + 1;
        INSERT INTO buses (bus_number, status) VALUES (CONCAT('PB-XX-', LPAD(v_max, 4, '0')), 'active');
        SET v_bus = LAST_INSERT_ID();
        INSERT IGNORE INTO route_buses (route_id, bus_id) VALUES (4, v_bus);
        SET v_n = v_n + 1;
    END WHILE;

    -- ── 4. Ordered stations per bus (guarded inserts) ─────────────────
    -- Rename the existing Route 1 / Bus 1 terminal station 'CGC Campus' → 'CGC Landran'
    -- (idempotent: only renames if a 'CGC Landran' row does not already exist)
    UPDATE bus_stations SET station_name = 'CGC Landran'
    WHERE bus_id = 1 AND station_name = 'CGC Campus'
      AND NOT EXISTS (SELECT 1 FROM (
          SELECT station_id FROM bus_stations WHERE bus_id = 1 AND station_name = 'CGC Landran'
      ) t);

    -- Route 1 / Bus 1 (PB-65-Z-4615)
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'Singhpura Light', 30.6320000, 76.7980000, 0
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'Singhpura Light');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'Silver City', 30.6380000, 76.8060000, 1
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'Silver City');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'Metro V.I.P Road', 30.6430000, 76.8150000, 2
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'Metro V.I.P Road');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'Domino''s V.I.P Road', 30.6490000, 76.8230000, 3
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'Domino''s V.I.P Road');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'Kohinoor Dhaba', 30.6520000, 76.8140000, 4
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'Kohinoor Dhaba');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'Rajpura–Patiala–Zirakpur Light', 30.6340000, 76.8020000, 5
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'Rajpura–Patiala–Zirakpur Light');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'Lucky Dhaba', 30.6365000, 76.7940000, 6
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'Lucky Dhaba');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'AKS Gurudwara', 30.6400000, 76.7870000, 7
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'AKS Gurudwara');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'Lohagarh Road', 30.6430000, 76.7790000, 8
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'Lohagarh Road');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'Swastik Vihar', 30.6470000, 76.7710000, 9
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'Swastik Vihar');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'High Ground Petrol Pump', 30.6510000, 76.7620000, 10
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'High Ground Petrol Pump');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'Nabha Sahib Gurudwara', 30.6550000, 76.7540000, 11
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'Nabha Sahib Gurudwara');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 1, 'CGC Landran', 30.6600000, 76.7300000, 12
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 1 AND station_name = 'CGC Landran');

    -- Route 1 / Bus 1 (PB-65-Z-4615) — confirmed schedule times.
    -- Idempotent: re-running simply re-applies the same arrival times.
    UPDATE bus_stations SET estimated_time = '07:50:00' WHERE bus_id = 1 AND station_name = 'Singhpura Light';
    UPDATE bus_stations SET estimated_time = '07:52:00' WHERE bus_id = 1 AND station_name = 'Silver City';
    UPDATE bus_stations SET estimated_time = '07:55:00' WHERE bus_id = 1 AND station_name = 'Metro V.I.P Road';
    UPDATE bus_stations SET estimated_time = '08:00:00' WHERE bus_id = 1 AND station_name = 'Domino''s V.I.P Road';
    UPDATE bus_stations SET estimated_time = '08:05:00' WHERE bus_id = 1 AND station_name = 'Kohinoor Dhaba';
    UPDATE bus_stations SET estimated_time = '08:10:00' WHERE bus_id = 1 AND station_name = 'Rajpura–Patiala–Zirakpur Light';
    UPDATE bus_stations SET estimated_time = '08:12:00' WHERE bus_id = 1 AND station_name = 'Lucky Dhaba';
    UPDATE bus_stations SET estimated_time = '08:14:00' WHERE bus_id = 1 AND station_name = 'AKS Gurudwara';
    UPDATE bus_stations SET estimated_time = '08:15:00' WHERE bus_id = 1 AND station_name = 'Lohagarh Road';
    UPDATE bus_stations SET estimated_time = '08:16:00' WHERE bus_id = 1 AND station_name = 'Swastik Vihar';
    UPDATE bus_stations SET estimated_time = '08:18:00' WHERE bus_id = 1 AND station_name = 'High Ground Petrol Pump';
    UPDATE bus_stations SET estimated_time = '08:20:00' WHERE bus_id = 1 AND station_name = 'Nabha Sahib Gurudwara';
    UPDATE bus_stations SET estimated_time = '08:45:00' WHERE bus_id = 1 AND station_name = 'CGC Landran';

    -- Normalize any legacy hyphenated spelling of the Rajpura–Patiala–Zirakpur
    -- junction so every portal shows the confirmed en-dash name.
    UPDATE bus_stations SET station_name = 'Rajpura–Patiala–Zirakpur Light'
    WHERE bus_id = 1 AND station_name = 'Rajpura-Patiala-Zirakpur Light';

    -- Heal stations whose en-dash was mangled to '?' when the seed is piped
    -- through a non-UTF-8 shell (idempotent re-run repairs the name).
    UPDATE bus_stations SET station_name = 'Rajpura–Patiala–Zirakpur Light'
    WHERE bus_id = 1 AND station_name = 'Rajpura?Patiala?Zirakpur Light';
    DELETE FROM bus_stations
    WHERE bus_id = 1 AND station_name = 'Rajpura?Patiala?Zirakpur Light'
      AND EXISTS (SELECT 1 FROM (
          SELECT station_id FROM bus_stations
          WHERE bus_id = 1 AND station_name = 'Rajpura–Patiala–Zirakpur Light'
      ) t);

    -- Route 1 / Bus 2 (PB-64-R-4617)
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 2, 'Rajpura Patiala Zirakpur Light', 30.6280000, 76.7900000, 0
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 2 AND station_name = 'Rajpura Patiala Zirakpur Light');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 2, 'Lucky Dhaba', 30.6350000, 76.8040000, 1
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 2 AND station_name = 'Lucky Dhaba');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 2, 'AKS Gurudwara', 30.6400000, 76.8120000, 2
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 2 AND station_name = 'AKS Gurudwara');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 2, 'Lohagarh Road', 30.6460000, 76.8200000, 3
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 2 AND station_name = 'Lohagarh Road');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 2, 'Swastik Bihar', 30.6520000, 76.8280000, 4
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 2 AND station_name = 'Swastik Bihar');

    -- Route 1 / Bus 3 (PB-83-G-3839)
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 3, 'Station 1', 30.6300000, 76.7920000, 0
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 3 AND station_name = 'Station 1');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 3, 'Station 2', 30.6400000, 76.8060000, 1
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 3 AND station_name = 'Station 2');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 3, 'Station 3', 30.6500000, 76.8180000, 2
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 3 AND station_name = 'Station 3');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 3, 'Station 4', 30.6580000, 76.8280000, 3
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 3 AND station_name = 'Station 4');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 1, 3, 'Station 5', 30.6660000, 76.8380000, 4
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = 3 AND station_name = 'Station 5');

    -- Route 2 / Doraha bus
    SELECT bus_id INTO v_bus FROM route_buses WHERE route_id = 2 ORDER BY bus_id LIMIT 1;
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 2, v_bus, 'Station A', 30.8650000, 76.2150000, 0
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station A');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 2, v_bus, 'Station B', 30.8750000, 76.2250000, 1
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station B');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 2, v_bus, 'Station C', 30.8850000, 76.2350000, 2
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station C');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 2, v_bus, 'Station D', 30.8950000, 76.2450000, 3
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station D');

    -- Route 3 / Ludhiana bus 1
    SELECT bus_id INTO v_bus FROM route_buses WHERE route_id = 3 ORDER BY bus_id LIMIT 1;
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 3, v_bus, 'Station 1', 30.8550000, 75.8150000, 0
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station 1');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 3, v_bus, 'Station A', 30.8700000, 75.8280000, 1
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station A');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 3, v_bus, 'Station B', 30.8850000, 75.8400000, 2
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station B');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 3, v_bus, 'Station C', 30.9000000, 75.8530000, 3
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station C');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 3, v_bus, 'Station D', 30.9150000, 75.8650000, 4
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station D');

    -- Route 3 / Ludhiana bus 2
    SELECT bus_id INTO v_bus FROM route_buses WHERE route_id = 3 ORDER BY bus_id DESC LIMIT 1;
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 3, v_bus, 'Station 1', 30.8500000, 75.8100000, 0
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station 1');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 3, v_bus, 'Station 2', 30.8700000, 75.8250000, 1
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station 2');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 3, v_bus, 'Station 3', 30.8900000, 75.8400000, 2
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station 3');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 3, v_bus, 'Station 4', 30.9100000, 75.8580000, 3
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station 4');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 3, v_bus, 'Station 5', 30.9250000, 75.8720000, 4
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station 5');

    -- Route 4 / Nangal bus
    SELECT bus_id INTO v_bus FROM route_buses WHERE route_id = 4 ORDER BY bus_id LIMIT 1;
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 4, v_bus, 'Station 1', 31.3450000, 76.3550000, 0
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station 1');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 4, v_bus, 'Station 2', 31.3550000, 76.3650000, 1
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station 2');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 4, v_bus, 'Station 3', 31.3660000, 76.3750000, 2
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station 3');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 4, v_bus, 'Station 4', 31.3770000, 76.3850000, 3
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station 4');
    INSERT INTO bus_stations (route_id, bus_id, station_name, latitude, longitude, stop_order)
    SELECT 4, v_bus, 'Station 5', 31.3880000, 76.3950000, 4
    WHERE NOT EXISTS (SELECT 1 FROM bus_stations WHERE bus_id = v_bus AND station_name = 'Station 5');
END$$
DELIMITER ;

CALL seed_bus_routes();
DROP PROCEDURE IF EXISTS seed_bus_routes;