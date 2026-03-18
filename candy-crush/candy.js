var candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"];
var board = [];
var rows = 9;
var columns = 9;
var score = 0;
let processing = false;
var currTile;
var otherTile;


window.onload = function() {
    startGame();
    const newBtn = document.getElementById('new-game-btn');
    if(newBtn){
        newBtn.addEventListener('click', resetGame);
    }
}

function randomCandy() {
    return candies[Math.floor(Math.random() * candies.length)]; //0 - 5.99
}

function startGame() {
    // // ensure clean board on restart
    // board = [];
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            // <img id="0-0" src="./images/Red.png">
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            tile.src = "./images/" + randomCandy() + ".png";

            //DRAG FUNCTIONALITY
            tile.addEventListener("dragstart", dragStart); //click on a candy, initialize drag process
            tile.addEventListener("dragover", dragOver);  //clicking on candy, moving mouse to drag the candy
            tile.addEventListener("dragenter", dragEnter); //dragging candy onto another candy
            tile.addEventListener("dragleave", dragLeave); //leave candy over another candy
            tile.addEventListener("drop", dragDrop); //dropping a candy over another candy
            tile.addEventListener("dragend", dragEnd); //after drag process completed, we swap candies

            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    // update HUD
    document.getElementById("score").innerText = score;

    console.log(board);
}

function dragStart() {
    //this refers to tile that was clicked on for dragging
    currTile = this;
}
function dragOver(e) {
    e.preventDefault();
}
function dragEnter(e) {
    e.preventDefault();
}
function dragLeave() {

}
function dragDrop() {
    //this refers to the target tile that was dropped on
    otherTile = this;
}
function dragEnd() {

    if (!otherTile) return;
    if (currTile.src.includes("blank") || otherTile.src.includes("blank")) return;

    let currCoords = currTile.id.split("-");
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    let otherCoords = otherTile.id.split("-");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    let isAdjacent =
        (r == r2 && Math.abs(c - c2) == 1) ||
        (c == c2 && Math.abs(r - r2) == 1);

    if (!isAdjacent) return;

    // swap
    swap(currTile, otherTile);

    // ako nema matcha → vrati nazad
    if (!checkValid()) {
        setTimeout(() => swap(currTile, otherTile), 200);
        return;
    }

    // ako ima match → obradi potez
    processBoard();
}
function swap(a, b){
    let temp = a.src;
    a.src = b.src;
    b.src = temp;
}
function processBoard() {
    processing = true;

    let interval = setInterval(() => {
        if (crushThree()) {
            slideCandy();
            generateCandy();
        } else {
            clearInterval(interval);
            processing = false;
        }
        document.getElementById("score").innerText = score;
    }, 200);
}


function crushCandy() {
    crushThree();
    document.getElementById("score").innerText = score;

}


function crushThree() {
    let crushed = false;
    // check rows
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];
            if (
                candy1.src === candy2.src &&
                candy2.src === candy3.src &&
                !candy1.src.includes("blank")
            ) {
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
                score += 30;
                crushed = true;
            }
        }
    }
    // check columns
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];
            if (
                candy1.src === candy2.src &&
                candy2.src === candy3.src &&
                !candy1.src.includes("blank")
            ) {
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
                score += 30;
                crushed = true;
            }
        }
    }
    return crushed;
}



function checkValid() {
    //check rows
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns-2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c+1];
            let candy3 = board[r][c+2];
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                return true;
            }
        }
    }

    //check columns
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows-2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r+1][c];
            let candy3 = board[r+2][c];
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                return true;
            }
        }
    }

    return false;
}


function slideCandy() {
    for (let c = 0; c < columns; c++) {
        let ind = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c].src.includes("blank")) {
                board[ind][c].src = board[r][c].src;
                ind -= 1;
            }
        }

        for (let r = ind; r >= 0; r--) {
            board[r][c].src = "./images/blank.png";
        }
    }
}

function generateCandy() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c].src.includes("blank")) {
                board[r][c].src = "./images/" + randomCandy() + ".png";
            }
        }
    }
}

function resetGame() {
    // Reset score
    score = 0;
    document.getElementById('score').innerText = score;
    
    // Clear the board
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    
    // Reset board array
    board = [];
    
    // Start new game
    startGame();
}