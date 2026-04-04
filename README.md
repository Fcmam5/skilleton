# Skilleton

**Deterministic AI skill dependency management for teams**

Manage AI skills like npm packages - with project manifests, lockfiles, and reproducible installations.

## Why this exists

- **Keep skills with code** – manifests + lockfiles are versioned right beside your source tree.
- **Deterministic installs** – CI and every teammate pull the exact same commits.
- **Zero shared state** – nothing lives in a global registry; installs happen from git.
- **Privacy-first** – no telemetry, no cloud calls, easy to audit.

## Quickstart

```bash
# Add a skill to your project
skilleton add Mindrally/skills/jest

# Install all skills (like npm install)
skilleton install

# Team member gets exact same versions
git pull  # Gets skilleton.json + skilleton.lock.json
skilleton install  # Installs exact pinned versions
```

> **Note**: Skilleton resolves skill refs via `git ls-remote` and requires a local git installation. It respects your local git credentials for private repositories.

## How it works

**skilleton.json** (commit this):
```json
{
  "skills": [
    {
      "name": "jest", 
      "repo": "Mindrally/skills",
      "path": "jest",
      "ref": "47f47c1"
    }
  ]
}
```

**skilleton.lock.json** (commit this):
```json
{
  "skills": {
    "jest": {
      "name": "jest",
      "repo": "Mindrally/skills", 
      "path": "jest",
      "ref": "47f47c1",
      "commit": "abc123def456...",
      "timestamp": "2025-01-01T00:00:00Z"
    }
  }
}
```

And add the following to your `.gitignore`:

```
.skilleton/
```


## Commands

```bash
skilleton add <owner/skill[@ref]>    # Add skill and update manifest
skilleton install                    # Reconcile lockfile with manifest, then install all skills
skilleton update                     # Refresh lockfile; reinstall only changed skills
skilleton list [--format=table|json] # Show installed skills
skilleton describe <skill>           # Inspect metadata, install tree, SKILL.md header
skilleton validate                   # Check skill structure and security
```

### Lockfile behavior

- `skilleton add` updates `skilleton.json` and then runs `install`.
- `skilleton install` keeps `skilleton.lock.json` in sync with `skilleton.json`:
  - creates the lockfile if missing,
  - adds missing skills,
  - prunes skills removed from `skilleton.json`,
  - refreshes changed refs/commits.
- `skilleton update` also reconciles the lockfile, but only reinstalls skills whose pinned commit actually changed.
- If only pruning is needed, `update` rewrites `skilleton.lock.json` and exits without reinstalling skills.

### List Command

The `list` command shows all installed skills with their repository, path, ref, and commit information. It supports two output formats:

**Table format (default):**
```bash
skilleton list
# ┌─────────┬───────────────────────┬───────────────────────────────────────┬───────────┬───────────┐
# │ (index) │ Name                  │ Repo                                  │ Path      │ Commit    │
# ├─────────┼───────────────────────┼───────────────────────────────────────┼───────────┼───────────┤
# │ 0       │ typescript-magician   │ https://github.com/mcollina/skills    │ skills/...│ 3e2ffbb   │
# │ 1       │ jest                  │ https://github.com/Mindrally/skills   │ jest      │ 47f47c1   │
# └─────────┴───────────────────────┴───────────────────────────────────────┴───────────┴───────────┘
```

**JSON format (for scripts/parsing):**
```bash
skilleton list --format=json
# [
#   {
#     "name": "typescript-magician",
#     "repo": "https://github.com/mcollina/skills",
#     "path": "skills/typescript-magician",
#     "ref": "3e2ffbb",
#     "commit": "3e2ffbb90fda9e31d84011c765252b00bfc2d4d6"
#   }
# ]
```

### Describe Command

Use `describe` when you need rich details about a specific skill:

```bash
skilleton describe typescript-magician
# Name: typescript-magician
# Repo: https://github.com/mcollina/skills
# Path: skills/typescript-magician
# Ref: main
# Commit: 3e2ffbb90fda9e31d84011c765252b00bfc2d4d6
# Install path: .skilleton/skills/typescript-magician
#
# Folder structure:
#   README.md
#   SKILL.md
#   rules/
#   rules/rule.md
#
# SKILL.md header:
# ---
# name: typescript-magician
# description: ...
# ---
```

It falls back gracefully if the skill is missing from the manifest, not yet installed, or lacks a SKILL.md file.

## Installation

```bash
npm install -g skilleton

# or run directly with npx
npx skilleton add <owner/skill[@ref]>
```

## Acknowledgments

Special thanks to Brian and [Giuseppe](https://github.com/giuseppeminnella) for their valuable insights that inspired the creation of Skilleton.

## Privacy

No telemetry, no phone home. Skills are cached locally, manifests are yours to control.

## License

MIT - see [LICENSE](LICENSE)
