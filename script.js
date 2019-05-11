
var uiController = (function() {

  var DOMstrings = {
    GameBoard: 'GameBoard',
    btnReset: 'btnReset',
    txtResult: 'txtResult',
    playerCell: 'playerCell',
    computerCell: 'computerCell',
    emptyCell: 'emptyCell'
  };

  var getCurrentPlayerToken = function(isPlayer) {
    if (isPlayer) {
      return DOMstrings.playerCell;
    } else {
      return DOMstrings.computerCell;
    }
  };

  return {

    appendPieceToCell: function(isPlayer, cellId) {

      if (cellId != null) {
        var playerToken = getCurrentPlayerToken(isPlayer);

        document.getElementById(cellId).classList.remove(DOMstrings.emptyCell);
        document.getElementById(cellId).classList.add(playerToken);
      }
    },

    isEmptyCell: function(cellId) {
      return $("#" + cellId).hasClass(DOMstrings.emptyCell);
    },

    displayText: function(textToDisplay) {

      var txtResult = document.getElementById(DOMstrings.txtResult);

      $(txtResult).removeClass();

      if (textToDisplay == 'Player wins') {
        txtResult.classList.add('text-success');
      } else if (textToDisplay == 'Computer wins') {
        txtResult.classList.add('text-danger');
      } else {
        txtResult.classList.add('text-warning');
      }

      txtResult.innerHTML = textToDisplay;
    },

    resetGameBoard: function() {
      var tableCells = document.getElementsByTagName("td");

      for(var i = 0; i < tableCells.length; i++){
        tableCells[i].classList.remove(DOMstrings.playerCell);
        tableCells[i].classList.remove(DOMstrings.computerCell);

        tableCells[i].classList.add(DOMstrings.emptyCell);
      }
    },

    getPopulatedCells: function(isPlayer) {

      if (isPlayer) {
        return document.getElementsByClassName(DOMstrings.playerCell);
      } else {
        return document.getElementsByClassName(DOMstrings.computerCell);
      }
    },

    getDomStrings: function() {
      return DOMstrings;
    }
  };
})();

var gameController = (function() {

  var GameVariables = {
    columns: ['A','B','C'],
    gameOver: 0
  };

  var getRowCells = function(rowIndex) {
    var cellId,
    rowCells = [];

    for (i = 0; i < GameVariables.columns.length; i++) {
      cellId = GameVariables.columns[i] + (rowIndex + 1);
      rowCells.push(cellId);
    }

    return rowCells;
  };

  var getColumnCells = function(columnIndex) {
    var cellId,
    columnCells = [];

    for (x = 0; x < GameVariables.columns.length; x++) {
      cellId = GameVariables.columns[columnIndex] + (x + 1);
      columnCells.push(cellId);
    }

    return columnCells;
  };

  var getDiagonalCells = function(isLeftDiagonal) {
    var cellId,
    diagonalCells = [];

    if (isLeftDiagonal === true) {
      for (x = 0; x < GameVariables.columns.length; x++) {
        cellId = GameVariables.columns[x] + (x + 1);
        diagonalCells.push(cellId);
      }
    } else {
      for (x = 0; x < GameVariables.columns.length; x++) {
        cellId = GameVariables.columns[GameVariables.columns.length - (x + 1)] + (x + 1);
        diagonalCells.push(cellId);
      }
    }

    return diagonalCells;
  };

  var isWinningCellCombination = function(playerCells, cellsToCheck) {
    return cellsToCheck.every(function (value) {
      return (playerCells.indexOf(value) >= 0);
    });
  };

  var getElementArrayIds = function(elemenetArr) {
    var elemenetIdArr = [];

    for (var i = 0; i < elemenetArr.length; i++) {
      elemenetIdArr.push(elemenetArr[i].id);
    }

    return elemenetIdArr;
  };

  var computerBestMove = function(playerCellsArr, computerCellsArr, emptyCellClass, computerCellClass) {
    var bestMove;

    // If player has made 2 or more moves, try to prevent them from winning by blocking them
    if (playerCellsArr.length > 1) {
      bestMove = computerWinningMoveCheck(playerCellsArr, computerCellsArr, emptyCellClass);

      if (bestMove == null) {
        bestMove = blockPlayer(playerCellsArr, computerCellClass);
      }

      if (bestMove == null) {
        bestMove = computerBestAvailableCell(emptyCellClass);
      }
    } else {
      bestMove = computerBestAvailableCell(emptyCellClass);
    }

    return bestMove;
  }

var computerWinningMoveCheck = function(playerCellsArr, computerCellsArr, emptyCellClass) {
    var cellsToCheck = [],
    computerCellIdArr = getElementArrayIds(computerCellsArr);
    availableCellArr = [];

    // Row and Column
    for (var i = 0; i < 2; i++) {
      for (var x = 0; x < GameVariables.columns.length; x++) {

        if (i == 0) {
          cellsToCheck = getRowCells(x);
        } else {
          cellsToCheck = getColumnCells(x);
        }

        availableCellArr = $(cellsToCheck).not(computerCellIdArr).get();

        if (availableCellArr.length == 1) {
        	if (document.getElementById(availableCellArr).classList.contains(emptyCellClass)) {
            return availableCellArr[0];
          }
        }
      }
    }

    // Diagonal
    for (diagonalIndex = 0; diagonalIndex < 2; diagonalIndex++) {

      if (diagonalIndex === 0) {
        cellsToCheck = getDiagonalCells(true);
      } else {
        cellsToCheck = getDiagonalCells(false);
      }

      availableCellArr = $(cellsToCheck).not(computerCellIdArr).get();

      if (availableCellArr.length == 1) {
      	if (document.getElementById(availableCellArr).classList.contains(emptyCellClass)) {
          return availableCellArr[0];
        }
      }
    }
  }

  var computerBestAvailableCell = function(emptyCellClass) {
    var availableCellArr = [];
    var bestMove;

    for (var availableCellIndex = 3; availableCellIndex > 0; availableCellIndex--) {
    	availableCellArr = document.getElementsByClassName(emptyCellClass + ' ' + availableCellIndex);

    	if(availableCellArr.length > 0) {
        return availableCellArr[Math.floor(Math.random()*availableCellArr.length)].id;
      }
  	}
  }

  var blockPlayer = function(playerCells, computerCellClass) {

    // Get winning combinations and check if player has 2 of them, place computer piece in third cell
    var cellsToCheck = [],
    cellsToBlock = [],
    playerCellIds = getElementArrayIds(playerCells);

    // Row and Column
    for (var i = 0; i < 2; i++) {
      for (var x = 0; x < GameVariables.columns.length; x++) {

        if (i == 0) {
          cellsToCheck = getRowCells(x);
        } else {
          cellsToCheck = getColumnCells(x);
        }

        cellsToBlock = $(cellsToCheck).not(playerCellIds).get();

        if (cellsToBlock.length == 1) {
          if (document.getElementById(cellsToBlock[0]).classList.contains(computerCellClass) == false) {
            return cellsToBlock[0]
          }
        }
      }
    }

    // Diagonal
    for (diagonalIndex = 0; diagonalIndex < 2; diagonalIndex++) {

      if (diagonalIndex === 0) {
        cellsToCheck = getDiagonalCells(true);
      } else {
        cellsToCheck = getDiagonalCells(false);
      }

      cellsToBlock = $(cellsToCheck).not(playerCellIds).get();

      if (cellsToBlock.length == 1) {
        if (document.getElementById(cellsToBlock[0]).classList.contains(computerCellClass) == false) {
          return cellsToBlock[0];
        }
      }
    }
  }

  return {

    winCheck: function(playerToken) {

      var playerCells = document.getElementsByClassName(playerToken);
      var playerCellsId = getElementArrayIds(playerCells);
      var cellsToCheck = [];
      var cellId;

      if (playerCellsId.length >= GameVariables.columns.length) {

        // Row and Column
        for (var i = 0; i < 2; i++) {
          for (var x = 0; x < GameVariables.columns.length; x++) {

            if (i == 0) {
              cellsToCheck = getRowCells(x);
            } else {
              cellsToCheck = getColumnCells(x);
            }

            if (isWinningCellCombination(playerCellsId, cellsToCheck)) {
              GameVariables.gameOver = 1;
              return true;
            }
          }
        }

        // Diagonal
        for (diagonalIndex = 0; diagonalIndex < 2; diagonalIndex++) {

          if (diagonalIndex === 0) {
            cellsToCheck = getDiagonalCells(true);
          } else {
            cellsToCheck = getDiagonalCells(false);
          }

          if (isWinningCellCombination(playerCellsId, cellsToCheck)) {
            GameVariables.gameOver = 1;
            return true;
          }
        }
      }

      return false;
    },

    stalemateCheck: function(emptyCellClass) {
      var emptyCells = document.getElementsByClassName(emptyCellClass);

      if (emptyCells.length == 0) {
        GameVariables.gameOver = 1;
        return true;
      } else {
        return false;
      }
    },

    computerMove: function(playerCellsArr, computerCellsArr, emptyCellClass, computerCellClass) {
      return computerBestMove(playerCellsArr, computerCellsArr, emptyCellClass, computerCellClass);
    },

    getGameVariables: function() {
      return GameVariables;
    }
  }
})();

var controller  = (function(gameCtrl, uiCtrl){
  var DOM = uiCtrl.getDomStrings();
  var GameVariables = gameCtrl.getGameVariables();

  var SetUpEventListeners = function() {
    document.getElementById(DOM.GameBoard).addEventListener('click', ctrlPlayerMove);
    document.getElementById(DOM.btnReset).addEventListener('click', ctrlResetGame);
  };

  var ctrlPlayerMove = function(e) {

    if (GameVariables.gameOver == 0) {
      if (uiCtrl.isEmptyCell(e.target.id)) {
        uiCtrl.appendPieceToCell(true, e.target.id);
      } else {
        alert('Invalid move');
        return;
      }

      if (gameCtrl.winCheck(DOM.playerCell)) {
        uiCtrl.displayText('Player wins');
        return;
      }

      if (gameCtrl.stalemateCheck(DOM.emptyCell)) {
        uiCtrl.displayText('Stalemate');
        return;
      }

      var playerCellsArr = uiCtrl.getPopulatedCells(true);
      var computerCellsArr = uiCtrl.getPopulatedCells(false);

      uiCtrl.appendPieceToCell(false, gameCtrl.computerMove(playerCellsArr, computerCellsArr, DOM.emptyCell, DOM.computerCell));

      if (gameCtrl.winCheck(DOM.computerCell)) {
        uiCtrl.displayText('Computer wins');
        return;
      }

      if (gameCtrl.stalemateCheck(DOM.emptyCell)) {
        uiCtrl.displayText('Stalemate');
        return;
      }
    }
  };

  var ctrlResetGame = function() {
    GameVariables.gameOver = 0;

    uiCtrl.resetGameBoard();
    uiCtrl.displayText("");
  };

    return {
      init: function() {
        console.log('Application has started');

        SetUpEventListeners();
      }
    }
})(gameController, uiController);

controller.init();
