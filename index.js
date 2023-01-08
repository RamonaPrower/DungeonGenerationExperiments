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

    const board = [...Array(Number(colCount))].map(() => Array(Number(rowCount)));
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
    const pointList = [];

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
                    index: gridList.length,
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
                    index: gridList.length,
                };
                gridList.push(grid);
            }
        }
    }
    // in this iteration, we follow a backwards approach
    // generating the paths first, then fitting the rooms onto valid spaces on the paths

    // pick a point per grid to start from
    for (let i = 0; i < gridList.length; i++) {
        const grid = gridList[i];
        // both x and y need to make sure that they are not on the edge of the grid (ideally by the minimum room size)
        const minX = grid.x + dungeonRoomMinX;
        const maxX = grid.x + grid.width - dungeonRoomMinX;
        const minY = grid.y + dungeonRoomMinY;
        const maxY = grid.y + grid.height - dungeonRoomMinY;

        const x = randomIntFromInterval(minX, maxX);
        const y = randomIntFromInterval(minY, maxY);


        const point = {
            x,
            y,
            grid: i,
        };
        pointList.push(point);
    }
    // draw the points on the board for debugging
    for (let i = 0; i < pointList.length; i++) {
        const point = pointList[i];
        board[point.x][point.y] = point.grid + 1;
    }

    // get what paths we need to generate - Based on adjacent grids
    const connectionList = [];
    for (let i = 0; i < gridList.length; i++) {
        const grid = gridList[i];
        // get the adjacent grids
        const adjacentGrids = getAdjacentGrids(gridList, grid);
        // for each adjacent grid, use the pointList to link the two points
        for (let j = 0; j < adjacentGrids.length; j++) {
            const adjacentGrid = adjacentGrids[j];
            // get the points for each grid
            const point1 = pointList.find(point => point.grid === i);
            const point2 = pointList.find(point => point.grid === adjacentGrid.index);
            // connect the two points
            const connection = {
                point1,
                point2,
            };
            connectionList.push(connection);
            connectionCoOrdinates.push(connection);

        }
    }
    // loop through the connectionList and generate the paths
    for (let i = 0; i < connectionList.length; i++) {
        const connection = connectionList[i];
        const point1 = connection.point1;
        const point2 = connection.point2;
        // get the path between the two points
        const path = getPath(point1, point2);
        // draw the path on the board
        for (let j = 0; j < path.length; j++) {
            const point = path[j];
            board[point.x][point.y] = 'P';
        }
    }
    // for each grid, generate a room
    for (let i = 0; i < gridList.length; i++) {
        const grid = gridList[i];
        // get the points for the grid - there should only be 1 point per grid
        const point = pointList.filter(p => p.grid === i);
        // loop until we find a valid position for the room
        let validPosition = false;
        let onPoint = false;
        let roomWidth = randomIntFromInterval(dungeonRoomMinX, dungeonRoomMaxX);
        let roomHeight = randomIntFromInterval(dungeonRoomMinY, dungeonRoomMaxY);
        // pick a starting point for the room
        let roomX = randomIntFromInterval(grid.x, grid.x + grid.width - roomWidth);
        let roomY = randomIntFromInterval(grid.y, grid.y + grid.height - roomHeight);
        while (!validPosition) {
            // check if the room is valid
            validPosition = true;
            onPoint = false;
            for (let x = roomX; x < roomX + roomWidth; x++) {
                for (let y = roomY; y < roomY + roomHeight; y++) {
                    // make sure that the room is not out of bounds
                    if (x < 0 || x >= colCount || y < 0 || y >= rowCount) {
                        validPosition = false;
                        break;
                    }
                    // make sure that the room is not overlapping with another room
                    if (board[x][y] > 0) {
                        validPosition = false;
                        break;
                    }
                    // make sure that it's not escaping the grid
                    if (x === grid.x || x === grid.x + grid.width - 1 || y === grid.y || y === grid.y + grid.height - 1) {
                        validPosition = false;
                        break;
                    }
                    // track if the room has intersected with the point
                    if (x === point[0].x && y === point[0].y) {
                        onPoint = true;
                    }
                }

            }
            if (!validPosition || !onPoint) {
                // regenerate the room size and position
                roomWidth = randomIntFromInterval(dungeonRoomMinX, dungeonRoomMaxX);
                roomHeight = randomIntFromInterval(dungeonRoomMinY, dungeonRoomMaxY);
                roomX = randomIntFromInterval(grid.x, grid.x + grid.width - roomWidth);
                roomY = randomIntFromInterval(grid.y, grid.y + grid.height - roomHeight);
                // start the loop again
                validPosition = false;
                onPoint = false;
            }
            else {
                break;
            }
        }
        // draw the room on the board
        for (let x = roomX; x < roomX + roomWidth; x++) {
            for (let y = roomY; y < roomY + roomHeight; y++) {
                board[x][y] = i + 1;
            }
        }
        // add the room to the roomList
        const room = {
            x: roomX,
            y: roomY,
            width: roomWidth,
            height: roomHeight,
            grid: i,
            onPoint,
        };
        roomList.push(room);

        // print the room to the log
        printToLog(`Room ${i + 1} - x: ${roomX}, y: ${roomY}, width: ${roomWidth}, height: ${roomHeight}, onPoint: ${onPoint}`);
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
                case 'P':
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
            const point1 = connectionCoOrdinates[i].point1;
            const point2 = connectionCoOrdinates[i].point2;
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

function getPath(point1, point2) {
    // get the start and end points
    const startPoint = point1;
    const endPoint = point2;
    // get the start and end x and y values
    const startX = startPoint.x;
    const startY = startPoint.y;
    const endX = endPoint.x;
    const endY = endPoint.y;
    // get the difference between the start and end x and y values
    const xDiff = endX - startX;
    const yDiff = endY - startY;
    // if the x difference is greater than the y difference, we move in the x direction
    // otherwise we move in the y direction
    const path = [];
    if (xDiff > yDiff) {
        // for the first half of the path, we move in the x direction
        for (let i = 0; i < Math.abs(xDiff) / 2; i++) {
            if (xDiff > 0) {
                path.push({ x: startX + i, y: startY });
            }
            else {
                path.push({ x: startX - i, y: startY });
            }
        }
        // we then do all needed y movements (assuming we're not moving in a straight line)
        if (yDiff !== 0) {
            for (let i = 1; i <= Math.abs(yDiff); i++) {
                // we're going to slightly cheat here and just use whatever was the last path entry to get the correct x value
                if (yDiff > 0) {
                    path.push({ x: path[path.length - 1].x, y: startY + i });
                }
                else {
                    path.push({ x: path[path.length - 1].x, y: startY - i });
                }
            }
        }
        // then we do the second half of the x movements
        for (let i = path[path.length - 1].x; i < Math.abs(endX); i++) {
            if (xDiff > 0) {
                path.push({ x: i + 1, y: endY });
            }
            else {
                path.push({ x: i - 1, y: endY });
            }
        }
        return path;
    }
    else {
        // for the first half of the path, we move in the y direction
        for (let i = 0; i < Math.abs(yDiff) / 2; i++) {
            if (yDiff > 0) {
                path.push({ x: startX, y: startY + i });
            }
            else {
                path.push({ x: startX, y: startY - i });
            }
        }
        // we then do all needed x movements (assuming we're not moving in a straight line)
        if (xDiff !== 0) {
            for (let i = 1; i <= Math.abs(xDiff); i++) {
                // we're going to slightly cheat here and just use whatever was the last path entry to get the correct y value
                if (xDiff > 0) {
                    path.push({ x: startX + i, y: path[path.length - 1].y });
                }
                else {
                    path.push({ x: startX - i, y: path[path.length - 1].y });
                }
            }
        }
        // then we do the second half of the y movements
        for (let i = path[path.length - 1].y; i < Math.abs(endY); i++) {
            if (yDiff > 0) {
                path.push({ x: endX, y: i + 1 });
            }
            else {
                path.push({ x: endX, y: i - 1 });
            }
        }
        // return the path
        return path;
    }
}

/**
 * when given a grid, return an array of all the adjacent grids
 * @param {array} gridList
 * @param {object} grid
 * @returns {array}
 * */
function getAdjacentGrids(gridList, grid) {
    // adjacent grids will have the same x or y value as the grid
    const adjacentGrids = [];
    for (const selectedGrid of gridList) {
        const sameX = selectedGrid.x === grid.x;
        const sameY = selectedGrid.y === grid.y;

        const nextX = selectedGrid.x === grid.x + grid.width;
        const nextY = selectedGrid.y === grid.y + grid.height;
        // as all calcs are done both to the right and down for all grids, we don't need to check behind
        if (sameX && nextY || sameY && nextX) {
            adjacentGrids.push(selectedGrid);
        }

    }
    return adjacentGrids;
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
        if (connectionCoOrdinates[i].point1.x === x && connectionCoOrdinates[i].point1.y === y) {
            // add the room 2 point to the array
            cellsInConnection.push(connectionCoOrdinates[i].point2);
        }
        if (connectionCoOrdinates[i].point2.x === x && connectionCoOrdinates[i].point2.y === y) {
            // add the room 1 point to the array
            cellsInConnection.push(connectionCoOrdinates[i].point1);
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
        if (connectionCoOrdinates[i].point1.x === x && connectionCoOrdinates[i].point1.y === y) {
            return true;
        }
        if (connectionCoOrdinates[i].point2.x === x && connectionCoOrdinates[i].point2.y === y) {
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

    let popupXAdjustment = 20;
    let popupYAdjustment = 15;

    // if the mouse is too close to the right, adjust popupXAdjustment to the left
    if (x + popupXAdjustment + 200 > dungeonCanvas.width) {
        popupXAdjustment = -200;
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

document.addEventListener('mousemove', (e) => {
    // store the mouse position globally
    mousePosition = { x: e.clientX, y: e.clientY };
    // if the mouse is not over the canvas, don't draw the popup
    if (mousePosition.x < dungeonCanvas.offsetLeft || mousePosition.x > dungeonCanvas.offsetLeft + dungeonCanvas.width) {
        pointsOfInterest = [];
        redrawDungeon();
    }
    else if (mousePosition.y < dungeonCanvas.offsetTop || mousePosition.y > dungeonCanvas.offsetTop + dungeonCanvas.height) {
        pointsOfInterest = [];
        redrawDungeon();

    }
});


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
