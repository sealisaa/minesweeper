import React from 'react';
import '../style/style.css';

const mines = 40;
const rows = 16;
const columns = 16;
let cellsLeft = rows * columns - mines;
let cells = new Array(rows);
let startCellRow;
let startCellColumn;

for (let i = 0; i < cells.length; i++) {
    cells[i] = new Array(columns);
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameState: "notStarted",
            flagsCount: 0,
            secondsCount: 0,
            win: false,
            lose: false,
            fieldMouseDown: false,
            smileMouseDown: false
        }
        this.clearField();
    }

    clearField = () => {
        for (let i = 0; i < cells.length; i++) {
            for (let j = 0; j < cells[i].length; j++) {
                cells[i][j] = {
                    mine: false,
                    flag: false,
                    opened: false,
                    bombsCount: 0,
                    neighbors: [],
                    lost: false
                };
            }
        }
        cellsLeft = rows * columns - mines;
        this.setState({
            flagsCount: 0,
            secondsCount: 0
        });
    }

    placeMines = () => {
        let i = 0;
        while (i < mines) {
            let row = this.getRandomInt(rows);
            let column = this.getRandomInt(columns);
            if (row === startCellRow && column === startCellColumn) {
                continue;
            }
            if (!cells[row][column].mine) {
                cells[row][column].mine = true;
                i++;
                if (row > 0) {
                    cells[row - 1][column].bombsCount++;
                }
                if (row < rows - 1) {
                    cells[row + 1][column].bombsCount++;
                }
                if (column > 0) {
                    cells[row][column - 1].bombsCount++;
                }
                if (column < columns - 1) {
                    cells[row][column + 1].bombsCount++;
                }
                if (row > 0 && column > 0) {
                    cells[row - 1][column - 1].bombsCount++;
                }
                if (row < rows - 1 && column < columns - 1) {
                    cells[row + 1][column + 1].bombsCount++;
                }
                if (row < rows - 1 && column > 0) {
                    cells[row + 1][column - 1].bombsCount++;
                }
                if (row > 0 && column < columns - 1) {
                    cells[row - 1][column + 1].bombsCount++;
                }
            }
        }
        this.getNeighbors();
    }

    getNeighbors() {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                let cell = cells[i][j];
                if (i > 0) {
                    if (!cells[i - 1][j].mine) {
                        cell.neighbors.push({row: i - 1, column: j});
                    }
                }
                if (i < rows - 1) {
                    if (!cells[i + 1][j].mine) {
                        cell.neighbors.push({row: i + 1, column: j});
                    }
                }
                if (j > 0) {
                    if (!cells[i][j - 1].mine) {
                        cell.neighbors.push({row: i, column: j - 1});
                    }
                }
                if (j < columns - 1) {
                    if (!cells[i][j + 1].mine) {
                        cell.neighbors.push({row: i, column: j + 1});
                    }
                }
                if (i > 0 && j > 0) {
                    if (!cells[i - 1][j - 1].mine) {
                        cell.neighbors.push({row: i - 1, column: j - 1});
                    }
                }
                if (i < rows - 1 && j < columns - 1) {
                    if (!cells[i + 1][j + 1].mine) {
                        cell.neighbors.push({row: i + 1, column: j + 1});
                    }
                }
                if (i < rows - 1 && j > 0) {
                    if (!cells[i + 1][j - 1].mine) {
                        cell.neighbors.push({row: i + 1, column: j - 1});
                    }
                }
                if (i > 0 && j < columns - 1) {
                    if (!cells[i - 1][j + 1].mine) {
                        cell.neighbors.push({row: i - 1, column: j + 1});
                    }
                }
            }
        }
    }

    getRandomInt = (max) => {
        return Math.floor(Math.random() * max);
    }

    startGame = () => {
        this.setState({
            gameState: "started",
            win: false,
            lose: false,
            flagsCount: 0,
            secondsCount: 0
        });
        this.clearField();
        this.placeMines();
        this.timer = setInterval(() => this.tick(), 1000);
    }

    stopGame = () => {
        clearInterval(this.timer);
        this.setState({
            gameState: "notStarted"
        });
    }

    tick() {
        let currentSeconds = this.state.secondsCount;
        this.setState({secondsCount: currentSeconds + 1});
    }

    cellOnClickLeft = (e, i, j) => {
        switch (this.state.gameState) {
            case "notStarted":
                startCellRow = i;
                startCellColumn = j;
                this.startGame();
                this.clickCell(i, j, true);
                break;
            case "started":
                this.clickCell(i, j, false);
        }
    }

    clickCell(i, j, isFirstClick) {
        if (cells[i][j].mine && !isFirstClick) {
            cells[i][j].lost = true;
            this.stopGame();
            this.setState({lose: true});
        } else {
            this.openCell(i, j);
        }
    }

    openCell = (i, j) => {
        if (cells[i][j].opened) {
            return;
        }
        cells[i][j].opened = true;
        cellsLeft--;
        if (cellsLeft === 0) {
            this.setState({win: true});
            this.stopGame();
        }
        if (cells[i][j].bombsCount === 0) {
            this.checkNeighbors(i, j);
        }
    }

    checkNeighbors = (i, j) => {
        let cell = cells[i][j];
        for (let i = 0; i < cell.neighbors.length; i++) {
            this.openCell(cell.neighbors[i].row, cell.neighbors[i].column);
        }
    }

    cellOnClickRight = (e, i, j) => {
        e.preventDefault();
        if (this.state.gameState !== "started") {
            return;
        }
        let cell = cells[i][j];
        if (cell.opened) {
            return;
        }
        let currentFlags = this.state.flagsCount;
        if (!cell.flag) {
            cell.flag = true;
            this.setState({flagsCount: currentFlags + 1});
        } else {
            cell.flag = false;
            this.setState({flagsCount: currentFlags - 1});
        }
    }

    restartGame = () => {
        this.stopGame();
        this.clearField();
    }

    smileMouseDown = () => {
        this.setState({smileMouseDown: true});
    }

    smileMouseUp = () => {
        this.setState({smileMouseDown: false});
    }

    fieldMouseDown = () => {
        this.setState({fieldMouseDown: true});
    }

    fieldMouseUp = () => {
        this.setState({fieldMouseDown: false});
    }

    render() {
        let timerDigits = this.state.secondsCount.toString().split('');
        let flagsDigits = this.state.flagsCount.toString().split('');
        let smileStyle = "smile";
        if (this.state.fieldMouseDown) {
            smileStyle = "smile-surprised";
        } else if (this.state.smileMouseDown) {
            smileStyle = "smile-clicked";
        } else if (this.state.win) {
            smileStyle = "smile-glasses";
        } else if (this.state.lose) {
            smileStyle = "smile-dead";
        }
        return (
            <div className="game">
                <div className="game__header">
                    <div className="game__timer">
                        {timerDigits.length < 3 ? <div className="digit0"></div> : null}
                        {timerDigits.length < 2 ? <div className="digit0"></div> : null}
                        {timerDigits.map((digit) => {
                            return <div className={"digit" + digit}></div>
                        })}
                    </div>
                    <div
                        className={smileStyle}
                        onClick={this.restartGame}
                        onMouseDown={this.smileMouseDown}
                        onMouseUp={this.smileMouseUp}
                    ></div>
                    <div className="game__flags-count">
                        {flagsDigits.length < 3 ? <div className="digit0"></div> : null}
                        {flagsDigits.length < 2 ? <div className="digit0"></div> : null}
                        {flagsDigits.map((digit) => {
                            return <div className={"digit" + digit}></div>
                        })}
                    </div>
                </div>
                <div
                    className="game__field"
                    onMouseDown={this.fieldMouseDown}
                    onMouseUp={this.fieldMouseUp}
                >
                    {cells.map((row, i) => {
                        return (<div className="game__field-row">
                            {row.map((cell, j) => {
                                let className = "cell cell-simple";
                                if (cell.opened) {
                                    className = "cell cell-opened";
                                }
                                if (cell.flag) {
                                    if (!cell.mine && this.state.gameState === "notStarted") {
                                        className = "cell bomb-crossed";
                                    } else {
                                        className = "cell flag";
                                    }
                                } else if (cell.mine) {
                                    if (this.state.gameState === "notStarted") {
                                        if (cell.lost) {
                                            className = "cell bomb-red";
                                        } else {
                                            className = "cell bomb";
                                        }
                                    }
                                } else if (cell.bombsCount > 0 && cell.opened) {
                                    className = "cell num" + cell.bombsCount;
                                }
                                return <div
                                    className={className}
                                    onClick={(e) => this.cellOnClickLeft(e, i, j)}
                                    onContextMenu={(e) => this.cellOnClickRight(e, i, j)}
                                ></div>;
                            })}
                        </div>)
                    })}
                </div>
            </div>
        )
    }
}

export default Game;