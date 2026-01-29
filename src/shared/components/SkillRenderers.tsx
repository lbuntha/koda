import React from 'react';
import { DefaultRenderer, SkillRendererProps } from './renderers/DefaultRenderer';
import { VisualCounterRenderer } from './renderers/VisualCounterRenderer';
import { VerticalMathRenderer } from './renderers/VerticalMathRenderer';
import { NumpadMathRenderer } from './renderers/NumpadMathRenderer';

export type { SkillRendererProps };

// ----------------------------------------------------------------------
// Renderer Factory
// ----------------------------------------------------------------------

export const FlashCardRenderer: React.FC<SkillRendererProps> = (props) => <DefaultRenderer {...props} />;

export const getSkillRenderer = (layoutId?: string) => {
  switch (layoutId) {
    case 'visual-counter': return VisualCounterRenderer;
    case 'vertical-math': return VerticalMathRenderer;
    case 'numpad-math': return NumpadMathRenderer;
    case 'flash-card': return FlashCardRenderer;
    default: return DefaultRenderer;
  }
};
