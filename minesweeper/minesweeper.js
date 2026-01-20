let board = [];
let rows = 8;
let columns = 8;

let minesCount = 10;
let minesLocation = []; // "2-2", "3-4", "2-1"

let tilesClicked = 0; //goal to click all tiles except the ones containing mines
let flagEnabled = false;

let gameOver = false;

window.onload = function() {
    // wire controls
    document.getElementById("flag-button").addEventListener("click", setFlag);
    document.getElementById("easy-btn").addEventListener("click", () => startNewGame(10, 8, 8));
    document.getElementById("normal-btn").addEventListener("click", () => startNewGame(20, 10, 10));
    document.getElementById("hard-btn").addEventListener("click", () => startNewGame(30, 12, 12));
    document.getElementById("new-game-btn").addEventListener("click", () => startNewGame(minesCount, rows, columns));

    // start default (Normal)
    startNewGame(20, 10, 10);
}

function setMines() {
    // minesLocation.push("2-2");
    // minesLocation.push("2-3");
    // minesLocation.push("5-6");
    // minesLocation.push("3-4");
    // minesLocation.push("1-1");

    minesLocation = [];
    let minesLeft = minesCount;
    while (minesLeft > 0) { 
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "-" + c.toString();

        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }
}


function startGame() {
    document.getElementById("mines-count").innerText = minesCount;
    setMines();

    //populate our board
    board = [];
    const boardEl = document.getElementById("board");
    boardEl.innerHTML = "";

    // determine tile size to fit a reasonable max board area
    const maxBoardPx = 480; // maximum overall board dimension in px
    const tileSize = Math.max(24, Math.floor(maxBoardPx / Math.max(columns, rows)));
    // account for the board's border thickness so the inner content equals tile grid size
    const computed = window.getComputedStyle(boardEl);
    const borderLeft = parseInt(computed.borderLeftWidth) || 0;
    const borderTop = parseInt(computed.borderTopWidth) || 0;
    boardEl.style.width = (tileSize * columns + borderLeft * 2) + 'px';
    boardEl.style.height = (tileSize * rows + borderTop * 2) + 'px';
    // use CSS Grid so tiles wrap exactly into the board area
    boardEl.style.display = 'grid';
    boardEl.style.gridTemplateColumns = `repeat(${columns}, ${tileSize}px)`;
    boardEl.style.gridAutoRows = `${tileSize}px`;

    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            //<div id="0-0"></div>
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add('tile');
            tile.style.width = tile.style.height = tileSize + 'px';
            tile.addEventListener("click", clickTile);
            boardEl.append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    console.log(board);
}

function startNewGame(mines, newRows, newCols) {
    // reset state
    minesCount = mines;
    if (typeof newRows === 'number' && typeof newCols === 'number') {
        rows = newRows;
        columns = newCols;
    }
    // ensure minesCount doesn't exceed available tiles
    minesCount = Math.min(minesCount, Math.max(1, rows * columns - 1));
    tilesClicked = 0;
    flagEnabled = false;
    gameOver = false;
    minesLocation = [];
    // reset flag button color
    const fb = document.getElementById("flag-button");
    if (fb) fb.style.backgroundColor = "lightgray";
    startGame();
}

function setFlag() {
    if (flagEnabled) {
        flagEnabled = false;
        document.getElementById("flag-button").style.backgroundColor = "lightgray";
    }
    else {
        flagEnabled = true;
        document.getElementById("flag-button").style.backgroundColor = "darkgray";
    }
}

function clickTile() {
    if (gameOver || this.classList.contains("tile-clicked")) {
        return;
    }

    let tile = this;
    if (flagEnabled) {
        if (tile.innerText == "") {
            tile.innerText = "🚩";
        }
        else if (tile.innerText == "🚩") {
            tile.innerText = "";
        }
        return;
    }

    if (minesLocation.includes(tile.id)) {
        // alert("GAME OVER");
        gameOver = true;
        revealMines();
        return;
    }


    let coords = tile.id.split("-"); // "0-0" -> ["0", "0"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r, c);

}

function revealMines() {
    for (let r= 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)) {
                tile.innerText = "💣";
                tile.style.backgroundColor = "red";                
            }
        }
    }
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }
    if (board[r][c].classList.contains("tile-clicked")) {
        return;
    }

    board[r][c].classList.add("tile-clicked");
    tilesClicked += 1;

    let minesFound = 0;

    //top 3
    minesFound += checkTile(r-1, c-1);      //top left
    minesFound += checkTile(r-1, c);        //top 
    minesFound += checkTile(r-1, c+1);      //top right

    //left and right
    minesFound += checkTile(r, c-1);        //left
    minesFound += checkTile(r, c+1);        //right

    //bottom 3
    minesFound += checkTile(r+1, c-1);      //bottom left
    minesFound += checkTile(r+1, c);        //bottom 
    minesFound += checkTile(r+1, c+1);      //bottom right

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    }
    else {
        board[r][c].innerText = "";
        
        //top 3
        checkMine(r-1, c-1);    //top left
        checkMine(r-1, c);      //top
        checkMine(r-1, c+1);    //top right

        //left and right
        checkMine(r, c-1);      //left
        checkMine(r, c+1);      //right

        //bottom 3
        checkMine(r+1, c-1);    //bottom left
        checkMine(r+1, c);      //bottom
        checkMine(r+1, c+1);    //bottom right
    }

    if (tilesClicked == rows * columns - minesCount) {
        document.getElementById("mines-count").innerText = "Cleared";
        gameOver = true;
    }
}

function checkTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return 0;
    }
    if (minesLocation.includes(r.toString() + "-" + c.toString())) {
        return 1;
    }
    return 0;
}