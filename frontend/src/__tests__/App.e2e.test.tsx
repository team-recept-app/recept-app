import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import App from "../App";
import * as api from "../api";

// Mock API függvények
vi.mock("../api", () => ({
  register: vi.fn(),
  login: vi.fn(),
  fetchAllergens: vi.fn().mockResolvedValue([]),
  fetchRecipes: vi.fn().mockResolvedValue({ recipes: [] }),
}));

// Mock az Orb komponensre, hogy ne zavarjon vizuálisan
vi.mock("../components/Orb", () => ({
  default: () => <div data-testid="mock-orb" />,
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("App – e2e folyamat", () => {
  it("regisztráció → info üzenet → login módba vált", async () => {
    vi.spyOn(api, "register").mockResolvedValueOnce({
      id: 1,
      name: "Teszt Elek",
      email: "teszt@user.hu",
    });

    render(<App />);

    // Átvált regisztrációs módba
    fireEvent.click(screen.getByRole("button", { name: /Regisztrálj/i }));

    fireEvent.change(screen.getByPlaceholderText("Anna"), {
      target: { value: "Teszt Elek" },
    });
    fireEvent.change(screen.getByPlaceholderText("user1@example.com"), {
      target: { value: "teszt@user.hu" },
    });
    fireEvent.change(screen.getByPlaceholderText("password1"), {
      target: { value: "pw123" },
    });
    fireEvent.change(screen.getByPlaceholderText("ismételd meg a jelszót"), {
      target: { value: "pw123" },
    });

    // Regisztráció gomb
    fireEvent.click(screen.getByRole("button", { name: /Regisztráció/i }));

    await waitFor(() => {
      expect(screen.getByText(/Sikeres regisztráció/i)).toBeInTheDocument();
    });
  });

  it("login után a HomePage renderelődik és kijelentkezés működik", async () => {
    const mockToken = "tok123";
    vi.spyOn(api, "login").mockResolvedValueOnce(mockToken);

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("user1@example.com"), {
      target: { value: "user@ok.hu" },
    });
    fireEvent.change(screen.getByPlaceholderText("password1"), {
      target: { value: "pw" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Belépés/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe(mockToken);
    });

    // mockolt HomePage betölt
    await waitFor(() => {
      expect(
        screen.getByText(/Mit szeretnél ma enni/i)
      ).toBeInTheDocument();
    });
  });
});