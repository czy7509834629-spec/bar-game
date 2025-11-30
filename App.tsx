import React, { useState, useEffect, useRef } from 'react';
import { 
  Key, BookOpen, GlassWater, Utensils, X, RefreshCw, Sparkles, Moon, 
  CheckCircle2, Loader2, Beaker, Plus, FileText, TrendingUp, Trophy, 
  MessageSquare, Eye, RotateCcw, Gauge, Coins, Zap, Activity, 
  Terminal, Box, Radio, Signal, MessageCircle, User, BrainCircuit, ShoppingCart, Lock, Info, ArrowLeft,
  Droplets, AlertTriangle, Database, ClipboardList, CheckSquare, Gift, Wifi, Anchor, Power, Volume2, VolumeX, LogOut
} from 'lucide-react';

import { 
  Drink, Customer, DialogueOption, Inquiry, SessionLogEntry, 
  PrepItems, CustomSlots, ShopItem, Mission 
} from './types';

import { 
  DRINKS, ABV_LEVELS, CUSTOM_INGREDIENTS, SYSTEM_SHOP, 
  STORY_SEGMENTS, CUSTOMER_TEMPLATES, MISSION_TEMPLATES
} from './constants';

import { generateText, generateImage } from './services/gemini';
import { 
  ArchitecturalCard, ArchitecturalButton, BaseContainer, 
  GlitchBorder, VisualLoader
} from './components/UI';

const STORAGE_KEY = 'hazatic_bar_save_v1';

export default function HazaticBar() {
  const [gameState, setGameState] = useState<'intro' | 'briefing' | 'prep' | 'hub' | 'serving' | 'mixing' | 'abv_select' | 'custom_mixing' | 'dream_mixing' | 'report' | 'chatting' | 'shop'>('intro');
  const [storyIndex, setStoryIndex] = useState(0);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [showRecipeBook, setShowRecipeBook] = useState(false);
  const [menuSelectedDrink, setMenuSelectedDrink] = useState<Drink | null>(null); 

  const [feedback, setFeedback] = useState("");
  const [generatedDrink, setGeneratedDrink] = useState<Drink | null>(null);
  const [selectedDrinkForAbv, setSelectedDrinkForAbv] = useState<Drink | null>(null); 
  
  const [dataFragments, setDataFragments] = useState(150); 
  const [unlockedIngredients, setUnlockedIngredients] = useState<string[]>([]);
  const [upgrades, setUpgrades] = useState<{emotionParser: boolean, doubleData: boolean, stabilityAnchor: boolean}>({ emotionParser: false, doubleData: false, stabilityAnchor: false });

  // Missions & Interaction
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [missionSelectionPool, setMissionSelectionPool] = useState<Mission[]>([]);
  const [showMissionLog, setShowMissionLog] = useState(false);

  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const [dreamPrompt, setDreamPrompt] = useState("");

  const [dialogueOptions, setDialogueOptions] = useState<DialogueOption[] | null>(null);
  const [closingLine, setClosingLine] = useState<string | null>(null);
  const [earnedTip, setEarnedTip] = useState(0);
  const [lastDrinkSuccess, setLastDrinkSuccess] = useState(false); 

  // Conversation/Chatting State
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [currentChatResponse, setCurrentChatResponse] = useState<{answer: string, reward: number, stabilityChange?: number} | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [connectionStability, setConnectionStability] = useState(50); // New: 0-100

  const [showRadio, setShowRadio] = useState(false);
  const [radioContent, setRadioContent] = useState<string | null>(null);
  const [isTuning, setIsTuning] = useState(false);

  const [customersServed, setCustomersServed] = useState(0);
  const [sessionLog, setSessionLog] = useState<SessionLogEntry[]>([]); 

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isJournalLoading, setIsJournalLoading] = useState(false);
  const [journalEntry, setJournalEntry] = useState<string | null>(null);
  
  const [glitchEffect, setGlitchEffect] = useState(false); 

  const [customSlots, setCustomSlots] = useState<CustomSlots>({ base: null, modifier: null, finish: null });

  const [prepItems, setPrepItems] = useState<PrepItems>({
    ice: false,
    bottles: false,
    garnish: false
  });

  // --- AUDIO SYSTEM ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.4);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.value = bgmVolume; // Initial volume
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // 1. Low Drone (The "Void" Sound)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 55; // Lower frequency for deeper drone
      
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = 57; // Slight detune

      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.25;
      
      // LFO for Drone
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.05; // Very slow modulation
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.15;
      lfo.connect(lfoGain);
      lfoGain.connect(droneGain.gain);
      lfo.start();

      osc1.connect(droneGain);
      osc2.connect(droneGain);
      droneGain.connect(masterGain);
      
      osc1.start();
      osc2.start();

      // 2. Digital Rain / Static (The "Glitch" Sound)
      const bufferSize = ctx.sampleRate * 4; // 4 seconds buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.5; // White noise
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 350; // Darker static

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.08; 

      // Random modulation for "packet loss" rain effect
      const noiseLfo = ctx.createOscillator();
      noiseLfo.type = 'square';
      noiseLfo.frequency.value = 0.5; // Occasional dropouts/glitches
      const noiseLfoGain = ctx.createGain();
      noiseLfoGain.gain.value = 0.02;
      
      noiseLfo.connect(noiseLfoGain);
      noiseLfoGain.connect(noiseGain.gain);
      noiseLfo.start();

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      
      noise.start();

    } catch (e) {
      console.error("Audio Engine Start Failed", e);
    }
  };

  // Sync volume with state
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
        // Smooth transition to new volume
        masterGainRef.current.gain.setTargetAtTime(bgmVolume, audioCtxRef.current.currentTime, 0.1);
    }
  }, [bgmVolume]);

  const toggleBgm = () => {
      // Allow initializing from toggle if not yet started
      if (!audioCtxRef.current) {
          initAudio();
          setIsBgmPlaying(true);
          playUiSound('success'); // Feedback sound
          return;
      }

      playUiSound('click');
      if (audioCtxRef.current.state === 'running') {
          audioCtxRef.current.suspend();
          setIsBgmPlaying(false);
      } else {
          audioCtxRef.current.resume();
          setIsBgmPlaying(true);
      }
  };

  // --- PERSISTENCE HELPERS ---
  const saveGameData = (
    fragments: number, 
    unlocks: string[], 
    currentUpgrades: {emotionParser: boolean, doubleData: boolean, stabilityAnchor: boolean}
  ) => {
    try {
      const data = {
        dataFragments: fragments,
        unlockedIngredients: unlocks,
        upgrades: currentUpgrades,
        lastSave: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Game Saved:', data);
    } catch (e) {
      console.error('Save failed', e);
    }
  };

  const loadGameData = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      try {
          return JSON.parse(raw);
      } catch (e) {
          return null;
      }
  };

  // Load on mount
  useEffect(() => {
    const saved = loadGameData();
    if (saved) {
        if (typeof saved.dataFragments === 'number') setDataFragments(saved.dataFragments);
        if (Array.isArray(saved.unlockedIngredients)) setUnlockedIngredients(saved.unlockedIngredients);
        if (saved.upgrades) setUpgrades(saved.upgrades);
        showNotification("系统数据已加载 (System Data Loaded)", 'success');
    }
  }, []);

  const showNotification = (msg: string, type: 'success' | 'error') => {
      setNotification({ msg, type });
      setTimeout(() => setNotification(null), 3000);
  };

  const playUiSound = (type: 'click' | 'success' | 'error' = 'click') => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'success') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554.37, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        }
    } catch (e) {
        // Audio context might be blocked
    }
  };

  const triggerGlitch = () => {
    setGlitchEffect(true);
    setTimeout(() => setGlitchEffect(false), 800);
  };

  const generateMissionOptions = () => {
      const shuffled = [...MISSION_TEMPLATES].sort(() => 0.5 - Math.random());
      const selectedTemplates = shuffled.slice(0, 4);
      
      const missionOptions: Mission[] = selectedTemplates.map((t, i) => ({
          id: `m_${Date.now()}_${i}`,
          text: t.text || "Unknown Mission",
          type: t.type || 'serve_count',
          target: t.target || 1,
          reward: t.reward || 10,
          current: 0,
          claimed: false,
          icon: t.icon
      }));
      setMissionSelectionPool(missionOptions);
  };

  const toggleMissionSelection = (mission: Mission) => {
      playUiSound('click');
      if (activeMissions.find(m => m.id === mission.id)) {
          setActiveMissions(prev => prev.filter(m => m.id !== mission.id));
      } else {
          if (activeMissions.length < 2) {
              setActiveMissions(prev => [...prev, mission]);
          } else {
             showNotification("委托上限已满 (Max Capacity)", 'error');
          }
      }
  };

  const updateMissionProgress = (type: Mission['type'], amount: number = 1) => {
      setActiveMissions(prev => prev.map(m => {
          if (m.type === type && !m.claimed && m.current < m.target) {
              const newCurrent = Math.min(m.current + amount, m.target);
              if (newCurrent === m.target && m.current < m.target) {
                  showNotification(`任务完成: ${m.text}`, 'success');
                  playUiSound('success');
              }
              return { ...m, current: newCurrent };
          }
          return m;
      }));
  };

  const claimMissionReward = (missionId: string) => {
      const mission = activeMissions.find(m => m.id === missionId);
      if (mission && mission.current >= mission.target && !mission.claimed) {
          setDataFragments(prev => prev + mission.reward);
          setActiveMissions(prev => prev.map(m => m.id === missionId ? { ...m, claimed: true } : m));
          showNotification(`奖励已领取: +${mission.reward} MB`, 'success');
          playUiSound('success');
      }
  };

  const advanceStory = () => {
    playUiSound('click');
    if (storyIndex < STORY_SEGMENTS.length - 1) {
      setStoryIndex(prev => prev + 1);
    } else {
      generateMissionOptions();
      setGameState('briefing');
    }
  };

  const checkPrepItem = (item: keyof PrepItems) => {
    playUiSound('click');
    setPrepItems(prev => ({ ...prev, [item]: true }));
  };

  const spawnRandomCustomer = () => {
    const randomIndex = Math.floor(Math.random() * CUSTOMER_TEMPLATES.length);
    const template = CUSTOMER_TEMPLATES[randomIndex];
    setActiveCustomer({ ...template, id: Date.now() + Math.random() });
  };

  const startBusiness = () => {
    playUiSound('success');
    setGameState('hub');
    // Start audio engine on first significant interaction if not started
    if (!audioCtxRef.current) {
      initAudio();
      setIsBgmPlaying(true);
    }
    setTimeout(() => spawnRandomCustomer(), 2000);
  };

  const buyShopItem = (item: ShopItem) => {
      if (dataFragments < item.price) {
          showNotification("余额不足 (Insufficient Data)", 'error');
          playUiSound('error');
          return; 
      }

      // Calculate new state
      const newDataFragments = dataFragments - item.price;
      let newUnlocked = [...unlockedIngredients];
      let newUpgrades = { ...upgrades };
      let successMsg = "购买成功 (Purchase Successful)";

      if (item.type === 'ingredient' && item.effectId) {
          newUnlocked.push(item.effectId);
      } else if (item.id === 'upgrade_emotion_parser') {
          newUpgrades.emotionParser = true;
          successMsg = "情绪解析器已安装 (Emotion Parser Installed)";
      } else if (item.id === 'upgrade_data_miner') {
          newUpgrades.doubleData = true;
          successMsg = "数据挖掘脚本已激活 (Data Miner Active)";
      } else if (item.id === 'upgrade_stability_anchor') {
          newUpgrades.stabilityAnchor = true;
          successMsg = "稳定锚点已部署 (Stability Anchor Deployed)";
      }

      // Update State
      setDataFragments(newDataFragments);
      setUnlockedIngredients(newUnlocked);
      setUpgrades(newUpgrades);
      
      // Auto-save on purchase
      saveGameData(newDataFragments, newUnlocked, newUpgrades);

      showNotification(successMsg, 'success');
      playUiSound('success');
  };

  const generateAICustomer = async () => {
    playUiSound('click');
    setIsLoadingAI(true);
    try {
      const textPrompt = `
        Context: "HAZATIC BAR", a surreal game with "white model" aesthetic.
        Rule: Use "HAZATIC BAR" as the name. Do not translate "HAZATIC" or "HAZATIC BAR" into Chinese.
        Task: Create a new customer.
        Language: Simplified Chinese.
        Theme: They are experiencing a "glitch" in reality (e.g. loops, missing textures, low poly emotion).
        Output JSON: { "name": "...", "dialogue": "...", "vibe": "Visual description of their glitchy appearance", "wantedTags": ["tag1", "tag2"] }
      `;
      
      const customerData = await generateText(textPrompt, true);
      
      // 2. Generate Avatar based on Vibe
      // Enhanced prompt for consistency with game art style
      const imagePrompt = `
        Surreal glitch art portrait of ${customerData.name || 'a character'}.
        Visual Feature: ${customerData.vibe || 'Abstract geometry, unrendered texture'}.
        Style: Low-poly, PS1 graphics, wireframe traces, dithered shading, white model aesthetic.
        Background: Minimalist grey/white void.
        Mood: Melancholic, digital, disconnected.
        Quality: High contrast, artistic, lo-fi digital artifacts.
      `;
      
      const avatarUrl = await generateImage(imagePrompt);

      const newCustomer: Customer = {
        id: Date.now(),
        name: customerData.name || "Unknown Entity",
        dialogue: customerData.dialogue || "...",
        vibe: customerData.vibe || "Uncertain form",
        wantedTags: customerData.wantedTags || [], 
        isAI: true,
        avatar: avatarUrl || undefined
      };

      setActiveCustomer(newCustomer);
    } catch (error) {
      console.error(error);
      spawnRandomCustomer();
    } finally {
      setIsLoadingAI(false);
    }
  };

  // --- NEW: INTERACTIVE DIALOGUE SYSTEM ---

  const initiateConversation = async () => {
    playUiSound('click');
    if (inquiries && inquiries.length > 0) {
      setGameState('chatting');
      return;
    }

    if (!activeCustomer) {
      setInquiries([
        { id: '1', text: "你还好吗？", type: 'personal' },
        { id: '2', text: "外面的世界怎么样了？", type: 'lore' }
      ]);
      setGameState('chatting');
      return;
    }

    // Reset Stability on new conversation, using anchor if purchased
    setConnectionStability(upgrades.stabilityAnchor ? 80 : 50);
    setConversationHistory([]);

    setIsLoadingAI(true);
    try {
      const prompt = `
        Role: Bartender in "HAZATIC BAR".
        Rule: Use "HAZATIC BAR" as the name. Do not translate "HAZATIC" or "HAZATIC BAR" into Chinese.
        Customer: ${activeCustomer.name}, Vibe: ${activeCustomer.vibe}, Dialogue: ${activeCustomer.dialogue}.
        Task: Generate 3 investigative starting options for the player.
        Options Style: 
        1. Empathetic (Safe)
        2. Analytical (Neutral)
        3. Intrusive (Risky)
        
        Language: Simplified Chinese.
        Output JSON: { "questions": [ { "text": "...", "type": "personal" | "lore" | "glitch" }, ... ] }
      `;
      
      const result = await generateText(prompt, true);
      setInquiries(result.questions?.map((q: any, i: number) => ({...q, id: i.toString()})) || []);
      setGameState('chatting');
    } catch (e) {
      console.error(e);
      // Fallback Inquiries when API fails (Offline Mode)
      setInquiries([
        { id: 'fb1', text: "信号似乎不太好... (Signal Weak)", type: 'glitch' },
        { id: 'fb2', text: "稍微休息一下吧。 (Rest)", type: 'personal' }
      ]);
      setGameState('chatting');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleInquiry = async (inquiry: Inquiry) => {
    playUiSound('click');
    if (!activeCustomer) {
      setCurrentChatResponse({ answer: "...", reward: 5 });
      return;
    }

    setIsLoadingAI(true);
    try {
      const prompt = `
        Context: "HAZATIC BAR".
        Rule: Use "HAZATIC BAR" as the name. Do not translate "HAZATIC" or "HAZATIC BAR" into Chinese.
        Role: Customer "${activeCustomer.name}" (Vibe: ${activeCustomer.vibe}).
        Player Question: "${inquiry.text}" (Type: ${inquiry.type}).
        Conversation History: ${conversationHistory.join(' | ')}.
        Current Neural Link Stability: ${connectionStability}%.
        
        Mechanics:
        - Stability represents the structural integrity of the customer's mind/avatar.
        - Personal/intrusive questions might lower stability but reveal deeper lore.
        - Empathetic/glitch-aligned questions might raise stability.
        - If Stability is low (<30%), speech becomes glitchy/corrupted.
        
        Task:
        1. Answer the question in character (Simplified Chinese).
        2. Determine stability change (-20 to +20).
        3. Generate 2-3 follow-up options for the player (mix of approaches: Safe, Risky, Abstract).
        
        Output JSON: { 
           "answer": "...", 
           "stabilityChange": number,
           "reward": number (Data Fragments 10-50),
           "followUpQuestions": [ { "text": "...", "type": "glitch" | "lore" | "personal" | "risk" } ]
        }
      `;

      const result = await generateText(prompt, true);
      
      // Update Stability
      const change = result.stabilityChange || 0;
      const newStability = Math.min(100, Math.max(0, connectionStability + change));
      setConnectionStability(newStability);

      setCurrentChatResponse({ 
        answer: result.answer, 
        reward: result.reward,
        stabilityChange: change
      });

      const baseReward = result.reward || 0;
      const finalReward = upgrades.doubleData ? baseReward * 2 : baseReward;
      
      setDataFragments(prev => {
          const newData = prev + finalReward;
          updateMissionProgress('earn_data', finalReward);
          return newData;
      });
      updateMissionProgress('chat_count', 1);

      setConversationHistory(prev => [...prev, `Q: ${inquiry.text} A: ${result.answer}`]);
      
      // If disconnected
      if (newStability <= 0) {
        setInquiries([]);
        showNotification("连接已断开 (CONNECTION LOST)", 'error');
      } else if (result.followUpQuestions && result.followUpQuestions.length > 0) {
        setInquiries(result.followUpQuestions.map((q: any, i: number) => ({...q, id: `f-${Date.now()}-${i}`})));
      } else {
        setInquiries([]); 
      }

    } catch (e) {
      // Fallback Response
      setCurrentChatResponse({ answer: "数据噪音掩盖了回答... (Data Noise)", reward: 0 });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const closeChatResponse = () => {
    playUiSound('click');
    setCurrentChatResponse(null);
    if (connectionStability <= 0) {
        // Force end chat if disconnected
        setGameState('hub');
        setInquiries(null);
        setConversationHistory([]);
    }
  };

  // ------------------------------------

  const tuneRadioAI = async () => {
    playUiSound('click');
    setIsTuning(true);
    setRadioContent("");
    try {
      const prompt = `
        Context: "HAZATIC BAR" game. Setting: A lonely bar in a white-model, unrendered city. Glitch aesthetic.
        Rule: Use "HAZATIC BAR" as the name. Do not translate "HAZATIC" or "HAZATIC BAR" into Chinese.
        Task: Generate a short, atmospheric radio broadcast snippet (1-2 sentences).
        Topics: Digital weather (packet loss rain), system warnings, lost memories, or void static.
        Language: Simplified Chinese mixed with English words. NO Pinyin.
        Style: Cryptic, melancholic, sci-fi.
      `;

      const text = await generateText(prompt, false);
      setRadioContent(text || "...");
    } catch (e) {
      setRadioContent("...Signal Lost... [0x0000]");
    } finally {
      setIsTuning(false);
    }
  };

  const evaluateDrinkAI = async (customer: Customer, drink: Drink) => {
    setIsLoadingAI(true);
    try {
      const extraContext = upgrades.emotionParser ? "The bartender used an Emotion Parser to understand your needs perfectly." : "";
      
      const prompt = `
        Roleplay as customer "${customer.name}" in HAZATIC BAR.
        Rule: Use "HAZATIC BAR" as the name. Do not translate "HAZATIC" or "HAZATIC BAR" into Chinese.
        Situation: You asked for "${customer.dialogue}".
        Bartender served: "${drink.name}" (${drink.desc}). Alcohol ABV: ${drink.abvLabel}.
        System Notes: ${extraContext}
        
        Tasks:
        1. Evaluate if the drink fits your need (Success/Fail).
        2. Write your immediate reaction dialogue.
        3. Generate 3 distinct response options for the player (Bartender) to say to you.
           - A: Empathetic/Warm.
           - B: Professional/Cold.
           - C: Abstract/Philosophical (Glitch theme).
        4. For each option, decide the "Tip" (Data Fragments 0-50) you would give.

        Output JSON:
        {
          "reaction": "Immediate reaction (Chinese)",
          "dataEarned": number (Base reward 10-50),
          "success": boolean,
          "options": [
            { "text": "Player response A (Chinese)", "tip": number, "reply": "Customer final reply A (Chinese)" },
            { "text": "Player response B (Chinese)", "tip": number, "reply": "Customer final reply B (Chinese)" },
            { "text": "Player response C (Chinese)", "tip": number, "reply": "Customer final reply C (Chinese)" }
          ]
        }
      `;

      const result = await generateText(prompt, true);
      
      setFeedback(result.reaction);
      
      const baseData = result.dataEarned;
      const finalData = upgrades.doubleData ? baseData * 2 : baseData;
      
      setDataFragments(prev => {
          const newData = prev + finalData;
          updateMissionProgress('earn_data', finalData);
          return newData;
      });

      setLastDrinkSuccess(result.success);
      if (result.success) {
          triggerGlitch();
          playUiSound('success');
          updateMissionProgress('serve_count', 1);
          updateMissionProgress('perfect_serve', 1);
      } else {
          playUiSound('error');
          updateMissionProgress('serve_count', 1);
      }
      
      setDialogueOptions(result.options); 
      setSessionLog(prev => [...prev, { customer: customer.name, drink: drink.name, score: finalData, abv: drink.abvLabel || 'N/A' }]);
      
    } catch (error) {
      console.error("Eval Error", error);
      setFeedback("客人默默地喝下了酒。");
      setDataFragments(prev => prev + 15);
      setLastDrinkSuccess(true);
      setDialogueOptions([
         { text: "感觉如何？", tip: 10, reply: "还好。" },
         { text: "慢走。", tip: 0, reply: "..." },
         { text: "今晚的数据流很乱。", tip: 20, reply: "确实。" }
      ]);
    } finally {
      setIsLoadingAI(false);
      setGameState('serving');
    }
  };

  const handleDreamMix = async () => {
    playUiSound('click');
    if (!dreamPrompt.trim() || !activeCustomer) return;
    setIsLoadingAI(true);

    try {
        const prompt = `
            Context: "HAZATIC BAR", a surreal/glitch style bar.
            Rule: Use "HAZATIC BAR" as the name. Do not translate "HAZATIC" or "HAZATIC BAR" into Chinese.
            User Request: "${dreamPrompt}".
            Task: Create a fictional, abstract cocktail based on this request. 
            Use sci-fi/abstract ingredients (e.g. "Liquid Melancholy", "Condensed Time").
            Language: Simplified Chinese.
            Output JSON: {
                "name": "Creative Drink Name",
                "ingredients": ["Abstract Ingredient 1", "Abstract Ingredient 2", ...],
                "description": "Poetic description of taste.",
                "visualDescription": "Detailed visual description of the drink's appearance (glitch/abstract style).",
                "visualPrompt": "English description for image generation (surreal, minimalistic, white model style, glitch artifacts)",
                "tags": ["tag1", "tag2"]
            }
        `;
        const drinkData = await generateText(prompt, true);

        const imageUrl = await generateImage(drinkData.visualPrompt);

        const newDrink: Drink = {
            id: `dream_${Date.now()}`,
            name: drinkData.name,
            ingredients: drinkData.ingredients,
            desc: drinkData.description,
            visualDescription: drinkData.visualDescription,
            tags: drinkData.tags,
            visual: 'bg-gradient-to-br from-gray-200 to-gray-400',
            image: imageUrl || undefined,
            icon: <BrainCircuit className="text-fuchsia-400" strokeWidth={1.5}/>,
            abvLabel: 'Unknown',
            abvDesc: 'Conceptual'
        };

        setGeneratedDrink(newDrink);
        updateMissionProgress('dream_mix', 1);
        await evaluateDrinkAI(activeCustomer, newDrink);

    } catch (error) {
        console.error("Dream Mix Failed", error);
        setFeedback("系统无法解析此概念...逻辑溢出。");
        setLastDrinkSuccess(false);
        setGameState('serving');
    } finally {
        setIsLoadingAI(false);
    }
  };

  const mixCustomDrinkAI = async () => {
    playUiSound('click');
    if (!customSlots.base || !customSlots.modifier || !customSlots.finish || !activeCustomer) return;

    setIsLoadingAI(true);
    const ingredientsList = [customSlots.base.name, customSlots.modifier.name, customSlots.finish.name];
    
    try {
      const prompt = `
        Context: HAZATIC BAR.
        Rule: Use "HAZATIC BAR" as the name. Do not translate "HAZATIC" or "HAZATIC BAR" into Chinese.
        Player mixed: ${ingredientsList.join(', ')}.
        Customer: "${activeCustomer.name}" (Trouble: "${activeCustomer.dialogue}").
        
        Tasks:
        1. Create a poetic drink name and description.
        2. Create a visual description (appearance).
        3. Customer reaction.
        4. Generate 3 response options for player (Empathetic, Professional, Abstract).
        5. Determine Tip amount (High for custom drinks, 30-80) and closing line for each.

        Output JSON:
        { 
          "drinkName": "...", 
          "drinkDesc": "...", 
          "visualDescription": "...",
          "reaction": "...", 
          "dataEarned": number,
          "success": boolean,
          "options": [
            { "text": "...", "tip": number, "reply": "..." },
            { "text": "...", "tip": number, "reply": "..." },
            { "text": "...", "tip": number, "reply": "..." }
          ]
        }
      `;

      const result = await generateText(prompt, true);

      const drinkName = typeof result.drinkName === 'string' ? result.drinkName : "未知混合物";

      const customDrink: Drink = {
        id: 'custom_' + Date.now(),
        name: drinkName,
        desc: result.drinkDesc,
        visualDescription: result.visualDescription,
        ingredients: ingredientsList,
        visual: 'bg-[#e0e0e0] shadow-inner border border-gray-300',
        icon: <Beaker className="text-gray-600" strokeWidth={1.5}/>,
        abvLabel: 'Unknown',
        abvDesc: 'Experimental'
      };

      setGeneratedDrink(customDrink);
      setFeedback(result.reaction);
      
      const baseData = result.dataEarned;
      const finalData = upgrades.doubleData ? baseData * 2 : baseData;

      setDataFragments(prev => {
          const newData = prev + finalData;
          updateMissionProgress('earn_data', finalData);
          return newData;
      });
      setLastDrinkSuccess(result.success);
      if (result.success) {
          triggerGlitch();
          playUiSound('success');
          updateMissionProgress('serve_count', 1);
          updateMissionProgress('perfect_serve', 1);
      } else {
          playUiSound('error');
          updateMissionProgress('serve_count', 1);
      }
      setDialogueOptions(result.options);
      
      setSessionLog(prev => [...prev, { customer: activeCustomer.name, drink: drinkName, score: finalData, abv: 'Custom' }]);

    } catch (error) {
       setGeneratedDrink({ id: 'custom_error', name: "未知混合物", desc: "混沌液体", ingredients: ingredientsList, visual: 'bg-gray-400', icon: <AlertTriangle className="text-red-500"/> });
       setFeedback("虽然不稳定，但确实有效。");
       setLastDrinkSuccess(true);
       setDialogueOptions([
         { text: "独特的味道。", tip: 20, reply: "很有趣。" }
       ]);
    } finally {
      setIsLoadingAI(false);
      setGameState('serving');
    }
  };

  const selectDrink = (drinkId: string) => {
    playUiSound('click');
    const drink = DRINKS.find(d => d.id === drinkId) || null;
    setSelectedDrinkForAbv(drink);
    setGameState('abv_select');
  };

  const confirmMix = async (abvId: string) => {
    playUiSound('click');
    if (!selectedDrinkForAbv || !activeCustomer) return;
    const abvOption = ABV_LEVELS.find(a => a.id === abvId);
    if (!abvOption) return;

    const finalDrink: Drink = {
      ...selectedDrinkForAbv,
      abvLabel: abvOption.label,
      abvDesc: abvOption.desc,
    };

    setGeneratedDrink(finalDrink);

    if (activeCustomer.isAI) {
      await evaluateDrinkAI(activeCustomer, finalDrink);
    } else {
      const matches = finalDrink.tags?.some(tag => activeCustomer.wantedTags?.includes(tag));
      let logicSuccess = matches;
      let feedbackText = "";
      
      if (finalDrink.tags?.includes('water') && (abvId === 'high' || abvId === 'medium')) {
         logicSuccess = false; 
         feedbackText = "这水...为什么会烧喉咙？这不是我要的纯净。";
      } else if (matches) {
         logicSuccess = true;
         feedbackText = activeCustomer.successMsg || "Good.";
         triggerGlitch();
      } else {
         logicSuccess = false;
         feedbackText = activeCustomer.failMsg || "Not right.";
      }

      const score = logicSuccess ? 25 : 5;
      const finalScore = upgrades.doubleData ? score * 2 : score;

      setFeedback(feedbackText);
      setLastDrinkSuccess(logicSuccess || false);
      if (logicSuccess) {
          playUiSound('success');
          updateMissionProgress('perfect_serve', 1);
      }
      else playUiSound('error');

      updateMissionProgress('serve_count', 1);

      setDataFragments(prev => {
          const newData = prev + finalScore;
          updateMissionProgress('earn_data', finalScore);
          return newData;
      });
      
      setDialogueOptions([
        { text: "希望这能修复你的数据。", tip: 30, reply: "我觉得我的缓存被清空了，谢谢。" },
        { text: "请慢用。", tip: 5, reply: "嗯。" },
        { text: "这里的夜晚总是这么多噪点。", tip: 20, reply: "是啊，这才是真实。" }
      ]);

      setSessionLog(prev => [...prev, { customer: activeCustomer.name, drink: finalDrink.name, score: finalScore, abv: finalDrink.abvLabel || 'N/A' }]);
      setGameState('serving');
    }
  };

  const handleResponseChoice = (option: DialogueOption) => {
    playUiSound('click');
    setClosingLine(option.reply);
    const tipAmount = upgrades.doubleData ? option.tip * 2 : option.tip;
    setEarnedTip(tipAmount);
    
    setDataFragments(prev => {
        const newData = prev + tipAmount;
        if(tipAmount > 0) {
            updateMissionProgress('earn_data', tipAmount);
            updateMissionProgress('tip_earn', tipAmount);
        }
        return newData;
    });
    
    setSessionLog(prev => {
        const newLog = [...prev];
        if(newLog.length > 0) {
            newLog[newLog.length - 1].tip = tipAmount;
        }
        return newLog;
    });
  };

  const nextCustomer = () => {
    playUiSound('click');
    setCustomersServed(prev => prev + 1);
    setGameState('hub');
    setFeedback("");
    setActiveCustomer(null);
    setGeneratedDrink(null);
    setDialogueOptions(null);
    setClosingLine(null);
    setEarnedTip(0);
    setCustomSlots({ base: null, modifier: null, finish: null });
    setSelectedDrinkForAbv(null);
    setShowRadio(false); 
    setDreamPrompt(""); 
    setConnectionStability(50); // Reset
    
    setInquiries(null);
    setConversationHistory([]);
    setCurrentChatResponse(null);
  };

  const handleRetry = () => {
     playUiSound('click');
     setGameState('mixing');
     setFeedback("");
     setGeneratedDrink(null);
     setDialogueOptions(null);
     setClosingLine(null);
     setEarnedTip(0);
     setSelectedDrinkForAbv(null);
  };
  
  // Back button for custom mixing: preserves state, just changes view
  const handleCustomBack = () => {
    playUiSound('click');
    setGameState('mixing');
  };

  const generateJournalAI = async () => {
    if (sessionLog.length === 0) {
        setJournalEntry("No data recorded today.");
        return;
    }

    setIsJournalLoading(true);
    try {
      const nightSummary = sessionLog.map(log => 
        `- Customer: ${log.customer}, Drink: ${log.drink}, Tip: ${log.tip || 0}MB`
      ).join('\n');

      const prompt = `
        Context: "HAZATIC BAR" bartender diary.
        Rule: Use "HAZATIC BAR" as the name. Do not translate "HAZATIC" or "HAZATIC BAR" into Chinese.
        Tonight's Data:
        ${nightSummary}
        
        Write a short, atmospheric journal entry (Chinese). 
        Style: Edward Hopper loneliness + Cyberpunk Glitch.
      `;

      const text = await generateText(prompt, false);
      setJournalEntry(text || "...");

    } catch (error) {
      setJournalEntry("记忆写入失败...数据流已中断。");
    } finally {
      setIsJournalLoading(false);
    }
  };

  const finishShift = async () => {
    playUiSound('click');
    setGameState('report');
    generateJournalAI();
  };

  const handleSaveAndQuit = () => {
    playUiSound('success');
    setIsFadingOut(true);

    // SAVE GAME before quitting
    saveGameData(dataFragments, unlockedIngredients, upgrades);
    
    setTimeout(() => {
      setCustomersServed(0);
      setSessionLog([]);
      setJournalEntry(null);
      setPrepItems({ ice: false, bottles: false, garnish: false });
      setFeedback("");
      setActiveCustomer(null);
      setGeneratedDrink(null);
      setDialogueOptions(null);
      setClosingLine(null);
      setEarnedTip(0);
      setCustomSlots({ base: null, modifier: null, finish: null });
      setSelectedDrinkForAbv(null);
      setShowRadio(false);
      setDreamPrompt("");
      setInquiries(null);
      setConversationHistory([]);
      setCurrentChatResponse(null);
      setActiveMissions([]);
      setConnectionStability(50);
      
      setStoryIndex(0);
      setGameState('intro');
      setIsFadingOut(false);
    }, 2000);
  };

  // Render methods remain the same as previous, just ensure generateAICustomer uses the new logic
  if (gameState === 'intro') {
    const segment = STORY_SEGMENTS[storyIndex];
    return (
      <BaseContainer glitchEffect={glitchEffect} isFadingOut={isFadingOut} isLoadingAI={isLoadingAI} notification={notification} className="flex flex-col items-center justify-center p-8 transition-all duration-1000">
        <div className="max-w-md w-full text-center space-y-8 animate-fadeIn z-10">
          <div className="w-full h-48 md:h-64 bg-[#e0e0e0] p-4 shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] rounded-sm flex items-center justify-center mb-8 relative overflow-hidden group border-4 border-[#d4d4d4]">
             {storyIndex === 2 ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 pointer-events-none"></div>
                  <Key className="w-12 h-12 md:w-16 md:h-16 text-gray-500 drop-shadow-sm animate-pulse relative z-10 opacity-80" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))' }} />
                </>
             ) : (
                <div className="w-full h-full relative overflow-hidden rounded-sm border border-gray-400/30">
                    <div className="w-full h-full bg-[#d4d4d4] flex flex-col items-center justify-center gap-4 p-6">
                      <Box size={40} className="text-gray-400 opacity-50" strokeWidth={1} />
                      <div className="h-px w-24 bg-gray-400/50"></div>
                      <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.3em] font-bold">Render Incomplete</p>
                      <p className="text-[8px] md:text-[10px] text-gray-400 font-mono">Waiting for Asset...</p>
                    </div>
                  <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"></div>
                </div>
             )}
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.2em] mb-4 font-bold text-[#3a3a3a] drop-shadow-sm">{segment.text}</h1>
          <p className="text-xs md:text-sm tracking-[0.15em] text-gray-600 uppercase font-medium">{segment.subtext}</p>
          <ArchitecturalButton onClick={advanceStory} className="mt-12 mx-auto">
            {segment.action || "继续 NEXT"}
          </ArchitecturalButton>
        </div>
      </BaseContainer>
    );
  }

  if (gameState === 'briefing') {
    return (
      <BaseContainer glitchEffect={glitchEffect} isFadingOut={isFadingOut} isLoadingAI={isLoadingAI} notification={notification} className="flex flex-col items-center justify-center p-8">
         <ArchitecturalCard className="z-10 max-w-lg w-full animate-slideUp">
            <h2 className="text-lg md:text-xl tracking-[0.2em] font-bold mb-4 border-b border-gray-300 pb-4 flex items-center gap-3 text-[#3a3a3a]">
               <Terminal size={20} className="text-gray-500 opacity-80" strokeWidth={1.5} /> 每日委托 REPORT
            </h2>
            <div className="mb-6 flex justify-between items-center bg-[#f0f0f0] p-2 rounded-sm border border-white/50">
               <span className="text-xs text-gray-500 font-mono tracking-wider pl-1">SELECT PROTOCOLS</span>
               <span className="text-xs font-bold text-[#3a3a3a] tracking-wider">{activeMissions.length} / 2 SELECTED</span>
            </div>
            
            <div className="space-y-4 mb-8">
               {missionSelectionPool.map((mission) => {
                 const isSelected = activeMissions.find(m => m.id === mission.id);
                 return (
                   <button 
                     key={mission.id} 
                     onClick={() => toggleMissionSelection(mission)}
                     className={`w-full flex items-center gap-4 p-4 rounded-sm border shadow-sm relative group overflow-hidden transition-all text-left
                         ${isSelected 
                           ? 'bg-[#d4d4d4] border-gray-400 shadow-inner' 
                           : 'bg-[#e5e5e5]/50 border-white/60 hover:bg-[#e5e5e5]'
                         }`}
                   >
                      <GlitchBorder />
                      <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center transition-colors relative z-10 ${isSelected ? 'border-gray-600 bg-gray-600' : 'border-gray-400'}`}>
                          {isSelected && <CheckSquare size={10} className="text-white" />}
                      </div>
                      <div className="flex-1 relative z-10">
                         <div className="text-xs md:text-sm font-bold text-[#4a4a4a] tracking-wide flex items-center gap-2">
                             {mission.icon} {mission.text}
                         </div>
                         <div className="flex justify-between mt-1">
                             <div className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-medium">Target: {mission.target}</div>
                             <div className="text-[10px] text-gray-500 font-mono font-bold">Reward: {mission.reward} MB</div>
                         </div>
                      </div>
                   </button>
                 );
               })}
            </div>
            
            <ArchitecturalButton 
              disabled={activeMissions.length !== 2}
              onClick={() => setGameState('prep')} 
              className="w-full"
              variant={activeMissions.length === 2 ? 'primary' : 'disabled'}
            >
              {activeMissions.length === 2 ? "确认协议 CONFIRM" : "需选择 2 项 SELECT 2"}
            </ArchitecturalButton>
         </ArchitecturalCard>
      </BaseContainer>
    );
  }

  if (gameState === 'prep') {
    const allPrepped = prepItems.ice && prepItems.bottles && prepItems.garnish;

    return (
      <BaseContainer glitchEffect={glitchEffect} isFadingOut={isFadingOut} isLoadingAI={isLoadingAI} notification={notification} className="flex flex-col items-center justify-center p-8">
         <div className="z-10 w-full max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl tracking-[0.3em] mb-3 font-bold text-[#3a3a3a] flex items-center justify-center gap-3 drop-shadow-sm">
              <Gauge size={24} className="text-gray-500 opacity-80" strokeWidth={1.5} /> 营业准备
            </h2>
            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.4em] mb-16 font-medium pl-4">Preparation Check Protocol</p>

            <div className="grid grid-cols-3 gap-4 md:gap-8 mb-16 h-48 md:h-64">
              {[
                { id: 'ice', label: '检查冰块', checkedLabel: 'ICE CHECKED', icon: <div className="w-5 h-5 bg-[#c0c0c0] shadow-inner rounded-sm"></div> },
                { id: 'bottles', label: '清点基酒', checkedLabel: 'SPIRITS CHECKED', icon: <div className="w-3 h-7 bg-[#c0c0c0] shadow-inner rounded-sm"></div> },
                { id: 'garnish', label: '备好装饰', checkedLabel: 'GARNISH CHECKED', icon: <div className="w-4 h-4 bg-[#c0c0c0] shadow-inner rounded-sm rotate-45"></div> }
              ].map((item) => {
                 const itemId = item.id as keyof PrepItems;
                 return (
                    <button 
                      key={item.id}
                      onClick={() => checkPrepItem(itemId)} 
                      className={`relative group rounded-sm border-2 transition-all duration-500 flex flex-col items-center justify-center gap-5 p-4 md:p-6 backdrop-blur-md overflow-hidden
                        ${prepItems[itemId] 
                          ? 'border-[#8a8a8a] bg-[#d4d4d4] shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff]' 
                          : 'border-[#e0e0e0] bg-[#e5e5e5]/80 shadow-[8px_8px_16px_#bebebe,-8px_-8px_16px_#ffffff] hover:scale-[1.02] hover:border-white/60'}`}
                    >
                      <GlitchBorder />
                      <div className={`p-4 md:p-5 rounded-full shadow-inner transition-all ${prepItems[itemId] ? 'bg-[#c0c0c0] opacity-80' : 'bg-[#d4d4d4] opacity-60'}`}>
                        {item.icon}
                      </div>
                      <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase text-gray-600 font-bold relative z-10">{prepItems[itemId] ? item.checkedLabel : item.label}</span>
                      {prepItems[itemId] && <CheckCircle2 className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-600 w-4 h-4 md:w-6 md:h-6 opacity-80 drop-shadow-sm" strokeWidth={2} />}
                    </button>
                 );
              })}
            </div>

            <ArchitecturalButton 
              disabled={!allPrepped}
              onClick={startBusiness}
              variant={allPrepped ? "primary" : "disabled"}
              className="w-full py-4 text-base"
            >
              {allPrepped ? "OPEN THE BAR" : "PENDING CHECKS..."}
            </ArchitecturalButton>
         </div>
      </BaseContainer>
    );
  }

  // Same Report, Hub, Overlays code as before...
  // Just ensuring generateAICustomer is updated.
  // ... (Full rest of file is preserved in the context of the running app, I only need to output the full file content if I'm replacing it)
  // Since I provided the full file content in the change block, I will include the rest of the component logic to ensure it's complete.
  
  if (gameState === 'report') {
    const totalScore = sessionLog.reduce((acc, curr) => acc + curr.score + (curr.tip || 0), 0);
    const grade = totalScore > 150 ? "S" : totalScore > 80 ? "A" : "B";

    return (
      <BaseContainer glitchEffect={glitchEffect} isFadingOut={isFadingOut} isLoadingAI={isLoadingAI} notification={notification} className="flex flex-col items-center justify-center p-4 md:p-8">
         <ArchitecturalCard className="z-10 max-w-2xl w-full p-4 md:p-8 animate-slideUp">
            <div className="flex justify-between items-start mb-4 md:mb-6 border-b-2 border-gray-300 pb-4 md:pb-6">
              <div>
                <h2 className="text-2xl md:text-3xl tracking-[0.2em] font-bold text-[#3a3a3a] flex items-center gap-3">
                  <Trophy size={28} className="text-gray-400 opacity-80" strokeWidth={1.5} /> SHIFT REPORT
                </h2>
                <p className="text-[10px] md:text-xs text-gray-500 font-mono mt-3 tracking-wider pl-1">ID: HAZ-9921 // NIGHT CYCLE END</p>
              </div>
              <div className="text-5xl md:text-7xl font-bold text-[#8a8a8a] relative drop-shadow-sm">
                {grade}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
               <div className="bg-[#e5e5e5]/50 p-3 md:p-6 rounded-sm shadow-sm relative overflow-hidden border border-white/60 group">
                  <GlitchBorder />
                  <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.15em] mb-1 md:mb-2 flex items-center gap-1 md:gap-2 font-medium relative z-10">
                    <Eye size={14} className="opacity-70" /> Customers
                  </div>
                  <div className="text-2xl md:text-4xl font-bold text-[#3a3a3a] relative z-10 pl-1">{customersServed}</div>
               </div>
               <div className="bg-[#e5e5e5]/50 p-3 md:p-6 rounded-sm shadow-sm relative overflow-hidden border border-white/60 group">
                  <GlitchBorder />
                  <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.15em] mb-1 md:mb-2 flex items-center gap-1 md:gap-2 font-medium relative z-10">
                    <TrendingUp size={14} className="opacity-70" /> Data
                  </div>
                  <div className="text-2xl md:text-4xl font-bold text-[#3a3a3a] relative z-10 pl-1">{dataFragments} <span className="text-sm md:text-lg font-mono text-gray-500">MB</span></div>
               </div>
            </div>

            <div className="mb-4 md:mb-6 bg-[#e5e5e5]/40 p-3 md:p-5 rounded-sm border border-white/50 relative overflow-hidden shadow-inner">
               <div className="flex items-center justify-between mb-2 md:mb-3">
                  <h3 className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-[0.2em] flex items-center gap-3">
                    <BookOpen size={16} className="opacity-70"/> Nightly Journal
                  </h3>
                  {isJournalLoading && <Loader2 size={16} className="animate-spin text-gray-400"/>}
               </div>
               
               <div className="min-h-[80px] pl-2 md:pl-4 pr-1 md:pr-2 border-l-2 border-gray-300/50 py-1 md:py-2">
                 {isJournalLoading ? (
                   <p className="text-xs text-gray-400 animate-pulse font-mono tracking-wider">Writing memory to disk...</p>
                 ) : journalEntry ? (
                   <p className="text-sm md:text-base text-[#4a4a4a] leading-relaxed whitespace-pre-line drop-shadow-sm tracking-wide text-justify break-words">
                     "{journalEntry}"
                   </p>
                 ) : (
                   <p className="text-xs text-gray-400 tracking-wider">No data recorded.</p>
                 )}
               </div>
            </div>

            <div className="mb-4 md:mb-6">
               <h3 className="text-xs md:text-sm font-bold text-gray-600 mb-2 md:mb-4 uppercase tracking-[0.2em] flex items-center gap-3">
                 <FileText size={16} className="opacity-70" /> Service Log
               </h3>
               <div className="space-y-2 md:space-y-3 max-h-48 md:max-h-64 overflow-y-auto pr-1 md:pr-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pb-2">
                  {sessionLog.map((log, idx) => (
                    <div key={idx} className="bg-[#f0f0f0]/60 p-2 md:p-3 rounded-sm border border-white/40 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-2 group hover:shadow-md transition-all">
                       <div className="flex flex-col gap-0.5 md:gap-1 w-full md:w-auto">
                           <div className="flex items-center justify-between md:justify-start gap-2">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-gray-400"/>
                                <span className="font-bold text-[#3a3a3a] tracking-wide text-xs md:text-sm">{log.customer}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 ml-0 md:ml-5">
                              <span className="text-xs text-gray-600 line-clamp-1">{log.drink}</span>
                              <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-mono tracking-wider shrink-0">{log.abv}</span>
                           </div>
                       </div>
                       
                       <div className="flex items-center gap-3 font-mono text-xs w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-200 mt-1 md:mt-0">
                          {log.tip && log.tip > 0 && (
                              <span className="text-green-700 font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-sm border border-green-100">
                                 <Coins size={12}/> +{log.tip}
                              </span>
                          )}
                          <span className="text-gray-600 font-bold flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-sm border border-gray-200 ml-auto md:ml-0">
                             <Database size={12}/> +{log.score} MB
                          </span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <p className="text-[10px] md:text-sm italic text-gray-500 mb-6 md:mb-10 text-center tracking-wider">
              "今夜，这个街区的现实稳定度上升了 0.04%。感谢您的服务。"
            </p>

            <ArchitecturalButton onClick={handleSaveAndQuit} className="w-full py-3 md:py-4 text-sm md:text-base">
              结束并保存 SAVE & QUIT
            </ArchitecturalButton>
         </ArchitecturalCard>
      </BaseContainer>
    );
  }

  return (
    <BaseContainer glitchEffect={glitchEffect} isFadingOut={isFadingOut} isLoadingAI={isLoadingAI} notification={notification}>
      <header className="fixed top-0 w-full px-4 py-3 md:px-6 md:py-6 flex justify-between items-center z-10 bg-[#d4d4d4]/90 backdrop-blur-md border-b border-white/30 shadow-sm">
        <div className="flex flex-col items-start relative">
          <div className="h-8 md:h-12 mb-1 flex items-center relative gap-4">
               <h1 className="text-lg md:text-2xl tracking-tighter font-bold text-[#4a4a4a] flex items-center gap-3 drop-shadow-sm">
                 <Zap size={20} className="text-gray-500 opacity-80" strokeWidth={2} /> HAZATIC BAR
               </h1>
          </div>
          <span className="text-[8px] md:text-[10px] tracking-[0.3em] uppercase text-gray-500 pl-1 relative font-medium">
            22.5°N, 113.9°E ± Δ
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2 md:gap-3 px-3 py-1 md:px-5 md:py-2 bg-[#e0e0e0] rounded-sm shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] mb-1 relative overflow-hidden border border-white/50">
               <TrendingUp size={14} className="text-gray-500 opacity-80" />
               <span className="text-xs md:text-sm font-mono relative z-10 text-[#3a3a3a] font-bold">{dataFragments} MB</span>
               
               <button 
                  onClick={toggleBgm}
                  className="ml-2 pl-2 border-l border-gray-400/30 text-gray-500 hover:text-gray-800 transition-colors"
                  title="Toggle Ambient Audio"
               >
                  {isBgmPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
               </button>
             </div>
             
             <button 
               onClick={() => setShowMissionLog(true)}
               className="text-[8px] md:text-[10px] text-gray-500 tracking-[0.15em] flex items-center gap-2 font-medium hover:text-gray-800 transition-colors group relative"
             >
               {activeMissions.some(m => !m.claimed && m.current >= m.target) && (
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               )}
               <Trophy size={10} className="opacity-70 group-hover:scale-110 transition-transform" /> 
               <span className="border-b border-transparent group-hover:border-gray-400 transition-colors">
                 {activeMissions.filter(m => m.current >= m.target).length} / 2 COMPLETE
               </span>
             </button>
          </div>
        </div>
      </header>

      <main className="pt-20 md:pt-28 pb-32 px-4 md:px-6 max-w-4xl mx-auto min-h-screen flex flex-col justify-center relative z-10">
        
        {!activeCustomer && (
           <div className="absolute left-4 bottom-24 md:left-8 md:bottom-8 z-20 animate-fadeIn">
              <div className={`bg-[#e0e0e0] rounded-sm border border-white/50 shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] p-3 md:p-4 flex flex-col gap-3 transition-all duration-500 ${showRadio ? 'w-56 md:w-64' : 'w-12 md:w-14'}`}>
                 <button 
                   onClick={() => setShowRadio(!showRadio)}
                   className="flex items-center justify-center w-full h-full"
                 >
                   <Radio size={18} className={`text-gray-600 transition-colors ${isTuning ? 'animate-pulse' : ''}`} />
                 </button>
                 
                 {showRadio && (
                   <div className="animate-fadeIn space-y-3 overflow-hidden">
                      <div className="flex justify-between items-center bg-gray-300/30 p-2 rounded-sm border border-gray-400/20 mb-2">
                          <div className="flex items-end gap-1 h-4">
                              <div className={`w-1 bg-gray-500 transition-all duration-300 ${isBgmPlaying ? 'animate-pulse h-full' : 'h-1'}`} style={{animationDelay: '0ms'}}></div>
                              <div className={`w-1 bg-gray-500 transition-all duration-300 ${isBgmPlaying ? 'animate-pulse h-3/4' : 'h-1'}`} style={{animationDelay: '150ms'}}></div>
                              <div className={`w-1 bg-gray-500 transition-all duration-300 ${isBgmPlaying ? 'animate-pulse h-1/2' : 'h-1'}`} style={{animationDelay: '75ms'}}></div>
                              <div className={`w-1 bg-gray-500 transition-all duration-300 ${isBgmPlaying ? 'animate-pulse h-full' : 'h-1'}`} style={{animationDelay: '300ms'}}></div>
                          </div>
                          <button onClick={toggleBgm} className="text-gray-600 hover:text-gray-900" title="Ambient Sound Toggle">
                              {isBgmPlaying ? <Volume2 size={14}/> : <VolumeX size={14}/>}
                          </button>
                      </div>

                      <div className="flex items-center gap-2 mb-2 px-1">
                         <div className="text-[8px] text-gray-500 font-mono font-bold tracking-widest whitespace-nowrap">SIGNAL GAIN</div>
                         <input 
                           type="range" 
                           min="0" 
                           max="1" 
                           step="0.05" 
                           value={bgmVolume} 
                           onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                           className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-500 hover:accent-gray-700"
                         />
                      </div>

                      <div className="h-px w-full bg-gray-300"></div>
                      <div className="min-h-[50px] max-h-[200px] overflow-y-auto md:min-h-[60px] text-xs text-gray-500 font-mono leading-relaxed pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                         {isTuning ? (
                           <span className="animate-pulse">Scanning frequencies...</span>
                         ) : radioContent ? (
                           `"${radioContent}"`
                         ) : (
                           "Waiting for signal..."
                         )}
                      </div>
                      <ArchitecturalButton 
                        onClick={tuneRadioAI} 
                        disabled={isTuning}
                        variant="secondary"
                        className="w-full py-2 text-xs"
                      >
                        {isTuning ? <Loader2 size={12} className="animate-spin"/> : <Signal size={12}/>} TUNE
                      </ArchitecturalButton>
                   </div>
                 )}
              </div>
           </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center relative mb-8 md:mb-12">
          {activeCustomer ? (
            <ArchitecturalCard className="w-full max-w-lg animate-slideUp transition-all duration-500 group hover:shadow-[12px_12px_24px_#bebebe,-12px_-12px_24px_#ffffff]">
              <div className="absolute -top-10 md:-top-14 left-1/2 transform -translate-x-1/2 w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#ffffff] border-4 border-[#d4d4d4] flex items-center justify-center z-20 relative overflow-hidden">
                 {activeCustomer.avatar ? (
                    <img src={activeCustomer.avatar} alt={activeCustomer.name} className="w-full h-full object-cover hazatic-image opacity-90" />
                 ) : (
                   <div className="w-14 h-14 md:w-20 md:h-20 bg-[#c0c0c0] rounded-full opacity-60 shadow-inner relative z-10 flex items-center justify-center">
                       <User size={30} className="text-gray-500 opacity-50" />
                   </div>
                 )}
                 {activeCustomer.isAI && !activeCustomer.avatar && (
                   <Sparkles className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 text-gray-400 fill-gray-200 animate-pulse z-20 drop-shadow-sm" strokeWidth={1.5} />
                 )}
              </div>
              
              <div className="mt-8 md:mt-12 text-center space-y-4 md:space-y-6 relative z-10">
                <h2 className="text-lg md:text-xl font-bold tracking-[0.25em] text-[#3a3a3a] relative inline-block drop-shadow-sm">
                  {activeCustomer.name}
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-[2px] bg-gray-300/60"></span>
                </h2>

                {upgrades.emotionParser && activeCustomer.wantedTags && activeCustomer.wantedTags.length > 0 && (
                    <div className="flex justify-center gap-2 flex-wrap animate-fadeIn">
                        {activeCustomer.wantedTags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white/50 border border-gray-300 rounded-sm text-[10px] uppercase tracking-widest text-gray-600 font-mono">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
                
                {gameState === 'chatting' ? (
                   <div className="space-y-4 md:space-y-6 min-h-[150px] md:min-h-[200px] flex flex-col items-center justify-center">
                      <div className="w-full px-4 mb-2">
                          <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                              <span className="flex items-center gap-1"><BrainCircuit size={12}/> Neural Link Stability</span>
                              <span className={connectionStability < 30 ? 'text-red-500 animate-pulse' : 'text-gray-700'}>{connectionStability}%</span>
                          </div>
                          <div className="w-full bg-gray-300/50 h-1.5 rounded-full overflow-hidden border border-gray-400/30">
                             <div 
                               className={`h-full transition-all duration-700 ease-out ${connectionStability < 30 ? 'bg-red-500 shadow-[0_0_10px_red]' : connectionStability > 80 ? 'bg-blue-500' : 'bg-green-600'}`}
                               style={{ width: `${connectionStability}%` }}
                             />
                          </div>
                      </div>

                      {isLoadingAI ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                           <Loader2 className="animate-spin text-gray-400" size={24}/>
                           <span className="text-[10px] md:text-xs text-gray-400 animate-pulse font-mono tracking-widest">SYNCHRONIZING NEURAL PATTERNS...</span>
                        </div>
                      ) : currentChatResponse ? (
                        <div className="animate-fadeIn w-full">
                           <div className={`p-4 md:p-6 rounded-sm border shadow-sm relative overflow-hidden group mb-4 md:mb-6 text-left transition-colors duration-500
                                ${currentChatResponse.stabilityChange && currentChatResponse.stabilityChange < 0 ? 'bg-red-50/80 border-red-200' : 'bg-[#f0f0f0]/90 border-white/60'}
                           `}>
                              <GlitchBorder />
                              <p className="text-sm md:text-base relative z-10 leading-relaxed text-[#3a3a3a]">
                                "{currentChatResponse.answer}"
                              </p>
                              
                              <div className="mt-4 flex justify-between items-end border-t border-gray-300/30 pt-3">
                                   {currentChatResponse.stabilityChange !== 0 && (
                                     <span className={`text-[10px] font-bold font-mono flex items-center gap-1 ${currentChatResponse.stabilityChange && currentChatResponse.stabilityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        <Wifi size={10}/> STABILITY {currentChatResponse.stabilityChange && currentChatResponse.stabilityChange > 0 ? '+' : ''}{currentChatResponse.stabilityChange}%
                                     </span>
                                   )}
                                   {currentChatResponse.reward > 0 && (
                                    <span className="text-[8px] md:text-[10px] bg-[#e0e0e0] px-2 py-1 rounded-sm text-gray-600 font-mono font-bold tracking-wider">
                                     +{upgrades.doubleData ? currentChatResponse.reward * 2 : currentChatResponse.reward} MB
                                    </span>
                                   )}
                              </div>
                           </div>
                           <ArchitecturalButton onClick={closeChatResponse} variant="secondary" className="w-full">
                             继续链接 CONTINUE LINK
                           </ArchitecturalButton>
                        </div>
                      ) : (
                        <div className="w-full space-y-3 animate-fadeIn">
                           {inquiries && inquiries.length > 0 ? inquiries.map((q) => (
                             <button
                               key={q.id}
                               onClick={() => handleInquiry(q)}
                               className="w-full text-left p-3 md:p-4 bg-[#e5e5e5]/50 hover:bg-white border border-gray-300/60 rounded-sm text-xs md:text-sm text-[#4a4a4a] transition-all relative overflow-hidden group active:scale-[0.99] hover:shadow-md"
                             >
                               <GlitchBorder />
                               <div className="flex items-center justify-between relative z-10">
                                 <span className="font-medium tracking-wide pr-2">{q.text}</span>
                                 {q.type && (
                                   <span className={`text-[8px] uppercase tracking-wider font-bold ml-2 px-1.5 py-0.5 rounded-sm border ${
                                       q.type === 'risk' || q.type === 'personal' ? 'text-red-500 border-red-200 bg-red-50' : 
                                       q.type === 'glitch' ? 'text-blue-500 border-blue-200 bg-blue-50' : 
                                       'text-gray-400 border-gray-200 bg-gray-100'
                                   }`}>
                                     {q.type}
                                   </span>
                                 )}
                               </div>
                             </button>
                           )) : (
                              <p className="text-sm text-red-500 italic font-mono text-center">CONNECTION LOST.</p>
                           )}
                           <ArchitecturalButton onClick={() => setGameState('hub')} variant="secondary" className="w-full mt-4 bg-[#d4d4d4]">
                             <RotateCcw size={14} className="opacity-70"/> 断开连接 Disconnect
                           </ArchitecturalButton>
                        </div>
                      )}
                   </div>
                ) : gameState === 'serving' ? (
                   <div className="space-y-6 md:space-y-8 animate-fadeIn">
                      {generatedDrink && (
                        <div className={`bg-[#e5e5e5]/60 p-4 md:p-6 rounded-sm border border-white/70 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)] relative overflow-hidden ${glitchEffect ? 'animate-pulse' : ''} ${!lastDrinkSuccess ? 'border-gray-400 bg-gray-300/30' : ''}`}>
                           <div className="flex items-center justify-center gap-4 mb-3">
                             <div className="text-gray-500 opacity-80">{generatedDrink.icon}</div>
                             <h3 className="text-xl md:text-2xl font-bold text-[#3a3a3a] tracking-wide">{generatedDrink.name}</h3>
                           </div>
                           <p className="text-xs md:text-sm text-gray-600 italic tracking-wide">{generatedDrink.desc}</p>
                           
                           {generatedDrink.visualDescription && (
                             <div className="mt-4 p-3 bg-white/40 rounded-sm border border-white/50 text-[10px] md:text-xs text-gray-500 leading-relaxed font-serif tracking-wide text-center">
                                <span className="block mb-1 opacity-70 uppercase tracking-widest font-sans font-bold text-[8px] flex justify-center items-center gap-1">
                                  <Eye size={8} /> Visual Analysis
                                </span>
                                {generatedDrink.visualDescription}
                             </div>
                           )}

                           {generatedDrink.abvLabel && (
                              <div className="mt-4 flex justify-center">
                                <span className={`inline-block px-3 py-1 text-[10px] md:text-xs tracking-[0.2em] uppercase rounded-sm border shadow-sm bg-[#f0f0f0] text-gray-700 border-gray-300 font-bold`}>
                                   ABV: {generatedDrink.abvLabel}
                                </span>
                              </div>
                           )}
                           {generatedDrink.id.startsWith('custom') || generatedDrink.id.startsWith('dream') && (
                             <span className="inline-block mt-2 px-4 py-1 bg-[#e0e0e0] text-gray-600 text-[10px] tracking-[0.2em] uppercase rounded-sm border border-gray-300 shadow-sm font-bold">CUSTOM MIX</span>
                           )}
                           {!lastDrinkSuccess && <div className="mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2"><X size={12} /> System Alert: Texture Mismatch</div>}
                        </div>
                      )}
                      
                      {closingLine ? (
                         <div className="animate-fadeInUp bg-[#f0f0f0]/70 p-4 md:p-6 rounded-sm relative overflow-hidden border border-white/60 shadow-sm group">
                            <GlitchBorder />
                            <p className="text-xl md:text-2xl font-serif italic text-[#4a4a4a] mb-4 relative z-10 drop-shadow-sm">"{closingLine}"</p>
                            {earnedTip > 0 && (
                               <div className="flex items-center justify-center gap-3 text-gray-600 bg-[#e0e0e0] py-2 px-5 rounded-sm mx-auto w-fit relative z-10 shadow-[inset_2px_2px_4px_#bebebe,inset_-2px_-2px_4px_#ffffff] border border-white/50">
                                  <Coins size={14} className="opacity-80" />
                                  <span className="text-xs md:text-sm font-bold tracking-[0.2em] font-mono">TIP: +{earnedTip} MB {upgrades.doubleData && "(x2 BONUS)"}</span>
                               </div>
                            )}
                         </div>
                      ) : (
                         <div className="bg-[#f0f0f0]/70 p-4 md:p-6 rounded-sm relative overflow-hidden border border-white/60 shadow-sm group">
                            <GlitchBorder />
                            <p className="text-xl md:text-2xl font-serif italic text-[#4a4a4a] relative z-10 drop-shadow-sm">"{feedback}"</p>
                         </div>
                      )}

                   </div>
                ) : (
                  <div className="space-y-4 bg-[#f0f0f0]/70 p-6 md:p-8 rounded-sm relative overflow-hidden border border-white/60 shadow-sm group my-4 md:my-8">
                    <GlitchBorder />
                    <p className="text-xl md:text-2xl font-serif italic text-[#4a4a4a] relative z-10 leading-relaxed drop-shadow-sm">"{activeCustomer.dialogue}"</p>
                    {activeCustomer.vibe && <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.3em] relative z-10 font-medium">[{activeCustomer.vibe}]</p>}
                  </div>
                )}
              </div>

              {gameState === 'serving' && (
                <div className="mt-8 md:mt-10 flex flex-col items-center gap-6 relative z-10">
                   {!closingLine && dialogueOptions && (
                      <div className="w-full space-y-3 md:space-y-4 animate-fadeIn">
                         <p className="text-[10px] md:text-xs text-center text-gray-500 uppercase tracking-[0.3em] flex items-center justify-center gap-3 font-medium mb-2">
                           <MessageSquare size={14} className="opacity-70" /> 选择回复 Respond
                         </p>
                         {dialogueOptions.map((option, idx) => (
                            <button
                               key={idx}
                               onClick={() => handleResponseChoice(option)}
                               className="w-full text-left p-3 md:p-4 bg-[#f5f5f5]/70 hover:bg-white border border-gray-300/60 rounded-sm text-xs md:text-sm text-[#4a4a4a] transition-all hover:shadow-md group relative overflow-hidden active:shadow-inner"
                            >
                               <GlitchBorder />
                               <span className="font-bold mr-4 text-gray-400 group-hover:text-gray-600 relative z-10 font-mono">0{idx + 1}.</span>
                               <span className="relative z-10 tracking-wide font-medium">{option.text}</span>
                            </button>
                         ))}
                      </div>
                   )}

                   {closingLine || (!dialogueOptions && !closingLine) ? (
                       <div className="w-full flex gap-4 md:gap-5 mt-4 md:mt-6 animate-fadeIn">
                           {!lastDrinkSuccess && !closingLine && (
                               <ArchitecturalButton 
                                  onClick={handleRetry}
                                  variant="secondary"
                                  className="flex-1"
                                >
                                  <RotateCcw size={16} className="relative z-10 opacity-70" /> 重试 RETRY
                                </ArchitecturalButton>
                           )}
                           <ArchitecturalButton 
                              onClick={nextCustomer}
                              className="flex-1"
                            >
                              送客 NEXT
                            </ArchitecturalButton>
                       </div>
                   ) : null}
                </div>
              )}
            </ArchitecturalCard>
          ) : (
             <div className="text-center text-gray-500 flex flex-col items-center gap-6 md:gap-8">
               <div className="relative p-6 md:p-8 rounded-full bg-[#e0e0e0] shadow-[inset_8px_8px_16px_#bebebe,inset_-8px_-8px_16px_#ffffff] border border-white/40">
                 <Moon className="w-16 h-16 md:w-20 md:h-20 mx-auto opacity-20 relative z-10 text-[#3a3a3a]" strokeWidth={1} />
                 <Zap className="absolute top-4 right-4 text-gray-400/30 w-8 h-8 md:w-10 md:h-10 animate-pulse z-0" strokeWidth={1} />
               </div>
               
               <p className="tracking-[0.4em] text-xs md:text-sm uppercase mb-4 relative font-medium text-gray-600">
                 The bar is empty
               </p>
               
               <div className="w-full max-w-md relative z-10 px-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <button 
                          onClick={spawnRandomCustomer}
                          className="group relative bg-[#e0e0e0] hover:bg-[#d4d4d4] active:scale-[0.98] transition-all duration-300 rounded-sm shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] border border-white/50 p-6 flex flex-col items-center justify-center gap-3 overflow-hidden"
                      >
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <RefreshCw className="text-gray-500 group-hover:rotate-180 transition-transform duration-700" size={24} strokeWidth={1.5} />
                          <div className="text-center">
                              <span className="block text-sm font-bold text-[#3a3a3a] tracking-widest mb-1">随机实体</span>
                              <span className="block text-[8px] text-gray-500 font-mono tracking-wider uppercase">Load Random</span>
                          </div>
                          <div className="absolute top-2 right-2 w-1 h-1 bg-gray-400 rounded-full opacity-50"></div>
                      </button>

                      <button 
                          onClick={generateAICustomer}
                          disabled={isLoadingAI}
                          className="group relative bg-[#e0e0e0] hover:bg-[#d4d4d4] active:scale-[0.98] transition-all duration-300 rounded-sm shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] border border-white/50 p-6 flex flex-col items-center justify-center gap-3 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-purple-900/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {isLoadingAI ? (
                              <Loader2 className="animate-spin text-purple-400" size={24} />
                          ) : (
                              <Sparkles className="text-purple-400/80 group-hover:scale-110 transition-transform duration-500" size={24} strokeWidth={1.5} />
                          )}
                          <div className="text-center">
                              <span className="block text-sm font-bold text-[#3a3a3a] tracking-widest mb-1">迷雾访客</span>
                              <span className="block text-[8px] text-gray-500 font-mono tracking-wider uppercase">AI Summon</span>
                          </div>
                          <div className="absolute top-2 right-2 w-1 h-1 bg-purple-300 rounded-full opacity-50"></div>
                      </button>
                  </div>

                  <ArchitecturalButton 
                      onClick={finishShift}
                      variant="secondary"
                      className="w-full py-4 bg-[#d4d4d4] hover:bg-[#c0c0c0] border-t-2 border-white/40"
                  >
                      <span className="flex items-center gap-3">
                          <Power size={14} className="opacity-50" /> 
                          <span className="tracking-[0.2em] flex flex-col md:flex-row items-center gap-1">
                            <span>结束本轮周期</span>
                            <span className="text-[9px] opacity-60 font-mono">END CYCLE</span>
                          </span>
                      </span>
                  </ArchitecturalButton>
               </div>
             </div>
          )}
        </div>

      </main>

      <div className="fixed bottom-0 left-0 w-full bg-[#d4d4d4]/90 backdrop-blur-md border-t border-white/40 shadow-lg z-30 pb-safe">
        <div className="max-w-xl mx-auto grid grid-cols-4 gap-2 p-2">
            <button 
              onClick={() => setShowRecipeBook(true)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-sm active:bg-white/50 transition-colors group"
            >
              <BookOpen className="text-gray-500 group-hover:text-gray-800 w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.1em] uppercase text-gray-600 font-bold">酒单</span>
            </button>
            
            <button 
              disabled={!activeCustomer || gameState === 'serving' || gameState === 'chatting'}
              onClick={initiateConversation}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-sm transition-colors group ${(!activeCustomer || gameState === 'serving' || gameState === 'chatting') ? 'opacity-40' : 'active:bg-white/50'}`}
            >
              <MessageCircle className="text-gray-500 group-hover:text-gray-800 w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.1em] uppercase text-gray-600 font-bold">对话</span>
            </button>

            <button 
              disabled={!activeCustomer || gameState === 'serving' || gameState === 'chatting'}
              onClick={() => setGameState('mixing')}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-sm transition-colors group ${(!activeCustomer || gameState === 'serving' || gameState === 'chatting') ? 'opacity-40' : 'active:bg-white/50'}`}
            >
              <Utensils className="text-gray-500 group-hover:text-gray-800 w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.1em] uppercase text-gray-600 font-bold">调制</span>
            </button>

            <button 
              onClick={() => setGameState('shop')}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-sm active:bg-white/50 transition-colors group"
            >
              <ShoppingCart className="text-gray-500 group-hover:text-gray-800 w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
              <span className="text-[10px] tracking-[0.1em] uppercase text-gray-600 font-bold">商店</span>
            </button>
        </div>
      </div>

      {showRecipeBook && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
          <ArchitecturalCard className="w-full h-full md:h-[85vh] md:max-w-3xl flex flex-col p-0 overflow-hidden animate-fadeInUp">
            <div className="p-4 md:p-6 border-b border-gray-300/50 flex justify-between items-center bg-[#e0e0e0]/50 relative z-10">
                <div className="flex items-center gap-3">
                    {menuSelectedDrink && (
                        <button onClick={() => setMenuSelectedDrink(null)} className="p-1 hover:bg-white/50 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                    )}
                    <h2 className="text-sm md:text-lg tracking-[0.3em] font-bold flex items-center gap-3 text-[#3a3a3a]">
                        <BookOpen size={18} className="text-gray-500 opacity-80" /> {menuSelectedDrink ? "RECIPE DETAIL" : "MENU"}
                    </h2>
                </div>
                <button onClick={() => { setShowRecipeBook(false); setMenuSelectedDrink(null); }} className="p-2 md:p-3 hover:bg-gray-300/50 rounded-full transition-colors active:bg-gray-400/50">
                    <X size={20} className="text-gray-600" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 bg-[#d4d4d4]/30 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pb-24">
                {menuSelectedDrink ? (
                    <div className="animate-fadeIn space-y-6">
                         <div className="flex flex-col items-center text-center gap-4 mb-8">
                            <div className="w-24 h-24 bg-[#e0e0e0] rounded-full shadow-inner flex items-center justify-center border border-white/60">
                                <div className="text-gray-500 scale-[2.5]">{menuSelectedDrink.icon}</div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-[#3a3a3a] tracking-wider mb-2">{menuSelectedDrink.name}</h3>
                                <p className="text-sm text-gray-600 italic max-w-md mx-auto">{menuSelectedDrink.desc}</p>
                                {menuSelectedDrink.visualDescription && (
                                   <p className="mt-4 text-xs text-gray-500 font-serif max-w-sm mx-auto border-t border-gray-300 pt-3">
                                      <span className="block mb-1 text-[9px] uppercase tracking-widest font-sans font-bold flex justify-center items-center gap-1 opacity-70">
                                        <Eye size={10} /> Visual Profile
                                      </span>
                                      {menuSelectedDrink.visualDescription}
                                   </p>
                                )}
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-[#e5e5e5]/80 p-5 rounded-sm border border-white/60">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Droplets size={14}/> Formula
                                </h4>
                                <ul className="space-y-3">
                                    {menuSelectedDrink.ingredients.map((ing, i) => (
                                        <li key={i} className="flex items-center justify-between text-sm text-[#3a3a3a] border-b border-gray-300/50 pb-2 last:border-0">
                                            <span>{ing}</span>
                                            <span className="text-[10px] text-gray-500 font-mono">1 part</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-[#e5e5e5]/80 p-5 rounded-sm border border-white/60">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                        <Activity size={14}/> Analysis
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {menuSelectedDrink.tags?.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-white/50 border border-gray-300 rounded-sm text-[10px] uppercase tracking-widest text-gray-600 font-mono">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {menuSelectedDrink.abvLabel && (
                                    <div className="bg-[#e5e5e5]/80 p-5 rounded-sm border border-white/60 flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Intensity</span>
                                        <span className="text-sm font-bold text-[#3a3a3a]">{menuSelectedDrink.abvLabel}</span>
                                    </div>
                                )}
                            </div>
                         </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        {DRINKS.map((drink) => (
                            <div 
                                key={drink.id} 
                                onClick={() => setMenuSelectedDrink(drink)}
                                className="bg-[#e5e5e5]/80 p-4 md:p-6 rounded-sm shadow-sm flex flex-col relative overflow-hidden border border-white/60 group hover:shadow-md transition-all cursor-pointer"
                            >
                                <GlitchBorder />
                                <div className="flex justify-between items-center mb-4 relative z-10">
                                    <h3 className="font-bold text-[#3a3a3a] text-sm md:text-lg flex items-center gap-3 tracking-wide">
                                        <div className="text-gray-500 opacity-80">{drink.icon}</div>
                                        {drink.name}
                                    </h3>
                                    <Info size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
                                </div>
                                <div className="mt-auto pt-4 border-t border-gray-300/50 relative z-10">
                                    <p className="text-[10px] md:text-xs italic text-gray-600 tracking-wide leading-relaxed line-clamp-2">{drink.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </ArchitecturalCard>
        </div>
      )}

      {gameState === 'mixing' && (
        <div className="fixed inset-0 z-40 bg-[#d4d4d4]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8">
           {isLoadingAI ? (
             <div className="text-center relative z-10 p-8 rounded-sm bg-[#e0e0e0] shadow-md border border-white/50">
                <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-gray-500 animate-spin mx-auto mb-6 opacity-80" strokeWidth={1.5} />
                <p className="tracking-[0.3em] text-gray-600 animate-pulse flex items-center justify-center gap-3 font-bold text-xs md:text-sm">
                  <Zap size={16} className="opacity-70" /> 正在解析液体数据...
                </p>
             </div>
           ) : (
             <div className="relative z-10 w-full max-w-lg animate-fadeIn flex flex-col h-full max-h-[85vh] md:max-h-[90vh]">
              <div className="flex justify-between items-end w-full mb-6 md:mb-10 border-b-2 border-gray-300 pb-4 shrink-0">
                 <h2 className="text-xl md:text-3xl tracking-[0.3em] text-[#3a3a3a] font-bold flex items-center gap-4">
                   <Utensils size={24} className="text-gray-500 opacity-80" strokeWidth={1.5} /> 选择配方
                 </h2>
                 <div className="flex gap-2">
                    <ArchitecturalButton 
                        onClick={() => setGameState('dream_mixing')}
                        variant="primary"
                        className="py-1 px-2 md:py-2 md:px-4 text-[10px] md:text-xs"
                    >
                        <BrainCircuit size={12} className="opacity-80" />
                        AI特调
                    </ArchitecturalButton>
                    <ArchitecturalButton 
                        onClick={() => setGameState('custom_mixing')}
                        variant="secondary"
                        className="py-1 px-2 md:py-2 md:px-4 text-[10px] md:text-xs"
                    >
                        <Beaker size={12} className="opacity-80" />
                        定制
                    </ArchitecturalButton>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent min-h-0">
                <div className="grid grid-cols-1 gap-3 md:gap-5">
                  {DRINKS.map((drink) => (
                    <button
                      key={drink.id}
                      onClick={() => selectDrink(drink.id)}
                      className="w-full text-left p-4 md:p-5 bg-[#f0f0f0]/90 rounded-sm hover:bg-white transition-all shadow-sm hover:shadow-md group relative overflow-hidden border border-white/60 active:shadow-inner"
                    >
                      <GlitchBorder />
                      <div className="flex justify-between items-center relative z-10 mb-2">
                        <span className="font-bold text-[#3a3a3a] group-hover:tracking-wider transition-all text-sm md:text-xl flex items-center gap-3">
                          <div className="text-gray-400 m-auto mt-1 flex-shrink-0">
                             {drink.icon}
                          </div>
                          {drink.name}
                        </span>
                        {drink.id === 'base_solvent' ? <Droplets size={16} className="text-gray-400 opacity-70" /> : <GlassWater size={16} className="text-gray-300 group-hover:text-gray-500 opacity-60" />}
                      </div>
                      <span className="text-[10px] md:text-sm text-gray-500 relative z-10 pl-9 md:pl-12 block font-medium tracking-wide truncate">{drink.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 shrink-0">
                <ArchitecturalButton 
                  onClick={() => setGameState('hub')}
                  variant="secondary"
                  className="w-full py-4 bg-[#d4d4d4] hover:bg-[#c0c0c0]"
                >
                  <RotateCcw size={16} className="opacity-70" /> 返回 Back
                </ArchitecturalButton>
              </div>
             </div>
           )}
        </div>
      )}

      {gameState === 'abv_select' && selectedDrinkForAbv && (
        <div className="fixed inset-0 z-40 bg-[#d4d4d4]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-lg text-center relative z-10 animate-fadeIn pb-20">
              <h2 className="text-sm md:text-xl tracking-[0.3em] text-gray-500 font-bold mb-4 flex items-center justify-center gap-3 uppercase">
                <Gauge size={18} className="text-gray-400 opacity-80" /> 强度调整
              </h2>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#3a3a3a] mb-8 flex items-center justify-center gap-4 drop-shadow-sm">
                 {selectedDrinkForAbv.name}
              </h3>
              
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 md:mb-12 flex items-center justify-center text-gray-500 opacity-80 scale-[2]">
                  {selectedDrinkForAbv.icon}
              </div>
              
              <div className="space-y-3 md:space-y-5 mb-10 md:mb-16">
                 {ABV_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => confirmMix(level.id)}
                      className="w-full p-4 md:p-5 bg-[#f0f0f0]/90 border border-white/60 hover:bg-white hover:border-gray-300 transition-all rounded-sm group flex justify-between items-center relative overflow-hidden shadow-sm active:shadow-inner"
                    >
                       <GlitchBorder />
                       <div className="text-left relative z-10">
                          <div className="font-bold text-[#3a3a3a] flex items-center gap-3 text-sm md:text-lg">
                            <Activity size={16} className="text-gray-400 opacity-70" /> {level.label}
                          </div>
                          <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] pl-6 md:pl-8 mt-1 font-medium">{level.desc}</div>
                       </div>
                       <div className="text-sm md:text-base font-mono text-gray-400 group-hover:text-gray-600 relative z-10 font-bold">{level.val}</div>
                    </button>
                 ))}
              </div>

              <ArchitecturalButton 
                onClick={() => setGameState('mixing')}
                variant="secondary"
                className="w-full py-4 bg-[#d4d4d4] hover:bg-[#c0c0c0]"
              >
                <RotateCcw size={16} className="opacity-70" /> 返回上一级 Back
              </ArchitecturalButton>
            </div>
        </div>
      )}

      {gameState === 'custom_mixing' && (
        <div className="fixed inset-0 z-40 bg-[#d4d4d4]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-3xl relative z-10 animate-fadeIn flex flex-col h-full max-h-[90vh]">
             <div className="text-center mb-4 md:mb-8 shrink-0">
               <h2 className="text-xl md:text-3xl tracking-[0.3em] text-[#3a3a3a] font-bold mb-2 flex items-center justify-center gap-4 drop-shadow-sm">
                 <Beaker size={24} className="text-gray-500 opacity-80" strokeWidth={1.5} /> 专属定制
               </h2>
               <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.4em] font-medium pl-4">Guest Exclusive Customization Protocol</p>
             </div>

             <div className="flex-1 overflow-y-auto min-h-0 pb-24 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-10">
                 {[
                   { type: 'base', dataKey: 'bases', icon: <Droplets size={16} /> },
                   { type: 'modifier', dataKey: 'modifiers', icon: <Plus size={16} /> },
                   { type: 'finish', dataKey: 'finishes', icon: <Sparkles size={16} /> }
                 ].map((cat) => (
                   <div key={cat.type} className="flex flex-col gap-2 md:gap-3 p-2 md:p-4 bg-[#e0e0e0]/50 rounded-sm border border-white/40 shadow-inner">
                     <span className="text-[10px] md:text-xs uppercase text-gray-600 tracking-[0.2em] text-center flex items-center justify-center gap-2 font-bold py-1">
                       {cat.icon} {cat.type}
                     </span>
                     <div className="space-y-2 overflow-y-auto max-h-32 md:max-h-64 pr-1 md:pr-3 relative scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                       {CUSTOM_INGREDIENTS[cat.dataKey as keyof typeof CUSTOM_INGREDIENTS].map((ing) => {
                         const isLocked = ing.price && ing.price > 0 && !unlockedIngredients.includes(ing.id);
                         const isSelected = customSlots[cat.type as keyof CustomSlots]?.id === ing.id;
                         
                         return (
                         <button
                           key={ing.id}
                           disabled={isLocked}
                           onClick={() => setCustomSlots(prev => ({ ...prev, [cat.type]: ing }))}
                           className={`w-full p-3 text-left rounded-sm text-xs transition-all border relative overflow-hidden shadow-sm group
                             ${isSelected
                               ? 'bg-[#4a4a4a] text-[#e0e0e0] border-[#3a3a3a] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3)]' 
                               : 'bg-[#f0f0f0]/90 text-gray-700 border-transparent hover:bg-white hover:shadow-md active:shadow-inner'
                             } ${isLocked ? 'opacity-50 cursor-not-allowed bg-[#d4d4d4]' : ''}`}
                         >
                           {!isSelected && !isLocked && <GlitchBorder />}
                           <div className="flex justify-between items-start">
                              <div className="font-bold mb-1 relative z-10 tracking-wide flex items-center gap-2">
                                  {ing.name}
                                  {isLocked && <Lock size={10} className="text-gray-500" />}
                              </div>
                           </div>
                           <div className={`text-[10px] relative z-10 font-medium tracking-wider ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                               {isLocked ? "LOCKED" : ing.desc}
                           </div>
                         </button>
                       )})}
                     </div>
                   </div>
                 ))}
               </div>

               <ArchitecturalCard className="flex flex-col items-center gap-4 bg-[#e0e0e0]/90 mb-4">
                 <div className="flex gap-2 text-[10px] md:text-sm text-gray-700 relative z-10 items-center font-medium tracking-wide bg-[#d4d4d4] p-3 rounded-sm shadow-inner border border-white/40 flex-wrap justify-center w-full">
                    <span className="flex items-center gap-1"><Droplets size={10} className="text-gray-500" /> {customSlots.base?.name || "???"}</span>
                    <span className="text-gray-400 font-light">+</span>
                    <span className="flex items-center gap-1"><Plus size={10} className="text-gray-500" /> {customSlots.modifier?.name || "???"}</span>
                    <span className="text-gray-400 font-light">+</span>
                    <span className="flex items-center gap-1"><Sparkles size={10} className="text-gray-500" /> {customSlots.finish?.name || "???"}</span>
                 </div>
                 
                 <ArchitecturalButton 
                   onClick={mixCustomDrinkAI}
                   disabled={!customSlots.base || !customSlots.modifier || !customSlots.finish || isLoadingAI}
                   variant={(!customSlots.base || !customSlots.modifier || !customSlots.finish || isLoadingAI) ? "disabled" : "primary"}
                   className="w-full py-3 text-sm"
                 >
                   {isLoadingAI ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} className="opacity-80"/>}
                   {isLoadingAI ? "正在生成..." : "开始定制 SYNTHESIZE"}
                 </ArchitecturalButton>
               </ArchitecturalCard>
             </div>

             <div className="absolute bottom-6 right-6 z-50">
               <button 
                  onClick={handleCustomBack}
                  className="bg-[#d4d4d4] hover:bg-white text-gray-600 hover:text-gray-800 p-4 rounded-sm shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] border border-white/50 transition-all active:scale-95 group"
                  title="Return to Menu"
               >
                  <LogOut size={20} className="opacity-70 group-hover:opacity-100" />
               </button>
             </div>
          </div>
        </div>
      )}

      {gameState === 'dream_mixing' && (
        <div className="fixed inset-0 z-40 bg-[#d4d4d4]/95 backdrop-blur-xl flex flex-col items-center justify-start md:justify-center p-4 md:p-8 overflow-y-auto">
          <div className="w-full max-w-xl relative z-10 animate-fadeIn pb-24 mt-12 md:mt-0">
             <div className="text-center mb-8 md:mb-12">
               <h2 className="text-2xl md:text-3xl tracking-[0.3em] text-[#3a3a3a] font-bold mb-2 md:mb-4 flex items-center justify-center gap-4 drop-shadow-sm">
                 <BrainCircuit size={24} className="text-gray-500 opacity-80" strokeWidth={1.5} /> 概念特调
               </h2>
               <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.4em] font-medium pl-4">Abstract Concept Synthesis Protocol</p>
             </div>

             <ArchitecturalCard className="flex flex-col gap-4 md:gap-6 bg-[#e0e0e0]/90 mb-6 md:mb-8">
               <div className="relative z-10">
                 <textarea 
                    value={dreamPrompt}
                    onChange={(e) => setDreamPrompt(e.target.value)}
                    placeholder="输入任何概念、情感或记忆... (例如: '被遗忘的源代码', '雨夜的霓虹灯', '初恋的味道')"
                    className="w-full h-32 md:h-40 p-4 bg-[#f0f0f0] rounded-sm border border-gray-300 focus:border-gray-500 outline-none text-[#3a3a3a] resize-none font-serif tracking-wide shadow-inner text-base relative z-20"
                 />
               </div>
               
               <ArchitecturalButton 
                 onClick={handleDreamMix}
                 disabled={!dreamPrompt.trim() || isLoadingAI}
                 variant={(!dreamPrompt.trim() || isLoadingAI) ? "disabled" : "primary"}
                 className="w-full py-4 text-base"
               >
                 {isLoadingAI ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} className="opacity-80"/>}
                 {isLoadingAI ? "正在解析概念数据..." : "生成意念饮品 GENERATE"}
               </ArchitecturalButton>
             </ArchitecturalCard>

             <ArchitecturalButton 
                onClick={() => setGameState('mixing')}
                variant="secondary"
                className="mx-auto bg-[#d4d4d4] hover:bg-[#c0c0c0]"
              >
                <RotateCcw size={16} className="opacity-70" /> 返回上一级 Back
              </ArchitecturalButton>
          </div>
        </div>
      )}

      {gameState === 'shop' && (
        <div className="fixed inset-0 z-50 bg-[#d4d4d4]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-6">
          <ArchitecturalCard className="w-full h-full md:h-[85vh] md:max-w-3xl flex flex-col p-0 overflow-hidden animate-fadeInUp">
            <div className="p-4 md:p-6 border-b border-gray-300/50 flex justify-between items-center bg-[#e0e0e0]/50 relative z-10">
              <div className="flex items-center gap-2 md:gap-4">
                  <h2 className="text-sm md:text-lg tracking-[0.3em] font-bold flex items-center gap-2 md:gap-3 text-[#3a3a3a]">
                    <ShoppingCart size={18} className="text-gray-500 opacity-80" /> SYSTEM SHOP
                  </h2>
                  <div className="px-2 py-1 bg-white rounded-sm text-[10px] md:text-xs font-mono font-bold text-gray-600 border border-gray-300">
                      {dataFragments} MB
                  </div>
              </div>
              <button onClick={() => setGameState('hub')} className="p-2 md:p-3 hover:bg-gray-300/50 rounded-full transition-colors active:bg-gray-400/50">
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10 bg-[#d4d4d4]/30 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pb-24">
              {SYSTEM_SHOP.map((item) => {
                  let isPurchased = false;
                  if (item.type === 'ingredient' && item.effectId) {
                      isPurchased = unlockedIngredients.includes(item.effectId);
                  } else if (item.id === 'upgrade_emotion_parser') {
                      isPurchased = upgrades.emotionParser;
                  } else if (item.id === 'upgrade_data_miner') {
                      isPurchased = upgrades.doubleData;
                  } else if (item.id === 'upgrade_stability_anchor') {
                      isPurchased = upgrades.stabilityAnchor;
                  }

                  const canAfford = dataFragments >= item.price;

                  return (
                    <div key={item.id} className={`p-4 md:p-6 rounded-sm shadow-sm flex flex-col h-full min-h-[180px] relative border border-white/60 group transition-all ${isPurchased ? 'bg-gray-300/50 opacity-70' : 'bg-[#e5e5e5]/90 hover:shadow-md'}`}>
                      {!isPurchased && <GlitchBorder />}
                      <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#d4d4d4] rounded-sm shadow-inner text-gray-600">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-[#3a3a3a] text-xs md:text-sm tracking-wide">{item.name}</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.type}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            {isPurchased ? (
                                <span className="text-[10px] md:text-xs font-bold text-gray-500 flex items-center gap-1"><CheckCircle2 size={12}/> OWNED</span>
                            ) : (
                                <span className="text-xs md:text-sm font-mono font-bold text-[#3a3a3a]">{item.price} MB</span>
                            )}
                        </div>
                      </div>
                      
                      <p className="text-[10px] md:text-xs text-gray-600 mb-4 md:mb-6 relative z-10 leading-relaxed flex-grow">{item.desc}</p>
                      
                      <div className="mt-auto relative z-20 flex-shrink-0 pt-2">
                        <button 
                            disabled={isPurchased || !canAfford}
                            onClick={() => buyShopItem(item)}
                            className={`w-full py-3 text-xs font-bold tracking-[0.2em] rounded-sm transition-all relative overflow-hidden shadow-sm flex-shrink-0
                                ${isPurchased 
                                    ? 'bg-transparent text-gray-400 border border-gray-300 cursor-default' 
                                    : canAfford 
                                        ? 'bg-[#4a4a4a] text-white hover:bg-[#3a3a3a] shadow-md active:scale-[0.98] border border-[#3a3a3a]' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300'
                                }`}
                        >
                            {isPurchased ? "已拥有 (OWNED)" : canAfford ? "购买 (PURCHASE)" : "余额不足 (LOCKED)"}
                        </button>
                      </div>
                    </div>
                  );
              })}
            </div>
          </ArchitecturalCard>
        </div>
      )}

      {showMissionLog && (
        <div className="fixed inset-0 z-50 bg-[#d4d4d4]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-6">
          <ArchitecturalCard className="w-full max-w-lg animate-fadeInUp">
             <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300/50">
               <h2 className="text-lg md:text-xl font-bold tracking-[0.2em] flex items-center gap-3 text-[#3a3a3a]">
                  <ClipboardList size={20} className="text-gray-500"/> SYSTEM LOG
               </h2>
               <button onClick={() => setShowMissionLog(false)} className="p-2 hover:bg-gray-300/50 rounded-full transition-colors">
                  <X size={20} className="text-gray-600" />
               </button>
             </div>
             
             <div className="space-y-4">
               {activeMissions.length === 0 ? (
                 <p className="text-center text-gray-500 italic py-8">No active protocols.</p>
               ) : (
                 activeMissions.map(mission => {
                   const isComplete = mission.current >= mission.target;
                   const progress = Math.min((mission.current / mission.target) * 100, 100);
                   return (
                     <div key={mission.id} className="bg-[#e5e5e5]/50 p-4 rounded-sm border border-white/60 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-2 relative z-10">
                           <div className="flex items-center gap-3">
                              <div className="text-gray-500">{mission.icon}</div>
                              <div>
                                <h3 className="text-sm font-bold text-[#3a3a3a]">{mission.text}</h3>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Reward: {mission.reward} MB</p>
                              </div>
                           </div>
                           {mission.claimed ? (
                             <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded-sm flex items-center gap-1">
                               <CheckSquare size={10}/> CLAIMED
                             </span>
                           ) : isComplete ? (
                             <button 
                               onClick={() => claimMissionReward(mission.id)}
                               className="text-[10px] font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-sm flex items-center gap-1 shadow-sm transition-colors animate-pulse"
                             >
                               <Gift size={10}/> CLAIM
                             </button>
                           ) : (
                             <span className="text-[10px] font-bold text-gray-500 font-mono">
                               {mission.current} / {mission.target}
                             </span>
                           )}
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-300 rounded-full overflow-hidden relative z-10">
                           <div 
                             className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-gray-500'}`} 
                             style={{ width: `${progress}%` }}
                           ></div>
                        </div>
                        {!mission.claimed && <GlitchBorder />}
                     </div>
                   );
                 })
               )}
             </div>
          </ArchitecturalCard>
        </div>
      )}

    </BaseContainer>
  );
}