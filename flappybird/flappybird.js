//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);

    // wire modal and score buttons
    const newBtn = document.getElementById('fb-new');
    if (newBtn) newBtn.addEventListener('click', () => {
        hideGameOverModal();
        resetGame();
    });

    const viewScoresBtn = document.getElementById('view-scores');
    if (viewScoresBtn) viewScoresBtn.addEventListener('click', () => {
        hideGameOverModal();
        showAllScores();
    });

    const allBtn = document.getElementById('all-scores-btn');
    if (allBtn) allBtn.addEventListener('click', () => {
        showAllScores();
    });

    const closeScores = document.getElementById('close-scores');
    if (closeScores) closeScores.addEventListener('click', () => {
        hideScoresModal();
    });

    const clearScoresBtn = document.getElementById('clear-scores');
    if (clearScoresBtn) clearScoresBtn.addEventListener('click', () => {
        clearScores();
    });
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        showGameOverModal();
        saveScoreToHistory(Math.round(score));
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "white";
    context.font="45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        velocityY = -6;

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
            hideGameOverModal();
            hideScoresModal();
        }
    }
}

function resetGame(){
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
}

// Score history helpers
function saveScoreToHistory(s){
    try{
        const key = 'flappybird-scores';
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        arr.push({score: s, date: new Date().toISOString()});
        if(arr.length > 200) arr.splice(0, arr.length - 200);
        localStorage.setItem(key, JSON.stringify(arr));
    }catch(e){
        console.warn('Could not save score', e);
    }
}

function getScoreHistory(){
    try{
        const raw = localStorage.getItem('flappybird-scores');
        return raw ? JSON.parse(raw) : [];
    }catch(e){
        return [];
    }
}

function showAllScores(){
    const modal = document.getElementById('scores-modal');
    const list = document.getElementById('scores-list');
    if(!modal || !list) return;
    list.innerHTML = '';
    const arr = getScoreHistory();
    arr.sort((a,b)=> new Date(b.date) - new Date(a.date));
    if(arr.length === 0){
        const li = document.createElement('li');
        li.innerText = 'No scores yet';
        list.appendChild(li);
    }else{
        arr.forEach(item => {
            const li = document.createElement('li');
            const d = new Date(item.date);
            li.innerText = `${item.score} — ${d.toLocaleString()}`;
            list.appendChild(li);
        });
    }
    modal.classList.remove('hidden');
}

function clearScores(){
    localStorage.removeItem('flappybird-scores');
    showAllScores();
}

function hideScoresModal(){
    const modal = document.getElementById('scores-modal');
    if(modal) modal.classList.add('hidden');
}

function showGameOverModal(){
    const modal = document.getElementById('game-over-modal');
    const final = document.getElementById('final-score');
    if(final) final.innerText = 'Score: ' + Math.round(score);
    if(modal) modal.classList.remove('hidden');
}

function hideGameOverModal(){
    const modal = document.getElementById('game-over-modal');
    if(modal) modal.classList.add('hidden');
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}