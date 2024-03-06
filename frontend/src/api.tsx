const backendUrl = "http://localhost:8080";

export type User = {
  ID: number;
  Name: string;
  Email: string;
  Type: string;
  Phone: {
    String: string;
    Valid: boolean;
  };
};

export async function parseOrThrowResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errMsg = await res.json();
    console.error("error response", errMsg);
    //   toast.error(errMsg.message || "An error occurred");
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