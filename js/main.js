window.Life = (function() {
	var board = [];
	var $board = $('#board');
	var $hud = $('#hud');
	var timeout;
	var cellSize = 20;
	var defaultRows = Math.floor(window.innerHeight / cellSize);
	var defaultCols = Math.floor(window.innerWidth / cellSize);
	var playing = false;
	var frame = 500;
	var gen = 1;
	var mousedown = false;

	function Cell(alive) {
		this.alive = alive || false;
		this.lastAlive = alive ? 0 : undefined;
		this.nextAlive = false;

		this.evolve = function() {
			if (this.nextAlive) {
				this.lastAlive = 0;
			} else {
				if (this.lastAlive) {
					this.lastAlive++;
				} else if (this.alive) {
					this.lastAlive = 1;
				}
			}
			this.alive = this.nextAlive;
		}

		this.toggle = function() {
			this.nextAlive = !this.alive;
			this.evolve();
		}
	}

	function init(rows, cols) {
		board = createBoard(rows, cols, true);

		hud();
		addMouseHandlers();
		addKeyBindings();
	}

	function addMouseHandlers() {
		$board.on('mousedown', 'p span', function(evt) {
			evt.preventDefault();
			toggleCell(this);
			mousedown = true;
		});

		$('body').on('mouseup', function(evt) {
			mousedown = false;
		});

		$board.on('mouseenter', 'p span', function(evt) {
			if (mousedown) {
				toggleCell(this);
			}
		});
	}

	function toggleCell(cell) {
		var $cell = $(cell);
		var r = $cell.data('r');
		var c = $cell.data('c');
		board[r][c].toggle();
		print();
	}

	function addKeyBindings() {
		Mousetrap.bind('space', togglePlay);
		Mousetrap.bind('n', next);
		Mousetrap.bind('x', clear);
		Mousetrap.bind('>', faster);
		Mousetrap.bind('<', slower);
	}

	function createBoard(rows, cols, random) {
		rows = rows || defaultRows;
		cols = cols || defaultCols;
		var tempBoard = [];
		for (var r = 0; r < rows; r++) {
			var row = [];
			for (var c = 0; c < cols; c++) {
				var val = random ? Math.round(Math.random()) : 0;
				var alive = val === 1;
				row.push(new Cell(alive));
			}
			tempBoard.push(row);
		}
		return tempBoard;
	}

	function next() {
		var rows = board.length;
		var cols = board[0].length;
		// var newBoard = createBoard(rows, cols);
		for (var r = 0; r < rows; r++) {
			for (var c = 0; c < cols; c++) {
				judge(rows, cols, r, c);
			}
		}
		for (var r = 0; r < rows; r++) {
			for (var c = 0; c < cols; c++) {
				var cell = board[r][c];
				cell.evolve();
			}
		}
		gen++;
		print();
	}

	function judge(rows, cols, r, c) {
		var cell = board[r][c];
		var upRow = (r - 1 < 0) ? (rows - 1) : r - 1;
		var downRow = (r + 1 >= rows) ? 0 : r + 1;
		var leftCol = (c - 1 < 0) ? (cols - 1) : c - 1;
		var rightCol = (c + 1 >= cols) ? 0 : c + 1;
		var neighbors = 0;
		$.each([
			[upRow, leftCol],
      [upRow, c],
      [upRow, rightCol],
      [r, leftCol],
      [r, rightCol],
      [downRow, leftCol],
      [downRow, c],
      [downRow, rightCol]
		], function(_, coords) {
			if (board[coords[0]][coords[1]].alive) {
				neighbors++;
			}
		});
		var nextAlive = false;
		if (cell.alive) {
			if (neighbors < 2) {
			} else if (neighbors > 3) {
			} else {
				nextAlive = true;
			}
		} else {
			if (neighbors === 3) {
				nextAlive = true;
			} else {
			}
		}
		cell.nextAlive = nextAlive;
	}

	function clear() {
		board = createBoard();
		print();
	}

	function play(time) {
		time = time || frame;
		timeout = setInterval(next, time);
		playing = true;
	}

	function pause() {
		clearInterval(timeout);
		playing = false;
	}

	function togglePlay() {
		if (playing) {
			pause();
		} else {
			play();
		}
	}

	function changeFrame(newFrame) {
		pause();
		frame = newFrame;
		play();
	}

	function hud() {
		var text = ''
		var fps = 1000 / frame;
		var dispFps = Math.round(fps * 1000) / 1000;
		text += board.length + " rows\n";
		text += board[0].length + " columns\n";
		text += gen + " generations\n";
		text += dispFps + " fps\n";
		$hud.text(text);
	}

	function faster() {
		changeFrame(frame / 1.2);
	}

	function slower() {
		changeFrame(frame * 1.2);
	}

	function print() {
		if ($board.is('.init')) {
			for (var r = 0; r < board.length; r++) {
				for (var c = 0; c < board[0].length; c++) {
					var $cell = $board.find('p').eq(r).find('span').eq(c);
					if (board[r][c].alive) {
						birth($cell);
					} else {
						kill($cell, board[r][c].lastAlive);
					}
				}
			}
		} else {
			var $output = $('<div>');
			for (var r = 0; r < board.length; r++) {
				var row = board[r];
				var $line = $('<p>');
				$line.css('height', cellSize + 'px');
				for (var c = 0; c < row.length; c ++) {
					var $cell = $('<span>');
					$cell.attr('data-r', r);
					$cell.attr('data-c', c);
					$cell.css('width', cellSize + 'px');
					$cell.css('height', cellSize + 'px');
					if (board[r][c].alive) {
						birth($cell);
					}
					$line.append($cell);
				}
				$output.append($line);
			}
			$board.html($output.html());
			$board.addClass('init');
		}
		hud();
	}

	function birth(cell) {
		cell.addClass('alive');
		cell.attr('data-lives', 0);
	}

	function kill(cell, lastAlive) {
		cell.removeClass('alive');
		cell.attr('data-lives', lastAlive);
	}

	function getBoard() {
		return board;
	}

	return {
		init: init,
		next: next,
		play: play,
		pause: pause,
		print: print,
		clear: clear,
		board: getBoard
	};
})();

$(function() {
	Life.init();
	Life.play();
});
