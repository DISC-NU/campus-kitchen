"use client";
import React from "react";
import { QueryCache, useMutation, useQuery } from "react-query";
import {
  getMeUser,
  getShift,
  postDeleteRegisterShiftByShiftLeader,
  postDeleteShift,
  postRecordShift,
  postToRegisterShift,
  postToUnregisterShift,
} from "../../../api";

interface ShiftPageProps {
  params: {
    id: string;
  };
}
import dayjs from "dayjs";
import toast from "react-hot-toast";

var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

const RelativeTime: React.FC<{ date: string }> = ({ date }) => {
  const now = dayjs();
  const targetDate = dayjs(date);
  const timeAgo = targetDate.toNow(true);

  // Determine if the date is in the past or future
  const suffix = targetDate.isAfter(now) ? "from now" : "ago";

  return (
    <span className="font-bold text-gray-800">
      {timeAgo} {suffix}
    </span>
  );
};

// Component using TypeScript
const ShiftPage: React.FC<ShiftPageProps> = ({ params }) => {
  const { id } = params;
  const {
    data: shiftData,
    isLoading,
    isError,
    error,
  } = useQuery(["getShift", id], () => getShift(Number(id)), {
    enabled: !!id, // Only run the query if the id is available
  });

  const { mutate: signUpForShift, isLoading: isSigningUp } = useMutation(
    postToRegisterShift,
    {
      onSuccess: () => {
        toast.success("Signed up for shift successfully");
      },
      onError(error: { message: string }) {
        toast.error(error.message);
      },
    }
  );

  const { mutate: deleteShift, isLoading: isDeletingShift } = useMutation(
    postDeleteShift,
    {
      onSuccess: () => {
        toast.success("Deleted shift successfully");
      },
      onError(error: { message: string }) {
        toast.error(error.message);
      },
    }
  );

  const { mutate: unregisterShift, isLoading: isUnregisteringShift } =
    useMutation(postToUnregisterShift, {
      onSuccess: () => {
        toast.success("Unregistered from shift successfully");
      },
      onError(error: { message: string }) {
        toast.error(error.message);
      },
    });

  const {
    mutate: deleteVoluneer,
    isLoading: isDeletingRegisterShiftByShiftLeader,
  } = useMutation(postDeleteRegisterShiftByShiftLeader, {
    onSuccess: () => {
      toast.success("Deleted volunteer successfully");
    },
    onError(error: { message: string }) {
      toast.error(error.message);
    },
  });

  const { mutate: recordShift, isLoading: isRecordingShift } = useMutation(
    postRecordShift,
    {
      onSuccess: () => {
        toast.success("Recorded shift successfully");
      },
      onError(error: { message: string }) {
        toast.error(error.message);
      },
    }
  );

  const { data: meUser } = useQuery({
    queryKey: ["me"],
    queryFn: getMeUser,
  });
  // Handling loading state
  if (isLoading) return <p className="text-gray-500 text-center">Loading...</p>;

  // Handling error state
  if (isError)
    return (
      <p className="text-red-500">
        Error: {error instanceof Error ? error.message : "An error occurred"}
      </p>
    );

  // Render shift details and lists
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center">Shift Details</h1>
      <div className="my-4 p-4 bg-blue-100 rounded-lg">
        {/* show if shift is completed */}

        {shiftData?.shift.Completed && (
          <p className="text-purple-700 font-bold bg-slate-100 rounded-lg p-1 w-fit">
            Shift is over
          </p>
        )}

        <h2 className="text-xl font-semibold">Type: {shiftData?.shift.Type}</h2>

        <p>
          Start:{" "}
          {dayjs(shiftData?.shift.StartTime).format("MMMM D, YYYY h:mm A")}
          {", "}
          <RelativeTime date={shiftData?.shift.StartTime!} />
        </p>
        <p>
          End: {dayjs(shiftData?.shift.EndTime).format("MMMM D, YYYY h:mm A")}
        </p>
      </div>
      <div>
        <h2 className="text-lg font-semibold">Volunteers</h2>
        <ul className="list-disc pl-5">
          {shiftData?.volunteers.map((volunteer) => (
            <div key={volunteer.ID}>
              <li>{volunteer.Name}</li>
              {meUser?.Type === "shift_lead" && (
                <button
                  className="text-red-500"
                  onClick={() => {
                    // remove volunteer from shift
                    deleteVoluneer(volunteer.ID);
                    window.location.reload();
                  }}
                >
                  remove
                </button>
              )}
            </div>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg font-semibold">Leaders</h2>
        <ul className="list-disc pl-5">
          {shiftData?.leaders.map((leader) => (
            <li key={leader.ID}>{leader.Name}</li>
          ))}
        </ul>
      </div>
      {}

      {meUser?.Type === "shift_lead" ? (
        <>
          <button
            className="ml-2 mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 disabled:bg-blue-300"
            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
              e.preventDefault();
              deleteShift(Number(id));
              window.location.href = "/shifts";
            }}
            disabled={isDeletingShift}
          >
            Delete Shift
          </button>

          {!shiftData?.shift.Completed && (
            <button
              className="ml-2 mt-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 disabled:bg-blue-300"
              onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                e.preventDefault();
                recordShift(Number(id));
                window.location.reload();
              }}
            >
              Record Shift
            </button>
          )}
        </>
      ) : shiftData?.is_registered ? (
        <>
          <p className="text-green-500 bg-slate-100 rounded-lg p-1 w-fit">
            You are already signed up for this shift
          </p>

          <button
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 disabled:bg-blue-300"
            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
              e.preventDefault();
              unregisterShift(Number(id));
              window.location.reload();
            }}
            disabled={isUnregisteringShift}
          >
            Unregister Shift
          </button>
        </>
      ) : (
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault();
            signUpForShift(Number(id));
            window.location.reload();
          }}
          disabled={isSigningUp}
        >
          Sign Up
        </button>
      )}
    </div>
  );
};

export default ShiftPage;
