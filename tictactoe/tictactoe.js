// ...existing code...
var board;
var playerO = "O";
var playerX = "X";
var currPlayer = playerO;
var gameOver = false;

window.onload = function() {
    setGame();
}

function setGame() {
    // reset state
    board = [
                [' ', ' ', ' '],
                [' ', ' ', ' '],
                [' ', ' ', ' ']
            ]
    currPlayer = playerO;
    gameOver = false;

    // clear board DOM (important for restart)
    const boardEl = document.getElementById("board");
    if (boardEl) boardEl.innerHTML = "";

    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.classList.add("tile");
            if (r == 0 || r == 1) {
                tile.classList.add("horizontal-line");
            }
            if (c == 0 || c == 1) {
                tile.classList.add("vertical-line");
            }
            tile.innerText = "";
            tile.addEventListener("click", setTile);
            document.getElementById("board").appendChild(tile);
        }
    }
}

function setTile() {
    if (gameOver) {
        return;
    }

    let coords = this.id.split("-");    //ex) "1-2" -> ["1", "2'"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);

    if (board[r][c] != ' ') { 
        //already taken spot
        return;
    }
    
    board[r][c] = currPlayer; //mark the board
    this.innerText = currPlayer; //mark the board on html

    //change players
    if (currPlayer == playerO) {
        currPlayer = playerX;
    }
    else {
        currPlayer = playerO;
    }

    //check winner
    checkWinner();
}


function checkWinner() {
    //horizontally, check 3 rows
    for (let r = 0; r < 3; r++) {
        if (board[r][0] == board[r][1] && board[r][1] == board[r][2] && board[r][0] != ' ') {
            //if we found the winning row
            //apply the winner style to that row
            for (let i = 0; i < 3; i++) {
                let tile = document.getElementById(r.toString() + "-" + i.toString());
                tile.classList.add("winner");
            }
            gameOver = true;
            showWinOverlay(board[r][0]);
            return;
        }
    }

    //vertically, check 3 columns
    for (let c = 0; c < 3; c++) {
        if (board[0][c] == board[1][c] && board[1][c] ==  board[2][c] && board[0][c] != ' ') {
            //if we found the winning col
            //apply the winner style to that col
            for (let i = 0; i < 3; i++) {
                let tile = document.getElementById(i.toString() + "-" + c.toString());                
                tile.classList.add("winner");
            }
            gameOver = true;
            showWinOverlay(board[0][c]);
            return;
        }
    }

    //diagonally
    if (board[0][0] == board[1][1] && board[1][1] == board[2][2] && board[0][0] != ' ') {
        for (let i = 0; i < 3; i++) {
            let tile = document.getElementById(i.toString() + "-" + i.toString());                
            tile.classList.add("winner");
        }
        gameOver = true;
        showWinOverlay(board[0][0]);
        return;
    }

    //anti-diagonally
    if (board[0][2] == board[1][1] && board[1][1] == board[2][0] && board[0][2] != ' ') {
        //0-2
        let tile = document.getElementById("0-2");                
        tile.classList.add("winner");

        //1-1
        tile = document.getElementById("1-1");                
        tile.classList.add("winner");

        //2-0
        tile = document.getElementById("2-0");                
        tile.classList.add("winner");
        gameOver = true;
        showWinOverlay(board[0][2]);
        return;
    }
}

// create and show a centered large red winner overlay with "New Game" button
function showWinOverlay(winner) {
    // remove existing overlay if present
    const old = document.getElementById("win-overlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.id = "win-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.background = "rgba(0,0,0,0.6)";
    overlay.style.zIndex = "9999";

    const box = document.createElement("div");
    box.style.textAlign = "center";
    box.style.padding = "30px 40px";
    box.style.borderRadius = "8px";
    box.style.background = "rgba(255,255,255,0.95)";
    box.style.boxShadow = "0 6px 24px rgba(0,0,0,0.4)";

    const title = document.createElement("div");
    title.innerText = "PLAYER " + winner + " WINS!";
    title.style.color = "red";
    title.style.fontSize = "72px";
    title.style.fontWeight = "900";
    title.style.letterSpacing = "2px";
    title.style.marginBottom = "20px";

    const btn = document.createElement("button");
    btn.innerText = "New Game";
    btn.style.fontSize = "20px";
    btn.style.padding = "12px 22px";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.style.background = "#2b7cff";
    btn.style.color = "white";
    btn.addEventListener("click", function (e) {
        e.stopPropagation();
        overlay.remove();
        setGame();
    });

    box.appendChild(title);
    box.appendChild(btn);
    overlay.appendChild(box);

    // clicking outside box also restarts
    overlay.addEventListener("click", function () {
        overlay.remove();
        setGame();
    });

    document.body.appendChild(overlay);
}