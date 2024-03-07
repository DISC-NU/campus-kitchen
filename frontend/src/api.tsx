import toast from "react-hot-toast";

const backendUrl = "http://localhost:8080";

export type User = {
  ID: number;
  Name: string;
  Email: string;
  Type:  "volunteer" | "shift_lead";
  Phone: {
    String: string;
    Valid: boolean;
  };
};

export type Shift = {
  ID: number;
  StartTime: string;
  EndTime: string;
  Type: "volunteer" | "shift_lead";
};

export async function parseOrThrowResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errMsg = await res.json();
    console.error("error response", errMsg.message);
      // toast.error("Something went wrong: " + errMsg.message || "An error occurred");
    throw new Error(errMsg);
  }
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(`${backendUrl}/users/`);
  return parseOrThrowResponse(response);
}

export async function updateUserName(param: { name: string }): Promise<void> {
  const response = await fetch(`${backendUrl}/users/me/name`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(param),
  });
  return parseOrThrowResponse(response);
}

export async function getMeUser(): Promise<User> {
  const response = await fetch(`${backendUrl}/users/me`, {
    method: "GET",
    credentials: "include",
  });
  return parseOrThrowResponse(response);
}

export async function createShift(param: { start_time: string; end_time: string; type: string }): Promise<void> {
  console.log("createShift", param);
  const response = await fetch(`${backendUrl}/shifts/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(param),
  });
  return parseOrThrowResponse(response);
}

export async function fetchShifts(): Promise<Shift[]> {
  const response = await fetch(`${backendUrl}/shifts/`);
  return parseOrThrowResponse(response);
}

export async function postToRegisterShift(param: number): Promise<void> {
  const response = await fetch(`${backendUrl}/shifts/${param}/volunteer`, {
    method: "POST",
    credentials: "include",
  });
  return parseOrThrowResponse(response);
}

// type GetShiftResponse struct {
// 	Shift      db.Shift  `json:"shift"`
// 	Volunteers []db.User `json:"volunteers"`
// 	Leaders    []db.User `json:"leaders"`
// }

type GetShiftResponse = {
  shift: Shift;
  volunteers: User[];
  leaders: User[];
};

export async function getShift(id: number): Promise<GetShiftResponse> {
  const response = await fetch(`${backendUrl}/shifts/${id}`);
  return parseOrThrowResponse(response);
}