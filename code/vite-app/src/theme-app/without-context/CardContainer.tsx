import React, { useContext } from "react";
import { useTheme } from "./theme";

const CardContainer = ({ children, isDark }) => {
  return (
    <div
      style={
        isDark
          ? { background: "black", color: "white" }
          : { background: "whitesmoke", color: "black" }
      }
    >
      {children}
    </div>
  );
};

export default CardContainer;
