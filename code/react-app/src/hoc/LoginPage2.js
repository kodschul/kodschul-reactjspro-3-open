import React, { useState } from "react";
import { useSignIn } from "./useSignIn";

const LoginPage = () => {
  const { username, setUsername, password, setPassword, signIn } = useSignIn();
  return (
    <div
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={signIn}>Sign In</button>
    </div>
  );
};

export default LoginPage;
