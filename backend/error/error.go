package server_error

const (
	ErrInternalServerError = "Internal server error"
	ErrMsgInvalidReq = "Invalid request"
	ErrMsgJSONDecode = "Failed to decode json request"
	ErrUserNotFound = "User not found"
	ErrUnauthorized = "Unauthorized"
	ErrNotVolunteer = "User is not a volunteer"
	ErrNotLeader = "User is not a shift leader"
)