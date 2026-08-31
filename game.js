const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

const pauseBtn = document.getElementById("pauseBtn");
const godModeBtn = document.getElementById("godModeBtn");
const playModeBtn = document.getElementById("playModeBtn");
const selectedName = document.getElementById("selectedName");
const selectedInfo = document.getElementById("selectedInfo");
const playCharacterBtn = document.getElementById("playCharacterBtn");

let paused = false;
let mode = "god";
let selected = null;
let playingAs = null;

const world = {
    width: 5000,
    height: 3500,
    people: [],
    trees: [],
    houses: [],
    water: []
};

const camera = {
    x: 2500,
    y: 1750,
    zoom: 1
};

const keys = {};

const names = [
    "Joseph", "Marcus", "Daniel", "Sarah", "David",
    "Isaiah", "Layla", "Andrew", "Michael", "Samuel",
    "Jacob", "Joshua", "Elijah", "Noah", "Benjamin",
    "Nathan", "Ethan", "Caleb", "Miriam", "Ruth"
];

const jobs = [
    "Farmer",
    "Fisher",
    "Builder",
    "Hunter",
    "Warrior",
    "Gatherer"
];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


// --------------------------------------------------
// WORLD GENERATION
// --------------------------------------------------

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
    return Math.floor(random(min, max));
}

function createWorld() {

    world.people = [];
    world.trees = [];
    world.houses = [];
    world.water = [];

    // Water
    for (let i = 0; i < 25; i++) {
        world.water.push({
            x: random(200, world.width - 200),
            y: random(200, world.height - 200),
            radius: random(100, 350)
        });
    }

    // Trees
    for (let i = 0; i < 600; i++) {
        world.trees.push({
            x: random(50, world.width - 50),
            y: random(50, world.height - 50),
            size: random(15, 32)
        });
    }

    // Houses
    for (let i = 0; i < 45; i++) {
        world.houses.push({
            x: random(250, world.width - 250),
            y: random(250, world.height - 250),
            size: random(35, 55)
        });
    }

    // People
    for (let i = 0; i < 120; i++) {

        const person = {
            id: i,

            name: names[i % names.length],

            x: random(100, world.width - 100),
            y: random(100, world.height - 100),

            age: randomInt(18, 55),

            health: 100,
            hunger: randomInt(30, 90),
            happiness: randomInt(40, 100),

            job: jobs[randomInt(0, jobs.length)],

            speed: random(0.4, 1.2),

            targetX: null,
            targetY: null,

            decision: "Wandering",

            alive: true,

            color: Math.random() > 0.5 ? "#d14c4c" : "#4c62d1"
        };

        world.people.push(person);
    }
}

createWorld();


// --------------------------------------------------
// CAMERA
// --------------------------------------------------

function screenToWorld(screenX, screenY) {

    return {
        x: camera.x + (screenX - canvas.width / 2) / camera.zoom,
        y: camera.y + (screenY - canvas.height / 2) / camera.zoom
    };

}

function worldToScreen(worldX, worldY) {

    return {
        x: canvas.width / 2 + (worldX - camera.x) * camera.zoom,
        y: canvas.height / 2 + (worldY - camera.y) * camera.zoom
    };

}


// --------------------------------------------------
// ZOOM
// --------------------------------------------------

function setZoom(value, centerX, centerY) {

    const oldZoom = camera.zoom;

    camera.zoom = Math.max(0.35, Math.min(3.5, value));

    if (centerX !== undefined) {

        const before = screenToWorld(centerX, centerY);

        camera.x += before.x - screenToWorld(centerX, centerY).x;
        camera.y += before.y - screenToWorld(centerX, centerY).y;

    }

    if (oldZoom !== camera.zoom) {
        render();
    }
}


// Mouse wheel zoom

canvas.addEventListener("wheel", function(e) {

    e.preventDefault();

    const direction = e.deltaY < 0 ? 1.1 : 0.9;

    setZoom(
        camera.zoom * direction,
        e.clientX,
        e.clientY
    );

}, { passive: false });


// Pinch zoom

let touches = [];
let pinchDistance = null;

canvas.addEventListener("touchstart", function(e) {

    touches = [...e.touches];

    if (touches.length === 2) {

        pinchDistance = Math.hypot(
            touches[0].clientX - touches[1].clientX,
            touches[0].clientY - touches[1].clientY
        );

    }

}, { passive: false });


canvas.addEventListener("touchmove", function(e) {

    if (e.touches.length === 2) {

        const a = e.touches[0];
        const b = e.touches[1];

        const distance = Math.hypot(
            a.clientX - b.clientX,
            a.clientY - b.clientY
        );

        if (pinchDistance) {

            const scale = distance / pinchDistance;

            setZoom(
                camera.zoom * scale,
                (a.clientX + b.clientX) / 2,
                (a.clientY + b.clientY) / 2
            );

        }

        pinchDistance = distance;

        e.preventDefault();
    }

}, { passive: false });


// --------------------------------------------------
// CAMERA DRAGGING
// --------------------------------------------------

let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("pointerdown", function(e) {

    dragging = true;

    lastX = e.clientX;
    lastY = e.clientY;

});

canvas.addEventListener("pointermove", function(e) {

    if (!dragging) return;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    camera.x -= dx / camera.zoom;
    camera.y -= dy / camera.zoom;

    lastX = e.clientX;
    lastY = e.clientY;

});

canvas.addEventListener("pointerup", function() {
    dragging = false;
});

canvas.addEventListener("pointercancel", function() {
    dragging = false;
});


// --------------------------------------------------
// SELECT CHARACTER
// --------------------------------------------------

canvas.addEventListener("click", function(e) {

    const pos = screenToWorld(e.clientX, e.clientY);

    let closest = null;
    let closestDistance = 30 / camera.zoom;

    for (const person of world.people) {

        if (!person.alive) continue;

        const distance = Math.hypot(
            person.x - pos.x,
            person.y - pos.y
        );

        if (distance < closestDistance) {

            closest = person;
            closestDistance = distance;

        }

    }

    if (closest) {
        selectCharacter(closest);
    }

});

function selectCharacter(person) {

    selected = person;

    selectedName.textContent = person.name;

    selectedInfo.innerHTML = `
        Age: ${Math.floor(person.age)}<br>
        Job: ${person.job}<br>
        Health: ${Math.floor(person.health)}%<br>
        Hunger: ${Math.floor(person.hunger)}%<br>
        Happiness: ${Math.floor(person.happiness)}%<br>
        Decision: ${person.decision}
    `;

}


// --------------------------------------------------
// CHARACTER CONTROL
// --------------------------------------------------

playCharacterBtn.addEventListener("click", function() {

    if (!selected) return;

    playingAs = selected;
    mode = "character";

    updateModeButtons();

});


// --------------------------------------------------
// MODE BUTTONS
// --------------------------------------------------

godModeBtn.addEventListener("click", function() {

    mode = "god";
    playingAs = null;

    updateModeButtons();

});

playModeBtn.addEventListener("click", function() {

    if (!selected) return;

    mode = "character";
    playingAs = selected;

    updateModeButtons();

});

function updateModeButtons() {

    if (mode === "god") {

        godModeBtn.innerHTML = "👑 God Mode: ON";
        playModeBtn.innerHTML = "🎮 Character Mode";

    } else {

        godModeBtn.innerHTML = "👑 God Mode";
        playModeBtn.innerHTML = "🎮 Character Mode: ON";

    }

}


// --------------------------------------------------
// PAUSE
// --------------------------------------------------

pauseBtn.addEventListener("click", function() {

    paused = !paused;

    pauseBtn.textContent = paused ? "▶" : "Ⅱ";

});


// --------------------------------------------------
// AI
// --------------------------------------------------

function updatePeople() {

    for (const person of world.people) {

        if (!person.alive) continue;

        // Player controlled character

        if (person === playingAs) {

            person.decision = "Player controlled";
            continue;

        }

        // Hunger

        person.hunger -= 0.01;

        if (person.hunger < 15) {

            person.decision = "Looking for food";

            person.hunger += 0.03;

        }

        // Happiness

        if (person.hunger > 60) {

            person.happiness += 0.01;

        } else {

            person.happiness -= 0.01;

        }

        person.happiness = Math.max(
            0,
            Math.min(100, person.happiness)
        );

        // Random decisions

        if (Math.random() < 0.01) {

            const decisions = [
                "Walking",
                "Working",
                "Gathering",
                "Talking",
                "Looking for food",
                "Visiting",
                "Resting"
            ];

            person.decision =
                decisions[randomInt(0, decisions.length)];

        }

        // Movement

        if (
            person.targetX === null ||
            Math.random() < 0.01
        ) {

            person.targetX =
                person.x + random(-250, 250);

            person.targetY =
                person.y + random(-250, 250);

        }

        const dx = person.targetX - person.x;
        const dy = person.targetY - person.y;

        const distance = Math.hypot(dx, dy);

        if (distance > 5) {

            person.x += (dx / distance) * person.speed;
            person.y += (dy / distance) * person.speed;

        }

        // World boundaries

        person.x = Math.max(
            20,
            Math.min(world.width - 20, person.x)
        );

        person.y = Math.max(
            20,
            Math.min(world.height - 20, person.y)
        );

        // Aging

        person.age += 0.00002;

        // Death from old age

        if (person.age > 90) {

            person.alive = false;

        }

    }

}


// --------------------------------------------------
// DRAW WORLD
// --------------------------------------------------

function drawWorld() {

    ctx.fillStyle = "#8eb56b";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Water

    for (const lake of world.water) {

        const p = worldToScreen(lake.x, lake.y);

        ctx.beginPath();

        ctx.fillStyle = "#4d9bd8";

        ctx.arc(
            p.x,
            p.y,
            lake.radius * camera.zoom,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    // Trees

    for (const tree of world.trees) {

        const p = worldToScreen(tree.x, tree.y);

        ctx.beginPath();

        ctx.fillStyle = "#4e8e4b";

        ctx.arc(
            p.x,
            p.y,
            tree.size * camera.zoom,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

    // Houses

    for (const house of world.houses) {

        const p = worldToScreen(house.x, house.y);

        const s = house.size * camera.zoom;

        ctx.fillStyle = "#d2aa70";

        ctx.fillRect(
            p.x - s / 2,
            p.y - s / 2,
            s,
            s
        );

        ctx.beginPath();

        ctx.fillStyle = "#9b4e3e";

        ctx.moveTo(
            p.x - s * 0.65,
            p.y - s / 2
        );

        ctx.lineTo(
            p.x,
            p.y - s
        );

        ctx.lineTo(
            p.x + s * 0.65,
            p.y - s / 2
        );

        ctx.closePath();

        ctx.fill();

    }

    // People

    for (const person of world.people) {

        if (!person.alive) continue;

        const p = worldToScreen(
            person.x,
            person.y
        );

        const size = 9 * camera.zoom;

        // Selection ring

        if (person === selected) {

            ctx.beginPath();

            ctx.strokeStyle = "#ffffff";

            ctx.lineWidth = 3;

            ctx.arc(
                p.x,
                p.y,
                size * 1.8,
                0,
                Math.PI * 2
            );

            ctx.stroke();

        }

        // Body

        ctx.beginPath();

        ctx.fillStyle = person.color;

        ctx.arc(
            p.x,
            p.y + size * 0.5,
            size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Head

        ctx.beginPath();

        ctx.fillStyle = "#e8b27d";

        ctx.arc(
            p.x,
            p.y - size * 0.7,
            size * 0.65,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Name when selected

        if (person === selected && camera.zoom > 0.7) {

            ctx.fillStyle = "#ffffff";

            ctx.font = `${Math.max(12, 14 * camera.zoom)}px Arial`;

            ctx.textAlign = "center";

            ctx.fillText(
                person.name,
                p.x,
                p.y - size * 2
            );

        }

    }

}


// --------------------------------------------------
// CHARACTER MOVEMENT
// --------------------------------------------------

window.addEventListener("keydown", function(e) {

    keys[e.key.toLowerCase()] = true;

});

window.addEventListener("keyup", function(e) {

    keys[e.key.toLowerCase()] = false;

});

function controlCharacter() {

    if (!playingAs) return;

    const speed = 2;

    if (keys["w"] || keys["arrowup"]) {
        playingAs.y -= speed;
    }

    if (keys["s"] || keys["arrowdown"]) {
        playingAs.y += speed;
    }

    if (keys["a"] || keys["arrowleft"]) {
        playingAs.x -= speed;
    }

    if (keys["d"] || keys["arrowright"]) {
        playingAs.x += speed;
    }

}


// --------------------------------------------------
// GAME LOOP
// --------------------------------------------------

function gameLoop() {

    if (!paused) {

        updatePeople();
        controlCharacter();

    }

    drawWorld();

    requestAnimationFrame(gameLoop);

}

gameLoop();
