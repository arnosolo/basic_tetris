document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector('.grid')
    let squares = Array.from(document.querySelectorAll('.grid div'))
    let scoreDisplay = document.querySelector('#score')
    let score = scoreDisplay.innerHTML*1
    const width = 10 // 一行有几个格子
    let gameSpeed = 450

    const color = [
        'lightgray',
        'lightskyblue',
        'lightsalmon',
        'gold',
        'cornflowerblue',
        'chocolate',
    ]
    
    // 积木所有形态
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width+0, width+1, width+2, width*2+2],
        [width*2+0, 1, width+1, width*2+1],
        // [width+0, width*2+0, width*2+1, width*2+2],
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
    
    // 定义 预览下一个
    const previewSquares = Array.from(document.querySelectorAll('.mini-grid div'))
    const previewWidth = 4
    const upNextTetromino = [
        [1, previewWidth+1, previewWidth*2+1, 2], // L
        [0, previewWidth,previewWidth+1,previewWidth*2+1], // Z
        [1, previewWidth,previewWidth+1,previewWidth+2], // T
        [0, 1, previewWidth,previewWidth+1], // O
        [1, previewWidth+1,previewWidth*2+1,previewWidth*3+1], // I

    ]
    function drawPreview(typeIndex) {
        // 清除上一次预览
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

    let nextRandom = Math.floor(Math.random() * theTetrominoes.length)
    let random = Math.floor(Math.random() * theTetrominoes.length)
    drawPreview(nextRandom)
    let currentPosition = 4
    let currentRotation = 0
    // 正在行进的 tetromino
    let current = theTetrominoes[random][currentRotation]

    // 定义 如何绘制tetromino
    function draw() {
        current.forEach(i => {
            squares[currentPosition + i].classList.add('tetromino')
            squares[currentPosition + i].style.backgroundColor = color[random]
        })
    }

    // 定义 如何擦除tetromino
    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino')
            squares[currentPosition + index].style.backgroundColor = ''

        })
    }

    // 定义 tetromino将如何坠落
    function moveDown(params) {
        undraw()
        currentPosition += width
        draw()
        freeze()
    }
    
    // 定义 何时不再坠落
    function freeze(params) {
        // 如果下一行有被 taken, 
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'))
            // 新的tetromino开始下落
            random = nextRandom
            nextRandom = Math.floor(Math.random() * theTetrominoes.length)
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4
            draw()
            drawPreview(nextRandom)
            addScore()
            isGameOver()
        }
    }
    
    // tetromino向下坠落
    let gameIsRunning = false // false为未进行,ture为正在进行
    let timerId = null
    function start() {
        gameIsRunning = true
        timerId = setInterval(moveDown, gameSpeed)
    }
    function pause() {
        gameIsRunning = false
        clearInterval(timerId)
    }
    const startBtn = document.querySelector('#start-button')
    startBtn.addEventListener('click', () => {
        gameIsRunning ? pause() : start()
    })

    // 定义 向左移动
    function moveLeft() {
        undraw()
        
        // 如果没到最左边,左移一格
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
        if(!isAtLeftEdge) currentPosition -= 1

        // 如果左边已经占用, 恢复原位
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1
        }
        
        draw()
    }

    // 定义 向右移动
    function moveRight() {
        undraw()
        
        // 如果没到最右边,右移一格
        const isRightEdge = current.some(index => (currentPosition + index) % width === width-1)
        if(!isRightEdge) currentPosition += 1

        // 如果右边已经占用, 恢复原位
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1
        }
        
        draw()
    }

    // 定义 转换状态
    function rotate() {
        undraw()
        currentRotation ++
        if(currentRotation === theTetrominoes[random].length) {
            currentRotation = 0
        }
        current = theTetrominoes[random][currentRotation]
        draw()
    }

    // 定义 按键控制
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

    // 定义 消除行并加分
    function addScore() {
        for(let i=0; i < 199; i +=width){
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
            if(row.every(value => squares[value].classList.contains('taken'))){
                score += 10
                scoreDisplay.innerHTML = score
                row.forEach(value => {
                    squares[value].classList.remove('taken')
                    squares[value].classList.remove('tetromino')
                    squares[value].style.backgroundColor = ''
                })
                let removedSquares = squares.splice(i, width)
                squares = removedSquares.concat(squares)
                squares.forEach(square => grid.appendChild(square))
            }
        }
    }
    
    // 定义 游戏结束
    function isGameOver() {
        if(current.some(value => squares[currentPosition + value].classList.contains('taken'))){
            gameIsRunning = false
            clearInterval(timerId)
            scoreDisplay.innerHTML = `游戏结束,得分为${score}.`
        }
    }

})