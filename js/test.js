// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 750;
var GAME_HEIGHT = 500;
var GAME_CEILING = 0;
var GAME_FLOOR = 446;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 156;
var MAX_ENEMIES = 5;

var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 54;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var UP_ARROW_CODE = 38;
var DOWN_ARROW_CODE = 40;
var ENTER_KEY = 13;
var SPACE_BAR = 32;

// These two constants allow us to DRY
var MOVE_LEFT = "left";
var MOVE_RIGHT = "right";
var MOVE_UP = "up";
var MOVE_DOWN = "down";

// Preload game images
var images = {};

["enemy.png", "stars.jpg", "player.png"].forEach(imgName => {
    var img = document.createElement("img");
    img.src = "images/" + imgName;
    images[imgName] = img;
});

class Entity {
    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}

// This section is where you will be doing most of your coding
class Enemy extends Entity {
    constructor(xPos) {
        super();

        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images["enemy.png"];

        // Each enemy should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }
}

class Player extends Entity {
    constructor() {
        super();

        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images["player.png"];
    }

    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        } else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        } else if (direction === MOVE_UP && this.y > GAME_CEILING + PLAYER_HEIGHT) {
            this.y = this.y - PLAYER_HEIGHT;
            console.log(this.y);
        } else if (direction === MOVE_DOWN && this.y < GAME_FLOOR - PLAYER_HEIGHT) {
            this.y = this.y + PLAYER_HEIGHT;
            console.log(this.y);
        }
    }
}

/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Flag for state of player (dead or alive)
        this.playerDead = true;

        // add event listener for movement and
        // listen for ENTER_KEY to restart game upon death.
        document.addEventListener("keydown", e => {
            if (e.keyCode === ENTER_KEY && this.playerDead) {
                this.start();
            }
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
            if (e.keyCode === UP_ARROW_CODE) {
                this.player.move(MOVE_UP);
            }
            if (e.keyCode === DOWN_ARROW_CODE) {
                this.player.move(MOVE_DOWN);
            }
        });

        this.player = new Player();

        // Setup enemies, making sure there are always three
        this.setupEnemies();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement("canvas");
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext("2d");

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    start() {
        // Setup the player
        this.player = new Player();
        // Flag for state of player (dead or alive)
        this.playerDead = false;

        this.enemies = [];
        this.setupEnemies();

        this.score = 0;
        this.lastFrame = Date.now();
        this.gameLoop();
    }
    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH;

        var enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (enemySpot === undefined || this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }

        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
    }

    // Draw the canvas
    loadGameBackground() {
        this.score = 0;
        this.lastFrame = Date.now();
        this.ctx.drawImage(images["stars.jpg"], 0, 0); // draw the star bg
        this.player.render(this.ctx); // draw the player
        this.ctx.textAlign = "center";
        this.ctx.font = "bold 18px Verdana";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText("CAN I HAZ BURGERS", GAME_WIDTH / 2, 250);
        this.ctx.fillText("(press ENTER to play)", GAME_WIDTH / 2, 280);
        console.log("super");
        if (this.playerDead) {
            requestAnimationFrame(() => this.loadGameBackground());
        }
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill
    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update`
    method of each entity To account for the fact that we don't always have 60 frames per second, gameLoop
    will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score!
        this.score += Math.round(timeDiff * 0.1);

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));

        // Draw everything!
        this.ctx.drawImage(images["stars.jpg"], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemy
        this.player.render(this.ctx); // draw the player

        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        this.setupEnemies();

        // Check if player is dead
        if (this.isPlayerDead() === true) {
            // If they are dead, then it's game over!
            this.ctx.textAlign = "center";
            this.ctx.font = "bold 40px Impact";
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2);
            this.ctx.font = "bold 30px Impact";
            this.ctx.fillText(this.score, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
            this.ctx.font = "Normal 16px Verdana";
            this.ctx.fillText("Hit Enter to Restart", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 65);
            this.playerDead = true;
        } else {
            // If player is not dead, then draw the score
            this.ctx.textAlign = "left";
            this.ctx.font = "bold 30px Impact";
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillText(this.score, 5, 30);

            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

    isPlayerDead() {
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i] && this.player.x === this.enemies[i].x && this.enemies[i].y + ENEMY_HEIGHT - 90 > this.player.y) {
                return false;
            }
            /*else*/ if (this.enemies[i] && this.player.x === this.enemies[i].x && this.enemies[i].y + ENEMY_HEIGHT - 20 > this.player.y) {
                return true;
            }
        }
        return false;
    }
}
// This section will start the game
var gameEngine = new Engine(document.getElementById("app"));
requestAnimationFrame(() => gameEngine.loadGameBackground());
