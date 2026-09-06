create DATABASE CGC_campus_ride;
USE CGC_campus_ride;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    roll_no VARCHAR(30),
    role VARCHAR(20) DEFAULT 'student'
);