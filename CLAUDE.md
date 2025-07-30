# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Vite and HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Testing
No test framework is currently configured.

## Architecture

### Tech Stack
- **Frontend**: React 19.1.0 with Vite 7.0.4
- **Routing**: React Router DOM 7.7.1
- **Styling**: CSS Modules for component-specific styles
- **Build Tool**: Vite with React plugin

### Project Structure
```
src/
├── components/         # Component library
│   ├── ui/            # Reusable UI primitives
│   │   ├── buttons/   # Button components
│   │   └── layout/    # Layout primitives (Stack, Container)
│   └── layout/        # Layout-specific components (headers, nav)
├── pages/             # Page-level components
│   └── auth/          # Authentication pages
├── styles/            # All CSS/SCSS files
│   ├── components/    # Component-specific styles
│   └── pages/         # Page-specific styles
├── hooks/             # Custom React hooks
├── contexts/          # React context providers
├── utils/             # Utility functions
├── assets/            # Static assets
└── main.jsx           # Application entry point
```

### Key Patterns

**Component Architecture**: 
- **Separation of Concerns**: Business logic (JSX) and styles (CSS) live in separate directories
- **CSS Modules**: All styles located in `src/styles/` with organized subfolders
- **Component Types**: 
  - `ui/` - Reusable UI primitives (buttons, layout components)
  - `layout/` - Layout-specific components (headers, navigation)
- **Path aliasing**: `@/` maps to `src/` directory
- **Index exports**: Clean imports via barrel exports

**Entry Point**: 
- Application renders `AuthPage` instead of default `App` component
- Router setup in `main.jsx` with `BrowserRouter`

**Styling Convention**:
- CSS Modules pattern: `styles.className`
- Component-specific stylesheets co-located with components

**Current State**: 
- Project appears to be in early development stage
- Auth page is the main entry point with login interface
- Korean language UI text ("MOHE 아이디로 로그인", "회원가입", "둘러보기")

### ESLint Configuration
- Uses modern ESLint flat config format
- Custom rule: allows unused variables with uppercase pattern (`varsIgnorePattern: '^[A-Z_]'`)
- React Hooks and React Refresh plugins enabled