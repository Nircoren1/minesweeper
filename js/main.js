//its better to look at the file in 80% zoom (mistake).
var gBoard = []
const EMPTY = ''
const MINE = '☀'

const gLevel = {
    SIZE: 4,
    MINES: 5,
    LIVES: 3,
    HINTS: 3,
    LEVEL: 1
};
const gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    markedMines: 0,
    secsPassed: 0,
    smiley: '😃',
    safeClicks: 3,
    manualMines: {
        placeMines: false,
        manualMinesMode: false,
        minesArr: []
    },
    isSevenBoom: false,
    megaHint: {
        isMegaHint: 0,
        upLeft: { i: -1, j: -1 },
        downRight: { i: -1, j: -1 }
    },
    //change this name.
    hints: { isHintMode: false, hintClicked: null }

}
const gUndo = {
    undoArr: [],
    undoCount: 0
}

const noRightClick = document.querySelector(".board");
noRightClick.addEventListener("contextmenu", e => e.preventDefault());

var gTimeInterval;

function initGame() {
    gBoard = [];
    createBoard();
    renderBoard();
    resetGame();
    renderLives();
    renderHints();
    renderLeaderboard();
}
localStorage.easyScore = Infinity;
localStorage.medScore = Infinity;
localStorage.hardScore = Infinity;

//change initial smilty position.
function resetGame() {
    gGame.isOn = true;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    gGame.markedMines = 0;
    gGame.smiley = '😃'
    gGame.hints = { isHintMode: false, hintClicked: null };
    gGame.safeClicks = 3;
    gGame.manualMines.placeMines = false;
    gGame.manualMines.manualMinesMode = false;
    gGame.isSevenBoom = false;
    gGame.megaHint = {
        isMegaHint: 0,
        upLeft: { i: -1, j: -1 },
        downRight: { i: -1, j: -1 }
    },
        gUndo.undoArr = [];
    gUndo.undoCount = 0;
    //reset dom
    document.querySelector('.smiley').innerText = gGame.smiley;
    document.querySelector(".safeClicksLeft").innerText = gGame.safeClicks;
    document.querySelector(".time").innerText = '000';
    document.querySelector(".manualMinesBtn").classList.remove("activeBtn");
    document.querySelector(".megaHint").classList.remove("activeBtn");
    document.querySelector(".megaHitAval").innerText = 'available';
    document.querySelector(".manualMinesDescription").innerText = '';

    if (gTimeInterval) clearInterval(gTimeInterval);
    gTimeInterval = null;
}

//count neigbors of each cell.
function setMinesNegsCount() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            //neighbors loop.
            var currCell = gBoard[i][j]
            //because of mine exterminator.
            currCell.minesAroundCount = 0;
            for (var row = i - 1; row <= i + 1; row++) {
                if (row < 0 || row > gLevel.SIZE - 1) continue;
                for (var col = j - 1; col <= j + 1; col++) {
                    if ((row === i && col === j) || col < 0 || col > gLevel.SIZE - 1) continue;
                    if (gBoard[row][col].isMine) currCell.minesAroundCount += 1;
                }
            }
            if (currCell.isMine) continue;
            if (!currCell.minesAroundCount) document.querySelector(`.cell-${i}-${j} span`).innerHTML = EMPTY;
            else {
                var currCellDom = document.querySelector(`.cell-${i}-${j} span`)
                currCellDom.innerHTML = currCell.minesAroundCount;
                if (currCell.minesAroundCount === 1) currCellDom.classList.add("blueNum");
                if (currCell.minesAroundCount === 2) currCellDom.classList.add("greenNum");
                if (currCell.minesAroundCount === 3) currCellDom.classList.add("redNum");
                if (currCell.minesAroundCount === 4) currCellDom.classList.add("purpleNum");
                if (currCell.minesAroundCount === 5) currCellDom.classList.add("brownNum");
                if (currCell.minesAroundCount === 6) currCellDom.classList.add("paleBlueNum");
                if (currCell.minesAroundCount === 7) currCellDom.classList.add("blackNum");
                if (currCell.minesAroundCount === 8) currCellDom.classList.add("greyNum");
            }
        }
    }
}


function createBoard() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard.push([]);
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i].push({
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            });
        }
    }
}

function renderBoard() {
    var boardStr = '';
    var idx = 0;
    for (var i = 0; i < gLevel.SIZE; i++) {
        boardStr += '<tr>';
        for (var j = 0; j < gLevel.SIZE; j++) {
            tdClassName = 'cell';
            contentClassName = 'hidden';
            cellIdx =
                boardStr += `<td data-idx = "${idx++}" class="${tdClassName + ` cell-${i}-${j}`}" 
                onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})">
                <span class="${contentClassName}"></span></td>`;
        }
        boardStr += '</tr>';
    }
    document.querySelector('.board').innerHTML = boardStr;
}

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gGame.manualMines.placeMines) {
        manualPlaceMine(i, j);
        return;
    }
    if (!gGame.shownCount) {
        if (!gGame.manualMines.manualMinesMode && !gGame.isSevenBoom) placeMines(i, j);
        setMinesNegsCount();
        if (!gTimeInterval) gTimeInterval = setInterval(updateTime, 1000);
    } else if (gGame.megaHint.isMegaHint === 1) { // in case megaHint was clicked.
        gGame.megaHint.upLeft.i = i;
        gGame.megaHint.upLeft.j = j;
        gGame.megaHint.isMegaHint++;
        return;
    } else if (gGame.megaHint.isMegaHint === 2) {// second click of user after using megaHint.
        gGame.megaHint.downRight.i = i;
        gGame.megaHint.downRight.j = j;
        showMegaHint(gGame.megaHint);
        return;
    } else if (gGame.hints.isHintMode) { //click after clicking hint.
        revealCellsOnHint(gGame.hints.hintClicked, i, j);
        return
    }
    if (!gBoard[i][j].isShown && gGame.isOn && !gBoard[i][j].isMarked) { // normal click.
        gUndo.undoArr.push([]);
        if (!gBoard[i][j].minesAroundCount && !gBoard[i][j].isMine) {
            expandShown(elCell, i, j);
        } else {
            cellShown(elCell, i, j);
            gUndo.undoArr[gUndo.undoCount].push({ i: i, j: j, marked: false });
        }
        gUndo.undoCount++;
        checkGameOver(true, i, j);
    }

}

// cell marked function, deals with right click.
function cellMarked(elCell, i, j) {
    if (!gGame.isOn || gBoard[i][j].isShown) return;
    if (!gTimeInterval) gTimeInterval = setInterval(updateTime, 1000);
    if (gBoard[i][j].isMine) {
        gGame.markedMines += gBoard[i][j].isMarked ? -1 : 1;
        checkGameOver(false, i, j);
    }
    gUndo.undoArr.push([]);
    if (gBoard[i][j].isMarked) {
        // gUndo.undoArr[gUndo.undoCount].push({ i: i, j: j, isMarked: false });
        gGame.markedCount--;
        var image = elCell.querySelector('img');
        image.parentNode.removeChild(image);
    } else {

        gGame.markedCount++;
        elCell.innerHTML += `<img src="media/minesweeperflag.png">`;
    }
    gUndo.undoArr[gUndo.undoCount].push({ i: i, j: j, isMarked: true });
    gUndo.undoCount++;
    elCell.classList.toggle('marked');
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;


}

function checkGameOver(isClicked, i, j) {
    //delete repetition.
    if (gBoard[i][j].isMine && isClicked) {
        gLevel.LIVES--;
        renderLives();
        if (!gLevel.LIVES) {
            revealMines();
            gameEnded('🤯', 'You Lost!');
            return;
        }
    }
    if (gGame.shownCount + gGame.markedMines === gLevel.SIZE ** 2) {
        var bestScore = checkBestScore();
        document.querySelector(".bestScores").innerText = bestScore + ' seconds!';
        gameEnded('😎', 'You Won!');
    }
}

function checkBestScore() {
    var bestScore;
    if (gLevel.LEVEL === 1) {
        if (+localStorage.easyScore > gGame.secsPassed) {
            localStorage.easyScore = gGame.secsPassed;
        }
        bestScore = localStorage.easyScore;
    } else if (gLevel.LEVEL === 2) {
        if (+localStorage.medScore > gGame.secsPassed) {
            localStorage.medScore = gGame.secsPassed;
        }
        bestScore = localStorage.medScore;
    } else if (gLevel.LEVEL === 3) {
        if (+localStorage.hardScore > gGame.secsPassed) {
            localStorage.hardScore = gGame.secsPassed;
        }
        bestScore = localStorage.hardScore;
    }
    return bestScore;
}

function gameEnded(smileyStr, messege) {
    alert(messege);
    gGame.smiley = smileyStr
    gGame.isOn = false;
    clearInterval(gTimeInterval);
    document.querySelector('.smiley').innerText = gGame.smiley
}

function renderCell(cellObj) {
    return document.querySelector(`.${cellObj.idx}`).innerHTML = cellObj.value;
}

function expandShown(elCell, i, j) {
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row > gLevel.SIZE - 1) continue;
        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col > gLevel.SIZE - 1) continue;
            if (gBoard[row][col].isShown) {
                continue;
            }
            var elCell = document.querySelector(`.cell-${row}-${col}`);
            cellShown(elCell, row, col);
            if (gBoard[row][col].isMarked) {
                gUndo.undoArr[gUndo.undoCount].push({ i: row, j: col, isMarked: true });
                gBoard[row][col].isMarked = false;
                gGame.markedCount--;
                var image = elCell.querySelector('img');
                image.parentNode.removeChild(image);
                // gUndo.undoArr[gUndo.undoCount++].push({ i: row, j: col, isMarked: true });
            }
            gUndo.undoArr[gUndo.undoCount].push({ i: row, j: col, isMarked: false });


            if (!gBoard[row][col].minesAroundCount) {
                expandShown(elCell, row, col);
            }
        }
    }
}

function cellShown(elCell, i, j) {
    gBoard[i][j].isShown = true;
    gGame.shownCount++;
    elCell.querySelector("span").classList.toggle('hidden');
    elCell.classList.toggle('shownCell');
    if (gBoard[i][j].isMine || !gBoard[i][j].minesAroundCount) {
        elCell.querySelector("span").classList.remove
            ('blueNum', 'greenNum', 'redNum', 'purpleNum', 'brownNum', 'paleBlueNum', 'greyNum', 'blackNum');
    }

}

function updateTime() {
    var secsPassed = gGame.secsPassed++;
    var timeStr;
    if (secsPassed < 10) timeStr = '00' + secsPassed;
    else if (secsPassed < 100) timeStr = '0' + secsPassed;
    else timeStr = '' + secsPassed;
    document.querySelector(".time").innerText = timeStr;
}



