import { useEffect, useState } from "react";
import "../styles/recipePageStyles.css";
import "../styles/homepageStyles.css";
import { API, type Allergen } from "./api";

type Props = {
  onBack: () => void;
  onLogout: () => void;
};

export default function AdminAllergensPage({ onBack, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [allergens, setAllergens] = useState<Allergen[]>([]);
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
    loadAllergens();
  }, []);

  async function loadAllergens() {
    setLoading(true);

    const res = await fetch(`${API}/admin/allergens`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 403) {
      alert("Nincs admin jogosultság");
      onBack();
      return;
    }

    const data = await res.json();
    setAllergens(data.allergens || []);
    setLoading(false);
  }

  function startEdit(a: Allergen) {
    setIsEditing(true);
    setEditingId(a.id);

    setEditCode(a.code);
    setEditName(a.name);
    setEditDescription(a.description ?? "");
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

  async function saveAllergen() {
    if (!editCode.trim() || !editName.trim()) {
      alert("Kód és név kötelező");
      return;
    }

    if (editingId === null) {
      // CREATE
      await fetch(`${API}/admin/allergens`, {
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
      await fetch(`${API}/admin/allergens/${editingId}`, {
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
    loadAllergens();
  }

  async function deleteAllergen(a: Allergen) {
    if (!confirm(`Biztos törlöd: ${a.name}?`)) return;

    await fetch(`${API}/admin/allergens/${a.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    loadAllergens();
  }

  return (
    <div className="recipe-page-root">
      <header className="recipe-page-header">
        <button className="rp-btn rp-btn-back" onClick={onBack}>
          ← Vissza
        </button>

        <div className="recipe-page-brand">Admin · Allergének</div>

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
          <div className="recipe-section-title">Allergének</div>

          {loading ? (
            <div>Betöltés…</div>
          ) : (
            <div className="allergen-user-list">
              {allergens.map(a => (
                <div
                  key={a.id}
                  className={
                    "allergen-user-row" +
                    (isEditing && editingId === a.id ? " is-editing" : "")
                  }
                >
                  <div className="allergen-user-info">
                    {isEditing && editingId === a.id ? (
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
                        <div><strong>{a.code}</strong> – {a.name}</div>
                        {a.description && (
                          <div className="admin-user-email">
                            {a.description}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="admin-user-actions">
                    {isEditing && editingId === a.id ? (
                      <>
                        <button className="rp-btn" onClick={saveAllergen}>
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
                          onClick={() => startEdit(a)}
                        >
                          Módosítás
                        </button>
                        <button
                          className="rp-btn danger"
                          disabled={isEditing}
                          onClick={() => deleteAllergen(a)}
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
                        placeholder="Kód (pl. GL)"
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
                    <strong>＋ Új allergén</strong>
                  )}
                </div>

                <div className="admin-user-actions">
                  {isEditing && editingId === null ? (
                    <>
                      <button className="rp-btn" onClick={saveAllergen}>
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
