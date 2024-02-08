import "./App.css";
import { getGoogleUrl } from "./util/getGoogleOauthUrl";

function App() {
  return (
    <div>
      <h1>App</h1>
      <a href={getGoogleUrl("")}>login</a>
    </div>
  );
}

export default App;
