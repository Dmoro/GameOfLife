"use strict";
let game = new Game(100);
game.run();

function Game (speed) {
  this.speed = speed;
  this.running = true;
  this.canvas = new Canvas(50);
  this.board = new Board(this.canvas.xMax, this.canvas.yMax);
  this.canvas.drawBoard(this.board);

  this.gameOfLifeRules = function(board){
    for (let x = 0; x < board.xMax; x++) {
      for (let y = 0; y < board.yMax; y++) {
        //game of life
        let neighbors = board.countNeighbors(x, y);
        //kill lonely or overcrowded cells
        if (neighbors < 2 || neighbors > 3) {
          board.setCell(x, y, 0);
        }
        //create new cells
        else if (neighbors === 3) {
          board.setCell(x, y, 1);
        }
      }
    }
  };

  this.run = async function(){
    //Keep running
    // noinspection InfiniteLoopJS
    for (let turns = 0; ; turns++) {
      await sleep(this.speed);
      this.canvas.drawBoard(this.board);
      if (this.running) {
        console.log(turns);
        this.gameOfLifeRules(this.board);
      }
    }
  };
}

function Board (xMax, yMax) {
  this.setupBoard = function() {
    for (let i = 0; i < this.xMax; i++) {
      let cols = [];
      for (let j = 0; j < this.yMax; ++j) {
        cols[j] = 0;
      }
      this.board[i] = cols;
    }

    this.randPopulate();
  };

  this.clearBoard = function() {
    for (let x = 0; x < this.xMax; x++) {
      for (let y = 0; y < this.yMax; y++) {
        this.setCell(x,y,0);
      }
    }
  };

  this.getCell = function (x, y) {
    return this.board[x][y];
  };

  this.setCell = function (x, y, value) {
    this.board[x][y] = value;
  };

  this.countNeighbors = function(x, y){
    let totalCount = 0;
    totalCount += x>0 && y>0 ?  this.getCell(x-1, y-1) : 0; //topleft
    totalCount += y>0 ?  this.getCell(x, y-1) : 0; //top
    totalCount += x<(this.xMax-1) && y>0 ?  this.getCell(x+1, y-1) : 0; //topRight
    totalCount += x>0 ?  this.getCell(x-1, y) : 0; //left
    totalCount += x<(this.xMax-1) ?  this.getCell(x+1, y) : 0; //right
    totalCount += x>0 && y<(this.yMax-1) ? this.getCell(x-1,y+1) : 0; //bottomRight
    totalCount += y<(this.yMax-1) ?  this.getCell(x,y+1) : 0; //bottom
    totalCount += x<(this.xMax-1) && y<(this.yMax-1) ?  this.getCell(x+1,y+1) : 0; //bottomRight
    return totalCount;
  };

  this.randPopulate = function() {
    //set random start cells
    let startCells = (this.xMax*this.yMax)/10;
    for (let i = 0; i < startCells; i++) {
      this.setCell(getRandomInt(this.xMax-1), getRandomInt(this.yMax-1), 1)
    }
  };

  this.xMax = xMax;
  this.yMax = yMax;
  this.board = [];
  this.setupBoard();
}

function Canvas (yMax) {
  this.canvas = document.getElementById("myCanvas");
  this.cvs = this.canvas.getContext("2d");
  this.cvs.canvas.height = window.innerHeight - 20;
  this.cvs.canvas.width = window.innerWidth - 20;
  this.yMax = yMax;
  this.cellHeight = this.cvs.canvas.height / this.yMax;
  this.cellWidth = this.cellHeight;
  this.xMax = Math.trunc(this.cvs.canvas.width / this.cellWidth);
  let self = this;

  this.drawCell = function(x, y, val){
    //draw surrounding white square
    this.cvs.fillStyle="#ffffff";
    this.cvs.fillRect((x * this.cellWidth), (y * this.cellHeight ), this.cellWidth, this.cellHeight);

    //draw cell
    if(val === 1) this.cvs.fillStyle="#000000";
    else if (val === 0) this.cvs.fillStyle="#ffffff";
    this.cvs.fillRect((x * this.cellWidth) + 1, (y * this.cellHeight ) + 1, this.cellWidth - 2, this.cellHeight - 2);
  };

  this.drawBoard = function(board){
    for(let i = 0; i < board.xMax; i++) {
      for(let j = 0; j < board.yMax; j++) {
        this.drawCell(i, j, board.getCell(i,j))
      }
    }
  };

  this.getMousePos = function (evt) {
    let rect = this.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  };

  //Handle mouse events
  this.canvas.addEventListener('mousemove', function(evt) {
    if(self.mouseDown){
      let mousePos = self.getMousePos(evt);
      let xCell = Math.trunc(mousePos.x / self.cellWidth);
      let yCell = Math.trunc(mousePos.y / self.cellHeight);
      game.board.setCell(xCell, yCell, 1);
    }
  }, false);

  this.canvas.onmousedown = function(e) {
    self.mouseDown = true;
    //running = false;
    console.log("mouse down");
  };
  this.canvas.onmouseup = function(e) {
    self.mouseDown = false;
    //running = true;
    console.log("mouse up");
  };

  document.body.onkeyup = function(e){
    switch(e.key){
      case " ":
        game.running = !game.running;
        break;

      case "c":
        game.board.clearBoard();
        break;

      case "p":
        game.board.randPopulate();
        break;

      case "ArrowLeft":
        game.speed += 100;
        break;

      case "ArrowRight":
        game.speed -= 100;
        break;

      default:
        return;
    }
  };
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}




