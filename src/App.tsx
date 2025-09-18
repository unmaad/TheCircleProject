import { useState, useEffect } from "react";
import CirclesApp from "./components/circle-app-screen";
import LoginScreen from "./components/login-screen";

export default function App() {
  const [user, setUser] = useState<any>(() => {
    try {
      const raw = localStorage.getItem("circlesUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("circlesUser", JSON.stringify(user));
  }, [user]);

  if (!user) return <LoginScreen onLogin={(u: any) => setUser(u)} />;

  const handleLogout = () => {
    // remove stored user and any ephemeral user keys
    localStorage.removeItem("circlesUser");
    // optionally remove ephemeral name
    // localStorage.removeItem("circles:me");
    setUser(null);
  };

  return <CirclesApp user={user} onLogout={handleLogout} />;
}
