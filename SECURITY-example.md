# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | ✅                 |

## Reporting a Vulnerability

If you discover a security vulnerability in Skillset CLI, please report it responsibly.

### How to Report

**Do NOT open a public issue.**

Instead, send an email to: `au54vz9rk[at]mozmail[.]com`

If you don't receive a response within 48 hours, please follow up via the project's [contact methods](README.md).

### What to Include

- Detailed description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact assessment
- Any proof-of-concept code or screenshots
- Browser/OS version information

### Response Process

1. **Acknowledgment**: We'll confirm receipt within 48 hours
2. **Assessment**: We'll evaluate the report within 7 days
3. **Remediation**: We'll develop and test a fix
4. **Disclosure**: We'll coordinate public disclosure timing

### Security Best Practices

Skillset CLI follows these security practices:

- **Minimal Permissions**: Only requests necessary permissions
- **No Remote Code**: No external network requests or code execution
- **Local Storage Only**: All data stored locally in browser
- **Input Validation**: All user inputs are validated and sanitized
- **Content Security**: Content scripts are scoped to allowed domains
- **Manifest V3**: Uses modern extension security model

### Scope

This policy covers:
- Extension code and bundled dependencies
- Website scoping and URL matching logic
- Content script injection and DOM manipulation
- Extension popup and background service worker

### Out of Scope

The following are not covered by this policy:

- Issues in third-party websites where the extension is used
- Browser vulnerabilities unrelated to the extension
- Issues in development tools or build processes
- Social engineering attacks against users

### Recognition

Security researchers who report vulnerabilities will be:

- Acknowledged in our security advisories (with permission)
- Listed in our Hall of Fame (optional)
- Eligible for swag or other recognition (as available)

### Legal

We commit to:

- Not pursue legal action against security researchers who follow this policy
- Work with researchers to understand and resolve issues
- Credit researchers for their valuable contributions

Researchers should:

- Follow responsible disclosure guidelines
- Not violate privacy or destroy data
- Test only on systems they own or have explicit permission to test

## Security Features

### Current Security Measures

- **Permission Minimization**: Only `storage` and `tabs` permissions
- **Scoped Injection**: Content scripts only run on user-specified sites
- **No External Dependencies**: Zero runtime dependencies
- **Input Sanitization**: All URL rules are validated and normalized
- **Local Storage**: No data transmitted to external servers

### Future Security Enhancements

- Content Security Policy (CSP) headers for popup
- Subresource Integrity for any future external resources
- Regular security audits and dependency updates

## Related Resources

- [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)
- [Responsible Disclosure Guidelines](https://vuls.cert.org/confluence/display/RD)
- [OWASP Browser Extension Security](https://owasp.org/www-project-browser-extension-security/)

---

Thank you for helping keep Skillset CLI and its users safe!
