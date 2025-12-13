

export const API = "http://127.0.0.1:8000";


export type Allergen = {
  id: number;
  code: string;
  name: string;
  description?: string;
};

export type RecipeAllergen = {
  code: string;
  name: string;
  description?: string;
};

export type Recipe = {
  id: number;
  title: string;
  summary?: string;
  category?: string;
  ingredients: string[];
  steps: string[];
  allergens: RecipeAllergen[];
  image_url?: string;
  average_rating?: number | null;
  is_favorite?: boolean;
};

type ListResponse = { recipes: Recipe[] };

type FetchRecipesOpts = {
  q?: string;
  include?: string[];
  exclude?: string[];
  favorites?: boolean;
};

export type Category = {
  id: number;
  code: string;
  name: string;
  description?: string;
};





export async function fetchAllergens(): Promise<Allergen[]> {
  const r = await fetch(`${API}/allergens`);
  if (!r.ok) return [];
  const data = await r.json().catch(() => ({}));
  return (data.allergens as Allergen[]) ?? [];
}

export async function fetchRecipes(
  arg?: string | FetchRecipesOpts,
  token?: string
): Promise<ListResponse> {
  let url = `${API}/recipes`;
  const params = new URLSearchParams();

  if (typeof arg === "string") {
    if (arg.trim()) params.set("q", arg.trim());
  } else if (arg && typeof arg === "object") {
    if (arg.q?.trim()) params.set("q", arg.q.trim());
    if (arg.include && arg.include.length) params.set("allergens", arg.include.join(","));
    if (arg.exclude && arg.exclude.length) params.set("exclude", arg.exclude.join(","));
    if (arg.favorites) params.set("favorites", "true");
  }

  const qs = params.toString();
  if (qs) url += `?${qs}`;

  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("fetchRecipes error:", res.status, text);
    throw new Error(`GET /recipes ${res.status}`);
  }
  return res.json();
}

export async function login(email: string, password: string): 
  Promise<{access_token: string; user_id: number, is_admin: number; name: string;}>{
    const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.msg || `Login failed (${res.status})`);
  }
  const data = await res.json();
  return data;
}

export async function register(
  email: string,
  name: string,
  password: string
): Promise<{ id: number; email: string; name: string }> {
  const r = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
  });
  const data = await r.json();
  if (!r.ok) {
    throw new Error(data?.msg || "Sikertelen regisztráció");
  }
  return data.user as { id: number; email: string; name: string };
}


export async function addFavorite(recipeId: number, token: string): Promise<void> {
  const res = await fetch(`${API}/favorites/${recipeId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Nem sikerült hozzáadni kedvencekhez (${res.status}): ${errText}`);
  }
}

export async function removeFavorite(recipeId: number, token: string): Promise<void> {
  const res = await fetch(`${API}/favorites/${recipeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Nem sikerült törölni a kedvencek közül (${res.status}): ${errText}`);
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Hiba történt");
}

