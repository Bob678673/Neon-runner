// ============================================================
// NEON RUNNER
// Das ist die Spiel-Logik.
// ============================================================


// ------------------------------------------------------------
// 1. HTML-ELEMENTE HOLEN
// ------------------------------------------------------------

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("scoreValue");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const playButton = document.getElementById("playButton");
const restartButton = document.getElementById("restartButton");

const finalScoreElement = document.getElementById("finalScore");


// ------------------------------------------------------------
// 2. CANVAS-GRÖSSE
// ------------------------------------------------------------

let width = window.innerWidth;
let height = window.innerHeight;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// ------------------------------------------------------------
// 3. SPIELER
// ------------------------------------------------------------

const player = {
    x: 120,
    y: 0,

    width: 42,
    height: 55,

    velocityY: 0,

    gravity: 0.8,
    jumpPower: -15,

    grounded: false
};


// ------------------------------------------------------------
// 4. SPIELVARIABLEN
// ------------------------------------------------------------

let gameRunning = false;

let score = 0;

let gameSpeed = 6;

let obstacleTimer = 0;
let obstacleInterval = 100;

let coinTimer = 0;
let coinInterval = 140;

let animationId;


// ------------------------------------------------------------
// 5. OBJEKTE
// ------------------------------------------------------------

const obstacles = [];
const coins = [];
const particles = [];


// ------------------------------------------------------------
// 6. HINTERGRUND
// ------------------------------------------------------------

const stars = [];

for (let i = 0; i < 80; i++) {

    stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.2
    });
}


// ------------------------------------------------------------
// 7. SPIEL STARTEN
// ------------------------------------------------------------

function startGame() {

    gameRunning = true;

    score = 0;

    gameSpeed = 6;

    obstacleTimer = 0;
    coinTimer = 0;

    obstacles.length = 0;
    coins.length = 0;
    particles.length = 0;

    player.x = Math.min(120, width * 0.2);

    player.y = getGroundY() - player.height;

    player.velocityY = 0;

    scoreElement.textContent = "0";

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");

    cancelAnimationFrame(animationId);

    gameLoop();
}


// ------------------------------------------------------------
// 8. SPIEL BEENDEN
// ------------------------------------------------------------

function gameOver() {

    gameRunning = false;

    finalScoreElement.textContent = Math.floor(score);

    gameOverScreen.classList.remove("hidden");

    createExplosion(
        player.x + player.width / 2,
        player.y + player.height / 2,
        25
    );
}


// ------------------------------------------------------------
// 9. BODEN
// ------------------------------------------------------------

function getGroundY() {

    // Der Boden liegt ungefähr 15 % über dem unteren Rand.
    return height * 0.82;
}


// ------------------------------------------------------------
// 10. SPRINGEN
// ------------------------------------------------------------

function jump() {

    if (!gameRunning) {
        return;
    }

    if (player.grounded) {

        player.velocityY = player.jumpPower;

        player.grounded = false;
    }
}


// ------------------------------------------------------------
// 11. TASTATUR
// ------------------------------------------------------------

window.addEventListener("keydown", function(event) {

    if (event.code === "Space") {

        event.preventDefault();

        jump();
    }

    if (event.key.toLowerCase() === "r") {

        if (!gameRunning) {
            startGame();
        }
    }
});


// ------------------------------------------------------------
// 12. MAUS UND TOUCH
// ------------------------------------------------------------

canvas.addEventListener("pointerdown", function() {

    jump();

});


// ------------------------------------------------------------
// 13. BUTTONS
// ------------------------------------------------------------

playButton.addEventListener("click", function() {

    startGame();

});


restartButton.addEventListener("click", function() {

    startGame();

});


// ------------------------------------------------------------
// 14. HINDERNIS ERSTELLEN
// ------------------------------------------------------------

function createObstacle() {

    const size = Math.random() * 25 + 30;

    obstacles.push({

        x: width + 50,

        y: getGroundY() - size,

        width: size,

        height: size,

        type: Math.random() > 0.5 ? "square" : "triangle"

    });
}


// ------------------------------------------------------------
// 15. MÜNZE ERSTELLEN
// ------------------------------------------------------------

function createCoin() {

    const minY = height * 0.35;
    const maxY = height * 0.68;

    const coinY =
        Math.random() * (maxY - minY) + minY;

    coins.push({

        x: width + 50,

        y: coinY,

        radius: 12,

        rotation: 0

    });
}


// ------------------------------------------------------------
// 16. PARTIKEL ERSTELLEN
// ------------------------------------------------------------

function createExplosion(x, y, amount = 12) {

    for (let i = 0; i < amount; i++) {

        const angle =
            Math.random() * Math.PI * 2;

        const speed =
            Math.random() * 4 + 1;

        particles.push({

            x: x,

            y: y,

            velocityX:
                Math.cos(angle) * speed,

            velocityY:
                Math.sin(angle) * speed,

            life: 1,

            size:
                Math.random() * 5 + 2

        });
    }
}


// ------------------------------------------------------------
// 17. SPIELER AKTUALISIEREN
// ------------------------------------------------------------

function updatePlayer() {

    player.velocityY += player.gravity;

    player.y += player.velocityY;

    const groundY = getGroundY();

    if (player.y + player.height >= groundY) {

        player.y =
            groundY - player.height;

        player.velocityY = 0;

        player.grounded = true;
    }
}


// ------------------------------------------------------------
// 18. HINDERNISSE AKTUALISIEREN
// ------------------------------------------------------------

function updateObstacles() {

    for (let i = obstacles.length - 1; i >= 0; i--) {

        const obstacle = obstacles[i];

        obstacle.x -= gameSpeed;

        if (checkCollision(player, obstacle)) {

            gameOver();

            return;
        }

        if (obstacle.x + obstacle.width < 0) {

            obstacles.splice(i, 1);
        }
    }
}


// ------------------------------------------------------------
// 19. MÜNZEN AKTUALISIEREN
// ------------------------------------------------------------

function updateCoins() {

    for (let i = coins.length - 1; i >= 0; i--) {

        const coin = coins[i];

        coin.x -= gameSpeed;

        coin.rotation += 0.1;

        if (checkCoinCollision(player, coin)) {

            score += 100;

            scoreElement.textContent =
                Math.floor(score);

            createExplosion(
                coin.x,
                coin.y,
                15
            );

            coins.splice(i, 1);

            continue;
        }

        if (coin.x + coin.radius < 0) {

            coins.splice(i, 1);
        }
    }
}


// ------------------------------------------------------------
// 20. PARTIKEL AKTUALISIEREN
// ------------------------------------------------------------

function updateParticles() {

    for (let i = particles.length - 1; i >= 0; i--) {

        const particle = particles[i];

        particle.x += particle.velocityX;

        particle.y += particle.velocityY;

        particle.velocityY += 0.08;

        particle.life -= 0.025;

        if (particle.life <= 0) {

            particles.splice(i, 1);
        }
    }
}


// ------------------------------------------------------------
// 21. HINTERGRUND AKTUALISIEREN
// ------------------------------------------------------------

function updateStars() {

    for (const star of stars) {

        star.x -= star.speed;

        if (star.x < 0) {

            star.x = width;

            star.y =
                Math.random() * height;
        }
    }
}


// ------------------------------------------------------------
// 22. KOLLISION SPIELER / HINDERNIS
// ------------------------------------------------------------

function checkCollision(a, b) {

    const padding = 8;

    return (

        a.x + padding <
        b.x + b.width &&

        a.x + a.width - padding >
        b.x &&

        a.y + padding <
        b.y + b.height &&

        a.y + a.height - padding >
        b.y
    );
}


// ------------------------------------------------------------
// 23. KOLLISION SPIELER / MÜNZE
// ------------------------------------------------------------

function checkCoinCollision(player, coin) {

    const closestX =
        Math.max(
            player.x,
            Math.min(
                coin.x,
                player.x + player.width
            )
        );

    const closestY =
        Math.max(
            player.y,
            Math.min(
                coin.y,
                player.y + player.height
            )
        );

    const distanceX =
        coin.x - closestX;

    const distanceY =
        coin.y - closestY;

    const distance =
        Math.sqrt(
            distanceX * distanceX +
            distanceY * distanceY
        );

    return distance < coin.radius;
}


// ------------------------------------------------------------
// 24. SPIELGESCHWINDIGKEIT
// ------------------------------------------------------------

function increaseDifficulty() {

    gameSpeed += 0.0015;

    if (gameSpeed > 13) {

        gameSpeed = 13;
    }
}


// ------------------------------------------------------------
// 25. HINDERNISSE UND MÜNZEN ERSTELLEN
// ------------------------------------------------------------

function spawnObjects() {

    obstacleTimer++;

    coinTimer++;

    if (obstacleTimer >= obstacleInterval) {

        createObstacle();

        obstacleTimer = 0;

        obstacleInterval =
            70 + Math.random() * 80;
    }


    if (coinTimer >= coinInterval) {

        createCoin();

        coinTimer = 0;

        coinInterval =
            100 + Math.random() * 100;
    }
}


// ------------------------------------------------------------
// 26. PUNKTE
// ------------------------------------------------------------

function updateScore() {

    score += 0.05;

    scoreElement.textContent =
        Math.floor(score);
}


// ------------------------------------------------------------
// 27. HINTERGRUND ZEICHNEN
// ------------------------------------------------------------

function drawBackground() {

    // Hintergrund
    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );

    gradient.addColorStop(
        0,
        "#08001a"
    );

    gradient.addColorStop(
        0.5,
        "#12002d"
    );

    gradient.addColorStop(
        1,
        "#020208"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // Sterne
    for (const star of stars) {

        ctx.fillStyle =
            "rgba(0,255,255,0.7)";

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // Horizontales Neonlicht
    const groundY = getGroundY();

    const glow =
        ctx.createLinearGradient(
            0,
            groundY,
            width,
            groundY
        );

    glow.addColorStop(
        0,
        "rgba(0,255,255,0)"
    );

    glow.addColorStop(
        0.5,
        "rgba(0,255,255,0.8)"
    );

    glow.addColorStop(
        1,
        "rgba(0,255,255,0)"
    );

    ctx.fillStyle = glow;

    ctx.fillRect(
        0,
        groundY,
        width,
        3
    );


    // Bodenlinien
    ctx.strokeStyle =
        "rgba(0,255,255,0.12)";

    ctx.lineWidth = 1;

    const lineSpacing = 45;

    for (
        let y = groundY + 20;
        y < height;
        y += lineSpacing
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(width, y);

        ctx.stroke();
    }


    // Schräge Neonlinien
    for (
        let x = -height;
        x < width;
        x += 80
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            groundY
        );

        ctx.lineTo(
            x + height,
            height
        );

        ctx.stroke();
    }
}


// ------------------------------------------------------------
// 28. SPIELER ZEICHNEN
// ------------------------------------------------------------

function drawPlayer() {

    const x = player.x;
    const y = player.y;

    ctx.save();

    // Leuchten
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 20;

    // Körper
    ctx.fillStyle = "#00ffff";

    ctx.fillRect(
        x,
        y,
        player.width,
        player.height
    );

    // Innerer Körper
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#081522";

    ctx.fillRect(
        x + 6,
        y + 6,
        player.width - 12,
        player.height - 12
    );


    // Augen
    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        x + 10,
        y + 15,
        7,
        7
    );

    ctx.fillRect(
        x + 25,
        y + 15,
        7,
        7
    );


    // Neon-Linie
    ctx.fillStyle = "#ff00cc";

    ctx.fillRect(
        x + 7,
        y + 37,
        player.width - 14,
        5
    );

    ctx.restore();
}


// ------------------------------------------------------------
// 29. HINDERNISSE ZEICHNEN
// ------------------------------------------------------------

function drawObstacles() {

    for (const obstacle of obstacles) {

        ctx.save();

        ctx.shadowColor = "#ff0066";
        ctx.shadowBlur = 20;

        ctx.fillStyle = "#ff0066";

        if (obstacle.type === "square") {

            ctx.fillRect(
                obstacle.x,
                obstacle.y,
                obstacle.width,
                obstacle.height
            );

        } else {

            ctx.beginPath();

            ctx.moveTo(
                obstacle.x +
                obstacle.width / 2,
                obstacle.y
            );

            ctx.lineTo(
                obstacle.x,
                obstacle.y +
                obstacle.height
            );

            ctx.lineTo(
                obstacle.x +
                obstacle.width,
                obstacle.y +
                obstacle.height
            );

            ctx.closePath();

            ctx.fill();
        }

        ctx.restore();
    }
}


// ------------------------------------------------------------
// 30. MÜNZEN ZEICHNEN
// ------------------------------------------------------------

function drawCoins() {

    for (const coin of coins) {

        ctx.save();

        ctx.translate(
            coin.x,
            coin.y
        );

        const scale =
            Math.abs(
                Math.cos(coin.rotation)
            );

        ctx.scale(
            Math.max(scale, 0.15),
            1
        );

        ctx.shadowColor = "#ffff00";
        ctx.shadowBlur = 25;

        ctx.fillStyle = "#ffff00";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            coin.radius,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.shadowBlur = 0;

        ctx.fillStyle = "#ffffff";

        ctx.beginPath();

        ctx.arc(
            -3,
            -3,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }
}


// ------------------------------------------------------------
// 31. PARTIKEL ZEICHNEN
// ------------------------------------------------------------

function drawParticles() {

    for (const particle of particles) {

        ctx.save();

        ctx.globalAlpha =
            particle.life;

        ctx.fillStyle = "#00ffff";

        ctx.shadowColor = "#00ffff";

        ctx.shadowBlur = 15;

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }
}


// ------------------------------------------------------------
// 32. ALLES ZEICHNEN
// ------------------------------------------------------------

function draw() {

    drawBackground();

    drawCoins();

    drawObstacles();

    drawParticles();

    drawPlayer();
}


// ------------------------------------------------------------
// 33. HAUPTSCHLEIFE
// ------------------------------------------------------------

function gameLoop() {

    if (!gameRunning) {
        return;
    }

    updatePlayer();

    spawnObjects();

    updateObstacles();

    updateCoins();

    updateParticles();

    updateStars();

    increaseDifficulty();

    updateScore();

    draw();

    animationId =
        requestAnimationFrame(gameLoop);
}


// ------------------------------------------------------------
// 34. SPIEL INITIALISIEREN
// ------------------------------------------------------------

function prepareGame() {

    player.y =
        getGroundY() -
        player.height;

    draw();
}

prepareGame();