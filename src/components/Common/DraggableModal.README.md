# DraggableModal Component

A draggable modal component that displays different asset types with appropriate content sections.

## Features

- ✅ Fully draggable by header
- ✅ Absolute positioning with boundary constraints
- ✅ Support for 4 asset types: NPC, Location, POI, PLOT
- ✅ Close button with hover effects
- ✅ Scrollable content
- ✅ Bootstrap theming compatible
- ✅ Responsive design

## Usage

```tsx
import { DraggableModal } from "@/components/Common";

function MyComponent() {
    const [showModal, setShowModal] = useState(true);

    return (
        <div style={{ position: "relative", height: "100vh" }}>
            {showModal && (
                <DraggableModal
                    assetType="NPC"
                    id="Bonesaw"
                    initialX={100}
                    initialY={100}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `assetType` | `"NPC" \| "Location" \| "POI" \| "PLOT"` | Yes | - | Type of asset to display |
| `onClose` | `() => void` | Yes | - | Callback when close button is clicked |
| `id` | `string` | No | - | Optional ID to display in title |
| `title` | `string` | No | - | Optional custom title (overrides default) |
| `initialX` | `number` | No | `100` | Initial X position in pixels |
| `initialY` | `number` | No | `100` | Initial Y position in pixels |

## Asset Types

### NPC
Sections: Physical Description, Motivation, Mannerisms, DM Notes, Shared with Players

### Location
Sections: Description (Player-facing), Current Condition, Points Of Interest, Characters, DM Notes, Shared with Players

### POI
Sections: Description, Current Condition, Points Of Interest, Characters, DM Notes, Shared with Players

### PLOT
Sections: Summary, Status, Urgency, Related, Progress, Notes, Shared with Players

## Examples

### Basic NPC Modal
```tsx
<DraggableModal
    assetType="NPC"
    id="Bonesaw"
    onClose={handleClose}
/>
```
Displays: "NPC: Bonesaw"

### Location Modal with Custom Position
```tsx
<DraggableModal
    assetType="Location"
    id="Bonesaw's Lair"
    initialX={200}
    initialY={150}
    onClose={handleClose}
/>
```
Displays: "Location: Bonesaw's Lair" at (200, 150)

### PLOT Modal with Custom Title
```tsx
<DraggableModal
    assetType="PLOT"
    title="Custom Plot Title"
    onClose={handleClose}
/>
```
Displays: "Custom Plot Title"

## Styling

The component uses SCSS with Bootstrap-compatible CSS variables:
- `--bs-body-bg` - Modal background
- `--bs-border-color` - Border colors
- `--bs-light` - Header background
- `--bs-body-color` - Text color
- `--bs-danger` - Close button hover color

All styling supports light/dark themes automatically.

## Behavior

- **Dragging**: Click and hold the header to drag the modal
- **Constraints**: Modal cannot be dragged outside its parent container
- **Closing**: Click the X button in the top-right corner
- **Scrolling**: Content area scrolls if it exceeds max-height (80vh)

## Testing

The component includes 16 test cases covering:
- Rendering all asset types
- Content section validation
- Drag functionality
- Close button behavior
- Title customization
- Position initialization

Run tests with:
```bash
bun run test DraggableModal.test.tsx
```

## Notes

- Content sections currently contain placeholders
- Modal must be placed within a positioned container (relative, absolute, or fixed)
- Multiple modals can be displayed simultaneously
- Each modal manages its own drag state independently
