(function() {
    'use strict';
    
    let lastTime = 0;
    let canvas, container;
    
    function init() {
        try {
            canvas = document.getElementById('gameCanvas');
            container = document.getElementById('game-container');
            
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            Utils.init('gameCanvas');
            UI.init();
            Game.switchScreen('start');
            
            setupEventListeners();
            
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
            
            console.log('祖宗模拟器：万族争霸 - 初始化完成');
            
        } catch (error) {
            console.error('初始化错误:', error);
            showError('哎呀，出错了，请重启试试吧~');
        }
    }
    
    function setupEventListeners() {
        const getEventPos = function(e) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = Utils.width / rect.width;
            const scaleY = Utils.height / rect.height;
            
            let clientX = e.clientX;
            let clientY = e.clientY;
            if ((clientX === undefined || clientY === undefined) && e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            }
            
            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        };
        
        let inputLocked = false;
        const lockInput = function() {
            inputLocked = true;
            setTimeout(() => inputLocked = false, 200);
        };
        
        const setPressedFromPos = function(pos) {
            Game.handleMouseMove(pos.x, pos.y);
            UI.pressedButton = UI.hoveredButton;
        };
        
        canvas.addEventListener('pointerdown', function(e) {
            if (e.pointerType === 'touch') e.preventDefault();
            if (inputLocked) return;
            lockInput();
            
            const pos = getEventPos(e);
            setPressedFromPos(pos);
            Game.handleClick(pos.x, pos.y);
        }, { passive: false });
        
        canvas.addEventListener('pointermove', function(e) {
            if (e.pointerType !== 'mouse') return;
            const pos = getEventPos(e);
            Game.handleMouseMove(pos.x, pos.y);
        });
        
        const clearPressed = function() {
            UI.pressedButton = null;
        };
        canvas.addEventListener('pointerup', clearPressed);
        canvas.addEventListener('pointercancel', clearPressed);
        
        window.addEventListener('resize', function() {
            Utils.updateSize();
        });
        
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                Animation.clear();
            } else {
                lastTime = performance.now();
            }
        });
    }
    
    function gameLoop(time) {
        try {
            const dt = time - lastTime;
            lastTime = time;
            
            Utils.clear();
            Animation.update(time);
            
            Game.update(dt, time);
            Game.render(time);
            
            requestAnimationFrame(gameLoop);
            
        } catch (error) {
            console.error('游戏循环错误:', error);
            showError('哎呀，出错了，请重启试试吧~');
        }
    }
    
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
