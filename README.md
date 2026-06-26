# Hayase-lite

A personal torrent streaming app.

## Development

```sh
pnpm install
pnpm dev
```

## Build

```sh
pnpm build
```

## Release

Pushing a `v*` tag triggers the release workflow:

```sh
git tag v0.1.0
git push origin v0.1.0
```

Downloads are published to [GitHub Releases](https://github.com/afnanrudy/hayase-lite/releases).

### macOS install

The macOS build is unsigned. To open it the first time, run:

```sh
xattr -cr /Applications/Hayase-lite.app
```

Or right-click the app → **Open** → **Open anyway** in the Gatekeeper dialog.

## License

Business Source License 1.1 (BUSL-1.1). See [LICENSE](./LICENSE).

This project is a derivative of [Miru](https://github.com/ThaUnknown/miru) and inherits its BUSL-1.1 terms. On the Change Date (2029-04-01), use of this software will be governed by GPL-3.0.
