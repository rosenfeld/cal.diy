import { describe, it, expect } from "vitest";
import { filterGames } from "./filters.js";

describe("filterGames", () => {
  const makeGame = (overrides: Partial<{
    id: string;
    date: string;
    time: string;
    timezone: string;
    team1: string;
    team2: string;
    phase: string;
    score: { team1: number | null; team2: number | null };
    venue: string;
    city: string;
    group: string | null;
  }> = {}) => ({
    id: "WC2026-001",
    date: "2026-06-11",
    time: "19:00",
    timezone: "UTC",
    team1: "México",
    team2: "África do Sul",
    phase: "Fase de Grupos",
    score: { team1: null, team2: null },
    venue: "Estádio",
    city: "Cidade do México",
    group: "Grupo A",
    ...overrides,
  });

  const SAMPLE_GAMES = [
    makeGame({ id: "WC2026-001", team1: "México", team2: "África do Sul", date: "2026-06-11", group: "Grupo A" }),
    makeGame({ id: "WC2026-002", team1: "Brasil", team2: "Croácia", date: "2026-06-12", group: "Grupo B" }),
    makeGame({ id: "WC2026-003", team1: "Argentina", team2: "Brasil", date: "2026-06-13", group: "Grupo C" }),
    makeGame({ id: "WC2026-004", team1: "França", team2: "Alemanha", date: "2026-06-14", group: "Grupo D", phase: "Oitavas de Final" }),
    makeGame({ id: "WC2026-005", team1: "Portugal", team2: "Espanha", date: "2026-06-14", group: null, phase: "Final" }),
  ];
  describe("team filter", () => {
    it("returns all games when no filters are provided", () => {
      const result = filterGames(SAMPLE_GAMES, {});
      expect(result).toHaveLength(SAMPLE_GAMES.length);
    });

    it("matches team1 by exact name", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "Brasil" });
      expect(result).toHaveLength(2);
      expect(result.map((g) => g.id)).toEqual(["WC2026-002", "WC2026-003"]);
    });

    it("matches team2 by exact name", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "Croácia" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("WC2026-002");
    });

    it("matches games via partial team name (prefix)", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "Bra" });
      expect(result).toHaveLength(2);
      expect(result.map((g) => g.id)).toEqual(["WC2026-002", "WC2026-003"]);
    });

    it("matches games via partial team name (infix)", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "ran" });
      // "França" contains "ran"
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("WC2026-004");
    });

    it("is case-insensitive (lowercase input)", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "brasil" });
      expect(result).toHaveLength(2);
    });

    it("is case-insensitive (uppercase input)", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "BRASIL" });
      expect(result).toHaveLength(2);
    });

    it("is case-insensitive (mixed case input)", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "bRaSiL" });
      expect(result).toHaveLength(2);
    });

    it("returns empty array when no team matches", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "Japão" });
      expect(result).toHaveLength(0);
    });

    it("returns empty array when partial match finds nothing", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "xyz" });
      expect(result).toHaveLength(0);
    });
  });

  describe("existing filters continue to work", () => {
    it("filters by phase", () => {
      const result = filterGames(SAMPLE_GAMES, { phase: "Final" });
      expect(result).toHaveLength(2);
      expect(result.map((g) => g.id)).toContain("WC2026-004");
      expect(result.map((g) => g.id)).toContain("WC2026-005");
    });

    it("filters by exact phase string", () => {
      const result = filterGames(SAMPLE_GAMES, { phase: "Oitavas de Final" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("WC2026-004");
    });

    it("filters by group", () => {
      const result = filterGames(SAMPLE_GAMES, { group: "Grupo B" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("WC2026-002");
    });

    it("filters by date", () => {
      const result = filterGames(SAMPLE_GAMES, { date: "2026-06-14" });
      expect(result).toHaveLength(2);
      expect(result.map((g) => g.id)).toEqual(["WC2026-004", "WC2026-005"]);
    });
  });

  describe("combined filters", () => {
    it("combines team filter with date filter", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "Brasil", date: "2026-06-12" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("WC2026-002");
    });

    it("combines team filter with group filter", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "Brasil", group: "Grupo B" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("WC2026-002");
    });

    it("combines team filter with phase filter", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "Alemanha", phase: "Oitavas de Final" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("WC2026-004");
    });

    it("returns empty array when combined filters match nothing", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "Brasil", date: "2026-06-11" });
      expect(result).toHaveLength(0);
    });

    it("combines all four filters", () => {
      const result = filterGames(SAMPLE_GAMES, {
        team: "bra",
        date: "2026-06-13",
        group: "Grupo C",
        phase: "Fase de Grupos",
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("WC2026-003");
    });
  });

  describe("edge cases", () => {
    it("handles empty games array", () => {
      const result = filterGames([], { team: "Brasil" });
      expect(result).toHaveLength(0);
    });

    it("handles game with null group when filtering by group", () => {
      const result = filterGames(SAMPLE_GAMES, { group: "Grupo" });
      // WC2026-005 has group: null, so it should not be included
      const ids = result.map((g) => g.id);
      expect(ids).not.toContain("WC2026-005");
    });

    it("team filter works for a game where team is in team2 field only", () => {
      const result = filterGames(SAMPLE_GAMES, { team: "África do Sul" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("WC2026-001");
    });
  });
});
