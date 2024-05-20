"use client";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useEffect, useState } from "react";
import {
  fetchUsers,
  getMeUser,
  getShiftsByUserId,
  postGetLeaderRole,
} from "../api";
import React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
const REDIRECT_URL = "http://127.0.0.1:8080/auth/google/callback";
const GOOGLE_OAUTH_CLIENT_ID =
  "519346730061-q5i3t15ji2r3fsrt88od7gsn92c0bhv8.apps.googleusercontent.com";

const getGoogleUrl = (state: string) => {
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
  const { data: meShifts } = useQuery({
    queryKey: ["meShifts"],
    queryFn: getShiftsByUserId,
  });

  console.log(meUser);
  console.log(meShifts);
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

  const [userPin, setUserPin] = useState("");

  const becomeShiftLeadMutation = useMutation(
    async () => postGetLeaderRole(userPin),
    {
      onSuccess: () => {
        toast.success("You are now a shift lead");
        queryClient.invalidateQueries("me");
      },
      onError: (error) => {
        // toast.error(error.message);
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

      {meUser?.Type === "shift_lead" && (
        <div className="flex space-x-4 mt-3">
          <Link
            href="/shifts"
            className="text-blue-600 hover:underline text-lg"
          >
            Shifts
          </Link>
          <Link
            href="/create-shift"
            className="text-blue-600 hover:underline text-lg"
          >
            Create Shift
          </Link>
        </div>
      )}

      {/* display shifts  */}

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Your Shifts</h2>
        <ul>
          {meShifts?.map((shift) => (
            <div key={shift.ID} className="border rounded p-2 w-fit ">
              <Link href={`/shifts/${shift.ID}`}>
                <h2 className="font-bold text-lg">Type: {shift.Type}</h2>
                <p>
                  Start: {dayjs(shift.StartTime).format("MMMM D, YYYY h:mm A")}
                </p>
                <p>End: {dayjs(shift.EndTime).format("MMMM D, YYYY h:mm A")}</p>
                <p className="text-sm text-gray-600">
                  Starts {dayjs(shift.StartTime).fromNow()}
                </p>
              </Link>
            </div>
          ))}
        </ul>
      </div>

      <div>
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

        {/* become shift leader button */}

        {meUser?.Type === "volunteer" && (
          <div className="">
            <input
              type="text"
              value={userPin}
              onChange={(e) => setUserPin(e.target.value)}
              placeholder="PIN"
              className="border-2 border-gray-200 rounded-md p-2 mr-2"
            />
            <button
              onClick={() => becomeShiftLeadMutation.mutate()}
              className="mt-4 bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600"
            >
              Become Shift Lead
            </button>
          </div>
        )}

        {/* sign out  */}

        <button
          onClick={() => {
            document.cookie =
              "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            queryClient.clear();
            // reload the page
            window.location.reload();
          }}
          className="mt-4 bg-red-500 text-white rounded-md px-4 py-2 hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
