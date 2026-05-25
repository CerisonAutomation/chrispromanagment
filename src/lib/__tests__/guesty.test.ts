import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getSession: () => Promise.resolve({ data: { session: null } }) } },
}));

// Provide a stable env for the module under test
vi.stubEnv("VITE_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "anon-test-key");

describe("guesty client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("builds a GET URL with action + params and uses anon key when no session", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: [], pagination: { total: 0 } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { guesty } = await import("../guesty.js");
    await guesty.listings({ limit: 3 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/functions/v1/guesty-beapi?");
    expect(String(url)).toContain("action=listings");
    expect(String(url)).toContain("limit=3");
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBe("Bearer anon-test-key");
    expect(init.headers.apikey).toBe("anon-test-key");
  });

  it("POSTs body and sets content-type for create-reservation", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "r_1" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { guesty } = await import("../guesty.js");
    await guesty.createReservation({ listingId: "abc", checkIn: "2026-01-01" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({ listingId: "abc", checkIn: "2026-01-01" });
  });

  it("surfaces Guesty error message on non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: "Too Many Requests" }),
      }),
    );
    const { guesty } = await import("../guesty.js");
    await expect(guesty.listings()).rejects.toThrow("Too Many Requests");
  });
});
