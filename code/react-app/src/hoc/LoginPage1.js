import React, { useEffect, useState } from "react";

import LoginPageView from "./LoginPage.view";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    if (username == "admin" && password == "pass") {
      // api call check

      // load user data

      //
      alert("Welcome back");
    } else {
      alert("wrong password or username");
    }
  };

  return (
    <LoginPageView
      username={username}
      password={password}
      signIn={signIn}
      setPassword={setPassword}
      setUsername={setUsername}
    />
  );
};

const TestComponent = ({ name, removeUser }) => {
  return <div onClick={removeUser}>Hello World: {name} </div>;
};

const withLogin = (Component) => {
  return function withLoginComponent(props) {
    return (
      <>
        <Component
          removeUser={() => {
            console.log("remove user from cookies");
          }}
          {...props}
        />
      </>
    );
  };
};

const NewLoginPage = withLogin(TestComponent);

export default NewLoginPage;
