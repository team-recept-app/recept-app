const API = "http://127.0.0.1:8000";

export type Recipe = {
  id: number;
  title: string;
  summary?: string;
  category?: string;
  ingredients: string[];
  steps: string[];
  allergens: string[];
  image_url?: string;
  average_rating?: number | null;
};

type ListResponse = { recipes: Recipe[] };

export async function fetchRecipes(q?: string): Promise<ListResponse> {
  const url = q ? `${API}/recipes?q=${encodeURIComponent(q)}` : `${API}/recipes`;
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

