# Hayase-lite

Personal fork of [Hayase](https://hayase.watch) — torrent streaming app. Stripped of social features (IRC, W2G, forums, Discord RPC), loads UI locally instead of from remote URL.

## Dev

```sh
pnpm i
pnpm dev       # UI dev server + Electron
pnpm build     # production build
```

## OAuth Setup (one-time)

Register your own apps for auth to work in production (dev mode uses `localhost:7344` and works with existing keys).

| Service | Register at | Redirect URI | Set in |
|---------|-------------|-------------|--------|
| AniList | https://anilist.co/settings/developer | `hayase-lite://authorize/` | Settings → Accounts → AniList → Client ID |
| MyAnimeList | https://myanimelist.net/apiconfig | `hayase-lite://authorize/` | Settings → Accounts → MAL → Client ID |
| Simkl | https://simkl.com/settings/developer/new | `hayase-lite://authorize/` | Settings → Accounts → Simkl → Client ID + Secret |
| Kitsu | — | Password grant, no redirect | Settings → Accounts → Kitsu → email/password |

> [!IMPORTANT]
> This application has no affiliation with any content providers and hosts zero content.
