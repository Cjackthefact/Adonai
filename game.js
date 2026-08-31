/* =====================================================
   ADONAI
   3D WORLD FOUNDATION
===================================================== */

const canvas = document.getElementById("world");

const pauseBtn = document.getElementById("pauseBtn");
const godModeBtn = document.getElementById("godModeBtn");
const playModeBtn = document.getElementById("playModeBtn");

const selectedName =
    document.getElementById("selectedName");

const selectedInfo =
    document.getElementById("selectedInfo");

const playCharacterBtn =
    document.getElementById("playCharacterBtn");

const characterControls =
    document.getElementById("characterControls");


/* =====================================================
   THREE.JS SETUP
===================================================== */

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x87b9e8);


const camera =
    new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        5000
    );


camera.position.set(
    0,
    38,
    42
);


const renderer =
    new THREE.WebGLRenderer({
        canvas,
        antialias: true
    });


renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


/* =====================================================
   LIGHTING
===================================================== */

const ambientLight =
    new THREE.HemisphereLight(
        0xffffff,
        0x667755,
        2
    );

scene.add(ambientLight);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

sun.position.set(
    100,
    150,
    80
);

sun.castShadow = true;

sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;

sun.shadow.camera.left = -300;
sun.shadow.camera.right = 300;
sun.shadow.camera.top = 300;
sun.shadow.camera.bottom = -300;

scene.add(sun);


/* =====================================================
   GAME STATE
===================================================== */

let paused = false;

let mode = "god";

let selected = null;

let playingAs = null;

const world = {

    width: 120,

    depth: 120,

    people: [],

    animals: [],

    trees: [],

    houses: [],

    objects: []

};


/* =====================================================
   MATERIALS
===================================================== */

const materials = {

    grass:
        new THREE.MeshStandardMaterial({
            color: 0x6fa85b
        }),

    grassDark:
        new THREE.MeshStandardMaterial({
            color: 0x4f8b49
        }),

    dirt:
        new THREE.MeshStandardMaterial({
            color: 0x9a7048
        }),

    water:
        new THREE.MeshStandardMaterial({
            color: 0x398bd0,
            transparent: true,
            opacity: 0.82
        }),

    wood:
        new THREE.MeshStandardMaterial({
            color: 0x80532f
        }),

    leaves:
        new THREE.MeshStandardMaterial({
            color: 0x39753b
        }),

    stone:
        new THREE.MeshStandardMaterial({
            color: 0x777777
        }),

    roof:
        new THREE.MeshStandardMaterial({
            color: 0x7b4038
        }),

    skin:
        new THREE.MeshStandardMaterial({
            color: 0xd69a6a
        }),

    clothing:
        new THREE.MeshStandardMaterial({
            color: 0x4c62d1
        }),

    lion:
        new THREE.MeshStandardMaterial({
            color: 0xc8893f
        }),

    tiger:
        new THREE.MeshStandardMaterial({
            color: 0xd98a35
        }),

    white:
        new THREE.MeshStandardMaterial({
            color: 0xffffff
        }),

    black:
        new THREE.MeshStandardMaterial({
            color: 0x151515
        })

};


/* =====================================================
   HELPERS
===================================================== */

function random(min, max) {

    return Math.random() *
        (max - min) +
        min;

}


function randomInt(min, max) {

    return Math.floor(
        random(min, max)
    );

}


function createBox(
    width,
    height,
    depth,
    material
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;

}


/* =====================================================
   TERRAIN
===================================================== */

function createTerrain() {

    const terrain =
        createBox(
            world.width,
            2,
            world.depth,
            materials.grass
        );

    terrain.position.set(
        0,
        -1,
        0
    );

    terrain.receiveShadow = true;

    scene.add(terrain);


    /*
      Small dirt patches create
      the blocky sandbox look.
    */

    for (let i = 0; i < 35; i++) {

        const patch =
            createBox(
                random(4, 12),
                0.15,
                random(4, 12),
                materials.dirt
            );

        patch.position.set(
            random(
                -world.width / 2,
                world.width / 2
            ),

            0.05,

            random(
                -world.depth / 2,
                world.depth / 2
            )
        );

        scene.add(patch);

    }


    /* Water */

    for (let i = 0; i < 4; i++) {

        const water =
            createBox(
                random(12, 25),
                0.25,
                random(12, 25),
                materials.water
            );

        water.position.set(
            random(-40, 40),
            0.15,
            random(-40, 40)
        );

        scene.add(water);

    }

}


/* =====================================================
   TREES
===================================================== */

function createTree(x, z) {

    const group =
        new THREE.Group();


    const trunk =
        createBox(
            1.1,
            4,
            1.1,
            materials.wood
        );

    trunk.position.y = 2;

    group.add(trunk);


    const leaves =
        createBox(
            4,
            4,
            4,
            materials.leaves
        );

    leaves.position.y = 5;

    group.add(leaves);


    group.position.set(
        x,
        0,
        z
    );

    scene.add(group);

    world.trees.push(group);

}


function createTrees() {

    for (let i = 0; i < 130; i++) {

        createTree(
            random(-55, 55),
            random(-55, 55)
        );

    }

}


/* =====================================================
   HOUSES
===================================================== */

function createHouse(x, z) {

    const group =
        new THREE.Group();


    const body =
        createBox(
            6,
            5,
            6,
            materials.stone
        );

    body.position.y = 2.5;

    group.add(body);


    const roof =
        createBox(
            7,
            1.5,
            7,
            materials.roof
        );

    roof.position.y = 5.5;

    roof.rotation.y =
        Math.PI / 4;

    group.add(roof);


    group.position.set(
        x,
        0,
        z
    );

    scene.add(group);

    world.houses.push(group);

}


function createHouses() {

    for (let i = 0; i < 15; i++) {

        createHouse(
            random(-40, 40),
            random(-40, 40)
        );

    }

}


/* =====================================================
   HUMAN CHARACTERS
===================================================== */

const names = [

    "Joseph",
    "Marcus",
    "Daniel",
    "Sarah",
    "David",
    "Isaiah",
    "Layla",
    "Andrew",
    "Michael",
    "Samuel",
    "Jacob",
    "Joshua",
    "Elijah",
    "Noah",
    "Benjamin",
    "Nathan",
    "Ethan",
    "Caleb",
    "Miriam",
    "Ruth"

];


const jobs = [

    "Farmer",
    "Fisher",
    "Builder",
    "Hunter",
    "Warrior",
    "Gatherer"

];


const personalities = [

    "Friendly",
    "Brave",
    "Curious",
    "Shy",
    "Aggressive",
    "Playful",
    "Calm",
    "Ambitious"

];


function createPerson(index) {

    const group =
        new THREE.Group();


    /* Legs */

    const legs =
        createBox(
            1.3,
            2.5,
            1.3,
            materials.clothing
        );

    legs.position.y =
        1.25;

    group.add(legs);


    /* Body */

    const body =
        createBox(
            2,
            2.4,
            1.6,
            materials.clothing
        );

    body.position.y =
        3.6;

    group.add(body);


    /* Head */

    const head =
        createBox(
            1.7,
            1.7,
            1.7,
            materials.skin
        );

    head.position.y =
        5.7;

    group.add(head);


    group.position.set(
        random(-45, 45),
        0,
        random(-45, 45)
    );


    scene.add(group);


    const person = {

        id: index,

        name:
            names[
                index %
                names.length
            ],

        x:
            group.position.x,

        z:
            group.position.z,

        age:
            randomInt(18, 55),

        health: 100,

        hunger:
            randomInt(40, 90),

        happiness:
            randomInt(40, 100),

        job:
            jobs[
                randomInt(
                    0,
                    jobs.length
                )
            ],

        personality:
            personalities[
                randomInt(
                    0,
                    personalities.length
                )
            ],

        decision:
            "Wandering",

        speed:
            random(.015, .035),

        targetX: null,

        targetZ: null,

        alive: true,

        mesh: group

    };


    world.people.push(
        person
    );

}


/* =====================================================
   ANIMALS
===================================================== */

function createAnimal(
    species,
    x,
    z
) {

    const group =
        new THREE.Group();


    let material =
        materials.lion;


    if (species === "Tiger") {
        material =
            materials.tiger;
    }


    if (species === "Deer") {
        material =
            materials.white;
    }


    const body =
        createBox(
            3,
            1.5,
            1.5,
            material
        );

    body.position.y =
        1.5;

    group.add(body);


    const head =
        createBox(
            1.4,
            1.4,
            1.4,
            material
        );

    head.position.set(
        1.7,
        2,
        0
    );

    group.add(head);


    const legPositions = [

        [-1, .7],
        [1, .7],
        [-1, -.7],
        [1, -.7]

    ];


    for (
        const [lx, lz]
        of legPositions
    ) {

        const leg =
            createBox(
                .5,
                1.4,
                .5,
                material
            );

        leg.position.set(
            lx,
            .7,
            lz
        );

        group.add(leg);

    }


    group.position.set(
        x,
        0,
        z
    );


    scene.add(group);


    const animal = {

        id:
            crypto.randomUUID(),

        species,

        x,

        z,

        health: 100,

        hunger:
            randomInt(40, 100),

        speed:
            random(.01, .025),

        targetX: null,

        targetZ: null,

        alive: true,

        mesh: group

    };


    world.animals.push(
        animal
    );

}


function createAnimals() {

    for (let i = 0; i < 12; i++) {

        createAnimal(
            "Deer",
            random(-45, 45),
            random(-45, 45)
        );

    }


    for (let i = 0; i < 5; i++) {

        createAnimal(
            "Lion",
            random(-45, 45),
            random(-45, 45)
        );

    }


    for (let i = 0; i < 5; i++) {

        createAnimal(
            "Tiger",
            random(-45, 45),
            random(-45, 45)
        );

    }

}


/* =====================================================
   WORLD CREATION
===================================================== */

function createWorld() {

    createTerrain();

    createTrees();

    createHouses();


    for (let i = 0; i < 60; i++) {

        createPerson(i);

    }


    createAnimals();

}


createWorld();


/* =====================================================
   CAMERA
===================================================== */

let cameraTarget =
    new THREE.Vector3(
        0,
        0,
        0
    );


let cameraDistance = 45;

let cameraAngle = 0.7;

let cameraHeight = 28;


function updateCamera() {

    if (
        mode === "character" &&
        playingAs
    ) {

        /*
          Temporary third-person
          follow camera.

          First-person camera will
          be added in the next stage.
        */

        const p =
            playingAs.mesh.position;

        camera.position.set(
            p.x,
            p.y + 12,
            p.z + 18
        );

        camera.lookAt(
            p.x,
            p.y + 3,
            p.z
        );

        return;

    }


    const x =
        cameraTarget.x +
        Math.sin(cameraAngle) *
        cameraDistance;

    const z =
        cameraTarget.z +
        Math.cos(cameraAngle) *
        cameraDistance;


    camera.position.set(
        x,
        cameraHeight,
        z
    );


    camera.lookAt(
        cameraTarget
    );

}


/* =====================================================
   CAMERA TOUCH / MOUSE
===================================================== */

let dragging = false;

let lastPointerX = 0;

let lastPointerY = 0;


canvas.addEventListener(
    "pointerdown",
    event => {

        dragging = true;

        lastPointerX =
            event.clientX;

        lastPointerY =
            event.clientY;

    }
);


canvas.addEventListener(
    "pointermove",
    event => {

        if (!dragging) return;

        const dx =
            event.clientX -
            lastPointerX;

        const dy =
            event.clientY -
            lastPointerY;


        if (
            mode === "god"
        ) {

            cameraAngle -=
                dx * 0.008;

            cameraHeight +=
                dy * 0.12;

            cameraHeight =
                Math.max(
                    8,
                    Math.min(
                        80,
                        cameraHeight
                    )
                );

        }


        lastPointerX =
            event.clientX;

        lastPointerY =
            event.clientY;

    }
);


canvas.addEventListener(
    "pointerup",
    () => {

        dragging = false;

    }
);


canvas.addEventListener(
    "pointercancel",
    () => {

        dragging = false;

    }
);


/* =====================================================
   ZOOM
===================================================== */

canvas.addEventListener(
    "wheel",
    event => {

        event.preventDefault();

        cameraDistance +=
            event.deltaY * 0.04;

        cameraDistance =
            Math.max(
                8,
                Math.min(
                    100,
                    cameraDistance
                )
            );

    },
    {
        passive: false
    }
);


/* =====================================================
   CHARACTER SELECTION
===================================================== */

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


canvas.addEventListener(
    "click",
    event => {

        mouse.x =
            (event.clientX /
                window.innerWidth) *
                2 - 1;

        mouse.y =
            -(event.clientY /
                window.innerHeight) *
                2 + 1;


        raycaster.setFromCamera(
            mouse,
            camera
        );


        const objects = [];


        for (
            const person
            of world.people
        ) {

            if (
                person.alive
            ) {

                objects.push(
                    ...person.mesh.children
                );

            }

        }


        for (
            const animal
            of world.animals
        ) {

            if (
                animal.alive
            ) {

                objects.push(
                    ...animal.mesh.children
                );

            }

        }


        const hits =
            raycaster.intersectObjects(
                objects
            );


        if (!hits.length)
            return;


        const object =
            hits[0].object;


        let foundPerson =
            world.people.find(
                p =>
                    p.mesh ===
                    object.parent
            );


        if (!foundPerson) {

            foundPerson =
                world.people.find(
                    p =>
                        p.mesh.children.includes(
                            object
                        )
                );

        }


        if (foundPerson) {

            selectCharacter(
                foundPerson
            );

            return;

        }


        const foundAnimal =
            world.animals.find(
                a =>
                    a.mesh ===
                    object.parent ||
                    a.mesh.children.includes(
                        object
                    )
            );


        if (foundAnimal) {

            selectAnimal(
                foundAnimal
            );

        }

    }
);


/* =====================================================
   SELECT PERSON
===================================================== */

function selectCharacter(person) {

    selected = person;

    selectedName.textContent =
        person.name;


    selectedInfo.innerHTML = `

        👤 Human<br>
        Age: ${Math.floor(person.age)}<br>
        Job: ${person.job}<br>
        Personality: ${person.personality}<br>
        Health: ${Math.floor(person.health)}%<br>
        Hunger: ${Math.floor(person.hunger)}%<br>
        Happiness: ${Math.floor(person.happiness)}%<br>
        Decision: ${person.decision}

    `;


    playCharacterBtn.hidden =
        false;

}


/* =====================================================
   SELECT ANIMAL
===================================================== */

function selectAnimal(animal) {

    selected = animal;


    selectedName.textContent =
        animal.species;


    selectedInfo.innerHTML = `

        🐾 ${animal.species}<br>
        Health: ${Math.floor(animal.health)}%<br>
        Hunger: ${Math.floor(animal.hunger)}%

    `;


    playCharacterBtn.hidden =
        true;

}


/* =====================================================
   PLAY AS
===================================================== */

playCharacterBtn.addEventListener(
    "click",
    () => {

        if (!selected)
            return;


        if (
            !selected.mesh
        )
            return;


        playingAs =
            selected;


        mode =
            "character";


        characterControls.classList.remove(
            "hidden"
        );


        updateModeButtons();

    }
);


/* =====================================================
   MODE BUTTONS
===================================================== */

godModeBtn.addEventListener(
    "click",
    () => {

        mode = "god";

        playingAs = null;

        characterControls.classList.add(
            "hidden"
        );

        updateModeButtons();

    }
);


playModeBtn.addEventListener(
    "click",
    () => {

        if (!selected)
            return;


        playingAs =
            selected;

        mode =
            "character";

        characterControls.classList.remove(
            "hidden"
        );

        updateModeButtons();

    }
);


function updateModeButtons() {

    if (mode === "god") {

        godModeBtn.classList.add(
            "active"
        );

        playModeBtn.classList.remove(
            "active"
        );

    } else {

        godModeBtn.classList.remove(
            "active"
        );

        playModeBtn.classList.add(
            "active"
        );

    }

}


/* =====================================================
   PAUSE
===================================================== */

pauseBtn.addEventListener(
    "click",
    () => {

        paused =
            !paused;

        pauseBtn.textContent =
            paused
                ? "▶"
                : "Ⅱ";

    }
);


/* =====================================================
   AI PEOPLE
===================================================== */

function updatePeople() {

    for (
        const person
        of world.people
    ) {

        if (
            !person.alive
        )
            continue;


        if (
            person === playingAs
        ) {

            person.decision =
                "Player controlled";

            continue;

        }


        person.hunger -=
            0.002;


        if (
            person.hunger < 15
        ) {

            person.decision =
                "Looking for food";

            person.hunger +=
                0.005;

        }


        if (
            Math.random() <
            0.01
        ) {

            const decisions = [

                "Walking",
                "Working",
                "Gathering",
                "Talking",
                "Hunting",
                "Resting"

            ];


            person.decision =
                decisions[
                    randomInt(
                        0,
                        decisions.length
                    )
                ];

        }


        if (
            person.targetX === null ||
            Math.random() <
            0.01
        ) {

            person.targetX =
                person.x +
                random(-15, 15);

            person.targetZ =
                person.z +
                random(-15, 15);

        }


        const dx =
            person.targetX -
            person.x;

        const dz =
            person.targetZ -
            person.z;


        const distance =
            Math.hypot(
                dx,
                dz
            );


        if (
            distance > 0.2
        ) {

            person.x +=
                (dx / distance) *
                person.speed;

            person.z +=
                (dz / distance) *
                person.speed;

        }


        person.mesh.position.x =
            person.x;

        person.mesh.position.z =
            person.z;


        person.age +=
            0.000001;


        if (
            person.age > 90
        ) {

            person.alive =
                false;

            scene.remove(
                person.mesh
            );

        }

    }

}


/* =====================================================
   ANIMAL AI
===================================================== */

function updateAnimals() {

    for (
        const animal
        of world.animals
    ) {

        if (
            !animal.alive
        )
            continue;


        animal.hunger -=
            0.001;


        if (
            animal.targetX === null ||
            Math.random() <
            0.008
        ) {

            animal.targetX =
                animal.x +
                random(-20, 20);

            animal.targetZ =
                animal.z +
                random(-20, 20);

        }


        const dx =
            animal.targetX -
            animal.x;

        const dz =
            animal.targetZ -
            animal.z;


        const distance =
            Math.hypot(
                dx,
                dz
            );


        if (
            distance > 0.2
        ) {

            animal.x +=
                (dx / distance) *
                animal.speed;

            animal.z +=
                (dz / distance) *
                animal.speed;

        }


        animal.mesh.position.x =
            animal.x;

        animal.mesh.position.z =
            animal.z;

    }

}


/* =====================================================
   CHARACTER CONTROLS
===================================================== */

const movement =
    {

        up: false,
        down: false,
        left: false,
        right: false

    };


document
    .querySelectorAll(
        "[data-move]"
    )
    .forEach(
        button => {

            const direction =
                button.dataset.move;


            button.addEventListener(
                "pointerdown",
                event => {

                    event.preventDefault();

                    movement[
                        direction
                    ] = true;

                }
            );


            button.addEventListener(
                "pointerup",
                () => {

                    movement[
                        direction
                    ] = false;

                }
            );


            button.addEventListener(
                "pointercancel",
                () => {

                    movement[
                        direction
                    ] = false;

                }
            );

        }
    );


window.addEventListener(
    "keydown",
    event => {

        if (!playingAs)
            return;


        const key =
            event.key.toLowerCase();


        if (
            key === "w" ||
            key === "arrowup"
        )
            movement.up = true;


        if (
            key === "s" ||
            key === "arrowdown"
        )
            movement.down = true;


        if (
            key === "a" ||
            key === "arrowleft"
        )
            movement.left = true;


        if (
            key === "d" ||
            key === "arrowright"
        )
            movement.right = true;

    }
);


window.addEventListener(
    "keyup",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            key === "w" ||
            key === "arrowup"
        )
            movement.up = false;


        if (
            key === "s" ||
            key === "arrowdown"
        )
            movement.down = false;


        if (
            key === "a" ||
            key === "arrowleft"
        )
            movement.left = false;


        if (
            key === "d" ||
            key === "arrowright"
        )
            movement.right = false;

    }
);


/* =====================================================
   MOVE PLAYER
===================================================== */

function controlPlayer() {

    if (!playingAs)
        return;


    const speed =
        0.15;


    if (movement.up)
        playingAs.z -= speed;


    if (movement.down)
        playingAs.z += speed;


    if (movement.left)
        playingAs.x -= speed;


    if (movement.right)
        playingAs.x += speed;


    playingAs.x =
        Math.max(
            -55,
            Math.min(
                55,
                playingAs.x
            )
        );


    playingAs.z =
        Math.max(
            -55,
            Math.min(
                55,
                playingAs.z
            )
        );


    playingAs.mesh.position.x =
        playingAs.x;

    playingAs.mesh.position.z =
        playingAs.z;

}


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );


    if (!paused) {

        updatePeople();

        updateAnimals();

        controlPlayer();

    }


    updateCamera();


    renderer.render(
        scene,
        camera
    );

}


updateModeButtons();

gameLoop();
