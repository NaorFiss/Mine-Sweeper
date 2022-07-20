'use strict'


const MINE = '😷'
const gBoard = createBoard()

var gLevel = {
    SIZE: 4,
    MINES: 2
}


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function initGame() {
    renderBoard()
}

function createBoard() {
    const board = []
    for (var i = 0; i < 4; i++) {
        board[i] = []
        for (var j = 0; j < 4; j++) {
            const cell = {
                minesAroundCount: 0,
                isShown: true,
                isMine: false,
                isMarked: false

            }
            board[i][j] = cell

        }

    }
    board[2][1].isMine = true
    board[3][3].isMine = true
    return board
}


function renderBoard() {
    var strHTML = ''
    for (var i = 0; i < 4; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < 4; j++) {
            const cell = gBoard[i][j]
            cell.minesAroundCount = countMinesNeighbors(i, j, gBoard)

            // add a cell title 
            const cellTitle = `Cell: ${i}, ${j}`
            // for cell of type SEAT add seat class
            // for cell that is booked add booked class
            var className = (cell.isShown) ? 'shown' : ''
            className += (cell.isMarked) ? ' marked' : ''
            className += (cell.isMine) ? ' mine' : ''
            var value = (cell.isMine) ? MINE : cell.minesAroundCount

            strHTML += `\t<td class="cell ${className}" 
                            title="${cellTitle}" 
                            onclick="cellClicked(this, ${i}, ${j})" >${value}
                         </td>\n`
        }
        strHTML += `</tr>\n`
    }
    const elcells = document.querySelector('.board-cells')
    elcells.innerHTML = strHTML
}


function countMinesNeighbors(cellI, cellJ, mat) {
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
console.log('countMinesNeighbors ' + countMinesNeighbors(2, 2, gBoard))
console.log('countMinesNeighbors ' + countMinesNeighbors(1, 1, gBoard))
console.log('countMinesNeighbors ' + countMinesNeighbors(0, 1, gBoard))

// function renderMine(location, value) {
//     // Select the elCell and set the value
//     const elCell = document.querySelector(`.mine-${location.i}-${location.j}`)
//     elCell.innerHTML = value
// }