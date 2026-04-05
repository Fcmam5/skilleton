# Parsing Change Notes & Migration

## 0.3.0

### Parsing behavior change

- `parseSkillInput` now treats two-segment shorthand (`owner/repo`) as a direct repository with `path: "."`.
- This behavior is implemented in `src/core/parse.ts`, in `deriveFromSegments` under the `segments.length === 2` branch.
- Example:
  - `mhdcodes/react-query-skill` => repo `https://github.com/mhdcodes/react-query-skill`, path `.`

### Monorepo input guidance

If your skill lives inside a monorepo, use a path-explicit input:

- Three-segment shorthand: `owner/monorepo/skill-path`
- Longer path shorthand: `owner/monorepo/path/to/skill`
- Explicit URL form: `https://github.com/owner/monorepo/path/to/skill`

This makes monorepo intent explicit and avoids accidental reinterpretation of `owner/skill` as `owner/skills/<skill>`.

## Migration Guide

### What changed

In `deriveFromSegments`, the `segments.length === 2` case now maps directly to a repository root:

- Input: `owner/repo`
- Parsed as: repo `https://github.com/owner/repo`, path `.`

### Why this matters

Older assumptions that interpreted `owner/skill` as `owner/skills/<skill>` are no longer valid.

### How to migrate

If your skill is in a monorepo, make the subpath explicit:

- Use 3+ segment shorthand:
  - `owner/monorepo/skill-name`
  - `owner/monorepo/path/to/skill`
- Or use explicit URL + path form:
  - `https://github.com/owner/monorepo/path/to/skill`

### Examples

- Root repo skill:
  - `mhdcodes/react-query-skill`
  - => repo `https://github.com/mhdcodes/react-query-skill`, path `.`

- Monorepo skill:
  - `mindrally/skills/jest`
  - => repo `https://github.com/mindrally/skills`, path `jest`

### Recommended check

After updating references, run:

```bash
skilleton update
```

This reconciles `skilleton.lock.json` with `skilleton.json` and refreshes entries as needed.
