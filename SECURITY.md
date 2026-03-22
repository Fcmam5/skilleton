# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |

Skillset CLI is currently pre-1.0, but we treat every tagged release as security-supported until a newer patch is published.

## Reporting a Vulnerability

If you discover a security vulnerability in Skillset CLI, please report it responsibly.

### How to Report

**Do NOT open a public GitHub issue.**

Instead, email `au54vz9rk[at]mozmail[.]com` with the details. If you do not receive an acknowledgment within 48 hours, follow up using the contact methods listed in [README.md](README.md).

### What to Include

- A clear description of the issue and potential impact
- Steps to reproduce and any sample manifests or skill repos used
- Logs, stack traces, or screenshots if available
- Environment details (OS, Node.js version, Skillset CLI version)
- Suggested mitigations, if you have any

### Response Process

1. **Acknowledgment** within 48 hours
2. **Assessment** and triage within 7 calendar days
3. **Remediation** work begins immediately after triage; we may request more info or a proof of concept
4. **Coordinated disclosure**: we will agree on a public disclosure date once a fix is ready and released

We may invite you to test the fix before release if appropriate.

## Scope

This policy covers:

- The Skillset CLI source code (`bin/`, `src/`, `tests/`)
- Packaged releases published to npm
- JSON schemas (e.g., `skillset.schema.json`) and manifest parsing/validation
- Git/GitHub adapters, caching, and installation paths (`~/.skillset/cache`, `.skillset/skills`)
- Configuration files distributed with the project (e.g., `skillset.json`, `skillset.lock.json` generation)

Out of scope:

- Vulnerabilities in third-party skill repositories
- Issues stemming from user-modified skill code after installation
- Problems in dependencies already patched upstream (unless we fail to update)
- Social engineering or phishing attacks against maintainers or users

## Security Expectations

- **No telemetry**: Skillset CLI does not phone home or send metrics.
- **Principle of least privilege**: git operations run using local credentials you provide; we never request additional permissions.
- **Deterministic installs**: `skillset.lock.json` pins exact commits to prevent prompt injection and supply-chain surprises.
- **Filesystem isolation**: skills install under `.skillset/skills/<name>` with symlinks per agent, avoiding arbitrary execution from temporary paths.
- **Input validation**: manifests are validated against a strict JSON schema before any install occurs.

## Coordinated Disclosure & Recognition

We will credit researchers in release notes/security advisories (with permission). We do not currently run a bounty program, but we are happy to provide public thanks and, when possible, swag.

We will not pursue legal action against good-faith researchers who follow this policy, refrain from data destruction, and avoid privacy violations.

## Staying Secure

- Keep Node.js up to date (see `.nvmrc`).
- Run `npm test` and `npm run build` before publishing or distributing custom builds.
- Monitor this repository’s releases for security advisories.

Thank you for helping keep Skillset CLI safe for everyone!