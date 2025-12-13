import { useState, memo } from "react";
import { API, forgotPassword, login, register, type Recipe } from "./api";
import Orb from "../components/Orb";
import "../styles/app.css";
import HomePage from "./HomePage";
import RecipePage from "./RecipePage";
import ProfilePage from "./ProfilePage";
import AdminUsersPage from "./AdminUsersPage";
import AdminAllergensPage from "./AdminAllergensPage";
import AdminCategoriesPage from "./AdminCategoriesPage";
import { useEffect } from "react";








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

  const resetToken = new URLSearchParams(window.location.search).get("reset_token");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean>(() => localStorage.getItem("is_admin") === "1");


  const [mode, setMode] = useState<"login" | "register" | "reset">(resetToken ? "reset" : "login");

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [userName, setUserName] = useState<string | null>(  () => localStorage.getItem("user_name"));
  const [userEmail, setUserEmail] = useState<string | null>(  () => localStorage.getItem("user_email"));

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(() => {
    const raw = localStorage.getItem("selectedRecipe");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Recipe;
    } catch {
      return null;
    }
  });

  const [view, setView] = useState<"home" | "profile" | "admin-users" | "admin-allergens" | "admin-categories">("home");

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

useEffect(() => {
  if (token) {
    const storedName = localStorage.getItem("user_name");
    const storedEmail = localStorage.getItem("user_email");

    if (storedName && !userName) {
      setUserName(storedName);
    }
    if (storedEmail && !userEmail) {
      setUserEmail(storedEmail);
    }
  }
}, [token]);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const reset = params.get("reset_token");

  if (reset) {
    setMode("reset");
    setToken(null);          // force auth off
  }
}, []);


  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "register") {
      if (!name.trim() || !email.trim() || !pw.trim() || !pw2.trim()) {
        setError("Minden mezőt ki kell tölteni.");
        return;
      }
      if (pw !== pw2) {
        setError("A két jelszó nem egyezik.");
        return;
      }

      try {
        const user = await register(email.trim(), name.trim(), pw);
        setInfo(`Sikeres regisztráció: ${user.name}. Most jelentkezz be!`);
        setMode("login");
        setEmail("");
        setPw("");
        setPw2("");
        setName("");
        setIsAdmin(false);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Sikertelen regisztráció"
        );
      }
      return;
    }

    try {
      const t = await login(email.trim(), pw);
      localStorage.setItem("access_token", t.access_token);
      localStorage.setItem("is_admin", String(t.is_admin));
      localStorage.setItem("user_id", String(t.user_id));
      localStorage.setItem("user_name", t.name);
      localStorage.setItem("user_email", email.trim());
      setToken(t.access_token);
      setIsAdmin(Boolean(Number(t.is_admin)));
      setUserName(t.name);
      setUserEmail(email.trim());
      console.log("LOGIN RESPONSE user_id:", t.user_id);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Sikertelen bejelentkezés"
      );
    }
  }

/*   function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("selectedRecipe");
    setToken(null);
    setSelectedRecipe(null);
    clearFields();
    setMode("login");
    setView("home");
  } */

    function logout() {
      localStorage.clear();   // 🔥 important
      clearFields();
      setToken(null);
      setUserName(null);
      setUserEmail(null);
      setSelectedRecipe(null);
      setMode("login");
      setView("home");
    }


  function openRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe);
    localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  }

  function backToHome() {
    setSelectedRecipe(null);
    localStorage.removeItem("selectedRecipe");
  }

  if (!token || mode === "reset") {
    return (
      <Shell>
        <div className="center-screen">
          <div className="glass-card">
              <h2 className="card-title">
                {mode === "login" && "Bejelentkezés"}
                {mode === "register" && "Regisztráció"}
                {mode === "reset" && "Jelszó módosítása"}
              </h2>
              {mode === "reset" ? (
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setError(null);
                    setInfo(null);

                    if (!newPw || !newPw2) {
                      setError("Minden mezőt ki kell tölteni.");
                      return;
                    }
                    if (newPw !== newPw2) {
                      setError("A két jelszó nem egyezik.");
                      return;
                    }

                    try {
                      const res = await fetch(`${API}/reset-password`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          token: resetToken,
                          password: newPw,
                        }),
                      });

                      const data = await res.json().catch(() => ({}));

                      if (!res.ok) {
                        setError(data.msg || "A jelszó módosítása nem sikerült.");
                        return;
                      }

                      setInfo("Jelszó sikeresen módosítva. Most jelentkezz be.");
                      setNewPw("");
                      setNewPw2("");
                      setMode("login");
                      window.history.replaceState({}, "", "/");

                    } catch {
                      setError("A jelszó módosítása nem sikerült.");
                    }
                  }}
                  className="form-grid"
                >
                  <label className="label">Új jelszó</label>
                  <input
                    className="input"
                    type="password"
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                  />

                  <label className="label">Új jelszó újra</label>
                  <input
                    className="input"
                    type="password"
                    value={newPw2}
                    onChange={e => setNewPw2(e.target.value)}
                  />

                  <button type="submit" className="btn-primary">
                    Jelszó módosítása
                  </button>

                  {error && <div className="error">{error}</div>}
                  {info && <div className="info">{info}</div>}
                </form>
              ) : (
                
              

            <form onSubmit={onSubmit} className="form-grid">
              {mode === "register" && (
                <>
                  <label className="label">Felhasználónév</label>
                  <input
                    className="input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Anna"
                  />
                </>
              )}

              <label className="label">Email</label>
              <input
                className="input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user1@example.com"
              />

              <label className="label">Jelszó</label>
              <input
                className="input"
                value={pw}
                onChange={e => setPw(e.target.value)}
                type="password"
                placeholder="password1"
              />

              {mode === "register" && (
                <>
                  <label className="label">Jelszó újra</label>
                  <input
                    className="input"
                    value={pw2}
                    onChange={e => setPw2(e.target.value)}
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

              {mode === "login" && (
                <button
                  type="button"
                  className="btn-link"
                  onClick={async () => {
                    setError(null);
                    setInfo(null);
                    if (!email.trim()) {
                      setError("Add meg az email címed.");
                      return;
                    }
                    try {
                      await forgotPassword(email.trim());
                      setInfo("Ha létezik fiók, elküldtük az emailt.");
                    } catch {
                      setError("Nem sikerült elküldeni az emailt.");
                    }
                  }}
                >
                  Elfelejtett jelszó
                </button>
              )}

              {error && <div className="error">{error}</div>}
              {info && <div className="info">{info}</div>}
              {mode === "login" && (
                <div className="hint">user1@example.com / password1</div>
              )}
            </form>
            )}
          </div>
        </div>
      </Shell>
    );
  }

return (
  <Shell>
    {selectedRecipe ? (
      <RecipePage
        recipe={selectedRecipe}
        onBack={backToHome}
        onLogout={logout}
        token={token as string}
      />
    ) : view === "home" ? (
      <HomePage
        onLogout={logout}
        onOpenRecipe={openRecipe}
        token={token as string}
        onOpenProfile={() => setView("profile")}
        isAdmin={isAdmin}
        onOpenAdminUsers={() => setView("admin-users")}   
        onOpenAdminAllergens={() => setView("admin-allergens")}
        onOpenAdminCategories={() => setView("admin-categories")}
      />
    ) : view === "admin-users" ? (                         
      <AdminUsersPage
        onBack={() => setView("home")}
        onLogout={logout}
      />
    ) : view === "admin-allergens" ? (                         
      <AdminAllergensPage
        onBack={() => setView("home")}
        onLogout={logout}
      />
    ) : view === "admin-categories" ? (
      <AdminCategoriesPage
        onBack={() => setView("home")}
        onLogout={logout}
      />
    ) : (
      <ProfilePage
  onLogout={logout}
  onBackHome={() => setView("home")}
  token={token}
  
  onOpenRecipe={openRecipe}
      />
    )}
  </Shell>
);
}
