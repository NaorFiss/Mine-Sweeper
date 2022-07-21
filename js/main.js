'use strict'

const MINE = '💣'
const FLAG = '🚩'
const msg = 'you clicked a 💣 be carefully!!!'
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gBoard = createBoard()

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3
}
var gStartTime
var gGameInterval

function setLevel(level) {
    if (gGame.isOn) return
    switch (level) {
        case 1:
            gLevel.SIZE = 4
            gLevel.MINES = 2
            gBoard = createBoard()
            renderBoard(gBoard)
            break;
        case 2:
            gLevel.SIZE = 8
            gLevel.MINES = 12
            gBoard = createBoard()
            renderBoard(gBoard)
            break;
        case 3:
            gLevel.SIZE = 12
            gLevel.MINES = 30
            gBoard = createBoard()
            renderBoard(gBoard)
            break;
    }
}

function createBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false

            }
            board[i][j] = cell
        }
    }
    return board
}

function initGame() {
    // gBoard = createBoard()
    renderBoard(gBoard)
    document.querySelector('.clock').innerText = ' Time: 0'
    // cancel the right click menu
    window.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);
}

function newGame() {
    if ((gGame.lives === 0) || checkWin()) {
        gBoard = createBoard()
        gGame = {
            isOn: false,
            shownCount: 0,
            markedCount: 0,
            secsPassed: 0,
            lives: 3
        }
        initGame()
        var elImg = document.querySelector('img')
        elImg.src = `img/normal.jpg`
        document.querySelector(' h2').innerText = 'Lives Left: ' + gGame.lives


    }
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = board[i][j]
            // add a cell Id 
            var tdId = `cell-${i}-${j}`
            // insert classes
            var className = (cell.isShown) ? 'shown' : ''
            className += (cell.isMarked) ? ' marked' : ''
            className += (cell.isMine) ? ' mine' : ''
            //insert value- mine or minesAroundCount (if isShown = true)
            // if (cell.isMine) var value = MINE
            if (cell.isShown && (cell.minesAroundCount != 0)) var value = cell.minesAroundCount
            else if (cell.isMarked) var value = FLAG
            else var value = ''
            strHTML += `\t<td class="cell ${className}" 
                            id = "${tdId}"
                            onclick="cellClicked(this, ${i}, ${j})"
                            onmousedown="markedButton(event, this, ${i}, ${j})" >${value}
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }
    var elcells = document.querySelector('.board-cells')
    elcells.innerHTML = strHTML
}

function startGame(cellI, cellJ) {
    setMinesLocation(cellI, cellJ, gBoard)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
    startTimer()
}

function setTimer() {
    var diffTime = (Date.now() - gStartTime) / 1000
    var displayTime = diffTime.toFixed(0)
    document.querySelector('.clock').innerText = 'Time: ' + displayTime
    gGame.secsPassed = displayTime

}

function startTimer() {
    gStartTime = Date.now()
    gGameInterval = setInterval(setTimer, 1000)


}

function pauseTimer() {

    clearInterval(gGameInterval);
    gGameInterval = null; //clean myInterval


}

// called when the right click on and marked/unmarked
function markedButton(event, elCell, cellI, cellJ) {
    var ev = event.buttons
    if (ev === 2) {
        var cell = gBoard[cellI][cellJ]
        //model
        cell.isMarked = !cell.isMarked
        //dom
        if (cell.isMarked) {
            elCell.innerHTML = FLAG
            elCell.classList.add('marked')
            gGame.markedCount++
            if (checkWin()) {
                gameOver()
                return
            }
        }
        else {
            elCell.innerHTML = ''
            elCell.classList.remove('marked')
            gGame.markedCount--
        }
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j]
            cell.minesAroundCount = countMinesNegs(i, j, board)
        }
    }
}


function countMinesNegs(cellI, cellJ, board) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}

function cellClicked(elCell, cellI, cellJ) {
    //if it is the first click then we set the mines and count the neighbors
    if (!gGame.isOn) {
        var cell = gBoard[cellI][cellJ]
        //model
        cell.isShown = true
        //dom
        if (cell.minesAroundCount != 0) {
            elCell.innerHTML = cell.minesAroundCount
        }
        elCell.classList.add('shown')
        gGame.shownCount++
        startGame(cellI, cellJ)
        if (cell.minesAroundCount === 0)
            expandShown(cellI, cellJ)
        gGame.isOn = true
        return
    }
    var cell = gBoard[cellI][cellJ]
    if (cell.isMarked) return
    if (cell.isMine) {
        if (gGame.lives === 1) {
            gGame.lives--
            document.querySelector(' h2').innerText = 'Lives Left: ' + gGame.lives
            gameOver()
            return
        }
        gGame.lives--
        flashMsg(msg)
        document.querySelector(' h2').innerText = 'Lives Left: ' + gGame.lives
        return
    }
    if (!cell.isShown) {
        //model
        cell.isShown = true
        //dom
        if (cell.minesAroundCount != 0) {
            elCell.innerHTML = cell.minesAroundCount
        }
        elCell.classList.add('shown')
        gGame.shownCount++
    }
    if (checkWin()) gameOver()
    if (cell.minesAroundCount === 0)
        expandShown(cellI, cellJ)
}

function expandShown(cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard[i].length) continue
            var cell = gBoard[i][j]
            if (!cell.isShown) {
                //model
                cell.isShown = true
                //dom
                var elCell = document.querySelector(`#cell-${i}-${j}`)
                if (cell.minesAroundCount != 0) {
                    elCell.innerHTML = cell.minesAroundCount
                }
                elCell.classList.add('shown')
                gGame.shownCount++
            }
            if (checkWin()) gameOver()
        }
    }


}

function expandShownBonus(cellI, cellJ) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= gBoard[i].length) continue

            var cell = gBoard[i][j]
            if (!cell.isShown) {
                //model
                cell.isShown = true
                //dom
                var elCell = document.querySelector(`#cell-${i}-${j}`)
                if (cell.minesAroundCount != 0) {
                    elCell.innerHTML = cell.minesAroundCount
                }
                elCell.classList.add('shown')
                gGame.shownCount++
            }
            if (checkWin()) gameOver()
            if (countMinesNegs(cellI, cellJ, gBoard) != 0) return
            expandShownBonus(i, j)
        }
    }


}

//chose random cells for the mines and Updating and Model
function setMinesLocation(cellI, cellJ, board) {
    var emptyCells = getEmptyCells(board)
    for (var i = 0; i < gLevel.MINES; i++) {
        var index = getRandomInt(0, emptyCells.length)
        var idxCell = emptyCells[index]
        //check if idxCell is the first cell the user clicked 
        if (idxCell.i === cellI || idxCell.j === cellJ) {
            emptyCells.splice(index, 1)
            index = getRandomInt(0, emptyCells.length)
            idxCell = emptyCells[index]

        }
        board[idxCell.i][idxCell.j].isMine = true
        emptyCells.splice(index, 1)
        console.log('idxCell: ', idxCell)
    }
}

//WIN: all the mines are flagged, and all the other cells are shown
function checkWin() {
    var numOfCells = gLevel.SIZE * gLevel.SIZE
    // check if all mines are marked
    var isMarkedMines = (gLevel.MINES === gGame.markedCount)
    // check if all the rest cells are show
    var isShowCells = ((numOfCells - gGame.markedCount) === gGame.shownCount)
    return (isMarkedMines && isShowCells)
}

function gameOver() {
    pauseTimer()
    if (checkWin()) {
        console.log('you won!!!')
        var elImg = document.querySelector('img')
        elImg.src = `img/win.jpg`
    }
    else {
        showMines(gBoard)
        console.log('you lose!!!')
        var elImg = document.querySelector('img')
        elImg.src = `img/lose.jpg`
    }
}

function showMines(board) {
    var mines = document.querySelectorAll('.mine')
    for (var i = 0; i < mines.length; i++) {
        mines[i].innerHTML = MINE
        mines[i].classList.add('shown')
    }
}

// finds all the empty cells in gBoard after first user chosen
function getEmptyCells(board) {
    // console.log('getEmptyCells-board: ', board)
    var emptyCells = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = board[i][j]
            if (!cell.isShown) emptyCells.push({ i, j })
        }
    }
    return emptyCells
}

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min) + min)
}

function flashMsg(msg) {
    var elUserMsg = document.querySelector('.user-msg')
    elUserMsg.innerText = msg
    elUserMsg.hidden = false
    setTimeout(() => {
        elUserMsg.hidden = true
    }, 2250)
}
