"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { createShift } from "../../api";

function CreateShift() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation(createShift, {
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["shifts"]);
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
    <>
      <h1>Create New Shift</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          placeholder="Start Time"
          required
        />
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          placeholder="End Time"
          required
        />
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Type"
          required
        />
        <button type="submit">Create Shift</button>
      </form>
    </>
  );
}

export default CreateShift;
