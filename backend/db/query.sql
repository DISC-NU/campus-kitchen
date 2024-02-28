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