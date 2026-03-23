# Skilleton

**Deterministic AI skill dependency management for teams**

Manage AI skills like npm packages - with project manifests, lockfiles, and reproducible installations.

## Why this exists

`skills.sh` is great for installing skills globally, but teams need:

- **Reproducible environments** - Everyone gets the same skill versions
- **Project-scoped dependencies** - Skills live with your code, not globally  
- **Version locking** - No surprises from upstream changes
- **Team collaboration** - Commit manifests to version control

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

## Commands

```bash
skilleton add <owner/skill[@ref]>    # Add skill and update manifest
skilleton install                    # Install exact versions from lockfile  
skilleton update                     # Refresh lockfile and reinstall
skilleton list                       # Show installed skills
```

## vs skills.sh

| Feature | Skilleton | skills.sh |
|---------|-----------|-----------|
| Team collaboration | ✅ Manifests + lockfiles | ❌ Global only |
| Reproducible builds | ✅ Exact commit pinning | ❌ Latest by default |
| Project isolation | ✅ Per-project skills | ❌ Shared global |
| Version control | ✅ Git-friendly | ❌ Not designed for it |

## Installation

```bash
npm install -g skilleton
```

## Privacy

No telemetry, no phone home. Skills are cached locally, manifests are yours to control.

## License

MIT - see [LICENSE](LICENSE)
