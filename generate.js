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
  if (c < 3) return "#0ea5e9";
  if (c < 6) return "#38bdf8";
  if (c < 10) return "#22d3ee";
  return "#67e8f9";
}

(async () => {
  const weeks = await getData();

  const size = 12;
  const gap = 4;

  let rects = "";

  weeks.forEach((week, x) => {
    week.contributionDays.forEach((day, y) => {
      rects += `<rect x="${x*(size+gap)}" y="${y*(size+gap)}"
        width="${size}" height="${size}"
        fill="${getColor(day.contributionCount)}"/>`;
    });
  });

  // 🔵 FIXED MAZE WALLS (like your image)
  const maze = `
    M 20 40 H 300
    M 300 40 V 80
    M 300 80 H 600
    M 600 80 V 40
    M 600 40 H 900

    M 20 100 H 250
    M 250 100 V 140
    M 250 140 H 700
    M 700 140 V 100
    M 700 100 H 900
  `;

  // 🟡 MOVEMENT PATH (clean continuous)
  const path = `
    M 20 40
    H 300
    V 80
    H 600
    V 40
    H 900
    V 100
    H 250
    V 140
    H 700
    V 100
    H 900
  `;

  // 🟡 Pacman
  const pacman = `
    <circle r="8" fill="yellow">
      <animateMotion dur="12s" repeatCount="indefinite" path="${path}" />
    </circle>
  `;

  // 👻 Ghost
  function ghost(color, delay) {
    return `
      <circle r="8" fill="${color}">
        <animateMotion dur="12s" repeatCount="indefinite"
          path="${path}" begin="${delay}s"/>
      </circle>
    `;
  }

  const svg = `
<svg width="1000" height="200" xmlns="http://www.w3.org/2000/svg">

  <rect width="100%" height="100%" fill="#020617"/>

  <!-- Grid -->
  <g transform="translate(20,20)">
    ${rects}
  </g>

  <!-- Maze walls -->
  <path d="${maze}" stroke="#22d3ee" stroke-width="2" fill="none"/>

  <!-- Pacman -->
  ${pacman}

  <!-- Ghosts -->
  ${ghost("#3b82f6", 2)}
  ${ghost("#3b82f6", 4)}
  ${ghost("#3b82f6", 6)}

</svg>
`;

  fs.mkdirSync("output", { recursive: true });
  fs.writeFileSync("output/pacman.svg", svg);
})();
