// ================= DATA: ПЕРСОНАЖИ =================
const ALL_UNITS = [
    { id: 1, name: "Рыцарь-Ученик", cost: 3, hp: 15, dmg: 5, speed: 2, type: "normal", rarity: "common", color: "#C0C0C0", shape: "circle" },
    { id: 2, name: "Белый Эльф", cost: 5, hp: 10, dmg: 8, speed: 2, type: "ranged", rarity: "common", color: "#FFFFFF", shape: "rect" },
    { id: 3, name: "Каменный Голем", cost: 9, hp: 60, dmg: 4, speed: 0.8, type: "rusher", rarity: "rare", color: "#808080", shape: "rect", size: 25 },
    { id: 4, name: "Бандитское Дуо", cost: 4, hp: 8, dmg: 3, speed: 3, type: "normal", rarity: "common", color: "#FF0000", shape: "circle", count: 2 },
    { id: 5, name: "Королевское Трио", cost: 8, hp: 12, dmg: 5, speed: 1.5, type: "ranged", rarity: "rare", color: "#0000FF", shape: "circle", count: 3 },
    { id: 6, name: "Гном-Инженер", cost: 6, hp: 14, dmg: 10, speed: 2.5, type: "assassin", rarity: "common", color: "#FFA500", shape: "oval" },
    { id: 7, name: "Боевой Монах", cost: 5, hp: 12, dmg: 9, speed: 2.5, type: "assassin", rarity: "common", color: "#FF8C00", shape: "circle" },
    { id: 8, name: "Кактус-Задира", cost: 4, hp: 10, dmg: 6, speed: 1.5, type: "ranged", rarity: "common", color: "#00FF00", shape: "circle" },
    { id: 9, name: "Ледяной Волк", cost: 6, hp: 16, dmg: 5, speed: 3.5, type: "normal", rarity: "rare", color: "#00FFFF", shape: "oval" },
    { id: 10, name: "Двойной Блокпост", cost: 10, hp: 40, dmg: 0, speed: 0, type: "building", rarity: "rare", color: "#8B4513", shape: "rect" },
    { id: 11, name: "Рыцарь-Ведро", cost: 6, hp: 25, dmg: 4, speed: 1.5, type: "normal", rarity: "rare", color: "#A9A9A9", shape: "circle" },
    { id: 12, name: "Теневой Убийца", cost: 6, hp: 8, dmg: 15, speed: 3, type: "assassin", rarity: "epic", color: "#4B0082", shape: "circle" },
    { id: 13, name: "Гоблин-Наездник", cost: 7, hp: 20, dmg: 8, speed: 3.5, type: "rusher", rarity: "epic", color: "#006400", shape: "oval" },
    { id: 14, name: "Реактивный Роллер", cost: 5, hp: 12, dmg: 7, speed: 4, type: "rusher", rarity: "epic", color: "#00FFFF", shape: "circle" },
    { id: 15, name: "Орк-Громила", cost: 7, hp: 30, dmg: 12, speed: 1.5, type: "normal", rarity: "epic", color: "#228B22", shape: "rect" },
    { id: 16, name: "Чумной Доктор", cost: 8, hp: 15, dmg: 4, speed: 2, type: "ranged", rarity: "epic", color: "#2F4F4F", shape: "circle" },
    { id: 17, name: "Огненный Маг", cost: 9, hp: 12, dmg: 14, speed: 1.5, type: "ranged", rarity: "epic", color: "#FF4500", shape: "circle" },
    { id: 18, name: "Паровой Вертолет", cost: 11, hp: 25, dmg: 10, speed: 2.5, type: "rusher", rarity: "epic", color: "#B87333", shape: "circle" },
    { id: 19, name: "Железный Страж", cost: 12, hp: 45, dmg: 6, speed: 1, type: "normal", rarity: "epic", color: "#708090", shape: "rect", size: 20 },
    { id: 20, name: "Пожиратель Пустоты", cost: 25, hp: 100, dmg: 25, speed: 1, type: "rusher", rarity: "ultra", color: "#000000", shape: "circle", size: 30 }
];

// ================= СОСТОЯНИЕ (LOCAL STORAGE) =================
const state = {
    tokens: parseInt(localStorage.getItem('tokens')) || 1000,
    crystals: parseInt(localStorage.getItem('crystals')) || 10,
    trophies: parseInt(localStorage.getItem('trophies')) || 0,
    unlocked: JSON.parse(localStorage.getItem('unlocked')) || [1, 2, 3, 4], // Начальные айдишники
    deck: [1, 2, 3, 4] // Выбранные 4 карты
};

function saveState() {
    localStorage.setItem('tokens', state.tokens);
    localStorage.setItem('crystals', state.crystals);
    localStorage.setItem('trophies', state.trophies);
    localStorage.setItem('unlocked', JSON.stringify(state.unlocked));
    updateUI();
}

function updateUI() {
    document.getElementById('tokens-count').innerText = state.tokens;
    document.getElementById('crystals-count').innerText = state.crystals;
    document.getElementById('trophies-count').innerText = state.trophies;
}

// ================= ЛОГИКА ГАЧИ =================
function rollGacha(boxType) {
    let rand = Math.random() * 100;
    let pool = [];
    
    if (boxType === 'silver') {
        if (state.tokens < 800) return alert("Недостаточно жетонов!");
        state.tokens -= 800;
        pool = rand < 80 ? ALL_UNITS.filter(u => u.rarity === 'common') : ALL_UNITS.filter(u => u.rarity === 'rare');
    } else if (boxType === 'gold') {
        if (state.tokens < 5000) return alert("Недостаточно жетонов!");
        state.tokens -= 5000;
        pool = rand < 85 ? ALL_UNITS.filter(u => u.rarity === 'rare') : ALL_UNITS.filter(u => u.rarity === 'epic');
        state.tokens += Math.floor(Math.random() * 1500) + 2500; // Бонус
    } else if (boxType === 'mega') {
        if (state.crystals < 200) return alert("Недостаточно кристаллов!");
        state.crystals -= 200;
        state.tokens += 10000;
        state.crystals += Math.floor(Math.random() * 6) + 5;
        pool = rand < 10 ? ALL_UNITS.filter(u => u.rarity === 'ultra') : ALL_UNITS.filter(u => u.rarity === 'epic');
    }

    const wonUnit = pool[Math.floor(Math.random() * pool.length)];
    if (!state.unlocked.includes(wonUnit.id)) state.unlocked.push(wonUnit.id);
    
    document.getElementById('gacha-result').innerText = `Выпало: ${wonUnit.name} (${wonUnit.rarity.toUpperCase()})`;
    saveState();
}

// ================= ДВИЖОК БОЯ (CANVAS) =================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameLoop, elixirTimer;
let elixir = 0;
let entities = [];
let bases = [];

class Base {
    constructor(isPlayer, y) {
        this.isPlayer = isPlayer;
        this.hp = 3000;
        this.maxHp = 3000;
        this.x = 200;
        this.y = y;
        this.radius = 30;
    }
    draw() {
        ctx.fillStyle = this.isPlayer ? '#3498db' : '#e74c3c';
        ctx.fillRect(this.x - 30, this.y - 30, 60, 60);
        ctx.fillStyle = 'white';
        ctx.fillText(this.hp, this.x - 15, this.y + 5);
    }
}

class Entity {
    constructor(unitData, x, y, isPlayer) {
        this.data = unitData;
        this.x = x;
        this.y = y;
        this.hp = unitData.hp * 10; // Скейл для симуляции
        this.maxHp = this.hp;
        this.isPlayer = isPlayer;
        this.size = unitData.size || 10;
        this.lastAttack = 0;
        this.target = null;
    }

    findTarget() {
        if (this.data.type === "rusher") {
            // Рашеры идут только на базу
            this.target = bases.find(b => b.isPlayer !== this.isPlayer);
            return;
        }

        // Ассасины и обычные ищут ближайшего врага или базу
        let closest = null;
        let minDist = Infinity;
        let enemies = entities.filter(e => e.isPlayer !== this.isPlayer).concat(bases.filter(b => b.isPlayer !== this.isPlayer));
        
        for (let e of enemies) {
            let dist = Math.hypot(this.x - e.x, this.y - e.y);
            if (dist < minDist) {
                minDist = dist;
                closest = e;
            }
        }
        this.target = closest;
    }

    update() {
        if (!this.target || this.target.hp <= 0) this.findTarget();
        if (!this.target) return;

        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let dist = Math.hypot(dx, dy);

        let attackRange = this.data.type === 'ranged' ? 100 : this.size + 20;

        if (dist > attackRange) {
            // Движение
            this.x += (dx / dist) * this.data.speed;
            this.y += (dy / dist) * this.data.speed;
        } else {
            // Атака (1 раз в секунду)
            if (Date.now() - this.lastAttack > 1000) {
                this.target.hp -= this.data.dmg * 5;
                this.lastAttack = Date.now();
                
                // Эффект Пожирателя
                if(this.data.id === 20 && this.target.isPlayer !== undefined) {
                    this.hp = Math.min(this.maxHp, this.hp + this.data.dmg); // Вампиризм
                }
            }
        }
    }

    draw() {
        ctx.fillStyle = this.data.color;
        ctx.beginPath();
        if (this.data.shape === 'rect') {
            ctx.fillRect(this.x - this.size, this.y - this.size, this.size*2, this.size*2);
        } else {
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // HP Bar
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 10, this.y - this.size - 10, 20, 3);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x - 10, this.y - this.size - 10, 20 * (this.hp/this.maxHp), 3);
    }
}

// ================= УПРАВЛЕНИЕ ПРИЛОЖЕНИЕМ =================
const gameApp = {
    switchTab(tabId) {
        document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
        document.getElementById(`tab-${tabId}`).style.display = 'flex';
        if (tabId !== 'battle') this.stopBattle();
    },

    openBox(type) { rollGacha(type); },

    sendGift(btn) {
        btn.innerText = "Отправлено!";
        btn.disabled = true;
        state.tokens += 100;
        saveState();
        alert("Вы подарили 100 Жетонов и получили 100 Жетонов в ответ!");
    },

    initDeck() {
        const slots = document.getElementById('deck-slots');
        slots.innerHTML = '';
        state.deck.forEach(id => {
            const unit = ALL_UNITS.find(u => u.id === id);
            slots.innerHTML += `
                <div class="card" onclick="gameApp.spawnUnit(${unit.id})">
                    <span class="cost">${unit.cost}</span>
                    <div style="width:20px; height:20px; background:${unit.color}; border-radius:${unit.shape==='circle'?'50%':'0'}"></div>
                    <span>${unit.name}</span>
                </div>
            `;
        });
    },

    spawnUnit(id) {
        const unit = ALL_UNITS.find(u => u.id === id);
        if (elixir >= unit.cost) {
            elixir -= unit.cost;
            let count = unit.count || 1;
            for(let i=0; i<count; i++) {
                entities.push(new Entity(unit, 100 + (Math.random()*200), 500 + (Math.random()*20), true));
            }
            this.updateElixirUI();
        }
    },

    updateElixirUI() {
        document.getElementById('elixir-fill').style.width = `${(elixir / 25) * 100}%`;
        document.getElementById('elixir-text').innerText = `${Math.floor(elixir)} / 25`;
    },

    startBattle() {
        this.initDeck();
        elixir = 5;
        entities = [];
        bases = [new Base(false, 50), new Base(true, 550)];
        
        // Регенерация эликсира: 1 ед. каждые 3 секунды. Для динамики MVP сделано 1 ед. в сек.
        elixirTimer = setInterval(() => {
            if (elixir < 25) { elixir += 0.33; this.updateElixirUI(); }
            
            // AI Bot Спавн (каждые 3 сек)
            if (Math.random() < 0.4) {
                let randomUnit = ALL_UNITS[Math.floor(Math.random() * 5)];
                entities.push(new Entity(randomUnit, 100 + (Math.random()*200), 100, false));
            }
        }, 1000);

        this.loop();
    },

    stopBattle() {
        cancelAnimationFrame(gameLoop);
        clearInterval(elixirTimer);
    },

    loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Арена
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(400, 300); ctx.stroke();

        bases.forEach(b => b.draw());
        
        for (let i = entities.length - 1; i >= 0; i--) {
            let e = entities[i];
            e.update();
            e.draw();
            if (e.hp <= 0) entities.splice(i, 1);
        }

        // Условие победы
        if (bases[0].hp <= 0) { alert("ПОБЕДА! +30 Кубков"); state.trophies += 30; state.tokens += 1000; saveState(); gameApp.switchTab('shop'); return; }
        if (bases[1].hp <= 0) { alert("ПОРАЖЕНИЕ! -20 Кубков"); state.trophies = Math.max(0, state.trophies - 20); saveState(); gameApp.switchTab('shop'); return; }

        gameLoop = requestAnimationFrame(() => gameApp.loop());
    }
};

// Запуск
updateUI();
