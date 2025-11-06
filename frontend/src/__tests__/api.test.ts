import { vi, describe, it, expect, beforeEach } from "vitest";
import { login } from "../api";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch as any;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("api.login", () => {
  it("visszaadja a token stringet sikeres login esetén", async () => {
    const mockToken = "mock-token-123";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({ access_token: mockToken }),
    });

    const token = await login("user@example.com", "pw123");
    expect(token).toBe(mockToken);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/login$/),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("hibát dob, ha a válasz nem ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockResolvedValue({ msg: "Hibás jelszó" }),
    });

    await expect(login("x", "y")).rejects.toThrow("Hibás jelszó");
  });
});