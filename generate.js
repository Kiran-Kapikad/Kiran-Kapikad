const fs = require("fs");
const fetch = require("node-fetch");

const username = "Kiran-Kapikad";

// ---- fetch contributions ----
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

// ---- colors (blue palette like your screenshot) ----
function getColor(c) {
  if (c === 0) return "#0b1220";
  if (c < 3) return "#0ea5e9";
  if (c < 6) return "#38bdf8";
  if (c < 10) return "#22d3ee";
  return "#67e8f9";
}

(async () => {
  const weeks = await getData();

  const size = 12;
  const gap = 4;

  // ---- grid ----
  let rects = "";
  weeks.forEach((week, x) => {
    week.contributionDays.forEach((day, y) => {
      rects += `<rect x="${x*(size+gap)}" y="${y*(size+gap)}"
        width="${size}" height="${size}"
        fill="${getColor(day.contributionCount)}"/>`;
    });
  });

  // ---- MAZE (dense, aligned to your screenshot style) ----
  const maze = `
    M 20 40 H 260
    M 260 40 V 80
    M 260 80 H 420
    M 420 80 V 40
    M 420 40 H 620
    M 620 40 V 80
    M 620 80 H 860

    M 20 100 H 200
    M 200 100 V 140
    M 200 140 H 360
    M 360 140 V 100
    M 360 100 H 560
    M 560 100 V 140
    M 560 140 H 760
    M 760 140 V 100
    M 760 100 H 900

    M 120 60 V 120
    M 300 60 V 120
    M 480 60 V 120
    M 660 60 V 120
  `;

  // ---- MOVEMENT PATH (continuous, follows maze) ----
  const path = `
    M 20 40
    H 260 V 80 H 420 V 40 H 620 V 80 H 860
    V 100 H 760 V 140 H 560 V 100 H 360 V 140 H 200 V 100 H 20
  `;

  // ---- Pacman ----
  const pacman = `
    <circle r="8" fill="yellow">
      <animateMotion dur="12s" repeatCount="indefinite" path="${path}" />
    </circle>
  `;

  // ---- Ghosts ----
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

  <g transform="translate(20,20)">
    ${rects}
  </g>

  <path d="${maze}" stroke="#22d3ee" stroke-width="2" fill="none"/>

  ${pacman}
  ${ghost("#38bdf8", 2)}
  ${ghost("#22d3ee", 4)}
  ${ghost("#a78bfa", 6)}
</svg>
`;

  fs.mkdirSync("output", { recursive: true });
  fs.writeFileSync("output/pacman.svg", svg);
})();
