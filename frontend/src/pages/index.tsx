import { useQuery } from "@tanstack/react-query";
import { getGoogleUrl } from "../util/getGoogleOauthUrl";
import { useState } from "react";
import { fetchUsers, getMeUser } from "../api";

export default function Home() {
  const { data: meUser } = useQuery({
    queryKey: ["me"],
    queryFn: getMeUser,
  });
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
  const [newName, setNewName] = useState("");

  const updateUserName = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8080/users/me/name", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });
      if (!response.ok) {
        throw new Error("Failed to update user name");
      }
      alert("Name updated successfully");
    } catch (error) {
      console.error("There was a problem updating the user name:", error);
    }
  };

  return (
    <>
      <h1>Home</h1>
      <div>
        <p className="text-lg">Welcome: {meUser?.Name ?? "not logged in"}</p>
      </div>

      {users?.map((user) => (
        <li
          key={user.ID}
          className="border p-8 border-blue-500 text-green-600 font-semibold"
        >
          Name: {user.Name || "N/A"}, Email: {user.Email}, Type: {user.Type}
        </li>
      ))}

      <div>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New Name"
        />
        <button onClick={updateUserName}>Update Name</button>
      </div>

      <a
        className="text-blue-500 hover:underline cursor-pointer"
        href={getGoogleUrl("/")}
      >
        Login with Google
      </a>
    </>
  );
}
