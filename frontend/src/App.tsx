import { useState, memo } from "react";
import { login } from "./api";
import Orb from "../components/Orb";
import "../styles/app.css";

const Shell = memo(function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-root">
      <div className="bg-layer">
        <div className="bg-base" />
        <div className="orb-center">
          <Orb hue={35} hoverIntensity={0.11} rotateOnHover forceHoverState />
        </div>
      </div>
      <div className="content-layer">{children}</div>
    </div>
  );
});

export default function App() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const t = await login(email.trim(), pw);
      localStorage.setItem("token", t);
      setToken(t);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sikertelen bejelentkezés");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  if (!token) {
    return (
      <Shell>
        <div className="center-screen">
          <div className="glass-card">
            <h2 className="card-title">Bejelentkezés</h2>
            <form onSubmit={onSubmit} className="form-grid">
              <label className="label">Email</label>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user1@example.com"
              />
              <label className="label">Jelszó</label>
              <input
                className="input"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                type="password"
                placeholder="password1"
              />
              <button type="submit" className="btn-primary">Belépés</button>
              {error && <div className="error">{error}</div>}
              <div className="hint">user1@example.com / password1</div>
            </form>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="authed-wrap">
        <div className="authed-bar">
          <h2 className="authed-title">Be vagy jelentkezve ✅</h2>
          <button onClick={logout} className="btn-outline">Kijelentkezés</button>
        </div>
        <p className="authed-text">Most már tudsz auth-olt kéréseket küldeni a backendnek (Bearer token).</p>
      </div>
    </Shell>
  );
}
