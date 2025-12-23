# Contributing to Web Tools

Thank you for your interest in contributing to Web Tools! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/web-tool.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit your changes: `git commit -m "Add: your feature description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

### Development Commands

```bash
# Run linting
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Format code
pnpm run format

# Check code formatting
pnpm run format:check
```

## Coding Standards

### JavaScript/TypeScript

- Use modern ES6+ syntax
- Use `const` and `let` instead of `var`
- Use strict equality (`===`) instead of loose equality (`==`)
- Add JSDoc comments for functions
- Handle errors properly with try-catch blocks
- Avoid using `console.log` in production code

### Astro Components

- Use TypeScript for component props
- Keep components focused and reusable
- Use semantic HTML
- Add proper ARIA labels for accessibility
- Use CSS modules or scoped styles

### CSS

- Follow BEM naming convention where applicable
- Use CSS custom properties for theming
- Ensure responsive design for all screen sizes
- Test on multiple browsers

### Accessibility

- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper color contrast ratios

### Security

- Never commit secrets or API keys
- Sanitize user inputs
- Use Content Security Policy headers
- Validate all data before processing
- Follow OWASP security guidelines

## Submitting Changes

### Commit Messages

Follow the conventional commits format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add SHA-3 hash support`

### Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Run linting and fix any issues
5. Update the README.md if needed
6. Describe your changes in the PR description
7. Link any related issues

### Code Review

- Be open to feedback
- Respond to comments promptly
- Make requested changes
- Keep discussions professional and constructive

## Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Screenshots**: If applicable
6. **Environment**: Browser, OS, version numbers
7. **Additional Context**: Any other relevant information

## Suggesting Enhancements

When suggesting enhancements, please include:

1. **Use Case**: Why this enhancement would be useful
2. **Description**: Clear description of the enhancement
3. **Proposed Solution**: How you think it should work
4. **Alternatives**: Any alternative solutions you've considered
5. **Additional Context**: Any other relevant information

## Adding New Tools

When adding a new tool:

1. Create the tool page in `src/pages/[lang]/`
2. Add translations in `src/i18n/`
3. Update `src/data/toolSections.ts` to include the tool
4. Add necessary JavaScript files to `public/js/`
5. Update documentation
6. Add tests if applicable

## Questions?

If you have questions, feel free to:

- Open an issue for discussion
- Contact the maintainers
- Check existing issues and pull requests

Thank you for contributing to Web Tools! 🎉
