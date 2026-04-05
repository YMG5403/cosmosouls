// ================= РЕЕСТР ПЕРСОНАЖЕЙ =================
// Текстуры ожидаются в папке assets/ (например assets/knight.png). Если их нет, рисуется цветной fallback.
const UNITS = [
    { id: 1, name: "Рыцарь", cost: 3, hp: 200, dmg: 15, speed: 1.5, type: "melee", color: "#bdc3c7", tex: "assets/knight.png", radius: 15 },
    { id: 2, name: "Эльф", cost: 5, hp: 100, dmg: 20, speed: 1.8, type: "ranged", color: "#2ecc71", tex: "assets/elf.png", radius: 12 },
    { id: 3, name: "Голем", cost: 9, hp: 800, dmg: 40, speed: 0.8, type: "rusher", color: "#7f8c8d", tex: "assets/golem.png", radius: 30 },
    { id: 4, name: "Бандиты", cost: 4, hp: 80, dmg: 12, speed: 2.5, type: "melee", color: "#e74c3c", tex: "assets/bandit.png", radius: 12, count: 2 },
    { id: 20, name: "ПОЖИРАТЕЛЬ", cost: 25, hp: 1500, dmg: 100, speed: 0.6, type: "rusher", color: "#8e44ad", tex: "assets/void.png", radius: 40 }
];

// ================= МЕНЕДЖЕР АССЕТОВ =================
const Assets = {
    images: {},
    load: function() {
        UNITS.forEach(u => {
            const img = new Image();
            img.src = u.tex;
            // Сохраняем картинку. Если она не загрузится (нет файла), мы перехватим это в отрисовке
            this.images[u.id] = img; 
        });
    }
};
Assets.load();

// ================= ДВИЖОК ЭФФЕКТОВ (ЧАСТИЦЫ) =================
class ParticleSystem {
    constructor() { this.particles = []; }
    spawn(x, y, color, count = 10, isExplosion = false) {
        for(let i=0; i<count; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * (isExplosion ? 8 : 3),
                vy: (Math.random() - 0.5) * (isExplosion ? 8 : 3),
                life: 1.0, decay: Math.random() * 0.05 + 0.02,
                color: color, size: Math.random() * 4 + 2
            });
        }
    }
    updateAndDraw(ctx) {
        for(let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx; p.y += p.vy; p.life -= p.decay;
            if(p.life <= 0) { this.particles.splice(i, 1); continue; }
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }
}
const FX = new ParticleSystem();

// ================= ЛОГИКА СУЩНОСТЕЙ =================
class Entity {
    constructor(data, x, y, team) {
        this.data = data; this.x = x; this.y = y; this.team = team;
        this.hp = data.hp; this.maxHp = data.hp;
        this.lastAtk = 0; this.actionState = 'walk'; // walk, attack
        this.animOffset = 0; // Для визуализации дыхания/шагов
    }
    update(entities, bases) {
        this.animOffset += 0.1;
        let target = null; let minDist = Infinity;
        let enemies = entities.filter(e => e.team !== this.team).concat(bases.filter(b => b.team !== this.team));

        if (this.data.type === 'rusher') {
            target = bases.find(b => b.team !== this.team);
        } else {
            enemies.forEach(e => {
                let d = Math.hypot(e.x - this.x, e.y - this.y);
                if(d < minDist) { minDist = d; target = e; }
            });
        }

        if(!target) return;

        let dist = Math.hypot(target.x - this.x, target.y - this.y);
        let range = this.data.type === 'ranged' ? 150 : this.data.radius + (target.radius || 40) + 5;

        if (dist > range) {
            this.actionState = 'walk';
            let angle = Math.atan2(target.y - this.y, target.x - this.x);
            this.x += Math.cos(angle) * this.data.speed;
            this.y += Math.sin(angle) * this.data.speed;
        } else {
            this.actionState = 'attack';
            if (Date.now() - this.lastAtk > 1000) {
                target.hp -= this.data.dmg;
                this.lastAtk = Date.now();
                FX.spawn(target.x, target.y, this.data.color, 5); // Брызги от удара
                if(this.data.type === 'ranged') GameApp.drawLaser(this.x, this.y, target.x, target.y, this.data.color);
            }
        }
    }
    draw(ctx) {
        let bounce = this.actionState === 'walk' ? Math.sin(this.animOffset) * 3 : 0;
        
        // Попытка отрисовать текстуру, если она загружена, иначе fallback
        let img = Assets.images[this.data.id];
        if (img && img.complete && img.naturalWidth !== 0) {
            ctx.drawImage(img, this.x - this.data.radius, this.y - this.data.radius + bounce, this.data.radius*2, this.data.radius*2);
        } else {
            // Fallback: красивый круг с градиентом
            let grad = ctx.createRadialGradient(this.x, this.y+bounce, 0, this.x, this.y+bounce, this.data.radius);
            grad.addColorStop(0, this.data.color); grad.addColorStop(1, '#111');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(this.x, this.y + bounce, this.data.radius, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = this.team === 1 ? '#3498db' : '#e74c3c';
            ctx.lineWidth = 2; ctx.stroke();
        }

        // Полоска ХП
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(this.x - 15, this.y - this.data.radius - 15, 30, 5);
        ctx.fillStyle = this.team === 1 ? '#3498db' : '#e74c3c';
        ctx.fillRect(this.x - 15, this.y - this.data.radius - 15, 30 * Math.max(0, this.hp/this.maxHp), 5);
    }
}

// ================= СЕТЕВОЙ КЛИЕНТ (WEBSOCKETS) =================
// ВНИМАНИЕ: Это реальный код клиента. Без запущенного сервера (Node.js) он не подключится.
class NetworkManager {
    constructor() { this.socket = null; this.connected = false; }
    connect() {
        const statusEl = document.getElementById('network-status');
        statusEl.innerText = "Подключение к серверу..."; statusEl.className = "status-badge connecting";
        
        try {
            // Пытаемся подключиться к локальному серверу. Замени на wss://твой-домен.com в продакшене.
            this.socket = new WebSocket('ws://localhost:8080'); 
            
            this.socket.onopen = () => {
                this.connected = true;
                statusEl.innerText = "СЕТЬ: АКТИВНА (Ожидание игрока)"; statusEl.className = "status-badge connected";
            };
            this.socket.onmessage = (msg) => {
                let data = JSON.parse(msg.data);
                if(data.type === 'spawn') GameApp.spawnEntity(data.unitId, data.x, data.y, 2); // Спавн врага
            };
            this.socket.onerror = () => this.fallbackToBot();
            this.socket.onclose = () => this.fallbackToBot();
        } catch (e) { this.fallbackToBot(); }
    }
    sendSpawn(unitId, x, y) {
        if(this.connected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type: 'spawn', unitId, x, y }));
        }
    }
    fallbackToBot() {
        this.connected = false;
        const statusEl = document.getElementById('network-status');
        statusEl.innerText = "СЕРВЕР НЕДОСТУПЕН. РЕЖИМ БОТА."; statusEl.style.color = "#e74c3c"; statusEl.style.borderColor = "#e74c3c";
    }
}
const Net = new NetworkManager();

// ================= ОСНОВНОЕ ЯДРО ИГРЫ =================
const GameApp = {
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d'),
    state: { gold: 1000, gems: 10, trophies: 0, deck: [1, 2, 3, 4] },
    battle: { active: false, elixir: 5, entities: [], bases: [], loopId: null, timerId: null, botTimer: null },

    init() { this.updateEconomyUI(); },

    navigate(btn) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(btn.dataset.target).classList.add('active');
        if(btn.dataset.target !== 'screen-battle') this.stopBattle();
    },

    updateEconomyUI() {
        document.getElementById('val-gold').innerText = this.state.gold;
        document.getElementById('val-gems').innerText = this.state.gems;
        document.getElementById('val-trophies').innerText = this.state.trophies;
    },

    buyBox(type) {
        let log = document.getElementById('gacha-log');
        if(type === 'silver' && this.state.gold >= 800) { this.state.gold -= 800; log.innerText = "Получено: Рыцарь!"; }
        else if (type === 'mega' && this.state.gems >= 200) { this.state.gems -= 200; this.state.deck[3] = 20; log.innerText = "УЛЬТРА ДРОП: ПОЖИРАТЕЛЬ!"; log.style.color = "#e056fd"; log.style.textShadow = "0 0 20px #e056fd"; }
        else { log.innerText = "Недостаточно ресурсов!"; log.style.color = "#e74c3c"; return; }
        this.updateEconomyUI();
    },

    startMultiplayerSearch() {
        Net.connect();
        this.startBattle();
    },

    startBattle() {
        this.stopBattle();
        this.battle.active = true; this.battle.elixir = 5; this.battle.entities = []; FX.particles = [];
        this.battle.bases = [
            { team: 1, x: 80, y: 225, hp: 4000, maxHp: 4000, radius: 40 },
            { team: 2, x: 920, y: 225, hp: 4000, maxHp: 4000, radius: 40 }
        ];
        this.renderDeck();

        this.battle.timerId = setInterval(() => {
            if(this.battle.elixir < 25) { this.battle.elixir += 0.5; this.renderDeck(); }
        }, 500); // Эликсир 1 ед/сек

        // Бот (если нет сервера)
        this.battle.botTimer = setInterval(() => {
            if(!Net.connected && Math.random() < 0.3) {
                let u = UNITS[Math.floor(Math.random() * 3)];
                this.spawnEntity(u.id, 900, 50 + Math.random()*350, 2);
            }
        }, 3000);

        this.loop();
    },

    stopBattle() {
        this.battle.active = false;
        cancelAnimationFrame(this.battle.loopId);
        clearInterval(this.battle.timerId); clearInterval(this.battle.botTimer);
    },

    renderDeck() {
        let e = this.battle.elixir;
        document.getElementById('elixir-fill').style.width = (e/25*100) + '%';
        document.getElementById('elixir-val').innerText = Math.floor(e) + ' / 25';
        
        const slots = document.getElementById('deck-slots'); slots.innerHTML = '';
        this.state.deck.forEach(id => {
            let u = UNITS.find(x => x.id === id);
            let dis = e < u.cost ? 'disabled' : '';
            slots.innerHTML += `
                <div class="card ${dis}" onclick="GameApp.requestSpawn(${u.id})">
                    <div class="card-cost">${u.cost}</div>
                    <div class="card-img" style="background-color: ${u.color}"></div>
                    <div class="card-name">${u.name}</div>
                </div>`;
        });
    },

    requestSpawn(id) {
        let u = UNITS.find(x => x.id === id);
        if (this.battle.elixir >= u.cost) {
            this.battle.elixir -= u.cost;
            let count = u.count || 1;
            for(let i=0; i<count; i++) {
                let y = 100 + Math.random()*250;
                this.spawnEntity(id, 150, y, 1);
                Net.sendSpawn(id, 1000 - 150, y); // Отправляем на сервер отзеркаленные координаты
            }
            this.renderDeck();
        }
    },

    spawnEntity(unitId, x, y, team) {
        let u = UNITS.find(x => x.id === unitId);
        if(u) {
            this.battle.entities.push(new Entity(u, x, y, team));
            FX.spawn(x, y, '#fff', 10); // Эффект появления
        }
    },

    drawLaser(x1, y1, x2, y2, color) {
        this.ctx.strokeStyle = color; this.ctx.lineWidth = 3;
        this.ctx.beginPath(); this.ctx.moveTo(x1, y1); this.ctx.lineTo(x2, y2); this.ctx.stroke();
    },

    loop() {
        if(!this.battle.active) return;
        this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

        // Базы
        this.battle.bases.forEach(b => {
            this.ctx.fillStyle = b.team === 1 ? '#2980b9' : '#c0392b';
            this.ctx.beginPath(); this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2); this.ctx.fill();
            this.ctx.fillStyle = "#fff"; this.ctx.font = "bold 20px Arial"; this.ctx.textAlign = "center";
            this.ctx.fillText(b.hp, b.x, b.y - b.radius - 10);
        });

        // Частицы
        FX.updateAndDraw(this.ctx);

        // Сущности
        for(let i = this.battle.entities.length - 1; i >= 0; i--) {
            let e = this.battle.entities[i];
            e.update(this.battle.entities, this.battle.bases);
            e.draw(this.ctx);
            if(e.hp <= 0) {
                FX.spawn(e.x, e.y, e.data.color, 15, true); // Взрыв смерти
                this.battle.entities.splice(i, 1);
            }
        }

        // Проверка конца игры
        if(this.battle.bases[0].hp <= 0 || this.battle.bases[1].hp <= 0) {
            if(this.battle.bases[1].hp <= 0) { alert("ЭПИЧНАЯ ПОБЕДА! +30🏆"); this.state.trophies += 30; this.state.gold += 500; }
            else { alert("ПОРАЖЕНИЕ..."); this.state.trophies = Math.max(0, this.state.trophies - 20); }
            this.updateEconomyUI();
            document.querySelector('.nav-btn[data-target="screen-shop"]').click();
            return;
        }

        this.battle.loopId = requestAnimationFrame(() => this.loop());
    }
};

window.onload = () => GameApp.init();
