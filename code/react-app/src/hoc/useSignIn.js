import React, { useState } from "react";

export const useSignIn = () => {
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

  return { username, setUsername, password, setPassword, signIn };
};
