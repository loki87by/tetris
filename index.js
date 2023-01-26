import * as CON from "./consts.js";

const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;
const cancelAnimationFrame =
  window.cancelAnimationFrame || window.mozCancelAnimationFrame;
let count = 0;
let score = 0;
let record = 0;
let rowsCounter = 0;
let level = 1;
let difficulty = 10;
let recordOwner = "";
let frame = null;
let gameOver = false;
let isPaused = false;

const player = prompt("Ваше имя", "") || "Безымянный игрок";

if (localStorage.length > 0) {
  record = localStorage.record;
  recordOwner = localStorage.recordOwner;
}

function showScore() {
  const infoDataSelectors = info.querySelectorAll("h3");
  const data = [
    "Уровень: " + level,
    "Очки:   " + score,
    "До конца уровня: " + (difficulty - rowsCounter),
    "Чемпион: " + recordOwner,
    "Рекорд:  " + record,
  ];
  Array.from(infoDataSelectors).forEach((it, ind) => {
    it.textContent = data[ind];
  });
}

CON.setPrestartMarkup();

function getNextFigure() {
  if (CON.figuresSequence.length === 0) {
    CON.generateSequence();
  }
  const name = CON.figuresSequence.pop();
  const matrix = CON.figures[name];
  const column = CON.gameField[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = name === "line" ? -1 : -2;

  return {
    name: name,
    matrix: matrix,
    row: row,
    column: column,
  };
}

let figure = getNextFigure();

function rotate(matrix) {
  const len = matrix.length - 1;
  const result = matrix.map((row, i) =>
    row.map((value, j) => matrix[len - j][i])
  );
  return result;
}

function stoppedAnimation(text) {
  cancelAnimationFrame(frame);
  CON.context.fillStyle = "black";
  CON.context.globalAlpha = 0.75;
  CON.context.fillRect(0, CON.canvas.height / 2 - 30, CON.canvas.width, 60);
  CON.context.globalAlpha = 1;
  CON.context.fillStyle = "white";
  CON.context.font = "36px monospace";
  CON.context.textAlign = "center";
  CON.context.textBaseline = "middle";
  CON.context.fillText(text, CON.canvas.width / 2, CON.canvas.height / 2);
}

function showGameOver() {
  stoppedAnimation("GAME OVER!");
  gameOver = true;
  setTimeout(() => {
    CON.newGameInfo.classList.remove("hidden");
  }, 1500);
  CON.popup.classList.add("show");
}

function figurePlace() {
  for (let row = 0; row < figure.matrix.length; row++) {
    for (let column = 0; column < figure.matrix[row].length; column++) {
      if (figure.matrix[row][column]) {
        if (figure.row + row < 0) {
          return showGameOver();
        }
        CON.gameField[figure.row + row][figure.column + column] = figure.name;
      }
    }
  }

  for (let row = CON.gameField.length - 1; row >= 0; ) {
    if (CON.gameField[row].every((cell) => !!cell)) {
      rowsCounter += 1;
      score += Math.floor(10 * ((level - 1) / 10 + 1));

      if (rowsCounter >= difficulty) {
        level += 1;
        rowsCounter = 0;
        difficulty = Math.ceil(10 - level / 5);
      }

      if (score > record) {
        record = score;
        localStorage.record = record;
        recordOwner = player;
        localStorage.recordOwner = recordOwner;
      }
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < CON.gameField[r].length; c++) {
          CON.gameField[r][c] = CON.gameField[r - 1][c];
        }
      }
    } else {
      row--;
    }
  }
  figure = getNextFigure();
}

function keyHandler(e) {
  if (e.key !== "Enter" && gameOver) return;

  if (e.key === "Escape") {
    isPaused = !isPaused;
    stoppedAnimation("PAUSE");
  }

  if (e.code === "Space" && isPaused) {
    isPaused = !isPaused;
    frame = requestAnimationFrame(loop);
  }

  if (e.key === "Enter" && gameOver) {
    newGame();
    CON.newGameInfo.classList.add("hidden");
  }

  if (!isPaused) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const column =
        e.key === "ArrowLeft" ? figure.column - 1 : figure.column + 1;

      if (CON.isValidMove(figure.matrix, figure.row, column)) {
        figure.column = column;
      }
    }

    if (e.key === "ArrowUp") {
      const matrix = rotate(figure.matrix);

      if (CON.isValidMove(matrix, figure.row, figure.column)) {
        figure.matrix = matrix;
      }
    }

    if (e.key === "ArrowDown") {
      const row = figure.row + 1;

      if (!CON.isValidMove(figure.matrix, row, figure.column)) {
        figure.row = row - 1;
        figurePlace();
        return;
      }
      figure.row = row;
    }
  }
}

function startGame() {
  for (let row = 0; row < 20; row++) {
    for (let column = 0; column < 10; column++) {
      if (CON.gameField[row][column]) {
        const name = CON.gameField[row][column];
        CON.context.fillStyle = CON.colors[name];
        CON.context.fillRect(
          column * CON.grid,
          row * CON.grid,
          CON.grid - 1,
          CON.grid - 1
        );
      }
    }
  }

  if (figure) {
    if (++count > 36 - level) {
      figure.row++;
      count = 0;

      if (!CON.isValidMove(figure.matrix, figure.row, figure.column)) {
        figure.row--;
        figurePlace();
      }
    }

    CON.context.fillStyle = CON.colors[figure.name];

    for (let row = 0; row < figure.matrix.length; row++) {
      for (let column = 0; column < figure.matrix[row].length; column++) {
        if (figure.matrix[row][column]) {
          CON.context.fillRect(
            (figure.column + column) * CON.grid,
            (figure.row + row) * CON.grid,
            CON.grid - 1,
            CON.grid - 1
          );
        }
      }
    }
  }
}

function loop() {
  frame = requestAnimationFrame(loop);
  CON.context.clearRect(0, 0, CON.canvas.width, CON.canvas.height);
  showScore();
  startGame();
}

function newGame() {
  gameOver = !gameOver;
  CON.popup.classList.remove("show");
  CON.setPrestartMarkup();
  startGame();
  count = 0;
  score = 0;
  rowsCounter = 0;
  level = 1;
  difficulty = 10;
  frame = requestAnimationFrame(loop);
}

function restart() {
  newGame();
  CON.newGameInfo.classList.add("hidden");
}

CON.newGameButton.addEventListener("click", restart);
document.addEventListener("keydown", keyHandler);

frame = requestAnimationFrame(loop);
