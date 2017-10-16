// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 375;
var GAME_HEIGHT = 500;
var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 156;
var PLAYER_WIDTH = 79;
var PLAYER_HEIGHT = 84;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var R_KEY_CODE = 82;
var ENTER_KEY = 13;

// These two constants allow us to DRY
var MOVE_LEFT = "left";
var MOVE_RIGHT = "right";

// Add gradually ennemies until there are 3
var up = true;
var MAX_ENEMIES = 1;
var increment = 1;
var ceiling = 3;

function PerformCalc() {
    if (up == true && MAX_ENEMIES <= ceiling) {
        MAX_ENEMIES += increment;

        if (MAX_ENEMIES == ceiling) {
            up = false;
        }
    } else {
        up = false;
        MAX_ENEMIES -= increment;

        if (MAX_ENEMIES == 0) {
            up = true;
        }
    }
}
setInterval(PerformCalc, 10000);

// Preload game images
var images = {};
["enemy.png", "stars.png", "player.png", "player_dead.png", "cage.png"].forEach(imgName => {
    var img = document.createElement("img");
    img.src = "images/" + imgName;
    images[imgName] = img;
});

// This section is where you will be doing most of your coding
class Entity {
    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}
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
        this.playerColumn = 2;
        // add var for player lives
        this.playerLives = 3;
    }

    // live functions
    changeLives(change) {
        this.playerLives += change;
    }

    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
            this.playerColumn = this.playerColumn - 1;
        } else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
            this.playerColumn = this.playerColumn + 1;
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
        // listen for ENTER_KEY to restart game upon death.
        document.addEventListener("keydown", e => {
            if (e.keyCode === ENTER_KEY && this.playerDead) {
                this.start();
            }
        });

        document.addEventListener("keydown", e => {
            if (e.keyCode === ENTER_KEY && this.playerDead) {
                this.start();
            }
        });
        // Setup the player
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
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH; /* 375 ÷ 75 = 5 DONC 5 colonnes sur l'axe des X pr avoir un enemy*/

        var enemySpot;

        // Keep looping until we find a free enemy spot at random
        /*enemies = array de 5 objects (car 5 colones d'ennemies), mais contenant 3 car c le max d'ennemies. 
        Donc chaque objet contient un ennemi, ici 3. On peut accéder au 1er ennemi via enemies[0].
        Donc on veut choisir aléatoirement un chiffre en 0 et 4 de façon à ce qu'on accède à un ennemi aléatoirement. 
        EnemySpot will be that random value.Math.random = # between 0 & 1, but not 1.Math.floor, which rounds down to 
        the nearest whole number. Donc avec la boucle while, nous voulons que tant que le spot est occupé, que l'on tente
        un nouveau spot (colonne). AKA tant que this.enemies[enemySpot] = true, que l'on réessaye une autre colonne. Lorsque
        la valeur de this.enemies[enemySpot] = false, c a dire qu'il y a rien dans cet index de l'array, donc on sort du loop
        et on assigne un nouvel ennemi dans cet index. Ici il fallait enlever !enemySpot car sans cela, on skip tjrs l'index 0 
        mm si elle est 0 car enemySpot will evalute to falsy if = 0   */

        while (/*!enemySpot || */ this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots);
        }

        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
        this.enemies[enemySpot].enemyColumn = enemySpot;
    }

    // This method kicks off the game
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

        // Listen for keyboard left/right and update the player
        document.addEventListener("keydown", e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            } else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
        });
    }
    // Draw the canvas
    loadGameBackground() {
        this.score = 0;
        this.lastFrame = Date.now();
        this.ctx.drawImage(images["stars.png"], 0, 0); // draw the star bg
        this.ctx.drawImage(images["cage.png"], 0, 75);
        this.ctx.textAlign = "center";
        this.ctx.font = "bold 30px Helvetica";
        this.ctx.fillStyle = "#B10DC9";
        this.ctx.fillText("(press ENTER to play)", GAME_WIDTH / 2, 200);
        if (this.playerDead) {
            requestAnimationFrame(() => this.loadGameBackground());
        }
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */

    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));

        // Draw everything!
        this.ctx.drawImage(images["stars.png"], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.player.render(this.ctx); // draw the player

        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        this.setupEnemies();

        // Check if player is dead
        if (this.isDead(this.enemies) && this.player.sprite !== images["player_dead.png"]) {
            this.player.sprite = images["player_dead.png"];
            this.player.render(this.ctx);
            this.lastFrame = Date.now();
            this.gameLoop();
        }
        if (this.isDead(this.enemies) && this.player.sprite === images["player_dead.png"]) {
            // If they are dead, then it's game over!

            this.ctx.font = "bold 25px Helvetica";
            this.ctx.fillStyle = "#B10DC9";
            this.ctx.fillText(this.score + " GAME OVER", GAME_WIDTH / 2, 100);
            this.ctx.fillText('PRESS "R" TO RESTART', GAME_WIDTH / 2, 150);
            document.addEventListener("keydown", e => {
                if (e.keyCode === R_KEY_CODE) {
                    this.player = new Player();
                    this.enemies = [];
                    this.setupEnemies();

                    // this.start();
                    var MAX_ENEMIES = 1;
                    this.score = 0;
                    this.lastFrame = Date.now();
                    this.gameLoop();
                }
            });
        } else {
            // If player is not dead, then draw the score
            this.ctx.fillText("Lives: " + this.player.playerLives, 65, 55); //display lives
            this.ctx.font = "bold 30px Helvetica";
            this.ctx.fillStyle = "#B10DC9";
            this.ctx.fillText(this.score, 60, 30);
            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }
    isDead(ennemies) {
        var isDead = false;
        ennemies.forEach((enemy, enemyIdx) => {
            if (enemy && enemy.y + ENEMY_HEIGHT > this.player.y && enemy.enemyColumn === this.player.playerColumn) {
                this.player.changeLives(-1);
                delete this.enemies[enemyIdx];
            }
        });
        //until lives become 0, the game ends.
        if (this.player.playerLives === 0) {
            isDead = true;
        }
        return isDead;
    }
}

// This section will start the game
// This section will start the game
var gameEngine = new Engine(document.getElementById("app"));
requestAnimationFrame(() => gameEngine.loadGameBackground());
