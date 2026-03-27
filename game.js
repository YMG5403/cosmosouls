// --- НАСТРОЙКИ КАНВАСА ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- СОСТОЯНИЯ ---
const STATES = {
    MAIN_MENU: 'main_menu',
    SETTINGS: 'settings',
    CHAR_CREATION: 'char_creation',
    GAME_HUB: 'game_hub'
};
let currentState = STATES.MAIN_MENU;
let currentHubTab = 'none'; // 'shop', 'inventory', 'friends', 'play'

// --- ДАННЫЕ ИГРОКА ---
let playerID = "#SOUL" + Math.floor(Math.random() * 1000 + 1);
let playerPixels = []; // Тут хранится лицо
let showProfile = false;

// --- МЫШЬ ---
let mouse = { x: 0, y: 0, clicked: false };
window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mousedown', () => { mouse.clicked = true; });
window.addEventListener('mouseup', () => { mouse.clicked = false; });

// --- UI ЭЛЕМЕНТЫ (HTML) ---
const settingsUI = document.getElementById('settingsUI');
const charCreationUI = document.getElementById('charCreationUI');
const brSlider = document.getElementById('brightness');
const brOverlay = document.getElementById('brightnessOverlay');

document.getElementById('backToMenu').onclick = () => { changeState(STATES.MAIN_MENU); };
document.getElementById('finishChar').onclick = () => { finishCharacter(); };

brSlider.oninput = function() {
    brOverlay.style.opacity = 1 - (this.value / 200);
};

// --- ФУНКЦИИ ---
function changeState(newState) {
    currentState = newState;
    settingsUI.classList.add('hidden');
    charCreationUI.classList.add('hidden');
    if (newState === STATES.SETTINGS) settingsUI.classList.remove('hidden');
    if (newState === STATES.CHAR_CREATION) {
        charCreationUI.classList.remove('hidden');
        setupPixelEditor();
    }
}

function drawGlowing(renderFunc, color = 'white', blur = 15) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    renderFunc();
    ctx.shadowBlur = 0;
}

// --- КЛАСС КНОПКИ ---
class Button {
    constructor(text, x, y, w, h, onClick) {
        this.text = text; this.x = x; this.y = y; this.w = w; this.h = h; this.onClick = onClick;
    }
    update() {
        if (mouse.x > this.x && mouse.x < this.x + this.w && mouse.y > this.y && mouse.y < this.y + this.h) {
            if (mouse.clicked) { this.onClick(); mouse.clicked = false; }
            return true;
        }
        return false;
    }
    draw() {
        let hover = this.update();
        drawGlowing(() => {
            ctx.strokeStyle = 'white';
            ctx.fillStyle = hover ? 'white' : 'black';
            ctx.strokeRect(this.x, this.y, this.w, this.h);
            if(hover) ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.fillStyle = hover ? 'black' : 'white';
            ctx.font = "18px 'Courier New'";
            ctx.textAlign = 'center';
            ctx.fillText(this.text, this.x + this.w/2, this.y + this.h/2 + 5);
        });
    }
}

// Кнопки главного меню
const mainButtons = [
    new Button("ИГРАТЬ", 0, 0, 200, 50, () => changeState(STATES.CHAR_CREATION)),
    new Button("НАСТРОЙКИ", 0, 0, 200, 50, () => changeState(STATES.SETTINGS)),
    new Button("ВЫХОД", 0, 0, 200, 50, () => alert("Выход"))
];

// Кнопки Хаба (слева)
const hubButtons = [
    new Button("ИГРАТЬ", 20, 100, 150, 40, () => currentHubTab = 'play'),
    new Button("ИНВЕНТАРЬ", 20, 150, 150, 40, () => currentHubTab = 'inventory'),
    new Button("МАГАЗИН", 20, 200, 150, 40, () => currentHubTab = 'shop'),
    new Button("ДРУЗЬЯ", 20, 250, 150, 40, () => currentHubTab = 'friends'),
    new Button("ВЫЙТИ", 20, 300, 150, 40, () => changeState(STATES.MAIN_MENU))
];

// --- РЕДАКТОР ЛИЦА ---
const pCanvas = document.getElementById('pixelCanvas');
const pCtx = pCanvas.getContext('2d');
function setupPixelEditor() {
    pCtx.fillStyle = 'white';
    pCtx.beginPath(); pCtx.arc(50, 50, 45, 0, Math.PI*2); pCtx.fill();
    playerPixels = [];
    pCanvas.onmousedown = (e) => { paint(e); pCanvas.onmousemove = paint; };
    window.onmouseup = () => pCanvas.onmousemove = null;
}
function paint(e) {
    const rect = pCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left)/5)*5;
    const y = Math.floor((e.clientY - rect.top)/5)*5;
    pCtx.fillStyle = 'black';
    pCtx.fillRect(x, y, 5, 5);
    playerPixels.push({x: x-50, y: y-50});
}
function finishCharacter() { changeState(STATES.GAME_HUB); }

// --- ОТРИСОВКА ЭКРАНОВ ---

function drawLoading(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Date.now() / 200);
    ctx.strokeStyle = 'white';
    ctx.beginPath(); ctx.arc(0,0, 20, 0, Math.PI); ctx.stroke();
    ctx.restore();
    ctx.fillText("ЗАГРУЗКА...", x, y + 50);
}

function drawHub() {
    ctx.fillStyle = 'black'; ctx.fillRect(0,0, canvas.width, canvas.height);
    
    // Боковая панель
    ctx.strokeStyle = 'white';
    ctx.strokeRect(10, 80, 170, canvas.height - 100);
    hubButtons.forEach(b => b.draw());

    // Иконка профиля (справа сверху)
    let profX = canvas.width - 60, profY = 20;
    ctx.strokeRect(profX, profY, 40, 40);
    ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(profX+20, profY+20, 15, 0, Math.PI*2); ctx.fill();
    
    if (mouse.x > profX && mouse.x < profX+40 && mouse.y > profY && mouse.y < profY+40 && mouse.clicked) {
        showProfile = !showProfile; mouse.clicked = false;
    }

    if (showProfile) {
        ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fillRect(canvas.width - 220, 70, 200, 120);
        ctx.strokeStyle = 'white'; ctx.strokeRect(canvas.width - 220, 70, 200, 120);
        ctx.fillStyle = 'white'; ctx.textAlign = 'left';
        ctx.fillText("ИГРОК: SOUL_MASTER", canvas.width - 210, 100);
        ctx.fillText("ID: " + playerID, canvas.width - 210, 130);
    }

    // Контент справа
    let contentX = 200, contentY = 100;
    if (currentHubTab === 'shop' || currentHubTab === 'inventory') {
        drawLoading(contentX + (canvas.width-200)/2, canvas.height/2);
    } else if (currentHubTab === 'play') {
        ctx.beginPath(); ctx.moveTo(contentX + (canvas.width-200)/2, 100); ctx.lineTo(contentX + (canvas.width-200)/2, canvas.height-50); ctx.stroke();
        ctx.textAlign = 'center';
        ctx.fillText("СОЗДАТЬ ЛОББИ", contentX + (canvas.width-200)/4, 150);
        ctx.fillText("ВОЙТИ В ЛОББИ", contentX + (canvas.width-200)*0.75, 150);
    }
}

function gameLoop() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    if (currentState === STATES.MAIN_MENU) {
        ctx.fillStyle = 'black'; ctx.fillRect(0,0, canvas.width, canvas.height);
        drawGlowing(() => {
            ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height+300, 400, Math.PI, 0); ctx.fillStyle = 'white'; ctx.fill();
        });
        ctx.fillStyle = 'white'; ctx.font = "bold 50px 'Courier New'"; ctx.textAlign = 'center';
        ctx.fillText("COSMOSOULS", canvas.width/2, canvas.height/3);
        mainButtons.forEach((b, i) => { b.x = canvas.width/2 - 100; b.y = canvas.height/2 + i*70; b.draw(); });
    } else if (currentState === STATES.GAME_HUB) {
        drawHub();
    }
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
