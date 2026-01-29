
import { Box, Calculator, Type, LayoutTemplate } from 'lucide-react';

export interface ComponentLayoutDef {
  id: string;
  label: string;
  description: string;
  icon?: any;
}

// This Registry acts as the "Source of Truth" for available component engines.
// Scaling the platform means adding new definitions here (and a corresponding Renderer).
export const COMPONENT_LAYOUTS: ComponentLayoutDef[] = [
  { 
    id: 'default', 
    label: 'Standard Quiz', 
    description: 'Text-based multiple choice, fill-in, or true/false questions.',
    icon: Type
  },
  { 
    id: 'visual-counter', 
    label: 'Visual Counter', 
    description: 'Automatically detects emojis in question text and renders them as large, interactive counters.',
    icon: Box
  },
  { 
    id: 'vertical-math', 
    label: 'Vertical Math', 
    description: 'Aligns equations vertically (e.g., XtraMath style) and provides a specialized numeric keypad.',
    icon: Calculator
  },
  // Future scaling examples:
  // { id: 'drag-drop', label: 'Drag & Drop', ... }
  // { id: 'graphing', label: 'Interactive Graph', ... }
];

export const getLayoutDef = (id: string) => COMPONENT_LAYOUTS.find(l => l.id === id) || COMPONENT_LAYOUTS[0];
