let dealerSum = 0;
let yourSum = 0;

let dealerAceCount = 0;
let yourAceCount = 0; 

let hidden;
let deck;

let canHit = true; //allows the player (you) to draw while yourSum <= 21
let listenersAdded = false;

window.onload = function() {
    buildDeck();
    shuffleDeck();
    startGame();
    // wire modal buttons
    const modalNew = document.getElementById('modal-new');
    if(modalNew) modalNew.addEventListener('click', resetGame);
    const modalClose = document.getElementById('modal-close');
    if(modalClose) modalClose.addEventListener('click', () => {
        const m = document.getElementById('win-modal');
        if(m) m.classList.add('hidden');
    });
}

function buildDeck() {   //ovo
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let types = ["C", "D", "H", "S"];
    deck = [];

    for (let i = 0; i < types.length; i++) {
        for (let j = 0; j < values.length; j++) {
            deck.push(values[j] + "-" + types[i]); //A-C -> K-C, A-D -> K-D
        }
    }
    // console.log(deck);
}

function shuffleDeck() {   //ovo
    for (let i = 0; i < deck.length; i++) {
        let j = Math.floor(Math.random() * deck.length); // (0-1) * 52 => (0-51.9999)
        let temp = deck[i];
        deck[i] = deck[j];
        deck[j] = temp;
    }
    console.log(deck);
}

function startGame() {
    // clear previous DOM cards if restarting
    const dealerEl = document.getElementById('dealer-cards');
    const yourEl = document.getElementById('your-cards');
    if(dealerEl) dealerEl.innerHTML = '<img id="hidden" src="./cards/BACK.png">';
    if(yourEl) yourEl.innerHTML = '';

    hidden = deck.pop();
    dealerSum += getValue(hidden);
    dealerAceCount += checkAce(hidden);
    // console.log(hidden);
    // console.log(dealerSum);
    while (dealerSum < 17) {
        //<img src="./cards/4-C.png">
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        dealerSum += getValue(card);
        dealerAceCount += checkAce(card);
        document.getElementById("dealer-cards").append(cardImg);
    }
    console.log(dealerSum);

    for (let i = 0; i < 2; i++) {
        let cardImg = document.createElement("img");
        let card = deck.pop();
        cardImg.src = "./cards/" + card + ".png";
        yourSum += getValue(card);
        yourAceCount += checkAce(card);
        document.getElementById("your-cards").append(cardImg);
    }

    console.log(yourSum);
    if(!listenersAdded){
        document.getElementById("hit").addEventListener("click", hit);
        document.getElementById("stay").addEventListener("click", stay);
        listenersAdded = true;
    }

}

function hit() {
    if (!canHit) {
        return;
    }

    let cardImg = document.createElement("img");
    let card = deck.pop();
    cardImg.src = "./cards/" + card + ".png";
    yourSum += getValue(card);
    yourAceCount += checkAce(card);
    document.getElementById("your-cards").append(cardImg);

    if (reduceAce(yourSum, yourAceCount) > 21) { //A, J, 8 -> 1 + 10 + 8
        canHit = false;
    }

}

function stay() {
    dealerSum = reduceAce(dealerSum, dealerAceCount);
    yourSum = reduceAce(yourSum, yourAceCount);

    canHit = false;
    document.getElementById("hidden").src = "./cards/" + hidden + ".png";

    let message = "";
    if (yourSum > 21) {
        message = "You Lose!";
    }
    else if (dealerSum > 21) {
        message = "You win!";
    }
    //both you and dealer <= 21
    else if (yourSum == dealerSum) {
        message = "Tie!";
    }
    else if (yourSum > dealerSum) {
        message = "You Win!";
    }
    else if (yourSum < dealerSum) {
        message = "You Lose!";
    }

    // populate modal with message and both scores
    document.getElementById("dealer-sum").innerText = dealerSum;
    document.getElementById("your-sum").innerText = yourSum;
    const modal = document.getElementById('win-modal');
    const modalMsg = document.getElementById('modal-message');
    const modalDealer = document.getElementById('modal-dealer-sum');
    const modalYour = document.getElementById('modal-your-sum');
    if(modalMsg) modalMsg.innerText = message;
    if(modalDealer) modalDealer.innerText = dealerSum;
    if(modalYour) modalYour.innerText = yourSum;
    if(modal) modal.classList.remove('hidden');
}

function getValue(card) {
    let data = card.split("-"); // "4-C" -> ["4", "C"]
    let value = data[0];

    if (isNaN(value)) { //A J Q K
        if (value == "A") {
            return 11;
        }
        return 10;
    }
    return parseInt(value);
}

function checkAce(card) {  //netria
    if (card[0] == "A") {
        return 1;
    }
    return 0;
}

function reduceAce(playerSum, playerAceCount) {
    while (playerSum > 21 && playerAceCount > 0) {
        playerSum -= 10;
        playerAceCount -= 1;
    }
    return playerSum;
}

function resetGame(){
    // reset state
    dealerSum = 0;
    yourSum = 0;
    dealerAceCount = 0;
    yourAceCount = 0;
    hidden = null;
    deck = [];
    canHit = true;
    listenersAdded = false;
    // rebuild deck and start
    buildDeck();
    shuffleDeck();
    startGame();
    // hide modal
    const modal = document.getElementById('win-modal');
    if(modal) modal.classList.add('hidden');
    // clear displayed sums
    const d = document.getElementById('dealer-sum'); if(d) d.innerText = '';
    const y = document.getElementById('your-sum'); if(y) y.innerText = '';
}