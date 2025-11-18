document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToeGame();
    game.init();
});

class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.vsComputer = true;
        this.isGameOver = false;
    }

    init() {
        this.cacheDom();
        this.setupEventListeners();
        this.render();
    }

    cacheDom() {
        this.$cells = document.querySelectorAll('.cell');
        this.$gameState = document.getElementById('game-state');
        this.$resetBtn = document.getElementById('reset-btn');
        this.$multiplayerBtn = document.getElementById('multiplayer-btn');
        this.$playerIcon = document.getElementById('player-icon');
        this.$playerCount = document.getElementById('player-count');
    }

    setupEventListeners() {
        this.$cells.forEach(cell => 
            cell.addEventListener('click', this.handleCellClick.bind(this))
        );
        this.$resetBtn.addEventListener('click', this.reset.bind(this));
        this.$multiplayerBtn.addEventListener('click', this.updatePlayerCount.bind(this));
    }

    handleCellClick(event) {
        const index = event.target.dataset.index;

        if (this.board[index] || this.isGameOver) return;

        this.makeMove(index);

        if (this.vsComputer && !this.isGameOver && this.currentPlayer === 'O') {  // TODO: make computer be able to choose 'X' (also doesn't work)
            setTimeout(() => this.computerMove(), 300);
        }
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.render();

        if (this.checkWinner()) {
            this.endGame(`${this.currentPlayer} wins!`, true);
        } 
        else if (this.board.every(cell => cell !== null)) {
            this.endGame("It's a draw!", false);
        } 
        else {
            this.switchPlayer();
        }
    }

    computerMove() {
        const index = this.findBestMove();
        this.makeMove(index);
    }

    findBestMove() {
        const emptyCells = this.board
        .map((val, idx) => val === null ? idx : null)
        .filter(v => v !== null);

        // 1. Try to win
        for (const i of emptyCells) {
            const copy = [...this.board];
            copy[i] = 'O';

            if (this.checkWinner(copy)) return i;
        }

        // 2. Try to block X
        for (const i of emptyCells) {
            const copy = [...this.board];
            copy[i] = 'X';

            if (this.checkWinner(copy)) return i;
        }

        // 3. Otherwise play random
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateGameState();
    }

    render() {
        this.board.forEach((value, index) => {
            this.$cells[index].firstChild.textContent = value ? value : '';
        });
        this.updateGameState();
    }

    updateGameState() {
        this.$gameState.textContent = `Player ${this.currentPlayer}'s turn`;
    }

    updatePlayerCount() {
        this.vsComputer = !this.vsComputer;
        this.$playerCount.textContent = `${2 - this.vsComputer}P`;
        this.$playerIcon.src = `res/account${this.vsComputer ? '' : '-multiple'}.svg`
        this.reset();
    }

    checkWinner(board=null) {
        const combos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
        ];
        board = board || this.board;

        return combos.some((combo) => {
            const [a, b, c] = combo
            
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                this.winningCombo = combo;
                return true;
            }
            return false;
        });
    }

    highlightWinningLine(hasWinner) {
        if (!hasWinner) return;
        
        this.winningCombo.forEach(i => this.$cells[i].classList.add('win'));
    }

    endGame(message, hasWinner) {
        this.isGameOver = true;
        this.$gameState.textContent = message;
        this.highlightWinningLine(hasWinner);
    }

    reset() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.isGameOver = false;

        this.$cells.forEach(cell => cell.classList.remove('win'));

        this.render();
    }
}