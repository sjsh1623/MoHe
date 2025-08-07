# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server on port 3000 with Vite and HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally  
- `npm run lint` - Run ESLint with React plugins

### Testing
No test framework is currently configured.

## Architecture

### Tech Stack
- **Frontend**: React 19.1.0 with Vite 7.0.4
- **Routing**: React Router DOM 7.7.1 with custom animated transitions
- **Animation**: Framer Motion 12.23.12 + React Transition Group 4.4.5
- **Styling**: CSS Modules with mobile-first responsive design
- **State**: React Context with localStorage persistence
- **Build Tool**: Vite with path aliasing (`@/` → `src/`)

### Project Structure
```
src/
├── components/         # Component library
│   ├── ui/            # Reusable UI primitives (buttons, inputs, layout)
│   │   └── transitions/ # AnimatedRoutes with direction-based slides
│   └── layout/        # Layout-specific components (headers, nav)
├── pages/             # Page-level route components
├── styles/            # CSS modules organized by component/page hierarchy
│   ├── components/    # Component-specific styles
│   └── pages/         # Page-specific styles
├── hooks/             # Custom React hooks (usePageTransition)
├── contexts/          # React context providers (UserPreferencesContext)
├── utils/             # Utility functions
├── assets/            # Static images and resources
└── main.jsx           # Entry point - renders AnimatedRoutes in BrowserRouter
```

### Key Patterns

**Mobile-Centric Architecture**:
- **Target Platform**: Optimized for mobile web/WebView with iOS-specific styling
- **Viewport**: Uses `100dvh` for proper mobile height handling
- **Touch Optimizations**: `touch-action: manipulation`, prevent zoom on inputs
- **Responsive**: Mobile-first with 24px→32px container padding scaling

**Advanced Routing System**:
- **File**: `src/components/ui/transitions/AnimatedRoutes.jsx`
- **Features**: Hierarchical slide transitions, scroll preservation, direction detection
- **Entry Pattern**: `main.jsx` renders `AnimatedRoutes` instead of traditional `App`
- **Animation Logic**: Route hierarchy determines slide direction (forward/backward)

**State Management**:
- **Context**: `UserPreferencesContext` with `useUserPreferences()` hook
- **Persistence**: Automatic localStorage sync for MBTI, space preferences, age range, transportation
- **Pattern**: Provider/hook pattern with error boundaries

**Component Architecture**: 
- **Separation**: JSX logic and CSS styles in separate directory trees
- **CSS Modules**: All styles use `.module.css` with `styles.className` pattern
- **Organization**: Styles mirror component structure in `src/styles/`
- **Exports**: Barrel exports (`index.js`) for clean imports
- **Variants**: Button components support variant props (`primary`, `secondary`, etc.)

**Styling Convention**:
- **Methodology**: CSS Modules with BEM-like class naming
- **Global**: Base mobile styles in `global.css`
- **Component Pattern**: 
  ```javascript
  import styles from '@/styles/components/buttons/primary-button.module.css';
  const classes = [styles.button, styles[variant], ...].filter(Boolean).join(' ');
  ```

**Application Context**: 
- **Language**: Korean UI ("MOHE 아이디로 로그인", "회원가입", "둘러보기")
- **Domain**: Appears to be personality/preference-based recommendation app
- **Features**: MBTI integration, transportation preferences, space preferences

### ESLint Configuration
- Modern flat config format with browser globals + ES2020
- Custom rule: `varsIgnorePattern: '^[A-Z_]'` (allows uppercase unused variables)
- React Hooks and React Refresh plugins for development experience