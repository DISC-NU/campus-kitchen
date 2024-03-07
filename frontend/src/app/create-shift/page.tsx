"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { createShift } from "../../api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function CreateShift() {
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [type, setType] = useState<string>("");
  const queryClient = useQueryClient();

  const router = useRouter();
  const mutation = useMutation(createShift, {
    onError: (error: any) => {
      console.error(error);
    },
    onSuccess: () => {
      toast.success("Shift created");
      queryClient.invalidateQueries(["shifts"]);
      router.push("/shifts");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      type,
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-5 text-center">Create New Shift</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            required
          >
            <option value="" disabled>
              Select type
            </option>{" "}
            <option value="recovery">Recovery</option>
            <option value="resourcing">Resourcing</option>
            <option value="meal_prep">Meal Prep</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Shift
        </button>
      </form>
    </div>
  );
}

export default CreateShift;
