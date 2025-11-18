document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToeGame();
    game.init();
});

function Player(name, difficulty=null) {
    this.name = name;
    this.difficulty = difficulty;
    this.isComputer = difficulty !== null;
    this.wins = 0;
}

class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill(null);
        this.players = { 'X': new Player('Player'), 'O': new Player('Average Joe', 3) };
        this.currentPlayer = 'X';
        this.vsComputer = true;
        this.isGameOver = false;
        this.winner = null;
    }

    init() {
        this.cacheDom();
        this.setupEventListeners();
        this.newGame();
    }

    cacheDom() {
        this.$page = document.getElementById('page');
        this.$cells = document.querySelectorAll('.cell');
        this.$gameState = document.getElementById('game-state');
        this.$resetBtn = document.getElementById('reset-btn');
        this.$multiplayerBtn = document.getElementById('multiplayer-btn');
        this.$swapBtn = document.getElementById('swap-btn');
        this.$themeBtn = document.getElementById('theme-btn');
        this.$playerIcon = document.getElementById('player-icon');
        this.$playerCount = document.getElementById('player-count');
        this.$nameX = document.querySelector('.playerX.name');
        this.$nameO = document.querySelector('.playerO.name');
        this.$scoreX = document.querySelector('.playerX.score');
        this.$scoreO = document.querySelector('.playerO.score');
    }

    setupEventListeners() {
        this.$cells.forEach(cell => cell.addEventListener('click', this.handleCellClick.bind(this)));
        this.$resetBtn.addEventListener('click', this.newGame.bind(this));
        this.$multiplayerBtn.addEventListener('click', this.updatePlayerCount.bind(this));
        this.$swapBtn.addEventListener('click', this.swapOrder.bind(this));
        this.$themeBtn.addEventListener('click', this.changeTheme.bind(this));
    }

    handleCellClick(event) {
        const index = event.target.dataset.index;

        if (this.board[index] || this.players[this.currentPlayer].isComputer || this.isGameOver) return;

        this.makeMove(index);
        this.computerMove();
    }

    makeMove(index) {
        this.board[index] = this.currentPlayer;

        if (this.checkWinner()) {
            this.winner = this.players[this.currentPlayer];
            this.endGame();
        } 
        else if (this.board.every(cell => cell !== null)) {
            this.endGame();
        } 
        else {
            this.switchPlayer();
        }
        this.render();
    }

    async computerMove() {
        if (!this.players[this.currentPlayer].isComputer || this.isGameOver) return;

        await this.delay(500);
        
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
    }

    render() {
        this.board.forEach((value, index) => {
            this.$cells[index].firstChild.textContent = value ? value : '';
        });
        this.updateGameState();
    }

    updateGameState() {
        if (!this.isGameOver) {
            this.$gameState.textContent = `${this.players[this.currentPlayer].name}'s turn (${this.currentPlayer})`;
        }
        else if (this.winner) {
            this.$gameState.textContent = `${this.winner.name} wins!`;
        }
        else {
            this.$gameState.textContent = "It's a draw!";
        }
    }

    swapOrder() {
        this.players = {'X': this.players.O, 'O': this.players.X};
        this.newGame();
    }

    updatePlayerCount() {
        this.vsComputer = !this.vsComputer;
        this.$playerCount.textContent = `${2 - this.vsComputer}P`;
        this.$playerIcon.src = `res/account${this.vsComputer ? '' : '-multiple'}.svg`;

        this.players = {'X': new Player('Player'), 'O': this.vsComputer ? new Player('Average Joe', 3) : new Player('Player2')};
        
        this.resetScore();
        this.newGame();
    }

    updateScoreboard() {
        this.$nameX.textContent = this.players.X.name;
        this.$nameO.textContent = this.players.O.name;
        this.$scoreX.textContent = this.players.X.wins;
        this.$scoreO.textContent = this.players.O.wins;
    }

    resetScore() {
        this.players.X.score = 0;
        this.players.O.score = 0;
    }

    checkWinner(board=null) {
        const combos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
        ];
        board = board || this.board;

        return combos.some((combo) => {
            const [a, b, c] = combo;
            
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                this.winningCombo = combo;
                return true;
            }
            return false;
        });
    }

    endGame() {
        this.isGameOver = true;

        if (!this.winner) return;
        
        this.winner.wins++;
        this.winningCombo.forEach(i => this.$cells[i].classList.add('win'));
        this.updateScoreboard();
    }

    newGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.isGameOver = false;
        this.winner = null;

        this.$cells.forEach(cell => cell.classList.remove('win'));

        this.updateScoreboard();
        this.updateGameState();
        this.render();
        this.computerMove();
    }

    changeTheme() {
        if (this.$page.classList.contains('dark')) this.$page.classList.remove('dark');
        else this.$page.classList.add('dark');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}