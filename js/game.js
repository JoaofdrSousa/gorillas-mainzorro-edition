
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const controls = document.getElementById('playerInputs');
const powerFactor = 0.5; //queres mais rapido, aumentas, queres mais baixo, diminuis
//gorila
const gorilaImg = new Image();
gorilaImg.src = 'img/gorila.png';

//bananaconst bananaImg = new Image();
const bananaImg = new Image();
bananaImg.src = 'img/banana.png';


let playerNames = [];
let currentPlayer = 0;
let gorillas = [];
let banana = {x:0, y:0, vx:0, vy:0, active:false};
let gravity = 0.3;
let buildings = [];
let stars = [];
let explosions = [];

function generateStars(){
    stars = [];
    for(let i=0; i<100; i++){
        stars.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height/2});
    }
}

function generateMap(){
    buildings = [];
    const cores = ['#555', '#cc3333', '#3366cc']; // cinza, vermelho, azul

    for(let x=0; x<canvas.width; x+=40){
        let h = 50 + Math.random()*200;
        let windows = [];
        for(let wy=0; wy<h; wy+=20){
            if(Math.random()>0.5){
                windows.push(canvas.height - h + wy);
            }
        }

        const corRandom = cores[Math.floor(Math.random() * cores.length)];

        buildings.push({x:x, y:canvas.height-h, w:40, h:h, windows:windows, cor: corRandom});
    }
}

function drawSky(){
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    stars.forEach(s=>ctx.fillRect(s.x, s.y, 2, 2));
}

function drawMap(){
    buildings.forEach(b=>{
        ctx.fillStyle = b.cor;
        ctx.fillRect(b.x, b.y, b.w, b.h);

        ctx.fillStyle = 'yellow';
        b.windows.forEach(wy=>{
            ctx.fillRect(b.x+10, wy, 5, 5);
        });
    });
}

function placeGorillas(){
    gorillas = [];
    while(gorillas.length < 2){
        let bx = buildings[Math.floor(Math.random()*buildings.length)];
        let gx = bx.x + bx.w/2;
        let gy = bx.y;
        if (gorillas.length == 1){
            if(Math.abs(gx-gorillas[0].x)<300) continue;
        }
        gorillas.push({x:gx, y:gy});
    }
    gorillas.sort((a, b) => a.x - b.x);
}

function throwBanana(){
    const angle = parseFloat(document.getElementById('angle').value) * Math.PI / 180;
    const power = parseFloat(document.getElementById('power').value);
    const g = gorillas[currentPlayer];
    banana.x = g.x + (currentPlayer==0?20:-20);
    banana.y = g.y;
    banana.vx = Math.cos(angle) * power * powerFactor * (currentPlayer==0?1:-1); // aqui e definido a velocidade da banana
	banana.vy = -Math.sin(angle) * power * powerFactor; // aqui e definido a velocidade da banana
    banana.active = true;
}

function createExplosion(x, y){
    for(let i=0;i<10;i++){
        explosions.push({x:x, y:y, vx:Math.random()*4-2, vy:Math.random()*-2-1, life:30});
    }
}

function update(){
    drawSky();
    drawMap();
    gorillas.forEach((g,i)=>{
        if (gorilaImg.complete) {
            ctx.drawImage(gorilaImg, g.x-20, g.y-40, 40, 40);
        } else {
            ctx.fillStyle = i==0?'green':'red';
            ctx.fillRect(g.x-10, g.y-40, 20, 40);
        }
    });

    explosions.forEach(e=>{
        ctx.fillStyle='orange';
        ctx.fillRect(e.x, e.y, 3, 3);
        e.x += e.vx;
        e.y += e.vy;
        e.life--;
    });
    explosions = explosions.filter(e=>e.life>0);

    if(banana.active){
        banana.x += banana.vx;
        banana.y += banana.vy;
        banana.vy += gravity;
        if (bananaImg.complete) {
		  ctx.drawImage(bananaImg, banana.x-10, banana.y-10, 20, 20);
		} else {
		  ctx.fillStyle='yellow';
		  ctx.fillRect(banana.x-2, banana.y-2, 4, 4);
		}

        if(banana.x<0 || banana.x>canvas.width || banana.y>canvas.height){
            banana.active=false;
            currentPlayer=1-currentPlayer;
            nextTurn();
        }

        buildings.forEach(b=>{
            if(banana.x > b.x && banana.x < b.x + b.w && banana.y > b.y && banana.y < b.y + b.h){
                b.h -= 10;
                b.y += 10;
                b.windows = b.windows.filter(wy => wy >= b.y); // limpar janelas fora do prédio
                createExplosion(banana.x, banana.y);
                banana.active=false;
                currentPlayer=1-currentPlayer;
                nextTurn();
            }
        });

        gorillas.forEach((g,i)=>{
            if(Math.abs(banana.x-g.x)<10 && Math.abs(banana.y-g.y)<40){
                createExplosion(g.x, g.y);
                banana.active=false;
                alert(playerNames[currentPlayer]+" acertou em "+playerNames[1-currentPlayer]+"! Vitória!");
                askNames();
            }
        });
    }
    requestAnimationFrame(update);
}

function askNames(){
   controls.innerHTML = `
<h2 style="color:yellow;">VEZ DE: ${playerNames[currentPlayer].toUpperCase()}</h2>
<label>Ângulo (0-180):</label>
<input id="angle" value="45">
<label>Força:</label>
<input id="power" value="10">
<button onclick="throwBanana()">LANÇAR</button>
`;
}

function startGame(){
    generateStars();
    generateMap();
    placeGorillas();
    playerNames = [document.getElementById('p1').value, document.getElementById('p2').value];
    nextTurn();
}

function nextTurn(){
  controls.innerHTML = `
<h2 style="color:yellow;">VEZ DE: ${playerNames[currentPlayer].toUpperCase()}</h2>
<label>Ângulo (0-180):</label>
<input id="angle" value="45">
<label>Força:</label>
<input id="power" value="10">
<button onclick="throwBanana()">LANÇAR</button>
`;
}
function resizeCanvas(){
  canvas.width = Math.min(window.innerWidth - 40, 1200);
  canvas.height = Math.min(window.innerHeight - 200, 700);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

askNames();
update();
