import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import Wizard from "./pages/Wizard";
import Outputs from "./pages/Outputs";
import Launch from "./pages/Launch";
import { Toaster } from "sonner";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: "inherit" } }} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewProject />} />
        <Route path="/project/:id" element={<Wizard />} />
        <Route path="/project/:id/outputs" element={<Outputs />} />
        <Route path="/project/:id/launch" element={<Launch />} />
      </Routes>
    </BrowserRouter>
  );
}
