# Layout Update Documentation

## Overview

This document describes the major layout restructuring implemented to match the new design mockups.

## Previous Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header (Oracle-Engine + Theme Toggle)              │
├─────────────┬───────────────────────────────────────┤
│             │                                       │
│ Left Panel  │  Main Panel                          │
│             │                                       │
│ - New Chat  │  - Chat Title                        │
│ - Thread 1  │  - Messages                          │
│ - Thread 2  │  - Message Input                     │
│ - Thread 3  │                                       │
│   ...       │                                       │
│             │                                       │
│ HealthCheck │                                       │
└─────────────┴───────────────────────────────────────┘
```

## New Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header                                              │
│ [☰] Oracle-Engine - Chat Name    [Theme Toggle]    │
├─────────────────┬───┬───────────────────────────────┤
│                 │ │ │                               │
│ Chat Panel      │ ║ │  Display Area                 │
│                 │ │ │  (Relatively Positioned)      │
│ - Messages      │ ║ │                               │
│   (Scrollable)  │ │ │  For draggable modals         │
│                 │ ║ │                               │
│ ─────────────── │ │ │                               │
│ Message Input   │ ║ │                               │
│ ─────────────── │ │ │                               │
│ HealthCheck     │ ║ │                               │
└─────────────────┴─│─┴───────────────────────────────┘
                    │
              Draggable Divider
```

### Flyout Menu (Offcanvas)

```
┌────────────────┐
│ Chat History  ×│
├────────────────┤
│                │
│ [+ New Chat]   │
│                │
│ ─────────────  │
│                │
│ • Chat 1       │
│ • Chat 2       │
│ • Chat 3       │
│   ...          │
│                │
└────────────────┘
```

## Component Changes

### New Components

#### 1. ChatHistoryFlyout

- **Location**: `src/components/Layout/ChatHistoryFlyout.tsx`
- **Purpose**: Bootstrap Offcanvas sidebar for thread selection
- **Features**:
    - Opens from left side when hamburger menu clicked
    - Contains "New Chat" button at top
    - Displays list of all threads
    - Clicking a thread selects it and closes the flyout
    - Uses ThreadItem component with custom onSelect callback

#### 2. ChatPanel

- **Location**: `src/components/Layout/ChatPanel.tsx`
- **Purpose**: Left panel containing the active chat
- **Structure**:
    - Top section: Scrollable message list (flex-direction: column-reverse)
    - Bottom section: Fixed message input
    - Footer: HealthCheck component
- **Features**:
    - Messages scroll independently of the page
    - Input always visible at bottom
    - Empty state for new chats

#### 3. ResizablePanel

- **Location**: `src/components/Common/ResizablePanel.tsx`
- **Purpose**: Container with draggable vertical divider
- **Props**:
    - `leftPanel`: Content for left side (ChatPanel)
    - `children`: Content for right side (Display Area)
    - `defaultWidth`: Initial left panel width (default: 400px)
    - `minWidth`: Minimum width (default: 300px)
    - `maxWidth`: Maximum width (default: 800px)
- **Features**:
    - Draggable divider with visual feedback
    - Cursor changes to col-resize on hover
    - Smooth dragging with constraints

### Updated Components

#### 1. Header

- **Changes**:
    - Added hamburger menu button (FontAwesome bars icon)
    - Displays current chat name below "Oracle-Engine" title
    - Integrated ChatHistoryFlyout component
    - Shows/hides flyout based on state

#### 2. Layout

- **Changes**:
    - Removed LeftPanel from content area
    - Added ResizablePanel wrapper
    - Left side: ChatPanel with HealthCheck footer
    - Right side: Main component (display area)
    - Simplified grid structure

#### 3. Main

- **Changes**:
    - Removed all chat-related functionality
    - Now just a relatively-positioned container
    - Ready for draggable modals/components
    - Simplified from complex grid to simple container

#### 4. ThreadItem

- **Changes**:
    - Added optional `onSelect` prop
    - If provided, calls onSelect instead of directly calling selectThread
    - Allows custom behavior when used in flyout

### Deprecated Components

#### LeftPanel

- **Status**: Still exists but no longer used in Layout
- **Note**: Could be removed in future cleanup, but kept for now

#### EmptyChat

- **Status**: Still exists but logic moved to ChatPanel
- **Note**: Empty state now integrated into ChatPanel

## CSS Changes

### Layout.scss

- Removed fixed grid columns for left/right panels
- Content container now just wraps ResizablePanel
- Added chat-panel-container styling for footer

### ChatPanel.scss

- Flexbox layout: column direction
- Messages area: flex: 1, overflow-y: auto, flex-direction: column-reverse
- Input area: flex-shrink: 0, fixed at bottom
- Border between input and messages

### ResizablePanel.scss

- Flex container with three parts: left, divider, right
- Left panel: fixed width, overflow hidden
- Divider: 4px, cursor: col-resize, hover effects
- Right panel: flex: 1, relatively positioned

## Data Flow Changes

### Thread Selection

1. User clicks hamburger menu in header
2. ChatHistoryFlyout opens (Offcanvas from left)
3. User clicks thread in flyout OR clicks "New Chat"
4. ThreadItem's onSelect callback fires
5. Flyout calls selectThread() from context
6. Flyout closes
7. ChatPanel updates to show selected thread

### Session Storage

- Changed from `useLocalStorage` to `useSessionStorage`
- ThreadId stored with key: "selectedThreadId"
- Persists within browser session
- Cleared when browser tab closed

### Message Scrolling

- Messages rendered in column-reverse order
- New messages appear at bottom
- Scroll container has independent scrollbar
- Auto-scrolls to show latest messages

## Acceptance Criteria Status

- ✅ Chat Selection moved to a history flyout menu
- ✅ Left Nav is the currently selected chat, or an empty chat
- ✅ Flyout menu includes the option to start a new chat
- ✅ Currently selected chat name and menu is available in the header
- ✅ When a message is sent, the threadId is properly stored in session storage
- ✅ Message input is always at the bottom of the left nav
- ✅ The Chat messages scroll independently of the rest of the page
- ✅ Draggable vertical bar separates chat from display area
- ✅ Display area is relatively positioned for draggable modals

## Testing Notes

Full testing requires:

1. Firebase authentication configured
2. GraphQL server running at localhost:4000
3. Valid user session

For development without backend:

- A stub `generated.ts` file is created (gitignored)
- Provides TypeScript types and stub hooks
- Allows UI development without GraphQL server

## Future Enhancements

1. Persist resizable panel width in session storage
2. Add keyboard shortcuts for opening flyout (e.g., Ctrl+K)
3. Add animation transitions for flyout
4. Implement drag-and-drop for modals in display area
5. Add resize handle visual indicator
6. Mobile responsive adjustments for smaller screens
