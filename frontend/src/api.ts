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

