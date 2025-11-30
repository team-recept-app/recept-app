import { useState, useEffect } from "react";
import "../styles/recipePageStyles.css";
import "../styles/homepageStyles.css";
import type { Recipe } from "./api";

type RecipeAllergen = string | {
  code?: string;
  name?: string;
  description?: string;
};

type Props = {
  recipe: Recipe;
  onBack: () => void;
  onLogout: () => void;
};

export default function RecipePage({ recipe, onBack, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
   useEffect(() => {
    const root = document.querySelector(".app-root");
    if (root instanceof HTMLElement) {
      root.scrollTop = 0;
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);


  const allergenLabels = Array.isArray(recipe.allergens)
    ? (recipe.allergens as RecipeAllergen[])
        .map((a) =>
          typeof a === "string" ? a : a.name ?? a.code ?? ""
        )
        .filter((label) => label && label.trim().length > 0)
    : [];

  return (
    <div className="recipe-page-root">
      <header className="recipe-page-header">
        <button className="rp-btn rp-btn-back" onClick={onBack}>
          ← Vissza
        </button>

        <div className="recipe-page-brand">Főtt&Lefedve</div>

        <div className="menu">
          <button
            className="burger"
            onClick={() => setMenuOpen((v) => !v)}
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
                  onBack();
                }}
              >
                Kezdőlap
              </button>
              <button
                className="dd-item"
                onClick={() => {
                  setMenuOpen(false);
                  alert("Profilom később");
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

      <main className="recipe-page-main">
        <section className="recipe-hero">
          <div className="recipe-hero-left">
            {recipe.image_url ? (
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="recipe-hero-img"
              />
            ) : (
              <div className="recipe-hero-placeholder">
                Nincs kép ehhez a recepthez
              </div>
            )}
          </div>

          <div className="recipe-hero-right">
            <h1 className="recipe-title-large">{recipe.title}</h1>
            {recipe.summary && (
              <p className="recipe-summary-large">{recipe.summary}</p>
            )}

            <div className="recipe-meta-row">
              {recipe.category && (
                <span className="recipe-chip recipe-chip-category">
                  {recipe.category}
                </span>
              )}
              {recipe.average_rating != null && (
                <span className="recipe-chip recipe-chip-rating">
                  ⭐ {recipe.average_rating.toFixed(1)}
                </span>
              )}
            </div>

            {allergenLabels.length > 0 && (
              <div className="recipe-allergen-row">
                <div className="recipe-allergen-title">Allergének</div>
                <div className="recipe-allergen-chips">
                  {allergenLabels.map((label, idx) => (
                    <span
                      key={idx}
                      className="recipe-chip recipe-chip-allergen"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="recipe-section-block">
          <h2 className="recipe-section-title">Hozzávalók</h2>
          <ul className="recipe-list">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx}>{ing}</li>
            ))}
          </ul>
        </section>

        <section className="recipe-section-block">
          <h2 className="recipe-section-title">Elkészítés lépésről lépésre</h2>
          <ol className="recipe-steps">
            {recipe.steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
