import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import App from "../App";
import * as api from "../api";

vi.mock("../api", () => ({
  login: vi.fn(),
  register: vi.fn(),
  fetchAllergens: vi.fn().mockResolvedValue([]),
  fetchRecipes: vi.fn().mockResolvedValue({ recipes: [] }),
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks(); // <-- ez is hasznos, hogy az előző hívások ne zavarjanak be
});

describe("App – Login űrlap", () => {
  it("bejelentkezés után elmenti a tokent és betölti a HomePage-t", async () => {
    const mockToken = "mock123";
    vi.spyOn(api, "login").mockResolvedValueOnce(mockToken);

    render(<App />);
    expect(screen.getByText("Bejelentkezés")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/user1@example.com/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password1/i), {
      target: { value: "pw123" },
    });

    fireEvent.click(screen.getByText("Belépés"));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalled();
      expect(localStorage.getItem("token")).toBe(mockToken);
    });
  });

  it("hibát ír ki, ha az API hibát dob", async () => {
    // 🔹 extra biztonság: minden induljon tisztán
    localStorage.clear();
    vi.clearAllMocks();

    vi.spyOn(api, "login").mockRejectedValueOnce(new Error("Sikertelen bejelentkezés"));
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText(/user1@example.com/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password1/i), {
      target: { value: "wrongpw" },
    });
    fireEvent.click(screen.getByText("Belépés"));

    await waitFor(() => {
      expect(screen.getByText(/Sikertelen bejelentkezés/i)).toBeInTheDocument();
    });
  });
});