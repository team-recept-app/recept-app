import { useEffect, useState } from "react";
import "../styles/recipePageStyles.css";
import "../styles/homepageStyles.css";
import { API, type Category } from "./api";

type Props = {
  onBack: () => void;
  onLogout: () => void;
};

export default function AdminCategoriesPage({ onBack, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const root = document.querySelector(".app-root");
    if (root instanceof HTMLElement) root.scrollTop = 0;
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);

    const res = await fetch(`${API}/admin/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 403) {
      alert("Nincs admin jogosultság");
      onBack();
      return;
    }

    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  function startEdit(c: Category) {
    setIsEditing(true);
    setEditingId(c.id);

    setEditCode(c.code);
    setEditName(c.name);
    setEditDescription(c.description ?? "");
  }

  function startCreate() {
    setIsEditing(true);
    setEditingId(null);

    setEditCode("");
    setEditName("");
    setEditDescription("");
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditingId(null);
    setEditCode("");
    setEditName("");
    setEditDescription("");
  }

  async function saveCategory() {
    if (!editCode.trim() || !editName.trim()) {
      alert("Kód és név kötelező");
      return;
    }

    if (editingId === null) {
      // CREATE
      await fetch(`${API}/admin/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: editCode,
          name: editName,
          description: editDescription,
        }),
      });
    } else {
      // UPDATE
      await fetch(`${API}/admin/categories/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: editCode,
          name: editName,
          description: editDescription,
        }),
      });
    }

    cancelEdit();
    loadCategories();
  }

  async function deleteCategory(c: Category) {
    if (!confirm(`Biztos törlöd: ${c.name}?`)) return;

    await fetch(`${API}/admin/categories/${c.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    loadCategories();
  }

  return (
    <div className="recipe-page-root">
      <header className="recipe-page-header">
        <button className="rp-btn rp-btn-back" onClick={onBack}>
          ← Vissza
        </button>

        <div className="recipe-page-brand">Admin · Kategóriák</div>

        <div className="menu">
          <button className="burger" onClick={() => setMenuOpen(v => !v)}>
            <span /><span /><span />
          </button>

          {menuOpen && (
            <div className="dropdown">
              <button className="dd-item" onClick={onBack}>
                Kezdőlap
              </button>
              <button className="dd-item danger" onClick={onLogout}>
                Kijelentkezés
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="recipe-page-main">
        <section className="recipe-section-block">
          <div className="recipe-section-title">Kategóriák</div>

          {loading ? (
            <div>Betöltés…</div>
          ) : (
            <div className="allergen-user-list">
              {categories.map(c => (
                <div
                  key={c.id}
                  className={
                    "allergen-user-row" +
                    (isEditing && editingId === c.id ? " is-editing" : "")
                  }
                >
                  <div className="allergen-user-info">
                    {isEditing && editingId === c.id ? (
                      <>
                        <input
                          className="input"
                          value={editCode}
                          onChange={e => setEditCode(e.target.value)}
                        />
                        <input
                          className="input"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                        />
                        <input
                          className="input"
                          value={editDescription}
                          onChange={e => setEditDescription(e.target.value)}
                        />
                      </>
                    ) : (
                      <>
                        <div><strong>{c.code}</strong> – {c.name}</div>
                        {c.description && (
                          <div className="admin-user-email">
                            {c.description}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="admin-user-actions">
                    {isEditing && editingId === c.id ? (
                      <>
                        <button className="rp-btn" onClick={saveCategory}>
                          Mentés
                        </button>
                        <button className="rp-btn" onClick={cancelEdit}>
                          Mégse
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="rp-btn"
                          disabled={isEditing}
                          onClick={() => startEdit(c)}
                        >
                          Módosítás
                        </button>
                        <button
                          className="rp-btn danger"
                          disabled={isEditing}
                          onClick={() => deleteCategory(c)}
                        >
                          Törlés
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* CREATE ROW */}
              <div
                className={
                  "allergen-user-row" +
                  (isEditing && editingId === null ? " is-editing" : "")
                }
              >
                <div className="allergen-user-info">
                  {isEditing && editingId === null ? (
                    <>
                      <input
                        className="input"
                        placeholder="Kód (pl. MAIN)"
                        value={editCode}
                        onChange={e => setEditCode(e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Név"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Leírás"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                      />
                    </>
                  ) : (
                    <strong>＋ Új kategória</strong>
                  )}
                </div>

                <div className="admin-user-actions">
                  {isEditing && editingId === null ? (
                    <>
                      <button className="rp-btn" onClick={saveCategory}>
                        Létrehozás
                      </button>
                      <button className="rp-btn" onClick={cancelEdit}>
                        Mégse
                      </button>
                    </>
                  ) : (
                    <button
                      className="rp-btn"
                      disabled={isEditing}
                      onClick={startCreate}
                    >
                      Létrehozás
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
