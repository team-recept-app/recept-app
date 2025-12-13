import { useState, useEffect } from "react";
import "../styles/recipePageStyles.css";
import "../styles/homepageStyles.css";
import { API, addFavorite, removeFavorite, type Recipe } from "./api";

type Props = {
  recipe: Recipe;
  onBack: () => void;
  onLogout: () => void;
  token: string;
};

export default function RecipePage({ recipe: recipe, onBack, onLogout, token }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(!!recipe.is_favorite);
  const [favLoading, setFavLoading] = useState(false);
  const [favError, setFavError] = useState<string | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState(recipe);
  



  /* ---------- EDIT MODE ---------- */
  const [isEditing, setIsEditing] = useState(false);

  const [editTitle, setEditTitle] = useState(currentRecipe.title);
  const [editSummary, setEditSummary] = useState(currentRecipe.summary ?? "");
  const [editIngredients, setEditIngredients] = useState<string[]>([
    ...currentRecipe.ingredients,
  ]);
  const [editSteps, setEditSteps] = useState<string[]>([...currentRecipe.steps]);
  const [editAllergens, setEditAllergens] = useState(
    currentRecipe.allergens.map(a => ({ ...a }))
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ---------- FAVORITES ---------- */

  async function toggleFavorite() {
    if (isEditing) return;

    setFavError(null);
    setFavLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(currentRecipe.id, token);
        setIsFavorite(false);
      } else {
        await addFavorite(currentRecipe.id, token);
        setIsFavorite(true);
      }
    } catch {
      setFavError("Nem sikerült módosítani a kedvencek között.");
    } finally {
      setFavLoading(false);
    }
  }

  /* ---------- HELPERS ---------- */

  function resetEdits() {
    setEditTitle(currentRecipe.title);
    setEditSummary(currentRecipe.summary ?? "");
    setEditIngredients([...currentRecipe.ingredients]);
    setEditSteps([...currentRecipe.steps]);
    setEditAllergens(currentRecipe.allergens.map(a => ({ ...a })));
  }

  function removeIngredient(idx: number) {
    setEditIngredients(editIngredients.filter((_, i) => i !== idx));
  }

  function removeStep(idx: number) {
    setEditSteps(editSteps.filter((_, i) => i !== idx));
  }

  function removeAllergen(idx: number) {
    setEditAllergens(editAllergens.filter((_, i) => i !== idx));
  }

  /* ---------- SAVE ---------- */

async function saveRecipe() {
  setSaveError(null);
  setSaving(true);

  try {
    const origCodes = currentRecipe.allergens.map(a => a.code).filter(Boolean).sort();
    const editCodes = editAllergens.map(a => a.code).filter(Boolean).sort();

    const body: any = {
      title: editTitle.trim(),
      summary: editSummary.trim(),
      ingredients: editIngredients.filter(i => i.trim()),
      steps: editSteps.filter(s => s.trim()),
      category: currentRecipe.category,
      image_url: currentRecipe.image_url,
    };

    if (JSON.stringify(origCodes) !== JSON.stringify(editCodes)) {
      body.allergens = editCodes;
    }

    const res = await fetch(`${API}/recipes/${currentRecipe.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    // ✅ ONLY update local recipe AFTER successful save
    setCurrentRecipe(prev => ({
      ...prev,
      title: body.title,
      summary: body.summary,
      ingredients: body.ingredients,
      steps: body.steps,
      allergens: editAllergens.filter(a => a.code),
    }));

    setIsEditing(false);
  } catch {
    setSaveError("Nem sikerült menteni a receptet.");
  } finally {
    setSaving(false);
  }
}




  /* ================== RENDER ================== */

  return (
    <div className="recipe-page-root">
      <header className="recipe-page-header">
        <button className="rp-btn rp-btn-back" onClick={onBack}>
          ← Vissza
        </button>

        <div className="recipe-page-brand">Főtt&Lefedve</div>

        <div className="menu">
          <button className="burger" onClick={() => setMenuOpen(v => !v)}>
            <span /><span /><span />
          </button>
          {menuOpen && (
            <div className="dropdown" onMouseLeave={() => setMenuOpen(false)}>
              <button className="dd-item" onClick={onBack}>Kezdőlap</button>
              <button className="dd-item danger" onClick={onLogout}>Kijelentkezés</button>
            </div>
          )}
        </div>
      </header>

      <main className="recipe-page-main">
        {/* ---------- HERO ---------- */}
        <section className="recipe-hero">
          {/* LEFT */}
          <div className="recipe-hero-left">
            {currentRecipe.image_url ? (
              <img
                src={`${API}/api/images/${currentRecipe.image_url}`}
                alt={currentRecipe.title}
                className="recipe-hero-img"
              />
            ) : (
              <div className="recipe-hero-placeholder">Nincs kép</div>
            )}

            <button
              className={
                "rp-fav-btn rp-fav-btn-under-image" +
                (isFavorite ? " rp-fav-btn--active" : "") +
                (favLoading ? " rp-fav-btn--loading" : "") +
                (isEditing ? " rp-fav-btn--disabled" : "")
              }
              onClick={toggleFavorite}
              disabled={favLoading || isEditing}
            >
              {isFavorite ? "★ Kedvenc" : "☆ Kedvencekhez"}
            </button>

            {favError && <div className="rp-fav-error">{favError}</div>}
          </div>

          {/* RIGHT */}
          <div className="recipe-hero-right">
            {/* TITLE */}
            {isEditing ? (
              <input
                className="rp-edit-input rp-edit-title"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
              />
            ) : (
              <h1 className="recipe-title-large">{currentRecipe.title}</h1>
            )}

            {/* SUMMARY */}
            {isEditing ? (
              <textarea
                className="rp-edit-textarea rp-edit-summary"
                value={editSummary}
                onChange={e => setEditSummary(e.target.value)}
              />
            ) : (
              currentRecipe.summary && (
                <p className="recipe-summary-large">{currentRecipe.summary}</p>
              )
            )}

            {/* META */}
            <div className="recipe-meta-row">
              {currentRecipe.category && (
                <span className="recipe-chip recipe-chip-category">
                  {currentRecipe.category}
                </span>
              )}
              {currentRecipe.average_rating != null && (
                <span className="recipe-chip recipe-chip-rating">
                  ⭐ {currentRecipe.average_rating.toFixed(1)}
                </span>
              )}
            </div>

            {/* ALLERGENS */}
            <div className="recipe-allergen-row">
              <div className="recipe-allergen-title">Allergének</div>
              <div className="recipe-allergen-chips">
                {(isEditing ? editAllergens : currentRecipe.allergens).map((a, idx) => (
                  <span
                    key={idx}
                    className="recipe-chip recipe-chip-allergen ingredient-item--editable"
                  >
                    {a.name ?? a.code}
                    <button
                      className={
                        "ingredient-delete" +
                        (!isEditing ? " ingredient-delete--disabled" : "")
                      }
                      disabled={!isEditing}
                      onClick={() => isEditing && removeAllergen(idx)}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="recipe-action-row">
              <button
                className={"rp-btn" + (isEditing ? " rp-btn-muted" : "")}
                onClick={() => !isEditing && setIsEditing(true)}
                disabled={isEditing}
              >
                ✏️ Szerkesztés
              </button>

<button
  type="button"
  className="rp-btn rp-btn-primary"
  onClick={saveRecipe}
  disabled={!isEditing || saving}
>
  💾 Mentés
</button>


              <button
                className="rp-btn"
                onClick={() => {
                  resetEdits();
                  setIsEditing(false);
                }}
                disabled={!isEditing || saving}
              >
                ✖ Mégse
              </button>
            </div>

            {saveError && <div className="rp-fav-error">{saveError}</div>}
          </div>
        </section>

        {/* INGREDIENTS */}
<section className="recipe-section-block">
  <h2 className="recipedetails-section-title">Hozzávalók</h2>

  <div className="ingredient-grid">
    {(isEditing ? editIngredients : currentRecipe.ingredients).map((ing, idx) => (
      <div key={idx} className="ingredient-item ingredient-item--editable">
        <span className="ingredient-text">{ing}</span>
        <button
          className={
            "ingredient-delete" +
            (!isEditing ? " ingredient-delete--disabled" : "")
          }
          disabled={!isEditing}
          onClick={() => isEditing && removeIngredient(idx)}
        >
          ✕
        </button>
      </div>
    ))}

    {/* ➕ NEW INGREDIENT — MUST BE INSIDE GRID */}
    {isEditing && (
      <div className="ingredient-item ingredient-item--new">
<input
  className="ingredient-input"
  placeholder="+ új hozzávaló"
  onKeyDown={e => {
    const input = e.target as HTMLInputElement;
    const v = input.value.trim();
    if (e.key === "Enter" && v) {
      setEditIngredients(prev => [...prev, v]);
      input.value = "";
    }
  }}
  onBlur={e => {
    const v = e.target.value.trim();
    if (v) {
      setEditIngredients(prev => [...prev, v]);
      e.target.value = "";
    }
  }}
/>

      </div>
    )}
  </div>
</section>


        {/* STEPS GRID */}
        <section className="recipe-section-block">
          <h2 className="recipedetails-section-title">Elkészítés</h2>

          <div className="steps-grid">
            {(isEditing ? editSteps : currentRecipe.steps).map((step, idx) => (
              <div key={idx} className="step-item">
                <div className="step-header">
                  <div className="step-index">{idx + 1}.</div>
                  <button
                    className={
                      "ingredient-delete" +
                      (!isEditing ? " ingredient-delete--disabled" : "")
                    }
                    disabled={!isEditing}
                    onClick={() => isEditing && removeStep(idx)}
                  >
                    ✕
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    className="rp-edit-textarea step-text"
                    value={step}
                    onChange={e => {
                      const next = [...editSteps];
                      next[idx] = e.target.value;
                      setEditSteps(next);
                    }}
                  />
                ) : (
                  <div className="rp-edit-textarea rp-edit-textarea--view step-text">
                    {step}
                  </div>
                )}
              </div>
            ))}

            {/* ➕ NEW STEP (same idea as new ingredient) */}
            {isEditing && (
              <div className="step-item step-item--new">
                <div className="step-header">
                  <div className="step-index">+</div>
                </div>

                <textarea
  className="rp-edit-textarea step-text step-text--new"
  placeholder="+ új lépés"
  onKeyDown={e => {
    const input = e.target as HTMLTextAreaElement;
    const v = input.value.trim();
    if (e.key === "Enter" && !e.shiftKey && v) {
      e.preventDefault();
      setEditSteps(prev => [...prev, v]);
      input.value = "";
    }
  }}
  onBlur={e => {
    const v = e.target.value.trim();
    if (v) {
      setEditSteps(prev => [...prev, v]);
      e.target.value = "";
    }
  }}
/>

              </div>
            )}
          </div>

        </section>
      </main>
    </div>
  );
}
