function showCellDiagram(a: number, b: number) {
    basic.clearScreen()
    let x = cellAt(a, b)
    if ((x & 8) == 8) led.plot(2, 0)
    if ((x & 4) == 4) led.plot(4, 2)
    if ((x & 2) == 2) led.plot(2, 4)
    if ((x & 1) == 1) led.plot(0, 2)
}
function drawGrid() {
    ssd1309.setPlotOn()
    for (let i = 0; i <= mazeWidth; i++) {
        ssd1309.plot(Plots.Line, i * scale, 0, i * scale, maxY)
    }
    for (let j = 0; j <= mazeHeight; j++) {
        ssd1309.plot(Plots.Line, 0, j * scale, maxX, j * scale)
    }
}
function updateWalls(i: number, j: number) {
    let cell = maze[cellNumber(i, j)]
    if ((cell & 8) == 0) unplotTopWall(i, j)
    if ((cell & 4) == 0) unplotRightWall(i, j)
    if ((cell & 2) == 0) unplotBottomWall(i, j)
    if ((cell & 1) == 0) unplotLeftWall(i, j)
}
function drawMaze() {
    drawGrid()
    for (let k = 0; k <= mazeWidth - 1; k++) {
        for (let l = 0; l <= mazeHeight - 1; l++) {
            updateWalls(k, l)
        }
    }
}
function cellNumber(i: number, j: number): number {
    return i + j * mazeWidth
}
function cellAt(i: number, j: number): number {
    return maze[cellNumber(i, j)]
}
function randomWiggle() {
    do {
        dir = Math.randomRange(0, 3)
    } while ((freeDirs & WALL_BITS[dir]) == 0)
}
function randomBreakOut() {
    if (cellCount < 3) {
        for (let a = 0; a <= mazeWidth - 1; a++) {
            for (let b = 0; b <= mazeHeight - 1; b++) {
                if ((availableDirections(a, b) != 0) && (!cellIsFree(a, b))) {
                    xpos = a
                    ypos = b
                }
            }
        }
        freeDirs = availableDirections(xpos, ypos)
    } else {
        do {
            getRandomLocation()
            freeDirs = availableDirections(xpos, ypos)
        } while ((freeDirs == 0) || cellIsFree(xpos, ypos))
    }
}
function calculateFramePosition() {
    //    idealX = Math.constrain(fx - 8, 0, leds16x9.worldFrameMaxX())
    //   idealY = Math.constrain(fy - 4, 0, leds16x9.worldFrameMaxY())
    //    leds16x9.worldPositionFrame(idealX, idealY)
}
function getRandomLocation() {
    xpos = Math.randomRange(0, mazeWidth - 1)
    ypos = Math.randomRange(0, mazeHeight - 1)
}
function cellIsFree(i: number, j: number): boolean {
    return (cellAt(i, j) == 0b1111)
}
function availableDirections(i: number, j: number): number {
    let ad = 0b0000
    if (i > 0) {
        if (cellIsFree(i - 1, j)) ad |= WALL_BITS[LEFT]
    }
    if (i < (mazeWidth - 1)) {
        if (cellIsFree(i + 1, j)) ad |= WALL_BITS[RIGHT]
    }
    if (j > 0) {
        if (cellIsFree(i, j - 1)) ad |= WALL_BITS[UP]
    }
    if (j < (mazeHeight - 1)) {
        if (cellIsFree(i, j + 1)) ad |= WALL_BITS[DOWN]
    }
    return ad
}
function moveToNextCell() {
    maze[cellNumber(xpos, ypos)] &= ~WALL_BITS[dir]
    xpos += DX[dir]
    ypos += DY[dir]
    maze[cellNumber(xpos, ypos)] &= ~OPP_BITS[dir]
}
function makeOpenings() {

    entrance = Math.randomRange(0, mazeHeight - 1)
    exit = Math.randomRange(0, mazeHeight - 1)
//    maze[cellNumber(0, entrance)] &= ~WALL_BITS[LEFT]
    maze[cellNumber(mazeWidth - 1, exit)] &= ~WALL_BITS[RIGHT]
//    updateWalls(0, entrance)
    updateWalls(mazeWidth - 1, exit)
}
function createMaze() {
    cellCount = mazeWidth * mazeHeight
    //    leds16x9.worldPositionFrame(0, 0)
    drawGrid()
    ssd1309.show()
    do {
        getRandomLocation()
        freeDirs = availableDirections(xpos, ypos)
    } while (freeDirs == 0)
    randomWiggle()
    while (cellCount > 1) {
        freeDirs = availableDirections(xpos, ypos)
        if (freeDirs != 0) {
            if ((Math.randomRange(0, 10) < wiggleFactor) || (freeDirs & WALL_BITS[dir]) == 0) {
                randomWiggle()
            }
        } else {
            randomBreakOut()
            randomWiggle()
        }
        updateWalls(xpos, ypos)
        moveToNextCell()
        updateWalls(xpos, ypos)
        ssd1309.show()
        cellCount += - 1
    }
    makeOpenings()
}
function showWall(dir: number) {
    if (dir == NONE) return
    y = Math.trunc(fx / scale)
    z = Math.trunc(fy / scale)
    if ((getCell(fx, fy) & WALL_BITS[dir]) != 0) {
        switch (dir) {
            case LEFT: { plotLeftWall(y, z); break }
            case RIGHT: { plotRightWall(y, z); break }
            case DOWN: { plotBottomWall(y, z); break }
            case UP: { plotTopWall(y, z); break }
        }
    }
}
function unplotTopWall(i: number, j: number) {
    ssd1309.setPlotOff()
    ssd1309.plot(Plots.Line, i * scale + 1, j * scale, (i + 1) * scale - 1, j * scale)
}
function unplotRightWall(i: number, j: number) {
    ssd1309.setPlotOff()
    ssd1309.plot(Plots.Line, (i + 1) * scale, j * scale + 1, (i + 1) * scale, (j + 1) * scale - 1)
}
function unplotBottomWall(i: number, j: number) {
    ssd1309.setPlotOff()
    ssd1309.plot(Plots.Line, i * scale + 1, (j + 1) * scale, (i + 1) * scale - 1, (j + 1) * scale)
}
function plotTopWall(i: number, j: number) {
    ssd1309.setPlotOn()
    ssd1309.plot(Plots.Line, i * scale, j * scale, (i + 1) * scale, j * scale)
}
function unplotLeftWall(i: number, j: number) {
    ssd1309.setPlotOff()
    ssd1309.plot(Plots.Line, i * scale, j * scale + 1, i * scale, (j + 1) * scale - 1)
}
function plotRightWall(i: number, j: number) {
    ssd1309.setPlotOn()
    ssd1309.plot(Plots.Line, (i + 1) * scale, j * scale, (i + 1) * scale, (j + 1) * scale)
}
function plotBottomWall(i: number, j: number) {
    ssd1309.setPlotOn()
    ssd1309.plot(Plots.Line, i * scale, (j + 1) * scale, (i + 1) * scale, (j + 1) * scale)
}
function plotLeftWall(i: number, j: number) {
    ssd1309.setPlotOn()
    ssd1309.plot(Plots.Line, i * scale, j * scale, i * scale, (j + 1) * scale)
}
function getJoystick(): number {
    let jX = pins.analogReadPin(AnalogPin.P1) >> 7
    let jY = pins.analogReadPin(AnalogPin.P0) >> 7
        if (jY > 5) return UP
        if (jY < 1) return DOWN
        if (jX < 1) return LEFT
        if (jX > 5) return RIGHT
    return NONE
}
function drawPlayer(x: number, y: number, state: boolean) {
    if (state) ssd1309.setPlotOn()
    else ssd1309.setPlotOff()
    ssd1309.plot(Plots.Box, x, y, x + scale - 2, y + scale - 2)
}
function isAtCellWall(x: number, y: number): boolean {
    return ((x % scale == 0) || (y % scale == 0))
}
function getCell(x: number, y: number): number {
    let cx = Math.trunc(x / scale)
    let cy = Math.trunc(y / scale)
    return maze[cellNumber(cx, cy)]
}
function toWallGrid(dir: number): boolean {
    switch (dir) {
        case UP: {
            if ((fy - 1) % scale == 0) return true
            break
        }
        case DOWN: {
            if ((fy + 1) % scale == 0) return true
            break
        }
        case LEFT: {
            if ((fx - 1) % scale == 0) return true
            break
        }
        case RIGHT: {
            if ((fx + 1) % scale == 0) return true
            break
        }
    }
    return false
}

function dragonBlockedCell(dir: number): boolean {
    switch (dir) {
        case  UP: {

        }
        case  DOWN: {

        }
        case  LEFT: {
            if (dragonx > 0) {
                
            }
            break

        }
        case  RIGHT: {

        }
    }
    return false
}
function numberOfDirections(x: number, y: number) : number {
    let n =  NUM_DIRS[getCell(x,y)]
    return n
}
function canMove(x: number, y: number, dir: number): boolean {
    if (dir == NONE)  return false
    if (((x - 1) % scale == 0) && ((y - 1) % scale == 0)) {
        return !(WALL_BITS[dir] & getCell(x, y))
    } else {
        return true
    }
}
function canDragonMove(dir: number): boolean {
    let wall: boolean = ((WALL_BITS[dir] & getCell(dragonx, dragony)) != 0)
    wall = wall || dragonBlockedCell(dir)
    return !wall
}

function moveDragon() {
    drawPlayer(dragonx, dragony, false)
    dragonx += DX[dragondir] * scaleMoveFactor
    dragony += DY[dragondir] * scaleMoveFactor
    dragonstate = (dragonstate + 1) % movecycle
}
function chooseBestDir(avoid: number) : number {
    let diffx = dragonx - fx
    let diffy = dragony - fy
    let xchoice = (diffx > 0) ? LEFT : RIGHT
    let ychoice = (diffy > 0) ? UP : DOWN
    if (Math.abs(diffx) >= Math.abs(diffy)) {
        if (canDragonMove(xchoice) && (xchoice != avoid)) {
            return xchoice
        } else if (canDragonMove(ychoice) && (ychoice != avoid)) {
            return ychoice
        } else if (canDragonMove(ychoice ^ 2) && ((ychoice^2) != avoid)) {
            return (ychoice ^ 2)
        } else {
            return (xchoice ^ 2)
        }
    }
    if (canDragonMove(ychoice) && (ychoice != avoid)) {
        return ychoice
    } else if (canDragonMove(xchoice) && (xchoice != avoid)) {
        return xchoice
    } else if (canDragonMove(xchoice ^ 2) && ((xchoice^2) != avoid)) {
        return (xchoice ^ 2)
    } else {
        return (ychoice ^ 2)
    }
}

function setDeadEnd() {
    let cx = Math.trunc(dragonx / scale)
    let cy = Math.trunc(dragony / scale)
    maze[cellNumber(cx, cy)] |= 128
    deadEndTravel = true
}

function getDragonDirection() {
    if (dragonstate == 0) {
        let oppdir = dragondir ^ 2
        let cell = getCell(dragonx, dragony)
        let num = numberOfDirections(dragonx, dragony)
        if (num == 1) {
// if at a dead end, simply reverse and set the flag
            setDeadEnd()
            switch (cell & 15) {
                case 14: { dragondir = LEFT; break }
                case 13: { dragondir = DOWN; break }
                case 11: { dragondir = RIGHT; break }
                case 7:  { dragondir = UP; break }
            }
// if it's a straight path, keep going in the same direction
        } else if  ((num  == 2 ) &&
                canMove(dragonx, dragony, dragondir) &&
                canMove(dragonx, dragony, oppdir)) {
                    dragondir = dragondir
// if it's junction or a bend...
// choose the best direction to go in                                    
        } else {
            if (num == 2) {
                dragondir = chooseBestDir(dragondir^2)
            } else {
                dragondir = chooseBestDir(dragondir^2)
            }
        }
    } 
}
function getMyMovement(isInvis: boolean) {
    if (mystate == 0) {
        dir = getJoystick()
        if (canMove(fx, fy, dir)) {
            drawPlayer(fx, fy,false)
            fx += DX[dir] * scaleMoveFactor
            fy += DY[dir] * scaleMoveFactor
            mystate = (mystate + 1) % movecycle
        } else {
            if (isInvis) showWall(dir)
        }
    } else {
        if (dir != NONE) {
            drawPlayer(fx, fy, false)
            fx += DX[dir] * scaleMoveFactor
            fy += DY[dir] * scaleMoveFactor
            mystate = (mystate + 1) % movecycle
        }
    }
}
function dragonMaze(isInvisible: boolean) {
    mystate = 0
    dragonstate = 0
    while (true) {
        basic.pause(cyclepause*2)
        getMyMovement(isInvisible)
        getDragonDirection()
        moveDragon()
        calculateFramePosition()
        drawPlayer(fx,fy, true)
        drawPlayer(dragonx,dragony, true)
        ssd1309.show()
    }
}
function calcscalefactor() {
    switch (scale) {
        case 2: {
            scaleMoveFactor = 2
            cyclepause = 100
            break
        }
        case 3: {
            scaleMoveFactor = 1
            cyclepause = 40
            break
        }
        case 5: {
            scaleMoveFactor = 1
            cyclepause = 40
            break
        }
        default: {
            scaleMoveFactor = 1
            cyclepause = 20
            break
        }
    }
    movecycle = scale / scaleMoveFactor
}
const LEFT = 0
const DOWN = 1
const RIGHT = 2
const UP = 3
const NONE = 4
const DX = [-1, 0, 1, 0, 0]
const DY = [0, 1, 0, -1, 0]
const WALL_BITS = [1, 2, 4, 8, 0]
const OPP_BITS = [4, 8, 1, 2, 0]
const NUM_DIRS = [4, 3, 3, 2, 3, 2, 2, 1, 3, 2, 2, 1, 2, 1, 1, 0]
let z = 0
let y = 0
let idealY = 0
let idealX = 0
let mystate = 0
let dragonstate = 0
let maxY = 0
let maxX = 0
let cellCount = 0
let fy = 0
let fx = 0
let dragony = 0
let dragonx = 0
let dir = NONE
let dragondir = NONE
let freeDirs = 0
let ypos = 0
let xpos = 0
let scale = 0
let scaleMoveFactor = 0
let movecycle = 0
let cyclepause = 50
let mazeWidth = 0
let mazeHeight = 0
let exit = 0
let entrance = 0
let wiggleFactor = 4
let isInvisible: boolean = false
let deadEndTravel: boolean = true
scale = 6
calcscalefactor()
mazeWidth = Math.trunc(127 / scale)
mazeHeight = Math.trunc(63 / scale)
cellCount = mazeWidth * mazeHeight
let mazeSize = mazeWidth * mazeHeight
maxX = mazeWidth * scale
maxY = mazeHeight * scale
let maze: Buffer = pins.createBuffer(mazeWidth * mazeHeight)
maze.fill(15)
basic.forever(function () {
    createMaze()
    drawMaze()
    basic.showNumber(1)
    fx = 0 * scale + 1
    fy = entrance * scale + 1
    dragonx = maxX + 1 - scale
    dragony = exit * scale + 1
    calculateFramePosition()
    drawPlayer(fx, fy, true)
    drawPlayer(dragonx, dragony, true)
    ssd1309.show()
    basic.pause(2000)
    if (input.buttonIsPressed(Button.A)) {
        isInvisible = true
    } 
    if (isInvisible) {
        ssd1309.clear()
        ssd1309.show()
    }
    dragonMaze(isInvisible)
})