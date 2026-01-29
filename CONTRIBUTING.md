# Contributing to Koda

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm test             # Run tests
npm run build        # Production build
```

## Code Style

### TypeScript
- Use strict types, avoid `any`
- Export types from `@types`
- Use path aliases (`@features`, `@shared`, etc.)

### Components
- Functional components with React.FC
- Props interface defined above component
- Extract sub-components when > 250 lines

### Styling
- Tailwind CSS only (no inline styles)
- Always include `dark:` variants
- Follow `DESIGN_STANDARDS.md` for colors

## Pull Request Checklist

- [ ] Component follows feature module pattern
- [ ] Dark mode tested and working
- [ ] No TypeScript errors (`npm run build`)
- [ ] Exports added to barrel file (`index.ts`)
- [ ] Component < 400 lines

## File Templates

### New Component
```tsx
import React from 'react';

interface ComponentProps {
    // props
}

export const Component: React.FC<ComponentProps> = ({}) => {
    return (
        <div className="bg-white dark:bg-slate-900">
            {/* content */}
        </div>
    );
};
```

### New Hook
```typescript
import { useState, useEffect } from 'react';

export function useCustomHook() {
    const [state, setState] = useState();
    
    useEffect(() => {
        // effect
    }, []);
    
    return { state };
}
```
