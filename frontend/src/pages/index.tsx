import { useQuery } from "@tanstack/react-query";
import { getGoogleUrl } from "../util/getGoogleOauthUrl";
import { useEffect, useState } from "react";


type User = {
  ID: number;
  Name: string;
  Email: string;
  Type: string;
}

export default function Home() {
  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      fetch("http://127.0.0.1:8080/users/me", {
        method: "GET",
        credentials: "include",
      }).then((res) => res.json()),
  });

  const [users, setUsers] = useState<User[]>([]); // State to hold the fetched users

  useEffect(() => {
    // Function to fetch users
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8080/users/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: User[] = await response.json();
        setUsers(data); 
      } catch (error) {
        console.error('There was a problem fetching the users:', error);
      }
    };

    fetchUsers();
  }, []); 
  
  console.log(data);
  return (
    <>
      <h1>Home</h1>
      <div>user: {JSON.stringify(data) ?? "not logged in"}</div>
      <p>hi hihi </p>

      <ul className="">
        {users.map(user => (
          <li key={user.ID} className="border p-8 border-blue-500 text-green-600 font-semibold">
            Name: {user.Name || 'N/A'}, Email: {user.Email}, Type: {user.Type} 
          </li>
        ))}
      </ul>

      <a href={getGoogleUrl("/")}>Login with Google</a>
    </>
  );
}
