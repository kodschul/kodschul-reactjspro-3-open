import logo from "./logo.svg";
import "./App.css";

const useUser = () => {
  return { name: "Franz", isLoggedIn: true, signOut: () => null };
};

const App = () => {
  const user = useUser();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />

        <UserComponent username={user.name} isLoggedIn={user.isLoggedIn} />
      </header>
    </div>
  );
};

const UserComponent = ({ username, isLoggedIn }) => {
  return (
    <div>
      <UserProfile username={username} isLoggedIn={isLoggedIn} />
    </div>
  );
};

const UserProfile = ({ isLoggedIn, username }) => {
  return (
    <div>
      Username: {isLoggedIn ? username : "Bitte anmelden"}
      <button>{isLoggedIn ? "Sign out" : "Sign in"}</button>
    </div>
  );
};

export default App;
