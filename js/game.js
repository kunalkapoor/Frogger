var canvas, scene, camera, renderer, light, width, height, textureLoader, requestid;
var numXTiles, numYTiles;

var logs = [];
var vehicles = [];
var hero;

var tileHeight = 40;
var tileWidth = 40;
var heroHeight = 2 * tileHeight / 3;
var heroWidth = 2 * tileWidth / 3;
var vehicleHeight = 2 * tileHeight / 3;
var vehicleWidth = tileWidth;
var logHeight = 2 * tileHeight / 3;
var logWidth = tileWidth;

var groundDepth = 20;
var heroDepth = groundDepth;
var vehicleDepth = groundDepth;
var logDepth = groundDepth;

var groundDepthOffset = 0;
var heroDepthOffset = 20;
var vehicleDepthOffset = 10;
var logDepthOffset = 10;

const BANK = 0,
    ROAD = 1,
    RIVER = 2;

var rowTiles = [BANK,
    ROAD, ROAD, ROAD, ROAD,
    BANK,
    RIVER, RIVER, RIVER, RIVER, RIVER,
    BANK
];

var numBankRows = rowTiles.count(BANK);
var numRoadRows = rowTiles.count(ROAD);
var numRiverRows = rowTiles.count(RIVER);

var bankRowOffset = rowTiles.firstOccurenceOf(BANK);
var roadRowOffset = rowTiles.firstOccurenceOf(ROAD);
var riverRowOffset = rowTiles.firstOccurenceOf(RIVER);

var numVehicles = 20;
var numLogs = 60;

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
    var x = (col * tileWidth) + (tileWidth / 2);
    var y = (row * tileHeight) + (tileHeight / 2);

    for (var i = 0; i < vehicles.length; i++)
        if (vehicles[i].position.x == x && vehicles[i].position.y == y)
            return true;

    return false;
}

function logPositionAlreadyTaken(row, col) {
    var x = (col * tileWidth) + (tileWidth / 2);
    var y = (row * tileHeight) + (tileHeight / 2);

    for (var i = 0; i < logs.length; i++)
        if (logs[i].position.x == x && logs[i].position.y == y)
            return true;

    return false;
}

function createCamera() {
    camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    // camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(width / 2, height / 2, 610);
    // camera.lookAt(new THREE.Vector3(width/2, (height / 2) + 50, 0));
    scene.add(camera);
}

function createLight() {
    light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(width / 2, height / 2, 1000);
    scene.add(light);
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
    var texture = textureLoader.load('assets/blocks/sand.png', function() {
        var cube;

        for (var i = 0; i < rowTiles.length; i++) {
            if (rowTiles[i] != BANK)
                continue;
            cube = createUnitCube(texture);
            cube.scale.set(width, tileHeight, groundDepth);
            cube.position.set(width / 2, (i * tileHeight) + (tileHeight / 2), groundDepthOffset);
            scene.add(cube);
        }
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(numXTiles, 1);
}

function createRoad() {
    var color = 0x25df59;
    var texture = textureLoader.load('assets/blocks/stone_slab_side.png', function() {
        var cube;

        for (var i = 0; i < rowTiles.length; i++) {
            if (rowTiles[i] != ROAD)
                continue;
            cube = createUnitCube(texture);
            cube.scale.set(width, tileHeight, groundDepth);
            cube.position.set(width / 2, (i * tileHeight) + (tileHeight / 2), groundDepthOffset);
            scene.add(cube);
        }
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(numXTiles, 1);
}

function createRiver() {
    var color = 0x25df59;
    var texture = textureLoader.load('assets/blocks/wool_colored_light_blue.png', function() {
        var cube;

        for (var i = 0; i < rowTiles.length; i++) {
            if (rowTiles[i] != RIVER)
                continue;
            cube = createUnitCube(texture);
            cube.scale.set(width, tileHeight, groundDepth);
            cube.position.set(width / 2, (i * tileHeight) + (tileHeight / 2), groundDepthOffset);
            scene.add(cube);
        }
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(numXTiles, 1);
}

function createHero() {
    var texture = textureLoader.load('assets/blocks/daylight_detector_top.png', function() {
        var cube;

        cube = createUnitCube(texture);
        cube.scale.set(heroWidth, heroHeight, heroDepth);
        cube.position.set(width / 2, (0 * tileHeight) + (tileHeight / 2), heroDepthOffset);
        scene.add(cube);
        hero = cube;
    });
}

function createVehicles() {
    var texture = textureLoader.load('assets/blocks/car-top.png', function() {
        var cube, row, col;

        for (var i = 0; i < numVehicles; i++) {
            do {
                row = Math.floor(Math.random() * numRoadRows) + roadRowOffset;
                col = Math.floor(Math.random() * numXTiles);
            } while (vehiclePositionAlreadyTaken(row, col));

            cube = createUnitCube(texture);
            cube.scale.set(vehicleWidth, vehicleHeight, vehicleDepth);
            cube.position.set((col * tileWidth) + (tileWidth / 2),
                (row * tileHeight) + (tileHeight / 2),
                vehicleDepthOffset);
            scene.add(cube);
            vehicles.push(cube);
        }
    });
}

function createLogs() {
    var texture = textureLoader.load('assets/blocks/soul_sand.png', function() {
        var cube, row, col;

        for (var i = 0; i < numLogs; i++) {
            do {
                row = Math.floor(Math.random() * numRiverRows) + riverRowOffset;
                col = Math.floor(Math.random() * numXTiles);
            } while (logPositionAlreadyTaken(row, col));

            cube = createUnitCube(texture);
            cube.scale.set(logWidth, logHeight, logDepth);
            cube.position.set((col * tileWidth) + (tileWidth / 2),
                (row * tileHeight) + (tileHeight / 2),
                vehicleDepthOffset);
            scene.add(cube);
            logs.push(cube);
        }
    });
}

function createScene() {
    scene = new THREE.Scene();
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
    width = 800;
    height = 480;

    numXTiles = width / tileWidth;
    numYTiles = height / tileHeight;

    canvas = document.getElementById("renderCanvas");
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    canvas.appendChild(renderer.domElement);

    textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    createScene();

    document.onkeydown = moveHero;
    document.onkeyup = flagReset;
}

function moveVehicles() {
    for (var i = 0; i < vehicles.length; i++) {
        if (((vehicles[i].position.y - tileHeight / 2) / tileHeight) % 3 == 0)
            vehicles[i].position.x += 3;
        else if (((vehicles[i].position.y - tileHeight / 2) / tileHeight) % 3 == 1)
            vehicles[i].position.x += 2;
        else
            vehicles[i].position.x += 1.5;

        if (vehicles[i].position.x > (width + tileWidth / 2)) {
            do {
                row = Math.floor(Math.random() * numRoadRows) + roadRowOffset;
                col = -Math.floor(Math.random() * 3) - 1;
            } while (vehiclePositionAlreadyTaken(row, col));

            vehicles[i].position.set((col * tileWidth) + (tileWidth / 2),
                (row * tileHeight) + (tileHeight / 2),
                vehicleDepthOffset);
        }
    }
}

function moveLogs() {
    for (var i = 0; i < logs.length; i++) {
        if (((logs[i].position.y - tileHeight / 2) / tileHeight) % 3 == 0)
            logs[i].position.x -= 2;
        else if (((logs[i].position.y - tileHeight / 2) / tileHeight) % 3 == 1)
            logs[i].position.x -= 1.5;
        else
            logs[i].position.x -= 1;

        if (logs[i].position.x < -(tileWidth / 2)) {
            do {
                row = Math.floor(Math.random() * numRiverRows) + riverRowOffset;
                col = Math.floor(Math.random() * 3) + numXTiles;
            } while (logPositionAlreadyTaken(row, col));

            logs[i].position.set((col * tileWidth) + (tileWidth / 2),
                (row * tileHeight) + (tileHeight / 2),
                logDepthOffset);
        }
    }
}

function moveHero(event) {
    var key = event.keyCode;

    if (Key.pressed)
        return;

    Key.pressed = true;

    if (key == Key.LEFT)
        hero.position.x -= tileWidth;
    if (key == Key.RIGHT)
        hero.position.x += tileWidth;
    if (key == Key.UP)
        hero.position.y += tileHeight;
    if (key == Key.DOWN)
        hero.position.y -= tileHeight;

    if (hero.position.x < tileWidth / 2)
        hero.position.x = tileWidth / 2;
    else if (hero.position.x > width - (tileWidth / 2))
        hero.position.x = width - (tileWidth / 2);
    if (hero.position.y < tileHeight / 2)
        hero.position.y = tileHeight / 2;
    else if (hero.position.y > height - (tileHeight / 2))
        hero.position.y = height - (tileHeight / 2);

    if (key == Key.ESCAPE)
        reset();
}

function flagReset(event) {
    Key.pressed = false;
}

function clearScene() {
    while (scene.children.length > 0)
        scene.remove(scene.children[0]);
    vehicles = [];
    logs = [];
    hero = null;
}

function reset() {
    clearScene();
    createScene();
}

function draw() {
    requestid = requestAnimationFrame(draw);
    renderer.render(scene, camera);

    moveVehicles();
    moveLogs();
    // moveHero();
    // reset();
}

function main() {
    setup();
    draw();
}

main();