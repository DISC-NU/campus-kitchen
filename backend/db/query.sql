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

-- name: AddShiftLeaderForShift :execresult
INSERT INTO shift_leaders (user_id, shift_id) VALUES (?, ?);

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

-- name: DeleteShiftLeadersWithShiftId :execresult
DELETE FROM shift_leaders
WHERE shift_leaders.shift_id = ?;

-- name: DeleteShiftVolunteersWithShiftId :execresult
DELETE FROM shift_volunteers
WHERE shift_volunteers.shift_id = ?;

-- name: IsRegisteredForShift :one
SELECT * FROM shift_volunteers
WHERE shift_volunteers.user_id = ? AND shift_volunteers.shift_id = ?;

-- name: RecordShiftCompletion :execresult
INSERT INTO volunteer_completed_shifts (user_id, shift_id)
SELECT user_id, shift_id
FROM shift_volunteers
WHERE shift_volunteers.shift_id = ?;

-- name: SetShiftCompleted :execresult
UPDATE shifts
SET completed = TRUE
WHERE shifts.id = ?;

-- name: GetCompletedVolunteersForShift :many
SELECT users.id, users.name, users.email, users.phone, users.type
FROM users
JOIN volunteer_completed_shifts ON users.id = volunteer_completed_shifts.user_id
WHERE volunteer_completed_shifts.shift_id = ?;

-- name: GetVolunteerShifts :many
SELECT shifts.id, shifts.start_time, shifts.end_time, shifts.type, shifts.completed
FROM shifts
JOIN shift_volunteers ON shifts.id = shift_volunteers.shift_id
WHERE shift_volunteers.user_id = ?;

-- name: GetShiftLeaderShifts :many
SELECT shifts.id, shifts.start_time, shifts.end_time, shifts.type, shifts.completed
FROM shifts
JOIN shift_leaders ON shifts.id = shift_leaders.shift_id
WHERE shift_leaders.user_id = ?;

-- name: BecomeLeaderRole :execresult
UPDATE users
SET type = 'shift_lead'
WHERE users.id = ?;