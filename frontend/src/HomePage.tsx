import { useEffect, useMemo, useState } from "react";
import { fetchRecipes, fetchAllergens, type Recipe, type Allergen,API } from "./api";
import "../styles/homepageStyles.css";
import ElectricBorder from "../components/ElectricBorder";




export default function HomePage({
  onLogout,
  onOpenRecipe,
}: {
  onLogout: () => void;
  onOpenRecipe: (recipe: Recipe) => void;
}) {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [view, setView] = useState<Recipe[]>([]);
  const [category, setCategory] = useState("");
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [excludedCodes, setExcludedCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadAllergens();
    loadRecipes();
  }, []);

  useEffect(() => {
    refilter(recipes, query, category, excludedCodes);
  }, [recipes, query, category, excludedCodes]);

  async function loadAllergens() {
    const list = await fetchAllergens().catch(() => []);
    setAllergens(list);
  }

  async function loadRecipes(opts?: { q?: string; exclude?: string[] }) {
    setLoading(true);
    try {
      const data = await fetchRecipes(opts);
      setRecipes(data.recipes);
    } finally {
      setLoading(false);
    }
  }

  function refilter(base: Recipe[], q: string, cat: string, excluded: string[]) {
    const ql = q.trim().toLowerCase();
    const list = base.filter(r => {
      const text =
        r.title.toLowerCase().includes(ql) ||
        (r.summary?.toLowerCase().includes(ql) ?? false);
      const catOk = cat ? r.category === cat : true;
      const recipeAllergenCodes = new Set(r.allergens.map(a => a.code.toUpperCase()));
      const hasExcluded = excluded.some(c => recipeAllergenCodes.has(c.toUpperCase()));
      return text && catOk && !hasExcluded;
    });
    setView(list);
  }

  function onQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    loadRecipes({ q: v, exclude: excludedCodes });
  }

  function toggleAllergen(code: string) {
    const next = excludedCodes.includes(code)
      ? excludedCodes.filter(c => c !== code)
      : [...excludedCodes, code];
    setExcludedCodes(next);
    loadRecipes({ q: query, exclude: next });
  }

  const categories = useMemo(
    () => Array.from(new Set(recipes.map(r => r.category).filter(Boolean))) as string[],
    [recipes]
  );



  return (
    <div className="home-root">
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
          <button className="burger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            <span />
            <span />
            <span />
          </button>
          {menuOpen && (
            <div className="dropdown" onMouseLeave={() => setMenuOpen(false)}>
              <button className="dd-item" onClick={() => setMenuOpen(false)}>Kezdőlap</button>
              <button className="dd-item" onClick={() => alert("Profilom később")}>Profilom</button>
              <button className="dd-item danger" onClick={onLogout}>Kijelentkezés</button>
            </div>
          )}
        </div>
      </header>
    </ElectricBorder>

      <main className="page-content">
  <h2 className="home-title">Mit szeretnél ma enni?</h2>

  <div className="search-panel">
    <div className="search-row">
      <input
        className="search-input"
        placeholder="Keresés receptek között..."
        value={query}
        onChange={onQueryChange}
      />

      <select
        className="filter-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Összes kategória</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  </div>

  <div className="allergen-box">
    <div className="allergen-title">Allergének kizárása</div>
    <div className="allergen-list">
      {allergens.length === 0 ? (
        <div className="allergen-empty">Nincs allergén adat</div>
      ) : (
        allergens.map((a) => (
          <label
            key={a.code}
            className={
              "allergen-item" +
              (excludedCodes.includes(a.code) ? " allergen-item--active" : "")
            }
          >
            <input
              type="checkbox"
              className="allergen-checkbox"
              checked={excludedCodes.includes(a.code)}
              onChange={() => toggleAllergen(a.code)}
            />
            <span>{a.name}</span>
          </label>
        ))
      )}
    </div>
  </div>

  <div className="recipe-section">
  {loading && (
    <div className="loading-overlay">
      <p className="loading-text">Betöltés...</p>
    </div>
  )}

  <div className="recipe-grid">
    {view.map((r) => (
      <div
        key={r.id}
        className="recipe-card"
        onClick={() => onOpenRecipe(r)}
      >
        {r.image_url && (
          <img src={`${API}/api/images/${r.image_url}`} alt={r.title} className="recipe-img" />
        )}
        <div className="recipe-info">
          <h3 className="recipe-title">{r.title}</h3>
          <p className="recipe-summary">{r.summary}</p>
          {r.average_rating != null && (
            <div className="recipe-rating">⭐ {r.average_rating}</div>
          )}
        </div>
      </div>
    ))}
  </div>

  {!loading && view.length === 0 && (
    <p className="no-results">Nincs találat.</p>
  )}
</div>


</main>

    </div>
  );
}
