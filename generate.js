const fs = require("fs");

const username = "Kiran-Kapikad";

const query = `
{
  user(login: "${username}") {
    contributionsCollection {
      contributionCalendar {
        weeks {
          contributionDays {
            contributionCount
          }
        }
      }
    }
  }
}
`;

async function getData() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const json = await res.json();
  return json.data.user.contributionsCollection.contributionCalendar.weeks;
}

function getColor(c) {
  if (c === 0) return "#161b22";
  if (c < 3) return "#0e4429";
  if (c < 6) return "#006d32";
  if (c < 10) return "#26a641";
  return "#39d353";
}

(async () => {
  const weeks = await getData();

  const size = 12;
  const gap = 4;

  let grid = [];
  let rects = "";

  // Build grid + store weights
  weeks.forEach((week, x) => {
    week.contributionDays.forEach((day, y) => {
      const value = day.contributionCount;
      grid.push({ x, y, value });

      rects += `<rect x="${x*(size+gap)}" y="${y*(size+gap)}"
        width="${size}" height="${size}"
        fill="${getColor(value)}"/>`;
    });
  });

  // 🔥 Sort hotspots first
  grid.sort((a, b) => b.value - a.value);

  // Build path prioritizing high contribution cells
  let path = `M ${grid[0].x*16} ${grid[0].y*16}`;

  grid.slice(1, 120).forEach(p => {
    path += ` L ${p.x*16} ${p.y*16}`;
  });

  // 🎯 Pacman shape (arc with mouth animation)
  const pacman = `
  <path fill="yellow">
    <animate attributeName="d" dur="0.4s" repeatCount="indefinite"
      values="
      M0,-8 A8,8 0 1,1 0,8 L0,0 Z;
      M2,-6 A8,8 0 1,1 2,6 L0,0 Z;
      M0,-8 A8,8 0 1,1 0,8 L0,0 Z
      " />
    <animateMotion dur="12s" repeatCount="indefinite" path="${path}" />
  </path>
  `;

  // 👻 Ghost with eye animation
  function ghost(color, delay) {
    return `
    <g>
      <circle r="8" fill="${color}">
        <animateMotion dur="12s" repeatCount="indefinite"
          path="${path}" begin="${delay}s"/>
      </circle>

      <!-- Eyes -->
      <circle r="2" fill="white" cx="-2" cy="-2">
        <animate attributeName="cx" values="-2;0;-2" dur="1s" repeatCount="indefinite"/>
      </circle>
      <circle r="2" fill="white" cx="2" cy="-2">
        <animate attributeName="cx" values="2;4;2" dur="1s" repeatCount="indefinite"/>
      </circle>
    </g>
    `;
  }

  const svg = `
<svg width="1000" height="200" xmlns="http://www.w3.org/2000/svg">

  <rect width="100%" height="100%" fill="#0d1117"/>

  <!-- Contribution grid -->
  <g transform="translate(20,20)">
    ${rects}
  </g>

  <!-- Maze path -->
  <path d="${path}" stroke="#ffffff22" fill="none"/>

  <!-- Pacman -->
  ${pacman}

  <!-- Ghosts -->
  ${ghost("red", 2)}
  ${ghost("cyan", 4)}
  ${ghost("pink", 6)}

</svg>
`;

  fs.mkdirSync("output", { recursive: true });
  fs.writeFileSync("output/pacman.svg", svg);
})();
