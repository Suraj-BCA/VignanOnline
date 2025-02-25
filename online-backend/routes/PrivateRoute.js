import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("studentToken");
  return token ? children : <Navigate to="/student-login" />;
};

export default PrivateRoute;
