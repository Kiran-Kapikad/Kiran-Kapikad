const fs = require("fs");
const fetch = require("node-fetch");

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

  let grid = "";

  weeks.forEach((week, x) => {
    week.contributionDays.forEach((day, y) => {
      grid += `<rect x="${x*(size+gap)}" y="${y*(size+gap)}" width="${size}" height="${size}" fill="${getColor(day.contributionCount)}"/>`;
    });
  });

  // Maze path (zig-zag like screenshot)
  let path = "M0 40";
  for (let i = 0; i < 50; i++) {
    const x = i * 16;
    const y = (i % 2 === 0) ? 40 : 100;
    path += ` L${x} ${y}`;
  }

  const svg = `
<svg width="1000" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0d1117"/>

  <g transform="translate(20,20)">
    ${grid}
  </g>

  <!-- Maze -->
  <path d="${path}" stroke="white" stroke-width="2" fill="none"/>

  <!-- Pacman -->
  <circle r="8" fill="yellow">
    <animateMotion dur="12s" repeatCount="indefinite" path="${path}" />
  </circle>

  <!-- Ghosts -->
  <circle r="8" fill="red">
    <animateMotion dur="12s" repeatCount="indefinite" path="${path}" begin="2s"/>
  </circle>

  <circle r="8" fill="cyan">
    <animateMotion dur="12s" repeatCount="indefinite" path="${path}" begin="4s"/>
  </circle>

  <circle r="8" fill="pink">
    <animateMotion dur="12s" repeatCount="indefinite" path="${path}" begin="6s"/>
  </circle>

</svg>
`;

  fs.mkdirSync("output", { recursive: true });
  fs.writeFileSync("output/pacman.svg", svg);
})();
