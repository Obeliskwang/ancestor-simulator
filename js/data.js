const GameData = {
    races: [
        {
            id: 'dunkleosteus',
            name: '孱弱古鱼',
            title: '海洋称霸之途',
            initialForm: '头甲鱼',
            routes: ['defense', 'attack'],
            routeNames: ['防御流', '强攻流'],
            evolutionChain: ['头甲鱼', '初始全骨鱼', '粒骨鱼', '巨型邓氏鱼'],
            color: '#2d6a8f',
            accentColor: '#4ecdc4',
            description: '来自远古海洋的顶级掠食者'
        },
        {
            id: 'smilodon',
            name: '羸弱原兽',
            title: '陆地统治之路',
            initialForm: '细齿兽',
            routes: ['social', 'hunt'],
            routeNames: ['群居流', '猎杀流'],
            evolutionChain: ['细齿兽', '伪剑齿虎', '纤细刃齿虎', '毁灭刃齿虎'],
            color: '#8b4513',
            accentColor: '#cd853f',
            description: '史前大陆的恐怖猎杀机器'
        },
        {
            id: 'confuciusornis',
            name: '无翼古雏',
            title: '天际征服之道',
            initialForm: '中华龙鸟',
            routes: ['speed', 'attack'],
            routeNames: ['速度流', '强攻流'],
            evolutionChain: ['中华龙鸟', '赫氏近鸟龙', '始祖鸟', '圣贤孔子鸟'],
            color: '#4a5568',
            accentColor: '#68d391',
            description: '翱翔天际的飞行掠食者'
        }
    ],

    evolutionQuestions: {
        dunkleosteus: [
            { prompt: '躯体分化', optionA: { text: '粗壮，易长硬甲', route: 'defense' }, optionB: { text: '修长，游速更快', route: 'attack' } },
            { prompt: '颌骨与体表开始特化', optionA: { text: '厚甲，抗撕咬撞击', route: 'defense' }, optionB: { text: '利齿，咬合伤害高', route: 'attack' } },
            { prompt: '游动姿态定型', optionA: { text: '耐力强，长期驻守', route: 'defense' }, optionB: { text: '爆发高，近身突袭', route: 'attack' } },
            { prompt: '族群相处模式形成', optionA: { text: '群居，互相掩护', route: 'defense' }, optionB: { text: '独居，单挑更强', route: 'attack' } },
            { prompt: '感知器官不断发育', optionA: { text: '察水流，提前避险', route: 'defense' }, optionB: { text: '辨气味，追踪猎物', route: 'attack' } },
            { prompt: '体能特质出现分化', optionA: { text: '续航久，适合深潜', route: 'defense' }, optionB: { text: '爆发力足，一击致命', route: 'attack' } },
            { prompt: '适应深海极端环境', optionA: { text: '耐缺氧，深潜避险', route: 'defense' }, optionB: { text: '耐低温，全域捕猎', route: 'attack' } },
            { prompt: '繁衍方式选择', optionA: { text: '多生育，靠数量存活', route: 'defense' }, optionB: { text: '少而精，后代战力强', route: 'attack' } },
            { prompt: '本能与心智分化', optionA: { text: '有理智，保全族群', route: 'defense' }, optionB: { text: '凭本能，好斗善战', route: 'attack' } },
            { prompt: '演化方向定型', optionA: { text: '重甲防御流', route: 'defense' }, optionB: { text: '狂噬强攻流', route: 'attack' } }
        ],
        smilodon: [
            { prompt: '躯体骨架逐步发育', optionA: { text: '粗壮敦实，适配团战', route: 'social' }, optionB: { text: '身姿矫健，擅长伏击', route: 'hunt' } },
            { prompt: '獠牙与四肢开始特化', optionA: { text: '四肢强劲，擅长围堵', route: 'social' }, optionB: { text: '獠牙锋利，近身重创', route: 'hunt' } },
            { prompt: '移动与作战姿态定型', optionA: { text: '集体冲锋，正面压制', route: 'social' }, optionB: { text: '潜行隐蔽，偷袭制敌', route: 'hunt' } },
            { prompt: '族群相处模式形成', optionA: { text: '群居结伴，互帮互助', route: 'social' }, optionB: { text: '独居独行，独占资源', route: 'hunt' } },
            { prompt: '感知器官不断发育', optionA: { text: '听觉灵敏，提前预警', route: 'social' }, optionB: { text: '夜视超强，夜猎无敌', route: 'hunt' } },
            { prompt: '体能特质出现分化', optionA: { text: '体力持久，擅长巡守', route: 'social' }, optionB: { text: '爆发力强，近身善战', route: 'hunt' } },
            { prompt: '适应陆地极端气候', optionA: { text: '皮毛厚实，耐受严寒', route: 'social' }, optionB: { text: '耐热耐旱，活动更广', route: 'hunt' } },
            { prompt: '繁衍方式影响族群根基', optionA: { text: '多生多育，壮大族群', route: 'social' }, optionB: { text: '少生优育，后代强悍', route: 'hunt' } },
            { prompt: '族群本能与心智开始分化', optionA: { text: '理智分工，保全族群', route: 'social' }, optionB: { text: '杀戮本能，好斗善战', route: 'hunt' } },
            { prompt: '演化方向彻底定型', optionA: { text: '团战群居流', route: 'social' }, optionB: { text: '单挑猎杀流', route: 'hunt' } }
        ],
        confuciusornis: [
            { prompt: '躯体骨架逐步发育', optionA: { text: '骨骼纤细，飞行轻快', route: 'speed' }, optionB: { text: '躯干厚重，俯冲力强', route: 'attack' } },
            { prompt: '羽翼与爪部开始特化', optionA: { text: '翼展加宽，提速滑翔', route: 'speed' }, optionB: { text: '利爪硬化，撕扯力大', route: 'attack' } },
            { prompt: '飞行姿态逐步定型', optionA: { text: '高空盘旋，擅长避险', route: 'speed' }, optionB: { text: '低空穿梭，缠斗强势', route: 'attack' } },
            { prompt: '族群相处模式形成', optionA: { text: '结群飞行，互相警戒', route: 'speed' }, optionB: { text: '独自翱翔，独占空域', route: 'attack' } },
            { prompt: '感知器官不断发育', optionA: { text: '感知气流，飞行迅捷', route: 'speed' }, optionB: { text: '高空远视，锁定目标', route: 'attack' } },
            { prompt: '体能特质出现分化', optionA: { text: '耐力超强，擅长远飞', route: 'speed' }, optionB: { text: '俯冲爆发，瞬间秒杀', route: 'attack' } },
            { prompt: '适应空中恶劣天气', optionA: { text: '不惧强风，飞行稳定', route: 'speed' }, optionB: { text: '不惧沙尘，精准作战', route: 'attack' } },
            { prompt: '繁衍方式影响族群根基', optionA: { text: '大量繁衍，族群势大', route: 'speed' }, optionB: { text: '少生优育，幼鸟强悍', route: 'attack' } },
            { prompt: '族群本能与心智开始分化', optionA: { text: '预判风险，优先避险', route: 'speed' }, optionB: { text: '好斗善战，主动争域', route: 'attack' } },
            { prompt: '演化方向彻底定型', optionA: { text: '极速遁走流', route: 'speed' }, optionB: { text: '空战强攻流', route: 'attack' } }
        ]
    },

    conflictQuestions: [
        { scenario: '敌方大举压境', optionA: { text: '据地防守', aggressive: false }, optionB: { text: '主动迎击', aggressive: true } },
        { scenario: '探知敌方补给薄弱，出现突袭机会', optionA: { text: '按兵不动', aggressive: false }, optionB: { text: '出兵偷袭', aggressive: true } },
        { scenario: '部分族人陷入敌军包围', optionA: { text: '舍弃断后，保存主力', aggressive: false }, optionB: { text: '全力营救', aggressive: true } },
        { scenario: '遇上弱小中立族群', optionA: { text: '直接驱逐，独占资源', aggressive: false }, optionB: { text: '接纳入伙，壮大族群', aggressive: true } },
        { scenario: '两军战斗陷入僵持', optionA: { text: '拖延对峙，慢慢耗敌', aggressive: false }, optionB: { text: '集中全力强攻', aggressive: true } },
        { scenario: '成功战胜对手，如何处置败方族群', optionA: { text: '驱赶流放，划清界限', aggressive: false }, optionB: { text: '收服同化，扩充实力', aggressive: true } }
    ],

    encounters: [
        {
            id: 'comet',
            name: '彗星降临',
            description: '天际划过明亮彗星，群星运转轨迹清晰可见，仿佛指引着远方未知星域。',
            relic: { emoji: '☄️', name: '星碎', description: '伴随神秘呢喃' },
            hiddenOption: { text: '带领族人围观', progress: 15, branch: 'comet_branch_a' },
            normalOption: { text: '立刻远离躲避', progress: 5, resultText: '平安无事' },
            branchQuestion: '彗星光芒笼罩族群，星轨纹路清晰浮现，是否追随星轨前行？',
            branchOptionA: { text: '接纳星界微光，追随星轨前行', hidden: true },
            branchOptionB: { text: '心生畏惧，全员撤离', hidden: false }
        },
        {
            id: 'seed',
            name: '神秘种子',
            description: '地面浮现一粒诡异的远古种子，形态怪异、生命力极端狂暴，并非普通粮食作物。',
            relic: { emoji: '🌱', name: '不知名种子', description: '内里却涌动着暗沉浊光' },
            hiddenOption: { text: '拾取培育', progress: 5, branch: 'seed_branch_a' },
            normalOption: { text: '就地丢弃', progress: 15, resultText: '平安错过异变，毫无收获' },
            branchQuestion: '种子落地瞬间疯狂裂变，变异植被极速扩张，是否接纳变异植株共生？',
            branchOptionA: { text: '接纳变异植株，共生同化', hidden: true },
            branchOptionB: { text: '心存顾虑，转身离开', hidden: false }
        },
        {
            id: 'cave',
            name: '远古秘境',
            description: '山林间发现一处隐蔽洞穴，环境舒适、温湿度适宜，天地间灵气缓缓复苏。',
            relic: { emoji: '🦴', name: '甲骨牌', description: '能指引秘境方向' },
            hiddenOption: { text: '带队探索，在此休憩吸纳灵气', progress: 15, branch: 'cave_branch_a' },
            normalOption: { text: '绕道而行', progress: 5, resultText: '安稳离开，错失灵韵加持' },
            branchQuestion: '灵气骤然涌动，整片秘境进入灵力复苏状态，是否驻足定居修炼？',
            branchOptionA: { text: '驻足定居，依托灵地修炼成长', hidden: true },
            branchOptionB: { text: '简单探查后原路返回', hidden: false }
        }
    ],

    disasterQuestions: [
        { scenario: '灾难初现，第一时间选择？', stable: { text: '全员紧急迁徙' }, risky: { text: '原地固守避难' } },
        { scenario: '栖息地恶化、食物短缺，选择？', stable: { text: '分区域寻找新食源' }, risky: { text: '争抢现有食物' } },
        { scenario: '遭遇余灾，部分族人掉队，选择？', stable: { text: '原地等待汇合' }, risky: { text: '继续前进，优先保命' } },
        { scenario: '发现天然安全区域，是否全员进驻？', stable: { text: '分散避险，避免团灭' }, risky: { text: '集体躲入' } },
        { scenario: '灾难减弱，选择回迁还是观望？', stable: { text: '观察数日再行动' }, risky: { text: '马上返回旧领地' } },
        { scenario: '灾后资源匮乏，族群如何发展？', stable: { text: '休养生息恢复族群' }, risky: { text: '主动开拓新领地' } }
    ],

    progressConfig: {
        initial: 10,
        evolution: { excellent: 40, normal: 20, poor: 5 },
        conflict: { excellent: 35, normal: 15, poor: 0 },
        encounter: { normalLow: 5, normalHigh: 15, hidden: 15 },
        disaster: { perfect: 10, barely: 5, failed: -10 }
    },

    endings: [
        { min: 0, max: 29, id: 'decline', name: '💀 族群衰落', description: '多次抉择失误，灾难与战火重创族群，种群日渐凋零，走向衰落。', formText: '弱化形态，画面偏灰暗', glowColor: '#8b0000' },
        { min: 30, max: 59, id: 'survive', name: '🌱 勉强存续', description: '艰难熬过一次次危机，族群得以延续，仅能在夹缝中谋求生存。', formText: '基础形态', glowColor: '#cd853f' },
        { min: 60, max: 89, id: 'warlord', name: '⚔️ 一方豪强', description: '族群站稳脚跟，称霸一片区域，虽未能一统全球，但已是无人敢招惹的强大势力。', formText: '高阶形态，绿色微光', glowColor: '#4ecdc4' },
        { min: 90, max: 100, id: 'overlord', name: '🏆 地球霸主', description: '历经数轮演化与磨难，你的族群横扫四方，彻底统治整片大地/海洋/天空，成为这颗星球的至高霸主！', formText: '终极霸主形态，金色光效', glowColor: '#ffd700' }
    ],

    hiddenEndings: [
        { id: 'stellar', name: '星衍族群', trigger: 'comet_branch_a', description: '族群挣脱星球束缚，向往浩瀚星海，踏上星际探索之路。' },
        { id: 'invasive', name: '侵世族群', trigger: 'seed_branch_a', description: '变异植物拥有无限扩张能力，成为地表绝对统治物种。' },
        { id: 'spiritual', name: '灵泽族群', trigger: 'cave_branch_a', description: '占据灵韵福地，借天地复苏灵气蜕变超凡。' }
    ],

    getRace(id) {
        return this.races.find(r => r.id === id);
    },

    getEvolutionQuestions(raceId) {
        return this.evolutionQuestions[raceId] || [];
    },

    getEnding(progress) {
        for (let i = this.endings.length - 1; i >= 0; i--) {
            if (progress >= this.endings[i].min) {
                return this.endings[i];
            }
        }
        return this.endings[this.endings.length - 1];
    },

    getEndingTierIndex(progress) {
        const p = Math.max(0, Math.min(100, progress));
        if (p >= 90) return 3;
        if (p >= 60) return 2;
        if (p >= 30) return 1;
        return 0;
    },

    getFormNameForProgress(race, progress) {
        if (!race || !race.evolutionChain || !race.evolutionChain.length) return null;
        const idx = this.getEndingTierIndex(progress);
        const base = race.evolutionChain[idx] || race.evolutionChain[0];
        if (idx === 0) {
            return `${base}（${race.name}）`;
        }
        return base;
    },

    shuffleArray(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
};

window.GameData = GameData;
