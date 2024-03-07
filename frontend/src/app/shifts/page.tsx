'use client';
import { useQuery } from "react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"; // Import relativeTime plugin
import { fetchShifts } from "../../api";

dayjs.extend(relativeTime); // Use the relativeTime plugin

function DisplayShifts() {
  const { data: shifts, isLoading, error } = useQuery({
    queryKey: ["shifts"],
    queryFn: fetchShifts,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">All Shifts</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shifts?.map((shift) => (
          <div key={shift.ID} className="border rounded-lg overflow-hidden shadow-lg p-4">
            <h2 className="font-bold text-lg">Type: {shift.Type}</h2>
            <p>Start: {dayjs(shift.StartTime).format('MMMM D, YYYY h:mm A')}</p>
            <p>End: {dayjs(shift.EndTime).format('MMMM D, YYYY h:mm A')}</p>
            <p className="text-sm text-gray-600">Starts {dayjs(shift.StartTime).fromNow()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DisplayShifts;
