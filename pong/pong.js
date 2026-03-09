//board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context; 

//players
let playerWidth = 10;
let playerHeight = 50;
let playerVelocityY = 0;

let player1 = {
    x : 10,
    y : boardHeight/2,
    width: playerWidth,
    height: playerHeight,
    velocityY : 0
}

let player2 = {
    x : boardWidth - playerWidth - 10,
    y : boardHeight/2,
    width: playerWidth,
    height: playerHeight,
    velocityY : 0
}

//ball
let ballWidth = 10;
let ballHeight = 10;
let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    width: ballWidth,
    height: ballHeight,
    velocityX : 1,
    velocityY : 2
}

let player1Score = 0;
let player2Score = 0;
let gameOverFlag = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw initial player1
    context.fillStyle="skyblue";
    context.fillRect(player1.x, player1.y, playerWidth, playerHeight);

    requestAnimationFrame(update);
    document.addEventListener("keyup", movePlayer);
    
    //wire New Game button
    const modalNewBtn = document.getElementById("modal-new-btn");
    if (modalNewBtn) {
        modalNewBtn.addEventListener("click", function() {
            hideWinnerModal();
            resetFullGame();
        });
    }

    const viewScoresBtn = document.getElementById('view-scores');
    if (viewScoresBtn) viewScoresBtn.addEventListener('click', () => {
        hideWinnerModal();
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
    context.clearRect(0, 0, board.width, board.height);

    // player1
    context.fillStyle = "skyblue";
    let nextPlayer1Y = player1.y + player1.velocityY;
    if (!outOfBounds(nextPlayer1Y)) {
        player1.y = nextPlayer1Y;
    }
    // player1.y += player1.velocityY;
    context.fillRect(player1.x, player1.y, playerWidth, playerHeight);

    // player2
    let nextPlayer2Y = player2.y + player2.velocityY;
    if (!outOfBounds(nextPlayer2Y)) {
        player2.y = nextPlayer2Y;
    }
    // player2.y += player2.velocityY;
    context.fillRect(player2.x, player2.y, playerWidth, playerHeight);

    // ball
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ballWidth, ballHeight);

    if (ball.y <= 0 || (ball.y + ballHeight >= boardHeight)) { 
        // if ball touches top or bottom of canvas
        ball.velocityY *= -1; //reverse direction
    }

    // if (ball.y <= 0) { 
    //     // if ball touches top of canvas
    //     ball.velocityY = 2; //go down
    // }
    // else if (ball.y + ballHeight >= boardHeight) {
    //     // if ball touches bottom of canvas
    //     ball.velocityY = -2; //go up
    // }

    //bounce the ball back
    if (detectCollision(ball, player1)) {
        if (ball.x <= player1.x + player1.width) { //left side of ball touches right side of player 1 (left paddle)
            ball.velocityX *= -1;   // flip x direction
        }
    }
    else if (detectCollision(ball, player2)) {
        if (ball.x + ballWidth >= player2.x) { //right side of ball touches left side of player 2 (right paddle)
            ball.velocityX *= -1;   // flip x direction
        }
    }

    //game over
    if (ball.x < 0) {
        player2Score++;
        checkWinner();
        resetGame(1);
    }
    else if (ball.x + ballWidth > boardWidth) {
        player1Score++;
        checkWinner();
        resetGame(-1);
    }

    //score
    context.font = "45px sans-serif";
    context.fillText(player1Score, boardWidth/5, 45);
    context.fillText(player2Score, boardWidth*4/5 - 45, 45);

    // draw dotted line down the middle
    for (let i = 10; i < board.height; i += 25) { //i = starting y Position, draw a square every 25 pixels down
        // (x position = half of boardWidth (middle) - 10), i = y position, width = 5, height = 5
        context.fillRect(board.width / 2 - 10, i, 5, 5); 
    }
}

function outOfBounds(yPosition) {
    return (yPosition < 0 || yPosition + playerHeight > boardHeight);
}

function movePlayer(e) {
    //player1
    if (e.code == "KeyW") {
        player1.velocityY = -3;
    }
    else if (e.code == "KeyS") {
        player1.velocityY = 3;
    }

    //player2
    if (e.code == "ArrowUp") {
        player2.velocityY = -3;
    }
    else if (e.code == "ArrowDown") {
        player2.velocityY = 3;
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function resetGame(direction) {
    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : direction,
        velocityY : 2
    }
}

function checkWinner() {
    if (player1Score >= 5) {
        showWinnerModal("Player 1 Wins!");
        saveScoreToHistory(`${player1Score}-${player2Score} Player 1`);
    } else if (player2Score >= 5) {
        showWinnerModal("Player 2 Wins!");
        saveScoreToHistory(`${player1Score}-${player2Score} Player 2`);
    }
}

function showWinnerModal(winner) {
    gameOverFlag = true;
    document.getElementById("winner-text").innerText = winner;
    document.getElementById("winner-modal").classList.remove("hidden");
}

function hideWinnerModal() {
    document.getElementById("winner-modal").classList.add("hidden");
}

function resetFullGame() {
    player1Score = 0;
    player2Score = 0;
    gameOverFlag = false;
    ball = {
        x : boardWidth/2,
        y : boardHeight/2,
        width: ballWidth,
        height: ballHeight,
        velocityX : 1,
        velocityY : 2
    }
}

// Score history helpers
function saveScoreToHistory(s){
    try{
        const key = 'pong-scores';
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
        const raw = localStorage.getItem('pong-scores');
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
    localStorage.removeItem('pong-scores');
    showAllScores();
}

function hideScoresModal(){
    const modal = document.getElementById('scores-modal');
    if(modal) modal.classList.add('hidden');
}