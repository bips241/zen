# Component Library - Zen Mobile

## 🎨 Atomic Design Structure

### Atoms (Basic Building Blocks)

Location: `/src/components/atoms/`

**Guidelines:**

- Single responsibility
- No business logic
- Highly reusable
- Pure presentation

**Examples:**

- `Button.tsx` - Touchable button with variants
- `Text.tsx` - Styled text component
- `Icon.tsx` - Icon wrapper
- `Input.tsx` - Text input field
- `Spacer.tsx` - Spacing component
- `Divider.tsx` - Visual separator
- `Avatar.tsx` - User avatar

### Molecules (Simple Compositions)

Location: `/src/components/molecules/`

**Guidelines:**

- Combine 2-5 atoms
- Single purpose
- Minimal internal state
- Reusable across screens

**Examples:**

- `Card.tsx` - Container with shadow/border
- `StatCard.tsx` - Stat display (label + value)
- `ProgressBar.tsx` - Progress indicator
- `ProgressRing.tsx` - Circular progress
- `AppIcon.tsx` - App icon with badge
- `InputField.tsx` - Input with label + error
- `ActionButton.tsx` - Button with icon + label

### Organisms (Complex Components)

Location: `/src/components/organisms/`

**Guidelines:**

- Complex UI sections
- May have internal state
- Screen-specific functionality
- Compose atoms + molecules

**Examples:**

- `SessionTimer.tsx` - Live timer with controls
- `AppBlockList.tsx` - Scrollable blocked apps
- `InsightCard.tsx` - Analytics card with chart
- `GoalTracker.tsx` - Goal progress tracker
- `NotificationCard.tsx` - Notification preview
- `SettingsSection.tsx` - Settings group

## 📝 Component Template

```typescript
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, spacing, typography } from "@/theme";

/**
 * Button component with multiple variants
 *
 * @example
 * <Button
 *   label="Start Session"
 *   onPress={handleStart}
 *   variant="primary"
 *   disabled={isLoading}
 * />
 */

interface ButtonProps {
  /** Button label text */
  label: string;
  /** Press handler */
  onPress: () => void;
  /** Visual variant */
  variant?: "primary" | "secondary" | "ghost";
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Custom style override */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

export default function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  style,
  testID,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
      testID={testID}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.gray[800],
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  ghost: {
    backgroundColor: "transparent",
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.body,
    fontWeight: "600",
  },
  primaryLabel: {
    color: colors.black,
  },
  secondaryLabel: {
    color: colors.white,
  },
  ghostLabel: {
    color: colors.accent,
  },
});
```

## 🎯 Component Checklist

When creating a new component, ensure:

- [ ] TypeScript interface for props
- [ ] JSDoc comments with @example
- [ ] Default props where applicable
- [ ] Proper prop destructuring
- [ ] StyleSheet.create for styles
- [ ] Accessibility labels
- [ ] testID for testing
- [ ] Memoization if needed (React.memo)
- [ ] Error boundaries for complex components
- [ ] Responsive to theme changes

## 🚀 Performance Tips

1. **Use React.memo** for expensive components
2. **Avoid inline functions** in props
3. **Use useCallback** for event handlers
4. **Optimize FlatList** with proper keyExtractor
5. **Lazy load** heavy components
6. **Monitor renders** with React DevTools

## 🧪 Testing

```typescript
// Button.test.tsx
import { render, fireEvent } from "@testing-library/react-native";
import Button from "./Button";

describe("Button", () => {
  it("renders correctly", () => {
    const { getByText } = render(<Button label="Test" onPress={() => {}} />);
    expect(getByText("Test")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<Button label="Test" onPress={mockOnPress} />);
    fireEvent.press(getByText("Test"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button label="Test" onPress={mockOnPress} disabled />
    );
    fireEvent.press(getByText("Test"));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
```

## 📚 Related Files

- Theme: `/src/theme/`
- Types: `/src/types/components.ts`
- Hooks: `/src/hooks/`
- Storybook: `/storybook/stories/`
