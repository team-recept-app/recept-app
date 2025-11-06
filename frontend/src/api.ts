const API = "http://127.0.0.1:8000";

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
};

type ListResponse = { recipes: Recipe[] };

type FetchRecipesOpts = {
  q?: string;
  include?: string[];
  exclude?: string[];
};

export async function fetchAllergens(): Promise<Allergen[]> {
  const r = await fetch(`${API}/allergens`);
  if (!r.ok) return [];
  const data = await r.json().catch(() => ({}));
  return (data.allergens as Allergen[]) ?? [];
}

export async function fetchRecipes(arg?: string | FetchRecipesOpts): Promise<ListResponse> {
  let url = `${API}/recipes`;
  const params = new URLSearchParams();

  if (typeof arg === "string") {
    if (arg.trim()) params.set("q", arg.trim());
  } else if (arg && typeof arg === "object") {
    if (arg.q?.trim()) params.set("q", arg.q.trim());
    if (arg.include && arg.include.length) params.set("allergens", arg.include.join(","));
    if (arg.exclude && arg.exclude.length) params.set("exclude", arg.exclude.join(","));
  }

  const qs = params.toString();
  if (qs) url += `?${qs}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET /recipes ${res.status}`);
  return res.json();
}

export async function login(email: string, password: string): Promise<string> {
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
  return data.access_token as string;
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
