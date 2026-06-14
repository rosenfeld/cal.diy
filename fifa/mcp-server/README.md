# FIFA MCP Server

Servidor MCP que expõe o calendário da Copa do Mundo FIFA 2026.

## Instalação

```bash
cd fifa/mcp-server
npm install
```

## Ferramentas disponíveis

| Ferramenta | Descrição |
|---|---|
| `list_games` | Lista jogos com filtros opcionais por `phase`, `group` e `date` |
| `get_game` | Retorna detalhes de um jogo pelo `id` (ex: `WC2026-001`) |
| `list_groups` | Lista grupos e times de cada grupo |
| `games_today` | Lista os jogos agendados para hoje |

## Configuração no Claude Desktop / Claude Code

Adicione ao seu `claude_desktop_config.json` ou `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "fifa-calendar": {
      "command": "node",
      "args": ["/caminho/absoluto/para/cal.diy/fifa/mcp-server/index.js"]
    }
  }
}
```

## Exemplos de uso

**Listar jogos do Brasil:**
> "Liste os jogos do Brasil na Copa 2026"

**Jogos de um grupo:**
> "Quais são os jogos do Grupo C?"

**Jogo específico:**
> "Me dê os detalhes do jogo WC2026-006"

**Jogos de hoje:**
> "Tem jogo da copa hoje?"
