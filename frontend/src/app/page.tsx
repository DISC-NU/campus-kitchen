"use client";

import { useQuery } from "react-query";
import { useEffect, useState } from "react";
import { fetchUsers, getMeUser } from "../api";
import React from "react";
import Link from "next/link";

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
        <p className="text-lg">welcome: {meUser?.Name ?? "not logged in"}</p>
      </div>

      {users?.map((user) => (
        <div key={user.ID} className="border py-2">
          Name: {user.Name || "N/A"}, Email: {user.Email}, Type: {user.Type}
        </div>
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

      <Link
        className="text-blue-500 hover:underline cursor-pointer"
        href={getGoogleUrl("/")}
      >
        Login with Google
      </Link>
      <Link href="/shifts">Shifts</Link>
      <Link href="/create-shift">Create Shift</Link>
    </>
  );
}
