var canvas, scene, camera, renderer, light, width, height, textureLoader, requestid;
var numXTiles, numYTiles, cooldown = 0;

var logs = [];
var vehicles = [];
var hero;

var tileHeight = 40;
var tileWidth = 40;

var groundDepth = 20;
var groundHeight = 0;
var heroHeight = 20;
var vehicleHeight = 10;
var logHeight = 10;

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
var numLogs = 50;

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
            cube.position.set(width / 2, (i * tileHeight) + (tileHeight / 2), groundHeight);
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
            cube.position.set(width / 2, (i * tileHeight) + (tileHeight / 2), groundHeight);
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
            cube.position.set(width / 2, (i * tileHeight) + (tileHeight / 2), groundHeight);
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
        cube.scale.set(tileWidth / 2, tileHeight / 2, groundDepth);
        cube.position.set(width / 2, (0 * tileHeight) + (tileHeight / 2), heroHeight);
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
            cube.scale.set(tileWidth, tileHeight / 2, groundDepth);
            cube.position.set((col * tileWidth) + (tileWidth / 2),
                (row * tileHeight) + (tileHeight / 2),
                vehicleHeight);
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
            cube.scale.set(tileWidth, tileHeight / 2, groundDepth);
            cube.position.set((col * tileWidth) + (tileWidth / 2),
                (row * tileHeight) + (tileHeight / 2),
                vehicleHeight);
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
}

function moveVehicles() {
    for (var i = 0; i < vehicles.length; i++) {
        if (((vehicles[i].position.y - tileHeight / 2) / tileHeight) % 2 == 0)
            vehicles[i].position.x += 3;
        else
            vehicles[i].position.x += 2;

        if (vehicles[i].position.x > (width + tileWidth / 2)) {
            do {
                row = Math.floor(Math.random() * numRoadRows) + roadRowOffset;
                col = -Math.floor(Math.random() * 3) - 1;
            } while (vehiclePositionAlreadyTaken(row, col));

            vehicles[i].position.set((col * tileWidth) + (tileWidth / 2),
                (row * tileHeight) + (tileHeight / 2),
                vehicleHeight);
        }
    }
}

function moveLogs() {
    for (var i = 0; i < logs.length; i++) {
        if (((logs[i].position.y - tileHeight / 2) / tileHeight) % 2 == 0)
            logs[i].position.x -= 1.5;
        else
            logs[i].position.x -= 0.5;

        if (logs[i].position.x < -(tileWidth / 2)) {
            do {
                row = Math.floor(Math.random() * numRiverRows) + riverRowOffset;
                col = Math.floor(Math.random() * 3) + numXTiles;
            } while (logPositionAlreadyTaken(row, col));

            logs[i].position.set((col * tileWidth) + (tileWidth / 2),
                (row * tileHeight) + (tileHeight / 2),
                logHeight);
        }
    }
}

function moveHero() {
    if (Key.isDown(Key.LEFT))
        hero.position.x -= 1;
    if (Key.isDown(Key.RIGHT))
        hero.position.x += 1;
    if (Key.isDown(Key.UP))
        hero.position.y += 1;
    if (Key.isDown(Key.DOWN))
        hero.position.y -= 1;
}

function clearScene() {
    while (scene.children.length > 0)
        scene.remove(scene.children[0]);
    vehicles = [];
    logs = [];
    hero = null;
    console.log(logs.length);
}

function reset() {
    if (Key.isDown(Key.ESCAPE) && cooldown == 0) {
        clearScene();
        createScene();
        cooldown = 100;
    }
    if (cooldown > 0)
        cooldown--;
    console.log(cooldown);
}

function draw() {
    requestid = requestAnimationFrame(draw);
    renderer.render(scene, camera);

    moveVehicles();
    moveLogs();
    moveHero();
    reset();
}

function main() {
    setup();
    draw();
}

main();