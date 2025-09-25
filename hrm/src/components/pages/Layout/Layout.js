import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "../Topbar/Topbar";
import { useAuth } from "../../../context/AuthContext";
export default function Layout() {
  const {user}=useAuth()
  console.log('the use at the dashbor is;',user.user)
  return (
    <>
      <Topbar userName={user?.user?.first_name} logoSrc="/hrm-logo.png" />
      <main className="p-4 max-w-screen-2xl mx-auto">
        <Outlet />
      </main>
    </>
  );
}
