-- CREATE TABLE IF NOT EXISTS users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     email VARCHAR(255) UNIQUE NOT NULL,
--     phone VARCHAR(255),
--     type ENUM('volunteer', 'shift_lead') NOT NULL
-- );

-- CREATE TABLE IF NOT EXISTS shifts (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     start_time DATETIME NOT NULL,
--     end_time DATETIME NOT NULL,
--     type ENUM('recovery', 'resourcing', 'meal_prep') NOT NULL
-- );

-- CREATE TABLE IF NOT EXISTS shift_leaders (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     shift_id INT NOT NULL,
--     FOREIGN KEY (user_id) REFERENCES users(id),
--     FOREIGN KEY (shift_id) REFERENCES shifts(id)
-- );

-- CREATE TABLE IF NOT EXISTS shift_volunteers (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     shift_id INT NOT NULL,
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );

-- CREATE TABLE IF NOT EXISTS volunteer_completed_shifts (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     shift_id INT NOT NULL,
--     FOREIGN KEY (user_id) REFERENCES users(id),
--     FOREIGN KEY (shift_id) REFERENCES shifts(id)
-- );

-- name: GetUser :one
SELECT * FROM users
WHERE users.id = ?;

-- name: CreateUser :execresult
INSERT INTO users (name, email, type)
VALUES (?, ?, ?);

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE users.email = ?;

-- name: GetUsers :many
SELECT * FROM users;

-- name: UpdateUserName :execresult
UPDATE users
SET name = ?
WHERE users.id = ?;

-- name: DeleteUser :execresult
DELETE FROM users
WHERE users.id = ?;

-- name: GetShift :one
SELECT * FROM shifts
WHERE shifts.id = ?;

-- name: CreateShift :execresult
INSERT INTO shifts (start_time, end_time, type)
VALUES (?, ?, ?);

-- name: GetShifts :many
SELECT * FROM shifts;

-- name: UpdateShift :execresult
UPDATE shifts
SET start_time = ?, end_time = ?, type = ?
WHERE shifts.id = ?;

-- name: DeleteShift :execresult
DELETE FROM shifts
WHERE shifts.id = ?;

-- name: GetShiftLeadersForShift :many
SELECT users.id, users.name, users.email, users.phone, users.type
FROM users
JOIN shift_leaders ON users.id = shift_leaders.user_id
WHERE shift_leaders.shift_id = ?;

-- name: GetShiftVolunteersForShift :many
SELECT users.id, users.name, users.email, users.phone, users.type
FROM users
JOIN shift_volunteers ON users.id = shift_volunteers.user_id
WHERE shift_volunteers.shift_id = ?;

-- name: CreateShiftVolunteer :execresult
INSERT INTO shift_volunteers (user_id, shift_id)
VALUES (?, ?);

-- name: DeleteShiftVolunteer :execresult
DELETE FROM shift_volunteers
WHERE shift_volunteers.user_id = ? AND shift_volunteers.shift_id = ?;