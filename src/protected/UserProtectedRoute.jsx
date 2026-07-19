import React from 'react'
import { Navigate } from 'react-router-dom';
const UserProtectedRoute = ({children}) => {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return <Navigate to="/login-user" replace />;
  }
  return children;
}

export default UserProtectedRoute
