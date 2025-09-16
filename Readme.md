### Goal
Create a single monorepo that contains your existing frontend (FE) and backend (BE) repos, preserving git history, with a clean workspace setup and ergonomic dev/build scripts.

### Recommended structure
- `safetech/` (repo root)
  - `package.json` (workspaces + shared scripts)
  - `pnpm-workspace.yaml` or workspaces in `package.json`
  - `packages/`
    - `frontend/` (your FE, e.g., `safe-tech-ui`)
    - `backend/` (your BE, e.g., `safetech-be`)
    - `shared/` (optional: shared types/utils later)
  - `tsconfig.base.json` (optional shared TS config)
  - `.eslintrc.js` (root lint config that extends per-package)
  - `.gitignore`

Below are two safe paths. Pick ONE.

---

## Option A — Cleanest: New monorepo + git subtree (preserve history)
This preserves each repo’s history and places them into subfolders.

1) Create an empty monorepo
```powershell
# choose a new folder, outside both existing repos
mkdir safetech-mono; cd safetech-mono
git init -b main
git commit --allow-empty -m "chore: initialize monorepo"
```

2) Add FE repo as a subtree into `packages/frontend`
```powershell
git remote add fe <FE_GIT_URL>
git fetch fe
git subtree add --prefix packages/frontend fe main --squash
# If you want full history (no squash), omit --squash
```

3) Add BE repo as a subtree into `packages/backend`
```powershell
git remote add be <BE_GIT_URL>
git fetch be
git subtree add --prefix packages/backend be main --squash
```

4) Set up workspaces (pnpm recommended; npm/yarn also fine)

- Initialize root package manager files:
```powershell
# If using pnpm
pnpm init -y
```

- Root `package.json` (pnpm workspaces) minimal example:
```json
{
  "name": "safetech",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  }
}
```

- Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "packages/*"
```

5) Move each project’s package under the new folders if needed
- Ensure `packages/frontend/package.json` and `packages/backend/package.json` exist and still point to correct paths (e.g., `src`, `dist`, env files).
- Update local paths in each package (assets, env, tsconfigs).

6) Install deps at the root
```powershell
pnpm install
```

7) Setup shared tooling (optional but recommended)
- `tsconfig.base.json` at root, then each package’s `tsconfig.json` extends it.
- Root ESLint config that each package extends.
- Add `concurrently` or use pnpm recursive scripts for dev:
  - Ensure `packages/frontend/package.json` has `"dev": "vite"` or similar.
  - Ensure `packages/backend/package.json` has `"dev": "node src/index.js"` or nodemon.

8) Add convenience scripts in root `package.json`
```json
{
  "scripts": {
    "dev:fe": "pnpm --filter ./packages/frontend dev",
    "dev:be": "pnpm --filter ./packages/backend dev",
    "dev": "pnpm -r --parallel dev",
    "build:fe": "pnpm --filter ./packages/frontend build",
    "build:be": "pnpm --filter ./packages/backend build",
    "build": "pnpm -r build"
  }
}
```

9) Commit and push the monorepo
```powershell
git add .
git commit -m "chore: monorepo: add frontend and backend"
git remote add origin <NEW_MONOREPO_URL>
git push -u origin main
```

10) Future syncs from originals (if needed) with subtree
```powershell
# Pull updates from FE into monorepo
git subtree pull --prefix packages/frontend fe main --squash
# Push changes from monorepo back to FE (optional)
git subtree push --prefix packages/frontend fe main
```

---

## Option B — Start from one repo and merge the other with history
If you want the monorepo to live in, say, the current FE repo:

1) In the FE repo root, create the structure
```powershell
git checkout -b chore/monorepo
mkdir packages
git mv . packages/frontend
# Move only FE app content; keep .git folder at root
```

2) Commit the move
```powershell
git commit -m "chore: move FE into packages/frontend"
```

3) Merge BE’s history into `packages/backend`
```powershell
git remote add be <BE_GIT_URL>
git fetch be
git read-tree --prefix=packages/backend -u be/main
git commit -m "chore: import backend into packages/backend (preserve history)"
```

4) Set up workspaces and root tooling (same as steps 4–8 in Option A), then push.

---

## Workspace setup details

- Node version pinning (optional):
  - Create `.nvmrc` or `.node-version` at root to standardize Node.
- Environment files:
  - Keep `.env` files per package: `packages/frontend/.env`, `packages/backend/.env`.
- Shared code (optional later):
  - Create `packages/shared/` for common types/utils. Reference via workspace dependency:
    - In `packages/frontend/package.json`: `"@safetech/shared": "workspace:*"`
- GitHub Actions/CI:
  - Cache pnpm and node modules.
  - Run `pnpm -r lint`, `pnpm -r build`, `pnpm -r test`.
- Prettier/ESLint:
  - Root config extends per-package variations; avoid conflicting parsers.
- TypeScript:
  - Root `tsconfig.base.json`:
    ```json
    {
      "compilerOptions": {
        "target": "ES2020",
        "moduleResolution": "Bundler",
        "strict": true,
        "baseUrl": ".",
        "paths": {
          "@safetech/shared/*": ["packages/shared/*"]
        }
      }
    }
    ```
  - Each package’s `tsconfig.json`:
    ```json
    {
      "extends": "../../tsconfig.base.json",
      "compilerOptions": { "outDir": "dist" },
      "include": ["src"]
    }
    ```

---

## Commands tailored to your current folders
Given your workspace already has `safe-tech-ui` and `safetech-be` side-by-side, you can very quickly get to a monorepo without history preservation changes:

1) Convert to workspaces in-place
```powershell
# At D:\Safetech
git init -b main
pnpm init -y
```

2) Create workspace files
- `pnpm-workspace.yaml`:
```yaml
packages:
  - "safe-tech-ui"
  - "safetech-be"
```

- Root `package.json` scripts:
```json
{
  "name": "safetech",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "dev:fe": "pnpm --filter ./safe-tech-ui dev",
    "dev:be": "pnpm --filter ./safetech-be dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  }
}
```

3) Ensure each package has its own `package.json` with `name`, `version`, and `scripts.dev`
- FE: `safe-tech-ui/package.json` should have `dev` (e.g., `vite`).
- BE: `safetech-be/package.json` should have `dev` (e.g., `nodemon src/index.js`).

4) Install once at root
```powershell
pnpm install
```

5) Run both in parallel
```powershell
pnpm dev
# or
pnpm dev:fe
pnpm dev:be
```

If you want history-preserving nesting under `packages/`, use Option A/B.

---

## Deployment notes
- Keep FE and BE deploys independent (CI filters by path):
  - FE jobs run only on changes under `packages/frontend/**` or `safe-tech-ui/**`.
  - BE jobs run only on changes under `packages/backend/**` or `safetech-be/**`.
- Add `engines` in each `package.json` to pin Node versions per service if needed.

---

## Common pitfalls
- Broken relative imports after moving directories: search-and-update asset and env paths.
- Duplicate lockfiles: keep only one lockfile at root when using workspaces.
- Mixed package managers: stick to pnpm or npm/yarn consistently.
- Environment variable collisions: keep `.env` per package; do not share accidentally.

If you tell me which option you prefer (quick in-place workspaces vs. full history-preserving monorepo), I can generate the exact commands and minimal file edits for your current `D:\Safetech` state.