"use client";
import { useQuery } from "react-query";
import { fetchShifts } from "../../api";

function DisplayShifts() {
  const { data: shifts, isLoading, error } = useQuery({
    queryKey: ["shifts"],
    queryFn: fetchShifts,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred</div>;

  return (
    <>
      <h1>All Shifts</h1>
      <ul>
        {shifts?.map((shift) => (
          <li key={shift.ID}>
            Start: {shift.StartTime}, End: {shift.EndTime}, Type: {shift.Type}
          </li>
        ))}
      </ul>
    </>
  );
}

export default DisplayShifts;
