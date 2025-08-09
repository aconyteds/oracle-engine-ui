# Oracle Engine UI

Oracle Engine UI is a React + TypeScript + Vite web application that provides a chat interface for interacting with AI models. The application uses GraphQL with Apollo Client for API communication, Firebase for hosting and authentication, and Bootstrap with custom SCSS theming.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites and Setup

- Install Bun package manager: `curl -fsSL https://bun.sh/install | bash && export PATH="$HOME/.bun/bin:$PATH"`
- Install Firebase CLI globally: `bun add -g firebase-tools`
- Install dependencies: `bun install` -- takes ~2 minutes. Uses postinstall hooks for Husky git hooks.

### Building and Testing

- **CRITICAL**: GraphQL code generation requires a running GraphQL server at localhost:4000. If the server is not available, `bun run codegen` will fail with connection refused errors. This is expected behavior when working on frontend-only changes.
- Build the application: `bun run build` -- takes ~11 seconds. NEVER CANCEL builds.
- Run tests: `bun run test` -- takes ~3 seconds. Uses Vitest with jsdom environment.
- Lint code: `bun run lint` -- takes ~3 seconds. Uses ESLint + Prettier. Warnings are acceptable.
- Format code: `bun run format` -- takes ~1 second. Uses Prettier.

### Development Workflow

- Start development server: `bun run dev` -- starts Vite dev server on http://localhost:5173
- Start production preview with Firebase emulator: `bun run start` -- builds first (prestart hook), then serves on http://127.0.0.1:5000
- **VALIDATION REQUIREMENT**: After making changes, always test the application by navigating to the running dev server and verifying the login screen displays correctly at http://localhost:5173/login

### GraphQL Integration

- GraphQL schema definition files are in `src/graphql/*.graphql`
- Generated TypeScript types go in `src/graphql/generated.ts` (created by `bun run codegen`)
- The application expects these environment variables:
    - `VITE_API_URL`: GraphQL HTTP endpoint (default: http://localhost:4000/graphql)
    - `VITE_WS_URL`: GraphQL WebSocket endpoint for subscriptions
    - `VITE_ALLOW_REGISTRATION`: Controls if registration UI is shown
- Apollo Client configuration in `src/apolloClient.ts` handles authentication tokens and WebSocket subscriptions

## Validation

- **MANDATORY**: Always test changes by running the development server and verifying the application loads correctly
- The application should display "Welcome to Oracle-Engine" login screen with Google sign-in button
- **CRITICAL**: Always run `bun run lint` before committing changes or the CI build will show warnings
- **CRITICAL**: Always run `bun run format` to maintain code consistency
- The pre-commit hook automatically runs `bunx lint-staged` to format staged files
- Test the build process with `bun run build` to ensure TypeScript compilation succeeds

## Common Tasks

### Adding New Components

- Place React components in appropriate subdirectories under `src/components/`
- Export components through `index.tsx` files for clean imports
- Use existing patterns: TypeScript, React hooks, styled-components, Bootstrap classes
- Always create corresponding test files (`.test.tsx`) following existing patterns

### GraphQL Operations

- Add new GraphQL operations to appropriate `.graphql` files in `src/graphql/`
- Run `bun run codegen` after adding GraphQL operations (requires running GraphQL server)
- Import generated hooks from `@graphql` alias (configured in vite.config.ts)
- Use Apollo Client hooks: `useQuery`, `useMutation`, `useSubscription`, `useLazyQuery`

### Styling and Theming

- Main stylesheet: `src/theme/main.scss` imports Bootstrap and custom theme
- Custom Bootstrap theme in `src/theme/Sketchy/` directory
- Component-specific styles using SCSS modules (e.g., `Component.scss`)
- Uses Bootstrap 5.3.5 with custom variables and utilities

### Context and State Management

- User authentication context: `src/contexts/User.context.tsx`
- Thread/chat management: `src/contexts/Threads.context.tsx`
- Toast notifications: `src/contexts/Toaster.context.tsx`
- Custom hooks in `src/hooks/` for reusable logic

## Repository Structure

```
src/
├── components/          # React components organized by feature
│   ├── Common/         # Reusable UI components
│   ├── CreateMessage/  # Message input components
│   ├── HealthCheck/    # Connection status monitoring
│   ├── Layout/         # App layout and navigation
│   ├── Login/          # Authentication components
│   ├── Messages/       # Chat message display components
│   └── Router/         # Route protection and navigation
├── contexts/           # React Context providers for global state
├── graphql/           # GraphQL operation definitions and generated types
├── hooks/             # Custom React hooks
├── theme/             # SCSS stylesheets and Bootstrap customization
└── test-utils/        # Testing utilities and setup
```

### Key Files

- `package.json`: Scripts and dependencies (uses Bun as package manager)
- `vite.config.ts`: Build configuration with path aliases
- `vitest.config.ts`: Test configuration
- `eslint.config.js`: Linting rules with Prettier integration
- `firebase.json`: Firebase hosting configuration (serves from `dist/`)
- `codegen.ts`: GraphQL code generation configuration
- `.husky/pre-commit`: Runs lint-staged on commit

## CI/CD Pipeline

The GitHub Actions workflows (.github/workflows/) handle:

1. Install Bun and dependencies with `bun install`
2. Run GraphQL code generation with `bun run codegen`
3. Run tests with `bun run test`
4. Build application with `bun run build`
5. Deploy to Firebase hosting (merge) or create preview (pull request)

Environment variables required for CI:

- `VITE_API_URL`, `VITE_WS_URL`, `VITE_ALLOW_REGISTRATION`
- `FIREBASE_SERVICE_ACCOUNT_ORACLE_ENGINE_7DFA6`

## Development Notes

- Uses Bun instead of npm/yarn for faster package management
- TypeScript strict mode enabled with path aliases (`@graphql`, `@hooks`, `@context`)
- Prettier configuration: 4-space tabs, semicolons, double quotes
- ESLint ignores generated files (`**/generated.ts`, `**/*.generated.ts`)
- Firebase project: `oracle-engine-7dfa6`
- Supports both development (`bun run dev`) and production (`bun run start`) modes
