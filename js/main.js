window.Life = (function() {
	var board = [];
	var $board = $('#board');
	var $hud = $('#hud');
	var timeout;
	var cellSize = 20;
	var playing = false;
	var frame = 500;
	var gen = 1;
	var mousedown = false;
	var color = 167;
	var startingSaturation = 50;
	var minSaturation = 0;
	var startingLightness = 50;
	var maxLightness = 100;

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

	function defaultRows() {
		return Math.floor(window.innerHeight / cellSize);
	}

	function defaultCols() {
		return Math.floor(window.innerWidth / cellSize);
	}

	function init(rows, cols) {
		readHash();
		initBoard(rows, cols);
		hud();
		addMouseHandlers();
		addKeyBindings();
	}

	function regenerate() {
		initBoard();
		gen = 1;
		print();
	}

	function initBoard(rows, cols) {
		board = createBoard(rows, cols);
		initPrintBoard();
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
		Mousetrap.bind('h', toggleHud);
		Mousetrap.bind('u', colorUp);
		Mousetrap.bind('d', colorDown);
		Mousetrap.bind('r', regenerate);
		Mousetrap.bind('s', setHash);
	}

	function createBoard(rows, cols) {
		rows = rows || defaultRows();
		cols = cols || defaultCols();
		var tempBoard = [];
		for (var r = 0; r < rows; r++) {
			var row = [];
			for (var c = 0; c < cols; c++) {
				var val = Math.round(Math.random());
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
		for (var row = 0; row < board.length; row++) {
			for (var col = 0; col < board[0].length; col++) {
				board[row][col].alive = false;
				board[row][col].lastAlive = undefined;
				board[row][col].nextAlive = false;
			}
		}
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
		// pause();
		frame = newFrame;
		// play();
	}

	function hud() {
		var fps = 1000 / frame;
		var dispFps = Math.round(fps * 1000) / 1000;
		$hud.empty();
		$hud.append($('<p>').text(board.length + ' rows'));
		$hud.append($('<p>').text(board[0].length + ' columns'));
		$hud.append($('<p>').text(gen + ' generations'));
		$hud.append($('<p>').text(dispFps + ' fps'));
		$hud.append($('<p>').text('hue: ' + color));
		var $small = $('<small>');
		$small.append($('<p>').text('space pause'));
		$small.append($('<p>').text('n     next frame'));
		$small.append($('<p>').text('r     regenerate'));
		$small.append($('<p>').text('x     clear'));
		$small.append($('<p>').text('>     faster'));
		$small.append($('<p>').text('<     slower'));
		$small.append($('<p>').text('h     toggle hud'));
		$small.append($('<p>').text('u     hue up'));
		$small.append($('<p>').text('d     hue down'));
		$small.append($('<p>').text('s     save state'));
		$hud.append($small);
	}

	function toggleHud() {
		$hud.toggle();
	}

	function colorUp() {
		color++;
		print();
	}

	function colorDown() {
		color--;
		print();
	}

	function faster() {
		changeFrame(frame / 1.2);
	}

	function slower() {
		changeFrame(frame * 1.2);
	}

	function initPrintBoard() {
		$board.empty();
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
				$line.append($cell);
			}
			$board.append($line);
		}
	}

	function print() {
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
		hud();
	}

	function birth(cell) {
		setColor(cell, 0);
	}

	function kill(cell, lastAlive) {
		setColor(cell, lastAlive);
	}

	function setColor(cell, lastAlive) {
		cell.css(
			'background',
			'hsl(' +
				color + ', ' +
				(saturation(lastAlive)) + '%, ' +
				(lightness(lastAlive)) + '%)'
		);
	}

	function saturation(lastAlive) {
		// return lastAlive === 0 ? 50 : 0;
		lastAlive = lastAlive === undefined ? 20 : lastAlive;
		return (minSaturation + (startingSaturation - minSaturation) / 1.5 ** lastAlive);
	}

	function lightness(lastAlive) {
		// return lastAlive === 0 ? 50 : 100;
		lastAlive = lastAlive === undefined ? 20 : lastAlive;
		return (maxLightness - (maxLightness - startingLightness) / 2 ** lastAlive);
	}

	function readHash() {
		var hash = window.location.hash;
		if (hash.length <= 1) {
			return;
		}

		var state = JSON.parse(decodeURIComponent(hash.substring(1, hash.length)));
		frame = state.frame;
		cellSize = state.cellSize;
		color = state.color;
		startingLightness = state.startingLightness;
		maxLightness = state.maxLightness;
		startingSaturation = state.startingSaturation;
		minSaturation = state.minSaturation;
	}

	function setHash() {
		var state = {
			// board: board,
			frame: frame,
			cellSize: cellSize,
			color: color,
			startingLightness: startingLightness,
			maxLightness: maxLightness,
			startingSaturation: startingSaturation,
			minSaturation: minSaturation
		}
		window.location.hash =JSON.stringify(state);
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
		board: getBoard,
		initBoard: initBoard,
		lightness: lightness,
		saturation: saturation
	};
})();

$(function() {
	Life.init();
	Life.play();
});
