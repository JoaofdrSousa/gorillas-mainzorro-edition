const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const controls = document.getElementById('playerInputs');
const powerFactor = 0.3; //queres mais rapido, aumentas, queres mais baixo, diminuis



//bananaconst bananaImg = new Image();
const bananaImg = new Image();
bananaImg.src = 'img/banana.png';

const gorila1Img = new Image();
gorila1Img.src = 'img/gorila.png'; // Original

const gorila2Img = new Image();
gorila2Img.src = 'img/gorila2.png'; // Versão azul escuro



let playerNames = [];
let currentPlayer = 0;
let gorillas = [];
let banana = {x:0, y:0, vx:0, vy:0, active:false};
let gravity = 0.3;
let wind = 0; // vento atual da jogada
let buildings = [];
let stars = [];
let explosions = [];
let gameStarted = false; 

function generateStars(){
    stars = [];
    for(let i=0; i<100; i++){
        stars.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height/2});
    }
}

function generateMap(){
    buildings = [];
    const cores = ['#555', '#cc3333', '#3366cc']; // cinza, vermelho, azul
    const buildingWidth = 50;   // largura do prédio
    const spacing = 2.5;        // espaço entre prédios

    for(let x=0; x<canvas.width; x+=buildingWidth + spacing){
        let h = 50 + Math.random()*200;
        let windows = [];
        for(let wy=0; wy<h; wy+=20){
            if(Math.random()>0.5){
                windows.push(canvas.height - h + wy);
            }
        }

        const corRandom = cores[Math.floor(Math.random() * cores.length)];

        buildings.push({x:x, y:canvas.height-h, w:buildingWidth, h:h, windows:windows, cor: corRandom});
    }
	
}



function drawSky(){
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    stars.forEach(s=>ctx.fillRect(s.x, s.y, 2, 2));

    if (gameStarted) {
        ctx.font = '16px monospace';
        ctx.fillStyle = 'white';
        ctx.fillText('🌬️ Vento: ' + (wind === 0 ? '-' : (wind > 0 ? '→ ' + wind : '← ' + Math.abs(wind))), 10, 20);
    }
	
	  // Desenha lua SÓ SE o jogo começou
    if (gameStarted) {
        ctx.beginPath();
        ctx.arc(canvas.width - 80, 80, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#ddd';
        ctx.fill();
    }
}

function drawMap(){
    buildings.forEach(b=>{
    ctx.fillStyle = b.cor;
    ctx.fillRect(b.x, b.y, b.w, b.h);

    ctx.fillStyle = 'yellow';
    b.windows.forEach(wy=>{
        ctx.fillRect(b.x+10, wy, 5, 5);
    });

    // Desenha buracos da explosão
    if(b.holes){
        b.holes.forEach(h=>{
            ctx.save();
            ctx.beginPath();
            ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
            ctx.clip();
            ctx.clearRect(b.x, b.y, b.w, b.h);
            ctx.restore();
        });
    }
});
}

function placeGorillas(){
    gorillas = [];

    const margin = 50;
    let minDistance = 600;
    const maxTries = 1000;
    let tries = 0;

    const validBuildings = buildings.filter(b => {
        const gx = b.x + b.w / 2;
        return gx > margin && gx < canvas.width - margin;
    });

    if (validBuildings.length < 2) {
        alert("Erro: Não existem prédios suficientes.");
        return false;
    }

    while (gorillas.length < 2 && tries < maxTries) {
        tries++;

        if (gorillas.length === 0) {
            let b1 = validBuildings[Math.floor(Math.random() * validBuildings.length)];
            gorillas.push({ x: b1.x + b1.w / 2, y: b1.y });
        } else {
            let possible = validBuildings.filter(b => Math.abs((b.x + b.w / 2) - gorillas[0].x) >= minDistance);

            if (possible.length === 0) {
                minDistance -= 50; // relaxa um bocadinho
                if (minDistance < 200) minDistance = 200;
                tries = 0;
                gorillas = [];
                continue;
            }

            let b2 = possible[Math.floor(Math.random() * possible.length)];
            gorillas.push({ x: b2.x + b2.w / 2, y: b2.y });
        }
    }

    if (gorillas.length < 2) {
        alert("Erro: Não consegui colocar os gorilas.");
        return false;
    }

    gorillas.sort((a, b) => a.x - b.x);
    return true;
}

function throwBanana(){
    document.getElementById('throwButton').disabled = true; // Bloquear botão ao lançar

    const angle = parseFloat(document.getElementById('angle').value) * Math.PI / 180;
    const power = parseFloat(document.getElementById('power').value);
    const g = gorillas[currentPlayer];


    banana.x = g.x + (currentPlayer === 0 ? 20 : -20);
    banana.y = g.y;
	banana.startX = banana.x;
	banana.startY = banana.y;
	banana.t = 0;
	banana.vx = Math.cos(angle) * Math.pow(power, 1.1) * powerFactor * (currentPlayer === 0 ? 1 : -1);
	banana.vy = -Math.sin(angle) * Math.pow(power, 1.1) * powerFactor;

    banana.active = true;
}



function createExplosion(x, y){
    const radius = 15; // Tamanho do "buraco"
    
    buildings.forEach(b => {
        if(x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h){
            // Criar buraco na zona atingida
            b.holes = b.holes || []; // array de buracos
            b.holes.push({x: x, y: y, r: radius});
        }
    });

    for(let i=0;i<10;i++){
        explosions.push({x:x, y:y, vx:Math.random()*4-2, vy:Math.random()*-2-1, life:30});
    }
}


function update(){
    drawSky();
    drawMap();

    // Desenhar gorilas
    gorillas.forEach((g,i)=>{
        if ((i === 0 ? gorila1Img : gorila2Img).complete) {
            ctx.drawImage(i === 0 ? gorila1Img : gorila2Img, g.x-20, g.y-40, 40, 40);
        } else {
            ctx.fillStyle = i==0 ? 'green' : 'red';
            ctx.fillRect(g.x-10, g.y-40, 20, 40);
        }
    });

    // Explosões
    explosions.forEach(e=>{
        ctx.fillStyle = 'orange';
        ctx.fillRect(e.x, e.y, 3, 3);
        e.x += e.vx;
        e.y += e.vy;
        e.life--;
    });
    explosions = explosions.filter(e => e.life > 0);

    // Movimento da banana
    if(banana.active){
       banana.t += 0.3;
		banana.x = banana.startX + (banana.vx * banana.t) + 0.5 * (wind / 5) * banana.t ** 2;
		banana.y = banana.startY + (banana.vy * banana.t) + 0.5 * gravity * banana.t ** 2;

        if (bananaImg.complete) {
            ctx.drawImage(bananaImg, banana.x-10, banana.y-10, 20, 20);
        } else {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(banana.x-2, banana.y-2, 4, 4);
        }

        // Saiu do canvas
        if(banana.x < 0 || banana.x > canvas.width || banana.y > canvas.height){
            banana.active = false;
            currentPlayer = 1 - currentPlayer;
            setTimeout(() => {
                nextTurn();
                document.getElementById('throwButton').disabled = false;
            }, 500);
        }

        // Colidiu com prédio
        buildings.forEach(b=>{
            if(banana.x > b.x && banana.x < b.x + b.w && banana.y > b.y && banana.y < b.y + b.h){
                b.h -= 10;
                b.y += 10;
                b.windows = b.windows.filter(wy => wy >= b.y);
                createExplosion(banana.x, banana.y);
                banana.active = false;
                currentPlayer = 1 - currentPlayer;
                setTimeout(() => {
                    nextTurn();
                    document.getElementById('throwButton').disabled = false;
                }, 500);
            }
        });

        // Colidiu com gorila
        gorillas.forEach((g,i)=>{
            if(Math.abs(banana.x - g.x) < 10 && Math.abs(banana.y - g.y) < 40){
                createExplosion(g.x, g.y);
                banana.active = false;

                if (i !== currentPlayer) {
                    alert(playerNames[currentPlayer] + " acertou em " + playerNames[1 - currentPlayer] + "! Vitória!");
                    askNames();
                } else {
                    // Acertou nele próprio, troca o turno
                    setTimeout(() => {
                        currentPlayer = 1 - currentPlayer;
                        nextTurn();
                        document.getElementById('throwButton').disabled = false;
                    }, 500);
                }
            }
        });
    }

    requestAnimationFrame(update);
}


function askNames(){
    controls.innerHTML = controls.innerHTML = `Player 1 Name: <input id="p1" value="Player 1"><br>
Player 2 Name: <input id="p2" value="Player 2"><br>
<button onclick="startGame()">Start Game</button>`;
}

function startGame(){
	
    generateStars();
    generateMap();

    let gorillasOk = placeGorillas();
    if (!gorillasOk) return; // Para aqui se falhou

    playerNames = [document.getElementById('p1').value, document.getElementById('p2').value];
	gameStarted = true;
    nextTurn();
}



function nextTurn(){
    wind = Math.floor(Math.random() * 21) - 10; // novo vento por jogada
      controls.innerHTML = `
        <div style="color: orange; font-weight: bold; font-family: monospace; font-size: 18px; margin-bottom: 10px;">
            ${playerNames[currentPlayer]}'s Turn
        </div>
        Angle (deg): <input id="angle" value="45">
        Power: <input id="power" value="10">
        <button id="throwButton" onclick="throwBanana()">Throw</button>
    `;
}


askNames();
update();