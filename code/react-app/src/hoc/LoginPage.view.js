import React, { useState } from "react";

const LoginPageView = ({
  username,
  password,
  setUsername,
  setPassword,
  signIn,
}) => {
  return (
    <div
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
      <button onClick={signIn}>Sign In</button>
    </div>
  );
};

export default LoginPageView;
