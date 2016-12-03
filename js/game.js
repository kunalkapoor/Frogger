var Game = {
    canvas: document.getElementById("renderCanvas"),
    renderer: new THREE.WebGLRenderer(),
    scene: null,
    animationRequest: null,
    textureLoader: new THREE.TextureLoader(),

    camera: null,
    light: null,

    width: 800,
    height: 480,

    numXTiles: null,
    numYTiles: null,

    text: document.getElementById("text"),
    
    initialHeroHealth: 3,
    initialHeroPosition: null
}

var Tile = {
    height: 40,
    width: 40,
    depth: 20,
    depthOffset: 0
}

var Hero = {
    object: null,

    height: 2 * Tile.height / 3,
    width: 2 * Tile.width / 3,
    depth: Tile.depth,
    depthOffset: 20,

    health: Game.initialHeroHealth,
    alive: true,
    won: false
}

var Log = {
    objects: [],

    height: 2 * Tile.height / 3,
    width: Tile.width * 2,
    depth: Tile.depth,
    depthOffset: 10,

    spawnOffset: 3,
    speed: [2, 1.5, 1],

    count: 30
}

var Vehicle = {
    objects: [],

    height: 2 * Tile.height / 3,
    width: Tile.width,
    depth: Tile.depth,
    depthOffset: 10,

    spawnOffset: 3,
    speed: [3, 2.5, 2],

    count: 20
}

const BANK = 0,
    ROAD = 1,
    RIVER = 2;

var rowTiles = [BANK,
    ROAD, ROAD, ROAD, ROAD,
    BANK,
    RIVER, RIVER, RIVER, RIVER, RIVER,
    BANK
];

var Bank = {
    numRows: rowTiles.count(BANK),
    rowOffset: rowTiles.firstOccurenceOf(BANK)
}

var Road = {
    numRows: rowTiles.count(ROAD),
    rowOffset: rowTiles.firstOccurenceOf(ROAD)
}

var River = {
    numRows: rowTiles.count(RIVER),
    rowOffset: rowTiles.firstOccurenceOf(RIVER)
}

var Key = {
    A: 65,
    W: 87,
    D: 68,
    S: 83,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ESCAPE: 27,

    pressed: false
}

function vehiclePositionAlreadyTaken(row, col) {
    var x, y, objX, objY;
    for (var i = 0; i < Vehicle.objects.length; i++) {
        x = (col * Tile.width) + (Tile.width / 2);
        y = (row * Tile.height) + (Tile.height / 2);
        objX = Vehicle.objects[i].position.x;
        objY = Vehicle.objects[i].position.y;
        // if ((objX < (x + Vehicle.width) && objX > (x - Vehicle.width)) &&
        //     (objY < (y + Vehicle.height) && objY > (y - Vehicle.height)))
        //     return true;
        if (objX == x && objY == y)
            return true;
    }
    return false;
}

function logPositionAlreadyTaken(row, col) {
    var x, y, objX, objY;
    for (var i = 0; i < Log.objects.length; i++) {
        x = (col * Tile.width) + (Tile.width / 2);
        y = (row * Tile.height) + (Tile.height / 2);
        objX = Log.objects[i].position.x;
        objY = Log.objects[i].position.y;
        // if ((objX < (x + Log.width) && objX > (x - Log.width)) &&
        //     (objY < (y + Log.height) && objY > (y - Log.height)))
        //     return true;
        if (objX == x && objY == y)
            return true;
    }

    return false;
}

function createCamera() {
    Game.camera = new THREE.OrthographicCamera(Game.width / -2, Game.width / 2, Game.height / 2, Game.height /
        -2, 1, 1000);
    // Game.camera = new THREE.PerspectiveCamera(45, Game.width / Game.height, 1, 1000);
    Game.camera.position.set(Game.width / 2, Game.height / 2, 610);
    // Game.camera.lookAt(new THREE.Vector3(Game.width/2, (Game.height / 2) + 50, 0));
    Game.scene.add(Game.camera);
}

function createLight() {
    Game.light = new THREE.PointLight(0xffffff, 1, 0);
    Game.light.position.set(Game.width / 2, Game.height / 2, 1000);
    Game.scene.add(Game.light);
}

function createUnitCube(texture, color) {
    var geometry, material, texture, cube;

    geometry = new THREE.BoxGeometry(1, 1, 1);
    if (texture)
        material = new THREE.MeshPhongMaterial({
            map: texture,
            shininess: 2
        });
    else
        material = new THREE.MeshPhongMaterial({
            specular: 0xffffff,
            shininess: 2,
            shading: THREE.FlatShading
        });

    if (color)
        material.color = color;
    cube = new THREE.Mesh(geometry, material);

    return cube;
}

function createBanks() {
    var color = 0x25df59;
    var texture = Game.textureLoader.load('assets/blocks/sand.png', function() {
        var cube;

        for (var i = 0; i < rowTiles.length; i++) {
            if (rowTiles[i] != BANK)
                continue;
            cube = createUnitCube(texture);
            cube.scale.set(Game.width, Tile.height, Tile.depth);
            cube.position.set(Game.width / 2, (i * Tile.height) + (Tile.height / 2), Tile.depthOffset);
            Game.scene.add(cube);
        }
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(Game.numXTiles, 1);
}

function createRoad() {
    var color = 0x25df59;
    var texture = Game.textureLoader.load('assets/blocks/stone_slab_side.png', function() {
        var cube;

        for (var i = 0; i < rowTiles.length; i++) {
            if (rowTiles[i] != ROAD)
                continue;
            cube = createUnitCube(texture);
            cube.scale.set(Game.width, Tile.height, Tile.depth);
            cube.position.set(Game.width / 2, (i * Tile.height) + (Tile.height / 2), Tile.depthOffset);
            Game.scene.add(cube);
        }
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(Game.numXTiles, 1);
}

function createRiver() {
    var color = 0x25df59;
    var texture = Game.textureLoader.load('assets/blocks/wool_colored_light_blue.png', function() {
        var cube;

        for (var i = 0; i < rowTiles.length; i++) {
            if (rowTiles[i] != RIVER)
                continue;
            cube = createUnitCube(texture);
            cube.scale.set(Game.width, Tile.height, Tile.depth);
            cube.position.set(Game.width / 2, (i * Tile.height) + (Tile.height / 2), Tile.depthOffset);
            Game.scene.add(cube);
        }
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(Game.numXTiles, 1);
}

function createHero() {
    var texture = Game.textureLoader.load('assets/blocks/daylight_detector_top.png', function() {
        var cube;

        cube = createUnitCube(texture);
        cube.scale.set(Hero.width, Hero.height, Hero.depth);
        cube.position.set(Game.initialHeroPosition.x, Game.initialHeroPosition.y, Game.initialHeroPosition.z);
        Game.scene.add(cube);
        Hero.object = cube;
    });
}

function createVehicles() {
    var texture = Game.textureLoader.load('assets/blocks/car-top.png', function() {
        var cube, row, col;

        for (var i = 0; i < Vehicle.count; i++) {
            do {
                row = Math.floor(Math.random() * Road.numRows) + Road.rowOffset;
                col = Math.floor(Math.random() * Game.numXTiles);
            } while (vehiclePositionAlreadyTaken(row, col));

            cube = createUnitCube(texture);
            cube.scale.set(Vehicle.width, Vehicle.height, Vehicle.depth);
            cube.position.set((col * Tile.width) + (Tile.width / 2),
                (row * Tile.height) + (Tile.height / 2),
                Vehicle.depthOffset);
            Game.scene.add(cube);
            Vehicle.objects.push(cube);
        }
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(Vehicle.width / Tile.width, 1);
}

function createLogs() {
    var texture = Game.textureLoader.load('assets/blocks/soul_sand.png', function() {
        var cube, row, col;

        for (var i = 0; i < Log.count; i++) {
            do {
                row = Math.floor(Math.random() * River.numRows) + River.rowOffset;
                col = Math.floor(Math.random() * Game.numXTiles);
            } while (logPositionAlreadyTaken(row, col));

            cube = createUnitCube(texture);
            cube.scale.set(Log.width, Log.height, Log.depth);
            cube.position.set((col * Tile.width) + (Tile.width / 2),
                (row * Tile.height) + (Tile.height / 2),
                Vehicle.depthOffset);
            Game.scene.add(cube);
            Log.objects.push(cube);
        }
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(Log.width / Tile.width, 1);
}

function createScene() {
    Game.scene = new THREE.Scene();
    createCamera();
    createLight();
    createBanks();
    createRoad();
    createRiver();
    createHero();
    createVehicles();
    createLogs();
}

function setup() {
    Game.numXTiles = Game.width / Tile.width;
    Game.numYTiles = Game.height / Tile.height;

    Game.renderer.setSize(Game.width, Game.height);
    Game.canvas.appendChild(Game.renderer.domElement);

    Game.textureLoader.crossOrigin = 'anonymous';

    Game.initialHeroPosition = new THREE.Vector3(((Game.numXTiles / 2) * Tile.width) + Tile.width / 2, Tile.height / 2, Hero.depthOffset);
    createScene();

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
}

function moveVehicles() {
    for (var i = 0; i < Vehicle.objects.length; i++) {
        if (((Vehicle.objects[i].position.y - Tile.height / 2) / Tile.height) % 3 == 0)
            Vehicle.objects[i].position.x += Vehicle.speed[0];
        else if (((Vehicle.objects[i].position.y - Tile.height / 2) / Tile.height) % 3 == 1)
            Vehicle.objects[i].position.x += Vehicle.speed[1];
        else
            Vehicle.objects[i].position.x += Vehicle.speed[2];

        if (Vehicle.objects[i].position.x > (Game.width + Tile.width / 2)) {
            do {
                row = Math.floor(Math.random() * Road.numRows) + Road.rowOffset;
                col = -Math.floor(Math.random() * Vehicle.spawnOffset) - 1;
            } while (vehiclePositionAlreadyTaken(row, col));

            Vehicle.objects[i].position.set((col * Tile.width) + (Tile.width / 2),
                (row * Tile.height) + (Tile.height / 2),
                Vehicle.depthOffset);
        }
    }
}

function moveLogs() {
    for (var i = 0; i < Log.objects.length; i++) {
        if (((Log.objects[i].position.y - Tile.height / 2) / Tile.height) % 3 == 0)
            Log.objects[i].position.x -= Log.speed[0];
        else if (((Log.objects[i].position.y - Tile.height / 2) / Tile.height) % 3 == 1)
            Log.objects[i].position.x -= Log.speed[1];
        else
            Log.objects[i].position.x -= Log.speed[2];

        if (Log.objects[i].position.x < -(Tile.width / 2)) {
            do {
                row = Math.floor(Math.random() * River.numRows) + River.rowOffset;
                col = Math.floor(Math.random() * Log.spawnOffset) + Game.numXTiles;
            } while (logPositionAlreadyTaken(row, col));

            Log.objects[i].position.set((col * Tile.width) + (Tile.width / 2),
                (row * Tile.height) + (Tile.height / 2),
                Log.depthOffset);
        }
    }
}

function moveHero() {
    var i, x, y, row, col;

    if (Hero.object == null)
        return;

    x = Hero.object.position.x;
    y = Hero.object.position.y;
    row = Math.floor(y / Tile.height);
    col = Math.floor(x / Tile.width);

    if (rowTiles[row] != RIVER)
        return;

    for (i = 0; i < Log.objects.length; i++) {
        objX = Log.objects[i].position.x;
        objY = Log.objects[i].position.y;
        xDiff = Log.width / 2 + Hero.width / 2;
        yDiff = Log.height / 2 + Hero.height / 2
        if ((objX < (x + xDiff) && objX > (x - xDiff)) &&
            (objY < (y + yDiff) && objY > (y - yDiff))) {
            if (((objY - Tile.height / 2) / Tile.height) % 3 == 0)
                Hero.object.position.x -= Log.speed[0];
            else if (((objY - Tile.height / 2) / Tile.height) % 3 == 1)
                Hero.object.position.x -= Log.speed[1];
            else
                Hero.object.position.x -= Log.speed[2];
            ensureHeroInGame();
            return;
        }
    }
}

function ensureHeroInGame() {
    if (Hero.object == null)
        return;

    if (Hero.object.position.x < Tile.width / 2)
        Hero.object.position.x = Tile.width / 2;
    else if (Hero.object.position.x > Game.width - (Tile.width / 2))
        Hero.object.position.x = Game.width - (Tile.width / 2);
    if (Hero.object.position.y < Tile.height / 2)
        Hero.object.position.y = Tile.height / 2;
    else if (Hero.object.position.y > Game.height - (Tile.height / 2))
        Hero.object.position.y = Game.height - (Tile.height / 2);
}

function handleKeyDown(event) {
    var key = event.keyCode;

    if (Key.pressed)
        return;

    Key.pressed = true;

    if (key == Key.ESCAPE)
        reset();

    if (!Hero.alive || Hero.won)
        return;

    if (key == Key.LEFT)
        Hero.object.position.x -= Tile.width;
    if (key == Key.RIGHT)
        Hero.object.position.x += Tile.width;
    if (key == Key.UP)
        Hero.object.position.y += Tile.height;
    if (key == Key.DOWN)
        Hero.object.position.y -= Tile.height;

    ensureHeroInGame();
}

function handleKeyUp(event) {
    Key.pressed = false;
}

function clearScene() {
    while (Game.scene.children.length > 0)
        Game.scene.remove(Game.scene.children[0]);
    Vehicle.objects = [];
    Log.objects = [];
    Hero.object = null;
}

function reset() {
    clearScene();
    createScene();

    Hero.alive = true;
    Hero.won = false;
    Hero.health = Game.initialHeroHealth;
}

function checkCollision() {
    var i, x, y, row, col;

    if (Hero.object == null)
        return false;

    x = Hero.object.position.x;
    y = Hero.object.position.y;
    row = Math.floor(y / Tile.height);
    col = Math.floor(x / Tile.width);

    if (rowTiles[row] == BANK)
        return false;

    if (rowTiles[row] == ROAD) {
        for (i = 0; i < Vehicle.objects.length; i++) {
            objX = Vehicle.objects[i].position.x;
            objY = Vehicle.objects[i].position.y;
            xDiff = Vehicle.width / 2 + Hero.width / 2;
            yDiff = Vehicle.height / 2 + Hero.height / 2
            if ((objX < (x + xDiff) && objX > (x - xDiff)) &&
                (objY < (y + yDiff) && objY > (y - yDiff)))
                return true;
        }
        return false;
    } else if (rowTiles[row] == RIVER) {
        for (i = 0; i < Log.objects.length; i++) {
            objX = Log.objects[i].position.x;
            objY = Log.objects[i].position.y;
            xDiff = Log.width / 2 + Hero.width / 2;
            yDiff = Log.height / 2 + Hero.height / 2
            if ((objX < (x + xDiff) && objX > (x - xDiff)) &&
                (objY < (y + yDiff) && objY > (y - yDiff)))
                return false;
        }
        return true;
    }

    return false;
}

function handleCollision() {
    var collided = checkCollision();
    if (collided) {
        Hero.health--;
        if (Hero.health == 0) {
            Hero.alive = false;
            Game.text.innerHTML = "You died! Press escape to restart.";
        } else {
            Game.text.innerHTML = "You have " + Hero.health + " lives.";
            Hero.object.position.x = Game.initialHeroPosition.x;
            Hero.object.position.y = Game.initialHeroPosition.y;
            Hero.object.position.z = Game.initialHeroPosition.z;
        }
    }
}

function checkGameEnd() {
    var i, x, y, row, col;

    if (Hero.object == null)
        return false;

    x = Hero.object.position.x;
    y = Hero.object.position.y;
    row = Math.floor(y / Tile.height);
    col = Math.floor(x / Tile.width);

    if (row == rowTiles.length - 1) {
        Hero.won = true;
        Game.text.innerHTML = "You won! Press escape to restart.";
    }
}

function draw() {
    Game.animationRequest = requestAnimationFrame(draw);
    Game.renderer.render(Game.scene, Game.camera);

    if (!Hero.alive || Hero.won)
        return;

    moveVehicles();
    moveLogs();
    moveHero();
    // reset();

    handleCollision();
    checkGameEnd();
}

function main() {
    setup();
    draw();
}

main();