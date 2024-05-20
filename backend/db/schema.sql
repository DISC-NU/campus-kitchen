CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(255),
    type ENUM('volunteer', 'shift_lead') NOT NULL
);

CREATE TABLE IF NOT EXISTS shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    type ENUM('recovery', 'resourcing', 'meal_prep') NOT NULL
);

CREATE TABLE IF NOT EXISTS shift_leaders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shift_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

CREATE TABLE IF NOT EXISTS shift_volunteers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shift_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

CREATE TABLE IF NOT EXISTS volunteer_completed_shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shift_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

ALTER TABLE shift_volunteers
ADD CONSTRAINT shift_volunteers_unique UNIQUE (user_id, shift_id);

-- Adds a unique constraint on user_id and shift_id in shift_leaders table
ALTER TABLE shift_leaders
ADD CONSTRAINT shift_leaders_unique UNIQUE (user_id, shift_id);
