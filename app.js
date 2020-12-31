document.addEventListener("DOMContentLoaded", () => {
    // some userPreference
    let userPreference = {
        gameSpeed: 450
    }
    const color = [
        'lightgray',
        'lightskyblue',
        'lightsalmon',
        'gold',
        'cornflowerblue',
        'chocolate',
    ]

    let scoreDisplay = document.querySelector('#score')
    let score = scoreDisplay.innerHTML*1
    const grid = document.querySelector('.grid')
    let squares = Array.from(document.querySelectorAll('.grid div'))
    const width = 10 // block num per row
    let gameIsRunning = false
    let timerId = null
    
    // def shapes of tetrominoes
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width+0, width+1, width+2, width*2+2],
        [width*2+0, 1, width+1, width*2+1],
        [width+0, width*2+0, width*2+1, width*2+2]
    ]
    
    const zTetromino = [
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1],
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1]
    ]
    
    const tTetromino = [
        [1,width,width+1,width+2],
        [1,width+1,width+2,width*2+1],
        [width,width+1,width+2,width*2+1],
        [1,width,width+1,width*2+1]
    ]
    
    const oTetromino = [
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1]
    ]
    
    const iTetromino = [
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3],
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3]
    ]
    
    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]
    
    // def shapes of upNextTetromino
    const previewSquares = Array.from(document.querySelectorAll('.mini-grid div'))
    const previewWidth = 4
    const upNextTetromino = [
        [1, previewWidth+1, previewWidth*2+1, 2], // L
        [0, previewWidth, previewWidth+1, previewWidth*2+1], // Z
        [1, previewWidth, previewWidth+1, previewWidth+2], // T
        [0, 1, previewWidth, previewWidth+1], // O
        [1, previewWidth+1, previewWidth*2+1, previewWidth*3+1], // I

    ]
    function drawPreview(typeIndex) {
        // clean last
        previewSquares.forEach(square => {
            square.classList.remove('tetromino')
            square.style.backgroundColor = ''
        })
        upNextTetromino[typeIndex].forEach(index => {
            previewSquares[index].classList.add('tetromino')
            previewSquares[index].style.backgroundColor = color[nextRandom]
        })
        return typeIndex
    }


    // game init
    let nextRandom = Math.floor(Math.random() * theTetrominoes.length)
    let random = Math.floor(Math.random() * theTetrominoes.length)
    drawPreview(nextRandom)
    let currentPosition = 4
    let currentRotation = 0
    // theTetrominoes[0][0] === [1, width+1, width*2+1, 2]
    let current = theTetrominoes[random][currentRotation]

    // def how to draw tetromino
    function draw() {
        current.forEach(i => {
            squares[currentPosition + i].classList.add('tetromino')
            squares[currentPosition + i].style.backgroundColor = color[random]
        })
    }

    // def how to undraw tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino')
            squares[currentPosition + index].style.backgroundColor = ''
        })
    }

    // def how tetromino fall
    function moveDown(params) {
        undraw()
        currentPosition += width
        draw()
        freeze()
    }
    
    // def when tetromino stop falling, what should be done at that time.
    function freeze(params) {
        // if some squares of next row are taken
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            
            // preview tetromino --> current tetromino
            random = nextRandom
            // random tetromino --> preview tetromino
            nextRandom = Math.floor(Math.random() * theTetrominoes.length)
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4

            // render the page
            draw()
            drawPreview(nextRandom)
            addScore()


            isGameOver()
        }
    }
    
    // start-button
    function start() {
        gameIsRunning = true
        timerId = setInterval(moveDown, userPreference.gameSpeed)
    }
    function pause() {
        gameIsRunning = false
        clearInterval(timerId)
    }
    const startBtn = document.querySelector('#start-button')
    startBtn.addEventListener('click', () => {
        gameIsRunning ? pause() : start()
    })

    function moveLeft() {
        undraw()
        
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
        if(!isAtLeftEdge) currentPosition -= 1

        // if hit left border, go back
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1
        }
        
        draw()
    }

    function moveRight() {
        undraw()
        
        const isRightEdge = current.some(index => (currentPosition + index) % width === width-1)
        if(!isRightEdge) currentPosition += 1

        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1
        }
        
        draw()
    }

    // def how tetromino rotate
    function rotate() {
        undraw()
        currentRotation ++
        if(currentRotation === theTetrominoes[random].length) {
            currentRotation = 0
        }
        current = theTetrominoes[random][currentRotation]
        draw()
    }

    // def keyboard instructions
    function control(e) {
        // console.log(e.keyCode);
        if(gameIsRunning === false) {
            return
        }
        switch (e.keyCode) {
            case 37:
                moveLeft()
                break;
            case 39:
                moveRight()
                break;
            case 38:
                rotate()
                break;
            case 40:
                moveDown()
                break;
            default:
                break;
        }
    }
    document.addEventListener('keyup', control)

    // def how to addscore and clean scored rows
    function addScore() {
        // scan each row
        for(let i=0; i < 199; i +=width){
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
            // check is current row should be scored
            if(row.every(value => squares[value].classList.contains('taken'))){
                score += 10
                scoreDisplay.innerHTML = score
                // clean the style of scored row
                row.forEach(value => {
                    squares[value].classList.remove('taken')
                    squares[value].classList.remove('tetromino')
                    squares[value].style.backgroundColor = ''
                })
                // move scored row to 1st row of the grid
                let removedSquares = squares.splice(i, width)
                squares = removedSquares.concat(squares)
                squares.forEach(square => grid.appendChild(square))
            }
        }
    }
    
    // isGameOver
    function isGameOver() {
        if(current.some(value => squares[currentPosition + value].classList.contains('taken'))){
            gameIsRunning = false
            clearInterval(timerId)
            scoreDisplay.innerHTML = `Game Over, your score is ${score}.`
        }
    }

})