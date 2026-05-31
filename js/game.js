const Game = {
    state: {
        hasStarted: false,
        currentScreen: 'start',
        previousScreen: null,
        transitionAlpha: 0,
        isTransitioning: false,
        transitionPhase: 'idle',
        transitionNextScreen: null,

        selectedRace: null,
        progress: 10,

        evolutionQuestionIndex: 0,
        evolutionScore: { routeA: 0, routeB: 0 },
        evolutionQuestions: [],

        conflictQuestionIndex: 0,
        conflictScore: 0,
        conflictQuestions: [],

        encounterType: null,
        relic: null,
        hiddenEnding: null,

        disasterQuestionIndex: 0,
        disasterScore: 0,
        disasterQuestions: [],

        screenState: {}
    },

    screens: {
        start: {
            init() {
                Game.state.screenState = {
                    titleAlpha: 0,
                    buttonAlpha: 0,
                    animating: true
                };
            },

            update(dt, time) {
                const s = Game.state.screenState;

                if (s.titleAlpha < 1) {
                    s.titleAlpha = Math.min(1, s.titleAlpha + dt * 0.001);
                } else if (s.buttonAlpha < 1) {
                    s.buttonAlpha = Math.min(1, s.buttonAlpha + dt * 0.002);
                }
            },

            render(time) {
                UI.drawStartScreen(time, Game.state.screenState);
            },

            onClick(id) {
                if (id === 'startGame') {
                    Game.switchScreen('gacha');
                }
            }
        },

        gacha: {
            init() {
                Game.state.screenState = {
                    storyAlpha: 0,
                    buttonAlpha: 0,
                    ritualIntensity: 0.3,
                    showGachaButton: false,
                    spinning: false,
                    spinTimer: 0,        // 🟢 引入相对旋转计时器
                    spinOffset: 0,
                    spinSpeed: 0,
                    showResult: false,
                    result: null,
                    resultScale: 0,
                    resultTimer: 0,
                    glowIntensity: 0,
                    resultAlpha: 0,
                    showConfirmButton: false,
                    isReroll: false
                };
            },

            update(dt, time) {
                const s = Game.state.screenState;

                if (s.storyAlpha < 1) {
                    s.storyAlpha = Math.min(1, s.storyAlpha + dt * 0.0008);
                }

                if (s.storyAlpha > 0.8 && !s.showGachaButton) {
                    s.showGachaButton = true;
                }

                if (s.showGachaButton && s.buttonAlpha < 1) {
                    s.buttonAlpha = Math.min(1, s.buttonAlpha + dt * 0.002);
                }

                s.ritualIntensity = 0.3 + Math.sin(time * 0.002) * 0.2;

                // 🟢 修复后的旋转与减速逻辑
                if (s.spinning) {
                    s.spinTimer += dt; // 每帧累加相对时间
                    s.spinOffset += s.spinSpeed * dt * 0.1;

                    // 1500ms 后开始减速
                    if (s.spinTimer > 1500) {
                        const decelTime = s.spinTimer - 1500;
                        s.spinSpeed = Math.max(0, s.initialSpinSpeed * (1 - decelTime / 1000));

                        // 减速到 0 且额外缓冲 800ms 后停止
                        if (s.spinSpeed <= 0 && decelTime > 800) {
                            s.spinning = false;
                            s.showResult = true;
                            s.result = Game.state.selectedRace;
                            s.resultTimer = 0; // 确保结果计时器从0开始
                            s.spinOffset = GameData.races.indexOf(Game.state.selectedRace);
                        }
                    }
                }

                if (s.showResult) {
                    s.resultTimer += dt;
                    s.resultScale = Math.min(1, s.resultTimer / 500);

                    if (s.resultTimer > 300) {
                        s.glowIntensity = Math.min(1, (s.resultTimer - 300) / 300);
                    }

                    if (s.resultTimer > 600) {
                        s.resultAlpha = Math.min(1, (s.resultTimer - 600) / 300);
                    }

                    if (s.resultTimer > 1000) {
                        s.showConfirmButton = true;
                        s.isReroll = true;
                    }
                }
            },

            render(time) {
                UI.drawGachaScreen(time, Game.state.screenState);
            },

            onClick(id) {
                const s = Game.state.screenState;

                // 抽取 / 重抽 统一逻辑
                if (id === 'gacha' && !s.spinning) {
                    // 重置所有展示状态
                    s.showResult = false;
                    s.result = null;
                    s.resultTimer = 0;
                    s.glowIntensity = 0;
                    s.resultAlpha = 0;
                    s.showConfirmButton = false;
                    s.isReroll = false;

                    // 🟢 补全并重置相对时间变量
                    s.spinning = true;
                    s.spinTimer = 0; // 归零相对计时器，切断上一轮动画的影响
                    s.initialSpinSpeed = 15;
                    s.spinSpeed = s.initialSpinSpeed;

                    // 重新随机种族
                    Game.state.selectedRace = Utils.randomChoice(GameData.races);
                }

                // 点击继续，进入下一环节
                if (id === 'confirm' && s.showConfirmButton) {
                    Game.state.progress = 10;
                    Game.switchScreen('evolution');
                }
            }
        },

        evolution: {
            init() {
                const raceId = Game.state.selectedRace.id;
                Game.state.evolutionQuestions = [...GameData.getEvolutionQuestions(raceId)];
                Game.state.evolutionQuestionIndex = 0;
                Game.state.evolutionScore = { routeA: 0, routeB: 0 };

                Game.state.screenState = {
                    questionAlpha: 0,
                    questionIndex: 0,
                    shuffleOptions: false,
                    options: [],
                    selectedOption: null,
                    optionAlpha: 0,
                    showResult: false,
                    resultAlpha: 0,
                    grade: null
                };
            },

            update(dt, time) {
                const s = Game.state.screenState;

                if (s.questionAlpha < 1) {
                    s.questionAlpha = Math.min(1, s.questionAlpha + dt * 0.003);
                }

                if (s.questionAlpha > 0.7 && !s.shuffleOptions) {
                    s.shuffleOptions = true;
                    const q = Game.state.evolutionQuestions[s.questionIndex];
                    s.options = Utils.randomChoice([
                        [
                            { id: 'A', text: q.optionA.text, route: q.optionA.route },
                            { id: 'B', text: q.optionB.text, route: q.optionB.route }
                        ],
                        [
                            { id: 'B', text: q.optionB.text, route: q.optionB.route },
                            { id: 'A', text: q.optionA.text, route: q.optionA.route }
                        ]
                    ]);
                }

                if (s.shuffleOptions && s.optionAlpha < 1) {
                    s.optionAlpha = Math.min(1, s.optionAlpha + dt * 0.003);
                }

                if (s.showResult) {
                    s.resultAlpha = Math.min(1, s.resultAlpha + dt * 0.002);

                    if (s.resultAlpha >= 1 && s.resultTimer === undefined) {
                        s.resultTimer = 0;
                    }

                    if (s.resultTimer !== undefined) {
                        s.resultTimer += dt;
                        if (s.resultTimer > 2000) {
                            Game.state.progress += s.grade === 'excellent' ? 40 : (s.grade === 'normal' ? 20 : 5);
                            Game.switchScreen('conflict');
                        }
                    }
                }
            },

            render(time) {
                const w = Utils.width;
                const h = Utils.height;
                const ctx = Utils.ctx;

                UI.drawBackground();
                UI.drawProgressBar(Game.state.progress, time);

                const s = Game.state.screenState;
                const q = Game.state.evolutionQuestions[s.questionIndex];

                if (!s.showResult) {
                    ctx.globalAlpha = s.questionAlpha;

                    Utils.drawText(`进化阶段 ${s.questionIndex + 1}/10`, w / 2, h * 0.18, {
                        color: UI.colors.accentGold,
                        size: 16,
                        weight: 'bold'
                    });

                    Utils.drawRect(w * 0.08, h * 0.22, w * 0.84, h * 0.18, {
                        fill: UI.colors.backgroundDark,
                        stroke: UI.colors.primaryDark,
                        strokeWidth: 2,
                        radius: 10
                    });

                    Utils.drawText(q.prompt + '，你选择？', w / 2, h * 0.31, {
                        color: UI.colors.textLight,
                        size: 14,
                        weight: 'normal'
                    });

                    ctx.globalAlpha = s.optionAlpha;

                    const optY1 = h * 0.5;
                    const optY2 = h * 0.68;
                    const optH = h * 0.14;
                    const optW = w * 0.84;
                    const optX = w * 0.08;

                    UI.animationState.buttons = [];

                    if (s.selectedOption === null) {
                        UI.animationState.buttons.push(
                            { id: 'optionA', x: optX, y: optY1 - optH / 2, w: optW, h: optH, alpha: s.optionAlpha },
                            { id: 'optionB', x: optX, y: optY2 - optH / 2, w: optW, h: optH, alpha: s.optionAlpha }
                        );
                    }

                    const baseFill = UI.colors.primaryDark;
                    const optionAPressed = UI.pressedButton === 'optionA';
                    const optionBPressed = UI.pressedButton === 'optionB';
                    const optionASelected = s.selectedOption === 'optionA';
                    const optionBSelected = s.selectedOption === 'optionB';
                    const fillA = (optionAPressed || optionASelected) ? UI.darkenColor(baseFill, 18) : baseFill;
                    const fillB = (optionBPressed || optionBSelected) ? UI.darkenColor(baseFill, 18) : baseFill;

                    Utils.drawRect(optX, optY1 - optH / 2, optW, optH, {
                        fill: fillA,
                        stroke: UI.colors.primary,
                        strokeWidth: 2,
                        radius: 8
                    });
                    Utils.drawText(s.options[0]?.text || '', w / 2, optY1, {
                        color: UI.colors.textLight,
                        size: 13,
                        weight: 'normal'
                    });

                    Utils.drawRect(optX, optY2 - optH / 2, optW, optH, {
                        fill: fillB,
                        stroke: UI.colors.primary,
                        strokeWidth: 2,
                        radius: 8
                    });
                    Utils.drawText(s.options[1]?.text || '', w / 2, optY2, {
                        color: UI.colors.textLight,
                        size: 13,
                        weight: 'normal'
                    });

                    ctx.globalAlpha = 1;
                } else {
                    ctx.globalAlpha = s.resultAlpha;

                    Utils.drawRect(w * 0.1, h * 0.3, w * 0.8, h * 0.4, {
                        fill: UI.colors.backgroundDark,
                        stroke: s.grade === 'excellent' ? UI.colors.accentGold : (s.grade === 'normal' ? UI.colors.accentGreen : UI.colors.accent),
                        strokeWidth: 3,
                        radius: 15
                    });

                    let gradeLines = [];
                    let gradeColor;

                    if (s.grade === 'excellent') {
                        gradeLines = ['演化方向精准统一，躯体与能力全面跃升'];
                        gradeColor = UI.colors.accentGold;
                    } else if (s.grade === 'normal') {
                        gradeLines = ['演化路线摇摆，各项能力均衡，', '无突出优势'];
                        gradeColor = UI.colors.accentGreen;
                    } else {
                        gradeLines = ['演化杂乱失衡，身体结构出现缺陷，', '整体实力下滑'];
                        gradeColor = UI.colors.accent;
                    }

                    // 标题
                    Utils.drawText('演化评价', w / 2, h * 0.38, {
                        color: UI.colors.textLight,
                        size: 14,
                        weight: 'normal',
                        align: 'center'
                    });

                    // 分行绘制正文
                    const baseY = h * 0.48;
                    const lineHeight = 28; // 行间距，按需调整
                    gradeLines.forEach((line, idx) => {
                        Utils.drawText(line, w / 2, baseY + idx * lineHeight, {
                            color: gradeColor,
                            size: 20,
                            weight: 'bold',
                            align: 'center'
                        });
                    });

                    const bonusText = s.grade === 'excellent' ? '+40%' : (s.grade === 'normal' ? '+20%' : '+5%');
                    Utils.drawText(`进度 ${bonusText}`, w / 2, h * 0.58, {
                        color: UI.colors.textLight,
                        size: 16,
                        weight: 'bold'
                    });

                    ctx.globalAlpha = 1;
                }

                UI.drawPhaseIndicator('evolution', Game.state.progress);
            },

            onClick(id) {
                const s = Game.state.screenState;

                if (s.selectedOption === null && (id === 'optionA' || id === 'optionB')) {
                    s.selectedOption = id;
                    const option = s.options[id === 'optionA' ? 0 : 1];

                    if (option.route === Game.state.selectedRace.routes[0]) {
                        Game.state.evolutionScore.routeA++;
                    } else {
                        Game.state.evolutionScore.routeB++;
                    }

                    const delay = 300;
                    setTimeout(() => {
                        if (s.questionIndex < 9) {
                            s.questionIndex++;
                            s.questionAlpha = 0;
                            s.shuffleOptions = false;
                            s.optionAlpha = 0;
                            s.selectedOption = null;
                        } else {
                            const maxScore = Math.max(Game.state.evolutionScore.routeA, Game.state.evolutionScore.routeB);
                            if (maxScore >= 8) {
                                s.grade = 'excellent';
                            } else if (maxScore >= 4) {
                                s.grade = 'normal';
                            } else {
                                s.grade = 'poor';
                            }
                            s.showResult = true;
                        }
                    }, delay);
                }
            }
        },

        conflict: {
            init() {
                Game.state.conflictQuestions = GameData.shuffleArray([...GameData.conflictQuestions]);
                Game.state.conflictQuestionIndex = 0;
                Game.state.conflictScore = 0;

                Game.state.screenState = {
                    questionIndex: 0,
                    questionAlpha: 0,
                    options: [],
                    selectedOption: null,
                    optionAlpha: 0,
                    showResult: false,
                    resultAlpha: 0,
                    grade: null
                };
            },

            update(dt, time) {
                const s = Game.state.screenState;

                if (s.questionAlpha < 1) {
                    s.questionAlpha = Math.min(1, s.questionAlpha + dt * 0.003);
                }

                if (s.questionAlpha > 0.7 && !s.options.length) {
                    const q = Game.state.conflictQuestions[s.questionIndex];
                    const shuffled = Math.random() > 0.5;
                    s.options = shuffled ? [
                        { id: 'A', text: q.optionA.text, aggressive: q.optionA.aggressive },
                        { id: 'B', text: q.optionB.text, aggressive: q.optionB.aggressive }
                    ] : [
                        { id: 'B', text: q.optionB.text, aggressive: q.optionB.aggressive },
                        { id: 'A', text: q.optionA.text, aggressive: q.optionA.aggressive }
                    ];
                    s.optionAlpha = 0;
                }

                if (s.options.length && s.optionAlpha < 1) {
                    s.optionAlpha = Math.min(1, s.optionAlpha + dt * 0.003);
                }

                if (s.showResult) {
                    s.resultAlpha = Math.min(1, s.resultAlpha + dt * 0.002);

                    if (s.resultAlpha >= 1 && s.resultTimer === undefined) {
                        s.resultTimer = 0;
                    }

                    if (s.resultTimer !== undefined) {
                        s.resultTimer += dt;
                        if (s.resultTimer > 2000) {
                            const bonus = s.grade === 'excellent' ? 35 : (s.grade === 'normal' ? 15 : 0);
                            Game.state.progress = Math.min(100, Game.state.progress + bonus);
                            Game.switchScreen('encounter');
                        }
                    }
                }
            },

            render(time) {
                const w = Utils.width;
                const h = Utils.height;
                const ctx = Utils.ctx;

                UI.drawBackground();
                UI.drawProgressBar(Game.state.progress, time);

                const s = Game.state.screenState;

                if (!s.showResult) {
                    const q = Game.state.conflictQuestions[s.questionIndex];
                    ctx.globalAlpha = s.questionAlpha;

                    Utils.drawText(`领地争夺战 ${s.questionIndex + 1}/6`, w / 2, h * 0.18, {
                        color: UI.colors.accent,
                        size: 16,
                        weight: 'bold'
                    });

                    Utils.drawRect(w * 0.08, h * 0.22, w * 0.84, h * 0.15, {
                        fill: UI.colors.backgroundDark,
                        stroke: UI.colors.accent,
                        strokeWidth: 2,
                        radius: 10
                    });

                    Utils.drawText(q.scenario, w / 2, h * 0.295, {
                        color: UI.colors.textLight,
                        size: 14,
                        weight: 'normal'
                    });

                    ctx.globalAlpha = s.optionAlpha;

                    const optY1 = h * 0.48;
                    const optY2 = h * 0.65;
                    const optH = h * 0.13;
                    const optW = w * 0.84;
                    const optX = w * 0.08;

                    UI.animationState.buttons = [];

                    if (s.selectedOption === null) {
                        UI.animationState.buttons.push(
                            { id: 'optionA', x: optX, y: optY1 - optH / 2, w: optW, h: optH, alpha: s.optionAlpha },
                            { id: 'optionB', x: optX, y: optY2 - optH / 2, w: optW, h: optH, alpha: s.optionAlpha }
                        );
                    }

                    const baseFill = UI.colors.primaryDark;
                    const optionAPressed = UI.pressedButton === 'optionA';
                    const optionBPressed = UI.pressedButton === 'optionB';
                    const optionASelected = s.selectedOption === 'optionA';
                    const optionBSelected = s.selectedOption === 'optionB';
                    const fillA = (optionAPressed || optionASelected) ? UI.darkenColor(baseFill, 18) : baseFill;
                    const fillB = (optionBPressed || optionBSelected) ? UI.darkenColor(baseFill, 18) : baseFill;

                    Utils.drawRect(optX, optY1 - optH / 2, optW, optH, {
                        fill: fillA,
                        stroke: UI.colors.primary,
                        strokeWidth: 2,
                        radius: 8
                    });
                    Utils.drawText(s.options[0]?.text || '', w / 2, optY1, {
                        color: UI.colors.textLight,
                        size: 13,
                        weight: 'normal'
                    });

                    Utils.drawRect(optX, optY2 - optH / 2, optW, optH, {
                        fill: fillB,
                        stroke: UI.colors.primary,
                        strokeWidth: 2,
                        radius: 8
                    });
                    Utils.drawText(s.options[1]?.text || '', w / 2, optY2, {
                        color: UI.colors.textLight,
                        size: 13,
                        weight: 'normal'
                    });

                    ctx.globalAlpha = 1;
                } else {
                    ctx.globalAlpha = s.resultAlpha;

                    Utils.drawRect(w * 0.1, h * 0.3, w * 0.8, h * 0.4, {
                        fill: UI.colors.backgroundDark,
                        stroke: s.grade === 'excellent' ? UI.colors.accentGold : (s.grade === 'normal' ? UI.colors.accentGreen : UI.colors.accent),
                        strokeWidth: 3,
                        radius: 15
                    });

                    let gradeLines = [];
                    let gradeColor;

                    if (s.grade === 'excellent') {
                        gradeLines = ['族群勇猛善战，步步向外扩张，', '在领地争夺中所向披靡，整体实力大幅提升。'];
                        gradeColor = UI.colors.accentGold;
                    } else if (s.grade === 'normal') {
                        gradeLines = ['行事犹豫不决，攻守摇摆不定，', '族群发展平稳，却难以抢占更多生存优势。'];
                        gradeColor = UI.colors.accentGreen;
                    } else {
                        gradeLines = ['一味避战退让，接连错失发展良机，', '族群活动范围不断受限，生存压力加剧。'];
                        gradeColor = UI.colors.accent;
                    }

                    Utils.drawText('领地战评价', w / 2, h * 0.38, {
                        color: UI.colors.textLight,
                        size: 14,
                        weight: 'normal',
                        align: 'center'
                    });

                    const baseY = h * 0.47;
                    const lineHeight = 26;
                    gradeLines.forEach((line, idx) => {
                        Utils.drawText(line, w / 2, baseY + idx * lineHeight, {
                            color: gradeColor,
                            size: 16,
                            weight: 'bold',
                            align: 'center'
                        });
                    });

                    const bonusText = s.grade === 'excellent' ? '+35%' : (s.grade === 'normal' ? '+15%' : '+0%');
                    Utils.drawText(`进度 ${bonusText}`, w / 2, h * 0.60, {
                        color: UI.colors.textLight,
                        size: 16,
                        weight: 'bold'
                    });

                    ctx.globalAlpha = 1;
                }

                UI.drawPhaseIndicator('conflict', Game.state.progress);
            },

            onClick(id) {
                const s = Game.state.screenState;

                if (s.selectedOption === null && (id === 'optionA' || id === 'optionB')) {
                    s.selectedOption = id;
                    s.optionAlpha = 1;
                    const option = s.options[id === 'optionA' ? 0 : 1];

                    if (option.aggressive) {
                        Game.state.conflictScore++;
                    }

                    setTimeout(() => {
                        if (s.questionIndex < 5) {
                            s.questionIndex++;
                            s.questionAlpha = 0;
                            s.optionAlpha = 0;
                            s.options = [];
                            s.selectedOption = null;
                        } else {
                            if (Game.state.conflictScore >= 4) {
                                s.grade = 'excellent';
                            } else if (Game.state.conflictScore >= 2) {
                                s.grade = 'normal';
                            } else {
                                s.grade = 'poor';
                            }
                            s.showResult = true;
                        }
                    }, 300);
                }
            }
        },

        encounter: {
            init() {
                const encounter = Utils.randomChoice(GameData.encounters);
                Game.state.encounterType = encounter;

                Game.state.screenState = {
                    encounterAlpha: 0,
                    optionAlpha: 0,
                    selectedOption: null,
                    showResult: false,
                    resultAlpha: 0,
                    resultText: '',
                    resultTimer: undefined
                };
            },

            update(dt, time) {
                const s = Game.state.screenState;

                if (s.encounterAlpha < 1) {
                    s.encounterAlpha = Math.min(1, s.encounterAlpha + dt * 0.003);
                }

                if (s.encounterAlpha > 0.8 && s.optionAlpha < 1) {
                    s.optionAlpha = Math.min(1, s.optionAlpha + dt * 0.003);
                }

                if (s.showBranch && s.branchAlpha < 1) {
                    s.branchAlpha = Math.min(1, s.branchAlpha + dt * 0.003);
                }

                if (s.showBranch && s.branchOptionAlpha < 1) {
                    s.branchOptionAlpha = Math.min(1, s.branchOptionAlpha + dt * 0.003);
                }

                if (s.showResult) {
                    s.resultAlpha = Math.min(1, s.resultAlpha + dt * 0.002);

                    if (s.resultAlpha >= 1 && s.resultTimer === undefined) {
                        s.resultTimer = 0;
                    }

                    if (s.resultTimer !== undefined) {
                        s.resultTimer += dt;
                        if (s.resultTimer > 2000) {
                            Game.switchScreen('disaster');
                        }
                    }
                }
            },

            render(time) {
                const w = Utils.width;
                const h = Utils.height;
                const ctx = Utils.ctx;

                UI.drawBackground();
                UI.drawProgressBar(Game.state.progress, time);

                const s = Game.state.screenState;
                const encounter = Game.state.encounterType;

                ctx.globalAlpha = s.encounterAlpha;

                Utils.drawText('随机奇遇', w / 2, h * 0.18, {
                    color: UI.colors.accentGold,
                    size: 18,
                    weight: 'bold'
                });

                Utils.drawRect(w * 0.1, h * 0.22, w * 0.8, h * 0.25, {
                    fill: UI.colors.backgroundDark,
                    stroke: UI.colors.accentGold,
                    strokeWidth: 2,
                    radius: 12
                });

                Utils.drawText(encounter.name, w / 2, h * 0.28, {
                    color: UI.colors.accentGold,
                    size: 16,
                    weight: 'bold'
                });

                {
                    const panelX = w * 0.1;
                    const panelW = w * 0.8;
                    const paddingX = 18;
                    const maxWidth = panelW - paddingX * 2;
                    const descText = encounter.description || '';
                    const descLines = [];
                    const maxLines = 3;

                    ctx.save();
                    ctx.font = `normal 12px "Microsoft YaHei", "PingFang SC", sans-serif`;
                    let current = '';
                    for (let i = 0; i < descText.length; i++) {
                        const ch = descText[i];
                        const testLine = current + ch;
                        if (ctx.measureText(testLine).width > maxWidth && current) {
                            descLines.push(current);
                            current = ch;
                            if (descLines.length >= maxLines) break;
                        } else {
                            current = testLine;
                        }
                    }
                    if (descLines.length < maxLines && current) descLines.push(current);
                    ctx.restore();

                    const lineHeight = 18;
                    const startY = h * 0.34;
                    descLines.forEach((line, idx) => {
                        Utils.drawText(line, w / 2, startY + idx * lineHeight, {
                            color: UI.colors.textLight,
                            size: 12,
                            weight: 'normal'
                        });
                    });
                }

                if (!s.showResult) {
                    ctx.globalAlpha = s.optionAlpha;

                    const optY1 = h * 0.55;
                    const optY2 = h * 0.72;
                    const optH = h * 0.12;
                    const optW = w * 0.8;
                    const optX = w * 0.1;

                    UI.animationState.buttons = [];

                    if (s.selectedOption === null) {
                        UI.animationState.buttons.push(
                            { id: 'hiddenOption', x: optX, y: optY1 - optH / 2, w: optW, h: optH, alpha: s.optionAlpha },
                            { id: 'normalOption', x: optX, y: optY2 - optH / 2, w: optW, h: optH, alpha: s.optionAlpha }
                        );
                    }

                    const hiddenPressed = UI.pressedButton === 'hiddenOption';
                    const normalPressed = UI.pressedButton === 'normalOption';
                    const hiddenSelected = s.selectedOption === 'hiddenOption';
                    const normalSelected = s.selectedOption === 'normalOption';
                    const baseFill = UI.colors.primaryDark;
                    const hiddenFill = (hiddenPressed || hiddenSelected) ? UI.darkenColor(baseFill, 18) : baseFill;
                    const normalFill = (normalPressed || normalSelected) ? UI.darkenColor(baseFill, 18) : baseFill;

                    const wrapButtonText = (text, maxWidth, maxLines) => {
                        const t = text || '';
                        const lines = [];
                        ctx.save();
                        ctx.font = `normal 13px "Microsoft YaHei", "PingFang SC", sans-serif`;
                        let current = '';
                        for (let i = 0; i < t.length; i++) {
                            const ch = t[i];
                            const testLine = current + ch;
                            if (ctx.measureText(testLine).width > maxWidth && current) {
                                lines.push(current);
                                current = ch;
                                if (lines.length >= maxLines) break;
                            } else {
                                current = testLine;
                            }
                        }
                        if (lines.length < maxLines && current) lines.push(current);
                        ctx.restore();
                        return lines;
                    };

                    Utils.drawRect(optX, optY1 - optH / 2, optW, optH, {
                        fill: hiddenFill,
                        stroke: UI.colors.primary,
                        strokeWidth: 2,
                        radius: 8
                    });
                    {
                        const lines = wrapButtonText(encounter.hiddenOption?.text, optW - 28, 2);
                        const lineHeight = 16;
                        const startY = optY1 - ((lines.length - 1) * lineHeight) / 2;
                        lines.forEach((line, idx) => {
                            Utils.drawText(line, w / 2, startY + idx * lineHeight, {
                                color: UI.colors.textLight,
                                size: 13,
                                weight: 'normal'
                            });
                        });
                    }

                    Utils.drawRect(optX, optY2 - optH / 2, optW, optH, {
                        fill: normalFill,
                        stroke: UI.colors.primary,
                        strokeWidth: 2,
                        radius: 8
                    });
                    {
                        const lines = wrapButtonText(encounter.normalOption?.text, optW - 28, 2);
                        const lineHeight = 16;
                        const startY = optY2 - ((lines.length - 1) * lineHeight) / 2;
                        lines.forEach((line, idx) => {
                            Utils.drawText(line, w / 2, startY + idx * lineHeight, {
                                color: UI.colors.textLight,
                                size: 13,
                                weight: 'normal'
                            });
                        });
                    }

                    ctx.globalAlpha = 1;
                }

                if (s.showResult) {
                    ctx.globalAlpha = s.resultAlpha;

                    Utils.drawRect(w * 0.15, h * 0.35, w * 0.7, h * 0.3, {
                        fill: UI.colors.backgroundDark,
                        stroke: UI.colors.accentGold,
                        strokeWidth: 2,
                        radius: 12
                    });

                    const resultLines = (s.resultText || '').split('\n').filter(Boolean);
                    const lineHeight = 22;
                    const startY = h * 0.5 - ((resultLines.length - 1) * lineHeight) / 2;
                    resultLines.forEach((line, idx) => {
                        Utils.drawText(line, w / 2, startY + idx * lineHeight, {
                            color: UI.colors.accentGold,
                            size: 14,
                            weight: 'bold'
                        });
                    });

                    ctx.globalAlpha = 1;
                }

                UI.drawPhaseIndicator('encounter', Game.state.progress);
            },

            onClick(id) {
                const s = Game.state.screenState;
                const encounter = Game.state.encounterType;

                if (s.selectedOption === null && (id === 'hiddenOption' || id === 'normalOption')) {
                    s.selectedOption = id;
                    s.optionAlpha = 1;
                    const addProgress = 5; // 固定加5%

                    if (id === 'hiddenOption') {
                        Game.state.progress = Math.min(100, Game.state.progress + addProgress);
                        const relic = encounter.relic || {};
                        Game.state.relic = {
                            encounterId: encounter.id,
                            trigger: encounter.hiddenOption.branch,
                            emoji: relic.emoji || '✨',
                            name: relic.name || '信物',
                            description: relic.description || ''
                        };
                        const line1 = `获得信物：${Game.state.relic.emoji} ${Game.state.relic.name}`;
                        const line2 = `进度 +${addProgress}%`;
                        s.showResult = true;
                        s.resultText = `${line1}\n${line2}`;
                    } else {
                        Game.state.progress = Math.min(100, Game.state.progress + addProgress);
                        s.showResult = true;
                        const resultText = (encounter.normalOption && encounter.normalOption.resultText) ? encounter.normalOption.resultText : `进度 +${addProgress}%`;
                        const line2 = `进度 +${addProgress}%`;
                        s.resultText = `${resultText}\n${line2}`;
                    }
                }
            }
        },

        disaster: {
            init() {
                Game.state.disasterQuestions = GameData.shuffleArray([...GameData.disasterQuestions]);
                Game.state.disasterQuestionIndex = 0;
                Game.state.disasterScore = 0;

                Game.state.screenState = {
                    questionIndex: 0,
                    questionAlpha: 0,
                    options: [],
                    selectedOption: null,
                    optionAlpha: 0,
                    showResult: false,
                    resultAlpha: 0,
                    grade: null
                };
            },

            update(dt, time) {
                const s = Game.state.screenState;

                if (s.questionAlpha < 1) {
                    s.questionAlpha = Math.min(1, s.questionAlpha + dt * 0.003);
                }

                if (s.questionAlpha > 0.7 && !s.options.length) {
                    const q = Game.state.disasterQuestions[s.questionIndex];
                    const shuffled = Math.random() > 0.5;
                    s.options = shuffled ? [
                        { id: 'A', text: q.stable.text, stable: true },
                        { id: 'B', text: q.risky.text, stable: false }
                    ] : [
                        { id: 'B', text: q.risky.text, stable: false },
                        { id: 'A', text: q.stable.text, stable: true }
                    ];
                    s.optionAlpha = 0;
                }

                if (s.options.length && s.optionAlpha < 1) {
                    s.optionAlpha = Math.min(1, s.optionAlpha + dt * 0.003);
                }

                if (s.showResult) {
                    s.resultAlpha = Math.min(1, s.resultAlpha + dt * 0.002);

                    if (s.resultAlpha >= 1 && s.resultTimer === undefined) {
                        s.resultTimer = 0;
                    }

                    if (s.resultTimer !== undefined) {
                        s.resultTimer += dt;
                        if (s.resultTimer > 2500) {
                            const bonus = s.grade === 'perfect' ? 10 : (s.grade === 'barely' ? 5 : -10);
                            Game.state.progress = Math.max(0, Math.min(100, Game.state.progress + bonus));
                            Game.switchScreen('ending');
                        }
                    }
                }
            },

            render(time) {
                const w = Utils.width;
                const h = Utils.height;
                const ctx = Utils.ctx;

                ctx.globalAlpha = 1;

                const gradient = Utils.drawGradient(0, 0, 0, h, [
                    '#1a0808',
                    '#2d1010',
                    '#1a0808'
                ]);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, w, h);

                UI.drawProgressBar(Game.state.progress, time);

                const s = Game.state.screenState;
                if (!s.showResult) {
                    const q = Game.state.disasterQuestions[s.questionIndex];

                    ctx.globalAlpha = s.questionAlpha;

                    Utils.drawText(`天灾考验 ${s.questionIndex + 1}/6`, w / 2, h * 0.18, {
                        color: '#ff6666',
                        size: 16,
                        weight: 'bold'
                    });

                    Utils.drawRect(w * 0.08, h * 0.22, w * 0.84, h * 0.15, {
                        fill: 'rgba(60, 20, 20, 0.9)',
                        stroke: '#aa3333',
                        strokeWidth: 2,
                        radius: 10
                    });

                    Utils.drawText(q.scenario, w / 2, h * 0.295, {
                        color: '#ffcccc',
                        size: 14,
                        weight: 'normal'
                    });

                    ctx.globalAlpha = s.optionAlpha;

                    const optY1 = h * 0.48;
                    const optY2 = h * 0.65;
                    const optH = h * 0.13;
                    const optW = w * 0.84;
                    const optX = w * 0.08;

                    UI.animationState.buttons = [];

                    if (s.selectedOption === null) {
                        UI.animationState.buttons.push(
                            { id: 'optionA', x: optX, y: optY1 - optH / 2, w: optW, h: optH, alpha: s.optionAlpha },
                            { id: 'optionB', x: optX, y: optY2 - optH / 2, w: optW, h: optH, alpha: s.optionAlpha }
                        );
                    }

                    const optionAPressed = UI.pressedButton === 'optionA';
                    const optionBPressed = UI.pressedButton === 'optionB';
                    const optionASelected = s.selectedOption === 'optionA';
                    const optionBSelected = s.selectedOption === 'optionB';
                    const baseFill = UI.colors.primaryDark;
                    const fillA = (optionAPressed || optionASelected) ? UI.darkenColor(baseFill, 18) : baseFill;
                    const fillB = (optionBPressed || optionBSelected) ? UI.darkenColor(baseFill, 18) : baseFill;

                    Utils.drawRect(optX, optY1 - optH / 2, optW, optH, {
                        fill: fillA,
                        stroke: UI.colors.primary,
                        strokeWidth: 2,
                        radius: 8
                    });
                    Utils.drawText(s.options[0]?.text || '', w / 2, optY1, {
                        color: UI.colors.textLight,
                        size: 13,
                        weight: 'normal'
                    });

                    Utils.drawRect(optX, optY2 - optH / 2, optW, optH, {
                        fill: fillB,
                        stroke: UI.colors.primary,
                        strokeWidth: 2,
                        radius: 8
                    });
                    Utils.drawText(s.options[1]?.text || '', w / 2, optY2, {
                        color: UI.colors.textLight,
                        size: 13,
                        weight: 'normal'
                    });

                    ctx.globalAlpha = 1;
                } else {
                    ctx.globalAlpha = s.resultAlpha;

                    Utils.drawRect(w * 0.1, h * 0.3, w * 0.8, h * 0.4, {
                        fill: 'rgba(60, 20, 20, 0.9)',
                        stroke: s.grade === 'perfect' ? UI.colors.accentGold : (s.grade === 'barely' ? UI.colors.primary : UI.colors.accent),
                        strokeWidth: 3,
                        radius: 15
                    });

                    let gradeLines = [];
                    let gradeColor;

                    if (s.grade === 'perfect') {
                        gradeLines = ['你判断精准、决策稳妥，族群全员安然熬过天灾，', '生存根基更加稳固。'];
                        gradeColor = UI.colors.accentGold;
                    } else if (s.grade === 'barely') {
                        gradeLines = ['应对方式中规中矩，虽成功撑过灾难，', '但有部分族人负伤，发展节奏放缓。'];
                        gradeColor = UI.colors.primary;
                    } else {
                        gradeLines = ['决策接连出现纰漏，天灾造成大量伤亡，', '族群元气大伤，整体进度受损。'];
                        gradeColor = UI.colors.accent;
                    }

                    Utils.drawText('天灾结算', w / 2, h * 0.38, {
                        color: '#ffcccc',
                        size: 14,
                        weight: 'normal',
                        align: 'center'
                    });

                    const baseY = h * 0.47;
                    const lineHeight = 26;
                    gradeLines.forEach((line, idx) => {
                        Utils.drawText(line, w / 2, baseY + idx * lineHeight, {
                            color: gradeColor,
                            size: 16,
                            weight: 'bold',
                            align: 'center'
                        });
                    });

                    const bonusText = s.grade === 'perfect' ? '+10%' : (s.grade === 'barely' ? '+5%' : '-10%');
                    Utils.drawText(`进度 ${bonusText}`, w / 2, h * 0.60, {
                        color: '#ffcccc',
                        size: 16,
                        weight: 'bold'
                    });

                    ctx.globalAlpha = 1;
                }

                UI.drawPhaseIndicator('disaster', Game.state.progress);
            },

            onClick(id) {
                const s = Game.state.screenState;

                if (s.selectedOption === null && (id === 'optionA' || id === 'optionB')) {
                    s.selectedOption = id;
                    s.optionAlpha = 1;
                    const option = s.options[id === 'optionA' ? 0 : 1];

                    if (option.stable) {
                        Game.state.disasterScore++;
                    }

                    setTimeout(() => {
                        if (s.questionIndex < 5) {
                            s.questionIndex++;
                            s.questionAlpha = 0;
                            s.optionAlpha = 0;
                            s.options = [];
                            s.selectedOption = null;
                        } else {
                            if (Game.state.disasterScore >= 4) {
                                s.grade = 'perfect';
                            } else if (Game.state.disasterScore >= 2) {
                                s.grade = 'barely';
                            } else {
                                s.grade = 'failed';
                            }
                            s.showResult = true;
                        }
                    }, 300);
                }
            }
        },

        ending: {
            init() {
                const ending = GameData.getEnding(Game.state.progress) || (GameData.endings ? GameData.endings[GameData.endings.length - 1] : null);
                const savedData = Storage.get('gameData', {});

                if (!ending) {
                    Game.state.screenState = {
                        endingAlpha: 0,
                        showReplayButton: false,
                        ending: { name: '结局', description: '旅程已结束。', glowColor: UI.colors.accentGold },
                        mode: 'normal',
                        relicHandled: true,
                        hiddenEnding: null
                    };
                    return;
                }

                if (!savedData.highestProgress || Game.state.progress > savedData.highestProgress) {
                    savedData.highestProgress = Game.state.progress;
                }

                const unlockedEndings = savedData.unlockedEndings || [];
                if (!unlockedEndings.includes(ending.id)) {
                    unlockedEndings.push(ending.id);
                    savedData.unlockedEndings = unlockedEndings;
                }

                Storage.set('gameData', savedData);

                Game.state.screenState = {
                    endingAlpha: 0,
                    showReplayButton: false,
                    ending: ending,
                    mode: 'normal',
                    relicHandled: false,
                    hiddenEnding: null
                };
            },

            update(dt, time) {
                const s = Game.state.screenState;

                if (s.endingAlpha < 1) {
                    s.endingAlpha = Math.min(1, s.endingAlpha + dt * 0.002);
                }

                if (s.endingAlpha > 0.8 && !s.showReplayButton) {
                    s.showReplayButton = true;
                }
            },

            render(time) {
                const w = Utils.width;
                const h = Utils.height;
                const ctx = Utils.ctx;

                UI.drawBackground();

                const s = Game.state.screenState;
                let ending = s.ending;
                const hiddenEnding = s.hiddenEnding;

                if (!ending) {
                    ending = GameData.getEnding(Game.state.progress) || (GameData.endings ? GameData.endings[GameData.endings.length - 1] : null) || { name: '结局', description: '旅程已结束。', glowColor: UI.colors.accentGold };
                    s.ending = ending;
                }

                const active = s.mode === 'hidden' && hiddenEnding ? {
                    name: `【隐藏结局】${hiddenEnding.name}`,
                    description: hiddenEnding.description,
                    glowColor: '#c080ff'
                } : ending;

                ctx.globalAlpha = s.endingAlpha;

                ctx.shadowColor = active.glowColor;
                ctx.shadowBlur = 40 + Math.sin(time * 0.003) * 10;

                Utils.drawText(active.name, w / 2, h * 0.15, {
                    color: active.glowColor,
                    size: 32,
                    weight: 'bold'
                });

                ctx.shadowBlur = 0;

                const race = Game.state.selectedRace;
                if (race && race.id) {
                    UI.drawCreatureIcon(w / 2, h * 0.35, race.id, 150);
                }

                if (race && race.evolutionChain) {
                    const formName = GameData.getFormNameForProgress(race, Game.state.progress);
                    if (formName) {
                        Utils.drawText(formName, w / 2, h * 0.5, {
                            color: UI.colors.accentGold,
                            size: 18,
                            weight: 'bold'
                        });
                    }
                }

                Utils.drawRect(w * 0.1, h * 0.55, w * 0.8, h * 0.2, {
                    fill: UI.colors.backgroundDark,
                    stroke: active.glowColor,
                    strokeWidth: 2,
                    radius: 10
                });

                const panelX = w * 0.1;
                const panelY = h * 0.55;
                const panelW = w * 0.8;
                const panelH = h * 0.2;
                const paddingX = 18;
                const paddingY = 22;
                const maxLines = 3;
                const textSize = 16;
                const lineHeight = 24;
                const maxWidth = panelW - paddingX * 2;

                const text = active.description || '';
                const lines = [];

                ctx.save();
                ctx.font = `normal ${textSize}px "Microsoft YaHei", "PingFang SC", sans-serif`;
                let current = '';
                for (let i = 0; i < text.length; i++) {
                    const ch = text[i];
                    const testLine = current + ch;
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && current) {
                        lines.push(current);
                        current = ch;
                        if (lines.length >= maxLines) break;
                    } else {
                        current = testLine;
                    }
                }
                if (lines.length < maxLines && current) {
                    lines.push(current);
                }
                ctx.restore();

                const baseTextY = panelY + paddingY + textSize;
                lines.forEach((line, idx) => {
                    Utils.drawText(line, panelX + paddingX, baseTextY + idx * lineHeight, {
                        color: UI.colors.textLight,
                        size: textSize,
                        weight: 'normal',
                        align: 'left'
                    });
                });

                const btnW = 140;
                const btnH = 45;
                const btnY = h - 38;
                const progressY = btnY - btnH / 2 - 18;

                if (race && race.evolutionChain && GameData.getEndingTierIndex) {
                    const tier = GameData.getEndingTierIndex(Game.state.progress);
                    const routeForms = race.evolutionChain.slice(0, Math.min(race.evolutionChain.length, tier + 1));
                    const route = routeForms.join('→');
                    const fullRouteText = `进化路线：${route}`;
                    const routeY = progressY - 22;
                    
                    ctx.save();
                    ctx.font = `bold 13px "Microsoft YaHei", "PingFang SC", sans-serif`;
                    const routeWidth = ctx.measureText(fullRouteText).width;
                    ctx.restore();
                    
                    if (routeWidth > w * 0.92 && routeForms.length > 2) {
                        const line1 = `进化路线：${routeForms.slice(0, 2).join('→')}`;
                        const line2 = routeForms.slice(2).join('→');
                        Utils.drawText(line1, w / 2, routeY - 10, {
                            color: UI.colors.textLight,
                            size: 13,
                            weight: 'bold'
                        });
                        Utils.drawText(line2, w / 2, routeY + 10, {
                            color: UI.colors.textLight,
                            size: 13,
                            weight: 'bold'
                        });
                    } else {
                        Utils.drawText(fullRouteText, w / 2, routeY, {
                            color: UI.colors.textLight,
                            size: 13,
                            weight: 'bold'
                        });
                    }
                }

                Utils.drawText(`最终进度: ${Game.state.progress}%`, w / 2, progressY, {
                    color: UI.colors.textLight,
                    size: 14,
                    weight: 'bold'
                });

                if (s.showReplayButton && (s.mode === 'normal' || s.mode === 'hidden')) {
                    UI.animationState.buttons = [{
                        id: 'replay',
                        x: w / 2 - btnW / 2,
                        y: btnY - btnH / 2,
                        w: btnW,
                        h: btnH
                    }];

                    const hoverScale = UI.hoveredButton === 'replay' ? 1.05 : 1;
                    ctx.save();
                    ctx.translate(w / 2, btnY);
                    ctx.scale(hoverScale, hoverScale);

                    Utils.drawRect(-btnW / 2, -btnH / 2, btnW, btnH, {
                        fill: UI.colors.primaryDark,
                        stroke: UI.colors.primary,
                        strokeWidth: 2,
                        radius: 8
                    });

                    Utils.drawText('再来一局', 0, 0, {
                        color: UI.colors.textLight,
                        size: 16,
                        weight: 'bold'
                    });

                    ctx.restore();
                }

                if (s.mode !== 'normal' && s.mode !== 'hidden') {
                    UI.animationState.buttons = [];

                    ctx.save();
                    ctx.globalAlpha = 0.6;
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, w, h);
                    ctx.restore();

                    const mw = w * 0.84;
                    let mh = h * 0.28;
                    const mx = (w - mw) / 2;
                    let my = h * 0.36;
                    const buttonW = mw * 0.42;
                    const buttonH = 44;

                    const relic = Game.state.relic;
                    const encounter = relic ? GameData.encounters.find(e => e.id === relic.encounterId) : null;

                    const wrapText = (text, maxWidth, font, maxLines) => {
                        const t = text || '';
                        const lines = [];

                        ctx.save();
                        ctx.font = font;

                        let current = '';
                        for (let i = 0; i < t.length; i++) {
                            const ch = t[i];
                            const testLine = current + ch;
                            if (ctx.measureText(testLine).width > maxWidth && current) {
                                lines.push(current);
                                current = ch;
                                if (lines.length >= maxLines) break;
                            } else {
                                current = testLine;
                            }
                        }

                        if (lines.length < maxLines && current) lines.push(current);
                        ctx.restore();
                        return lines;
                    };

                    if (s.mode === 'relicBranch' && encounter) {
                        const paddingX = 18;
                        const paddingTop = 20;
                        const paddingBottom = 18;
                        const innerW = mw - paddingX * 2;
                        const questionFont = `bold 13px "Microsoft YaHei", "PingFang SC", sans-serif`;
                        const lineHeight = 18;
                        const questionLines = wrapText(encounter.branchQuestion || '是否进入？', innerW, questionFont, 3);

                        const bh = 44;
                        const gap1 = 14;
                        const gap2 = 12;
                        const contentH = paddingTop + questionLines.length * lineHeight + gap1 + bh + gap2 + bh + paddingBottom;
                        mh = Math.max(h * 0.28, Math.min(h * 0.42, contentH));
                        my = (h - mh) / 2;
                    }

                    Utils.drawRect(mx, my, mw, mh, {
                        fill: UI.colors.backgroundDark,
                        stroke: '#c080ff',
                        strokeWidth: 2,
                        radius: 12
                    });

                    if (s.mode === 'relicPrompt' && relic) {
                        const title = `检测到你持有：${relic.emoji || '✨'} ${relic.name || '信物'}`;
                        Utils.drawText(title, w / 2, my + 46, { color: '#c080ff', size: 14, weight: 'bold' });
                        if (relic.description) {
                            Utils.drawText(`（${relic.description}）`, w / 2, my + 70, { color: UI.colors.textLight, size: 12, weight: 'normal' });
                        }
                        Utils.drawText('是否进入隐藏结局？', w / 2, my + 104, { color: UI.colors.textLight, size: 13, weight: 'bold' });

                        const y = my + mh - 52;
                        UI.animationState.buttons.push(
                            { id: 'enterHidden', x: mx + mw * 0.06, y: y - buttonH / 2, w: buttonW, h: buttonH },
                            { id: 'stayNormal', x: mx + mw * 0.52, y: y - buttonH / 2, w: buttonW, h: buttonH }
                        );

                        const enterPressed = UI.pressedButton === 'enterHidden';
                        const stayPressed = UI.pressedButton === 'stayNormal';

                        Utils.drawRect(mx + mw * 0.06, y - buttonH / 2, buttonW, buttonH, {
                            fill: enterPressed ? UI.darkenColor(UI.colors.primaryDark, 18) : UI.colors.primaryDark,
                            stroke: UI.colors.primary,
                            strokeWidth: 2,
                            radius: 8
                        });
                        Utils.drawText('进入', mx + mw * 0.06 + buttonW / 2, y, { color: UI.colors.textLight, size: 14, weight: 'bold' });

                        Utils.drawRect(mx + mw * 0.52, y - buttonH / 2, buttonW, buttonH, {
                            fill: stayPressed ? UI.darkenColor(UI.colors.primaryDark, 18) : UI.colors.primaryDark,
                            stroke: UI.colors.primary,
                            strokeWidth: 2,
                            radius: 8
                        });
                        Utils.drawText('不进入', mx + mw * 0.52 + buttonW / 2, y, { color: UI.colors.textLight, size: 14, weight: 'bold' });
                    }

                    if (s.mode === 'relicBranch' && encounter) {
                        const paddingX = 18;
                        const paddingTop = 20;
                        const innerW = mw - paddingX * 2;
                        const bx = mx + paddingX;
                        const bw = innerW;
                        const bh = 44;
                        const optionPaddingX = 14;
                        const optionInnerW = bw - optionPaddingX * 2;

                        const questionFont = `bold 13px "Microsoft YaHei", "PingFang SC", sans-serif`;
                        const questionLineHeight = 18;
                        const questionLines = wrapText(encounter.branchQuestion || '是否进入？', innerW, questionFont, 3);

                        let cursorY = my + paddingTop + questionLineHeight / 2;
                        questionLines.forEach((line, idx) => {
                            Utils.drawText(line, w / 2, cursorY + idx * questionLineHeight, {
                                color: '#c080ff',
                                size: 13,
                                weight: 'bold'
                            });
                        });

                        cursorY += questionLines.length * questionLineHeight + 14;

                        const y1 = cursorY + bh / 2;
                        const y2 = y1 + bh + 12;

                        UI.animationState.buttons.push(
                            { id: 'branchA', x: bx, y: y1 - bh / 2, w: bw, h: bh },
                            { id: 'branchB', x: bx, y: y2 - bh / 2, w: bw, h: bh }
                        );

                        const aPressed = UI.pressedButton === 'branchA';
                        const bPressed = UI.pressedButton === 'branchB';

                        Utils.drawRect(bx, y1 - bh / 2, bw, bh, {
                            fill: aPressed ? UI.darkenColor('#4a2060', 18) : '#4a2060',
                            stroke: '#c080ff',
                            strokeWidth: 2,
                            radius: 8
                        });
                        {
                            const optionFont = `bold 12px "Microsoft YaHei", "PingFang SC", sans-serif`;
                            const optionLineHeight = 16;
                            const lines = wrapText(encounter.branchOptionA?.text || '选项A', optionInnerW, optionFont, 2);
                            const startY = y1 - ((lines.length - 1) * optionLineHeight) / 2;
                            lines.forEach((line, idx) => {
                                Utils.drawText(line, bx + bw / 2, startY + idx * optionLineHeight, { color: '#c080ff', size: 12, weight: 'bold' });
                            });
                        }

                        Utils.drawRect(bx, y2 - bh / 2, bw, bh, {
                            fill: bPressed ? UI.darkenColor('#2d1538', 18) : '#2d1538',
                            stroke: '#9a6fd1',
                            strokeWidth: 2,
                            radius: 8
                        });
                        {
                            const optionFont = `normal 12px "Microsoft YaHei", "PingFang SC", sans-serif`;
                            const optionLineHeight = 16;
                            const lines = wrapText(encounter.branchOptionB?.text || '选项B', optionInnerW, optionFont, 2);
                            const startY = y2 - ((lines.length - 1) * optionLineHeight) / 2;
                            lines.forEach((line, idx) => {
                                Utils.drawText(line, bx + bw / 2, startY + idx * optionLineHeight, { color: '#d1b3ff', size: 12, weight: 'normal' });
                            });
                        }
                    }

                    if (s.mode === 'relicFail') {
                        Utils.drawText('很遗憾，目标占领进度不足，副本未开启', w / 2, my + 86, { color: '#ffcccc', size: 13, weight: 'bold' });
                        const y = my + mh - 52;
                        UI.animationState.buttons.push({ id: 'backToNormal', x: mx + mw * 0.29, y: y - buttonH / 2, w: mw * 0.42, h: buttonH });

                        const backPressed = UI.pressedButton === 'backToNormal';
                        Utils.drawRect(mx + mw * 0.29, y - buttonH / 2, mw * 0.42, buttonH, {
                            fill: backPressed ? UI.darkenColor(UI.colors.primaryDark, 18) : UI.colors.primaryDark,
                            stroke: UI.colors.primary,
                            strokeWidth: 2,
                            radius: 8
                        });
                        Utils.drawText('返回结局', mx + mw * 0.29 + (mw * 0.42) / 2, y, { color: UI.colors.textLight, size: 14, weight: 'bold' });
                    }
                }

                ctx.globalAlpha = 1;
            },

            onClick(id) {
                const s = Game.state.screenState;
                if (id === 'replay') {
                    if (s.mode === 'normal' && !s.relicHandled && Game.state.relic) {
                        s.mode = 'relicPrompt';
                        return;
                    }
                    Game.reset();
                    Game.switchScreen('gacha');
                    return;
                }

                if (s.mode === 'relicPrompt') {
                    if (id === 'enterHidden') {
                        s.mode = 'relicBranch';
                    }
                    if (id === 'stayNormal') {
                        s.mode = 'normal';
                        s.relicHandled = true;
                    }
                    return;
                }

                if (s.mode === 'relicBranch') {
                    const relic = Game.state.relic;
                    if (!relic) {
                        s.mode = 'normal';
                        s.relicHandled = true;
                        return;
                    }

                    if (id === 'branchA' || id === 'branchB') {
                        if (id === 'branchA') {
                            const hidden = GameData.hiddenEndings.find(e => e.trigger === relic.trigger);
                            if (hidden) {
                                Game.state.hiddenEnding = hidden.id;
                                s.hiddenEnding = hidden;
                                s.mode = 'hidden';

                                const savedData = Storage.get('gameData', {});
                                const unlockedEndings = savedData.unlockedEndings || [];
                                if (!unlockedEndings.includes(hidden.id)) {
                                    unlockedEndings.push(hidden.id);
                                    savedData.unlockedEndings = unlockedEndings;
                                }
                                Storage.set('gameData', savedData);
                            } else {
                                s.mode = 'relicFail';
                            }
                        } else {
                            s.mode = 'relicFail';
                        }
                        s.relicHandled = true;
                    }
                    return;
                }

                if (s.mode === 'relicFail') {
                    if (id === 'backToNormal') {
                        s.mode = 'normal';
                        s.relicHandled = true;
                    }
                    return;
                }
            }
        }
    },

    switchScreen(screenName) {
        if (!this.state.hasStarted) {
            this.state.hasStarted = true;
            this.state.currentScreen = screenName;
            this.state.previousScreen = null;
            this.state.transitionAlpha = 0;
            this.state.isTransitioning = false;
            this.state.transitionPhase = 'idle';
            this.state.transitionNextScreen = null;
            if (this.screens[screenName]) this.screens[screenName].init();
            return;
        }

        if (this.state.isTransitioning) return;
        if (screenName === this.state.currentScreen) return;

        this.state.isTransitioning = true;
        this.state.transitionPhase = 'fadeOut';
        this.state.transitionAlpha = 0;
        this.state.transitionNextScreen = screenName;
    },

    reset() {
        this.state.selectedRace = null;
        this.state.progress = 10;
        this.state.evolutionQuestionIndex = 0;
        this.state.evolutionScore = { routeA: 0, routeB: 0 };
        this.state.evolutionQuestions = [];
        this.state.conflictQuestionIndex = 0;
        this.state.conflictScore = 0;
        this.state.conflictQuestions = [];
        this.state.encounterType = null;
        this.state.relic = null;
        this.state.hiddenEnding = null;
        this.state.disasterQuestionIndex = 0;
        this.state.disasterScore = 0;
        this.state.disasterQuestions = [];
        this.state.screenState = {};
    },

    update(dt, time) {
        if (this.state.isTransitioning) {
            const duration = 220;
            const delta = dt / duration;

            if (this.state.transitionPhase === 'fadeOut') {
                this.state.transitionAlpha = Math.min(1, this.state.transitionAlpha + delta);
                if (this.state.transitionAlpha >= 1) {
                    this.state.previousScreen = this.state.currentScreen;
                    this.state.currentScreen = this.state.transitionNextScreen;
                    this.state.transitionNextScreen = null;
                    if (this.screens[this.state.currentScreen]) this.screens[this.state.currentScreen].init();
                    this.state.transitionPhase = 'fadeIn';
                }
            } else if (this.state.transitionPhase === 'fadeIn') {
                this.state.transitionAlpha = Math.max(0, this.state.transitionAlpha - delta);
                if (this.state.transitionAlpha <= 0) {
                    this.state.transitionAlpha = 0;
                    this.state.isTransitioning = false;
                    this.state.transitionPhase = 'idle';
                }
            }
            return;
        }

        const screen = this.screens[this.state.currentScreen];
        if (screen && screen.update) {
            screen.update(dt, time);
        }
    },

    render(time) {
        const screen = this.screens[this.state.currentScreen];
        if (screen && screen.render) {
            screen.render(time);
        }

        if (this.state.transitionAlpha > 0) {
            Utils.ctx.globalAlpha = this.state.transitionAlpha;
            Utils.ctx.fillStyle = UI.colors.background;
            Utils.ctx.fillRect(0, 0, Utils.width, Utils.height);
            Utils.ctx.globalAlpha = 1;
        }
    },

    handleClick(x, y) {
        if (this.state.isTransitioning) return;

        const clickedId = UI.handleClick(x, y);
        if (clickedId) {
            const screen = this.screens[this.state.currentScreen];
            if (screen && screen.onClick) {
                screen.onClick(clickedId);
            }
        }
    },

    handleMouseMove(x, y) {
        UI.handleMouseMove(x, y);
    }
};

window.Game = Game;
