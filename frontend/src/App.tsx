import { useState, memo } from "react";
import { login, register } from "./api";
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
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  const switchToLogin = () => {
    setMode("login");
    clearFields();
  };

  const switchToRegister = () => {
    setMode("register");
    clearFields();
  };

  function clearFields() {
  setEmail("");
  setPw("");
  setPw2("");
  setName("");
  setError(null);
  setInfo(null);
}

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "register") {
      if (!name.trim() || !email.trim() || !pw.trim() || !pw2.trim()) {
        return setError("Minden mezőt ki kell tölteni.");
      }
      if (pw !== pw2) {
        return setError("A két jelszó nem egyezik.");
      }

      try {
        const user = await register(email.trim(), name.trim(), pw);
        setInfo(`Sikeres regisztráció: ${user.name}. Most jelentkezz be!`);
        setMode("login");
        setEmail("");
        setPw("");
        setPw2("");
        setName("");

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Sikertelen regisztráció");
      }
      return;
    }

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
  clearFields();
  setMode("login");
}

  if (!token) {
    return (
      <Shell>
        <div className="center-screen">
          <div className="glass-card">
            <h2 className="card-title">
              {mode === "login" ? "Bejelentkezés" : "Regisztráció"}
            </h2>

            <form onSubmit={onSubmit} className="form-grid">
              {mode === "register" && (
                <>
                  <label className="label">Felhasználónév</label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anna"
                  />
                </>
              )}

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

              {mode === "register" && (
                <>
                  <label className="label">Jelszó újra</label>
                  <input
                    className="input"
                    value={pw2}
                    onChange={(e) => setPw2(e.target.value)}
                    type="password"
                    placeholder="ismételd meg a jelszót"
                  />
                </>
              )}

              <button type="submit" className="btn-primary">
                {mode === "login" ? "Belépés" : "Regisztráció"}
              </button>

              {mode === "login" ? (
                <button
                  type="button"
                  className="btn-link"
                  onClick={switchToRegister}
                >
                  Nincs fiókod? Regisztrálj
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-link"
                  onClick={switchToLogin}
                >
                  Mégse, vissza a belépéshez
                </button>
              )}

              {error && <div className="error">{error}</div>}
              {info && <div className="info">{info}</div>}
              {mode === "login" && <div className="hint">user1@example.com / password1</div>}
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
        <p className="authed-text">
          Most már tudsz auth-olt kéréseket küldeni a backendnek (Bearer token).
        </p>
      </div>
    </Shell>
  );
}
