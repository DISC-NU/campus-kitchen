import { useQuery } from "@tanstack/react-query";
import { getGoogleUrl } from "../util/getGoogleOauthUrl";

export default function Home() {
  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      fetch("http://127.0.0.1:8080/users/me", {
        method: "GET",
        credentials: "include",
      }).then((res) => res.json()),
  });
  console.log(data);
  return (
    <>
      <h1>Home</h1>
      <div>user: {JSON.stringify(data) ?? "not logged in"}</div>
      <a href={getGoogleUrl("/")}>Login with Google</a>
    </>
  );
}
