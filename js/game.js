var canvas, scene, camera, renderer, light, width, height, textureLoader;
var numXTiles, numYTiles;

var logs = [],
    vehicles = [];
var hero;

var tileHeight = 40;
var tileWidth = 40;

var groundDepth = 20;
var groundHeight = 0;

var heroHeight = 20;

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
        cube.position.set(width / 2, (0 * tileHeight) + (tileHeight / 2), groundHeight);
        scene.add(cube);
    });
}

function createVehicles() {
    var texture = textureLoader.load('assets/blocks/car-top.png', function() {
        var cube;

        for (var i = 0; i < 20; i++) {
            var row = Math.floor(Math.random * 10);
            var col = Math.floor(Math.random * numXTiles)
            var pos = new THREE.Vector3()
            cube = createUnitCube(texture);
            cube.scale.set(tileWidth, tileHeight / 2, groundDepth);
            cube.position.set(width / 2, (2 * tileHeight) + (tileHeight / 2), groundHeight);
            scene.add(cube);
        }
    });
}

function createLogs() {
    var texture = textureLoader.load('assets/blocks/soul_sand.png', function() {
        var cube;

        cube = createUnitCube(texture);
        cube.scale.set(tileWidth * 2, tileHeight / 2, groundDepth);
        cube.position.set(width / 2, (6 * tileHeight) + (tileHeight / 2), groundHeight);
        scene.add(cube);
    });
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 1);
}

function createScene() {
    console.log(numBankRows, numRoadRows, numRiverRows);
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

    camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
    // camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    scene = new THREE.Scene();
    scene.add(camera);
    camera.position.set(width / 2, height / 2, 610);

    light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(width / 2, height / 2, 1000);
    scene.add(light);

    textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    createScene();
}

function draw() {
    requestAnimationFrame(draw);
    renderer.render(scene, camera);
}

function main() {
    setup();
    draw();
}

main();