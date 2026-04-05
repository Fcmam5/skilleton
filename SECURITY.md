# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| >=0.3.1 | ✅        |
| <0.3.1  | ❌ (deprecated) |

Versions earlier than `0.3.1` are deprecated due to security fixes (see the [Security Advisory](https://github.com/Fcmam5/skilleton/security/advisories/GHSA-5g3j-89fr-r2vp)). Please upgrade to `0.3.1` or later.

## Reporting a Vulnerability

If you discover a security vulnerability in Skilleton CLI, please report it responsibly.

### How to Report

**Do NOT open a public GitHub issue.**

Instead, email `au54vz9rk[at]mozmail[.]com` with the details. If you do not receive an acknowledgment within 48 hours, follow up using the contact methods listed in [README.md](README.md).

### What to Include

- A clear description of the issue and potential impact
- Steps to reproduce and any sample manifests or skill repos used
- Logs, stack traces, or screenshots if available
- Environment details (OS, Node.js version, Skilleton CLI version)
- Suggested mitigations, if you have any

### Response Process

1. **Acknowledgment** within 48 hours
2. **Assessment** and triage within 7 calendar days
3. **Remediation** work begins immediately after triage; we may request more info or a proof of concept
4. **Coordinated disclosure**: we will agree on a public disclosure date once a fix is ready and released

We may invite you to test the fix before release if appropriate.

### Automated Alert Triage (GitHub)

We also monitor and triage GitHub security signals (CodeQL and Dependabot alerts).

- **Initial triage SLA**: within 7 days of an alert opening
- **Critical/High**: patch or documented mitigation target within 14 days
- **Medium**: patch target within 30 days
- **Low**: patch target within 90 days or explicitly risk-accepted with rationale

For each alert, we track:

- affected file/function and exploit preconditions
- real impact in Skilleton runtime/CLI context
- patch approach, owner, and target release
- verification (tests and/or reproduction before/after)

If an alert is a false positive or accepted risk, we record the reason and keep the decision reviewable.

## Scope

This policy covers:

- The Skilleton CLI source code (`bin/`, `src/`, `tests/`)
- Packaged releases published to npm
- JSON schemas (e.g., `skilleton.schema.json`) and manifest parsing/validation
- Git/GitHub adapters, caching, and installation paths (`~/.skilleton/cache`, `.skilleton/skills`)
- Configuration files distributed with the project (e.g., `skilleton.json`, `skilleton.lock.json` generation)

Out of scope:

- Vulnerabilities in third-party skill repositories
- Issues stemming from user-modified skill code after installation
- Problems in dependencies already patched upstream (unless we fail to update)
- Social engineering or phishing attacks against maintainers or users

## Security Expectations

- **No telemetry**: Skilleton CLI does not phone home or send metrics.
- **Principle of least privilege**: git operations run using local credentials you provide; we never request additional permissions.
- **Deterministic installs**: `skilleton.lock.json` pins exact commits to prevent prompt injection and supply-chain surprises.
- **Filesystem isolation**: skills install under `.skilleton/skills/<name>` with symlinks per agent, avoiding arbitrary execution from temporary paths.
- **Input validation**: manifests are validated against a strict JSON schema before any install occurs.

## Coordinated Disclosure & Recognition

We will credit researchers in release notes/security advisories (with permission). We do not currently run a bounty program, but we are happy to provide public thanks and, when possible, swag.

We will not pursue legal action against good-faith researchers who follow this policy, refrain from data destruction, and avoid privacy violations.

## Staying Secure

- Keep Node.js up to date (see `.nvmrc`).
- Run `npm test` and `npm run build` before publishing or distributing custom builds.
- Monitor this repository’s releases for security advisories.

Thank you for helping keep Skilleton CLI safe for everyone!
