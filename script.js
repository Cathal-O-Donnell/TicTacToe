// Global variables
const columns = ["A", "B", "C"];
var gameOver = 0;

$("#GameBoard").on("click", "td", function(e) {

  if (gameOver == 0) {
    if (ValidateMove(e.target.id)) {
        AppendPieceToCell(true, e.target.id);
    } else {
      alert('Invalid move');
      return;
    }

    if (WinCheck(true)) {
      DisplayResult('Player wins');
      return;
    }

    if (StaleMateCheck()) {
      DisplayResult('Stalemate');
      return;
    }

    ComputerMove();
  }
});

function DisplayResult(resultText) {
  var txtResult = document.getElementById('txtResult');

  $(txtResult).removeClass();

  if (resultText == 'Player wins') {
    txtResult.classList.add('text-success');
  } else if (resultText == 'Computer wins') {
    txtResult.classList.add('text-danger');
  } else {
    txtResult.classList.add('text-warning');
  }

  txtResult.innerHTML = resultText;
}

function ResetGame() {
  var tableCells = document.getElementsByTagName("td");

  for(var i = 0; i < tableCells.length; i++){
    tableCells[i].classList.remove('playerCell');
    tableCells[i].classList.remove('computerCell');

    tableCells[i].classList.add('emptyCell');
  }

  document.getElementById('txtResult').innerHTML = "";
  gameOver = 0;
}

function ValidateMove(cellId) {
  return $("#" + cellId).hasClass("emptyCell");
}

function AppendPieceToCell(isPlayer, cellId) {

  if (cellId != null) {
    var tokenToPlace = GetCurrentPlayerToken(isPlayer);

    document.getElementById(cellId).classList.remove('emptyCell');
    document.getElementById(cellId).classList.add(tokenToPlace);
  }
}

function GetCurrentPlayerToken(isPlayer) {

  if (isPlayer === true) {
    return "playerCell";
  } else {
    return "computerCell";
  }
}

function WinCheck(isPlayer) {
  var playerToken = GetCurrentPlayerToken(isPlayer);
  var playerCells = document.getElementsByClassName(playerToken);
  var playerCellsId = GetElementArrayIds(playerCells);
  var cellsToCheck = [];
  var cellId;

  if (playerCellsId.length >= columns.length) {

    // Row and Column
    for (var i = 0; i < 2; i++) {
      for (var x = 0; x < columns.length; x++) {

        if (i == 0) {
          cellsToCheck = GetRowCells(x);
        } else {
          cellsToCheck = GetColumnCells(x);
        }

        if (IsWinningCellCombination(playerCellsId, cellsToCheck)) {
          gameOver = 1;
          return true;
        }
      }
    }

    // Diagonal
    for (diagonalIndex = 0; diagonalIndex < 2; diagonalIndex++) {

      if (diagonalIndex === 0) {
        cellsToCheck = GetDiagonalCells(true);
      } else {
        cellsToCheck = GetDiagonalCells(false);
      }

      if (IsWinningCellCombination(playerCellsId, cellsToCheck)) {
        gameOver = 1;
        return true;
      }
    }
  }

  return false;
}

function IsWinningCellCombination(playerCells, cellsToCheck) {
  return cellsToCheck.every(function (value) {
    return (playerCells.indexOf(value) >= 0);
  });
}

function GetRowCells(rowIndex) {
  var cellId,
  rowCells = [];

  for (i = 0; i < columns.length; i++) {
    cellId = columns[i] + (rowIndex + 1);
    rowCells.push(cellId);
  }

  return rowCells;
}

function GetColumnCells(columnIndex) {
  var cellId,
  columnCells = [];

  for (x = 0; x < columns.length; x++) {
    cellId = columns[columnIndex] + (x + 1);
    columnCells.push(cellId);
  }

  return columnCells;
}

function GetDiagonalCells(isLeftDiagonal) {
  var cellId,
  diagonalCells = [];

  if (isLeftDiagonal === true) {
    for (x = 0; x < columns.length; x++) {
      cellId = columns[x] + (x + 1);
      diagonalCells.push(cellId);
    }
  } else {
    for (x = 0; x < columns.length; x++) {
      cellId = columns[columns.length - (x + 1)] + (x + 1);
      diagonalCells.push(cellId);
    }
  }

  return diagonalCells;
}

function StaleMateCheck() {
  var emptyCells = document.getElementsByClassName('emptyCell');

  if (emptyCells.length == 0) {
    gameOver = 1;
    return true;
  } else {
    return false;
  }
}

function ComputerMove() {

  // Make computer move
  AppendPieceToCell(false, ComputerBestMove());

  if (WinCheck(false)) {
    DisplayResult('Computer wins');
    return;
  }

  if (StaleMateCheck()) {
    DisplayResult('Stalemate');
    return;
  }
}

function ComputerBestMove() {
  var playerCells = document.getElementsByClassName('playerCell');

  // If player has made 2 or more moves, try to prevent them from winning by blocking them
  if (playerCells.length > 1) {
    ComputerWinningMoveCheck(playerCells);
  } else {
    ComputerBestAvailableCell();
  }
}

function GetElementArrayIds(elemenetArr) {
  var elemenetIdArr = [];

  for (var i = 0; i < elemenetArr.length; i++) {
    elemenetIdArr.push(elemenetArr[i].id);
  }

  return elemenetIdArr;
}

function ComputerWinningMoveCheck(playerCells) {
  var computerCells = document.getElementsByClassName('computerCell');
  var cellsToCheck = [],
  computerCellIds = GetElementArrayIds(computerCells);
  availableCells = [];

  // Row and Column
  for (var i = 0; i < 2; i++) {
    for (var x = 0; x < columns.length; x++) {

      if (i == 0) {
        cellsToCheck = GetRowCells(x);
      } else {
        cellsToCheck = GetColumnCells(x);
      }

      availableCells = $(cellsToCheck).not(computerCellIds).get();

      if (availableCells.length == 1) {
      	if (document.getElementById(availableCells).classList.contains('emptyCell')) {
          AppendPieceToCell(false, availableCells[0]);
          return;
        }
      }
    }
  }

  // Diagonal
  for (diagonalIndex = 0; diagonalIndex < 2; diagonalIndex++) {

    if (diagonalIndex === 0) {
      cellsToCheck = GetDiagonalCells(true);
    } else {
      cellsToCheck = GetDiagonalCells(false);
    }

    availableCells = $(cellsToCheck).not(computerCellIds).get();

    if (availableCells.length == 1) {
    	if (document.getElementById(availableCells).classList.contains('emptyCell')) {
        AppendPieceToCell(false, availableCells[0]);
        return;
      }
    }
  }

  // No winning moves for computer, see if any blocks can be made
  BlockPlayer(playerCells);
}

function BlockPlayer(playerCells) {

  // Get winning combinations and check if player has 2 of them, place computer piece in third cell
  var cellsToCheck = [],
  cellsToBlock = [],
  playerCellIds = GetElementArrayIds(playerCells);

  // Row and Column
  for (var i = 0; i < 2; i++) {
    for (var x = 0; x < columns.length; x++) {

      if (i == 0) {
        cellsToCheck = GetRowCells(x);
      } else {
        cellsToCheck = GetColumnCells(x);
      }

      cellsToBlock = $(cellsToCheck).not(playerCellIds).get();

      if (cellsToBlock.length == 1) {
        if (document.getElementById(cellsToBlock[0]).classList.contains('computerCell') == false) {
          AppendPieceToCell(false, cellsToBlock[0]);
          return;
        }
      }
    }
  }

  // Diagonal
  for (diagonalIndex = 0; diagonalIndex < 2; diagonalIndex++) {

    if (diagonalIndex === 0) {
      cellsToCheck = GetDiagonalCells(true);
    } else {
      cellsToCheck = GetDiagonalCells(false);
    }

    cellsToBlock = $(cellsToCheck).not(playerCellIds).get();

    if (cellsToBlock.length == 1) {
      if (document.getElementById(cellsToBlock[0]).classList.contains('computerCell') == false) {
        AppendPieceToCell(false, cellsToBlock[0]);
        return;
      }
    }
  }

  // No blocking move made, place token in best available cell
 ComputerBestAvailableCell();
}

function ComputerBestAvailableCell() {
  var availableCells = [];

  for (var i = 3; i > 0; i--) {
  	availableCells = document.getElementsByClassName('emptyCell ' + i);

  	if(availableCells.length > 0) {
      AppendPieceToCell(false, availableCells[Math.floor(Math.random()*availableCells.length)].id);
      return;
    }
	}
}
