"use client";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useEffect, useState } from "react";
import { fetchUsers, getMeUser } from "../api";
import React from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export const REDIRECT_URL = "http://127.0.0.1:8080/auth/google/callback";
export const GOOGLE_OAUTH_CLIENT_ID =
  "519346730061-q5i3t15ji2r3fsrt88od7gsn92c0bhv8.apps.googleusercontent.com";

export const getGoogleUrl = (state: string) => {
  const rootUrl = `https://accounts.google.com/o/oauth2/v2/auth`;

  const options = {
    redirect_uri: REDIRECT_URL,
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/userinfo.email"].join(" "),
    state: state,
  };

  const qs = new URLSearchParams(options);

  return `${rootUrl}?${qs.toString()}`;
};

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      console.log("Token:", token);
      document.cookie = `token=${token}`;
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const queryClient = useQueryClient();

  const updateUserNameMutation = useMutation(
    async () => {
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
      return response.json(); // Assuming the server responds with JSON
    },
    {
      onSuccess: () => {
        toast.success("Name updated successfully");
        queryClient.invalidateQueries("me");
      },
    }
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold">
          {meUser?.Name ?? "Welcome, login to begin"}
          {meUser?.Type === "shift_lead" ? " (Shift Lead)" : ""}
        </h1>
        {meUser ? (
          <p className="text-lg">Welcome, {meUser.Name}</p>
        ) : (
          <Link
            href={getGoogleUrl("/")}
            className="text-blue-600 hover:underline"
          >
            Login with Google
          </Link>
        )}
      </div>

      <div className="flex space-x-4 mt-3">
        <Link href="/shifts" className="text-blue-600 hover:underline text-lg">
          Shifts
        </Link>
        <Link
          href="/create-shift"
          className="text-blue-600 hover:underline text-lg"
        >
          Create Shift
        </Link>
      </div>
      <div>
        {users?.map((user) => (
          <div key={user.ID} className="border rounded-lg p-4 my-4 shadow">
            <p>Name: {user.Name || "N/A"}</p>
            <p>Email: {user.Email}</p>
            <p>Type: {user.Type}</p>
          </div>
        ))}

        <div className="mt-6">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New Name"
            className="border-2 border-gray-200 rounded-md p-2 mr-2"
          />
          <button
            onClick={() => updateUserNameMutation.mutate()}
            className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600"
          >
            Update Name
          </button>
        </div>
      </div>
    </div>
  );
}
