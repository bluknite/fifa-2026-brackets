/**
 * Standing calculation and tiebreaker logic for Group Stage.
 * Matches official FIFA criteria where possible under prediction bracket constraints.
 */

export function calculateGroupStandings(teams, matches, outcomes, customOrder = null) {
  // 1. Initialize stats for each team
  const stats = {};
  teams.forEach(t => {
    stats[t] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, points: 0 };
  });

  // 2. Tally stats based on the outcomes
  matches.forEach(m => {
    const outcome = outcomes[m.id];
    if (!outcome) return; // Not predicted/completed yet

    stats[m.home].played += 1;
    stats[m.away].played += 1;

    if (outcome === 'home') {
      stats[m.home].won += 1;
      stats[m.home].points += 3;
      stats[m.away].lost += 1;
    } else if (outcome === 'away') {
      stats[m.away].won += 1;
      stats[m.away].points += 3;
      stats[m.home].lost += 1;
    } else if (outcome === 'draw') {
      stats[m.home].drawn += 1;
      stats[m.home].points += 1;
      stats[m.away].drawn += 1;
      stats[m.away].points += 1;
    }
  });

  // 3. Sort teams into points groups
  const pointsGroups = {};
  teams.forEach(t => {
    const pts = stats[t].points;
    if (!pointsGroups[pts]) pointsGroups[pts] = [];
    pointsGroups[pts].push(t);
  });

  const finalOrder = [];
  let isAmbiguous = false;
  const ambiguousTies = [];

  // Sort point groups in descending order
  const sortedPoints = Object.keys(pointsGroups)
    .map(Number)
    .sort((a, b) => b - a);

  sortedPoints.forEach(pts => {
    const group = pointsGroups[pts];
    if (group.length === 1) {
      finalOrder.push(group[0]);
    } else if (group.length === 2) {
      const [a, b] = group;
      // Find head-to-head match
      const h2hMatch = matches.find(m => 
        (m.home === a && m.away === b) || (m.home === b && m.away === a)
      );
      const h2hOutcome = h2hMatch ? outcomes[h2hMatch.id] : null;

      if (h2hOutcome && h2hOutcome !== 'draw') {
        const aIsHome = h2hMatch.home === a;
        if ((aIsHome && h2hOutcome === 'home') || (!aIsHome && h2hOutcome === 'away')) {
          // a beat b
          finalOrder.push(a, b);
        } else {
          // b beat a
          finalOrder.push(b, a);
        }
      } else {
        // Draw or not played yet: Ambiguous
        isAmbiguous = true;
        if (!ambiguousTies.includes(a)) ambiguousTies.push(a);
        if (!ambiguousTies.includes(b)) ambiguousTies.push(b);

        // Sort using customOrder index, if available
        const sub = [...group];
        if (customOrder) {
          sub.sort((x, y) => {
            const idxX = customOrder.indexOf(x);
            const idxY = customOrder.indexOf(y);
            return (idxX !== -1 ? idxX : 99) - (idxY !== -1 ? idxY : 99);
          });
        }
        finalOrder.push(...sub);
      }
    } else {
      // 3 or 4-way tie
      // Compute head-to-head points among tied teams
      const h2hStats = {};
      group.forEach(t => { h2hStats[t] = 0; });

      matches.forEach(m => {
        if (group.includes(m.home) && group.includes(m.away)) {
          const outcome = outcomes[m.id];
          if (outcome === 'home') h2hStats[m.home] += 3;
          else if (outcome === 'away') h2hStats[m.away] += 3;
          else if (outcome === 'draw') {
            h2hStats[m.home] += 1;
            h2hStats[m.away] += 1;
          }
        }
      });

      // Check if H2H points break the tie completely
      const h2hPtsList = group.map(t => h2hStats[t]);
      const uniqueH2hPts = [...new Set(h2hPtsList)];

      const sub = [...group];
      if (uniqueH2hPts.length === group.length) {
        // Resolved completely by H2H points
        sub.sort((x, y) => h2hStats[y] - h2hStats[x]);
      } else {
        // Circular tie remains ambiguous
        isAmbiguous = true;
        group.forEach(t => {
          if (!ambiguousTies.includes(t)) ambiguousTies.push(t);
        });

        if (customOrder) {
          sub.sort((x, y) => {
            const idxX = customOrder.indexOf(x);
            const idxY = customOrder.indexOf(y);
            return (idxX !== -1 ? idxX : 99) - (idxY !== -1 ? idxY : 99);
          });
        }
      }
      finalOrder.push(...sub);
    }
  });

  return {
    standings: finalOrder.map(t => ({
      ...stats[t],
      isTied: ambiguousTies.includes(t)
    })),
    isAmbiguous,
    ambiguousTies
  };
}

/**
 * Standing calculation logic for actual tournament results (with goal differences).
 * Used by updater script.
 */
export function calculateActualStandings(teams, matches, scores) {
  const stats = {};
  teams.forEach(t => {
    stats[t] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, points: 0, gf: 0, ga: 0, gd: 0 };
  });

  matches.forEach(m => {
    const score = scores[m.id];
    if (!score || !score.completed) return;

    const hg = score.homeGoals;
    const ag = score.awayGoals;

    stats[m.home].played += 1;
    stats[m.away].played += 1;
    stats[m.home].gf += hg;
    stats[m.home].ga += ag;
    stats[m.away].gf += ag;
    stats[m.away].ga += hg;

    if (hg > ag) {
      stats[m.home].won += 1;
      stats[m.home].points += 3;
      stats[m.away].lost += 1;
    } else if (ag > hg) {
      stats[m.away].won += 1;
      stats[m.away].points += 3;
      stats[m.home].lost += 1;
    } else {
      stats[m.home].drawn += 1;
      stats[m.home].points += 1;
      stats[m.away].drawn += 1;
      stats[m.away].points += 1;
    }
  });

  // Calculate Goal Differences
  teams.forEach(t => {
    stats[t].gd = stats[t].gf - stats[t].ga;
  });

  // Sort based on FIFA rules
  const sorted = [...teams];
  sorted.sort((a, b) => {
    // 1. Points
    if (stats[b].points !== stats[a].points) {
      return stats[b].points - stats[a].points;
    }
    // 2. Goal Difference
    if (stats[b].gd !== stats[a].gd) {
      return stats[b].gd - stats[a].gd;
    }
    // 3. Goals Scored
    if (stats[b].gf !== stats[a].gf) {
      return stats[b].gf - stats[a].gf;
    }
    
    // 4. Head-to-Head points
    const h2hMatch = matches.find(m => 
      (m.home === a && m.away === b) || (m.home === b && m.away === a)
    );
    const h2hScore = h2hMatch ? scores[h2hMatch.id] : null;
    if (h2hScore && h2hScore.completed) {
      const aIsHome = h2hMatch.home === a;
      const hg = h2hScore.homeGoals;
      const ag = h2hScore.awayGoals;
      if (hg > ag) {
        return aIsHome ? -1 : 1;
      } else if (ag > hg) {
        return aIsHome ? 1 : -1;
      }
    }

    // Default to alphabetical for stable tie breaking in case of extreme tie
    return a.localeCompare(b);
  });

  return sorted;
}
