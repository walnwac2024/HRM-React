import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "../Topbar/Topbar";
import { useAuth } from "../../../context/AuthContext";

export default function Layout() {
  const { user } = useAuth();

  // Build a safe display name no matter how user is shaped
  // Support both { user: {...} } (old) and {...} (new) shapes
  const u = user?.user ? user.user : user;
  const userName =
    u?.name ||
    [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
    u?.email ||
    "User";

  return (
    <>
      <Topbar userName={userName} logoSrc="/hrm-logo.png" />
      <main className="p-4 max-w-screen-2xl mx-auto">
        <Outlet />
      </main>
    </>
  );
}
