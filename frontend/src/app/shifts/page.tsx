"use client";
import { useQuery, useMutation } from "react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { fetchShifts, postToRegisterShift } from "../../api";
import toast from "react-hot-toast";
import Link from "next/link";

dayjs.extend(relativeTime);

function DisplayShifts() {
  const { data: shifts, isLoading, error } = useQuery("shifts", fetchShifts);

  const { mutate: signUpForShift, isLoading: isSigningUp } = useMutation(
    postToRegisterShift,
    {
      onSuccess: () => {
        toast.success("Signed up for shift successfully");
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred</div>;
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">All Shifts</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts?.map((shift) => (
          <Link
            href={`/shifts/${shift.ID}`}
            key={shift.ID}
            className="border rounded-lg overflow-hidden shadow-lg p-4"
          >
            <h2 className="font-bold text-lg">Type: {shift.Type}</h2>
            <p>Start: {dayjs(shift.StartTime).format("MMMM D, YYYY h:mm A")}</p>
            <p>End: {dayjs(shift.EndTime).format("MMMM D, YYYY h:mm A")}</p>
            <p className="text-sm text-gray-600">
              Starts {dayjs(shift.StartTime).fromNow()}
            </p>
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                e.preventDefault();

                signUpForShift(shift.ID);
              }}
              disabled={isSigningUp}
            >
              Sign Up
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DisplayShifts;
