export const canvas = document.getElementById("board");
const info = document.getElementById("info");
export const context = canvas.getContext("2d");
export const newGameInfo = document.getElementById("new-game");
export const popup = document.getElementById("popup");
export const newGameButton = document.querySelector(".restart");
export const grid = 32;
export const figuresSequence = [];
export const gameField = [];

export function setPrestartMarkup() {
  for (let i = -2; i < 20; i++) {
    gameField[i] = [];

    for (let j = 0; j < 10; j++) {
      gameField[i][j] = 0;
    }
  }
}

export const figures = {
  line: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  leftGun: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  rightGun: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  square: [
    [1, 1],
    [1, 1],
  ],
  leftLightning: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  rightLightning: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  triangle: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export const colors = {
  leftGun: "red",
  leftLightning: "orange",
  line: "yellow",
  rightGun: "green",
  rightLightning: "cyan",
  square: "blue",
  triangle: "purple",
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSequence() {
  const sequence = [
    "line",
    "leftGun",
    "rightGun",
    "square",
    "leftLightning",
    "triangle",
    "rightLightning",
  ];

  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const nextFigure = sequence.splice(rand, 1)[0];
    figuresSequence.push(nextFigure);
  }
}

export function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let column = 0; column < matrix[row].length; column++) {
      if (
        matrix[row][column] &&
        (cellCol + column < 0 ||
          cellCol + column >= gameField[0].length ||
          cellRow + row >= gameField.length ||
          gameField[cellRow + row][cellCol + column])
      ) {
        return false;
      }
    }
  }

  return true;
}
