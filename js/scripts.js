const FIELD_SIZE_X = 20;    //Размер игрового поля по X
const FIELD_SIZE_Y = 20;    //Размер игрового поля по Y


var snake = []; //сама змейка

var gameIsRunning = false;  //Игра на старте не запущена
var direction = "y+"; //По умолчанию вниз (x+, x-, y-, y+)
var snakeSpeed = 300;   //Интервал в мс движения змейки
var snakeTimer; //таймер змейки
var foodTimer; //таймер еды
var score = 0;	//Очки
var wallX = 0; // координаты стены
var wallY = 0; // координаты стены

/*
    Функция инициализации игрового пространства
*/
function init(){
	prepareGameField();
	
	//вешаем на кнопку старта слушатель
	document.getElementById("snake-start").addEventListener("click", startGame);
	document.getElementById("snake-renew").addEventListener("click", refreshGame);
	
	//добавляем прослушиваение клавиатуры
	addEventListener("keydown", changeDirection);
}

/*
    Функция запуска игры
*/
function startGame(){
	gameIsRunning = true;
	respawn();
	
	snakeTimer = setInterval(move, snakeSpeed);
	setTimeout(createFood, 5000); //создаем еду
	setTimeout(createPoint, 5000); //создаем стену
	//setTimeout(deletePoint(wallX, wallY), 30000); //создаем стену
	
}

/*
    Функция организации новой игры
*/
function refreshGame(){
	location.reload();
}

/*
    Функция подготовки игрового поля
*/
function prepareGameField(){
	var gameTable = document.createElement("table");
	gameTable.setAttribute("class", "game-table");
	
	//в цикле генерируем ячейки игровой таблицы
	for(var i = 0; i < FIELD_SIZE_Y; i++){
		var row = document.createElement("tr");
		row.setAttribute("class", "game-table-row row-" + i);
		
		for(var j = 0; j < FIELD_SIZE_X; j++){
			var cell = document.createElement("td");
			cell.setAttribute("class", "game-table-cell cell-" + j + "-" + i);
			
			row.appendChild(cell);
		}
		
		gameTable.appendChild(row);
	}
	
	document.getElementById("snake-field").appendChild(gameTable);
}

/*
    Расположение змейки на игровом поле
    Стартовая длина змейки: 2 элемента (голова и хвост)
    Змейка - это массив элементов .game-table-cell
*/
function respawn(){
	//начинаем из центра
	var startCoordX = Math.floor(FIELD_SIZE_X / 2);
	var startCoordY = Math.floor(FIELD_SIZE_Y / 2);
	
	var snakeHead = document.getElementsByClassName("cell-" + startCoordX + "-" + startCoordY)[0];
	var prevSnakeHeadAttr = snakeHead.getAttribute("class");	//Сохраняем предыдущие классы ячейки прежде чем добавлять голову
	snakeHead.setAttribute("class", prevSnakeHeadAttr + " snake-unit");

	var snakeTail = document.getElementsByClassName("cell-" + startCoordX + "-" + (startCoordY - 1))[0];
	var prevSnakeTailAttr = snakeTail.getAttribute("class");	//Сохраняем предыдущие классы ячейки прежде чем добавлять хвост
	snakeTail.setAttribute("class", prevSnakeTailAttr + " snake-unit");
	
    //Добавляем хвост в массив змейки
	snake.push(snakeTail);
	//Добавляем голову в массив змейки
	snake.push(snakeHead);
}

/*
    Организация движения змейки
*/
function move(){
    //Соберем классы головы змейки
	var snakeHeadClasses = snake[snake.length - 1].getAttribute("class").split(" ");

	//Сдвигаем голову на 1 клетку
	var newUnit;
	var snakeCoords = snakeHeadClasses[1].split("-");
	var coordX = parseInt(snakeCoords[1]);
	var coordY = parseInt(snakeCoords[2]);
	
	//Определяем новую точку по направлению
	if(direction == "y+") {
		newUnit = document.getElementsByClassName("cell-" + coordX + "-" + (coordY + 1))[0];
		if(newUnit === undefined){
			newUnit = document.getElementsByClassName("cell-" + coordX + "-" + 0)[0];
		}
	}
	else if(direction == "y-") {
		newUnit = document.getElementsByClassName("cell-" + coordX + "-" + (coordY - 1))[0];
		if(newUnit === undefined){
			newUnit = document.getElementsByClassName("cell-" + coordX + "-" + (FIELD_SIZE_Y - 1))[0];
		}
	}
	else if(direction == "x+") {
		newUnit = document.getElementsByClassName("cell-" + (coordX + 1) + "-" + coordY)[0];
		if(newUnit === undefined){
			newUnit = document.getElementsByClassName("cell-" + 0 + "-" + coordY)[0];
		}
	}
	else if(direction == "x-") {
		newUnit = document.getElementsByClassName("cell-" + (coordX - 1) + "-" + coordY)[0];
		if(newUnit === undefined){
			newUnit = document.getElementsByClassName("cell-" + (FIELD_SIZE_X - 1) + "-" + coordY)[0];
		}
	}

	//console.log(newUnit);
	//проверяем, что newUnit - это не часть змейки
	//также проверяем, что змейка не дошла до границы
	if(!isSnakeUnit(newUnit) && newUnit !== undefined && !wallMeet(newUnit)){
		//добавляем новую часть змейки
		newUnit.setAttribute("class", newUnit.getAttribute("class") + " snake-unit");
		snake.push(newUnit);
		
		//если змейка не ела, подчищаем хвост
		if(!haveFood(newUnit)){
			//находим удаляемый элемент
			var removed = snake.splice(0, 1)[0];
			var classes = removed.getAttribute("class").split(" ");
			//удаляем маркирующий класс
			removed.setAttribute("class", classes[0] + " " + classes[1]);
		}
		//console.log(snake);
	}
	else{
		finishTheGame();
	}
}

/*
	Проверяем элемент на принадлежность змейке
	@param array element
*/
function isSnakeUnit(unit){
	var check = false;
	
	if(snake.includes(unit)){
		check = true;
	}
	
	return check;
}

/*
	Проверяем встречу со стеной
*/
function wallMeet(unit){
	var check = false;
	
	var unitClasses = unit.getAttribute("class").split(" ");

	//змейка наткнулась на стену
	if(unitClasses.includes("wall-unit")){check = true;}
	
	return check;
}

/*
	Проверяем встречу с едой
*/
function haveFood(unit){
	var check = false;
	
	var unitClasses = unit.getAttribute("class").split(" ");

	//змейка нашла еду
	if(unitClasses.includes("food-unit")){
		check = true;
		
		//создаём новую еду
		createFood();
		
		//увеличиваем очки
		score++;
		document.getElementById("rabbit-count").innerHTML = score;

	}
	
	return check;
}

/*
	Создаём еду
*/
function createPoint() {
	var pointCreated = false;
	
	while(!pointCreated){
		//выбираем случайную клетку
		var pointX = Math.floor(Math.random() * (FIELD_SIZE_X));
		var pointY = Math.floor(Math.random() * (FIELD_SIZE_Y));
		
		var pointCell = document.getElementsByClassName("cell-" + pointX + "-" + pointY)[0];
		var pointCellClasses = pointCell.getAttribute("class").split(" ");
		
		//если тут нет змейки или еды или стены
		if(!pointCellClasses.includes("snake-unit") && !pointCellClasses.includes("food-unit") && !pointCellClasses.includes("wall-unit")){
			//ставим точку сюда
			var classes = "";
			for(var i = 0; i < pointCellClasses.length; i++){
				classes += pointCellClasses[i] + " ";
			}
			
			// задаем коориднаты стены
			wallX = pointX;
			wallY = pointY;
			pointCell.setAttribute("class", classes + "wall-unit");	
			pointCreated = true;
			setTimeout(deletePoint, 3000);
		}
	}
}


/*
	Создаём еду
*/
function createFood(){
	var foodCreated = false;
	
	while(!foodCreated){
		//выбираем случайную клетку
		var foodX = Math.floor(Math.random() * (FIELD_SIZE_X));
		var foodY = Math.floor(Math.random() * (FIELD_SIZE_Y));
		
		var foodCell = document.getElementsByClassName("cell-" + foodX + "-" + foodY)[0];
		var foodCellClasses = foodCell.getAttribute("class").split(" ");
		
		//если тут нет змейки
		if(!foodCellClasses.includes("snake-unit") && !foodCellClasses.includes("food-unit") && !foodCellClasses.includes("wall-unit")){
			//ставим сюда еду
			var classes = "";
			for(var i = 0; i < foodCellClasses.length; i++){
				classes += foodCellClasses[i] + " ";
			}
			
			foodCell.setAttribute("class", classes + "food-unit");
			foodCreated = true;
		}
	}
}

function deletePoint(){
	

	var snakeHeadClasses = snake[snake.length - 1].getAttribute("class").split(" ");

	var deleteUnit = document.getElementsByClassName("cell-" + wallX + "-" + wallY)[0];
	var classes = deleteUnit.getAttribute("class").split(" ");

	deleteUnit.setAttribute("class", classes[0] + " " + classes[1]);
	setTimeout(createPoint, 5000);
}

/*
	Меняем направление движения змейки
*/
function changeDirection(e){
    switch(e.keyCode){
        case 37:  //если нажата клавиша влево
			//если до этого двигались вправо, то ничего не произойдет            
			if(direction != "x+")
				direction = "x-";
            break;
        case 38:   //если нажата клавиша вверх
			if(direction != "y+")
				direction = "y-";
            break;
        case 39:   //если нажата клавиша вправо
			if(direction != "x-")
				direction = "x+";            
            break;
        case 40:   //если нажата клавиша вниз
            if(direction != "y-")
				direction = "y+"; 
            break;
    }
}

/*
	Действия для завершения игры
*/
function finishTheGame(){
	gameIsRunning = false;
	clearInterval(snakeTimer);
	alert("GAME OVER! Your score is " + score);
}

//стартуем
window.onload = init;