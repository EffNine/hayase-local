# Hayase-lite — Agent / Dev Environment Notes

Personal torrent streaming app monorepo (pnpm workspaces).

## Packages

| Package | Path | Role |
|---------|------|------|
| `ui` | `interface-master` | SvelteKit + Vite UI (port **7344**) |
| `hayase-lite` | `electron-main` | Electron shell (`electron-vite`) |
| `native` | `native-main` | Shared IPC / native schema types |
| `torrent-client` | `torrent-client-main` | WebTorrent client used by Electron |

## Prerequisites

- Node.js 22+
- pnpm `10.28.1` (see root `packageManager`)
- Linux/macOS with a display for the Electron window (headless cloud VMs need `DISPLAY`)

## Setup

```sh
corepack enable
corepack prepare pnpm@10.28.1 --activate
pnpm install
```

`pnpm-workspace.yaml` uses `onlyBuiltDependencies`. **`electron` must be listed there** so its postinstall downloads the binary. If you see `Error: Electron uninstall` from `electron-vite`, run:

```sh
node node_modules/electron/install.js
```

## Run

```sh
pnpm dev          # UI (Vite) + Electron together
pnpm dev:ui       # UI only → http://localhost:7344/
```

Electron loads the UI from `http://localhost:7344/` in development.

## Useful checks

```sh
pnpm --filter ./native-main build
pnpm --filter ./interface-master sync
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:7344/   # expect 200
```

`pnpm --filter ./torrent-client-main build` currently reports existing TypeScript errors; UI + Electron still run for day-to-day work.

## OAuth / accounts

Dev mode uses `localhost:7344` with existing client keys. Production builds need your own AniList/MAL/Simkl/Kitsu credentials (see `interface-master/README.md`).
