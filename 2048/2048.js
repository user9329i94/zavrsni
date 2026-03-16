var board;
var score = 0;
var rows = 4;
var columns = 4;

window.onload = function() {
    const newBtn = document.getElementById('new-game');
    if (newBtn) newBtn.addEventListener('click', clearSavedGame);
    const gameOverNewBtn = document.getElementById('game-over-new-game');
    if (gameOverNewBtn) gameOverNewBtn.addEventListener('click', () => {
        closeGameOver();
        clearSavedGame();
    });
    const allBtn = document.getElementById('all-scores');
    if (allBtn) allBtn.addEventListener('click', showAllScores);
    const closeBtn = document.getElementById('close-scores');
    if (closeBtn) closeBtn.addEventListener('click', closeScores);
    // when the page is closed, record current score into history (avoid duplicates)
    window.addEventListener('beforeunload', function(){ saveScoreToHistory(score); });
    // load saved game if present, otherwise start new
    if (!loadGame()) {
        setGame();
    }
}

function setGame() {
    // clear any existing board DOM (restart)
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ]

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            let num = board[r][c];
            updateTile(tile, num);
            document.getElementById("board").append(tile);
        }
    }
    //create 2 to begin the game
    setTwo();
    setTwo();

    // update displayed score and persist initial state
    document.getElementById('score').innerText = score;
    saveGame();
}

// Persist current board & score to localStorage
function saveGame(){
    try{
        localStorage.setItem('2048-board', JSON.stringify(board));
        localStorage.setItem('2048-score', String(score));
    } catch(e){
        console.warn('Could not save game state', e);
    }
}

// Load saved board & score from localStorage. Returns true if loaded.
function loadGame(){
    try{
        const data = localStorage.getItem('2048-board');
        const s = localStorage.getItem('2048-score');
        if(data && s !== null){
            const parsed = JSON.parse(data);
            if(Array.isArray(parsed) && parsed.length === rows){
                board = parsed;
                score = parseInt(s, 10) || 0;
                // build DOM from loaded board
                const boardEl = document.getElementById('board');
                boardEl.innerHTML = '';
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < columns; c++) {
                        let tile = document.createElement("div");
                        tile.id = r.toString() + "-" + c.toString();
                        let num = board[r][c];
                        updateTile(tile, num);
                        boardEl.append(tile);
                    }
                }
                document.getElementById('score').innerText = score;
                return true;
            }
        }
    } catch(e){
        console.warn('Could not load saved game', e);
    }
    return false;
}

// Clear saved game and start a new one
function clearSavedGame(){
    try{
        // record current score to history before clearing (if > 0)
        saveScoreToHistory(score);
        localStorage.removeItem('2048-board');
        localStorage.removeItem('2048-score');
    } catch(e){}
    score = 0;
    setGame();
}

// ===== Score history helpers =====
function getScoreHistory(){
    try{
        const raw = localStorage.getItem('2048-history');
        if(!raw) return [];
        const parsed = JSON.parse(raw);
        if(Array.isArray(parsed)) return parsed;
    } catch(e){ }
    return [];
}

function saveScoreToHistory(s){
    try{
        s = parseInt(s,10) || 0;
        if(s <= 0) return;
        const hist = getScoreHistory();
        const last = hist.length ? hist[hist.length-1] : null;
        if(last && last.score === s) return; // avoid duplicate consecutive entries
        hist.push({ score: s, date: new Date().toISOString() });
        localStorage.setItem('2048-history', JSON.stringify(hist));
    } catch(e){
        console.warn('Could not save score to history', e);
    }
}

function showAllScores(){
    const hist = getScoreHistory();
    const list = document.getElementById('scores-list');
    if(!list) return;
    list.innerHTML = '';
    if(hist.length === 0){
        const li = document.createElement('li');
        li.textContent = 'No saved scores';
        list.appendChild(li);
    } else {
        // show newest first
        const rev = hist.slice().reverse();
        for(const entry of rev){
            const li = document.createElement('li');
            let dateStr = entry.date ? new Date(entry.date).toLocaleString() : '';
            li.textContent = entry.score + (dateStr ? (' — ' + dateStr) : '');
            list.appendChild(li);
        }
    }
    const overlay = document.getElementById('scores-overlay');
    if(overlay) overlay.classList.remove('hidden');
}

function closeScores(){
    const overlay = document.getElementById('scores-overlay');
    if(overlay) overlay.classList.add('hidden');
}

function updateTile(tile, num) {
    tile.innerText = "";
    tile.classList.value = ""; //clear the classList
    tile.classList.add("tile");
    if (num > 0) {
        tile.innerText = num.toString();
        if (num <= 4096) {
            tile.classList.add("x"+num.toString()); //add class based on number for styling (e.g. x2..)
        } else {
            tile.classList.add("x8192");
        }                
    }
}

document.addEventListener('keyup', (e) => {
    if (e.code == "ArrowLeft") {
        slideLeft();
        setTwo();
    }
    else if (e.code == "ArrowRight") {
        slideRight();
        setTwo();
    }
    else if (e.code == "ArrowUp") {
        slideUp();
        setTwo();

    }
    else if (e.code == "ArrowDown") {
        slideDown();
        setTwo();
    }
    document.getElementById("score").innerText = score;
    // save after each move
    saveGame();
    // check if game is over
    if (isGameOver()) {
        showGameOver();
    }
})

function filterZero(row){
    return row.filter(num => num != 0);         //create new array of all nums != 0
}

function slide(row) {
    //[0, 2, 2, 2] 
    row = filterZero(row); //[2, 2, 2]
    for (let i = 0; i < row.length-1; i++){
        if (row[i] == row[i+1]) {
            row[i] *= 2;
            row[i+1] = 0;
            score += row[i];
        }
    } //[4, 0, 2]
    row = filterZero(row); //[4, 2]
    //add zeroes
    while (row.length < columns) {
        row.push(0);
    } //[4, 2, 0, 0]
    return row;
}

function slideLeft() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];
        row = slide(row);
        board[r] = row;
        for (let c = 0; c < columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideRight() {
    for (let r = 0; r < rows; r++) {
        let row = board[r];         //[0, 2, 2, 2]
        row.reverse();              //[2, 2, 2, 0]
        row = slide(row)            //[4, 2, 0, 0]
        board[r] = row.reverse();   //[0, 0, 2, 4];
        for (let c = 0; c < columns; c++){
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function slideUp() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row = slide(row);
        // board[0][c] = row[0];
        // board[1][c] = row[1];
        // board[2][c] = row[2];
        // board[3][c] = row[3];
        for (let r = 0; r < rows; r++){
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}
function slideDown() {
    for (let c = 0; c < columns; c++) {
        let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
        row.reverse();
        row = slide(row);
        row.reverse();
        // board[0][c] = row[0];
        // board[1][c] = row[1];
        // board[2][c] = row[2];
        // board[3][c] = row[3];
        for (let r = 0; r < rows; r++){
            board[r][c] = row[r];
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let num = board[r][c];
            updateTile(tile, num);
        }
    }
}

function setTwo() {
    if (!hasEmptyTile()) {
        return;
    }
    let found = false;
    while (!found) {
        //find random row and column to place a 2 in
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = 2;
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            tile.innerText = "2";
            tile.classList.add("x2");
            found = true;
        }
    }
    // persist when a new tile is created
    saveGame();
}

function hasEmptyTile() {
    let count = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) { //at least one zero in the board
                return true;
            }
        }
    }
    return false;
}

// Check if the game is over (no empty tiles and no valid moves)
function isGameOver() {
    // if there are empty tiles, game is not over
    if (hasEmptyTile()) {
        return false;
    }
    // Check if any moves are possible
    // Check horizontal moves
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 1; c++) {
            if (board[r][c] === board[r][c + 1]) {
                return false; // Can merge horizontally
            }
        }
    }
    // Check vertical moves
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 1; r++) {
            if (board[r][c] === board[r + 1][c]) {
                return false; // Can merge vertically
            }
        }
    }
    // No moves possible
    return true;
}

// Show game over overlay
function showGameOver() {
    const overlay = document.getElementById('game-over-overlay');
    const finalScore = document.getElementById('final-score');
    if (overlay && finalScore) {
        finalScore.textContent = score;
        overlay.classList.remove('hidden');
    }
}

// Close game over overlay
function closeGameOver() {
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}