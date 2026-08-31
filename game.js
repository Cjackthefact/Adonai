const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const pauseBtn = document.getElementById("pauseBtn");
const godModeBtn = document.getElementById("godModeBtn");
const playModeBtn = document.getElementById("playModeBtn");
const selectedName = document.getElementById("selectedName");
const selectedInfo = document.getElementById("selectedInfo");
const playCharacterBtn = document.getElementById("playCharacterBtn");

let W = 0, H = 0;
let paused = false;
let mode = "god";
let selected = null;
let playingAs = null;
let camera = { x: 0, y: 0, zoom: 1 };

const world = {
  width: 1800,
  height: 1200,
  people: [],
  trees: [],
  houses: [],
  water: []
};

const names = [
  "Marcus","Elena","James","Amara","David","Maya","Jonah","Naomi",
  "Andre","Sarah","Daniel","Layla","Isaiah","Nia","Malik","Ava"
];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth;
  H = innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

function rand(a,b) { return Math.random() * (b-a) + a; }

function makeWorld() {
  for (let i=0;i<110;i++) {
    world.trees.push({x:rand(60,1740), y:rand(60,1140), r:rand(8,16)});
  }

  for (let i=0;i<14;i++) {
    world.houses.push({x:rand(180,1600), y:rand(150,1050), s:rand(22,30)});
  }

  for (let i=0;i<20;i++) {
    world.people.push({
      id:i,
      name:names[i],
      age:Math.floor(rand(18,55)),
      job:["Farmer","Builder","Hunter","Merchant"][i%4],
      x:rand(220,1580),
      y:rand(180,1020),
      tx:0, ty:0,
      speed:rand(.18,.42),
      hunger:Math.floor(rand(10,80)),
      goal:["Find food","Work","Visit family","Explore"][i%4]
    });
  }

  world.people.forEach(p => chooseTarget(p));
}

function chooseTarget(p) {
  p.tx = Math.max(80, Math.min(world.width-80, p.x + rand(-180,180)));
  p.ty = Math.max(80, Math.min(world.height-80, p.y + rand(-180,180)));
}

function update() {
  if (paused) return;

  for (const p of world.people) {
    if (p === playingAs) continue;

    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const d = Math.hypot(dx,dy);

    if (d < 5) {
      chooseTarget(p);
    } else {
      p.x += dx/d * p.speed;
      p.y += dy/d * p.speed;
    }

    p.hunger += .006;
    if (p.hunger > 100) p.hunger = 0;
  }
}

function screenToWorld(sx, sy) {
  return {
    x: (sx - W/2) / camera.zoom + camera.x,
    y: (sy - H/2) / camera.zoom + camera.y
  };
}

function draw() {
  ctx.clearRect(0,0,W,H);

  ctx.save();
  ctx.translate(W/2, H/2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);

  // Water
  ctx.fillStyle = "#4b91c2";
  ctx.fillRect(0,0,world.width,world.height);

  // Land
  ctx.fillStyle = "#72a95b";
  ctx.fillRect(80,70,1640,1060);

  // Simple terrain patches
  for (let i=0;i<35;i++) {
    ctx.fillStyle = i%2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.035)";
    ctx.beginPath();
    ctx.arc(rand(120,1680),rand(100,1100),rand(40,130),0,Math.PI*2);
    ctx.fill();
  }

  // Houses
  for (const h of world.houses) {
    ctx.fillStyle = "#d8bd83";
    ctx.fillRect(h.x-h.s, h.y-h.s*.55, h.s*2, h.s*1.1);
    ctx.fillStyle = "#8e4e3c";
    ctx.beginPath();
    ctx.moveTo(h.x-h.s-4,h.y-h.s*.55);
    ctx.lineTo(h.x,h.y-h.s*1.25);
    ctx.lineTo(h.x+h.s+4,h.y-h.s*.55);
    ctx.closePath();
    ctx.fill();
  }

  // Trees
  for (const t of world.trees) {
    ctx.fillStyle = "#684c32";
    ctx.fillRect(t.x-3,t.y+5,6,14);
    ctx.fillStyle = "#2e713e";
    ctx.beginPath();
    ctx.arc(t.x,t.y,t.r,0,Math.PI*2);
    ctx.fill();
  }

  // People
  for (const p of world.people) {
    const active = p === selected || p === playingAs;

    if (active) {
      ctx.strokeStyle = p === playingAs ? "#ffd54a" : "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x,p.y-12,13,0,Math.PI*2);
      ctx.stroke();
    }

    ctx.fillStyle = "#f1c6a8";
    ctx.beginPath();
    ctx.arc(p.x,p.y-12,6,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle = p === playingAs ? "#7c3aed" : "#344f9b";
    ctx.fillRect(p.x-6,p.y-6,12,15);

    ctx.fillStyle = "rgba(0,0,0,.7)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.name,p.x,p.y+23);
  }

  ctx.restore();

  if (playingAs) {
    ctx.fillStyle = "rgba(124,58,237,.9)";
    ctx.fillRect(0,76,W,3);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("PLAYING AS " + playingAs.name.toUpperCase(),16,98);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function selectAt(sx, sy) {
  const p = screenToWorld(sx,sy);
  let closest = null;
  let dist = 30 / camera.zoom;

  for (const person of world.people) {
    const d = Math.hypot(person.x-p.x, person.y-person.y*0 + (person.y-12)-p.y);
    if (d < dist) {
      closest = person;
      dist = d;
    }
  }

  if (closest) {
    selected = closest;
    selectedName.textContent = closest.name;
    selectedInfo.textContent =
      `${closest.age} years old • ${closest.job} • Goal: ${closest.goal}`;
    playCharacterBtn.hidden = false;
  }
}

canvas.addEventListener("pointerdown", e => {
  canvas.setPointerCapture(e.pointerId);
  selectAt(e.clientX,e.clientY);
});

godModeBtn.onclick = () => {
  mode = "god";
  playingAs = null;
  godModeBtn.classList.add("active");
  playModeBtn.classList.remove("active");
  playCharacterBtn.hidden = true;
};

playModeBtn.onclick = () => {
  mode = "play";
  playModeBtn.classList.add("active");
  godModeBtn.classList.remove("active");
  if (selected) {
    playingAs = selected;
    playCharacterBtn.hidden = true;
  }
};

playCharacterBtn.onclick = () => {
  if (selected) {
    playingAs = selected;
    mode = "play";
    playModeBtn.classList.add("active");
    godModeBtn.classList.remove("active");
    playCharacterBtn.hidden = true;
  }
};

pauseBtn.onclick = () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶" : "Ⅱ";
};

makeWorld();
camera.x = world.width/2;
camera.y = world.height/2;
loop();
