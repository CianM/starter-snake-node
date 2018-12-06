const PF = require('pathfinding');

const util = require('util');
const log = (obj) => console.log(util.inspect(obj, { showHidden: false, depth: null }));

const MOVE = {
	UP: "up",
	RIGHT: "right",
	DOWN: "down",
	LEFT: "left"
};

module.exports = class Game {

	// board;
	// finder;

	// target;
	// path;

	constructor(you, { height: size, snakes }) {
		this._createBoard(you, size, snakes);
		this._createFinder();
	}

	move(you, { food, height: size, snakes }) {
		log(you)
		let path;
		this._createBoard(you, size, snakes);
		// 1. Check if any smaller snakes nearby
		const otherSnakes = snakes.filter(snake => snake.id !== you.id);
		path = this._findNearestSnake(you, otherSnakes);
		if(path.length === 1) { // Right beside smaller snake
			return this.direction(path[0], path[1]);
		}

		console.log({snakePath: path})
		// 2. Move towards nearest food
		path = this._findNearestFood(you.body[0], food);
		//console.log({path})

		// 3. If no path, chase tail
		if(path.length) {
			return this.direction(path[0], path[1]);
		}
		
		path = this._findTail(you);
		//log({path});

		// 4. Find best direction as last resort


	
		return this.direction(path[0], path[1]);
	}

	direction(curr, next) {
		console.log("DIR", curr, next)
		if(curr[0] < next[0]) {
			return MOVE.RIGHT;
		}
		else if(curr[0] > next[0]) {
			return MOVE.LEFT;
		}
		else if(curr[1] < next[1]) {
			return MOVE.DOWN;
		}
		else {
			return MOVE.UP;
		}
	}

	_findNearestSnake(you, snakes) {
		const yourLength = you.body.length;
		const shorterSnakes = snakes.filter(snake => snake.body.length < yourLength);

		if(!shorterSnakes.length) {
			return [];
		}

		

		const yourHead = you.body[0];
		const snakeHeads = shorterSnakes.map(snake => snake.body[0]);

		// Set snakeheads walkable
		for(const { x, y } of snakeHeads) {
			this.board.setWalkableAt(x, y, true);
		}

		let nearest = this._findPath(yourHead, snakeHeads[0]);

		for(const snake of snakeHeads) {
			const path = this._findPath(yourHead, snake);
			//console.log({ path, length: path.length})
			nearest = path.length >= 1 && path.length < nearest.length ? path : nearest;
		}
		console.log("nearest", nearest);
		return nearest;
	}


	_findNearestFood(head, foodArray) {
		let nearest = this._findPath(head, foodArray[0]);

		for(const food of foodArray) {
			const path = this._findPath(head, food);
			//console.log({ path, length: path.length})
			nearest = path.length >= 1 && path.length < nearest.length ? path : nearest;
		}

		return nearest;
	}

	_findTail(you) {
		const head = you.body[0];
		const [tail] = you.body.slice(-1);

		return this._findPath(head, tail);
	}

	_findPath({ x: currX, y: currY }, { x: targetX, y: targetY }) {
		return this.finder.findPath(currX, currY, targetX, targetY, this.board.clone());
	}

	_createBoard(you, size, snakes) {
		const clearBoard = this._createGrid(size);
		const boardWithObstacles = this._addGridObstacles(clearBoard, snakes);
		
		this.board = new PF.Grid(boardWithObstacles);
		this._setOwnHeadTailWalkable(you.body);
	}

	_createFinder() {
		this.finder = new PF.AStarFinder();
	}

	_createGrid(size) {
		const row = Array(size).fill(0);
		return Array(size).fill().map(_ => [...row]);
	}

	_addGridObstacles(board, snakes) {
		const obstacles = snakes.reduce((acc, snake) => [...acc, ...snake.body], []);
		for(const { x, y } of obstacles) {
			board[y][x] = 1;
		}

		return board;
	}

	_setOwnHeadTailWalkable(body) {
		const head = body[0];
		const [tail] = body.slice(-1);
		
		this.board.setWalkableAt(head.x, head.y, true);
		this.board.setWalkableAt(tail.x, tail.y, true);
	}
}