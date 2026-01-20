function openGame(url){
    window.location.href = url;
}

// Filter visible games based on search query (only when Search button is clicked)
function filterGames(query){
    const q = String(query || '').trim().toLowerCase();
    const games = document.querySelectorAll('.game');
    games.forEach(g => {
        const nameEl = g.querySelector('p');
        const name = nameEl ? nameEl.textContent.trim().toLowerCase() : '';
        if(!q || name.includes(q)){
            g.style.display = 'flex';
        } else {
            g.style.display = 'none';
        }
    });
    // If no games are visible after filtering, show a 'no results' message
    const visibleCount = Array.from(games).filter(g => getComputedStyle(g).display !== 'none').length;
    let noRes = document.getElementById('no-results');
    if(visibleCount === 0){
        if(!noRes){
            noRes = document.createElement('div');
            noRes.id = 'no-results';
            noRes.textContent = 'This game does not exist';
            const grid = document.querySelector('.games-grid');
            if(grid && grid.parentNode){
                grid.parentNode.insertBefore(noRes, grid.nextSibling);
            } else {
                document.body.appendChild(noRes);
            }
        }
        noRes.style.display = 'block';
    } else {
        if(noRes){
            noRes.style.display = 'none';
        }
    }
}

// kada kliknemo na bottun za pretragu 
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('search');
    const btn = document.querySelector('header form button');
    if(btn){
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            filterGames(input ? input.value : '');
        });
    }
    // If the user clears the search input, immediately restore all games
    if(input){
        input.addEventListener('input', () => {
            if(!input.value.trim()){
                filterGames('');
            }
        });
    }
    // inject small previews into all tiles (uses onclick url when present)
    injectMiniPreviews();
});
// Inject small, non-interactive iframe previews into all .game tiles.
// It prefers the tile's onclick URL (openGame('...')) and falls back to known mappings.
function injectMiniPreviews(){
    const games = document.querySelectorAll('.game');
    games.forEach(g => {
        // avoid duplicate
        if(g.querySelector('iframe.preview-mini')) return;

        // try to extract URL from onclick attribute: openGame('path')
        let src = '';
        const onclick = g.getAttribute('onclick') || '';
        const m = onclick.match(/openGame\(['"]([^'"]+)['"]\)/);
        if(m) src = m[1];

        // fallback mapping by name (small set)
        if(!src){
            const nameEl = g.querySelector('p');
            const name = nameEl ? nameEl.textContent.trim().toLowerCase() : '';
            if(name.includes('2048')) src = '2048/2048.html';
            else if(name.includes('black')) src = 'blackjack/blackjack.html';
            else if(name.includes('breakout')) src = 'breakout/breakout.html';
            else if(name.includes('candy')) src = 'candy-crush/candy.html';
            else if(name.includes('connect')) src = 'connect4/connect4.html';
            else if(name.includes('doodle')) src = 'doodlejump/doodlejump.html';
            else if(name.includes('duck')) src = 'duckhunt/duckhunt.html';
            else if(name.includes('flappy')) src = 'flappybird/flappybird.html';
            else if(name.includes('minesweeper')) src = 'minesweeper/minesweeper.html';
            else if(name.includes('mole')) src = 'mole/mole.html';
            else if(name.includes('pacman')) src = 'pacman/pacman.html';
            else if(name.includes('pong')) src = 'pong/pong.html';
            else if(name.includes('snake')) src = 'snake/snake.html';
            else if(name.includes('space')) src = 'space/space.html';
            else if(name.includes('sudoka')||name.includes('sudoku')) src = 'sudoka/sudoka.html';
            else if(name.includes('tic')||name.includes('tictactoe')) src = 'tictactoe/tictactoe.html';
            else if(name.includes('wordle')) src = 'wordle/wordle.html';
        }

        if(src){
            // ensure tile is positioned for absolute children
            if(getComputedStyle(g).position === 'static'){
                g.style.position = 'relative';
            }
            const iframe = document.createElement('iframe');
            iframe.className = 'preview-mini';
            iframe.src = src;
            iframe.setAttribute('aria-hidden', 'true');
            iframe.setAttribute('loading', 'lazy');
            iframe.style.border = '0';
            iframe.style.pointerEvents = 'none'; // non-interactive preview
            // insert as first child so it sits behind the label
            g.insertBefore(iframe, g.firstChild);
        }
    });
}