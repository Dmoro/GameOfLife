let running = true;
run();

async function run() {
  let board = new Board(40);
  board.drawCanvas();

  //Keep running
  for (let turns = 0; ; turns++) {
    await sleep(100);
    if (running) {
      console.log(turns);
      for (let x = 0; x < board.xWidth; x++) {
        for (let y = 0; y < board.yWidth; y++) {
          //game of life
          let neighbors = countNeighbors(board, x, y);
          //kill lonely or overcrowded cells
          if (board.getCell(x, y) === 1 && (neighbors < 2 || neighbors > 3)) {
            board.setCell(x, y, 0);
          }
          //create new cells
          else if (board.getCell(x, y) === 0 && neighbors === 3) {
            board.setCell(x, y, 1);
          }
        }
      }
    }
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function countNeighbors(board, x, y){
  let totalCount = 0
  totalCount += x>0 && y>0 ?  board.getCell(x-1, y-1) : 0; //topleft
  totalCount += y>0 ?  board.getCell(x, y-1) : 0; //top
  totalCount += x<(board.xWidth-1) && y>0 ?  board.getCell(x+1, y-1) : 0; //topRight
  totalCount += x>0 ?  board.getCell(x-1, y) : 0; //left
  totalCount += x<(board.xWidth-1) ?  board.getCell(x+1, y) : 0; //right
  totalCount += x>0 && y<(board.yWidth-1) ? board.getCell(x-1,y+1) : 0; //bottomRight
  totalCount += y<(board.yWidth-1) ?  board.getCell(x,y+1) : 0; //bottom
  totalCount += x<(board.xWidth-1) && y<(board.yWidth-1) ?  board.getCell(x+1,y+1) : 0; //bottomRight
  return totalCount;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function Board (yWidth) {
  this.setupBoard = function() {
    for (let i = 0; i < this.xWidth; i++) {
      let cols = [];
      for (let j = 0; j < this.yWidth; ++j) {
        cols[j] = 0;
      }
      this.board[i] = cols;
    }

    this.randPopulate();
  };

  this.clearBoard = function() {
    for (let x = 0; x < this.xWidth; x++) {
      for (let y = 0; y < this.yWidth; y++) {
        this.setCell(x,y,0);
      }
    }
  }

  this.getCell = function (x, y) {
    return this.board[x][y];
  };

  this.setCell = function (x, y, value) {
    this.board[x][y] = value;
    this.drawCell(x,y,value)
  };

  this.drawCell = function(x, y, val){
    if(val === 1) this.cvs.fillStyle="#ff0008";
    else this.cvs.fillStyle="#000000";
    this.cvs.fillRect((x * this.cellWidth) + 1, (y * this.cellHeight ) + 1, this.cellWidth - 2, this.cellHeight - 2);
  };

  this.drawCanvas = function(){
   for(let i = 0; i < this.xWidth; i++) {
      for(let j = 0; j < this.yWidth; j++) {
        this.drawCell(i, j, this.getCell(i,j))
      }
    }
  };

  this.getMousePos = function (evt) {
    let rect = this.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  this.randPopulate = function() {
    //set random start cells
    let startCells = (this.xWidth*this.yWidth)/10;
    for (let i = 0; i < startCells; i++) {
      this.setCell(getRandomInt(this.xWidth-1), getRandomInt(this.yWidth-1), 1)
    }
  }

  this.canvas = document.getElementById("myCanvas");
  this.cvs = this.canvas.getContext("2d");
  this.board = [];

  this.cvs.canvas.height = window.innerHeight - 20;
  this.cvs.canvas.width = window.innerWidth - 20;
  this.yWidth = yWidth;
  this.cellHeight = this.cvs.canvas.height / this.yWidth;
  // noinspection JSSuspiciousNameCombination
  this.cellWidth = this.cellHeight;
  this.xWidth = Math.trunc(this.cvs.canvas.width / this.cellWidth);
  let self = this;

  //Handle mouse events
  this.canvas.addEventListener('mousemove', function(evt) {
    if(self.mouseDown){
      let mousePos = self.getMousePos(evt);
      let xCell = Math.trunc(mousePos.x / self.cellWidth);
      let yCell = Math.trunc(mousePos.y / self.cellHeight);
      self.setCell(xCell, yCell, 1);
    }
  }, false);

  this.canvas.onmousedown = function(e) {
    self.mouseDown = true;
    running = false;
    console.log("mouse down");
  };
  this.canvas.onmouseup = function(e) {
    self.mouseDown = false;
    running = true;
    console.log("mouse up");
  };

  document.body.onkeyup = function(e){
    switch(e.key){
      case " ":
        if(running) running = false;
        else running = true;
        break;

      case "c":
        self.clearBoard();
        break;

      case "p":
        self.randPopulate();
        break;

      default:
        return;
    }
  };

  this.setupBoard();
}




