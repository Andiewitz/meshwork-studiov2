# Contributing

## Branch Strategy

- `main` — production-ready code, protected, requires PR
- `develop` — integration branch
- `feat/*` — feature branches off `develop`
- `fix/*` — bugfix branches off `develop`
- `release/*` — release candidate branches off `develop`
- `hotfix/*` — urgent fixes off `main`

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add canvas zoom gesture
fix: resolve auth token expiry race
chore: bump dependencies
ci: add E2E test job
docs: update API reference
```

## PR Workflow

1. Create a feature/fix branch from `develop`
2. Make changes, keeping commits atomic
3. Run `npm run check && npm run lint && npm run test:run`
4. Open a PR against `develop`
5. Ensure all CI checks pass
6. Request review

## Development

```bash
npm install
npm run dev        # starts dev server with HMR
npm run check      # TypeScript type checking
npm run lint       # ESLint
npm run format     # Prettier
npm run test:run   # Vitest
npm run test:e2e   # Playwright
```
