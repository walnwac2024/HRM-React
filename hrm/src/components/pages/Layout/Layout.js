import React from "react";
import { Outlet } from "react-router-dom";
import Topbar from "../Topbar/Topbar";

export default function Layout() {
  return (
    <>
      <Topbar userName="John Doe" logoSrc="/images/logo.png" />
      <main className="p-4 max-w-screen-2xl mx-auto">
        <Outlet />
      </main>
    </>
  );
}
