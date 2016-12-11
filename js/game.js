var Key = {
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,

    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    ESCAPE: 27,

    pressed: false
}

var Game = {
    canvas: document.getElementById("renderCanvas"),
    renderer: new THREE.WebGLRenderer(),
    scene: null,
    animationRequest: null,
    textureLoader: new THREE.TextureLoader(),
    colladaLoader: new THREE.ColladaLoader(),
    clock: new THREE.Clock(),

    currentCameraOrtho: true,
    perspectiveCamera: null,
    orthographicCamera: null,
    ambientLight: null,
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
    model: null,
    facing: Key.UP,

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
    model: null,

    height: 2 * Tile.height / 3,
    width: Tile.width * 2,
    depth: Tile.depth,
    depthOffset: 10,

    spawnOffset: 3,
    speed: [2.5, 2, 1.5],

    count: 20
}

var Vehicle = {
    objects: [],
    model: null,

    height: 2 * Tile.height / 3,
    width: Tile.width,
    depth: Tile.depth,
    depthOffset: 10,

    spawnOffset: 3,
    speed: [3, 2.5, 2],

    count: 25
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

function vehiclePositionAlreadyTaken(row, col) {
    var x, y, objX, objY;
    for (var i = 0; i < Vehicle.objects.length; i++) {
        x = (col * Tile.width) + (Tile.width / 2);
        y = (row * Tile.height) + (Tile.height / 2);
        objX = Vehicle.objects[i].position.x;
        objY = Vehicle.objects[i].position.y;
        if ((objX < (x + Vehicle.width) && objX > (x - Vehicle.width)) &&
            (objY < (y + Vehicle.height) && objY > (y - Vehicle.height)))
            return true;
        // if (objX == x && objY == y)
        //     return true;
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

function changeCamera() {
    Game.currentCameraOrtho = !Game.currentCameraOrtho;
}

function createCamera() {
    Game.orthographicCamera = new THREE.OrthographicCamera(Game.width / -2, Game.width / 2, Game.height / 2, Game.height /
        -2, 1, 1000);
    Game.orthographicCamera.position.set(Game.width / 2, Game.height / 2, 610);

    Game.perspectiveCamera = new THREE.PerspectiveCamera(45, Game.width / Game.height, 1, 1000);
    Game.perspectiveCamera.position.set(Game.width / 2, Game.height / 2, 610);
    Game.perspectiveCamera.lookAt(new THREE.Vector3(Game.width / 2, Game.height / 2, 0));

    Game.scene.add(Game.orthographicCamera);
    Game.scene.add(Game.perspectiveCamera);
}

function createLight() {
    Game.ambientLight = new THREE.AmbientLight(0xaaaaaa);
    Game.scene.add(Game.ambientLight);

    Game.light = new THREE.PointLight(0xffffff, 1, 0);
    Game.light.position.set(Game.width / 2, Game.height / 2, 1000);
    Game.scene.add(Game.light);
}

function createUnitCube(texture, color) {
    var geometry, material, texture, cube;

    geometry = new THREE.BoxGeometry(1, 1, 1);
    if (texture)
        material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.99
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
    // var texture = Game.textureLoader.load('assets/blocks/daylight_detector_top.png', function() {
    //     var cube;

    //     cube = createUnitCube(texture);
    //     cube.scale.set(Hero.width, Hero.height, Hero.depth);
    //     cube.position.set(Game.initialHeroPosition.x, Game.initialHeroPosition.y, Game.initialHeroPosition.z);
    //     Game.scene.add(cube);
    //     Hero.object = cube;
    // });
    // Hero.object = Hero.model;
    Hero.object.scale.set(2, 2, 2);
    Hero.object.position.set(Game.width / 2, Game.height / 2, 100);

    Hero.object.rotateY(calculateHeroRotation(Key.UP));
    Hero.object.updateMatrix();
    Hero.facing = Key.UP;

    Game.scene.add(Hero.object);
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

    Game.initialHeroPosition = new THREE.Vector3(((Game.numXTiles / 2) * Tile.width) + Tile.width / 2, Tile.height / 2,
        Hero.depthOffset);
    createScene();

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
}

function calculateHeroRotation(targetDirection) {
    var currentDirection = Hero.facing;

    if (currentDirection == targetDirection)
        return 0;

    switch (targetDirection) {
        case Key.UP:
            if (currentDirection == Key.DOWN)
                return Math.PI;
            if (currentDirection == Key.LEFT)
                return -Math.PI / 2;
            if (currentDirection == Key.RIGHT)
                return Math.PI / 2;
            break;
        case Key.DOWN:
            if (currentDirection == Key.UP)
                return Math.PI;
            if (currentDirection == Key.RIGHT)
                return -Math.PI / 2;
            if (currentDirection == Key.LEFT)
                return Math.PI / 2;
            break;
        case Key.LEFT:
            if (currentDirection == Key.RIGHT)
                return Math.PI;
            if (currentDirection == Key.DOWN)
                return -Math.PI / 2;
            if (currentDirection == Key.UP)
                return Math.PI / 2;
            break;
        case Key.RIGHT:
            if (currentDirection == Key.LEFT)
                return Math.PI;
            if (currentDirection == Key.UP)
                return -Math.PI / 2;
            if (currentDirection == Key.DOWN)
                return Math.PI / 2;
            break;
    }

    return 0;
}

function moveVehicles() {
    for (var i = 0; i < Vehicle.objects.length; i++) {
        var speed, vehicleRow;

        currentRow = (Vehicle.objects[i].position.y - Tile.height / 2) / Tile.height;
        speed = Vehicle.speed[currentRow % 3];

        if (currentRow % 2 == 0) {
            Vehicle.objects[i].position.x += speed;
            if (Vehicle.objects[i].position.x > (Game.width + Tile.width / 2)) {
                do {
                    row = Math.floor(Math.random() * Road.numRows) + Road.rowOffset;
                    if (row % 2 == 0)
                        col = -Math.floor(Math.random() * Vehicle.spawnOffset) - 1;
                    else
                        col = Math.floor(Math.random() * Vehicle.spawnOffset) + Game.numXTiles;
                } while (vehiclePositionAlreadyTaken(row, col));

                Vehicle.objects[i].position.set((col * Tile.width) + (Tile.width / 2),
                    (row * Tile.height) + (Tile.height / 2),
                    Vehicle.depthOffset);
            }
        } else {
            Vehicle.objects[i].position.x -= speed;
            if (Vehicle.objects[i].position.x < -(Tile.width / 2)) {
                do {
                    row = Math.floor(Math.random() * Road.numRows) + Road.rowOffset;
                    if (row % 2 == 0)
                        col = -Math.floor(Math.random() * Vehicle.spawnOffset) - 1;
                    else
                        col = Math.floor(Math.random() * Vehicle.spawnOffset) + Game.numXTiles;
                } while (vehiclePositionAlreadyTaken(row, col));

                Vehicle.objects[i].position.set((col * Tile.width) + (Tile.width / 2),
                    (row * Tile.height) + (Tile.height / 2),
                    Vehicle.depthOffset);
            }
        }
    }
}

function moveLogs() {
    for (var i = 0; i < Log.objects.length; i++) {
        var speed, currentRow;

        currentRow = (Log.objects[i].position.y - Tile.height / 2) / Tile.height;
        speed = Log.speed[currentRow % 3];

        if (currentRow % 2 == 0) {
            Log.objects[i].position.x -= speed;
            if (Log.objects[i].position.x < -(Tile.width / 2)) {
                do {
                    row = Math.floor(Math.random() * River.numRows) + River.rowOffset;
                    if (row % 2 != 0)
                        col = -Math.floor(Math.random() * Log.spawnOffset) - 1;
                    else
                        col = Math.floor(Math.random() * Log.spawnOffset) + Game.numXTiles;
                } while (logPositionAlreadyTaken(row, col));

                Log.objects[i].position.set((col * Tile.width) + (Tile.width / 2),
                    (row * Tile.height) + (Tile.height / 2),
                    Log.depthOffset);
            }
        } else {
            Log.objects[i].position.x += speed;
            if (Log.objects[i].position.x > (Game.width + Tile.width / 2)) {
                do {
                    row = Math.floor(Math.random() * River.numRows) + River.rowOffset;
                    if (row % 2 != 0)
                        col = -Math.floor(Math.random() * Log.spawnOffset) - 1;
                    else
                        col = Math.floor(Math.random() * Log.spawnOffset) + Game.numXTiles;
                } while (logPositionAlreadyTaken(row, col));

                Log.objects[i].position.set((col * Tile.width) + (Tile.width / 2),
                    (row * Tile.height) + (Tile.height / 2),
                    Log.depthOffset);
            }
        }
    }
}

function moveHero() {
    var i, x, y, row, col, speed, currentRow;

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
            currentRow = (objY - Tile.height / 2) / Tile.height;
            speed = Log.speed[currentRow % 3];
            if (currentRow % 2 == 0)
                Hero.object.position.x -= speed;
            else
                Hero.object.position.x += speed;
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
    else if (key == Key.P)
        changeCamera();

    if (!Hero.alive || Hero.won)
        return;

    if (key == Key.LEFT) {
        Hero.object.position.x -= Tile.width;
        Hero.object.rotateY(calculateHeroRotation(Key.LEFT));
        Hero.object.updateMatrix();
        Hero.facing = key;
    }
    else if (key == Key.RIGHT) {
        Hero.object.position.x += Tile.width;
        Hero.object.rotateY(calculateHeroRotation(Key.RIGHT));
        Hero.object.updateMatrix();
        Hero.facing = key;
    }
    else if (key == Key.UP) {
        Hero.object.position.y += Tile.height;
        Hero.object.rotateY(calculateHeroRotation(Key.UP));
        Hero.object.updateMatrix();
        Hero.facing = key;
    }
    else if (key == Key.DOWN) {
        Hero.object.position.y -= Tile.height;
        Hero.object.rotateY(calculateHeroRotation(Key.DOWN));
        Hero.object.updateMatrix();
        Hero.facing = key;
    }

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
    // Hero.object = null;
}

function reset() {
    clearScene();
    createScene();

    Hero.alive = true;
    Hero.won = false;
    Hero.health = Game.initialHeroHealth;
    Game.text.innerHTML = "You have " + Hero.health + " lives.";
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

    THREE.AnimationHandler.update(Game.clock.getDelta());
    if (Game.currentCameraOrtho)
        Game.renderer.render(Game.scene, Game.orthographicCamera);
    else {
        Game.perspectiveCamera.position.set(Hero.object.position.x, Hero.object.position.y - 300, Hero.object.position.z +
            300);
        Game.perspectiveCamera.lookAt(Hero.object.position);
        Game.renderer.render(Game.scene, Game.perspectiveCamera);
    }

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
    // Game.colladaLoader.options.convertUpAxis = true;
    // Game.colladaLoader.load('js/three.js-master/examples/models/collada/monster/monster.dae', function(collada) {
    //     Hero.model = collada.scene;

    //     Hero.model.traverse(function(child) {
    //         if (child instanceof THREE.SkinnedMesh) {
    //             var animation = new THREE.Animation(child, child.geometry.animation);
    //             animation.play();
    //         }
    //     });

    //     Hero.model.scale.set(0.05, 0.05, 0.05);
    //     Hero.model.position.x = Game.width / 2;
    //     Hero.model.position.y = Game.height / 2;
    //     Hero.model.position.z = 100;
    //     Hero.model.rotateX(Math.PI / 2);
    //     Hero.model.rotateY(Math.PI / 2);
    //     Hero.model.updateMatrix();
    //     Hero.object = Hero.model;

    //     setup();
    //     draw();
    // });
    var loader = new THREE.JSONLoader().load('assets/frog1.js', function(geometry, materials) {
        var material = new THREE.MultiMaterial(materials);
        var mesh = new THREE.Mesh(geometry, material);
        Hero.model = mesh;
        Hero.object = mesh;
        Hero.object.rotateX(Math.PI / 2);
        Hero.object.updateMatrix();

        setup();
        draw();
    });
}

main();