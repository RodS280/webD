document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Coupon Logic
    const claimBtn = document.getElementById('claimBtn');
    if (claimBtn) {
        claimBtn.addEventListener('click', () => {
            claimBtn.textContent = '¡Reclamado! Te amo ❤️';
            claimBtn.classList.add('claimed');
            createConfetti();
        });
    }

    // 2. Maze Game Logic
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const tileSize = canvas.width / 10; // 40px grid (400/10)
        
        // Maze representation: 1 = wall, 0 = path
        const maze = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];

        let player = { x: 0, y: 1, radius: tileSize / 3 };
        let goal = { x: 9, y: 8 };

        // Messages for checkpoints (based on user request)
        const messages = [
            "Eres muy bonita ✨",
            "Te amo ❤️",
            "Me haces muy feliz 💕",
            "Eres increíble 🌟"
        ];
        
        let checkpoints = [
            { x: 4, y: 1, msg: messages[0], active: true },
            { x: 1, y: 3, msg: messages[1], active: true },
            { x: 8, y: 5, msg: messages[2], active: true },
            { x: 4, y: 8, msg: messages[3], active: true }
        ];

        const popup = document.getElementById('messagePopup');
        const popupText = document.getElementById('popupText');
        const closePopupBtn = document.getElementById('closePopupBtn');
        let gamePaused = false;

        // Resize support for smaller screens
        function adjustCanvasSize() {
            if (window.innerWidth <= 480) {
                canvas.style.width = '300px';
                canvas.style.height = '300px';
                // Note: we still draw using the 400x400 internal coordinate system
                // Canvas CSS handles scaling down automatically visually
            } else {
                canvas.style.width = '400px';
                canvas.style.height = '400px';
            }
        }
        window.addEventListener('resize', adjustCanvasSize);
        adjustCanvasSize();

        function drawMaze() {
            ctx.fillStyle = '#fff9e6';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            for (let r = 0; r < maze.length; r++) {
                for (let c = 0; c < maze[r].length; c++) {
                    if (maze[r][c] === 1) {
                        ctx.fillStyle = 'rgba(251, 133, 0, 0.4)'; // Wall color
                        ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                        ctx.strokeRect(c * tileSize, r * tileSize, tileSize, tileSize);
                    }
                }
            }
        }

        function drawCheckpoints() {
            checkpoints.forEach(cp => {
                if (cp.active) {
                    ctx.beginPath();
                    ctx.arc(cp.x * tileSize + tileSize / 2, cp.y * tileSize + tileSize / 2, tileSize / 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffb703'; // Gold color
                    ctx.fill();
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ffb703';
                    ctx.closePath();
                    ctx.shadowBlur = 0; // reset
                }
            });
        }

        function drawGoal() {
            if (goal.x === -1) return; // Goal reached
            
            ctx.fillStyle = '#ff4d4d'; // Red heart
            let centerX = goal.x * tileSize + tileSize/2;
            let centerY = goal.y * tileSize + tileSize/2;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - tileSize/5);
            ctx.bezierCurveTo(centerX + tileSize/4, centerY - tileSize/2, centerX + tileSize/2, centerY - tileSize/6, centerX, centerY + tileSize/3);
            ctx.bezierCurveTo(centerX - tileSize/2, centerY - tileSize/6, centerX - tileSize/4, centerY - tileSize/2, centerX, centerY - tileSize/5);
            ctx.fill();
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff4d4d';
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        function drawPlayer() {
            ctx.beginPath();
            ctx.arc(player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2, player.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#fb8500';
            ctx.fill();
            ctx.closePath();
        }

        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawMaze();
            drawCheckpoints();
            drawGoal();
            drawPlayer();
        }

        function checkCollisions() {
            // Check checkpoints
            checkpoints.forEach(cp => {
                if (cp.active && cp.x === player.x && cp.y === player.y) {
                    cp.active = false;
                    showPopup(cp.msg);
                }
            });

            // Check goal
            if (goal.x !== -1 && player.x === goal.x && player.y === goal.y) {
                showPopup("¡Llegaste a mi corazón! Te amo muchísimo ❤️");
                goal.x = -1; // Remove goal
                createConfetti();
            }
        }

        function showPopup(text) {
            gamePaused = true;
            popupText.textContent = text;
            popup.classList.remove('hidden');
        }

        closePopupBtn.addEventListener('click', () => {
            popup.classList.add('hidden');
            gamePaused = false;
            // Re-render once to ensure clear view
            render();
        });

        function movePlayer(dx, dy) {
            if (gamePaused) return;
            let nx = player.x + dx;
            let ny = player.y + dy;
            
            // Bounds and wall check
            if (ny >= 0 && ny < maze.length && nx >= 0 && nx < maze[0].length) {
                if (maze[ny][nx] !== 1) {
                    player.x = nx;
                    player.y = ny;
                    checkCollisions();
                    render();
                }
            }
        }

        window.addEventListener('keydown', (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
            }
            if (e.key === 'ArrowUp') movePlayer(0, -1);
            if (e.key === 'ArrowDown') movePlayer(0, 1);
            if (e.key === 'ArrowLeft') movePlayer(-1, 0);
            if (e.key === 'ArrowRight') movePlayer(1, 0);
        });

        // Touch swipe support for mobile
        let touchstartX = 0;
        let touchstartY = 0;
        
        canvas.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
            touchstartY = e.changedTouches[0].screenY;
            e.preventDefault();
        }, {passive: false});

        canvas.addEventListener('touchend', e => {
            let touchendX = e.changedTouches[0].screenX;
            let touchendY = e.changedTouches[0].screenY;
            handleSwipe(touchstartX, touchstartY, touchendX, touchendY);
            e.preventDefault();
        }, {passive: false});

        function handleSwipe(startX, startY, endX, endY) {
            let dx = endX - startX;
            let dy = endY - startY;
            // require minimum 20px swipe
            if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) movePlayer(1, 0); // Right
                    else movePlayer(-1, 0); // Left
                } else {
                    if (dy > 0) movePlayer(0, 1); // Down
                    else movePlayer(0, -1); // Up
                }
            }
        }

        // Initial render
        render();
    }

    // Confetti effect function
    function createConfetti() {
        for (let i = 0; i < 70; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.backgroundColor = ['#ffb703', '#fb8500', '#ff4d4d', '#ffffff'][Math.floor(Math.random() * 4)];
            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    }
});
