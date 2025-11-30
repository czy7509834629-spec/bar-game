
import React from 'react';
import { 
  Hexagon, Wine, Wind, Disc, Activity, Sun, Slash, AlertTriangle, 
  CloudFog, Layers, MonitorUp, Droplets, ScanEye, Database,
  User, MessageCircle, CheckCircle2, Coins, BrainCircuit, Anchor, Sparkles
} from 'lucide-react';
import { Drink, CustomIngredient, ShopItem, StorySegment, DailyMission, Customer, Mission } from './types';

export const DRINKS: Drink[] = [
  {
    id: 'bloom_patch',
    name: '花神补丁 (Bloom Patch)',
    ingredients: ['Mezcal', 'Campari', 'Amaro Nonino', 'Dry Vermouth'],
    desc: 'Smoky, Bitter Orange, Subtle Herbal Sweetness',
    visualDescription: 'A pale grey liquid suspended in a hexagonal glass, garnished with a single pixelated edible flower that flickers in and out of existence.',
    tags: ['smoky', 'bitter', 'herbal', 'floral'],
    visual: 'bg-[#d4d4d4]',
    icon: <Hexagon className="text-orange-400" strokeWidth={1.5} />
  },
  {
    id: 'glitched_manhattan',
    name: '失真曼哈顿 (Glitched Manhattan)',
    ingredients: ['Rye Whiskey', 'Cynar', 'Angostura Bitters', 'Black Pixel Syrup'],
    desc: 'Herbal Bitterness, Spicy Grain',
    visualDescription: 'Dark amber fluid that seems to flicker slightly, served with a cherry that has missing textures, appearing as a black void.',
    tags: ['bitter', 'strong', 'spicy', 'classic'],
    visual: 'bg-[#8a8a8a]',
    icon: <Wine className="text-red-900" strokeWidth={1.5} />
  },
  {
    id: 'nebula_lost',
    name: '星云遗失 (Nebula Lost)',
    ingredients: ['Lemon Sorbet', 'Amaro Braulio', 'Prosecco', 'Antimatter Bubbles'],
    desc: 'Citrus Freshness, Herbal Bitterness, Airy Effervescence',
    visualDescription: 'Cloudy white effervescence in a tall flute. The bubbles move in reverse, sinking slowly to the bottom.',
    tags: ['sour', 'refreshing', 'bubbly', 'light'],
    visual: 'bg-[#e5e5e5]',
    icon: <Wind className="text-sky-300" strokeWidth={1.5} />
  },
  {
    id: 'echo_vermouth',
    name: '回声苦艾 (Echo Vermouth)',
    ingredients: ['Fino Sherry', 'Montenegro', 'Sweet Vermouth', 'Echo Glass Shards'],
    desc: 'Saline, Bittersweet, Layered Echoes',
    visualDescription: 'Clear liquid with a slight silver sheen, served with a sphere of ice that refracts light into impossible geometries.',
    tags: ['salty', 'savory', 'complex', 'wine'],
    visual: 'bg-[#b0b0b0]',
    icon: <Disc className="text-gray-500" strokeWidth={1.5} />
  },
  {
    id: 'phantom_frequency',
    name: '幻痛调频 (Phantom Frequency)',
    ingredients: ['Amaro Avern', 'Sweet Vermouth', 'Gin', 'Black Soundwave Flow', 'Delay Cache Liquid'],
    desc: 'Bitterness, Herbal, Sweet Finish',
    visualDescription: 'Deep purple hue that pulses rhythmically to an inaudible beat. No garnish, just pure vibration.',
    tags: ['bitter', 'herbal', 'sweet', 'complex'],
    visual: 'bg-[#737373]',
    icon: <Activity className="text-purple-400" strokeWidth={1.5} />
  },
  {
    id: 'binary_sunset',
    name: '二进制日落 (Binary Sunset)',
    ingredients: ['Tequila', 'Aperol', 'Blood Orange', 'Digital Haze'],
    desc: 'Warm gradient fading into darkness. Bittersweet glitch.',
    visualDescription: 'A perfect gradient from orange to deep red, separated by a sharp, unnatural horizontal line of black pixels.',
    tags: ['sweet', 'bitter', 'fruity', 'warm'],
    visual: 'bg-gradient-to-b from-orange-400 to-red-600',
    icon: <Sun className="text-orange-500" strokeWidth={1.5} />
  },
  {
    id: 'null_pointer',
    name: '空指针 (Null Pointer)',
    ingredients: ['Vodka', 'Dry Vermouth', 'Silver Dust', 'Zero-Width Space'],
    desc: 'Refers to nothing. Tastes like cold metal and silence.',
    visualDescription: 'Completely transparent liquid that casts no shadow on the coaster. Looking at it feels like looking at nothing.',
    tags: ['dry', 'strong', 'neutral', 'cold'],
    visual: 'bg-gray-200',
    icon: <Slash className="text-gray-400" strokeWidth={1.5} />
  },
  {
    id: 'kernel_panic',
    name: '内核恐慌 (Kernel Panic)',
    ingredients: ['Rye Whiskey', 'Chili Liqueur', 'Pop Rocks', 'Fatal Error Bitters'],
    desc: 'Spicy shock to the system. Immediate reboot required.',
    visualDescription: 'Bright red liquid with floating particles that look like static noise. It seems to boil without heat.',
    tags: ['spicy', 'strong', 'exciting', 'hot'],
    visual: 'bg-red-900',
    icon: <AlertTriangle className="text-red-600" strokeWidth={1.5} />
  },
  {
    id: 'cache_in_fog',
    name: '雾中缓存 (Cache in Fog)',
    ingredients: ['Gin', 'Green Chartreuse', 'Dry Vermouth', 'Amaro', 'Time-Lag Mist', 'Pixel Dust'],
    desc: 'Complex Herbal, Cool Bitterness',
    visualDescription: 'Silvery grey liquid with dry ice fog that stays strictly within the glass rim, forming perfect cubic shapes.',
    tags: ['herbal', 'bitter', 'strong', 'cold'],
    visual: 'bg-[#d1d5db]',
    icon: <CloudFog className="text-emerald-300" strokeWidth={1.5} />
  },
  {
    id: 'velvet_algorithm',
    name: '丝绒算法 (Velvet Algorithm)',
    ingredients: ['Chambord', 'Champagne', 'Liquid Silk', 'Smoothing Filter'],
    desc: 'Luxurious texture hiding complex calculations. Soft and bubbly.',
    visualDescription: 'Opaque purple texture that looks more like draped cloth than liquid. Bubbles rise in perfect binary patterns.',
    tags: ['sweet', 'bubbly', 'smooth', 'fancy'],
    visual: 'bg-purple-800',
    icon: <Layers className="text-pink-400" strokeWidth={1.5} />
  },
  {
    id: 'blue_screen_death',
    name: '蓝屏死机 (BSOD)',
    ingredients: ['Blue Curaçao', 'Gin', 'Lemon', 'Fatal Exception Foam'],
    desc: 'Electric blue suspension. The last thing you see before reset.',
    visualDescription: 'Intense, glowing electric blue. Stings the eyes slightly to look at. Topped with a foam that holds static shape.',
    tags: ['sour', 'sweet', 'refreshing', 'visual'],
    visual: 'bg-blue-600',
    icon: <MonitorUp className="text-blue-600" strokeWidth={1.5} />
  },
  {
    id: 'base_solvent',
    name: '基础溶剂 (Base Solvent)',
    ingredients: ['Purified Water', 'Zero-Point Ice', 'Clear Cache'],
    desc: 'Tasteless, Odorless, Absolute Neutrality. Clears system errors.',
    visualDescription: 'Colorless, undistinguished liquid in a plain beaker. It reflects the environment perfectly without distortion.',
    tags: ['clean', 'refreshing', 'neutral', 'water', 'pure'],
    visual: 'bg-[#f0f0f0] border border-gray-300',
    icon: <Droplets className="text-cyan-400" strokeWidth={1.5} />
  }
];

export const ABV_LEVELS = [
  { id: 'zero', label: '无 (Null)', val: '0%', desc: '纯净无害 / Safe Mode' },
  { id: 'low', label: '低 (Low)', val: '5-10%', desc: '轻微波动 / Low Latency' },
  { id: 'medium', label: '中 (Med)', val: '15-25%', desc: '标准渲染 / Standard' },
  { id: 'high', label: '高 (High)', val: '40%+', desc: '系统过载 / Overclock' }
];

export const CUSTOM_INGREDIENTS = {
  bases: [
    { id: 'blank_gin', name: '空白琴酒', desc: '纯净、锐利、无材质', type: 'base', price: 0 },
    { id: 'static_vodka', name: '噪音伏特加', desc: '麻木、电流感', type: 'base', price: 0 },
    { id: 'legacy_whiskey', name: '旧历威士忌', desc: '陈旧、怀旧、颗粒感', type: 'base', price: 0 },
    { id: 'liquid_concrete', name: '液态混凝土', desc: '厚重、灰色、工业基底', type: 'base', price: 0 },
    { id: 'biosynth_blood', name: '生化合成血', desc: '铁锈味、温热、人造生命', type: 'base', price: 0 },
    { id: 'deep_web_rum', name: '暗网朗姆', desc: '黑暗、加密甜味、非法', type: 'base', price: 0 }
  ] as CustomIngredient[],
  modifiers: [
    { id: 'data_fragments', name: '数据碎片', desc: '酥脆、故障风味', type: 'modifier', price: 0 },
    { id: 'liquid_melancholy', name: '液态忧郁', desc: '深蓝、沉重、苦涩', type: 'modifier', price: 0 },
    { id: 'ray_traced_syrup', name: '光追糖浆', desc: '高亮、过曝甜味', type: 'modifier', price: 0 },
    { id: 'pixelated_lime', name: '像素青柠', desc: '酸涩、锯齿感、低分辨率', type: 'modifier', price: 0 },
    { id: 'memory_leak', name: '内存泄漏', desc: '流逝感、虚无、苦涩', type: 'modifier', price: 0 },
    { id: 'chromatic_aberration', name: '色差偏移', desc: '眩晕、分层油感、迷幻', type: 'modifier', price: 0 },
    { id: 'void_syrup', name: '虚空糖浆', desc: '极其浓稠的黑色物质，吸收光线', type: 'modifier', price: 300 }
  ] as CustomIngredient[],
  finishes: [
    { id: 'memory_bubbles', name: '记忆气泡', desc: '回溯、爆破感', type: 'finish', price: 0 },
    { id: 'hotfix_patch', name: '修正补丁', desc: '稳定、平滑', type: 'finish', price: 0 },
    { id: 'white_noise_foam', name: '白噪泡沫', desc: '遗忘、轻柔', type: 'finish', price: 0 },
    { id: 'holographic_shard', name: '全息碎片', desc: '锐利、无实体、视觉欺骗', type: 'finish', price: 0 },
    { id: 'static_dust', name: '静电尘埃', desc: '酥麻、干燥、电流', type: 'finish', price: 0 },
    { id: '404_garnish', name: '404装饰', desc: '缺失纹理、紫黑格', type: 'finish', price: 0 },
    { id: 'holo_mint', name: '全息薄荷', desc: '视觉上存在但无法触碰的清凉感', type: 'finish', price: 300 }
  ] as CustomIngredient[]
};

export const SYSTEM_SHOP: ShopItem[] = [
    { id: 'upgrade_emotion_parser', name: '情绪解析器 (Emotion Parser)', desc: '可以直接看到客人想要的口味标签 (Tags)。', price: 250, type: 'upgrade', icon: <ScanEye size={18}/> },
    { id: 'upgrade_data_miner', name: '数据挖掘脚本 (Data Mining)', desc: '服务结束时获得的数据量 (MB) 翻倍。', price: 400, type: 'upgrade', icon: <Database size={18}/> },
    { id: 'upgrade_stability_anchor', name: '稳定锚点 (Stability Anchor)', desc: '对话初始连接稳定性提升至 80%。', price: 600, type: 'upgrade', icon: <Anchor size={18}/> },
    { id: 'shop_void_syrup', name: '虚空糖浆 (Void Syrup)', desc: '解锁定制配方原料：虚空糖浆。', price: 300, type: 'ingredient', icon: <Droplets size={18}/>, effectId: 'void_syrup' },
    { id: 'shop_holo_mint', name: '全息薄荷 (Holo-Mint)', desc: '解锁定制配方原料：全息薄荷。', price: 300, type: 'ingredient', icon: <Sparkles size={18}/>, effectId: 'holo_mint' }
];

export const STORY_SEGMENTS: StorySegment[] = [
  {
    text: "家楼下那家永远在装修的酒吧...",
    subtext: "灰白色的防尘布挂了整整三个月。"
  },
  {
    text: "直到昨天深夜。",
    subtext: "所有的脚手架突然消失了，留下一个纯白色的立面。"
  },
  {
    text: "第二天早晨，11:11。",
    subtext: "我在床头发现了一把钥匙。它也是纯白色的，没有任何金属的光泽。",
    action: "拿起钥匙"
  }
];

export const DAILY_MISSIONS: DailyMission = {
  title: "【系统日志：第 0013 周期】",
  objectives: [
    { id: 1, text: "稳定 3 个异常实体", target: 3, type: 'serve_count' },
    { id: 2, text: "收集 50MB 记忆数据", target: 50, type: 'earn_data' }
  ]
};

export const MISSION_TEMPLATES: Partial<Mission>[] = [
    { text: "稳定异常实体 (Serve)", type: 'serve_count', target: 3, reward: 50, icon: <User size={16}/> },
    { text: "收集记忆数据 (Data)", type: 'earn_data', target: 200, reward: 80, icon: <Database size={16}/> },
    { text: "深度神经连接 (Chat)", type: 'chat_count', target: 2, reward: 60, icon: <MessageCircle size={16}/> },
    { text: "完美同步 (Perfect)", type: 'perfect_serve', target: 2, reward: 70, icon: <CheckCircle2 size={16}/> },
    { text: "额外数据溢出 (Tips)", type: 'tip_earn', target: 60, reward: 50, icon: <Coins size={16}/> },
    { text: "构建梦境 (Dream Mix)", type: 'dream_mix', target: 1, reward: 100, icon: <BrainCircuit size={16}/> }
];

export const CUSTOMER_TEMPLATES: Customer[] = [
  {
    id: 'c1',
    name: "失眠的建模师",
    dialogue: "我感觉我的生活缺少纹理...给我一杯能让我看到花朵绽放，或者是某种补丁的东西。带点烟熏味。",
    wantedTags: ['smoky', 'floral'],
    vibe: "边缘模糊的人形",
    isAI: false,
    successMsg: "这正是我需要的...我觉得我的世界稍微清晰了一点。",
    failMsg: "不...这只是让画面更模糊了。"
  },
  {
    id: 'c2',
    name: "未渲染的幽灵",
    dialogue: "我很冷，就像忘记烘焙光照贴图一样...我需要一点温暖的、高亮的东西。也许是辛辣的？",
    wantedTags: ['spicy', 'strong'],
    vibe: "半透明的灰色网格",
    isAI: false,
    successMsg: "啊...光线终于反弹到了我身上。",
    failMsg: "还是很冷...阴影没有变化。"
  },
  {
    id: 'c3',
    name: "Z轴冲突者",
    dialogue: "我和另一个自我重叠了...我在闪烁。给我一杯能让这种混乱停止的酒，要极其纯净，或者是彻底的遗忘。",
    wantedTags: ['clean', 'pure', 'water'],
    vibe: "重影的高频闪烁实体",
    isAI: false,
    successMsg: "闪烁停止了...我是一个人了。",
    failMsg: "冲突加剧了！我正在穿模！"
  },
  {
    id: 'c4',
    name: "低多边形诗人",
    dialogue: "我的词汇量和我的面数一样少...只有苦涩能让我觉得真实。越苦越好，像未处理的原始数据。",
    wantedTags: ['bitter', 'herbal'],
    vibe: "棱角分明的块状结构",
    isAI: false,
    successMsg: "这种苦涩...增加了我的细节层级。",
    failMsg: "太甜了，像廉价的平滑滤镜。"
  },
  {
    id: 'c5',
    name: "溢出的内存",
    dialogue: "头好痛，装了太多无用的缓存。我需要酸的，刺激的，能像气泡一样带走这一切。",
    wantedTags: ['sour', 'bubbly', 'refreshing'],
    vibe: "头部不断有粒子飘散",
    isAI: false,
    successMsg: "呼...缓存已清理。系统运行流畅。",
    failMsg: "内存泄漏更严重了..."
  },
  {
    id: 'c6',
    name: "过期的杀毒软件",
    dialogue: "我的病毒库停留在20年前...现在的威胁太复杂了。给我一杯能让我‘更新’或者‘隔离’痛苦的东西，要干净有力。",
    wantedTags: ['strong', 'cold', 'clean'],
    vibe: "穿着旧式制服，身上偶尔闪过红色的【危险】弹窗",
    isAI: false,
    successMsg: "正在扫描...威胁已清除。系统完整性恢复。",
    failMsg: "错误...无法识别该补丁..."
  },
  {
    id: 'c7',
    name: "正在缓冲的旅客",
    dialogue: "我...去...下...个...景...点...卡...住...了...需要...加...速...或者是...流...畅...的...",
    wantedTags: ['smooth', 'refreshing', 'sweet'],
    vibe: "动作卡顿，每隔几秒就会定格，头部悬浮着一个旋转的圆圈",
    isAI: false,
    successMsg: "缓冲完成！现在我可以继续旅程了。",
    failMsg: "网络连接...超时..."
  },
  {
    id: 'c8',
    name: "逃逸的死像素",
    dialogue: "我在屏幕上是个错误，但在你这里，我希望是个特性。给我一杯颜色鲜艳的，视觉冲击力强的，证明我存在的酒。",
    wantedTags: ['visual', 'fruity', 'sweet'],
    vibe: "一个漂浮的、极其明亮的纯色方块，不断变换颜色 (RGB)",
    isAI: false,
    successMsg: "这种色彩...我不再只是一个坏点，我是艺术。",
    failMsg: "太暗淡了...我会消失在黑色背景里的..."
  },
  {
    id: 'c9',
    name: "有损压缩体 (Lossy Compression)",
    dialogue: "我的...生活...被...zip...了。太...拥挤...解压...我...需要...空间...膨胀...感...气泡...或是...酸...",
    wantedTags: ['bubbly', 'sour', 'refreshing'],
    vibe: "身体像折纸一样被极度折叠的方块人，发出嘎吱声",
    isAI: false,
    successMsg: "啊...解压成功...文件完整性...100%。",
    failMsg: "错误...文件损坏...无法读取..."
  },
  {
    id: 'c10',
    name: "插值错误 (Interpolation Error)",
    dialogue: "我跳舞时总是...少了几帧。音乐在继续，但我...跟不上。给我一杯流畅的，丝滑的，没有任何卡顿的液体。",
    wantedTags: ['smooth', 'sweet', 'classic'],
    vibe: "动作带有残影，每隔几秒会瞬移一段距离",
    isAI: false,
    successMsg: "60FPS... 甚至 144FPS... 如此顺滑。",
    failMsg: "还是卡顿... 甚至更严重了..."
  },
  {
    id: 'c11',
    name: "色散幽灵 (Chromatic Ghost)",
    dialogue: "你看得到吗？我的红色在左边，蓝色在右边...我无法聚焦。我需要强烈的色彩，或者是能让我重合的引力（Strong）。",
    wantedTags: ['strong', 'visual', 'complex'],
    vibe: "红绿蓝三个重影在不断晃动，无法重合",
    isAI: false,
    successMsg: "色彩...同步了。世界变清晰了。",
    failMsg: "色差更大了！我看不到你了！"
  },
  {
    id: 'c12',
    name: "堆栈溢出 (Stack Overflow)",
    dialogue: "我是我的我是我的我... 停不下来。循环引用。给我一个终止符，一个断点，或者是一杯足够苦的酒来打断这个循环。",
    wantedTags: ['bitter', 'dry', 'strong'],
    vibe: "脸部是一个显示着自己脸部的屏幕，无限向内延伸",
    isAI: false,
    successMsg: "Stack Overflow... 终于，静止了。",
    failMsg: "循环... 还在... 继续... 我是我的..."
  },
  {
    id: 'c13',
    name: "光照失效 (Unlit Shader)",
    dialogue: "这里太黑了... 即使在太阳下也是黑的。我的光照贴图丢失了。给我一杯明亮的，发光的，像液体阳光一样的东西。",
    wantedTags: ['sweet', 'fruity', 'visual'],
    vibe: "完全漆黑的剪影，只有眼睛发着微弱的白光",
    isAI: false,
    successMsg: "光... 我感觉到了温暖。阴影有了层次。",
    failMsg: "依然是一片漆黑..."
  },
  {
    id: 'c14',
    name: "碰撞体积丢失 (Missing Collider)",
    dialogue: "我又卡在墙里了。物理引擎似乎恨我。给我一杯虚无的、轻盈的酒，也许我就能飘出来了。",
    wantedTags: ['light', 'herbal', 'bubbly'],
    vibe: "半个身体经常陷入吧台或地板中",
    isAI: false,
    successMsg: "碰撞体积消失了... 我自由了。",
    failMsg: "卡得更紧了！救命！"
  },
  {
    id: 'c15',
    name: "默认资产_01 (Default_Asset_01)",
    dialogue: "HITBOX_HEAD: OK. STATUS: NULL. 我只是个占位符。我想体验‘真实’的感觉。给我最复杂的、最不像数据的味道。",
    wantedTags: ['complex', 'spicy', 'savory'],
    vibe: "没有任何五官的灰白色人形，身上写着 'ASSET_01'",
    isAI: false,
    successMsg: "检测到情感输入... 这种感觉... 是痛觉吗？太棒了。",
    failMsg: "INPUT: NULL. 没有反应。"
  },
  {
    id: 'c16',
    name: "高通滤波 (High-Pass Filter)",
    dialogue: "每一个像素都...太清晰了。我的边缘在割伤我自己。给我一杯模糊的、朦胧的、柔和的东西。",
    wantedTags: ['smooth', 'sweet', 'smoky'],
    vibe: "轮廓线极其锋利，周围空气似乎都被割裂",
    isAI: false,
    successMsg: "啊... 边缘柔化了。世界不再那么刺眼。",
    failMsg: "太尖锐了！我感觉我要碎了！"
  },
  {
    id: 'c17',
    name: "UV映射错误 (Bad UV Map)",
    dialogue: "你能看到吗？这里有一条线... 无论我走多远，那部分我都留在那儿。左边是昨天，右边是明天。给我一杯能缝合这一切的酒，或者彻底撕裂它。",
    wantedTags: ['bitter', 'complex', 'strong'],
    vibe: "身体正中间有一条明显的错位线，左右两侧的材质分辨率不同",
    isAI: false,
    successMsg: "接缝... 模糊了。我终于感觉是一个整体了。",
    failMsg: "断裂感更强了！我在分裂！"
  },
  {
    id: 'c18',
    name: "网格简化 (Mesh Decimation)",
    dialogue: "森林... 变成了三角形。树叶是绿色的方块。我怀念圆润的自然。给我一杯草本的、有泥土气息的，让我记得大地的形状。",
    wantedTags: ['herbal', 'fresh', 'sour'],
    vibe: "披着由粗糙多边形构成的斗篷，周围漂浮着棱角分明的树叶粒子",
    isAI: false,
    successMsg: "这味道... 就像真正的高分辨率泥土。多谢。",
    failMsg: "这也只是数据而已... 没有灵魂。"
  },
  {
    id: 'c19',
    name: "顶点偏移 (Vertex Offset)",
    dialogue: "我的一个顶点被固定在远方了... 无论我走多远，那部分我都留在那儿。好痛。给我一杯冰冷的、收缩的，帮我把那部分收回来。",
    wantedTags: ['cold', 'smooth', 'sweet'],
    vibe: "身体的一部分顶点被错误地拉伸到无限远，形成数条黑色的射线",
    isAI: false,
    successMsg: "收回来了... 那个顶点归位了。痛楚消失了。",
    failMsg: "拉得更长了！不！"
  }
];
