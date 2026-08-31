// ============================================
// ADONAI — WORLD SIMULATOR
// ============================================

const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

// Existing UI elements
const pauseBtn = document.getElementById("pauseBtn");
const godModeBtn = document.getElementById("godModeBtn");
const playModeBtn = document.getElementById("playModeBtn");
const selectedName = document.getElementById("selectedName");
const selectedInfo = document.getElementById("selectedInfo");
const playCharacterBtn = document.getElementById("playCharacterBtn");

let W = 0;
let H = 0;

let paused = false;
let mode = "god";
let selected = null;
let playingAs = null;

let camera = {
    x: 0,
    y: 0,
    zoom: 1
};

// ============================================
// WORLD
// ============================================

const world = {
    width: 2400,
    height: 1600,

    people: [],
    trees: [],
    houses: [],
    water: [],

    time: 0
};

// ============================================
// PEOPLE
// ============================================

const names = [
    "Adam",
    "Eve",
    "Noah",
    "Sarah",
    "Daniel",
    "Layla",
    "Isaiah",
    "Maya",
    "David",
    "Ruth",
    "Samuel",
    "Mary",
    "Joseph",
    "Jonah",
    "Abigail",
    "Elijah",
    "Hannah",
    "Michael",
    "Rachel",
    "Benjamin"
];

const jobs = [
    "Farmer",
    "Builder",
    "Hunter",
    "Fisher",
    "Merchant",
    "Traveler"
];

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(random(min, max + 1));
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

// ============================================
// CREATE PEOPLE
// ============================================

function createPerson(name, index) {

    return {
        id: index,

        name: name,

        x: random(250, world.width - 250),
        y: random(250, world.height - 250),

        age: randomInt(18, 65),

        health: 100,
        hunger: randomInt(10, 40),

        happiness: randomInt(50, 90),

        job: jobs[randomInt(0, jobs.length - 1)],

        alive: true,

        color: `hsl(${randomInt(0, 360)}, 65%, 55%)`,

        direction: random(0, Math.PI * 2),

        speed: random(0.3, 0.8),

        decision: "Exploring",

        decisionTimer: randomInt(60, 180)
    };
}

// ============================================
// WORLD GENERATION
// ============================================

function generateWorld() {

    world.people = [];
    world.trees = [];
    world.houses = [];
    world.water = [];

    // People
    names.forEach((name, index) => {
        world.people.push(createPerson(name, index));
    });

    // Trees
    for (let i = 0; i < 220; i++) {

        world.trees.push({
            x: random(50, world.width - 50),
            y: random(50, world.height - 50),
            size: random(12, 25)
        });
    }

    // Houses
    for (let i = 0; i < 25; i++) {

        world.houses.push({
            x: random(150, world.width - 200),
            y: random(150, world.height - 200),
            width: random(60, 90),
            height: random(50, 70)
        });
    }

    // Rivers / water areas
    for (let i = 0; i < 4; i++) {

        world.water.push({
            x: random(200, world.width - 500),
            y: random(200, world.height - 500),
            width: random(300, 700),
            height: random(60, 130)
        });
    }
}

// ============================================
// CANVAS
// ============================================

function resizeCanvas() {

    W = canvas.clientWidth;
    H = canvas.clientHeight;

    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;

    ctx.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );
}

window.addEventListener("resize", resizeCanvas);

// ============================================
// CAMERA
// ============================================

function centerCameraOn(person) {

    if (!person) return;

    camera.x = person.x - W / (2 * camera.zoom);
    camera.y = person.y - H / (2 * camera.zoom);

    camera.x = Math.max(
        0,
        Math.min(
            camera.x,
            world.width - W / camera.zoom
        )
    );

    camera.y = Math.max(
        0,
        Math.min(
            camera.y,
            world.height - H / camera.zoom
        )
    );
}

// ============================================
// NPC DECISIONS
// ============================================

function makeDecision(person) {

    if (!person.alive) return;

    if (person.hunger > 80) {

        person.decision = "Looking for food";

        person.direction = random(
            0,
            Math.PI * 2
        );

    } else if (person.health < 40) {

        person.decision = "Resting";

    } else {

        const decisions = [
            "Working",
            "Exploring",
            "Visiting",
            "Gathering",
            "Walking",
            "Socializing"
        ];

        person.decision =
            decisions[randomInt(0, decisions.length - 1)];

        person.direction = random(
            0,
            Math.PI * 2
        );
    }

    person.decisionTimer = randomInt(100, 300);
}

// ============================================
// UPDATE PEOPLE
// ============================================

function updatePeople() {

    world.people.forEach(person => {

        if (!person.alive) return;

        // Hunger increases
        person.hunger += 0.008;

        if (person.hunger > 100) {

            person.hunger = 100;

            person.health -= 0.02;
        }

        // Decision timer
        person.decisionTimer--;

        if (person.decisionTimer <= 0) {
            makeDecision(person);
        }

        // Player controlled character
        if (playingAs === person) {
            return;
        }

        // NPC movement
        if (person.decision !== "Resting") {

            person.x +=
                Math.cos(person.direction) *
                person.speed;

            person.y +=
                Math.sin(person.direction) *
                person.speed;
        }

        // World boundaries
        if (person.x < 30) {
            person.x = 30;
            person.direction = Math.random() * Math.PI * 2;
        }

        if (person.x > world.width - 30) {
            person.x = world.width - 30;
            person.direction = Math.random() * Math.PI * 2;
        }

        if (person.y < 30) {
            person.y = 30;
            person.direction = Math.random() * Math.PI * 2;
        }

        if (person.y > world.height - 30) {
            person.y = world.height - 30;
            person.direction = Math.random() * Math.PI * 2;
        }

        // Small recovery
        if (person.hunger < 40) {
            person.health = Math.min(
                100,
                person.health + 0.005
            );
        }

        // Death
        if (person.health <= 0) {

            person.health = 0;
            person.alive = false;
            person.decision = "Dead";
        }
    });
}

// ============================================
// DRAW WATER
// ============================================

function drawWater() {

    ctx.save();

    ctx.fillStyle = "#3187c7";

    world.water.forEach(w => {

        ctx.beginPath();

        ctx.roundRect(
            w.x,
            w.y,
            w.width,
            w.height,
            40
        );

        ctx.fill();
    });

    ctx.restore();
}

// ============================================
// DRAW TREES
// ============================================

function drawTrees() {

    world.trees.forEach(tree => {

        // Trunk
        ctx.fillStyle = "#76502f";

        ctx.fillRect(
            tree.x - 4,
            tree.y,
            8,
            tree.size
        );

        // Leaves
        ctx.fillStyle = "#3d9148";

        ctx.beginPath();

        ctx.arc(
            tree.x,
            tree.y,
            tree.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });
}

// ============================================
// DRAW HOUSES
// ============================================

function drawHouses() {

    world.houses.forEach(house => {

        // Building
        ctx.fillStyle = "#d6a66a";

        ctx.fillRect(
            house.x,
            house.y,
            house.width,
            house.height
        );

        // Roof
        ctx.fillStyle = "#9b4637";

        ctx.beginPath();

        ctx.moveTo(
            house.x - 10,
            house.y
        );

        ctx.lineTo(
            house.x + house.width / 2,
            house.y - 35
        );

        ctx.lineTo(
            house.x + house.width + 10,
            house.y
        );

        ctx.closePath();

        ctx.fill();

        // Door
        ctx.fillStyle = "#573827";

        ctx.fillRect(
            house.x + house.width / 2 - 8,
            house.y + house.height - 25,
            16,
            25
        );
    });
}

// ============================================
// DRAW PEOPLE
// ============================================

function drawPeople() {

    world.people.forEach(person => {

        if (!person.alive) return;

        const isSelected =
            selected === person;

        const isPlayer =
            playingAs === person;

        // Selection ring
        if (isSelected || isPlayer) {

            ctx.strokeStyle =
                isPlayer ? "#ffd700" : "#ffffff";

            ctx.lineWidth = 3;

            ctx.beginPath();

            ctx.arc(
                person.x,
                person.y,
                17,
                0,
                Math.PI * 2
            );

            ctx.stroke();
        }

        // Body
        ctx.fillStyle = person.color;

        ctx.beginPath();

        ctx.arc(
            person.x,
            person.y,
            10,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Head
        ctx.fillStyle = "#f0b27a";

        ctx.beginPath();

        ctx.arc(
            person.x,
            person.y - 13,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Name when selected
        if (isSelected || isPlayer) {

            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";

            ctx.fillStyle = "#ffffff";

            ctx.fillText(
                person.name,
                person.x,
                person.y - 28
            );
        }
    });
}

// ============================================
// DRAW WORLD
// ============================================

function drawWorld() {

    ctx.clearRect(0, 0, W, H);

    ctx.save();

    ctx.scale(camera.zoom, camera.zoom);

    ctx.translate(
        -camera.x,
        -camera.y
    );

    // Ground
    ctx.fillStyle = "#82b85a";

    ctx.fillRect(
        0,
        0,
        world.width,
        world.height
    );

    drawWater();
    drawTrees();
    drawHouses();
    drawPeople();

    ctx.restore();
}

// ============================================
// MOUSE / TOUCH SELECTION
// ============================================

function getWorldPosition(event) {

    const rect =
        canvas.getBoundingClientRect();

    const x =
        (event.clientX - rect.left) /
        camera.zoom +
        camera.x;

    const y =
        (event.clientY - rect.top) /
        camera.zoom +
        camera.y;

    return { x, y };
}

function selectPersonAt(x, y) {

    let closest = null;
    let closestDistance = 30;

    world.people.forEach(person => {

        if (!person.alive) return;

        const d = Math.hypot(
            person.x - x,
            person.y - y
        );

        if (d < closestDistance) {

            closest = person;
            closestDistance = d;
        }
    });

    if (closest) {

        selected = closest;

        updateSelectedUI();
    }
}

canvas.addEventListener("click", event => {

    const pos = getWorldPosition(event);

    selectPersonAt(
        pos.x,
        pos.y
    );
});

// ============================================
// SELECTED CHARACTER UI
// ============================================

function updateSelectedUI() {

    if (!selected) {

        if (selectedName)
            selectedName.textContent = "No character selected";

        if (selectedInfo)
            selectedInfo.textContent = "";

        return;
    }

    if (selectedName) {

        selectedName.textContent =
            selected.name;
    }

    if (selectedInfo) {

        selectedInfo.innerHTML = `
            Age: ${Math.floor(selected.age)}<br>
            Job: ${selected.job}<br>
            Health: ${Math.floor(selected.health)}%<br>
            Hunger: ${Math.floor(selected.hunger)}%<br>
            Happiness: ${Math.floor(selected.happiness)}%<br>
            Decision: ${selected.decision}
        `;
    }
}

// ============================================
// PLAY AS CHARACTER
// ============================================

if (playCharacterBtn) {

    playCharacterBtn.addEventListener(
        "click",
        () => {

            if (!selected) return;

            playingAs = selected;

            mode = "character";

            centerCameraOn(playingAs);

            updateButtons();
        }
    );
}

// ============================================
// GOD MODE
// ============================================

if (godModeBtn) {

    godModeBtn.addEventListener(
        "click",
        () => {

            mode = "god";

            playingAs = null;

            updateButtons();
        }
    );
}

// ============================================
// PLAY MODE
// ============================================

if (playModeBtn) {

    playModeBtn.addEventListener(
        "click",
        () => {

            mode = "character";

            if (!playingAs && selected) {
                playingAs = selected;
            }

            if (playingAs) {
                centerCameraOn(playingAs);
            }

            updateButtons();
        }
    );
}

// ============================================
// PAUSE
// ============================================

if (pauseBtn) {

    pauseBtn.addEventListener(
        "click",
        () => {

            paused = !paused;

            pauseBtn.textContent =
                paused ? "▶ Resume" : "⏸ Pause";
        }
    );
}

// ============================================
// KEYBOARD CONTROLS
// ============================================

const keys = {};

window.addEventListener(
    "keydown",
    event => {
        keys[event.key.toLowerCase()] = true;
    }
);

window.addEventListener(
    "keyup",
    event => {
        keys[event.key.toLowerCase()] = false;
    }
);

function controlPlayer() {

    if (!playingAs) return;

    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"]) {
        dy -= 1;
    }

    if (keys["s"] || keys["arrowdown"]) {
        dy += 1;
    }

    if (keys["a"] || keys["arrowleft"]) {
        dx -= 1;
    }

    if (keys["d"] || keys["arrowright"]) {
        dx += 1;
    }

    if (dx !== 0 || dy !== 0) {

        const length =
            Math.hypot(dx, dy);

        dx /= length;
        dy /= length;

        playingAs.x += dx * 2.5;
        playingAs.y += dy * 2.5;

        playingAs.direction =
            Math.atan2(dy, dx);

        playingAs.decision =
            "Player controlled";

        centerCameraOn(playingAs);
    }
}

// ============================================
// BUTTON DISPLAY
// ============================================

function updateButtons() {

    if (godModeBtn) {

        godModeBtn.textContent =
            mode === "god"
                ? "👑 God Mode: ON"
                : "👑 God Mode";
    }

    if (playModeBtn) {

        playModeBtn.textContent =
            mode === "character"
                ? "🎮 Character Mode: ON"
                : "🎮 Character Mode";
    }
}

// ============================================
// GAME LOOP
// ============================================

function gameLoop() {

    if (!paused) {

        world.time += 1;

        updatePeople();

        controlPlayer();
    }

    drawWorld();

    updateSelectedUI();

    requestAnimationFrame(gameLoop);
}

// ============================================
// START GAME
// ============================================

generateWorld();

resizeCanvas();

updateButtons();

gameLoop();

console.log("ADONAI WORLD STARTED");
