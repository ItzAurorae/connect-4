import { Connect4Engine } from "./engine.js";
import { Connect4AI } from "./ai.js";
import { UI } from "./ui.js";

const engine = new Connect4Engine();
const ai = new Connect4AI();
const ui = new UI(engine);

let mode = "pvp";

// controls
document.querySelectorAll("[data-mode]").forEach(btn => {
  btn.onclick = () => mode = btn.dataset.mode;
});

document.getElementById("restart").onclick = () => {
  engine.reset();
  ui.overlay.classList.add("hidden");
  ui.render();
};

document.getElementById("start").onclick = () => {
  engine.reset();
  ui.render();
};

// AI hook (simple turn system)
setInterval(() => {
  if (mode === "ai" && engine.player === 2 && !engine.over) {
    const col = ai.choose(engine);
    engine.drop(col);
    ui.render();
  }
}, 300);
