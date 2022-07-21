'use strict'

const MINE = '💣'
const FLAG = '🚩'
const gBoard = createBoard()
const gLevel = {
    SIZE: 4,
    MINES: 2
}
const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
var gStartTime
var gGameInterval

function createBoard() {
    const board = []
    for (var i = 0; i < 4; i++) {
        board[i] = []
        for (var j = 0; j < 4; j++) {
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
    document.querySelector('.clock').innerText = '0'
    // cancel the right click menu
    window.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < 4; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < 4; j++) {
            const cell = board[i][j]
            // add a cell title 
            const cellTitle = `Cell: ${i}, ${j}`
            // insert classes 
            var className = (cell.isShown) ? 'shown' : ''
            className += (cell.isMarked) ? ' marked' : ''
            className += (cell.isMine) ? ' mine' : ''
            //insert value- mine or minesAroundCount (if isShown = true)
            // if (cell.isMine) var value = MINE
            if (cell.isShown) var value = cell.minesAroundCount
            else if (cell.isMarked) var value = FLAG
            else var value = ''

            strHTML += `\t<td class="cell ${className}" 
                            title="${cellTitle}" 
                            onclick="cellClicked(this, ${i}, ${j})"
                            onmousedown="markedButton(event, this, ${i}, ${j})" >${value}
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elcells = document.querySelector('.board-cells')
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
    document.querySelector('.clock').innerText = displayTime
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
            gGame.markedCount++
            if (checkWin()) {
                gameOver()
                return
            }
        }
        else {
            elCell.innerHTML = ''
            gGame.markedCount--
        }
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var cell = board[i][j]
            cell.minesAroundCount = countMinesNegs(i, j, board)
        }
    }
}


function countMinesNegs(cellI, cellJ, mat) {
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            if (mat[i][j].isMine) neighborsCount++;
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
        elCell.innerHTML = cell.minesAroundCount
        elCell.classList.add('shown')
        gGame.shownCount++
        startGame(cellI, cellJ)
        gGame.isOn = true
        return
    }
    var cell = gBoard[cellI][cellJ]
    if (cell.isMarked) return
    if (cell.isMine) {
        gameOver()
        return
    }
    if (!cell.isMarked) {
        //model
        cell.isShown = true
        //dom
        elCell.innerHTML = cell.minesAroundCount
        elCell.classList.add('shown')
        gGame.shownCount++
    }
    if (checkWin()) gameOver()
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
    }
    else {
        showMines(gBoard)
        console.log('you lose!!!')
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