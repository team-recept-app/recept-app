import { useEffect, useState } from "react";
import { fetchRecipes, API, type Recipe } from "./api";
import "../styles/profilePageStyles.css";
import "../styles/homepageStyles.css"; 
import ElectricBorder from "../components/ElectricBorder";

type Props = {
  onLogout: () => void;
  onBackHome: () => void;
  onOpenRecipe?: (recipe: Recipe) => void;
  userEmail?: string | null;
  userName?: string | null;
  token?: string | null;
};

export default function ProfilePage({
  onLogout,
  onBackHome,
  onOpenRecipe,
  userEmail,
  userName,
  token,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

const displayName =
  localStorage.getItem("user_name") || "Guest";

const displayEmail =
  localStorage.getItem("user_email") || "Nincs email adat";

console.log("PROFILE localStorage dump:", {
  user_name: localStorage.getItem("user_name"),
  user_email: localStorage.getItem("user_email"),
  token: localStorage.getItem("access_token"),
});

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadFavorites() {
    setLoading(true);
    try {
      const data = await fetchRecipes({ favorites: true }, token || undefined);
      setFavorites(data.recipes);
    } catch (err) {
      console.error("Nem sikerült betölteni a kedvenceket:", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="profile-root">
      <ElectricBorder
        color="#9c851bff"
        speed={0.3}
        chaos={0.2}
        thickness={2}
        className="electric-border-bottom"
        style={{ borderRadius: 0 }}
      >
        <header className="sticky-header">
          <div className="brand">Főtt&Lefedve</div>
          <div className="menu">
            <button
              className="burger"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu"
            >
              <span />
              <span />
              <span />
            </button>
            {menuOpen && (
              <div
                className="dropdown"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  className="dd-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onBackHome();
                  }}
                >
                  Kezdőlap
                </button>
                <button
                  className="dd-item"
                  onClick={() => {
                    setMenuOpen(false);
                  }}
                >
                  Profilom
                </button>
                <button
                  className="dd-item danger"
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                >
                  Kijelentkezés
                </button>
              </div>
            )}
          </div>
        </header>
      </ElectricBorder>

      <main className="profile-content">
        <section className="profile-header-section">
          <h2 className="profile-title">Profilom</h2>
          <div className="profile-card">
            <div className="profile-row">
              <span className="profile-label">Név:</span>
              <span className="profile-value">{displayName}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">E-mail:</span>
              <span className="profile-value">{displayEmail}</span>
            </div>
          </div>
        </section>

        <section className="favorites-section">
          <h3 className="favorites-title">Kedvenc receptjeim</h3>

          {loading && (
            <div className="favorites-loading">
              Betöltés...
            </div>
          )}

          {!loading && favorites.length === 0 && (
            <p className="favorites-empty">
              Jelenleg nincs kedvenc recepted.
            </p>
          )}

          {!loading && favorites.length > 0 && (
            <div className="favorites-grid">
              {favorites.map(r => (
                <div
                  key={r.id}
                  className="recipe-card"
                  onClick={() => onOpenRecipe && onOpenRecipe(r)}
                >
                  {r.image_url && (
                    <img
                      src={`${API}/api/images/${r.image_url}`}
                      alt={r.title}
                      className="recipe-img"
                    />
                  )}
                  <div className="recipe-info">
                    <h4 className="recipe-title">{r.title}</h4>
                    <p className="recipe-summary">{r.summary}</p>
                    {r.average_rating != null && (
                      <div className="recipe-rating">⭐ {r.average_rating}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
