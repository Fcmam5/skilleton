# Skillset Roadmap

A living document outlining the near-term milestones for the Skillset CLI.

## v0.1 GA (MVP hardening)

1. **Add flags**
   - Add a `--verbose` flag to show detailed progress during installation and other operations.
   - Add a `--dry-run` flag to show what would be done without actually doing it.
   - Work on update strategy for skills
2. **Skill installation**
   - Create symbolic links under `.skillset/agents/<agent>/<skill>` that reflect the active agent (Claude, Gemini, etc.) or the `--agent` flag.
   - Ensure installs remain idempotent and validate `SKILL.md` presence before linking.
3. **Manifest experience**
   - Improve error surfaces when `skillset.json` or `skillset.lock.json` are missing or malformed.
   - Provide example manifests and lockfiles in `docs/usage.md`.

## v0.2 "Safety Net"

1. **`skillset audit` command (scaffolding exists)**
   - Scan installed `SKILL.md` files for prompt-injection red flags (e.g., self-modifying instructions, network exfiltration hints).
   - Emit structured findings so CI can fail on high-risk issues.
2. **Agent-aware linking**
   - Allow per-agent overrides in manifest (`preferredAgent`).
   - Offer `skillset install --agent <name>` to switch symlink targets without reinstalling.

## v0.3 "Extensibility"

1. **Bring-your-own registries**
   - Introduce a plugin interface so organizations can fetch skills from private registries instead of GitHub.
   - Define adapter contract (resolve, fetch, verify) and ship a reference implementation for HTTP+git mirrors.
2. **Plugin lifecycle**
   - Allow users to enable/disable plugins via `skillset.config.json`.
   - Document compatibility expectations and security requirements for third-party plugins.

## Later / Under Consideration

- Rich `skillset list --json` output for dashboard integrations.
- Optional `skillset doctor` command to verify cache health and repo access.
