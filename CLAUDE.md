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
- **Routing**: React Router DOM 7.7.1 with AnimatedRoutes
- **Animations**: Framer Motion 12.23.12 + React Transition Group 4.4.5
- **Styling**: CSS Modules for component-specific styles
- **State Management**: React Context (UserPreferencesContext)
- **Build Tool**: Vite with React plugin

### Application Architecture

**Entry Point & Navigation**:
- Application uses `AnimatedRoutes` component instead of traditional App
- Global `UserPreferencesProvider` context wraps entire app
- Sophisticated page transition system with directional slide animations
- Route hierarchy determines animation direction (forward/backward)
- Scroll position preservation across page transitions

**User Flow**:
1. **Authentication**: Landing → Login/Signup → Email verification → Preference setup
2. **Onboarding**: Age selection → MBTI assessment → Space preferences → Transportation method
3. **Main App**: Home with recommendations → Places list → Place details → Profile

**Component System**:
```
src/components/
├── ui/                    # 50+ reusable primitives
│   ├── buttons/          # 8 button variants (Primary, Social, Back, Floating, etc.)
│   ├── cards/            # PlaceCard, ProfileCard, GridPlaceCard
│   ├── indicators/       # LocationPin, StarRating
│   ├── inputs/           # FormInput, OTPInput, Checkbox
│   ├── transitions/      # AnimatedRoutes, PageTransition
│   └── layout/           # Container, Stack, PagePreloader
└── layout/               # Page-level templates
    ├── AuthHeader        # Authentication flow header
    └── PreferencePageLayout  # Shared preference page template
```

### Key Patterns

**Component Architecture**: 
- **Separation of Concerns**: JSX components in `/components/`, CSS in `/styles/`
- **CSS Modules**: All styling uses `.module.css` with scoped classes
- **Barrel Exports**: Clean imports via `index.js` files in directories
- **PropTypes**: Complex components use PropTypes validation
- **Shared Layouts**: `PreferencePageLayout` eliminates duplication across onboarding

**State Management**:
- **UserPreferencesContext**: Manages MBTI (4-letter breakdown), age range, space preferences, transportation
- **localStorage Integration**: Automatic persistence of user selections
- **Context Provider Pattern**: Centralized state with specialized hooks

**Styling Conventions**:
- **Mobile-First**: Optimized for WebView deployment with touch interactions
- **CSS Custom Properties**: Global theming via CSS variables
- **Container Pattern**: `.container-padding` class for consistent spacing
- **Responsive Design**: Mobile (≤480px) and desktop breakpoints
- **WebView Optimizations**: `-webkit-tap-highlight-color`, `touch-action`, `user-select`

**Animation System**:
- **Framer Motion**: Page transitions with spring physics
- **Route Hierarchy**: Smart directional animations based on user flow
- **Scroll Management**: Advanced scroll position preservation
- **Exit/Enter States**: Coordinated page transition choreography

**File Organization**:
- **Co-located Styles**: `/styles/` mirrors `/components/` structure
- **Path Aliases**: `@/` mapped to `src/` directory  
- **Asset Management**: Images in `/assets/image/`
- **Korean Language**: Full Korean UI with location "용인시 보정동"

### Application Features

**Current Implementation**:
- Complete authentication flow with email verification
- MBTI personality assessment (4-dimensional breakdown)
- User preference collection (age, space type, transportation)
- Place recommendation system with bookmark functionality
- Profile management and settings
- Mobile-optimized place cards with ratings and locations

**UI Component Library**:
- 8 specialized button variants for different contexts
- Form inputs with validation and accessibility
- Card components for places, profiles, and grid layouts
- Location and rating indicator components
- Comprehensive transition and animation components

### Development Notes

**Mobile WebView Target**:
- All components optimized for mobile WebView packaging
- Touch interaction optimizations throughout
- Dynamic viewport height (`100dvh`) for mobile browsers
- Prevented zoom and improved touch response

**ESLint Configuration**:
- Modern flat config format (ESLint 9.30.1)
- Custom rule: allows unused variables with uppercase pattern (`varsIgnorePattern: '^[A-Z_]'`)
- React Hooks and React Refresh plugins enabled

**Current Status**:
- Production-ready user onboarding flow
- Sophisticated animation and transition system
- Complete preference management infrastructure
- Mobile-first responsive design implemented