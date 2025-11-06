import '@testing-library/jest-dom';
import { vi } from "vitest";
import React from "react";

// 🔹 Mock az API hívásokra
vi.mock("../api", () => ({
  login: vi.fn(() => Promise.resolve("mock-token")),
  register: vi.fn(() => Promise.resolve({ id: 1, name: "Teszt Elek" })),
  fetchAllergens: vi.fn(() => Promise.resolve([])),
  fetchRecipes: vi.fn(() => Promise.resolve({ recipes: [] })),
}));

// 🔹 Mock az Orb komponensre (hogy ne próbáljon canvas animációt renderelni)
vi.mock("../components/Orb", () => ({
  default: () => React.createElement("div", { "data-testid": "mock-orb" }),
}));