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
let oldboard = [];

function generateDungeon() {
    const rowCount = document.querySelector('#dungeonRow').value;
    const colCount = document.querySelector('#dungeonCol').value;

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
                // if the y levels are the same, the x difference is not more than 1 grid width, and the y difference is not more than 1 grid height
                if (grid1.y === grid2.y && otherRoom.x - (room.x + room.width) <= grid1.width && Math.abs(grid1.y - grid2.y) <= grid1.height) {
                    const connection = {
                        room1: roomList[i],
                        room2: roomList[j],
                        isRight: true,
                    };
                    connectionList.push(connection);
                }


            }
            // check if the other room is underneath
            else if (otherRoom.y >= room.y + room.height) {
                // make sure both rooms are on the same x level via the gridList
                const grid1 = gridList[room.grid];
                const grid2 = gridList[otherRoom.grid];
                // if the x levels are the same, the y difference is not more than 1 grid height, and the x difference is not more than 1 grid width
                if (grid1.x === grid2.x && otherRoom.y - (room.y + room.height) <= grid1.height && Math.abs(grid1.x - grid2.x) <= grid1.width) {
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
        const newBoard = pathFind(board, connection.room1, connection.room2, connection.isRight);
        // update the board with the returned newBoard
        board = newBoard;
    }

    // cache the board
    oldboard = board;
    // Draw Board
    drawBoard(colCount, rowCount, gridList, board);

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
    const ctx = dungeonCanvas.getContext('2d');
    // background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, dungeonCanvas.width, dungeonCanvas.height);

    // calculate cell size
    const maxCellWidth = dungeonCanvas.width / colCount;
    const maxCellHeight = dungeonCanvas.height / rowCount;

    const cellSize = maxCellHeight > maxCellWidth ? Math.floor(maxCellWidth) : Math.floor(maxCellHeight);
    const winningSize = maxCellHeight > maxCellWidth ? 'Width' : 'Height';
    printToLog(`Calculated Cell Size: ${cellSize}`);
    printToLog(`${winningSize} Won the draw`);

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
}

/**
 * A function that attempts to find a path between two rooms by only moving in straight lines
 * @param {number[][]} board The 2D array that represents the dungeon
 * @param {Object} room1 The room object that represents the starting room
 * @param {Object} room2 The room object that represents the ending room
 * @param {boolean} isRight A boolean that represents if we are pathfinding to the right or down
 * @returns {number[][]} A new 2D array that represents the dungeon with the path drawn
 */
function pathFind(board, room1, room2, isRight) {
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


    // track a couple of important deciders
    // if the lowest point of the bottom of room1 is higher than the highest point of the top of room2
    const isRoom1BottomHigher = room1Points.bottom.y < room2Points.top.y;
    // if the highest point of the top of room1 is lower than the lowest point of the bottom of room2
    const isRoom1TopLower = room1Points.top.y > room2Points.bottom.y;
    // if the right point of the right of room1 is directly next to the left point of the left of room2
    const isRoom1RightNextToRoom2Left = room1Points.right.x + 1 === room2Points.left.x;

    const room1ValidPoints = [];
    const room2ValidPoints = [];

    // if the bottom of room1 is higher than the top of room2
    if (isRoom1BottomHigher) {
        // room 1 can use BR
        room1ValidPoints.push(room1Points.bottom);
        room1ValidPoints.push(room1Points.right);
        // room 2 can use TL
        room2ValidPoints.push(room2Points.top);
        room2ValidPoints.push(room2Points.left);
    }
    // if the top of room1 is lower than the bottom of room2
    else if (isRoom1TopLower) {
        // room 1 can use TR
        room1ValidPoints.push(room1Points.top);
        room1ValidPoints.push(room1Points.right);
        // room 2 can use BL
        room2ValidPoints.push(room2Points.bottom);
        room2ValidPoints.push(room2Points.left);
    }
    // if the right of room1 is directly next to the left of room2
    else if (isRoom1RightNextToRoom2Left && !isRoom1BottomHigher && !isRoom1TopLower) {
        // room 1 should only use R
        room1ValidPoints.push(room1Points.right);
        // room 2 should only use R from room 1
        room2ValidPoints.push(room1Points.right);
    }
    // else, go hogwild
    else {
        // room 1 can use TRB
        room1ValidPoints.push(room1Points.top);
        room1ValidPoints.push(room1Points.right);
        room1ValidPoints.push(room1Points.bottom);
        // room 2 can use TLB
        room2ValidPoints.push(room2Points.top);
        room2ValidPoints.push(room2Points.left);
        room2ValidPoints.push(room2Points.bottom);
    }

    // we're going to randomly pick a point from room1
    const room1Point = room1ValidPoints[Math.floor(Math.random() * room1ValidPoints.length)];

    // room2's point will be dependent on the point we picked from room1, depending on the location of the point
    // the wider the y gap between room1point and room2point, the less likely we are to choose it
    let room2Point;
    const room2Chances = [];

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
            // we'll use the y gap as the chance
            room2Chances.push({ room : room2ValidPoints[i], chance : yGap });
        }
    }

    // if we haven't chosen a point yet, time to calculate the chances
    if (!room2Point) {
        // use a half exponential function with a base of 1/2 to calculate the chances

            // first, we need to find the max chance
            let maxChance = 0;
            for (let i = 0; i < room2Chances.length; i++) {
                if (room2Chances[i].chance > maxChance) {
                    maxChance = room2Chances[i].chance;
                }
            }

            // now, we need to calculate the chances
            for (let i = 0; i < room2Chances.length; i++) {
                room2Chances[i].chance = Math.pow(0.25, room2Chances[i].chance / maxChance);
            }

            // now, we need to calculate the cumulative chances
            let cumulativeChance = 0;
            for (let i = 0; i < room2Chances.length; i++) {
                cumulativeChance += room2Chances[i].chance;
                room2Chances[i].chance = cumulativeChance;
            }

            // now, we need to pick a random number between 0 and the cumulative chance
            const randomChance = Math.random() * cumulativeChance;

            // now, we need to find the room that corresponds to the random chance
            for (let i = 0; i < room2Chances.length; i++) {
                if (randomChance < room2Chances[i].chance) {
                    room2Point = room2Chances[i].room;
                    break;
                }
            }
    }


    // draw the points on the board
    newBoard[room1Point.x][room1Point.y] = 'S';
    newBoard[room2Point.x][room2Point.y] = 'F';


    return newBoard;
}
   else {

    return newBoard;
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
