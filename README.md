# Skilleton

**Skilleton** is a skills skeleton — a lightweight CLI that treats AI skills like deterministic project dependencies. Think `package.json`, `vscode/extensions.json`, or other project-scoped manifests—except the entries point to versioned `SKILL.md` folders that can be shared, reviewed, and upgraded with confidence. Vercel's `skills.sh` inspired parts of the DX, but Skilleton differentiates itself with project-first manifests and strict version locking.

## Why "Skilleton"?

The name "Skilleton" comes from **"skills skeleton"** — it provides the structural framework for managing AI skill dependencies in your projects. Everyone else was already using "[skillset](https://www.npmjs.com/package/skillset)", "[skillsets](https://www.npmjs.com/package/skillsets)", "[Skillful](https://www.npmjs.com/package/skillful)", and similar names, so we went with something that captures the essence: a minimal, skeletal structure that holds your skills together.

## Installation

```bash
npm install -g skilleton
```

Or using npx:

```bash
npx skilleton --help
```

## Usage


### Adding Skills

In your project, run:

```bash
skilleton add <owner/skill[@ref]>
```

For example:

```bash
skilleton add Mindrally/skills/chrome-extension-development@47f47c1

# or
skilleton add Mindrally/skills/chrome-extension-development # defaults to latest commit on main
```

This will create a `skilleton.json` file in your project root, update `skilleton.lock.json`, and immediately install the requested skill (and the rest of the manifest) into `~/.skilleton/skills`, using `~/.skilleton/cache` for repo reuse.

Think of it like running `npm install --save`: the manifest is updated and the dependency is fetched in one step.

> [!IMPORTANT]
> Make sure to commit your `skilleton.json` and `skilleton.lock.json` files to version control, and add `~/.skilleton` to your `.gitignore` file.


### Installing Skills

If you have a `skilleton.json` file in your project (and you should :smirk:), you can install the skills by running:

```bash
skilleton install
```

### Listing Skills

```bash
skilleton list
```

### Updating Skills

```bash
skilleton update
```

## Features

- Declarative `skilleton.json` manifest that lives alongside your other project configs
- Lockfile-driven installs (`skilleton.lock.json`) for deterministic, versioned skills
- Git-based resolution today (GitHub-first for now, but architecture keeps future sources open)
- Cache-friendly git operations stored in `~/.skilleton/cache`
- Commands: `add`, `install`, `update`, `list`, `audit`

## Development

### Prerequisites

- Node.js 24.x (see [.nvmrc](.nvmrc))

### Installation

```bash
npm install
npm run build
node dist/bin/skilleton.js --help
```

## Repository Norms

- Discuss ideas in GitHub issues before contributing
- Small, focused pull requests only
- Human-reviewed contributions; automated/AI-only PRs will be closed
- MIT license, no telemetry, privacy-first design

## Documentation

- [docs/architecture.md](docs/architecture.md)
- [docs/usage.md](docs/usage.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
- [PRIVACY.md](PRIVACY.md)

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Vercel's `skills.sh` CLI for inspiring parts of the developer experience
- Brian and Giuseppe for working on a similar idea for a different context/purpose

## Support

If you find this project helpful and want to support its development, you can:

- **Ko-fi**: [ko-fi.com/fcmam5](https://ko-fi.com/fcmam5)
- **Buy Me a Coffee**: [buymeacoffee.com/ngcmbf6](https://buymeacoffee.com/ngcmbf6)
