
var numSelected = null;
var tileSelected = null;
var highlightedDigit = null;

var errors = 0;

var boardArr = [];        // mutable board as array of arrays
var gameOver = false;
var counts = {};         // counts for digits "1".."9"

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function generateBaseGrid() {
    // standard pattern: (r*3 + floor(r/3) + c) % 9 + 1
    const grid = [];
    for (let r = 0; r < 9; r++) {
        const row = [];
        for (let c = 0; c < 9; c++) {
            const val = ((r * 3 + Math.floor(r / 3) + c) % 9) + 1;
            row.push(String(val));
        }
        grid.push(row);
    }
    return grid;
}

function transpose(grid) {
    const g = Array.from({ length: 9 }, () => Array(9).fill('0'));
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            g[c][r] = grid[r][c];
        }
    }
    return g;
}

function swapRows(grid, r1, r2) {
    [grid[r1], grid[r2]] = [grid[r2], grid[r1]];
}

function swapCols(grid, c1, c2) {
    for (let r = 0; r < 9; r++) {
        [grid[r][c1], grid[r][c2]] = [grid[r][c2], grid[r][c1]];
    }
}

function randomizeGrid(grid) {
    // number mapping
    const nums = shuffle(["1","2","3","4","5","6","7","8","9"].slice());
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            grid[r][c] = nums[parseInt(grid[r][c], 10) - 1];
        }
    }

    // swap rows within bands
    for (let i = 0; i < 10; i++) {
        const band = Math.floor(Math.random() * 3);
        const r1 = band * 3 + Math.floor(Math.random() * 3);
        const r2 = band * 3 + Math.floor(Math.random() * 3);
        swapRows(grid, r1, r2);
    }

    // swap columns within stacks
    for (let i = 0; i < 10; i++) {
        const stack = Math.floor(Math.random() * 3);
        const c1 = stack * 3 + Math.floor(Math.random() * 3);
        const c2 = stack * 3 + Math.floor(Math.random() * 3);
        swapCols(grid, c1, c2);
    }

    // swap row bands
    for (let i = 0; i < 5; i++) {
        const b1 = Math.floor(Math.random() * 3);
        let b2 = Math.floor(Math.random() * 3);
        while (b2 === b1) b2 = Math.floor(Math.random() * 3);
        for (let k = 0; k < 3; k++) {
            swapRows(grid, b1 * 3 + k, b2 * 3 + k);
        }
    }

    // swap column stacks
    for (let i = 0; i < 5; i++) {
        const s1 = Math.floor(Math.random() * 3);
        let s2 = Math.floor(Math.random() * 3);
        while (s2 === s1) s2 = Math.floor(Math.random() * 3);
        for (let k = 0; k < 3; k++) {
            swapCols(grid, s1 * 3 + k, s2 * 3 + k);
        }
    }

    // maybe transpose
    if (Math.random() > 0.5) {
        return transpose(grid);
    }
    return grid;
}

function gridToStrings(grid) {
    return grid.map(row => row.join(''));
}

function generateSolution() {
    const base = generateBaseGrid();        // array of arrays of chars
    const randomized = randomizeGrid(base);
    return gridToStrings(randomized);
}

function generatePuzzle(sol, holes) {
    // sol is array of 9 strings; returns array of 9 strings with '-' for blanks
    const puzzle = sol.map(r => r.split(''));
    let removed = 0;
    const maxHoles = Math.min(Math.max(holes, 10), 64); // safe bounds

    while (removed < maxHoles) {
        const r = Math.floor(Math.random() * 9);
        const c = Math.floor(Math.random() * 9);
        if (puzzle[r][c] !== '-') {
            puzzle[r][c] = '-';
            removed++;
        }
    }
    return puzzle.map(row => row.join(''));
}

function newGame(difficulty = "medium") {
    let holes;
    if (difficulty === "easy") holes = 35;
    else if (difficulty === "hard") holes = 55;
    else holes = 45; // medium

    solution = generateSolution();
    board = generatePuzzle(solution, holes);
    gameOver = false;
    errors = 0;
    document.getElementById && document.getElementById("errors") && (document.getElementById("errors").innerText = errors);
}

// helper: initialize counts from boardArr
function initCounts() {
    counts = {};
    for (let i = 1; i <= 9; i++) counts[String(i)] = 0;
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const v = boardArr[r][c];
            if (v !== '-') counts[v] = (counts[v] || 0) + 1;
        }
    }
}

// helper: update digit button appearance when a number is fully used
function updateNumberDisplay(num) {
    const el = document.getElementById(String(num));
    if (!el) return;
    if (counts[String(num)] >= 9) {
        el.style.color = "black";
        el.style.fontWeight = "700";
        el.style.pointerEvents = "none";
        el.classList.add("number-used");
        // if it was selected, deselect it
        if (numSelected && numSelected.id == String(num)) {
            numSelected.classList.remove("number-selected");
            numSelected = null;
        }
    } else {
        el.style.color = "";
        el.style.pointerEvents = "";
        el.classList.remove("number-used");
    }
}

// helper: check if puzzle solved
// function checkWin() {
//     for (let r = 0; r < 9; r++) {
//         for (let c = 0; c < 9; c++) {
//             if (boardArr[r][c] === '-') return false;
//         }
//     }
//     // solved
//     gameOver = true;
//     // disable digits
//     for (let i = 1; i <= 9; i++) {
//         const el = document.getElementById(String(i));
//         if (el) el.style.pointerEvents = "none";
//     }
//     // print errors and end game
//     alert("Game over! Errors: " + errors);
//     console.log("Game over. Errors:", errors);
//     return true;
// }

// ...existing code...

// helper: check if puzzle solved
function checkWin() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (boardArr[r][c] === '-') return false;
        }
    }
    // solved
    gameOver = true;
    // disable digits
    for (let i = 1; i <= 9; i++) {
        const el = document.getElementById(String(i));
        if (el) el.style.pointerEvents = "none";
    }
    // show congratulations modal with mistakes
    showCongratulationsModal(errors);
    return true;
}

// create and show a centered congratulations modal
function showCongratulationsModal(mistakes) {
    // remove existing overlay if present
    const old = document.getElementById("congratulations-modal");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.id = "congratulations-modal";
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
    title.innerText = "CONGRATULATIONS";
    title.style.color = "red";
    title.style.fontSize = "64px";
    title.style.fontWeight = "800";
    title.style.letterSpacing = "2px";
    title.style.marginBottom = "10px";

    const info = document.createElement("div");
    info.innerText = "Mistakes: " + mistakes;
    info.style.color = "#333";
    info.style.fontSize = "20px";
    info.style.marginBottom = "18px";

    const btn = document.createElement("button");
    btn.innerText = "New Game";
    btn.style.fontSize = "18px";
    btn.style.padding = "10px 18px";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.cursor = "pointer";
    btn.style.background = "#2b7cff";
    btn.style.color = "white";
    btn.addEventListener("click", function (e) {
        e.stopPropagation();
        overlay.remove();
        // reset state and start new game
        gameOver = false;
        setGame();
    });

    box.appendChild(title);
    box.appendChild(info);
    box.appendChild(btn);
    overlay.appendChild(box);

    // clicking outside box closes overlay and restarts
    overlay.addEventListener("click", function () {
        overlay.remove();
        gameOver = false;
        setGame();
    });

    document.body.appendChild(overlay);
}

// ...existing code...

// ...existing code...
window.onload = function() {
    setGame();
}

function setGame() {
    // Clear existing DOM (if re-starting)
    const digitsEl = document.getElementById("digits");
    const boardEl = document.getElementById("board");
    if (digitsEl) digitsEl.innerHTML = "";
    if (boardEl) boardEl.innerHTML = "";

    // create a new random game
    newGame("medium");

    // create mutable board array
    boardArr = board.map(r => r.split(''));

    // initialize counts from prefilled board
    initCounts();

    // Digits 1-9
    for (let i = 1; i <= 9; i++) {
        //<div id="1" class="number">1</div>
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", selectNumber);
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);

        // set initial appearance depending on counts
        updateNumberDisplay(String(i));
    }

    // Board 9x9
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            if (boardArr[r][c] != "-") {
                tile.innerText = boardArr[r][c];
                tile.classList.add("tile-start");
            }
            if (r == 2 || r == 5) {
                tile.classList.add("horizontal-line");
            }
            if (c == 2 || c == 5) {
                tile.classList.add("vertical-line");
            }
            tile.addEventListener("click", selectTile);
            tile.classList.add("tile");
            document.getElementById("board").append(tile);
        }
    }
}

// ...existing code...
function selectNumber(){
    if (gameOver) return;
    if (numSelected != null) {
        numSelected.classList.remove("number-selected");
    }
    numSelected = this;
    numSelected.classList.add("number-selected");
    
    // Highlight all tiles with this number
    highlightDigitInBoard(numSelected.id);
}

function highlightDigitInBoard(digit) {
    // Remove previous highlighting
    const previousHighlighted = document.querySelectorAll(".tile-highlighted");
    previousHighlighted.forEach(tile => {
        tile.classList.remove("tile-highlighted");
    });
    
    if (highlightedDigit === digit) {
        // If clicking the same number, toggle off
        highlightedDigit = null;
    } else {
        // Highlight all tiles containing this digit
        highlightedDigit = digit;
        const allTiles = document.querySelectorAll(".tile");
        allTiles.forEach(tile => {
            if (tile.innerText === digit) {
                tile.classList.add("tile-highlighted");
            }
        });
    }
}

function selectTile() {
    if (gameOver) return;

    if (numSelected) {
        if (this.innerText != "") {
            return;
        }

        // "0-0" "0-1" .. "3-1"
        let coords = this.id.split("-"); //["0", "0"]
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);

        if (solution[r][c] == numSelected.id) {
            this.innerText = numSelected.id;
            // update mutable board array
            boardArr[r][c] = numSelected.id;
            // increment count for that number and update display
            counts[numSelected.id] = (counts[numSelected.id] || 0) + 1;
            updateNumberDisplay(numSelected.id);

            // ensure this tile stands out immediately
            this.classList.add("tile-highlighted");
            // also refresh overall digit highlighting if user selected that digit
            if (highlightedDigit === numSelected.id) {
                // re-run to include new tile without toggling off
                const allTiles = document.querySelectorAll(".tile");
                allTiles.forEach(tile => {
                    if (tile.innerText === numSelected.id) {
                        tile.classList.add("tile-highlighted");
                    }
                });
            }

            // check win
            checkWin();
        }
        else {
            errors += 1;
            document.getElementById("errors").innerText = errors;
        }
    }
}

// var board = [
//     "--74916-5",
//     "2---6-3-9",
//     "-----7-1-",
//     "-586----4",
//     "--3----9-",
//     "--62--187",
//     "9-4-7---2",
//     "67-83----",
//     "81--45---"
// ]

// var solution = [   //stavit random, responzivu, dodat da se zacrni broj koji je gotov
//     "387491625",
//     "241568379",
//     "569327418",
//     "758619234",
//     "123784596",
//     "496253187",
//     "934176852",
//     "675832941",
//     "812945763"
// ]

// window.onload = function() {
//     setGame();
// }

// function setGame() {
//     // Digits 1-9
//     for (let i = 1; i <= 9; i++) {
//         //<div id="1" class="number">1</div>
//         let number = document.createElement("div");
//         number.id = i
//         number.innerText = i;
//         number.addEventListener("click", selectNumber);
//         number.classList.add("number");
//         document.getElementById("digits").appendChild(number);
//     }

//     // Board 9x9
//     for (let r = 0; r < 9; r++) {
//         for (let c = 0; c < 9; c++) {
//             let tile = document.createElement("div");
//             tile.id = r.toString() + "-" + c.toString();
//             if (board[r][c] != "-") {
//                 tile.innerText = board[r][c];
//                 tile.classList.add("tile-start");
//             }
//             if (r == 2 || r == 5) {
//                 tile.classList.add("horizontal-line");
//             }
//             if (c == 2 || c == 5) {
//                 tile.classList.add("vertical-line");
//             }
//             tile.addEventListener("click", selectTile);
//             tile.classList.add("tile");
//             document.getElementById("board").append(tile);
//         }
//     }
// }

// function selectNumber(){
//     if (numSelected != null) {
//         numSelected.classList.remove("number-selected");
//     }
//     numSelected = this;
//     numSelected.classList.add("number-selected");
// }

// function selectTile() {
//     if (numSelected) {
//         if (this.innerText != "") {
//             return;
//         }

//         // "0-0" "0-1" .. "3-1"
//         let coords = this.id.split("-"); //["0", "0"]
//         let r = parseInt(coords[0]);
//         let c = parseInt(coords[1]);

//         if (solution[r][c] == numSelected.id) {
//             this.innerText = numSelected.id;
//         }
//         else {
//             errors += 1;
//             document.getElementById("errors").innerText = errors;
//         }
//     }
// }
