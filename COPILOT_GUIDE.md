# 🚀 How to Make GitHub Copilot Always Context-Aware

## ✅ Setup Completed

I've set up a comprehensive context system for your Zen Mobile project. Here's what was created:

### 1. Core Context Files

#### `.github/copilot-instructions.md` ✅

- **Purpose**: GitHub automatically reads this file
- **Contains**: Architecture rules, code patterns, design system
- **When to update**: When adding new patterns or standards

#### `TODO_PLAN.md` ✅ (Enhanced)

- **Purpose**: Master blueprint with complete product vision
- **Contains**: Phases, features, architecture, monetization
- **When to update**: After completing milestones or adding features

#### `.vscode/settings.json` ✅

- **Purpose**: VS Code configuration for Copilot
- **Contains**: Copilot enablement, TypeScript settings
- **When to update**: When changing editor preferences

#### `mobile/src/components/README.md` ✅

- **Purpose**: Component guidelines with templates
- **Contains**: Atomic design patterns, examples, tests
- **When to update**: When adding new component types

#### `mobile/src/services/README.md` ✅

- **Purpose**: Service layer guidelines
- **Contains**: Service patterns, testing, examples
- **When to update**: When creating new service categories

---

## 🎯 How to Use Copilot Effectively

### Method 1: Use @workspace in Copilot Chat

```
@workspace Create a SessionTimer component following atomic design

Context needed:
- Check /src/components/README.md for component patterns
- Use colors from TODO_PLAN.md design system
- Integrate with sessionTracker service
- Add haptic feedback
```

**Why it works**: `@workspace` searches ALL your context files

### Method 2: Reference Context Files in Prompts

```
Read /src/services/README.md and create a new service
called 'usageAnalyzer.ts' that tracks app usage patterns.

Requirements:
- Follow the service template structure
- Include full TypeScript types
- Add comprehensive JSDoc comments
- Include unit tests
- Integrate with nativeBridge.ts
```

### Method 3: Open Relevant Files Before Asking

1. Open `TODO_PLAN.md`
2. Open the specific README for context
3. Open an example file (like existing component)
4. **Then** ask Copilot

**Why**: Copilot reads open tabs as context

### Method 4: Use Inline Comments as Context

When writing code, add context comments:

```typescript
/**
 * @copilot This service should follow the SessionTrackerService pattern
 * from /src/services/README.md. It needs to:
 * - Track app usage via nativeBridge
 * - Calculate productivity scores
 * - Generate daily/weekly insights
 * - Store data in WatermelonDB
 */
export class UsageAnalyzerService {
  // Copilot will auto-complete based on context
}
```

### Method 5: Use Git Commit History

Copilot reads recent commits, so write descriptive messages:

```bash
# ❌ Bad
git commit -m "fixed stuff"

# ✅ Good
git commit -m "feat(session): Implement adaptive break recommendations

- Add intelligent break timing based on Pomodoro method
- Track user break patterns for personalization
- Integrate with haptic feedback service
- Update SessionScreen with break countdown UI

Follows Phase 3 architecture from TODO_PLAN.md"
```

---

## 🔄 Maintenance Workflow

### Daily

- [ ] Write descriptive commit messages
- [ ] Add inline context comments for complex code
- [ ] Keep relevant files open when coding

### Weekly

- [ ] Update TODO_PLAN.md with progress
- [ ] Add new patterns to component/service READMEs
- [ ] Document architectural decisions

### Monthly

- [ ] Review and enhance .github/copilot-instructions.md
- [ ] Create Architecture Decision Records (ADRs)
- [ ] Update design system documentation

---

## 📚 Context File Priority (What Copilot Reads First)

1. **`.github/copilot-instructions.md`** - Auto-loaded by GitHub
2. **Open files in editor** - Active tabs
3. **`TODO_PLAN.md`** - When using @workspace
4. **Directory READMEs** - When navigating folders
5. **Recent git commits** - Last 10-20 commits
6. **Inline comments** - JSDoc and code comments
7. **TypeScript types** - Interfaces and type definitions

---

## 💡 Pro Tips

### 1. Keep Context Files Updated

```bash
# Create a git hook to remind you
echo "📝 Don't forget to update TODO_PLAN.md!" > .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

### 2. Use Specific File Paths in Prompts

```
Create /src/components/molecules/ProgressRing.tsx following
the molecule pattern from /src/components/README.md
```

### 3. Reference Other Files

```
Create a hook /src/hooks/useSession.ts that wraps the
sessionTracker service from /src/services/sessionTracker.ts
```

### 4. Ask for Multiple Files at Once

```
Create a complete feature for app usage tracking:
1. Service: /src/services/usageAnalyzer.ts
2. Store slice: /src/store/usageSlice.ts
3. Component: /src/components/organisms/UsageChart.tsx
4. Screen: /src/screens/dashboard/UsageScreen.tsx
5. Tests for all of the above

Follow all patterns from respective READMEs.
```

### 5. Use Examples from Existing Code

```
Create a new service similar to sessionTracker.ts but for
goal management. Follow the same patterns:
- Event emitters
- Database persistence
- Error handling
- Analytics tracking
```

---

## 🎨 Context-Aware Prompting Patterns

### Pattern 1: Architecture Reference

```
I need to create [FEATURE]. According to TODO_PLAN.md Phase [X],
this should use [PATTERN]. Generate the following files:
- [FILE_1]
- [FILE_2]
Following the structure in [REFERENCE_README].
```

### Pattern 2: Style Consistency

```
Create [COMPONENT] using the exact color scheme from
TODO_PLAN.md section "Design System Rules". Use:
- True black (#000000) for background
- Zen green (#00FF88) for accent
- 8pt spacing grid
```

### Pattern 3: Integration Reference

```
Add [FEATURE] by:
1. Extending [EXISTING_SERVICE]
2. Adding to [EXISTING_SCREEN]
3. Following the pattern used in [SIMILAR_FEATURE]
```

---

## 🛠️ Advanced: Create Your Own Context System

### Create Feature-Specific Context Files

**`/src/features/session/CONTEXT.md`**

```markdown
# Session Feature Context

## Related Files

- Service: /src/services/sessionTracker.ts
- Screen: /src/screens/session/SessionScreen.tsx
- Store: /src/store/sessionSlice.ts
- Hook: /src/hooks/useSession.ts

## Key Patterns

- Sessions use event emitters for real-time updates
- All times stored in milliseconds
- Focus score calculated on 0-100 scale
- Database sync every 10 seconds

## Common Issues

- Remember to handle app backgrounding
- Clear timers on component unmount
- Validate goalMinutes > 0
```

### Create Type Definition Hubs

**`/src/types/index.ts`**

```typescript
/**
 * Central type definitions for Zen Mobile
 *
 * Import these types throughout the app for consistency.
 * Each type includes JSDoc with usage examples.
 *
 * Related: TODO_PLAN.md Section 2 (Architecture)
 */

export * from "./session";
export * from "./user";
export * from "./analytics";
export * from "./navigation";
```

---

## ✅ Verification Checklist

Test your context system is working:

### Test 1: Create a New Component

```
@workspace Create /src/components/atoms/HapticButton.tsx
```

**Expected**: Copilot should:

- Use atomic design pattern
- Include TypeScript interface
- Follow color scheme from design system
- Add accessibility labels
- Use StyleSheet.create

### Test 2: Create a New Service

```
@workspace Create /src/services/achievementTracker.ts
```

**Expected**: Copilot should:

- Extend EventEmitter (like sessionTracker)
- Include comprehensive error handling
- Have async database methods
- Include TypeScript types
- Add JSDoc comments

### Test 3: Create a Complete Feature

```
@workspace Create a feature for daily goals including:
- Service layer
- Store slice
- UI component
- Screen
```

**Expected**: Copilot should create files in correct locations following all patterns

---

## 🎯 Expected Results

With this context system, Copilot will:

1. ✅ **Generate consistent code** - Follows your architecture
2. ✅ **Use correct file structure** - Places files in right directories
3. ✅ **Apply design system** - Uses correct colors, spacing, typography
4. ✅ **Write proper TypeScript** - Includes types and interfaces
5. ✅ **Follow patterns** - Uses established patterns from examples
6. ✅ **Add tests** - Generates test files automatically
7. ✅ **Include documentation** - Adds JSDoc comments
8. ✅ **Handle errors** - Proper error handling
9. ✅ **Optimize performance** - Uses memoization where needed
10. ✅ **Maintain quality** - Production-ready code

---

## 🚀 Next Steps

1. **Start coding** - Try asking Copilot to create new features
2. **Update context** - Keep TODO_PLAN.md updated as you progress
3. **Add examples** - Add more example code to READMEs
4. **Create ADRs** - Document major architectural decisions
5. **Refine prompts** - Learn what prompts work best for you

---

## 📞 Quick Reference

**Need to create a component?**
→ Reference `/src/components/README.md`

**Need to create a service?**
→ Reference `/src/services/README.md`

**Need architecture context?**
→ Reference `TODO_PLAN.md`

**Need design system?**
→ Reference `.github/copilot-instructions.md`

**Using Copilot Chat?**
→ Start with `@workspace`

---

## 🎊 You're Ready!

Your Zen Mobile project now has a **world-class context system** for GitHub Copilot.

Every time you ask Copilot for help, it will:

- Read your architecture blueprint
- Follow your design patterns
- Use your code standards
- Generate production-ready code

**Happy coding! 🚀**
