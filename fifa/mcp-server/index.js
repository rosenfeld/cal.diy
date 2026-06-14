import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { filterGames } from "./filters.js";

const server = new McpServer({
  name: "fifa-calendar",
  version: "1.0.0",
});

server.registerTool(
  "list_games",
  {
    description:
      "Lista os jogos da Copa do Mundo FIFA 2026. Aceita filtros opcionais por fase, grupo, data e time/seleção.",
    inputSchema: {
      phase: z.string().optional().describe("Filtrar por fase (ex: 'Fase de Grupos')"),
      group: z.string().optional().describe("Filtrar por grupo (ex: 'Grupo A')"),
      date: z.string().optional().describe("Filtrar por data no formato YYYY-MM-DD"),
      team: z.string().optional().describe("Filtrar por time/seleção (ex: 'Brasil', 'bra'). Aceita correspondência parcial e não diferencia maiúsculas de minúsculas."),
    },
  },
  ({ phase, group, date, team }) => {
    const { tournament, games } = loadCalendar();
    const filtered = filterGames(games, { phase, group, date, team });

    if (filtered.length === 0) {
      return { content: [{ type: "text", text: "Nenhum jogo encontrado com os filtros informados." }] };
    }

    const header = `${tournament} — ${filtered.length} jogo(s) encontrado(s)\n${"=".repeat(50)}`;
    const body = filtered.map(formatGame).join("\n" + "-".repeat(50) + "\n");

    return { content: [{ type: "text", text: `${header}\n\n${body}` }] };
  }
);

server.registerTool(
  "get_game",
  {
    description: "Retorna os detalhes de um jogo específico pelo ID (ex: 'WC2026-001').",
    inputSchema: {
      id: z.string().describe("ID do jogo (ex: WC2026-001)"),
    },
  },
  ({ id }) => {
    const { games } = loadCalendar();
    const game = games.find((g) => g.id.toLowerCase() === id.toLowerCase());

    if (!game) {
      return { content: [{ type: "text", text: `Jogo com ID "${id}" não encontrado.` }] };
    }

    return { content: [{ type: "text", text: formatGame(game) }] };
  }
);

server.registerTool(
  "list_groups",
  {
    description: "Lista os grupos da Copa do Mundo 2026 e os times participantes de cada grupo.",
    inputSchema: {},
  },
  () => {
    const { games } = loadCalendar();

    const groupTeams = {};
    for (const game of games) {
      if (!game.group) continue;
      if (!groupTeams[game.group]) groupTeams[game.group] = new Set();
      groupTeams[game.group].add(game.team1);
      groupTeams[game.group].add(game.team2);
    }

    const sortedGroups = Object.keys(groupTeams).sort();
    const lines = sortedGroups.map((group) => {
      const teams = [...groupTeams[group]].sort().join(", ");
      return `${group}:\n  ${teams}`;
    });

    return {
      content: [{ type: "text", text: `Grupos da Copa do Mundo FIFA 2026\n${"=".repeat(40)}\n\n${lines.join("\n\n")}` }],
    };
  }
);

server.registerTool(
  "games_today",
  {
    description: "Lista os jogos da Copa do Mundo FIFA 2026 agendados para hoje. Aceita filtro opcional por time/seleção.",
    inputSchema: {
      team: z.string().optional().describe("Filtrar por time/seleção (ex: 'Brasil', 'bra'). Aceita correspondência parcial e não diferencia maiúsculas de minúsculas."),
    },
  },
  ({ team } = {}) => {
    const { tournament, games } = loadCalendar();
    const today = new Date().toISOString().split("T")[0];
    const todayGames = filterGames(games, { date: today, team });

    if (todayGames.length === 0) {
      return {
        content: [{ type: "text", text: `Nenhum jogo da ${tournament} hoje (${today}).` }],
      };
    }

    const header = `Jogos de hoje (${today}) — ${tournament}\n${"=".repeat(50)}`;
    const body = todayGames.map(formatGame).join("\n" + "-".repeat(50) + "\n");

    return { content: [{ type: "text", text: `${header}\n\n${body}` }] };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

// ─── Low-level helpers (called by the tool handlers above) ───────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const CALENDAR_PATH = resolve(__dirname, "../calendario.json");

function loadCalendar() {
  const raw = readFileSync(CALENDAR_PATH, "utf-8");
  return JSON.parse(raw);
}

function formatGame(game) {
  const score =
    game.score.team1 !== null && game.score.team2 !== null
      ? `${game.score.team1} x ${game.score.team2}`
      : "Ainda não realizado";

  return (
    `ID: ${game.id}\n` +
    `Data: ${game.date} ${game.time} (${game.timezone})\n` +
    `Jogo: ${game.team1} vs ${game.team2}\n` +
    `Placar: ${score}\n` +
    `Fase: ${game.phase}` +
    (game.group ? ` — ${game.group}` : "") +
    `\nLocal: ${game.venue}, ${game.city}`
  );
}
