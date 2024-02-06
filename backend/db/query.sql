-- name: GetUser :one
SELECT * FROM users
WHERE users.id = ?;