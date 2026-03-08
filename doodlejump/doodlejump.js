//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth/2 - doodlerWidth/2;
let doodlerY = boardHeight*7/8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img : null,
    x : doodlerX,
    y : doodlerY,
    width : doodlerWidth,
    height : doodlerHeight
}

//physics
let velocityX = 0; 
let velocityY = 0; //doodler jump speed
let initialVelocityY = -8; //starting velocity Y
let gravity = 0.4;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    //draw doodler
    // context.fillStyle = "green";
    // context.fillRect(doodler.x, doodler.y, doodler.width, doodler.height);

    //load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = "./doodler-right.png";
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function() {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./doodler-left.png";

    platformImg = new Image();
    platformImg.src = "./platform.png";

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);

    // wire modal and score buttons
    const newBtn = document.getElementById('dj-new');
    if (newBtn) newBtn.addEventListener('click', () => {
        hideGameOverModal();
        resetDoodle();
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

    //doodler
    doodler.x += velocityX;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    }
    else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    velocityY += gravity;
    doodler.y += velocityY;
    if (doodler.y > board.height) {
        gameOver = true;
        showGameOverModal();
        saveScoreToHistory(score);
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    //platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight*3/4) {
            platform.y -= initialVelocityY; //slide platform down
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = initialVelocityY; //jump
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); //removes first element from the array
        newPlatform(); //replace with new platform on top
    }

    //score
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

    if (gameOver) {
        context.fillText("Game Over", boardWidth/7, boardHeight*7/8);
    }
}

function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") { //move right
        velocityX = 4;
        doodler.img = doodlerRightImg;
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") { //move left
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    }
    else if (e.code == "Space" && gameOver) {
        //reset
        doodler = {
            img : doodlerRightImg,
            x : doodlerX,
            y : doodlerY,
            width : doodlerWidth,
            height : doodlerHeight
        }

        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        hideGameOverModal();
        hideScoresModal();
        placePlatforms();
    }
}

function resetDoodle(){
    doodler = {
        img : doodlerRightImg,
        x : doodlerX,
        y : doodlerY,
        width : doodlerWidth,
        height : doodlerHeight
    }
    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    maxScore = 0;
    gameOver = false;
    placePlatforms();
}

// Score history helpers
function saveScoreToHistory(s){
    try{
        const key = 'doodlejump-scores';
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        // append new score with timestamp
        arr.push({score: s, date: new Date().toISOString()});
        // keep only latest 200 entries to avoid unbounded growth
        if(arr.length > 200) arr.splice(0, arr.length - 200);
        localStorage.setItem(key, JSON.stringify(arr));
    }catch(e){
        console.warn('Could not save score', e);
    }
}

function getScoreHistory(){
    try{
        const raw = localStorage.getItem('doodlejump-scores');
        return raw ? JSON.parse(raw) : [];
    }catch(e){
        return [];
    }
}

function showAllScores(){
    const modal = document.getElementById('scores-modal');
    const list = document.getElementById('scores-list');
    if(!modal || !list) return;
    // populate
    list.innerHTML = '';
    const arr = getScoreHistory();
    // show newest first
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
    localStorage.removeItem('doodlejump-scores');
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

function placePlatforms() {
    platformArray = [];

    //starting platforms
    let platform = {
        img : platformImg,
        x : boardWidth/2,
        y : boardHeight - 50,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);

    // platform = {
    //     img : platformImg,
    //     x : boardWidth/2,
    //     y : boardHeight - 150,
    //     width : platformWidth,
    //     height : platformHeight
    // }
    // platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
        let platform = {
            img : platformImg,
            x : randomX,
            y : boardHeight - 75*i - 150,
            width : platformWidth,
            height : platformHeight
        }
    
        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
    let platform = {
        img : platformImg,
        x : randomX,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

function updateScore() {
    let points = Math.floor(50*Math.random()); //(0-1) *50 --> (0-50)
    if (velocityY < 0) { //negative going up
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    }
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}