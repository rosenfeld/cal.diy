/**
 * Filters an array of games by optional criteria.
 *
 * @param {Array} games - Array of game objects from calendario.json
 * @param {{ phase?: string, group?: string, date?: string, team?: string }} filters
 * @returns {Array} Filtered array of games
 */
export function filterGames(games, { phase, group, date, team } = {}) {
  let filtered = games;

  if (phase) filtered = filtered.filter((g) => g.phase.toLowerCase().includes(phase.toLowerCase()));
  if (group) filtered = filtered.filter((g) => g.group?.toLowerCase().includes(group.toLowerCase()));
  if (date) filtered = filtered.filter((g) => g.date === date);
  if (team) {
    const teamLower = team.toLowerCase();
    filtered = filtered.filter(
      (g) => g.team1.toLowerCase().includes(teamLower) || g.team2.toLowerCase().includes(teamLower)
    );
  }

  return filtered;
}
