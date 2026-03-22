# Skillset

Skillset is a lightweight CLI that treats AI skills like deterministic project dependencies. Think `package.json`, `vscode/extensions.json`, or other project-scoped manifests—except the entries point to versioned `SKILL.md` folders that can be shared, reviewed, and upgraded with confidence. Vercel's `skills.sh` inspired parts of the DX, but Skillset differentiates itself with project-first manifests and strict version locking.

## Installation

```bash
npm install -g skillset-cli
```

Or using npx:

```bash
npx skillset-cli --help
```

## Usage


### Adding Skills

In your project, run:

```bash
skillset add <owner/skill[@ref]>
```

For example:

```bash
skillset add Mindrally/skills/chrome-extension-development@47f47c1

# or
skillset add Mindrally/skills/chrome-extension-development # defaults to latest commit on main
```

This will create a `skillset.json` file in your project root, update `skillset.lock.json`, and immediately install the requested skill (and the rest of the manifest) into `~/.skillset/skills`, using `~/.skillset/cache` for repo reuse.

Think of it like running `npm install --save`: the manifest is updated and the dependency is fetched in one step.

> [!IMPORTANT]
> Make sure to commit your `skillset.json` and `skillset.lock.json` files to version control, and add `~/.skillset` to your `.gitignore` file.


### Installing Skills

If you have a `skillset.json` file in your project (and you should :smirk:), you can install the skills by running:

```bash
skillset install
```

### Listing Skills

```bash
skillset list
```

### Updating Skills

```bash
skillset update
```

## Features

- Declarative `skillset.json` manifest that lives alongside your other project configs
- Lockfile-driven installs (`skillset.lock.json`) for deterministic, versioned skills
- Git-based resolution today (GitHub-first for now, but architecture keeps future sources open)
- Cache-friendly git operations stored in `~/.skillset/cache`
- Commands: `add`, `install`, `update`, `list`, `audit`

## Development

### Prerequisites

- Node.js 24.x (see [.nvmrc](.nvmrc))

### Installation

```bash
npm install
npm run build
node dist/bin/skillset.js --help
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
