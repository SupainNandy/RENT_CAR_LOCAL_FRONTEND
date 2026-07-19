import React from "react";
import { Outlet } from "react-router-dom";
import User from "../Component/User.jsx"; // your navbar
import UserChat from "../Component/UserChat.jsx";

const UserLayout = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#000000" }}>
      <User />   {/* Navbar always visible */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%" }}>
        <Outlet /> {/* Child pages will render here */}
      </div>
      <UserChat />
    </div>
  );
};

export default UserLayout;
