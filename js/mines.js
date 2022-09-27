
function revealMines() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) {
                document.querySelector(`.cell-${i}-${j} span`).classList.remove("hidden");
            }
            if(gBoard[i][j].isMarked){
                var image = document.querySelector(`.cell-${i}-${j} img`)
                image.parentNode.removeChild(image);
            }
        }
    }
}

function placeMines(i, j) {
    var randI;
    var randJ;
    var currCell;
    var counter = gLevel.MINES;
    while (counter) {
        randI = getRandomIntInclusive(0, gLevel.SIZE - 1);
        randJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
        currCell = gBoard[randI][randJ];
        if ((randI === i && randJ === j) || currCell.isMine === true) continue;
        currCell.isMine = true;
        document.querySelector(`.cell-${randI}-${randJ} span`).innerHTML = MINE;
        counter--;
    }
}

function manualMines() {
    if (gGame.shownCount || gGame.isSevenBoom) initGame();
    gGame.manualMines.manualMinesMode = true;
    if (gGame.manualMines.placeMines) {
        var minesArr = gGame.manualMines.minesArr;
        for (var i = 0; i < minesArr.length; i++) {
            document.querySelector(`.cell-${minesArr[i].i}-${minesArr[i].j} span`).classList.toggle("hidden");
        }
        gLevel.MINES = gGame.manualMines.minesArr.length;
        gGame.manualMines.minesArr = [];
    }
    gGame.manualMines.placeMines = !gGame.manualMines.placeMines;
    gGame.isSevenBoom = false;
    gGame.hints.isHintMode = false;
    
    document.querySelector(".manualMinesBtn").classList.toggle("activeBtn");
    document.querySelector(".manualMinesDescription").innerText = gGame.manualMines.placeMines ?
        'place mines and click again to start' : '';

}

function manualPlaceMine(i, j) {
    if (gLevel.MINES) gLevel.MINES = 0;
    gBoard[i][j].isMine = !gBoard[i][j].isMine;
    if (gBoard[i][j].isMine) {
        document.querySelector(`.cell-${i}-${j} span`).innerHTML = MINE;
        gGame.manualMines.minesArr.push({ i: i, j: j });
    } else {
        var mineIdx =  gGame.manualMines.minesArr.findIndex(obj => obj.i === i && obj.j === j);
        gGame.manualMines.minesArr.splice(mineIdx,1);
    }
    document.querySelector(`.cell-${i}-${j} span`).classList.toggle("hidden");

}

function sevenBoom() {
    initGame()
    gGame.isSevenBoom = true;
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cellIdx = document.querySelector(`.cell-${i}-${j}`).dataset.idx;
            if (!(cellIdx % 7) || !((cellIdx - 7) % 10)) {
                gBoard[i][j].isMine = true;
                document.querySelector(`.cell-${i}-${j} span`).innerHTML = MINE;
            }

        }
    }

}

function onExterminatorClick() {
    if (!gLevel.MINES || gGame.manualMines.placeMines) return;
    var minesArr = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine) {
                minesArr.push({ i: i, j: j });
            }
        }
    }
    gLevel.MINES = minesArr.length
    //change name.
    for (var i = 0; i < 3 && minesArr.length; i++) {
        var exterminatedMine = minesArr.splice(getRandomIntInclusive(0, minesArr.length - 1), 1)[0];
        gBoard[exterminatedMine.i][exterminatedMine.j].isMine = false;
    }
    var elExterP = document.querySelector(".exterP")
    elExterP.innerText = 'BOOM!';
    setTimeout(() => elExterP.innerText = '', 2000);
    setMinesNegsCount();

}
