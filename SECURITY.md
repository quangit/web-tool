# Security Policy

## Supported Versions

We release patches for security vulnerabilities. The following versions are currently supported:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please follow these steps:

1. **Do NOT** open a public issue
2. Email the security team at: [security contact email - please update]
3. Provide detailed information about the vulnerability:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## What to Expect

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity and complexity

## Security Best Practices

This project follows these security best practices:

### Client-Side Security

- All data processing happens in the browser
- No data is sent to external servers (except analytics)
- Input validation and sanitization
- Content Security Policy headers
- Secure defaults for all operations

### Code Security

- Regular dependency updates
- Static code analysis
- Security-focused code reviews
- No hardcoded secrets
- Proper error handling

### Privacy

- No user data collection (except anonymous analytics)
- No cookies for tracking
- No third-party data sharing
- All processing is local

## Known Security Considerations

### Third-Party Libraries

This project uses several third-party libraries for cryptographic operations:

- CryptoJS
- jsrsasign
- BLAKE2/BLAKE3 implementations

These libraries are well-established but users should:
- Keep dependencies updated
- Review library code for critical operations
- Use official releases only

### Browser Security

Since all operations run in the browser:

- Use a modern, updated browser
- Be cautious with sensitive data
- Clear browser cache after sensitive operations
- Use incognito mode for highly sensitive data

### Content Security Policy

The project implements CSP headers to prevent XSS attacks. Ensure your web server properly implements the headers in `public/_headers`.

## Security Updates

Security updates will be:

1. Published in release notes
2. Tagged with security labels
3. Communicated through GitHub security advisories
4. Applied to all supported versions when critical

## Responsible Disclosure

We practice responsible disclosure:

- Security issues are fixed before public disclosure
- Credit given to reporters (unless they prefer anonymity)
- Coordinated with reporters on disclosure timing
- Security advisories published after fixes

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)

## Questions?

If you have questions about security but don't have a vulnerability to report:

- Open a GitHub discussion
- Review existing security documentation
- Check the FAQ in the README

Thank you for helping keep Web Tools secure! 🔒
