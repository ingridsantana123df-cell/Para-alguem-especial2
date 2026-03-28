// ==================================
// CURSOR PERSONALIZADO
// ==================================

const customCursor = document.querySelector('.custom-cursor');
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (customCursor) {
        customCursor.style.left = (mouseX - 15) + 'px';
        customCursor.style.top = (mouseY - 15) + 'px';
        customCursor.classList.add('active');
    }
});

document.addEventListener('mouseleave', () => {
    if (customCursor) {
        customCursor.classList.remove('active');
    }
});

// ==================================
// T-REX GAME IMPLEMENTATION
// ==================================

class TRexGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        
        // Dinossauro
        this.dino = {
            x: 50,
            y: this.canvas.height - 40,
            width: 40,
            height: 50,
            velocityY: 0,
            jumping: false,
            color: '#FF69B4'
        };
        
        // Obstáculos
        this.obstacles = [];
        this.obstacleFrequency = 0.02;
        this.obstacleSpeed = 5;
        
        // Física
        this.gravity = 0.6;
        this.jumpStrength = 15;
        
        this.startGameBtn = document.getElementById('startGameBtn');
        this.pauseGameBtn = document.getElementById('pauseGameBtn');
        this.gameScore = document.getElementById('gameScore');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        this.startGameBtn.addEventListener('click', () => this.start());
        this.pauseGameBtn.addEventListener('click', () => this.togglePause());
        
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameRunning) {
                e.preventDefault();
                this.jump();
            }
        });
        
        this.canvas.addEventListener('click', () => {
            if (this.gameRunning) {
                this.jump();
            }
        });
    }
    
    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.score = 0;
            this.obstacles = [];
            this.dino.velocityY = 0;
            this.dino.jumping = false;
            this.startGameBtn.style.display = 'none';
            this.pauseGameBtn.style.display = 'inline-block';
            this.gameLoop();
        }
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        if (this.gamePaused) {
            this.pauseGameBtn.textContent = '▶️ Continuar';
        } else {
            this.pauseGameBtn.textContent = '⏸️ Pausar';
            this.gameLoop();
        }
    }
    
    jump() {
        if (!this.dino.jumping) {
            this.dino.velocityY = -this.jumpStrength;
            this.dino.jumping = true;
        }
    }
    
    update() {
        if (this.gamePaused) return;
        
        // Atualizar posição do dinossauro
        this.dino.velocityY += this.gravity;
        this.dino.y += this.dino.velocityY;
        
        // Colisão com o chão
        if (this.dino.y + this.dino.height >= this.canvas.height) {
            this.dino.y = this.canvas.height - this.dino.height;
            this.dino.jumping = false;
            this.dino.velocityY = 0;
        }
        
        // Gerar obstáculos
        if (Math.random() < this.obstacleFrequency) {
            this.obstacles.push({
                x: this.canvas.width,
                y: this.canvas.height - 40,
                width: 30,
                height: 40,
                color: '#D966FF'
            });
        }
        
        // Atualizar obstáculos
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            this.obstacles[i].x -= this.obstacleSpeed;
            
            // Remover obstáculos que saíram da tela
            if (this.obstacles[i].x + this.obstacles[i].width < 0) {
                this.obstacles.splice(i, 1);
                this.score += 10;
                this.updateScore();
                
                // Aumentar dificuldade a cada 100 pontos
                if (this.score % 100 === 0) {
                    this.obstacleSpeed += 1;
                    this.obstacleFrequency += 0.003;
                }
            }
            
            // Detectar colisão
            if (this.checkCollision(this.dino, this.obstacles[i])) {
                this.endGame();
                return;
            }
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        // Limpar canvas
        this.ctx.fillStyle = 'rgba(135, 206, 235, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar chão
        this.ctx.strokeStyle = '#FF69B4';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 25);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 25);
        this.ctx.stroke();
        
        // Desenhar dinossauro
        this.ctx.fillStyle = this.dino.color;
        this.ctx.beginPath();
        this.ctx.arc(this.dino.x + 15, this.dino.y + 20, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Corpo do dinossauro
        this.ctx.fillRect(this.dino.x + 10, this.dino.y + 30, 20, 20);
        
        // Cauda
        this.ctx.beginPath();
        this.ctx.moveTo(this.dino.x + 30, this.dino.y + 35);
        this.ctx.lineTo(this.dino.x + 45, this.dino.y + 25);
        this.ctx.lineTo(this.dino.x + 40, this.dino.y + 45);
        this.ctx.fill();
        
        // Olhos
        this.ctx.fillStyle = '#FF1493';
        this.ctx.beginPath();
        this.ctx.arc(this.dino.x + 12, this.dino.y + 15, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Desenhar obstáculos
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = obstacle.color;
            
            // Desenhar obstáculo como estrela/diamante
            this.ctx.beginPath();
            this.ctx.moveTo(obstacle.x + 15, obstacle.y);
            this.ctx.lineTo(obstacle.x + 25, obstacle.y + 10);
            this.ctx.lineTo(obstacle.x + 30, obstacle.y + 20);
            this.ctx.lineTo(obstacle.x + 20, obstacle.y + 25);
            this.ctx.lineTo(obstacle.x + 15, obstacle.y + 35);
            this.ctx.lineTo(obstacle.x + 10, obstacle.y + 25);
            this.ctx.lineTo(obstacle.x + 0, obstacle.y + 20);
            this.ctx.lineTo(obstacle.x + 5, obstacle.y + 10);
            this.ctx.closePath();
            this.ctx.fill();
        });
        
        // Desenhar score
        this.ctx.fillStyle = '#FF1493';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`Pontos: ${this.score}`, 20, 30);
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        if (!this.gamePaused) {
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    updateScore() {
        this.gameScore.textContent = `Pontos: ${this.score}`;
    }
    
    endGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.startGameBtn.style.display = 'inline-block';
        this.pauseGameBtn.style.display = 'none';
        this.pauseGameBtn.textContent = '⏸️ Pausar';
        
        // Mostrar alerta com score
        alert(`🎮 Game Over! 🎮\n\nSua pontuação: ${this.score}\n\nMuito bom! 💕`);
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const game = new TRexGame();
});

// ==================================
// EFEITOS INTERATIVOS ADICIONAIS
// ==================================

// Efeito de hover nos cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.musica-card');
    
    cards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            this.style.animation = `glow-effect 0.5s ease-in-out`;
            
            // Criar partículas ao passar do mouse
            criarParticulasEmoji(this, index);
        });
    });
});

function criarParticulasEmoji(element, index) {
    const emojis = ['💕', '✨', '🌹', '💫', '🎵', '💖', '🌸', '🎀'];
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.position = 'fixed';
        particle.style.left = (rect.left + rect.width / 2) + 'px';
        particle.style.top = (rect.top + rect.height / 2) + 'px';
        particle.style.fontSize = '1.5em';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.animation = 'float-away 1.5s ease-out forwards';
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1500);
    }
}

// Adicionar animação no CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes glow-effect {
        0% { filter: drop-shadow(0 0 0px rgba(255, 105, 180, 0)); }
        50% { filter: drop-shadow(0 0 20px rgba(255, 105, 180, 0.6)); }
        100% { filter: drop-shadow(0 0 0px rgba(255, 105, 180, 0)); }
    }
    
    @keyframes float-away {
        0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(${Math.random() * 100 - 50}px, -100px) scale(0.5);
        }
    }
`;
document.head.appendChild(style);

// ==================================
// EFEITO DE CONFETE MELHORADO
// ==================================

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-youtube') || e.target.closest('.btn-youtube')) {
        criarConfete(e.clientX, e.clientY);
    }
});

function criarConfete(x, y) {
    const particles = ['💕', '🌹', '✨', '💫', '🎵', '💖', '🌸', '🎀', '💝', '🎀'];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.fontSize = '1.8em';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.opacity = '1';
        
        const angle = (i / 20) * Math.PI * 2;
        const velocity = 6 + Math.random() * 8;
        const tx = Math.cos(angle) * velocity * 50;
        const ty = Math.sin(angle) * velocity * 50 - 250;
        
        particle.style.animation = `confetti-fall 3s ease-out forwards`;
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
    }
}

// ==================================
// ANIMAÇÃO DO TITULO DO HEADER
// ==================================

document.addEventListener('DOMContentLoaded', () => {
    const h1 = document.querySelector('h1');
    if (h1) {
        h1.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(-2deg)';
        });
        
        h1.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0)';
        });
    }
});

// ==================================
// SONS E FEEDBACK
// ==================================

// Feedback visual ao clicar
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' || e.target.classList.contains('btn-youtube') || 
        e.target.closest('.btn-youtube') || e.target.closest('a')) {
        criarOndaClique(e.clientX, e.clientY);
    }
});

function criarOndaClique(x, y) {
    const onda = document.createElement('div');
    onda.style.position = 'fixed';
    onda.style.left = x + 'px';
    onda.style.top = y + 'px';
    onda.style.width = '20px';
    onda.style.height = '20px';
    onda.style.border = '2px solid #FF69B4';
    onda.style.borderRadius = '50%';
    onda.style.pointerEvents = 'none';
    onda.style.zIndex = '1000';
    onda.style.animation = 'onda-clique 0.8s ease-out forwards';
    
    document.body.appendChild(onda);
    setTimeout(() => onda.remove(), 800);
}

// Adicionar animação de onda no CSS
const styleOnda = document.createElement('style');
styleOnda.textContent = `
    @keyframes onda-clique {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(5);
            opacity: 0;
        }
    }
    
    @keyframes confetti-fall {
        0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(var(--tx), var(--ty)) rotate(720deg) scale(0);
        }
    }
`;
document.head.appendChild(styleOnda);
