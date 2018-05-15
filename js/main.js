"use strict";
let game = new Game(100);
game.run();

function Game (speed) {
  this.speed = speed;
  this.running = true;
  this.canvas = new Canvas(100);
  this.currBoard = new Board(this.canvas.xMax, this.canvas.yMax);
  this.currBoard.randPopulate();
  this.canvas.drawBoard(this.currBoard);

  this.gameOfLifeRules = function(board){
    let nextBoard = new Board(this.canvas.xMax, this.canvas.yMax);

    for (let x = 0; x < board.xMax; x++) {
      for (let y = 0; y < board.yMax; y++) {
        //game of life
        let neighbors = board.countNeighbors(x, y);

        if(board.getCell(x,y) === 1) { //live cell
          if (neighbors < 2 || neighbors > 3) { //kill lonely or overcrowded cells
            nextBoard.setCell(x, y, 0);
            this.canvas.drawCell(x,y, 0);
          } else {
            nextBoard.setCell(x, y, 1);
          }
        } else if (board.getCell(x,y) === 0) { //dead cell
          if (neighbors === 3) { //create new cells
            nextBoard.setCell(x, y, 1);
            this.canvas.drawCell(x,y, 1);
          }
        }

      }
    }

    return nextBoard;
  };

  this.run = async function(){
    //Keep running
    // noinspection InfiniteLoopJS
    for (let turns = 0; ; turns++) {
      //get correct time
      let oldTime = new Date().getTime();
      while((oldTime + this.speed) >  new Date().getTime()) { await sleep(1); }
      let dif = new Date().getTime() - (oldTime + this.speed);
      //console.log(`Running ${dif} ms late`)

      //await sleep(this.speed);
      //this.canvas.drawBoard(this.currBoard); Much slower
      if (this.running) {
        //console.log(turns);
        this.currBoard = this.gameOfLifeRules(this.currBoard);
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
  this.NUM_BUTTONS = 3;
  this.BUTTON_HEIGHT = window.innerHeight * 0.1;
  this.BUTTON_WIDTH = (window.innerWidth-100) / this.NUM_BUTTONS;
  this.CELL_COLOR = "#000000";
  this.BACK_COLOR = "#ffffff";
  this.BORDER_WIDTH = 1;

  this.canvas = document.getElementById("myCanvas");
  this.playButton = document.getElementById("playButton");
  this.resetButton = document.getElementById("resetButton");
  this.populateButton = document.getElementById("populateButton");
  this.cvs = this.canvas.getContext("2d");
  this.cvs.canvas.height = window.innerHeight - this.BUTTON_HEIGHT - 20;
  this.cvs.canvas.width = window.innerWidth - 20;
  this.yMax = yMax;
  this.cellHeight = this.cvs.canvas.height / this.yMax;
  this.cellWidth = this.cellHeight;
  this.xMax = Math.trunc(this.cvs.canvas.width / this.cellWidth);
  let self = this;

  //make buttons pretty

  this.playButton.style = `height:${this.BUTTON_HEIGHT}px;width:${this.BUTTON_WIDTH}px`;
  this.resetButton.style = `height:${this.BUTTON_HEIGHT}px;width:${this.BUTTON_WIDTH}px`;
  this.populateButton.style = `height:${this.BUTTON_HEIGHT}px;width:${this.BUTTON_WIDTH}px`;

    this.drawCell = function(x, y, val){
    //draw surrounding square
    this.cvs.fillStyle=self.CELL_COLOR;
    this.cvs.fillRect((x * this.cellWidth), (y * this.cellHeight ), this.cellWidth, this.cellHeight);

    //draw cell
    if(val === 1) {
      this.cvs.fillStyle=self.BACK_COLOR;
      this.cvs.fillRect((x * this.cellWidth) + self.BORDER_WIDTH, (y * this.cellHeight ) + self.BORDER_WIDTH,
                        this.cellWidth - (2* self.BORDER_WIDTH), this.cellHeight - (2* self.BORDER_WIDTH));
    }

  };

  this.drawBoard = function(board){
    //clean squre
    this.cvs.fillStyle=self.CELL_COLOR;
    this.cvs.fillRect(0, 0, this.cvs.canvas.width, this.cvs.canvas.height);

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

  this.getTouchPos = function (evt) {
    if (evt.touches.length > 1) return;

    let rect = this.canvas.getBoundingClientRect();
    return {
      x: evt.changedTouches[0].clientX - rect.left,
      y: evt.changedTouches[0].clientY - rect.top
    };
  };

  //Handle mouse events
  this.canvas.addEventListener('mousemove', function(evt) {
    if(self.mouseDown){
      let mousePos = self.getMousePos(evt);
      let xCell = Math.trunc(mousePos.x / self.cellWidth);
      let yCell = Math.trunc(mousePos.y / self.cellHeight);
      game.currBoard.setCell(xCell, yCell, 1);
      self.drawCell(xCell, yCell, 1);
    }
  }, false);

  this.canvas.addEventListener('touchmove', function(evt) {
    if(self.touchDown){
      let touchPos = self.getTouchPos(evt);
      let xCell = Math.trunc(touchPos.x / self.cellWidth);
      let yCell = Math.trunc(touchPos.y / self.cellHeight);
      game.currBoard.setCell(xCell, yCell, 1);
      self.drawCell(xCell, yCell, 1);
    }
  }, false);

  this.canvas.onmousedown = function(e) {
    self.mouseDown = true;
  };
  this.canvas.onmouseup = function(e) {
    self.mouseDown = false;
  };

  this.canvas.ontouchstart = function(e) {
    self.touchDown = true;
  };
  this.canvas.ontouchend = function(e) {
    self.touchDown = false;
  };

  this.playButton.onclick = function(){
    if(game.running) {
      game.running = false;
      self.playButton.value = "Play"
    } else {
      game.running = true;
      self.playButton.value = "Pause"
    }
  };

  this.resetButton.onclick = function(){
    game.currBoard.clearBoard();
    self.drawBoard(game.currBoard);
  };

  this.populateButton.onclick = function(){
    game.currBoard.randPopulate();
    self.drawBoard(game.currBoard);
  };

  document.body.onkeyup = function(e){
    switch(e.key){
      case " ":
        game.running = !game.running;
        break;

      case "c":
        game.currBoard.clearBoard();
        self.drawBoard(game.currBoard);
        break;

      case "p":
        game.currBoard.randPopulate();
        self.drawBoard(game.currBoard);
        break;

      case "ArrowLeft":
        game.speed += (game.speed / 2);
        console.log("Speed: " + game.speed);
        break;

      case "ArrowRight":
        game.speed -= (game.speed / 2);
        console.log("Speed: " + game.speed);
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




