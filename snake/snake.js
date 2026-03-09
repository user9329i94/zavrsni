//board
var blockSize = 25;
var rows = 20;
var cols = 20;
var board;
var context; 

//snake head
var snakeX = blockSize * 5;
var snakeY = blockSize * 5;

var velocityX = 0;
var velocityY = 0;

var snakeBody = [];

//food
var foodX;
var foodY;

var gameOver = false;
var score = 0;

window.onload = function() {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = cols * blockSize;
    context = board.getContext("2d"); //used for drawing on the board

    placeFood();
    document.addEventListener("keyup", changeDirection);
    // update();
    setInterval(update, 1000/10); //100 milliseconds

    // wire modal and score buttons
    const newBtn = document.getElementById('snake-new');
    if (newBtn) newBtn.addEventListener('click', () => {
        hideGameOverModal();
        resetGame();
    });

    const viewScoresBtn = document.getElementById('view-scores');
    if (viewScoresBtn) viewScoresBtn.addEventListener('click', () => {
        hideGameOverModal();
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
    if (gameOver) {
        return;
    }

    context.fillStyle="black";
    context.fillRect(0, 0, board.width, board.height);

    context.fillStyle="red";
    context.fillRect(foodX, foodY, blockSize, blockSize);

    if (snakeX == foodX && snakeY == foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood();
    }

    for (let i = snakeBody.length-1; i > 0; i--) {
        snakeBody[i] = snakeBody[i-1];
    }
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    context.fillStyle="lime";
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;
    context.fillRect(snakeX, snakeY, blockSize, blockSize);
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    //game over conditions
    if (snakeX < 0 || snakeX > cols*blockSize || snakeY < 0 || snakeY > rows*blockSize) {
        gameOver = true;
        score = snakeBody.length;
        showGameOverModal();
        saveScoreToHistory(score);
    }

    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            gameOver = true;
            score = snakeBody.length;
            showGameOverModal();
            saveScoreToHistory(score);
        }
    }
}

function changeDirection(e) {
    if (e.code == "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    }
    else if (e.code == "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    }
    else if (e.code == "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    }
    else if (e.code == "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}


function placeFood() {
    //(0-1) * cols -> (0-19.9999) -> (0-19) * 25
    foodX = Math.floor(Math.random() * cols) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;
}

function resetGame(){
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    gameOver = false;
    score = 0;
    placeFood();
}

// Score history helpers
function saveScoreToHistory(s){
    try{
        const key = 'snake-scores';
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
        const raw = localStorage.getItem('snake-scores');
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
    localStorage.removeItem('snake-scores');
    showAllScores();
}

function hideScoresModal(){
    const modal = document.getElementById('scores-modal');
    if(modal) modal.classList.add('hidden');
}

function showGameOverModal(){
    const modal = document.getElementById('game-over-modal');
    const final = document.getElementById('final-score');
    if(final) final.innerText = 'Score: ' + score;
    if(modal) modal.classList.remove('hidden');
}

function hideGameOverModal(){
    const modal = document.getElementById('game-over-modal');
    if(modal) modal.classList.add('hidden');
}