# Testing Best Practices Skill

This skill provides guidance for writing tests in the Oracle Engine UI project.

## Testing Framework

- **Vitest** for test runner (not Jest)
- **React Testing Library** for component testing
- **jsdom** environment for DOM simulation

## Test File Structure

```typescript
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "../../test-utils";

describe("ComponentName", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    // Tests organized by feature/behavior
    describe("feature name", () => {
        test("should do something specific", () => {
            // Arrange, Act, Assert
        });
    });
});
```

## DRY Patterns with test.each

Use `test.each` for repetitive tests with similar patterns. This reduces duplication and makes tests easier to maintain.

### Array format (simple cases)
```typescript
test.each([
    ["Plot", RecordType.Plot],
    ["NPC", RecordType.Npc],
    ["Location", RecordType.Location],
])("should recognize %s asset type", (typeName, expectedType) => {
    render(<AssetLink href={`${typeName}:${validId}`}>Link</AssetLink>);
    fireEvent.click(screen.getByText("Link"));
    expect(mockOpenModal).toHaveBeenCalledWith(expectedType, validId, "Link");
});
```

### Object format (complex cases with named parameters)
```typescript
test.each([
    { position: "first", index: 0, expected: ["z", "b", "c"] },
    { position: "middle", index: 1, expected: ["a", "z", "c"] },
    { position: "last", index: 2, expected: ["a", "b", "z"] },
])("should update $position element at index $index", ({ index, expected }) => {
    const { result } = renderHook(() => useArray(["a", "b", "c"]));
    act(() => result.current.update(index, "z"));
    expect(result.current.array).toEqual(expected);
});
```

### Form field onChange tests
```typescript
test.each([
    ["name", "Enter name", "New Name"],
    ["description", "Enter description", "New Description"],
])("should call onChange when %s changes", (fieldName, placeholder, value) => {
    const mockOnChange = vi.fn();
    render(<Form formData={defaultData} onChange={mockOnChange} />);
    fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
    expect(mockOnChange).toHaveBeenCalledWith(fieldName, value);
});
```

## Mock Patterns

### Context mocks (top of file)
```typescript
vi.mock("../../contexts", () => ({
    useContextName: vi.fn(),
}));

// Type-safe mock access
const mockUseContext = vi.mocked(useContextName);

// In beforeEach:
mockUseContext.mockReturnValue({ /* mock return value */ });
```

### Module mocks with partial overrides
```typescript
vi.mock("@graphql", async () => {
    const actual = await vi.importActual("@graphql");
    return { ...actual, specificFunction: vi.fn() };
});
```

### Apollo GraphQL mocks
```typescript
import { MockedProvider } from "@apollo/client/testing";

const mocks = [
    {
        request: {
            query: QueryDocument,
            variables: { input: { id: "123" } },
        },
        result: {
            data: { queryName: { /* result data */ } },
        },
    },
];

render(
    <MockedProvider mocks={mocks}>
        <Component />
    </MockedProvider>
);
```

## Console Suppression

### Global suppression (setupTests.ts)
Expected console output is automatically suppressed via patterns in `setupTests.ts`. Add new patterns there for expected warnings.

### Per-test suppression
Use the utility from `test-utils/consoleUtils.ts` when testing code that intentionally logs:

```typescript
import { suppressConsole } from "../../test-utils/consoleUtils";

test("should handle error gracefully", () => {
    const { spy, restore } = suppressConsole("error");

    triggerError();

    expect(spy).toHaveBeenCalledWith(expect.stringContaining("error"));
    restore();
});
```

### Async suppression
```typescript
import { withSuppressedConsole } from "../../test-utils/consoleUtils";

test("should handle async errors", async () => {
    await withSuppressedConsole(["error", "warn"], async () => {
        await triggerAsyncError();
    });
});
```

## Mock Cleanup Best Practices

| Method | Purpose | When to Use |
|--------|---------|-------------|
| `vi.clearAllMocks()` | Clears call history, keeps implementations | `beforeEach` - always |
| `cleanup()` | Unmounts React components | `afterEach` - always |
| `vi.resetAllMocks()` | Clears + resets to `vi.fn()` | When implementations change per test |
| `vi.restoreAllMocks()` | Restores original implementations | `afterAll` when using `spyOn` |

### Standard cleanup pattern
```typescript
beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    cleanup();
});
```

### When spying on real implementations
```typescript
afterAll(() => {
    vi.restoreAllMocks();
});
```

## Custom Render

Always use the custom render from test-utils (not @testing-library/react directly):

```typescript
import { render, screen } from "../../test-utils";
```

This automatically wraps components in:
- `ToasterProvider`
- `MemoryRouter` (with v7 future flags to prevent warnings)

### With initial route
```typescript
render(<Component />, { initialEntries: ["/dashboard"] });
```

## Async Testing

```typescript
test("should load data", async () => {
    render(<Component />);

    await waitFor(() => {
        expect(screen.getByText("Loaded")).toBeInTheDocument();
    });
});
```

## Common Assertions

```typescript
// Element presence
expect(screen.getByText("text")).toBeInTheDocument();
expect(screen.queryByText("text")).not.toBeInTheDocument();

// Form elements
expect(input).toHaveValue("value");
expect(input).toBeDisabled();
expect(input).toBeInvalid();

// Styles and classes
expect(element).toHaveClass("class-name");
expect(element).toHaveStyle({ color: "red" });

// Attributes
expect(link).toHaveAttribute("href", "/path");
expect(button).toHaveAttribute("disabled");
```

## Running Tests

```bash
bun run test           # Run all tests once
bun run test -- --watch   # Watch mode
bun run test -- --ui      # Vitest UI
bun run test -- path/to/file.test.tsx  # Run specific file
```

## Anti-Patterns to Avoid

1. **Don't create mocks inside tests** - Define at describe level and clear in beforeEach
2. **Don't skip cleanup** - Always use `cleanup()` in afterEach
3. **Don't duplicate test logic** - Use `test.each` for variations
4. **Don't test implementation details** - Test behavior, not internal state
5. **Don't leave console noise** - Suppress expected output or fix the source
6. **Don't use BrowserRouter in tests** - MemoryRouter is already set up in test-utils
