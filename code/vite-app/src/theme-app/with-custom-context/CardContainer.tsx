import React, { useContext } from "react";
import { theme } from "./theme-util";

const CardContainer = ({ children }) => {
  return (
    <div
      style={
        theme.isDark
          ? { background: "black", color: "white" }
          : { background: "whitesmoke", color: "black" }
      }
    >
      {children}
    </div>
  );
};

export default CardContainer;
