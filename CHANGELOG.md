# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.3] - 2026-07-22

### Fixed

- Restricted published package contents via `files` allowlist; excludes source TypeScript, tests, config files, and CI artifacts.

## [0.3.2] - 2026-07-22

### Deprecated

- Deprecated all versions earlier than 0.3.2.

### Security

- Fixed symlink escape vulnerability in `skilleton install` (CWE-59): committed symlinks with absolute targets or relative targets escaping the skill root could be used to read arbitrary files from the victim's machine ([GHSA-mhq5-96gj-34gm](https://github.com/Fcmam5/skilleton/security/advisories/GHSA-mhq5-96gj-34gm), reported by [@EchoSkorJjj](https://github.com/EchoSkorJjj)).
- Added `realpath` containment check to reject symlinked skill root directories and symlinked intermediate `subPath` components that escape the repository worktree.
- Rejected absolute symlink targets outright to prevent dangling symlinks into predictable temp paths after worktree cleanup.
- Fixed `startsWith('..')` false positive in path escape checks that incorrectly rejected filenames beginning with `..` (e.g. `..config`).
- Copy skill content from canonical `realSourcePath` instead of the logical `sourcePath` to avoid installing a dangling symlink when `subPath` itself is a directory symlink.

### Changed

- Bumped Node.js to v24.18.0.
- Updated release pipeline.

## [0.3.1] - 2026-04-05

### Added

- Added `eslint-plugin-security` to static analysis.

### Changed

- Updated README examples and CLI help documentation.
- Updated dependencies and refactored tests.

### Deprecated

- Deprecated all versions earlier than 0.3.1.

### Fixed

- Fixed the CLI help flag.
- Resolved ESLint security plugin findings.

### Security

- Hardened Git argument handling and path validation.
- Replaced regular-expression URL normalization with iterative normalization.
- Addressed the findings disclosed in [GHSA-5g3j-89fr-r2vp](https://github.com/Fcmam5/skilleton/security/advisories/GHSA-5g3j-89fr-r2vp).

## [0.3.0] - 2026-04-05

### Added

- Added support for installing skills from a repository root.
- Added pruning to the `install` and `update` commands.
- Exposed a public API for use from scripts.
- Added API documentation comments.

### Changed

- **Breaking:** Changed two-segment shorthand parsing so `owner/skill` resolves to the root of the `owner/skill` repository instead of the `skill` subdirectory in `owner/skills`. See the [migration guide](https://github.com/Fcmam5/skilleton/blob/v0.3.0/docs/migration-guide.md).
- Added a warning when the lockfile is missing.

### Fixed

- Fixed the JSON Schema path.
- Fixed linting issues.

## [0.2.1] - 2026-03-29

### Added

- Added unit tests to increase coverage.

### Changed

- Replaced the GitHub REST API with `git ls-remote` for Git reference resolution.
- Updated dependencies to address a Dependabot alert.

## [0.2.0] - 2026-03-24

### Added

- Added the `describe` command to display package metadata, installation details, folder structure, and the `SKILL.md` header.
- Added `--format=json|table` output selection to the `list` command.

### Fixed

- Fixed `list` command output by rendering table output with `console.table`.

## [0.1.1] - 2026-03-23

### Changed

- Updated documentation and added repository links to the package metadata and npm page.

## [0.1.0] - 2026-03-22

### Added

- Added declarative `skilleton.json` manifests and reproducible `skilleton.lock.json` lockfiles.
- Added Git-based skill resolution from repository URLs and `owner/repo` slugs.
- Added deterministic, commit-pinned installation with cache-friendly Git operations.
- Added the `add`, `install`, `update`, and `list` commands, plus an `audit` command scaffold.
- Added installation under `.skilleton/skills/` with optional per-agent symbolic links.
- Added privacy-first operation with no telemetry and no network requests except through Git and the GitHub API.
- Added unit, end-to-end, lint, build, release, and npm publishing automation.
- Added project, architecture, contribution, conduct, and security documentation.

### Changed

- Renamed the project from `skillset` to `skilleton` and updated filenames, environment variables, and branding.

[Unreleased]: https://github.com/Fcmam5/skilleton/compare/v0.3.3...HEAD
[0.3.3]: https://github.com/Fcmam5/skilleton/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/Fcmam5/skilleton/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/Fcmam5/skilleton/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/Fcmam5/skilleton/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/Fcmam5/skilleton/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Fcmam5/skilleton/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/Fcmam5/skilleton/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Fcmam5/skilleton/releases/tag/v0.1.0
