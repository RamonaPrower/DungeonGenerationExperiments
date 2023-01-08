function printToLog(text) {
    const logContainer = document.querySelector('#logContainer');
    logContainer.innerHTML += `${text}<br>`;
    console.log(text);

}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


// This is just for the stupid intellisense
const getCanvasContainer = document.querySelector('#testDiv');
const dungeonCanvas = document.createElement('canvas');
dungeonCanvas.id = 'dungeonCanvas';
dungeonCanvas.width = 1000;
dungeonCanvas.height = 800;
dungeonCanvas.className = 'mx-3';
getCanvasContainer.appendChild(dungeonCanvas);

let redrawBoard = [];
let redrawGridList = [];
let redrawRoomList = [];
let redrawColCount = 0;
let redrawRowCount = 0;
let isRedrawing = false;
let mousePosition = { x: 0, y: 0 };

// if we need to redraw the dungeon, make the default values the same as the last time we generated the dungeon
function redrawDungeon(colCount = redrawColCount, rowCount = redrawRowCount, gridList = redrawGridList, board = redrawBoard, highlight = pointsOfInterest) {
    isRedrawing = true;
    drawBoard(colCount, rowCount, gridList, board, highlight);
    isRedrawing = false;
}

let pointsOfInterest = [];
let connectionCoOrdinates = [];

function generateDungeon() {
    // time how long it takes to generate the dungeon
    const startTime = performance.now();

    const rowCount = document.querySelector('#dungeonRow').value;
    const colCount = document.querySelector('#dungeonCol').value;
    // reset the pointsOfInterest and arrowCoOrdinates
    pointsOfInterest = [];
    connectionCoOrdinates = [];

    printToLog(`Row Count: ${rowCount}`);
    printToLog(`Col Count: ${colCount}`);

    // board is a 2D array, [x][y]

    let board = [...Array(Number(colCount))].map(() => Array(Number(rowCount)));
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            board[i][j] = 0;
        }
    }

    let roomCount = Number(document.querySelector('#dungeonRoom').value);

    // dungeonRoomMinX and dungeonRoomMinY are the minimum size of a room, and dungeonRoomMaxX and dungeonRoomMaxY are the maximum size of a room
    // if the user enters a value that is less than 3, then set it to 3
    // if the user enters a value that is less than the minimum, then set it to the minimum

    const dungeonRoomMinX = Number(document.querySelector('#dungeonRoomMinX').value) > 3 ? Number(document.querySelector('#dungeonRoomMinX').value) : 3;
    const dungeonRoomMinY = Number(document.querySelector('#dungeonRoomMinY').value) > 3 ? Number(document.querySelector('#dungeonRoomMinY').value) : 3;
    const dungeonRoomMaxX = Number(document.querySelector('#dungeonRoomMaxX').value) > dungeonRoomMinX ? Number(document.querySelector('#dungeonRoomMaxX').value) : dungeonRoomMinX;
    const dungeonRoomMaxY = Number(document.querySelector('#dungeonRoomMaxY').value) > dungeonRoomMinY ? Number(document.querySelector('#dungeonRoomMaxY').value) : dungeonRoomMinY;
    // also go back and force the values to what they are now
    document.querySelector('#dungeonRoomMinX').value = dungeonRoomMinX;
    document.querySelector('#dungeonRoomMinY').value = dungeonRoomMinY;
    document.querySelector('#dungeonRoomMaxX').value = dungeonRoomMaxX;
    document.querySelector('#dungeonRoomMaxY').value = dungeonRoomMaxY;


    printToLog(`Room Count: ${roomCount}`);
    printToLog(`Room Min X: ${dungeonRoomMinX}`);
    printToLog(`Room Min Y: ${dungeonRoomMinY}`);
    printToLog(`Room Max X: ${dungeonRoomMaxX}`);
    printToLog(`Room Max Y: ${dungeonRoomMaxY}`);

    const roomList = [];
    const gridList = [];

    // if the roomCount isn't divisible by 2 or 3, then it's not possible to split the board into rooms
    // add 1 to the roomCount until it is divisible by 2 or 3
    while (roomCount % 2 !== 0 && roomCount % 3 !== 0) {
        roomCount++;
    }

    // if the roomCount is divisible by 2
    if (roomCount % 2 === 0) {
        // get the other number that roomCount is divisible by
        const otherDivisor = roomCount / 2;
        printToLog(`Other Number: ${otherDivisor}`);

        // split the board horizontally by two
        const splitRow = Math.floor(rowCount / 2);
        printToLog(`Split Row: ${splitRow}`);
        // split each half vertically by the otherDivisor
        const splitCol = Math.floor(colCount / otherDivisor);
        printToLog(`Split Col: ${splitCol}`);

        // store the gridList
        for (let i = 0; i < otherDivisor; i++) {
            for (let j = 0; j < 2; j++) {
                const grid = {
                    x: i * splitCol,
                    y: j * splitRow,
                    width: splitCol,
                    height: splitRow,
                };
                gridList.push(grid);
            }
        }

    }
    // if it's not divisible by 2, then it's divisible by 3
    else {
        // get the other number that roomCount is divisible by
        const otherDivisor = roomCount / 3;
        printToLog(`Other Number: ${otherDivisor}`);

        // split the board vertically by three
        const splitCol = Math.floor(colCount / 3);
        printToLog(`Split Col: ${splitCol}`);
        // split each half horizontally by the otherDivisor
        const splitRow = Math.floor(rowCount / otherDivisor);
        printToLog(`Split Row: ${splitRow}`);

        // store the gridList
        for (let i = 0; i < otherDivisor; i++) {
            for (let j = 0; j < 3; j++) {
                const grid = {
                    x: j * splitCol,
                    y: i * splitRow,
                    width: splitCol,
                    height: splitRow,
                };
                gridList.push(grid);
            }
        }
    }

    // for each grid, generate a room
    for (let i = 0; i < gridList.length; i++) {
        const grid = gridList[i];
        // make sure the room is within the grid and can fit in the grid
        // if the width or height is too big, then reduce it
        const roomWidth = randomIntFromInterval(dungeonRoomMinX, Math.min(dungeonRoomMaxX, grid.width));
        const roomHeight = randomIntFromInterval(dungeonRoomMinY, Math.min(dungeonRoomMaxY, grid.height));
        const roomX = randomIntFromInterval(grid.x, grid.x + grid.width - roomWidth);
        const roomY = randomIntFromInterval(grid.y, grid.y + grid.height - roomHeight);

        // get xy coordinates for a random point on each side of the room, keeping in bounds
        const roomLeft = {
            x: roomX,
            // avoid the corners
            y: randomIntFromInterval(roomY + 1, roomY + roomHeight - 2),
        };
        const roomRight = {
            x: roomX + roomWidth - 1,
            y: randomIntFromInterval(roomY + 1, roomY + roomHeight - 2),
        };
        const roomTop = {
            x: randomIntFromInterval(roomX + 1, roomX + roomWidth - 2),
            y: roomY,
        };
        const roomBottom = {
            x: randomIntFromInterval(roomX + 1, roomX + roomWidth - 2),
            y: roomY + roomHeight - 1,
        };


        const room = {
            x: roomX,
            y: roomY,
            width: roomWidth,
            height: roomHeight,
            points: {
                left: roomLeft,
                right: roomRight,
                top: roomTop,
                bottom: roomBottom,
            },
            grid: i,
        };
        roomList.push(room);
    }
    printToLog('');
    for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i];
        printToLog(`Room ${i + 1}: ${JSON.stringify(room)}`);
        printToLog('');
    }
    for (let i = 0; i < gridList.length; i++) {
        const grid = gridList[i];
        printToLog(`Grid ${i + 1}: ${JSON.stringify(grid)}`);
        printToLog('');
    }


    // transfer the roomList into the board
    for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i];
        for (let j = room.x; j < room.x + room.width; j++) {
            for (let k = room.y; k < room.y + room.height; k++) {
                // set the board number to whatever grid it's in
                board[j][k] = i + 1;
            }
        }
    }


    // create a list of all the possible connections between adjacent rooms by checking the roomList
    const connectionList = [];
    for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i];
        // loop through each room to see what one is adjacent to it
        for (let j = 0; j < roomList.length; j++) {
            const otherRoom = roomList[j];
            // check if the other room is to the right
            if (otherRoom.x >= room.x + room.width) {
                // make sure both rooms are on the same y level via the gridList
                const grid1 = gridList[room.grid];
                const grid2 = gridList[otherRoom.grid];
                if (grid1.y === grid2.y && grid2.x === grid1.x + grid1.width) {
                    const connection = {
                        room1: roomList[i],
                        room2: roomList[j],
                        isRight: true,
                    };
                    connectionList.push(connection);
                }


            }
            // check if the other room is underneath
            if (otherRoom.y >= room.y + room.height) {
                // make sure both rooms are on the same x level via the gridList
                const grid1 = gridList[room.grid];
                const grid2 = gridList[otherRoom.grid];
                if (grid1.x === grid2.x && grid2.y === grid1.y + grid1.height) {
                    const connection = {
                        room1: roomList[i],
                        room2: roomList[j],
                        isRight: false,
                    };
                    connectionList.push(connection);
                }
            }

        }
    }
    // split the connectionList per connection for debugging
    for (let i = 0; i < connectionList.length; i++) {
        const connection = connectionList[i];
        printToLog(`Connection ${i + 1}: ${JSON.stringify(connection)}`);
        printToLog('');
    }
    // pathfind between each room and update the board with the returned board
    for (let i = 0; i < connectionList.length; i++) {
        const connection = connectionList[i];
        const { newBoard, room1Point, room2Point } = pathFind(board, gridList, connection.room1, connection.room2, connection.isRight);
        // update the board with the returned newBoard
        board = newBoard;
        // for now as well, just add the points to the arrowCoOrdinates array
        connectionCoOrdinates.push({ room1Point, room2Point });
    }

    // cache everything we need to redraw the board
    redrawBoard = board;
    redrawGridList = gridList;
    redrawRoomList = roomList;
    redrawColCount = colCount;
    redrawRowCount = rowCount;

    // end the timer
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    printToLog(`Time taken to generate and connect: ${Math.round(timeTaken)}ms`);

    drawBoard(colCount, rowCount, gridList, board, []);

}

/**
 * A function to draw the board to the canvas
 * @param {Number} colCount the number of columns in the board
 * @param {Number} rowCount the number of rows in the board
 * @param {Array} gridList the list of grids
 * @param {Array} board the board to draw
 * @param {Object[][]} highlight the list of highlighted cells
 */
function drawBoard(colCount, rowCount, gridList, board, highlight) {
    const startTime = performance.now();
    const ctx = dungeonCanvas.getContext('2d');
    // clear the canvas
    ctx.clearRect(0, 0, dungeonCanvas.width, dungeonCanvas.height);

    // background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, dungeonCanvas.width, dungeonCanvas.height);

    // calculate cell size
    const maxCellWidth = dungeonCanvas.width / colCount;
    const maxCellHeight = dungeonCanvas.height / rowCount;
    const cellSize = maxCellHeight > maxCellWidth ? Math.floor(maxCellWidth) : Math.floor(maxCellHeight);
    const winningSize = maxCellHeight > maxCellWidth ? 'Width' : 'Height';

    // if we're re-drawing, don't print to the log
    if (!redrawBoard) {
        printToLog(`Calculated Cell Size: ${cellSize}`);
        printToLog(`${winningSize} Won the draw`);
        printToLog('');
    }

    // draw gridList on top of the background
    const possibleColours = ['rgba(255, 104, 102, 0.5)', 'rgba(76, 87, 255, 0.5)', 'rgba(255, 213, 51, 0.5)', 'rgba(64, 255, 122, 0.5)'];
    for (let i = 0; i < gridList.length; i++) {
        const grid = gridList[i];
        const startPositionX = (cellSize * grid.x);
        const startPositionY = (cellSize * grid.y);
        const width = (cellSize * grid.width);
        const height = (cellSize * grid.height);
        ctx.fillStyle = possibleColours[i % possibleColours.length];
        // take into account the new cell size
        ctx.fillRect(startPositionX, startPositionY, width, height);
        // draw the room number in the middle of the grid in black
        ctx.fillStyle = '#000000';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // if i is a number, add 1 to it, else, just use i
        const toPrint = typeof i === 'number' ? i + 1 : i;
        ctx.fillText(toPrint, startPositionX + (width / 2), startPositionY + (height / 2));
    }
    // draw the board on top of the gridList
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            // if it's a wall, we draw a grey square
            switch (board[i][j]) {
                case 0:
                    ctx.fillStyle = 'rgba(124, 125, 125, 0.5)';
                    break;
                case -1:
                    ctx.fillStyle = 'rgba(225, 226, 227, 0.5)';
                    break;
                // not a number
                case 'T':
                case 'B':
                case 'R':
                case 'L':
                    ctx.fillStyle = 'rgba(142, 182, 223, 0.85)';
                    break;
                case 'S':
                case 'F':
                    ctx.fillStyle = 'rgba(248, 197, 112, 0.85)';
                    break;
                default:
                    ctx.fillStyle = 'rgba(225, 226, 227, 0.85)';
                    break;
            }


            // The spot on the actual Grid
            const rowSlot = i;
            const colSlot = j;
            // we make a 1px border for it
            const startPositionX = (cellSize * rowSlot + 1);
            const startPositionY = (cellSize * colSlot + 1);
            ctx.fillRect(startPositionX, startPositionY, cellSize - 2, cellSize - 2);
            // if it's a room, we draw a number in the middle of it
            if (board[i][j] !== 0) {
                ctx.fillStyle = '#000000';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(board[i][j], startPositionX + (cellSize / 2), startPositionY + (cellSize / 2));
            }
        }
    }
    // get the status of the drawRoomLinks checkbox
    const drawRoomLinks = document.getElementById('drawRoomLinks').checked;
    // if it's checked, we draw the room links
    if (drawRoomLinks) {
        // draw the room links
        for (let i = 0; i < connectionCoOrdinates.length; i++) {
            const point1 = connectionCoOrdinates[i].room1Point;
            const point2 = connectionCoOrdinates[i].room2Point;
            ctx.beginPath();
            ctx.moveTo(point1.x * cellSize + (cellSize / 2), point1.y * cellSize + (cellSize / 2));
            ctx.lineTo(point2.x * cellSize + (cellSize / 2), point2.y * cellSize + (cellSize / 2));
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    // if highlight isn't empty, we draw the highlight
    if (highlight.length > 0) {

        // draw the highlight
        for (let i = 0; i < highlight.length; i++) {
            const row = highlight[i].x;
            const col = highlight[i].y;
            // we make a 1px border for it
            const startPositionX = (cellSize * row + 1);
            const startPositionY = (cellSize * col + 1);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(startPositionX, startPositionY, cellSize - 2, cellSize - 2);

            const popupInfo = [];
            popupInfo.push(`Position: ${row}, ${col}`);
            // if the cell is a room (and is a number), we highlight the whole room
            if (board[row][col] !== 0 && typeof board[row][col] === 'number') {
                // get the room number of the cell
                const roomNumber = board[row][col];
                // add the room number to the popup info
                popupInfo.push(`Room Number: ${roomNumber}`);
                // get all the cells in the room
                const cellsInRoom = getCellsInRoom(roomNumber);
                // highlight all the cells in the room
                for (let j = 0; j < cellsInRoom.length; j++) {
                    const roomRow = cellsInRoom[j].x;
                    const roomCol = cellsInRoom[j].y;
                    // we make a 1px border for it
                    const roomStartPositionX = (cellSize * roomRow + 1);
                    const roomStartPositionY = (cellSize * roomCol + 1);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.fillRect(roomStartPositionX, roomStartPositionY, cellSize - 2, cellSize - 2);
                }
            }
            // if the cell is a connection, we highlight the whole connection
            // we'll need to go through the ArrowCoOrdinates array to find the connection
            if (typeof board[row][col] === 'string') {
                // check if the cell is a connection
                const connection = checkIfConnection(row, col);

                // if it is, we highlight the whole connection
                if (connection) {
                    console.log('found connection');
                    // get the connection points
                    const connectionPoints = getCellsInConnection(row, col);
                    // highlight all the cells in the connection
                    for (let j = 0; j < connectionPoints.length; j++) {
                        const connectionRow = connectionPoints[j].x;
                        const connectionCol = connectionPoints[j].y;
                        // we make a 1px border for it
                        const connectionStartPositionX = (cellSize * connectionRow + 1);
                        const connectionStartPositionY = (cellSize * connectionCol + 1);
                        ctx.fillStyle = 'rgba(130, 250, 121, 0.5)';
                        ctx.fillRect(connectionStartPositionX, connectionStartPositionY, cellSize - 2, cellSize - 2);

                        // add the connection info to the popup
                        const stringBuilder = [];
                        if (j === 0) {
                            stringBuilder.push('Connection: ');
                        }
                        stringBuilder.push(`${connectionPoints[j].x}, ${connectionPoints[j].y}`);
                        popupInfo.push(stringBuilder.join(''));


                    }

                }


            }
            // draw the popup
            drawPopup(popupInfo, ctx);

            // then empty pointsOfInterest
            pointsOfInterest = [];
        }
    }

    // get the end time of the draw function
    const endTime = performance.now();
    const timeToDraw = endTime - startTime;
    // only print if we're not in the middle of a redraw
    if (!isRedrawing) {
        printToLog(`Drawing took ${Math.round(timeToDraw)}ms`);
    }

}

/**
 * Using the redrawRoomlist var, print back an array of all cell numbers in the room
 * @param {number} roomNumber
 * @returns {array}
 *
 */
function getCellsInRoom(roomNumber) {
    // create an array to store the cells in the room
    const cellsInRoom = [];
    // loop through the board
    for (let i = 0; i < redrawBoard.length; i++) {
        for (let j = 0; j < redrawBoard[i].length; j++) {
            // if the cell is the room number, add it to the array
            if (redrawBoard[i][j] === roomNumber) {
                cellsInRoom.push({ x: i, y: j });
            }
        }
    }
    // return the array
    return cellsInRoom;
}

/**
 * Using the connectionCoOrdinates var, print back an array of all cell numbers in the connection
 * @param {number} connectionNumber
 * @returns {number[][]}
 */
function getCellsInConnection(x, y) {
    // create an array to store the cells in the connection
    const cellsInConnection = [];
    // loop through the connectionCoOrdinates array
    for (let i = 0; i < connectionCoOrdinates.length; i++) {
        // check if the cell is a connection
        if (connectionCoOrdinates[i].room1Point.x === x && connectionCoOrdinates[i].room1Point.y === y) {
            // add the room 2 point to the array
            cellsInConnection.push(connectionCoOrdinates[i].room2Point);
        }
        if (connectionCoOrdinates[i].room2Point.x === x && connectionCoOrdinates[i].room2Point.y === y) {
            // add the room 1 point to the array
            cellsInConnection.push(connectionCoOrdinates[i].room1Point);
        }
    }
    // return the array
    return cellsInConnection;
}

/**
 * Using the connectionCoOrdinates var, check if the cell is a connection
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
    */
function checkIfConnection(x, y) {
    // loop through the connectionCoOrdinates array
    for (let i = 0; i < connectionCoOrdinates.length; i++) {
        // check if the cell is a connection
        if (connectionCoOrdinates[i].room1Point.x === x && connectionCoOrdinates[i].room1Point.y === y) {
            return true;
        }
        if (connectionCoOrdinates[i].room2Point.x === x && connectionCoOrdinates[i].room2Point.y === y) {
            return true;
        }
    }
    // if it's not a connection, return false
    return false;
}

/**
 * Draw the popup info on the canvas next to the mouse
 * @param {array} popupInfo
 * @returns {void}
    */
function drawPopup(popupInfo, ctx) {
    // if there is no popup info, return
    if (popupInfo.length === 0) {
        return;
    }
    // get the mouse position
    const rect = dungeonCanvas.getBoundingClientRect();
    const x = mousePosition.x - rect.left;
    const y = mousePosition.y - rect.top;
    // calculate the cell size
    const maxCellWidth = dungeonCanvas.width / redrawColCount;
    const maxCellHeight = dungeonCanvas.height / redrawRowCount;
    const cellSize = maxCellHeight > maxCellWidth ? Math.floor(maxCellWidth) : Math.floor(maxCellHeight);
    // calculate the row and column
    const row = Math.floor(x / cellSize);
    const col = Math.floor(y / cellSize);

    let popupXAdjustment = 20;
    let popupYAdjustment = 15;

    // if the mouse is too close to the right, adjust popupXAdjustment to the left
    if (x + popupXAdjustment + 200 > dungeonCanvas.width) {
        popupXAdjustment = -200;
        // and change the text alignment to the right
        ctx.textAlign = 'right';
    }
    // if the mouse is too close to the bottom, adjust popupYAdjustment to the top
    if (y + 60 > dungeonCanvas.height) {
        popupYAdjustment = -popupYAdjustment * popupInfo.length - 10;
    }


    // draw the popup
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(x + popupXAdjustment, y + popupYAdjustment, 200, 20 * popupInfo.length);
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.font = '12px Arial';
    for (let i = 0; i < popupInfo.length; i++) {
        // align the text to the left
        ctx.textAlign = 'left';
        // draw the text
        ctx.fillText(popupInfo[i], x + popupXAdjustment + 10, y + 15 * (i + 1) + popupYAdjustment);
    }
}

// listen out for any mouse movement on the canvas
dungeonCanvas.addEventListener('mousemove', (e) => {
    // store the mouse position globally
    mousePosition = { x: e.clientX, y: e.clientY };

    // get the mouse position
    const rect = dungeonCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // calculate the cell size
    const maxCellWidth = dungeonCanvas.width / redrawColCount;
    const maxCellHeight = dungeonCanvas.height / redrawRowCount;
    const cellSize = maxCellHeight > maxCellWidth ? Math.floor(maxCellWidth) : Math.floor(maxCellHeight);
    // calculate the row and column
    const row = Math.floor(x / cellSize);
    const col = Math.floor(y / cellSize);
    pointsOfInterest.push({ x: row, y: col });
    // redraw the canvas highlighting the cell that the mouse is over
    redrawDungeon();
});


/**
 * A function that attempts to find a path between two rooms by only moving in straight lines
 * @param {number[][]} board The 2D array that represents the dungeon
 * @param {Object} room1 The room object that represents the starting room
 * @param {Object} room2 The room object that represents the ending room
 * @param {boolean} isRight A boolean that represents if we are pathfinding to the right or down
 * @returns {number[][]} A new 2D array that represents the dungeon with the path drawn
 */
function pathFind(board, gridList, room1, room2, isRight) {
    // we're going to program in some randomness as we don't want the path to be the same every time
    // create a new 2d array that is a copy of the board
    const newBoard = board.map(arr => arr.slice());
    // get the previously generated points from each room
    const room1Points = room1.points;
    const room2Points = room2.points;


    // draw each generated point on the board, labelled with a letter for debugging purposes
    // as long as there's a number in the spot first
    drawDebug();


    if (isRight) {
        printToLog(`Connecting from room ${room1.grid} to room ${room2.grid}`);

        // track a couple of important deciders
        // if the lowest point of the bottom of room1 is higher than the highest point of the top of room2
        const isRoom1BottomHigher = room1Points.bottom.y < room2Points.top.y;
        printToLog(`Room 1 Bottom Higher: ${isRoom1BottomHigher}`);
        // if the highest point of the top of room1 is lower than the lowest point of the bottom of room2
        const isRoom1TopLower = room1Points.top.y > room2Points.bottom.y;
        printToLog(`Room 1 Top Lower: ${isRoom1TopLower}`);
        // if the right point of the right of room1 is directly next to the left point of the left of room2
        const isRoom1RightNextToRoom2Left = room1Points.right.x + 1 === room2Points.left.x;
        printToLog(`Room 1 Right Next to Room 2 Left: ${isRoom1RightNextToRoom2Left}`);
        // if the top point of either room is on the edge of the board
        const isRoom1TopOnEdge = room1Points.top.y === 0;
        const isRoom2TopOnEdge = room2Points.top.y === 0;
        printToLog(`Room 1 Top On Edge: ${isRoom1TopOnEdge}`);
        printToLog(`Room 2 Top On Edge: ${isRoom2TopOnEdge}`);
        // if the bottom point of either room is on the edge of the board
        const isRoom1BottomOnEdge = room1Points.bottom.y === board[0].length - 1;
        const isRoom2BottomOnEdge = room2Points.bottom.y === board[0].length - 1;
        printToLog(`Room 1 Bottom On Edge: ${isRoom1BottomOnEdge}`);
        printToLog(`Room 2 Bottom On Edge: ${isRoom2BottomOnEdge}`);


        const room1ValidPoints = [];
        const room1ValidPointsLabels = new Set();
        const room2ValidPoints = [];
        const room2ValidPointsLabels = new Set();

        // by default, allow all
        room1ValidPointsLabels.add('top');
        room1ValidPointsLabels.add('right');
        room1ValidPointsLabels.add('bottom');
        // room 2 can use TLB
        room2ValidPointsLabels.add('top');
        room2ValidPointsLabels.add('left');
        room2ValidPointsLabels.add('bottom');

        // if the top of room1 is on the edge, we can't use it
        if (isRoom1TopOnEdge) {
            room1ValidPointsLabels.delete('top');
        }
        // if the bottom of room1 is on the edge, we can't use it
        if (isRoom1BottomOnEdge) {
            room1ValidPointsLabels.delete('bottom');
        }
        // if the top of room2 is on the edge, we can't use it
        if (isRoom2TopOnEdge) {
            room2ValidPointsLabels.delete('top');
        }
        // if the bottom of room2 is on the edge, we can't use it
        if (isRoom2BottomOnEdge) {
            room2ValidPointsLabels.delete('bottom');
        }
        // if the lowest point of the bottom of room1 is higher than the highest point of the top of room2
        if (isRoom1BottomHigher) {
            // we can't use the top of room1
            room1ValidPointsLabels.delete('top');
            // we can't use the bottom of room2
            room2ValidPointsLabels.delete('bottom');
        }
        // if the highest point of the top of room1 is lower than the lowest point of the bottom of room2
        if (isRoom1TopLower) {
            // we can't use the bottom of room1
            room1ValidPointsLabels.delete('bottom');
            // we can't use the top of room2
            room2ValidPointsLabels.delete('top');
        }
        // if the right point of the right of room1 is directly next to the left point of the left of room2
        if (isRoom1RightNextToRoom2Left) {
            // bypass the valid points check, we will use these all the time
            room1ValidPoints.push(room1Points.left);
            room2ValidPoints.push(room2Points.left);
        }

        // if we haven't bypassed the valid points check, we need to translate the labels into actual points
        if (room1ValidPoints.length === 0) {
            room1ValidPointsLabels.forEach(label => {
                room1ValidPoints.push(room1Points[label]);
            });
        }
        if (room2ValidPoints.length === 0) {
            room2ValidPointsLabels.forEach(label => {
                room2ValidPoints.push(room2Points[label]);
            });
        }


        // we're going to randomly pick a point from room1
        const room1Point = room1ValidPoints[Math.floor(Math.random() * room1ValidPoints.length)];

        // room2's point will be dependent on the point we picked from room1, depending on the location of the point
        // the wider the y gap between room1point and room2point, the less likely we are to choose it

        const room2Point = weightedSelectionOfConnectionPointRight(room2ValidPoints, room1Point);
        // print out what these points are according to the board
        printToLog(`room1Point currently ${board[room1Point.x][room1Point.y]}`);
        printToLog(`room2Point currently ${board[room2Point.x][room2Point.y]}`);


        // draw the points on the board
        newBoard[room1Point.x][room1Point.y] = 'S';
        newBoard[room2Point.x][room2Point.y] = 'F';

        // also print the points

        printToLog(`room1Point: ${room1Point.x}, ${room1Point.y}`);
        printToLog(`room2Point: ${room2Point.x}, ${room2Point.y}`);
        printToLog('');

        return { newBoard, room1Point, room2Point };
    }
    else {
        printToLog(`Connecting from room ${room1.grid} to room ${room2.grid}`);

        // we don't need to track as many deciders as we do for the right pathfinding
        // if the left side of room2 is blocked by the boundary of its slot in the gridList
        const isRoom2LeftBlocked = room2Points.left.x === gridList[room2.grid].x;
        printToLog(`Room 2 Left Blocked: ${isRoom2LeftBlocked}`);
        // if the right side of room2 is blocked by the boundary of its slot in the gridList
        const isRoom2RightBlocked = room2Points.right.x === gridList[room2.grid].x + gridList[room2.grid].width - 1;
        printToLog(`Room 2 Right Blocked: ${isRoom2RightBlocked}`);

        const room1ValidPoints = [];
        const room2ValidPoints = [];

        // for now, room1 can ONLY use B
        room1ValidPoints.push(room1Points.bottom);

        // if the left side of room2 is blocked
        if (isRoom2LeftBlocked) {
            // room 2 can ONLY use TR
            room2ValidPoints.push(room2Points.right);
        }
        // if the right side of room2 is blocked
        else if (isRoom2RightBlocked) {
            // room 2 can ONLY use TL
            room2ValidPoints.push(room2Points.left);
        }
        // if neither side of room2 is blocked
        else {
            // room 2 can use TLR
            room2ValidPoints.push(room2Points.left);
            room2ValidPoints.push(room2Points.right);
        }

        // we're going to randomly pick a point from room1
        const room1Point = room1ValidPoints[Math.floor(Math.random() * room1ValidPoints.length)];

        // room2's point is determenistic - a fixed 85% chance of using the top point, 15% chance of using the other two points
        let room2Point;
        const random = Math.random();
        if (random < 0.85) {
            room2Point = room2Points.top;
        }
        else {
            room2Point = room2ValidPoints[Math.floor(Math.random() * room2ValidPoints.length)];
        }
        newBoard[room1Point.x][room1Point.y] = 'S';
        newBoard[room2Point.x][room2Point.y] = 'F';

        // also print the points
        printToLog(`room1Point: ${room1Point.x}, ${room1Point.y}`);
        printToLog(`room2Point: ${room2Point.x}, ${room2Point.y}`);


        printToLog('');
        return { newBoard, room1Point, room2Point };
    }
    function weightedSelectionOfConnectionPointRight(room2ValidPoints, room1Point) {
        const room2Chances = [];
        let room2Point;
        for (let i = 0; i < room2ValidPoints.length; i++) {
            // if the points are the same, we're going to use it
            if (room1Point.x === room2ValidPoints[i].x && room1Point.y === room2ValidPoints[i].y) {
                room2Point = room2ValidPoints[i];
                break;
            }

            // if the points are not the same, we're going to calculate the y gap
            else {
                const yGap = Math.abs(room1Point.y - room2ValidPoints[i].y);
                // the wider the gap, the less likely we are to choose it
                room2Chances.push({ room: room2ValidPoints[i], chance: yGap });
            }
        }

        // if we haven't chosen a point yet, time to calculate the chances
        if (!room2Point) {
            // combine all the chances into one number
            const totalChances = room2Chances.reduce((acc, cur) => acc + cur.chance, 0);
            const probabilities = [];
            for (let i = 0; i < room2Chances.length; i++) {
                // calculate the probability of each point being chosen, this is a exponential function that decreases as the y gap increases
                // thank you chatGPT for the help with this
                const probability = Math.exp(-0.25 * room2Chances[i].chance) / totalChances;
                if (probability === 0) {
                    probabilities.push(0.5);
                }
                else {
                    probabilities.push(probability);
                }

            }

            // pick a random point based on the probabilities
            const randomIndex = pickItem(probabilities);
            // make sure that we're not picking a point that's larger than the array
            room2Point = room2Chances[randomIndex].room || room2Chances[0].room;
        }
        return room2Point;
    }

    function pickItem(probabilities) {
        // Keep a running total of the probabilities
        let runningTotal = 0;

        // Iterate through the probability array
        for (let i = 0; i < probabilities.length; i++) {
            runningTotal += probabilities[i];
        }
        // Pick a random number between 0 and the running total (this stops us picking something outside the array)
        const random = Math.random() * runningTotal;
        let current = 0;

        // Iterate through the probability array again
        for (let i = 0; i < probabilities.length; i++) {
            current += probabilities[i];
            if (random <= current) {
                return i;
            }
        }
    }


    function drawDebug() {
        // x THEN y
        if (typeof newBoard[room1Points.top.x][room1Points.top.x] === 'number') {
            newBoard[room1Points.top.x][room1Points.top.y] = 'T';
        }
        if (typeof newBoard[room1Points.bottom.x][room1Points.bottom.y] === 'number') {
            newBoard[room1Points.bottom.x][room1Points.bottom.y] = 'B';
        }
        if (typeof newBoard[room1Points.left.x][room1Points.left.y] === 'number') {
            newBoard[room1Points.left.x][room1Points.left.y] = 'L';
        }
        if (typeof newBoard[room1Points.right.x][room1Points.right.y] === 'number') {
            newBoard[room1Points.right.x][room1Points.right.y] = 'R';
        }

        if (typeof newBoard[room2Points.top.x][room2Points.top.y] === 'number') {
            newBoard[room2Points.top.x][room2Points.top.y] = 'T';
        }
        if (typeof newBoard[room2Points.bottom.x][room2Points.bottom.y] === 'number') {
            newBoard[room2Points.bottom.x][room2Points.bottom.y] = 'B';
        }
        if (typeof newBoard[room2Points.left.x][room2Points.left.y] === 'number') {
            newBoard[room2Points.left.x][room2Points.left.y] = 'L';
        }
        if (typeof newBoard[room2Points.right.x][room2Points.right.y] === 'number') {
            newBoard[room2Points.right.x][room2Points.right.y] = 'R';
        }

    }
}


document.addEventListener('input', event => {
    // ignore toggle switches
    if (event.target.type === 'checkbox') {
        // we do want to store the options if the autoClearSwitch is toggled
        if (event.target.id === 'autoClearSwitch') {
            storeAllOptions();
        }
        // if it's drawRoomLinks, we need to store the options and redraw the dungeon
        if (event.target.id === 'drawRoomLinks') {
            storeAllOptions();
            redrawDungeon();
        }
        return;

    }
    // ignore the log container
    if (event.target.id === 'logContainer') {
        return;
    }
    // ignore the log clear button
    if (event.target.id === 'logClear') {
        return;
    }
    // if autoClear is checked, clear the log
    if (document.querySelector('#autoClearSwitch').checked) {
        const logContainer = document.querySelector('#logContainer');
        logContainer.innerHTML = '';
    }
    // regenerate the dungeon
    generateDungeon();
    storeAllOptions();
});
document.querySelector('#regenerate').addEventListener('click', () => {
    // if autoClear is checked, clear the log
    if (document.querySelector('#autoClearSwitch').checked) {
        const logContainer = document.querySelector('#logContainer');
        logContainer.innerHTML = '';
    }
    generateDungeon();
});

document.querySelector('#logClear').addEventListener('click', () => {
    const logContainer = document.querySelector('#logContainer');
    logContainer.innerHTML = '';
});

function storeAllOptions() {
    const options = {
        rowCount: document.querySelector('#dungeonRow').value,
        colCount: document.querySelector('#dungeonCol').value,
        roomCount: document.querySelector('#dungeonRoom').value,
        minRoomSizeX: document.querySelector('#dungeonRoomMinX').value,
        minRoomSizeY: document.querySelector('#dungeonRoomMinY').value,
        maxRoomSizeX: document.querySelector('#dungeonRoomMaxX').value,
        maxRoomSizeY: document.querySelector('#dungeonRoomMaxY').value,
        autoClearLog: document.querySelector('#autoClearSwitch').checked,
        drawRoomLinks: document.querySelector('#drawRoomLinks').checked,

    };
    localStorage.setItem('options', JSON.stringify(options));
}

function loadAllOptions() {
    const options = JSON.parse(localStorage.getItem('options'));
    if (options) {
        document.querySelector('#dungeonRow').value = options.rowCount;
        document.querySelector('#dungeonCol').value = options.colCount;
        document.querySelector('#dungeonRoom').value = options.roomCount;
        document.querySelector('#dungeonRoomMinX').value = options.minRoomSizeX;
        document.querySelector('#dungeonRoomMinY').value = options.minRoomSizeY;
        document.querySelector('#dungeonRoomMaxX').value = options.maxRoomSizeX;
        document.querySelector('#dungeonRoomMaxY').value = options.maxRoomSizeY;
        document.querySelector('#autoClearSwitch').checked = options.autoClearLog;
        document.querySelector('#drawRoomLinks').checked = options.drawRoomLinks;
    }
}

function returnDefaultOptions() {
    const options = {
        rowCount: 32,
        colCount: 40,
        roomCount: 8,
        minRoomSizeX: 3,
        minRoomSizeY: 3,
        maxRoomSizeX: 7,
        maxRoomSizeY: 7,
        autoClearLog: false,
        drawRoomLinks: false,

    };
    localStorage.setItem('options', JSON.stringify(options));
    loadAllOptions();
}
document.querySelector('#defaultOptions').addEventListener('click', () => {
    returnDefaultOptions();
    generateDungeon();
});
loadAllOptions();
generateDungeon();
