import { useEffect, useState } from "react";
import "../styles/recipePageStyles.css";
import "../styles/homepageStyles.css";
import {API} from "./api"

type Props = {
  onBack: () => void;
  onLogout: () => void;
};

type User = {
  id: number;
  email: string;
  name: string;
  is_admin: number;
  created_at: string;
};




export default function AdminUsersPage({ onBack, onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

const [editingId, setEditingId] = useState<number | null>(null);
const [isEditing, setIsEditing] = useState(false);

const [editName, setEditName] = useState("");
const [editEmail, setEditEmail] = useState("");
const [editPassword, setEditPassword] = useState("");
const [editIsAdmin, setEditIsAdmin] = useState(false);






  const token = localStorage.getItem("access_token");
  const currentUserId = Number(localStorage.getItem("user_id"));


  useEffect(() => {
    const root = document.querySelector(".app-root");
    if (root instanceof HTMLElement) {
      root.scrollTop = 0;
    }

    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    const res = await fetch(`${API}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 403) {
      alert("Nincs admin jogosultság");
      onBack();
      return;
    }

    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  async function toggleAdmin(user: User) {
    await fetch(`${API}/admin/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        is_admin: user.is_admin ? 0 : 1,
      }),
    });

    loadUsers();
  }

  async function deleteUser(user: User) {
    if (!confirm(`Biztos törlöd: ${user.name}?`)) return;

    await fetch(`${API}/admin/users/${user.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadUsers();
  }

    async function updateUser(u: User) {
        await fetch(`${API}/admin/users/${u.id}`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
            name: editName,
            ...(editPassword ? { password: editPassword } : {}),
            }),
        });

        setEditingId(null);
        loadUsers();
    }

    function startEdit(u: User) {
        setIsEditing(true);
        setEditingId(u.id);

        setEditName(u.name);
        setEditEmail(u.email);
        setEditPassword("");
        setEditIsAdmin(Boolean(u.is_admin));
    }

    function startCreate() {
        setIsEditing(true);
        setEditingId(null);

        setEditName("");
        setEditEmail("");
        setEditPassword("");
        setEditIsAdmin(false);
    }

    function cancelEdit() {
        setIsEditing(false);
        setEditingId(null);

        setEditName("");
        setEditEmail("");
        setEditPassword("");
        setEditIsAdmin(false);
    }

    async function saveUser() {
        if (!editName.trim()) {
            alert("A név kötelező");
            return;
        }

        if (editingId === null) {
            // ➕ CREATE
            if (!editEmail.trim() || !editPassword.trim()) {
            alert("Email és jelszó kötelező");
            return;
            }

            await fetch(`${API}/admin/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: editName,
                email: editEmail,
                password: editPassword,
                is_admin: editIsAdmin ? 1 : 0,
            }),
            });
        } else {
            // ✏️ UPDATE
            await fetch(`${API}/admin/users/${editingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: editName,
                ...(editPassword ? { password: editPassword } : {}),
                is_admin: editIsAdmin ? 1 : 0,
            }),
            });
        }

        cancelEdit();
        loadUsers();
    }

  return (
    <div className="recipe-page-root">
      <header className="recipe-page-header">
        <button className="rp-btn rp-btn-back" onClick={onBack}>
          ← Vissza
        </button>

        <div className="recipe-page-brand">Admin · Felhasználók</div>

        <div className="menu">
          <button
            className="burger"
            onClick={() => setMenuOpen(v => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          {menuOpen && (
            <div className="dropdown">
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
        
        <section className="recipe-section-block">
          <div className="recipe-section-title">Felhasználók</div>

          {loading ? (
            <div>Betöltés…</div>
          ) : (
            <div className="admin-user-list">
            {users.map(u => (
                <div className={"admin-user-row" + (isEditing && editingId === u.id ? " is-editing" : "")}>
                <div className="admin-user-info">
                    {isEditing && editingId === u.id ? (
                    <>
                        <input
                        className="input"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        />

                        <input
                        className="input"
                        type="password"
                        placeholder="Új jelszó (opcionális)"
                        value={editPassword}
                        onChange={e => setEditPassword(e.target.value)}
                        />

                        <label>
                        <input
                            type="checkbox"
                            checked={editIsAdmin}
                            disabled={u.id === currentUserId}
                            onChange={e => setEditIsAdmin(e.target.checked)}
                        />{" "}
                        Admin
                        </label>
                    </>
                    ) : (
                    <>
                        <div className="admin-user-name">
                        👤 <strong>{u.name}</strong>
                        {u.is_admin ? <span className="admin-badge">admin</span> : null}
                        </div>
                        <div className="admin-user-email">{u.email}</div>
                    </>
                    )}
                </div>



                

                <div className="admin-user-actions">
                    {isEditing && editingId === u.id ? (
                    <>
                        <button className="rp-btn" onClick={saveUser}>
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
                        onClick={() => startEdit(u)}
                        >
                        Módosítás
                        </button>

                        <button
                        className="rp-btn danger"
                        disabled={isEditing || u.id === currentUserId}
                        onClick={() => deleteUser(u)}
                        >
                        Törlés
                        </button>
                    </>
                    )}
                </div>
                </div>

            ))}

<div className={"admin-user-row" + (isEditing && editingId === null ? " is-editing" : "")}>
  <div className="admin-user-info">
    {isEditing && editingId === null ? (
      <>
        <input
          className="input"
          placeholder="Név"
          value={editName}
          onChange={e => setEditName(e.target.value)}
        />

        <input
          className="input"
          placeholder="Email"
          value={editEmail}
          onChange={e => setEditEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Jelszó"
          value={editPassword}
          onChange={e => setEditPassword(e.target.value)}
        />

        <label>
          <input
            type="checkbox"
            checked={editIsAdmin}
            onChange={e => setEditIsAdmin(e.target.checked)}
          />{" "}
          Admin
        </label>
      </>
    ) : (
      <strong>＋ Új felhasználó</strong>
    )}
  </div>

  <div className="admin-user-actions">
    {isEditing && editingId === null ? (
      <>
        <button className="rp-btn" onClick={saveUser}>
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


