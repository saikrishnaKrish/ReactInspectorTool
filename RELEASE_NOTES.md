# React Inspector Pro v2.7.0 Release Notes

**Release Date:** March 3, 2026

## 🎉 Overview

This major release introduces a **revolutionary MUI (Material-UI) component detection system** and **intelligent framework component filtering**, making React Inspector Pro the most comprehensive component inspection tool for enterprise React applications.

---

## ✨ Major Features

### 1. **Intelligent MUI Component Detection** 🧠
- Detects **100+ Material-UI components** automatically
- **8-signal pattern-based detection** system that works without hardcoding:
  - Signal 1: Direct MUI props (`sx`, `classes`)
  - Signal 2: MUI classNames pattern matching
  - Signal 3: DisplayName pattern detection (Mui* prefix)
  - Signal 4: HOC wrapper patterns (Styled, ForwardRef, Memo)
  - Signal 5: Known component names
  - Signal 6: Parent fiber chain analysis
  - Signal 7: Prototype chain analysis (Material-UI/Emotion detection)
  - Signal 8: Common component naming patterns
- **Automatic compound component detection:** CardContent, ListItemText, TableCell, AccordionSummary, etc.
- **Context component filtering:** Automatically removes FormControlContext, CardContext, GridContext, ModalContext, etc.

### 2. **Smart Hierarchy Display with Visual Distinction** 🎨
- **Full component tree** showing both app components and MUI wrappers
- **Visual badges** distinguish component types:
  - App Components: Bold, full color, no badge
  - MUI Components: Dimmed, 60% opacity, 📦 badge
- **Cleaner hierarchy** by filtering out internal framework wrappers
- **Breadcrumb navigation** style display with smooth visual hierarchy

### 3. **Framework Component Filtering** 🚀
Automatically filters and removes:
- **React Router:** Router, BrowserRouter, Route, Routes, Location, Navigate, Outlet, Link, NavLink
- **Redux:** Provider, Connect, Redux, Store
- **Apollo GraphQL:** ApolloProvider, Query, Mutation, Subscription
- **React Query:** QueryClientProvider, Hydrate
- **Auth Providers:** AuthProvider, ProtectedRoute, PrivateRoute, PublicRoute
- **Generic Providers:** Wrapper, Consumer patterns

### 4. **Compound Component Support** 📚
Full detection and proper handling of 100+ compound components including:
- Card: CardContent, CardHeader, CardActions, CardMedia
- List: ListItem, ListItemText, ListItemAvatar, ListItemButton
- Table: TableCell, TableRow, TableHead, TableBody
- Accordion: AccordionSummary, AccordionDetails, AccordionActions
- And many more...

### 5. **Production-Grade Architecture** 🏗️
- **Scalable detection system** - no need to update component lists manually
- **Multiple fallback strategies** for robust detection
- **Error handling** throughout detection pipeline
- **Performance optimized** with early returns and efficient pattern matching
- **Future-proof** - automatically detects new MUI components without code updates

---

## 🔧 Technical Improvements

### Enhanced Component Detection

**Before:**
```
Showing: <ButtonBase />, <InputBase />, <Box />
(MUI internal components treated as app components)
```

**After:**
```
App > Navigation > Search > InputBase 📦
(Shows app component "Search" with MUI wrapper "InputBase 📦" marked)
```

### Context Filtering

**Before:**
```
Hierarchy: FormControlContext > GridContext > CardContext > App > Grid > Card
(Context wrappers polluting the hierarchy)
```

**After:**
```
Hierarchy: App > Grid 📦 > Card 📦
(Clean hierarchy showing only meaningful components)
```

### Framework Component Filtering

**Before:**
```
Hierarchy: BrowserRouter > Router > Routes > Route > Location > App > Dashboard
(Framework routing components cluttering the tree)
```

**After:**
```
Hierarchy: App > Dashboard
(Only app components shown, framework internals filtered)
```

---

## 📊 What's Detected

### MUI Components (100+)
- Layout: Box, Container, Paper, Card, Grid, Stack
- Forms: TextField, Select, Checkbox, Radio, Switch, Rating, Slider
- Buttons: Button, IconButton, Fab, ButtonGroup
- Navigation: Tabs, Stepper, Breadcrumbs, Pagination
- Data Display: Table, List, Chip, Avatar, Badge
- Feedback: Alert, Snackbar, CircularProgress, Skeleton
- Compound: CardContent, ListItemText, TableCell, and many more

### Framework Components
- React Router (15+ routing components)
- Redux (Provider, Connect patterns)
- Apollo GraphQL (Provider, Query, Mutation)
- React Query (QueryClientProvider)
- Auth (AuthProvider, ProtectedRoute patterns)
- Generic (Provider, Consumer, Wrapper patterns)

---

## 🚀 Performance Impact

- **Zero impact** on page load (runs on-demand)
- **Efficient detection** using Set-based O(1) lookups
- **Early return** optimization in detection functions
- **Memoized patterns** for regex matching
- **No DOM manipulations** for inspections

---

## 📝 Examples

### Example 1: MUI Button Component
```jsx
import { Button } from '@mui/material';

export function MyComponent() {
  return <Button variant="contained">Click Me</Button>;
}
```

**Inspector Output:**
```
Component: <MyComponent />
Hierarchy: App > Container > MyComponent
           Button 📦 > ButtonBase 📦
```

### Example 2: React Router Application
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Inspector Output (hovering on Home):**
```
Component: <Home />
Hierarchy: App > Home
(Router, Routes, Route automatically filtered)
```

---

## 🐛 Bug Fixes

- Fixed MUI compound component names being shown as app components
- Fixed context wrappers polluting hierarchy display
- Fixed framework routing components showing in component tree
- Fixed "Anonymous" component names in hierarchy
- Fixed wrapper component names cluttering display

---

## 📦 File Changes

### Core Logic
- `inject.js`:
  - Added `isFrameworkComponent()` function with advanced detection
  - Enhanced `isMuiComponent()` with 8 detection signals
  - Added `getFullHierarchy()` for rich hierarchy data
  - Updated hierarchy filtering to remove framework components
  - Added visual distinction for MUI vs App components

### Configuration Files
- Updated `KNOWN_MUI_COMPONENTS` to 100+ components
- Added framework component names filter
- Added MUI context names filter

### Documentation
- `CHANGELOG.md`: Added v2.7.0 release notes
- `manifest.json`: Bumped version to 2.7.0
- `package.json`: Bumped version to 2.7.0

---

## 🔄 Backward Compatibility

✅ **Fully backward compatible** - All previous functionality preserved:
- Props/State inspection
- JSX Export
- Computed Styles
- Box Model visualization
- Global Search
- Color Picker
- Dark/Light Theme
- Class Toggling

---

## 💬 Feedback & Support

For issues, suggestions, or feedback:
- GitHub Issues: Report bugs or feature requests
- GitHub Discussions: General questions and discussions
- Pull Requests: Contributions welcome!

---

## 📄 License

MIT License - Copyright © 2026 Sai Krishna Kanteti

---

**Happy inspecting! 🔍✨**
