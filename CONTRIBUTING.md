# Contributing to Skilleton CLI

Thanks for helping build a better deterministic skill dependency manager! This guide explains how to propose changes, what we expect in pull requests, and how to keep the project fast, private, and maintainable.

## Before You Start

1. Read the [Skilleton CLI Code of Conduct](CODE_OF_CONDUCT.md) and AI usage rules.
2. Look through existing issues/discussions to avoid duplicates.
3. Open an issue describing the bug/feature before writing code—design upfront keeps the CLI minimal.
4. All contributions must be made and reviewed by humans. AI tooling can assist but cannot directly author PRs.

## How to Contribute

### Reporting Bugs

- Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).
- Include CLI version (`skilleton --version`), Node.js version, OS, and shell.
- Provide the manifest/lockfile snippets or redacted stack traces needed to reproduce.

### Suggesting Features

- Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).
- Describe the workflow pain point and how it fits with Skilleton's minimal/deterministic philosophy.
- Prototype ideas in discussions before writing code when changes are large.

### Submitting Changes

1. Open/claim the relevant issue.
2. Fork the repo and create a feature branch (`git checkout -b feat/add-agent-flag`).
3. Keep changes laser-focused—small PRs merge faster.
4. If AI assisted, manually review every line and mention it in the PR description.
5. Run `npm run lint && npm test && npm run build` locally.
6. Update docs/tests whenever behavior changes.
7. Push and open a PR using the template (link issues, describe testing).

## Development Setup

### Prerequisites

- Node.js 24.x (see [.nvmrc](.nvmrc))
- npm 10+
- Git
- Familiarity with TypeScript, Jest, and CLI workflows

### Local Development

```bash
git clone https://github.com/fcmam5/skilleton.git
cd skilleton
npm install
npm run build
npm run cli -- --help
```

During development you can run the TypeScript sources directly with `npm run cli -- <command>`.

## Code Style

- TypeScript everywhere (strict mode on). Keep types explicit when public APIs are exposed.
- Prefer composition over inheritance; favor pure functions in `src/core/`.
- Follow existing file/module structure (`src/commands`, `src/core`, `src/adapters`).
- Imports use extensionless relative paths (CommonJS build).
- Run Prettier (`npm run format`) before committing.

## Testing

### Manual Testing

- Run `npm run cli add <owner/skill>` in a throwaway directory to ensure manifests/lockfiles behave.
- Verify `skilleton install/update/list` flows when manifests include multiple skills from the same repo.
- Check the cache at `~/.skilleton/cache` and installs under `.skilleton/skills` when testing installer changes.

### What to Test Before Submitting

- [ ] `npm run lint`
- [ ] `npm test`
- [ ] `npm run build` (outputs to `dist/`)
- [ ] CLI smoke test via `npm run cli list` (or another relevant command)

## Pull Request Guidelines

### Before Opening PR

- Ensure your branch is up to date with main
- Rebase if necessary (avoid merge commits)
- Test your changes thoroughly
- Update documentation if needed
- If you used AI assistance, acknowledge it in the PR description
- Verify all AI-generated code is manually reviewed and understood

### PR Template

Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md) and include:

- Clear description of changes
- Related issues (if any)
- Testing steps
- Screenshots for UI changes

### Review Process

- Maintainers review for correctness, determinism, and scope.
- Expect questions about manifest/lock impacts and security implications.
- Address feedback promptly; follow-up commits should stay scoped to the original issue.

## Project Goals

- Deterministic installs and reproducible manifests
- Minimal surface area: CLI stays fast and dependency-light
- Privacy-first: no telemetry or phone-home behavior
- Extensible architecture for future registries beyond GitHub
- Excellent developer ergonomics (clear errors, helpful logs)

## Architecture Notes

- `bin/skilleton.ts` wires CLI commands to the environment factory in `src/env.ts`.
- `src/core/` contains domain logic: parse, validate, resolve, install, lockfile helpers.
- `src/adapters/` isolate side effects (filesystem, git, GitHub API).
- Cache directory: `~/.skilleton/cache`; installed skills live under `.skilleton/skills` with optional per-agent symlinks.

When adding new commands or adapters, keep boundaries clear and write focused tests under `tests/`.

### AI-Assisted Contributions

- **Issue Required**: Always file an issue before implementing AI-assisted changes
- **Human Review**: All AI-generated code must be thoroughly reviewed by humans
- **Minimal Changes**: Keep AI-assisted contributions focused and minimal
- **Understanding**: Contributors must fully understand all code they submit
- **Testing**: AI-assisted code must be manually tested before submission
- **Attribution**: Acknowledge AI assistance in pull requests
- **No Automated Agents**: Contributions must be made by humans only

## Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Questions?

- Check existing issues/discussions first.
- Start a new GitHub Discussion for open-ended topics.
- Security issues? See [SECURITY.md](SECURITY.md).

---

Thank you for contributing to Skilleton CLI! Together we can keep AI skills as reproducible and privacy-friendly as the rest of your stack.
