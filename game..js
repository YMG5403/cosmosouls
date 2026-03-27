// --- НАСТРОЙКИ КАНВАСА ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Делаем холст на весь экран
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


// ---СОСТОЯНИЯ ИГРЫ (Game States) ---
// Это как переключатель: в каком меню мы сейчас находимся
const STATES = {
    MAIN_MENU: 'main_menu',
    SETTINGS: 'settings',
    CHAR_CREATION: 'char_creation',
    GAME_HUB: 'game_hub'
};
let currentState = STATES.MAIN_MENU;


// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
let mouse = { x: 0, y: 0, clicked: false };
let lastTime = 0;
let targetFPS = 60;

// Объекты UI элементов
const settingsUI = document.getElementById('settingsUI');
const charCreationUI = document.getElementById('charCreationUI');
const brSlider = document.getElementById('brightness');
const fpsInput = document.getElementById('fpsLimit');
const brOverlay = document.getElementById('brightnessOverlay');

// Данные персонажа (заготовка)
let playerPixels = []; // Тут будем хранить координаты черных точек лица


// --- СЛУШАТЕЛИ СОБЫТИЙ (КЛИКИ, МЫШЬ) ---
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mousedown', () => { mouse.clicked = true; });
window.addEventListener('mouseup', () => { mouse.clicked = false; });

// Логика кнопок HTML (Настройки, Создание перса)
document.getElementById('backToMenu').onclick = () => { changeState(STATES.MAIN_MENU); };
document.getElementById('finishChar').onclick = () => { finishCharacter(); };

// Логика слайдеров
brSlider.oninput = function() {
    // Инвертируем: 200% яркости -> 0 opacity оверлея, 10% яркости -> 0.9 opacity
    let val = this.value;
    let opacity = 1 - (val / 200);
    if(opacity < 0) opacity = 0;
    brOverlay.style.opacity = opacity;
};

fpsInput.onchange = function() { targetFPS = this.value; };


// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Функция переключения экранов
function changeState(newState) {
    currentState = newState;
    
    // Скрываем все HTML окна по умолчанию
    settingsUI.classList.add('hidden');
    charCreationUI.classList.add('hidden');

    // Показываем нужные HTML окна, если необходимо
    if (newState === STATES.SETTINGS) {
        settingsUI.classList.remove('hidden');
    } else if (newState === STATES.CHAR_CREATION) {
        charCreationUI.classList.remove('hidden');
        setupPixelEditor(); // Запускаем редактор лица
    }
}

// Функция для рисования светящегося текста/объектов на Канвасе
function drawGlowing(renderFunc) {
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 15;
    renderFunc();
    // Сбрасываем тень, чтобы не тормозило остальные элементы
    ctx.shadowBlur = 0; 
}


// --- КЛАССЫ ЭЛЕМЕНТОВ МЕНЮ ---

// Класс для кнопок, рисуемых внутри Canvas (Играть, Выход)
class CanvasButton {
    constructor(text, x, y, w, h, onClick) {
        this.text = text;
        this.x = x - w/2; // Центрируем
        this.y = y;
        this.w = w;
        this.h = h;
        this.onClick = onClick;
        this.isHovered = false;
    }

    update() {
        // Проверка наведения мыши
        if (mouse.x > this.x && mouse.x < this.x + this.w &&
            mouse.y > this.y && mouse.y < this.y + this.h) {
            this.isHovered = true;
            if (mouse.clicked) {
                this.onClick();
                mouse.clicked = false; // Предотвращаем двойной клик
            }
        } else {
            this.isHovered = false;
        }
    }

    draw() {
        ctx.font = "24px 'Courier New'";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.isHovered) {
            // Рисуем залитую кнопку при наведении
            drawGlowing(() => {
                ctx.fillStyle = 'white';
                ctx.fillRect(this.x, this.y, this.w, this.h);
                ctx.fillStyle = 'black';
                ctx.fillText(this.text, this.x + this.w/2, this.y + this.h/2);
            });
        } else {
            // Рисуем контурную кнопку
            drawGlowing(() => {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x, this.y, this.w, this.h);
                ctx.fillStyle = 'white';
                ctx.fillText(this.text, this.x + this.w/2, this.y + this.h/2);
            });
        }
    }
}

// Создаем кнопки главного меню
const menuButtons = [
    new CanvasButton("ИГРАТЬ", canvas.width/2, canvas.height/2, 200, 50, () => { changeState(STATES.CHAR_CREATION); }),
    new CanvasButton("НАСТРОЙКИ", canvas.width/2, canvas.height/2 + 70, 200, 50, () => { changeState(STATES.SETTINGS); }),
    new CanvasButton("ВЫХОД", canvas.width/2, canvas.height/2 + 140, 200, 50, () => { alert("Логика выхода (window.close) в браузере часто заблокирована."); })
];


// --- Отрисовка ГЛАВНОГО МЕНЮ ---
function drawMainMenu() {
    // 1. Фон
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Белая светящаяся Земля (сверху кнопок)
    drawGlowing(() => {
        ctx.beginPath();
        // Рисуем дугу внизу экрана
        ctx.arc(canvas.width / 2, canvas.height + 300, 400, Math.PI, 0);
        ctx.fillStyle = 'white';
        ctx.fill();
    });

    // 3. Логотип
    ctx.font = "bold 60px 'Courier New'";
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    drawGlowing(() => {
        ctx.fillText("COSMOSOULS", canvas.width / 2, canvas.height / 3);
    });

    // 4. Кнопки
    menuButtons.forEach(btn => {
        // Обновляем координаты кнопок при ресайзе
        btn.x = canvas.width / 2 - btn.w / 2;
        btn.update();
        btn.draw();
    });
}


// --- ПОДСИСТЕМА: СОЗДАНИЕ ПЕРСОНАЖА (Drawing Face) ---
const pCanvas = document.getElementById('pixelCanvas');
const pCtx = pCanvas.getContext('2d');
const PIXEL_SIZE = 5; // Размер одного "пикселя" для рисования
const GRID_SIZE = 100; // Размер зоны рисования

function setupPixelEditor() {
    pCtx.fillStyle = '#111';
    pCtx.fillRect(0,0, GRID_SIZE, GRID_SIZE);
    
    // Рисуем белый круг (основу духа)
    pCtx.beginPath();
    pCtx.arc(GRID_SIZE/2, GRID_SIZE/2, GRID_SIZE/2 - 5, 0, Math.PI*2);
    pCtx.fillStyle = 'white';
    pCtx.fill();

    // Очищаем массив точек при входе
    playerPixels = [];
    
    pCanvas.onmousedown = (e) => { paintPixel(e); pCanvas.onmousemove = paintPixel; };
    window.onmouseup = () => { pCanvas.onmousemove = null; };
}

function paintPixel(e) {
    // Получаем координаты клика относительно маленького канваса
    const rect = pCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE) * PIXEL_SIZE;
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE) * PIXEL_SIZE;

    // Проверяем, находится ли точка внутри круга (чтобы не рисовать за пределами духа)
    const centerX = GRID_SIZE / 2;
    const centerY = GRID_SIZE / 2;
    const radius = GRID_SIZE / 2 - 5;
    const dist = Math.sqrt((x - centerX)**2 + (y - centerY)**2);

    if (dist < radius) {
        pCtx.fillStyle = 'black';
        pCtx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
        // Сохраняем точку в массив
        playerPixels.push({x: x - centerX, y: y - centerY}); 
    }
}

function finishCharacter() {
    console.log("Лицо нарисовано. Точки:", playerPixels);
    changeState(STATES.GAME_HUB);
    alert("Персонаж создан! Дальше нужно программировать Меню Игры (Hub). В консоли браузера (F12) лежат данные лица.");
}



// --- ОСНОВНОЙ ИГРОВОЙ ЦИКЛ (Game Loop) ---
function gameLoop(timeStamp) {
    // Расчет FPS (необязательно для меню, но пригодится для игры)
    let deltaTime = timeStamp - lastTime;
    
    // В зависимости от состояния рисуем разные вещи
    if (currentState === STATES.MAIN_MENU) {
        drawMainMenu();
    } else if (currentState === STATES.GAME_HUB) {
        // Просто черный экран для заготовки
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillText("ЗДЕСЬ БУДЕТ ИГРОВОЙ ХАБ", canvas.width/2, canvas.height/2);
    }
    // Настройки и Создание персонажа рисуются HTML поверх канваса

    requestAnimationFrame(gameLoop);
}

// Запуск цикла
requestAnimationFrame(gameLoop);