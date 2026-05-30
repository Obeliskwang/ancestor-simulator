const Utils = {
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    dpr: 1,
    
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error('Canvas not found');
        }
        this.ctx = this.canvas.getContext('2d');
        this.updateSize();
        window.addEventListener('resize', () => this.updateSize());
    },
    
    updateSize() {
        this.dpr = window.devicePixelRatio || 1;
        const container = this.canvas.parentElement;
        const w = container.clientWidth;
        const h = container.clientHeight;
        this.width = w;
        this.height = h;
        this.canvas.width = w * this.dpr;
        this.canvas.height = h * this.dpr;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
    },
    
    clear(color = null) {
        if (color) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    },
    
    setFont(size, weight = 'bold') {
        this.ctx.font = `${weight} ${size}px "Microsoft YaHei", "PingFang SC", sans-serif`;
    },
    
    measureText(text) {
        return this.ctx.measureText(text);
    },
    
    drawText(text, x, y, options = {}) {
        const {
            color = '#d4a574',
            size = 16,
            weight = 'bold',
            align = 'center',
            baseline = 'middle',
            shadow = null
        } = options;
        
        this.ctx.save();
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;
        
        if (shadow) {
            this.ctx.shadowColor = shadow.color || 'rgba(0,0,0,0.5)';
            this.ctx.shadowBlur = shadow.blur || 4;
            this.ctx.shadowOffsetX = shadow.offsetX || 2;
            this.ctx.shadowOffsetY = shadow.offsetY || 2;
        }
        
        this.ctx.fillStyle = color;
        this.ctx.font = `${weight} ${size}px "Microsoft YaHei", "PingFang SC", sans-serif`;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    },
    
    drawRect(x, y, w, h, options = {}) {
        const {
            fill = null,
            stroke = null,
            strokeWidth = 1,
            radius = 0,
            shadow = null
        } = options;
        
        this.ctx.save();
        
        if (shadow) {
            this.ctx.shadowColor = shadow.color || 'rgba(0,0,0,0.5)';
            this.ctx.shadowBlur = shadow.blur || 4;
            this.ctx.shadowOffsetX = shadow.offsetX || 2;
            this.ctx.shadowOffsetY = shadow.offsetY || 2;
        }
        
        if (radius > 0) {
            this.roundRect(x, y, w, h, radius);
        } else {
            this.ctx.beginPath();
            this.ctx.rect(x, y, w, h);
        }
        
        if (fill) {
            this.ctx.fillStyle = fill;
            this.ctx.fill();
        }
        if (stroke) {
            this.ctx.strokeStyle = stroke;
            this.ctx.lineWidth = strokeWidth;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    },
    
    roundRect(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
    },
    
    drawCircle(x, y, r, options = {}) {
        const {
            fill = null,
            stroke = null,
            strokeWidth = 1,
            shadow = null
        } = options;
        
        this.ctx.save();
        
        if (shadow) {
            this.ctx.shadowColor = shadow.color || 'rgba(0,0,0,0.5)';
            this.ctx.shadowBlur = shadow.blur || 4;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        
        if (fill) {
            this.ctx.fillStyle = fill;
            this.ctx.fill();
        }
        if (stroke) {
            this.ctx.strokeStyle = stroke;
            this.ctx.lineWidth = strokeWidth;
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    },
    
    drawGradient(x1, y1, x2, y2, colors) {
        const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        colors.forEach((color, i) => {
            gradient.addColorStop(i / (colors.length - 1), color);
        });
        return gradient;
    },
    
    drawRadialGradient(x, y, r1, r2, colors) {
        const gradient = this.ctx.createRadialGradient(x, y, r1, x, y, r2);
        colors.forEach((color, i) => {
            gradient.addColorStop(i / (colors.length - 1), color);
        });
        return gradient;
    },
    
    isPointInRect(px, py, x, y, w, h) {
        return px >= x && px <= x + w && py >= y && py <= y + h;
    },
    
    isPointInCircle(px, py, cx, cy, r) {
        const dx = px - cx;
        const dy = py - cy;
        return dx * dx + dy * dy <= r * r;
    },
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    },
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    },
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    
    easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
    
    formatNumber(num) {
        return Math.round(num);
    }
};

const Animation = {
    tasks: [],
    lastTime: 0,
    
    add(task) {
        task.startTime = this.lastTime;
        task.elapsed = 0;
        this.tasks.push(task);
        return task;
    },
    
    remove(task) {
        const idx = this.tasks.indexOf(task);
        if (idx > -1) this.tasks.splice(idx, 1);
    },
    
    update(time) {
        const dt = time - this.lastTime;
        this.lastTime = time;
        
        for (let i = this.tasks.length - 1; i >= 0; i--) {
            const task = this.tasks[i];
            task.elapsed = time - task.startTime;
            
            if (task.elapsed >= task.duration) {
                task.elapsed = task.duration;
                if (task.onUpdate) task.onUpdate(task.elapsed / task.duration, 1);
                if (task.onComplete) task.onComplete();
                this.tasks.splice(i, 1);
            } else {
                if (task.onUpdate) task.onUpdate(task.elapsed / task.duration, dt);
            }
        }
    },
    
    clear() {
        this.tasks = [];
    },
    
    hasTasks() {
        return this.tasks.length > 0;
    }
};

const Storage = {
    prefix: 'ancestor_sim_',
    
    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
        } catch (e) {
            console.warn('Storage error:', e);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const val = localStorage.getItem(this.prefix + key);
            return val ? JSON.parse(val) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
        } catch (e) {}
    },
    
    clear() {
        try {
            Object.keys(localStorage)
                .filter(k => k.startsWith(this.prefix))
                .forEach(k => localStorage.removeItem(k));
        } catch (e) {}
    }
};

window.Utils = Utils;
window.Animation = Animation;
window.Storage = Storage;
