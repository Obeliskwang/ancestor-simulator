const UI = {
    settings: {
        quality: 'low'
    },
    pressedButton: null,
    images: {},
    colors: {
        background: '#1a0f0a',
        backgroundDark: '#0d0705',
        primary: '#d4a574',
        primaryLight: '#e8c9a0',
        primaryDark: '#8b5a2b',
        accent: '#c9302c',
        accentGold: '#ffd700',
        accentGreen: '#4ecdc4',
        text: '#d4a574',
        textLight: '#e8c9a0',
        textDark: '#8b5a2b',
        dim: 'rgba(139, 90, 43, 0.5)',
        shadow: 'rgba(0, 0, 0, 0.7)',
        overlay: 'rgba(26, 15, 10, 0.85)'
    },
    
    animationState: {
        startScreen: {
            titleAlpha: 0,
            buttonAlpha: 0,
            particles: []
        },
        gacha: {
            spinning: false,
            spinTime: 0,
            result: null,
            cards: [],
            selectedIndex: 0,
            finalScale: 1,
            glowIntensity: 0
        },
        progressBar: {
            currentProgress: 10,
            targetProgress: 10,
            fillWidth: 0
        },
        buttons: [],
        textElements: []
    },
    
    init() {
        this.animationState.buttons = [];
        this.animationState.textElements = [];
        this.images.startBg = new Image();
        this.images.startBg.src = './images/bg/bg.jpg';
    },
    
    drawBackground() {
        const ctx = Utils.ctx;
        const w = Utils.width;
        const h = Utils.height;
        
        const gradient = Utils.drawGradient(0, 0, 0, h, [
            '#1a0f0a',
            '#2d1810',
            '#1a0f0a'
        ]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        
        if (this.settings.quality === 'low') return;
        
        ctx.globalAlpha = 0.03;
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * w;
            const y = Math.random() * h;
            const r = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = '#d4a574';
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },
    
    drawRitualCircle(x, y, radius, time, intensity = 1) {
        const ctx = Utils.ctx;
        
        ctx.save();
        ctx.translate(x, y);
        
        ctx.strokeStyle = this.colors.primary;
        ctx.lineWidth = 2 * intensity;
        ctx.globalAlpha = 0.3 * intensity;
        
        for (let i = 0; i < 3; i++) {
            const r = radius * (0.6 + i * 0.2);
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        const segments = 12;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2 + time * 0.001;
            const innerR = radius * 0.7;
            const outerR = radius * 0.9;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
            ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
            ctx.stroke();
        }
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - time * 0.0005;
            const r = radius * 0.5;
            const sx = Math.cos(angle) * r;
            const sy = Math.sin(angle) * r;
            
            ctx.beginPath();
            ctx.moveTo(sx, sy - 8);
            ctx.lineTo(sx + 6, sy + 4);
            ctx.lineTo(sx - 6, sy + 4);
            ctx.closePath();
            ctx.fillStyle = this.colors.accent;
            ctx.globalAlpha = 0.5 * intensity;
            ctx.fill();
        }
        
        ctx.restore();
    },
    
    drawStartScreen(time, state) {
        const w = Utils.width;
        const h = Utils.height;
        const ctx = Utils.ctx;

        const bg = this.images.startBg;
        if (bg && bg.complete && bg.naturalWidth > 0) {
            const imgW = bg.naturalWidth;
            const imgH = bg.naturalHeight;
            const imgAspect = imgW / imgH;
            const canvasAspect = w / h;
            let sx = 0, sy = 0, sw = imgW, sh = imgH;
            if (imgAspect > canvasAspect) {
                sw = imgH * canvasAspect;
                sx = (imgW - sw) / 2;
            } else {
                sh = imgW / canvasAspect;
                sy = (imgH - sh) / 2;
            }
            ctx.drawImage(bg, sx, sy, sw, sh, 0, 0, w, h);

            const overlay = Utils.drawGradient(0, 0, 0, h, [
                'rgba(10,6,4,0.60)',
                'rgba(10,6,4,0.40)',
                'rgba(10,6,4,0.70)'
            ]);
            ctx.fillStyle = overlay;
            ctx.fillRect(0, 0, w, h);
        } else {
            this.drawBackground();
        }
        
        const titleY = h * 0.25;
        const titleScale = Utils.lerp(0.5, 1, state.titleAlpha);
        
        ctx.save();
        ctx.translate(w / 2, titleY);
        ctx.scale(titleScale, titleScale);
        ctx.globalAlpha = state.titleAlpha;
        
        ctx.shadowColor = this.colors.accent;
        ctx.shadowBlur = (this.settings.quality === 'low') ? 12 : (30 + Math.sin(time * 0.003) * 10);
        
        Utils.setFont(36, 'bold');
        ctx.fillStyle = this.colors.primary;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('祖宗模拟器', 0, -25);
        
        Utils.setFont(28, 'bold');
        ctx.fillStyle = this.colors.accentGold;
        ctx.fillText('万族争霸', 0, 20);
        
        ctx.shadowBlur = 0;
        ctx.restore();
        
        const bottomY = Utils.height - 40;
        ctx.globalAlpha = state.titleAlpha * 0.5;
        Utils.drawText('从草履虫到地球霸主', w / 2, bottomY, {
            color: this.colors.textLight,
            size: 14,
            weight: 'normal'
        });
        ctx.globalAlpha = 1;
        
        const buttonY = h * 0.65;
        const buttonW = 180;
        const buttonH = 50;
        
        this.animationState.buttons = [{
            id: 'startGame',
            x: w / 2 - buttonW / 2,
            y: buttonY - buttonH / 2,
            w: buttonW,
            h: buttonH,
            text: '开始游戏',
            alpha: state.buttonAlpha
        }];
        
        ctx.globalAlpha = state.buttonAlpha;

        const hovered = this.hoveredButton === 'startGame';
        const pressed = this.pressedButton === 'startGame';
        const fill = pressed ? this.darkenColor(this.colors.primaryDark, 18) : this.colors.primaryDark;
        const stroke = hovered ? this.colors.accentGold : this.colors.primary;

        ctx.save();
        ctx.translate(w / 2, buttonY);

        ctx.shadowColor = hovered ? this.colors.accentGold : this.colors.accent;
        ctx.shadowBlur = (this.settings.quality === 'low') ? (hovered ? 10 : 6) : (20 + Math.sin(time * 0.005) * 5);

        Utils.drawRect(-buttonW / 2, -buttonH / 2, buttonW, buttonH, {
            fill,
            stroke,
            strokeWidth: 2,
            radius: 8
        });

        Utils.drawText('开始游戏', 0, 0, {
            color: this.colors.textLight,
            size: 18,
            weight: 'bold'
        });

        ctx.restore();
        ctx.globalAlpha = 1;
        
        const savedData = Storage.get('gameData', {});
        if (savedData.highestProgress !== undefined) {
            ctx.globalAlpha = state.buttonAlpha * 0.7;
            Utils.drawText(`最高进度: ${savedData.highestProgress}%`, w / 2, h * 0.8, {
                color: this.colors.text,
                size: 12,
                weight: 'normal'
            });
            ctx.globalAlpha = 1;
        }
    },
    
    drawGachaScreen(time, state) {
        const w = Utils.width;
        const h = Utils.height;
        const ctx = Utils.ctx;
        
        this.drawBackground();
        
        const storyY = h * 0.08;
        ctx.globalAlpha = state.storyAlpha;
        Utils.drawText('远古海洋之中，无数草履虫繁衍生息。', w / 2, storyY, {
            color: this.colors.textLight,
            size: 14,
            weight: 'normal'
        });
        Utils.drawText('环境不断变化，族群开始分化，演化出三大分支...', w / 2, storyY + 25, {
            color: this.colors.textLight,
            size: 14,
            weight: 'normal'
        });
        ctx.globalAlpha = 1;
        
        const ritualY = h * 0.35;
        const ritualR = Math.min(w, h) * 0.22;
        
        this.drawRitualCircle(w / 2, ritualY, ritualR, time, state.ritualIntensity);
        
        if (state.showGachaButton && !state.spinning && !state.showResult) {
            const btnW = 160;
            const btnH = 48;
            const btnY = ritualY + ritualR + 40;
            
            this.animationState.buttons = [{
                id: 'gacha',
                x: w / 2 - btnW / 2,
                y: btnY - btnH / 2,
                w: btnW,
                h: btnH,
                text: '抽取种族',
                alpha: state.buttonAlpha
            }];
            
            ctx.globalAlpha = state.buttonAlpha;

            const hovered = this.hoveredButton === 'gacha';
            const pressed = this.pressedButton === 'gacha';
            const fill = pressed ? this.darkenColor(this.colors.primaryDark, 18) : this.colors.primaryDark;
            const stroke = hovered ? this.colors.textLight : this.colors.accentGold;

            ctx.save();
            ctx.translate(w / 2, btnY);

            ctx.shadowColor = this.colors.accentGold;
            ctx.shadowBlur = (this.settings.quality === 'low') ? (hovered ? 12 : 8) : (25 + Math.sin(time * 0.005) * 10);

            Utils.drawRect(-btnW / 2, -btnH / 2, btnW, btnH, {
                fill,
                stroke,
                strokeWidth: 2,
                radius: 24
            });

            Utils.drawText('抽取种族', 0, 0, {
                color: this.colors.accentGold,
                size: 16,
                weight: 'bold'
            });

            ctx.restore();
            ctx.globalAlpha = 1;
        }
        
        if (state.spinning || state.showResult) {
            this.drawSpinningCards(time, state);
        }
    },
    
    drawSpinningCards(time, state) {
        const w = Utils.width;
        const h = Utils.height;
        const ctx = Utils.ctx;
        
        const cardY = h * 0.35;
        const cardW = 100;
        const cardH = 140;
        const spacing = 30;
        
        const races = GameData.races;
        const totalWidth = cardW * 3 + spacing * 2;
        const startX = w / 2 - totalWidth / 2 + cardW / 2;
        
        this.animationState.buttons = [];
        
        if (state.showResult && state.result) {
            ctx.save();
            ctx.translate(w / 2, cardY);
            
            const scale = Utils.lerp(1, state.resultScale, Utils.easeOutElastic(Math.min(1, state.resultTimer / 500)));
            ctx.scale(scale, scale);
            
            ctx.shadowColor = this.colors.accentGold;
            ctx.shadowBlur = 40 + state.glowIntensity * 20;
            
            Utils.drawRect(-cardW / 2, -cardH / 2, cardW, cardH, {
                fill: state.result.color,
                stroke: this.colors.accentGold,
                strokeWidth: 3,
                radius: 10
            });
            
            ctx.shadowBlur = 0;
            
            Utils.drawText(state.result.title, 0, -cardH / 2 + 20, {
                color: this.colors.textLight,
                size: 11,
                weight: 'bold'
            });
            
            this.drawCreatureIcon(0, -10, state.result.id, cardW * 0.5);
            
            Utils.drawText(state.result.name, 0, cardH / 2 - 50, {
                color: this.colors.accentGold,
                size: 14,
                weight: 'bold'
            });
            
            Utils.drawText(state.result.initialForm, 0, cardH / 2 - 30, {
                color: this.colors.textLight,
                size: 10,
                weight: 'normal'
            });
            
            ctx.restore();
            
            if (state.showConfirmButton) {
                const rerollW = 160;
                const rerollH = 48;
                const confirmW = 140;
                const confirmH = 45;
                const gap = 14;
                const bottomPadding = 24;
                
                let rerollY = cardY + cardH / 2 + 55;
                let confirmY = rerollY + rerollH + gap;
                const overflow = (confirmY + confirmH / 2) - (h - bottomPadding);
                if (overflow > 0) {
                    rerollY -= overflow;
                    confirmY -= overflow;
                }
                
                this.animationState.buttons.push({
                    id: 'gacha',
                    x: w / 2 - rerollW / 2,
                    y: rerollY - rerollH / 2,
                    w: rerollW,
                    h: rerollH,
                    text: '重抽种族',
                    alpha: state.resultAlpha
                });
                this.animationState.buttons.push({
                    id: 'confirm',
                    x: w / 2 - confirmW / 2,
                    y: confirmY - confirmH / 2,
                    w: confirmW,
                    h: confirmH,
                    text: '开始进化',
                    alpha: state.resultAlpha
                });
                
                ctx.globalAlpha = state.resultAlpha;
                
                const rerollHovered = this.hoveredButton === 'gacha';
                const rerollPressed = this.pressedButton === 'gacha';
                const rerollFill = rerollPressed ? this.darkenColor(this.colors.primaryDark, 18) : this.colors.primaryDark;
                const rerollStroke = rerollHovered ? this.colors.textLight : this.colors.accentGold;
                
                ctx.save();
                ctx.translate(w / 2, rerollY);
                ctx.shadowColor = this.colors.accentGold;
                ctx.shadowBlur = (this.settings.quality === 'low') ? (rerollHovered ? 12 : 8) : (25 + Math.sin(time * 0.005) * 10);
                
                Utils.drawRect(-rerollW / 2, -rerollH / 2, rerollW, rerollH, {
                    fill: rerollFill,
                    stroke: rerollStroke,
                    strokeWidth: 2,
                    radius: 24
                });
                
                Utils.drawText('重抽种族', 0, 0, {
                    color: this.colors.accentGold,
                    size: 16,
                    weight: 'bold'
                });
                ctx.restore();
                
                const confirmHovered = this.hoveredButton === 'confirm';
                const confirmPressed = this.pressedButton === 'confirm';
                const confirmFill = confirmPressed ? this.darkenColor(this.colors.accentGreen, 18) : this.colors.accentGreen;
                const confirmStroke = confirmHovered ? this.colors.accentGold : this.colors.textLight;
                
                ctx.save();
                ctx.translate(w / 2, confirmY);
                
                Utils.drawRect(-confirmW / 2, -confirmH / 2, confirmW, confirmH, {
                    fill: confirmFill,
                    stroke: confirmStroke,
                    strokeWidth: 1,
                    radius: 8
                });
                
                Utils.drawText('开始进化', 0, 0, {
                    color: this.colors.backgroundDark,
                    size: 16,
                    weight: 'bold'
                });
                
                ctx.restore();
                ctx.globalAlpha = 1;
            }
        } else if (state.spinning) {
            const positions = [];
            const cardCount = 9;
            const offset = state.spinOffset % 3;
            
            for (let i = 0; i < cardCount; i++) {
                const idx = (i + Math.floor(state.spinOffset)) % 3;
                const posX = startX + (i % 3) * (cardW + spacing);
                const posY = cardY + Math.floor(i / 3) * (cardH * 0.4);
                
                ctx.globalAlpha = i === 4 ? 1 : 0.5;
                const scale = i === 4 ? 1 : 0.7;
                
                ctx.save();
                ctx.translate(posX, posY);
                ctx.scale(scale, scale);
                
                if (i === 4) {
                    ctx.shadowColor = this.colors.accentGold;
                    ctx.shadowBlur = 20;
                }
                
                Utils.drawRect(-cardW / 2, -cardH / 2, cardW, cardH, {
                    fill: races[idx].color,
                    stroke: i === 4 ? this.colors.accentGold : this.colors.dim,
                    strokeWidth: i === 4 ? 2 : 1,
                    radius: 8
                });
                
                ctx.shadowBlur = 0;
                
                Utils.drawText(races[idx].name, 0, -cardH / 2 + 15, {
                    color: this.colors.textLight,
                    size: 10,
                    weight: 'bold'
                });
                
                this.drawCreatureIcon(0, -5, races[idx].id, cardW * 0.4);
                
                ctx.restore();
                
                positions.push({ x: posX, y: posY, w: cardW, h: cardH });
            }
            
            ctx.globalAlpha = 1;
            this.animationState.buttons = [];
        }
    },
    
    drawCreatureIcon(x, y, raceId, size) {
        const ctx = Utils.ctx;
        const s = size / 2;
        
        ctx.save();
        ctx.translate(x, y);
        
        switch (raceId) {
            case 'dunkleosteus':
                ctx.fillStyle = '#4ecdc4';
                ctx.beginPath();
                ctx.ellipse(0, 0, s * 0.8, s * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#2d6a8f';
                ctx.beginPath();
                ctx.arc(-s * 0.3, 0, s * 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#1a4a5c';
                ctx.beginPath();
                ctx.moveTo(s * 0.5, -s * 0.1);
                ctx.lineTo(s * 0.9, 0);
                ctx.lineTo(s * 0.5, s * 0.1);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#1a4a5c';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-s * 0.8, -s * 0.3);
                ctx.lineTo(s * 0.8, -s * 0.3);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-s * 0.8, s * 0.3);
                ctx.lineTo(s * 0.8, s * 0.3);
                ctx.stroke();
                break;
                
            case 'smilodon':
                ctx.fillStyle = '#cd853f';
                ctx.beginPath();
                ctx.ellipse(0, s * 0.1, s * 0.6, s * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(0, -s * 0.3, s * 0.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#d4a574';
                ctx.beginPath();
                ctx.moveTo(-s * 0.15, -s * 0.55);
                ctx.lineTo(-s * 0.08, -s * 0.2);
                ctx.lineTo(-s * 0.22, -s * 0.2);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(s * 0.15, -s * 0.55);
                ctx.lineTo(s * 0.08, -s * 0.2);
                ctx.lineTo(s * 0.22, -s * 0.2);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#2d1810';
                ctx.beginPath();
                ctx.arc(-s * 0.12, -s * 0.35, s * 0.06, 0, Math.PI * 2);
                ctx.arc(s * 0.12, -s * 0.35, s * 0.06, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'confuciusornis':
                ctx.fillStyle = '#68d391';
                ctx.beginPath();
                ctx.ellipse(0, 0, s * 0.5, s * 0.35, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(s * 0.3, -s * 0.15, s * 0.4, s * 0.15, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(s * 0.15, -s * 0.45, s * 0.25, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.moveTo(s * 0.35, -s * 0.4);
                ctx.lineTo(s * 0.6, -s * 0.5);
                ctx.lineTo(s * 0.4, -s * 0.3);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#2d1810';
                ctx.beginPath();
                ctx.arc(s * 0.2, -s * 0.48, s * 0.05, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        ctx.restore();
    },
    
    drawProgressBar(progress, time) {
        const w = Utils.width;
        const h = Utils.height;
        const ctx = Utils.ctx;
        
        const barW = w * 0.85;
        const barH = 24;
        const barX = (w - barW) / 2;
        const barY = 50;

        Utils.drawText('地表占领进度：', barX + 80, barY - 20, {
            color: this.colors.textLight,
            size: 12,
            weight: 'bold',
            align: 'right',
            shadow: { color: 'rgba(0,0,0,0.6)', blur: 3, offsetX: 1, offsetY: 1 }
        });
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        
        Utils.drawRect(barX - 4, barY - 4, barW + 8, barH + 8, {
            fill: '#3d2817',
            stroke: this.colors.primaryDark,
            strokeWidth: 2,
            radius: 6
        });
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        const fillW = (barW * Math.min(100, Math.max(0, progress))) / 100;
        
        let fillColor;
        if (progress >= 90) {
            fillColor = this.colors.accentGold;
        } else if (progress >= 60) {
            fillColor = this.colors.accentGreen;
        } else if (progress >= 30) {
            fillColor = this.colors.primary;
        } else {
            fillColor = this.colors.accent;
        }
        
        if (fillW > 0) {
            const gradient = Utils.ctx.createLinearGradient(barX, 0, barX + fillW, 0);
            gradient.addColorStop(0, fillColor);
            gradient.addColorStop(0.5, this.lightenColor(fillColor, 30));
            gradient.addColorStop(1, fillColor);
            
            Utils.drawRect(barX, barY, fillW, barH, {
                fill: gradient,
                radius: 4
            });
            
            if (this.settings.quality !== 'low') {
                ctx.globalAlpha = 0.3 + Math.sin(time * 0.005) * 0.1;
                for (let i = 0; i < fillW; i += 8) {
                    const gx = barX + i;
                    const gy = barY + barH / 2;
                    const alpha = Math.random() * 0.5;
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.fillRect(gx, gy - 1, 2, 2);
                }
                ctx.globalAlpha = 1;
            }
        }
        
        Utils.drawText(`${Math.round(progress)}%`, w / 2, barY + barH / 2, {
            color: progress >= 50 ? this.colors.backgroundDark : this.colors.textLight,
            size: 12,
            weight: 'bold',
            shadow: progress >= 50 ? null : { color: 'rgba(0,0,0,0.5)', blur: 2, offsetX: 1, offsetY: 1 }
        });
    },
    
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    },
    
    drawPhaseIndicator(phase, progress) {
        const w = Utils.width;
        const h = Utils.height;
        const ctx = Utils.ctx;
        
        const phases = ['进化', '冲突', '奇遇', '天灾', '结局'];
        const phaseIndex = { evolution: 0, conflict: 1, encounter: 2, disaster: 3, ending: 4 };
        const currentIndex = phaseIndex[phase] || 0;
        
        const barW = w * 0.7;
        const barH = 8;
        const barX = (w - barW) / 2;
        const barY = h - 60;
        
        const stepW = barW / (phases.length - 1);
        
        ctx.fillStyle = this.colors.dim;
        ctx.fillRect(barX, barY, barW, barH);
        
        ctx.fillStyle = this.colors.primary;
        ctx.fillRect(barX, barY, stepW * currentIndex + stepW / 2, barH);
        
        phases.forEach((name, i) => {
            const px = barX + i * stepW;
            const py = barY - 8;
            
            ctx.beginPath();
            ctx.arc(px, barY + barH / 2, 6, 0, Math.PI * 2);
            if (i <= currentIndex) {
                ctx.fillStyle = this.colors.accentGold;
                ctx.shadowColor = this.colors.accentGold;
                ctx.shadowBlur = 10;
            } else {
                ctx.fillStyle = this.colors.dim;
                ctx.shadowBlur = 0;
            }
            ctx.fill();
            ctx.shadowBlur = 0;
            
            Utils.drawText(name, px, py - 5, {
                color: i <= currentIndex ? this.colors.textLight : this.colors.dim,
                size: 10,
                weight: 'bold'
            });
        });
    },
    
    handleClick(x, y) {
        const buttons = this.animationState.buttons;
        
        for (let i = buttons.length - 1; i >= 0; i--) {
            const btn = buttons[i];
            if (btn.alpha !== undefined && btn.alpha < 0.5) continue;
            
            if (Utils.isPointInRect(x, y, btn.x, btn.y, btn.w, btn.h)) {
                return btn.id;
            }
        }
        
        return null;
    },
    
    handleMouseMove(x, y) {
        const buttons = this.animationState.buttons;
        let found = false;
        
        for (let i = buttons.length - 1; i >= 0; i--) {
            const btn = buttons[i];
            if (Utils.isPointInRect(x, y, btn.x, btn.y, btn.w, btn.h)) {
                this.hoveredButton = btn.id;
                found = true;
                break;
            }
        }
        
        if (!found) {
            this.hoveredButton = null;
        }
    }
};

window.UI = UI;
