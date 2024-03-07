"use client";
import { useQuery } from "react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { getShift } from "../../../api";

export default function ShiftPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const {
    data: shiftData,
    isLoading,
    isError,
    error,
  } = useQuery(["getShift", id], () => getShift(Number(id)), {
    enabled: !!id, // Only run the query if the id is available
  });

  console.log(shiftData);

  if (isLoading) return <p>Loading...</p>;
  if (isError)
    return (
      <p>
        Error: {error instanceof Error ? error.message : "An error occurred"}
      </p>
    );

  return (
    <div>
      <h1>Shift Details</h1>
      <div>
        <h2>Type: {shiftData?.shift.Type}</h2>
        <p>Start Time: {shiftData?.shift.StartTime}</p>
        <p>End Time: {shiftData?.shift.EndTime}</p>
      </div>
      <h2>Volunteers</h2>
      <ul>
        {shiftData?.volunteers.map((volunteer) => (
          <li key={volunteer.ID}>{volunteer.Name}</li>
        ))}
      </ul>
      <h2>Leaders</h2>
      <ul>
        {shiftData?.leaders.map((leader) => (
          <li key={leader.ID}>{leader.Name}</li>
        ))}
      </ul>
    </div>
  );
}
