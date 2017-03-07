// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos

// Consts Game.
const WIDTH = 512;
const HEIGHT = 480;
const HALFW = WIDTH / 2;
const HALFH = HEIGHT / 2;
const MOVEDOWN = 40, MOVEUP = 38, MOVERIGHT = 39, MOVELEFT = 37;
const OFFSETFOREST = 32;

const OFFSETCENTER = 128;
const CENTERMINY = HALFH - OFFSETCENTER, CENTERMAXY = HALFH + OFFSETCENTER;
const CENTERMINX = HALFW - OFFSETCENTER, CENTERMAXX = HALFW + OFFSETCENTER;

const NUMSTONES = 0, NUMTROLS = 0, MAXSTONES = 12, MAXTROLS = 12;
const X = 0, Y = 1;

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;
document.body.appendChild(canvas);

function loadImage (path) {
	var ImgReady = new Object();

	ImgReady.image = new Image();
	ImgReady.ready = false;

	ImgReady.image.onload = function () {
		ImgReady.ready = true;
	}();
	ImgReady.image.src = path;

	return ImgReady;
};

var Game = {
	bg 	   : null,
	hero	   : null,
	princess : null,
	stones   : null,
	trolls   : null,
	saved    : false,
};

// Images background, heroe, princess.
Game.bg = loadImage("images/background.png");
Game.hero = loadImage("images/hero.png");
Game.princess = loadImage("images/princess.png");
Game.stones = loadImage("images/stone.png");
Game.trolls = loadImage("images/monster.png");

// Game Parameters.
Game.hero.speed = 256;
Game.princess.caught = 0;
Game.stones.num = NUMSTONES;
Game.trolls.num = NUMTROLS;
Game.trolls.speed = 64;

Game.trolls = setInitialRandom(Game, Game.trolls);
Game.stones = setInitialRandom(Game, Game.stones);

function putCenter(object) {
	object.x = HALFW;
	object.y = HALFH;

	return object;
}

function getRandomInt(min , max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function isCenter(object) {
	return object.x > CENTERMINX && object.x < CENTERMAXX && object.y > CENTERMINY && object.y < CENTERMAXY;
}

function setRandom(object) {
	min = OFFSETFOREST;
	max = Math.floor(canvas.width - OFFSETFOREST - 32);
	object.x = getRandomInt(max, min);

	max = Math.floor(canvas.height - OFFSETFOREST - 32);
	object.y = getRandomInt(max, min);

	return object
}

function isOn(mapObject, object) {
	if (mapObject == object) {
		// Same object....
		return false;
	}
	return object.x > (mapObject.x - 30) && object.x < (mapObject.x + 30) &&
			object.y > (mapObject.y - 30) && object.y < (mapObject.y + 30);
}

function isOnItems(mapItems, object) {
	// The item must be created in initialRandom position to can see if
	// we are inside one...
	var pos = 0;
	while (mapItems[pos] != undefined && pos < mapItems.num) {
		if (isOn(mapItems[pos], object) && mapItems[pos] != object) {
			return true;
		}
		pos++;
	}
	return false;
}


function isOnObject(game, object) {
	return isOn(game.princess, object) || isOnItems(game.stones, object) ||
			isOnItems(game.trolls, object);
}

function putRandom(game, object) {
	object.x = 0, object.y = 0;
	do {
		object = setRandom(object);
	} while (isCenter(object) || isOnObject(game, object));
	return object;
}

function putItems(game, mapItems) {
	for (var i = 0 ; i < mapItems.num; i++) {
		mapItems[i] = putRandom(game, mapItems[i]);
	}
	return mapItems;
}

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

function move(object, modifier) {
	if (MOVEUP in keysDown) { // Player holding up
		object.y -= object.speed * modifier;
	}
	if (MOVEDOWN in keysDown) { // Player holding down
		object.y += object.speed * modifier;
	}
	if (MOVELEFT in keysDown) { // Player holding left
		object.x -= object.speed * modifier;
	}
	if (MOVERIGHT in keysDown) { // Player holding right
		object.x += object.speed * modifier;
	}
	return object;
}

// Save last move to check
// limits and not move...
function saveMove(object) {
	object.lastMove = new Object();

	object.lastMove.x = object.x;
	object.lastMove.y = object.y

	return object;
}

function setLastMove(object) {
	if (object.lastMove.x == undefined || object.lastMove.y == undefined) {
		return object;
	}
	object.x = object.lastMove.x;
	object.y = object.lastMove.y;

	return object;
}

function setScore (ctx , princess) {
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	var text = "Princesses caught: " + princess.caught;
	text += "\t" + "Level : " + Math.floor(princess.caught / 10);
	ctx.fillText(text , 32, 32);
}

function setImage(ctx, img, x , y) {
	if (img.ready) {
		ctx.drawImage(img.image, x, y);
	}
}

function setInitialRandom(game, object) {	object.x = 0, object.y = 0;
	for (var i = 0; i < object.num ; i++) {
		object[i] = new Object();
		object[i] = putRandom(game, object[i]);
	}
	return object;
}

function putImages(game, object) {
	for (var i = 0 ; i < object.num; i++) {
		setImage(ctx, object, object[i].x , object[i].y);
	}
	return object;
}

function isTouching (src, dst) {
	return src.x <= (dst.x + 16) && dst.x <= (src.x + 16) &&
			src.y <= (dst.y + 16) && dst.y <= (src.y + 32);
}


function isLimit(x , y) {
	return x < OFFSETFOREST || x > canvas.width - OFFSETFOREST - 32 ||
			y < OFFSETFOREST || y > canvas.height - OFFSETFOREST - 32;
}

function isMove(game, object) {
	return !isLimit(object.x, object.y) && !isOnItems(game.stones, object);
}

function isWinner(princess, hero) {
	return isTouching(princess , hero);
}

function isLost(hero, game) {
	for (var i = 0; i < game.trolls.num; i++) {
		if (isTouching(hero, game.trolls[i])) {
			return true;
		}
	}
	return false;
}

function getRandom() {
	var pos = Math.floor(Math.random() * 2);
	var sign = Math.random() > 0.5;

	if (sign) {
		pos = pos * (-1);
	}
	return pos;
}

function isMoveItem(game, item) {
	return isMove(game, item) && !isOnObject(game, item);
}

function invalidOr(x , y) {
	return x == 0 && y == 0;
}

function setNewConst(item) {
	item.or = [0 , 0];
	do {
		item.or[X] = getRandom();
		item.or[Y] = getRandom();
	} while (invalidOr(item.or[X] , item.or[Y]));
	return item;
}

function moveConstant(item, nframes) {
	item = saveMove(item);

	if (nframes % 260 == 0 || nframes == 0) {
		item = setNewConst(item);
	}

	if (nframes % 3 == 0) {
		item.x += item.or[X];
		item.y += item.or[Y];
	}
	return item;
}

function moveRandom(game, object, nframes) {
	for (var i = 0 ; i < object.num ; i++) {
		if (isMoveItem(game, object[i])) {
			object[i] = moveConstant(object[i] , nframes);
		} else {
			// hit with and object or limits new move patron....
			object[i] = setLastMove(object[i]);
			object[i] = setNewConst(object[i]);
		}
	}
	return object;
}

function newItems(game, items, max) {
	if (items.num > max) {
		items.num = max;
	}
	items = setInitialRandom(game, items);
 	items = putItems(game, items);
	return items;
}

function savePrincess(princess) {
	localStorage.setItem('princess_caugth', princess.caught);
	localStorage.setItem('princess_x', princess.x);
	localStorage.setItem('princess_y', princess.y);
}

function savedHero(hero) {
	localStorage.setItem('hero_x', Math.floor(hero.x));
	localStorage.setItem('hero_y', Math.floor(hero.y));
}

function loadPrincess(princess) {
	princess.caught = localStorage.getItem('princess_caugth');

	princess.x = localStorage.getItem('princess_x');
	princess.y = localStorage.getItem('princess_y');

	return princess
}

function loadHero(hero) {
	hero.x = localStorage.getItem('hero_x');
	hero.y = localStorage.getItem('hero_y');

	return hero;
}

function saveGame() {
	localStorage.setItem('game_saved', true);
}

function loadGame() {
	return localStorage.getItem('game_saved');
}

var nframes = 0;
// Reset the game when the player catches a princess.
var reset = function (game) {

	game.princess = putRandom(game, game.princess);
	game.hero = putCenter(game.hero);

	game.trolls = newItems(game, game.trolls, MAXTROLS);
	game.stones = newItems(game, game.stones, MAXSTONES);

	nframes = -1;
	return game;
};

// Update game objects
var update = function (game, modifier) {
	// Fighting for the princess!!
	if (isMove(game, game.hero)) {
		game.hero = saveMove(game.hero);
		move(game.hero, modifier);
	} else {
		game.hero = setLastMove(game.hero);
	}
	savedHero(game.hero);
	moveRandom(game, game.trolls, nframes);

	// Warrior Winner!!
	if (isWinner(game.princess, game.hero)) {
		game.princess.caught++;
		game.trolls.num = Math.floor(game.princess.caught / 10);
		game.stones.num = Math.floor(game.princess.caught / 10);
		game = reset(game);
	}
	// Warrior Lost!! The trolls gone with his live.
	if (isLost(game.hero, game)) {
		game.trolls.num = 0;
		game.stones.num = 0;
		game.princess.caught = 0;
		game = reset(game);
	}
	return game;
};

// Draw everything
var render = function (game) {

	// Draw background...
	setImage(ctx, game.bg, 0 , 0);

	// Draw hero..
	setImage(ctx , game.hero, game.hero.x, game.hero.y);

	// Draw princess object image...
	setImage(ctx, game.princess , game.princess.x, game.princess.y);

	// Draw Score...
	setScore(ctx, game.princess);

	// Draw stones.
	game.stones = putImages(game, game.stones);

	// Draw trolls...
	game.trolls = putImages(game, game.trolls);

	return game;
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	Game = update(Game, delta / 1000 , nframes);
	Game = render(Game, delta);

	nframes++;
	then = now;
};

Game.saved = loadGame();

Game = reset(Game);
saveGame(Game);

var then = Date.now();
// The setInterval() method will wait a specified number of milliseconds, and then execute a specified function,
// and it will continue to execute the function, once at every given time-interval.
// Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible.
