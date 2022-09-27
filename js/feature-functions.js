
function onSafeClick() {
    if (!gGame.safeClicks || !gGame.shownCount || !gGame.isOn) return
    var cellNotFound = true;
    var randI;
    var randJ;
    while (cellNotFound) {
        randI = getRandomIntInclusive(0, gLevel.SIZE - 1);
        randJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
        if (!gBoard[randI][randJ].isMine && !gBoard[randI][randJ].isShown) {
            var safeCell = document.querySelector(`.cell-${randI}-${randJ}`);
            safeCell.classList.add("safeCell");
            const wo = setTimeout(() => {
                safeCell.classList.remove("safeCell")
            }, 3000);
            cellNotFound = false;
        }
    }
    gGame.safeClicks -= 1;
    document.querySelector(".safeClicksLeft").innerText = gGame.safeClicks;
}

function revealCellsOnHint(hintClicked, i, j) {
    for (var row = i - 1; row <= i + 1; row++) {
        if (row < 0 || row > gLevel.SIZE - 1) continue;
        for (var col = j - 1; col <= j + 1; col++) {
            if (col < 0 || col > gLevel.SIZE - 1) continue;
            var elCell = document.querySelector(`.cell-${row}-${col} span`);
            if (elCell.classList.contains("hidden")) {
                elCell.classList.toggle("hidden");
                returnToHidden(elCell,1000);
            }

        }
    }
    gGame.hints.isHintMode = false;
    document.querySelector(`[data-hint-num="${gGame.hints.hintClicked}"]`).innerText = ''
    gGame.hints.hintClicked = null;
}

function returnToHidden(elCell,time) {
    setTimeout(function () {
        elCell.classList.add("hidden");
    }, time)
}
function concealCell(elCell) {
setTimeout(function() {
    elCell.classList.remove("shownCell");
}, 2000)
}

function renderLives() {
    var counter = gLevel.LIVES;
    var livesStr = '';
    while (counter) {
        livesStr +=
            ` <span class="heart">❤</span>`
        counter--;
    }
    document.querySelector(".lives").innerHTML = livesStr;
}
function renderHints() {
    var counter = 1;
    var hintsStr = 'hints:';
    while (counter <= gLevel.HINTS) {
        hintsStr +=
            ` <span onclick= "onHintsClick(this)" class="hints" data-hint-num="hint${counter}">💡</span>`
        counter++;
    }
    document.querySelector(".hintsP").innerHTML = hintsStr;
}
function onHintsClick(hint) {
    if (gGame.hints.isHintMode && gGame.hints.hintClicked !== hint.dataset.hintNum) return;
    hint.innerText = gGame.hints.isHintMode ? '💡' : '❌';
    gGame.hints.isHintMode = !gGame.hints.isHintMode;
    gGame.hints.hintClicked = hint.dataset.hintNum;
}

function onUndoClick() {
    if (!gUndo.undoCount) return;
    if (!gGame.isOn) return;
    var lastMove = gUndo.undoArr[gUndo.undoCount - 1];
    for (var i = 0; i < lastMove.length; i++) {
        var changedCell = lastMove[i];
        var cellModel = gBoard[changedCell.i][changedCell.j];
        if (changedCell.isMarked === true) {
            if (cellModel.isMarked) {
                cellModel.isMarked = false;
                gGame.markedCount--;
                var image = document.querySelector(`.cell-${changedCell.i}-${changedCell.j} img`)
                image.parentNode.removeChild(image);
                if (cellModel.isMine) {
                    gGame.markedMines--;
                }
            }
            else {
                cellModel.isMarked = true;
                gGame.markedCount++;
                document.querySelector(`.cell-${changedCell.i}-${changedCell.j}`).innerHTML += `<img src="minesweeperflag.png">`;
            }
        }
        else {
            if (cellModel.isMine) {
                gLevel.LIVES++;
                renderLives();
            }
            cellModel.isShown = false;
            gGame.shownCount--;
            document.querySelector(`.cell-${changedCell.i}-${changedCell.j} span`).classList.add("hidden");
            document.querySelector(`.cell-${changedCell.i}-${changedCell.j}`).classList.remove('shownCell');
        }
    }
    gUndo.undoCount--;
    gUndo.undoArr.pop()
}

function megaHint(btn) {
    if (!gGame.shownCount) return;
    if (gGame.megaHint.isMegaHint === -1) return;
    if (gGame.megaHint.isMegaHint === 1) {
        gGame.megaHint.isMegaHint = -1;
    }
    gGame.megaHint.isMegaHint++;
    gGame.manualMines.placeMines = false;
    gGame.hints.isHintMode = false;
    btn.classList.toggle("activeBtn");
}

function showMegaHint(obj) {
    for (var i = obj.upLeft.i; i <= obj.downRight.i; i++) {
        for (var j = obj.upLeft.j; j <= obj.downRight.j; j++) {
            var elCell = document.querySelector(`.cell-${i}-${j} span`);
            if (elCell.classList.contains("hidden")) {
                elCell.classList.toggle("hidden");
                returnToHidden(elCell,2000);
                if (!gBoard[i][j].minesAroundCount) {
                    document.querySelector(`.cell-${i}-${j}`).classList.toggle("shownCell");
                    concealCell(document.querySelector(`.cell-${i}-${j}`));
                }

            }
        }
    }
    gGame.megaHint.isMegaHint = -1;
    document.querySelector(".megaHint").classList.toggle("activeBtn");
    document.querySelector(".megaHitAval").innerText = 'used';


}

function darkMode() {
    document.querySelector("body").classList.toggle("dark");
}

function localStorageToString(storage) {
    var scoreStr;
    var scoreArr;
    scoreArr = storage.split(' seconds\n')
    if (scoreArr.length === 2) scoreArr.pop()
    scoreArr.sort(function (a, b) {
        return parseInt(a) - parseInt(b);
    });
    scoreStr = scoreArr.join(' seconds\n');
    if (scoreArr.length === 1) scoreStr += ' seconds\n'

    return scoreStr;
}

function renderLeaderboard() {
    var bestScoreDom = document.querySelector(".bestScores");
    if (gLevel.LEVEL === 1) {
        if (+localStorage.easyScore === Infinity) {
            bestScoreDom.innerText = '';
            return;
        }
        bestScoreDom.innerText = localStorage.easyScore;
    }
    else if (gLevel.LEVEL === 2) {
        if (+localStorage.medScore === Infinity) {
            bestScoreDom.innerText = '';
            return;
        }
        bestScoreDom.innerText = localStorage.medScore;
    }
    else if (gLevel.LEVEL === 3) {
        if (+localStorage.hardScore === Infinity) {
            bestScoreDom.innerText = '';
            return;
        }
        bestScoreDom.innerText = localStorage.hardScore;
    }

    bestScoreDom.innerText += ' seconds!';
}

function setLevel(level) {
    gLevel.SIZE = +level.dataset.size;
    gLevel.LIVES = 3;
    gLevel.LEVEL = +level.dataset.level;
    gLevel.LIVES = +level.dataset.lives;
    initGame();
    gLevel.MINES = +level.dataset.mines;
}
