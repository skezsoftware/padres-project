export const getTeamColor = (teamId) => {

  // Map full names to abbreviations
  const teamAbbreviations = {
    'Texas Rangers': 'TEX',
    'San Diego Padres': 'SD',
    'Arizona Diamondbacks': 'ARI',
    'Atlanta Braves': 'ATL',
    'Baltimore Orioles': 'BAL',
    'Cleveland Guardians': 'CLE',
    'Los Angeles Dodgers': 'LAD',
    'Seattle Mariners': 'SEA',
    'Washington Nationals': 'WSH'
  };

  const teamColors = {
    'ARI': 'rgb(156,41,59)',    // Arizona
    'ATL': 'rgb(27,57,99)',     // Braves
    'BAL': 'rgb(233,124,77)',   // Orioles
    'CLE': 'rgb(33,53,77)',     // Cleveland
    'LAD': 'rgb(49,105,163)',   // Dodgers
    'SD': 'rgb(63,54,48)',      // Padres
    'SEA': 'rgb(50,107,108)',   // Mariners
    'TEX': 'rgb(31,64,131)',    // Rangers
    'WSH': 'rgb(172,50,38)',    // Nationals
  };

  const abbreviation = teamAbbreviations[teamId];
  const color = teamColors[abbreviation];

  return color || '#0b5394'; // Default blue if team not found
};

// Helper function to create lighter version of team color
export const getLightTeamColor = (teamId) => {
  const baseColor = getTeamColor(teamId);
  // Convert RGB to a lighter version
  const rgb = baseColor.match(/\d+/g);
  if (rgb) {
    const lighter = rgb.map(c => Math.min(255, parseInt(c) + 160)).join(',');
    return `rgb(${lighter})`;
  }
  return '#cfe2f3'; // Default light blue if conversion fails
};