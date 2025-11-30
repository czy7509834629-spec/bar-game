import React from 'react';

export interface Drink {
  id: string;
  name: string;
  ingredients: string[];
  desc: string;
  visualDescription?: string;
  tags?: string[];
  visual: string;
  icon?: React.ReactNode;
  abvLabel?: string;
  abvDesc?: string;
  image?: string;
}

export interface Customer {
  id: string | number;
  name: string;
  dialogue: string;
  wantedTags?: string[];
  vibe?: string;
  isAI: boolean;
  avatar?: string;
  successMsg?: string;
  failMsg?: string;
}

export interface DialogueOption {
  text: string;
  tip: number;
  reply: string;
}

export interface Inquiry {
  id: string;
  text: string;
  type: 'glitch' | 'lore' | 'personal' | 'risk';
}

export interface SessionLogEntry {
  customer: string;
  drink: string;
  score: number;
  abv: string;
  tip?: number;
}

export interface PrepItems {
  ice: boolean;
  bottles: boolean;
  garnish: boolean;
}

export interface CustomIngredient {
  id: string;
  name: string;
  desc: string;
  type: 'base' | 'modifier' | 'finish';
  price?: number;
}

export interface CustomSlots {
  base: CustomIngredient | null;
  modifier: CustomIngredient | null;
  finish: CustomIngredient | null;
}

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  type: 'ingredient' | 'upgrade';
  icon: React.ReactNode;
  effectId?: string;
}

export interface DailyMission {
    title: string;
    objectives: {
        id: number;
        text: string;
        target: number;
        type: string;
    }[];
}

export interface StorySegment {
    text: string;
    subtext: string;
    action?: string;
}

export interface Mission {
  id: string;
  text: string;
  target: number;
  current: number;
  type: 'serve_count' | 'earn_data' | 'chat_count' | 'perfect_serve' | 'tip_earn' | 'dream_mix';
  reward: number;
  claimed: boolean;
  icon?: React.ReactNode;
}