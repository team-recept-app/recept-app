import { useEffect, useState } from "react";
import { fetchRecipes, type Recipe } from "./api";

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function load(query?: string) {
    try {
      setLoading(true);
      setErr(null);
      const data = await fetchRecipes(query);
      setRecipes(data.recipes);
    } catch (e: any) {
      setErr(e?.message ?? "Hiba történt");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    load(q);
  }

  return (
    <div style={{ fontFamily: "system-ui, Arial", padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1>Recept kereső (minimal)</h1>

      <form onSubmit={onSubmit} style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14 }}>Mit szeretnél ma enni?</label>
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="pl. csirke, leves, tészta..."
            style={{
              flex: 1,
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "1px solid #333",
              background: "#111",
              color: "white",
              cursor: "pointer",
            }}
          >
            Keresés
          </button>
        </div>
      </form>

      {loading && <p>Betöltés…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {recipes.map((r) => (
          <li
            key={r.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7 }}>{r.category || "Kategória nélkül"}</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{r.title}</div>
            {r.summary && <div style={{ marginTop: 6 }}>{r.summary}</div>}
            {r.ingredients?.length ? (
              <div style={{ marginTop: 8, fontSize: 14 }}>
                <b>Hozzávalók:</b> {r.ingredients.join(", ")}
              </div>
            ) : null}
            {r.average_rating != null && <div style={{ marginTop: 6 }}>⭐ {r.average_rating}</div>}
          </li>
        ))}
      </ul>

      {!loading && !recipes.length && <p>Nincs találat.</p>}
    </div>
  );
}
