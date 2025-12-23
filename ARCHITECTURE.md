# Architecture Documentation

## Overview

Web Tools is a privacy-focused web toolkit built with Astro framework. All operations are performed client-side to ensure user privacy.

## Technology Stack

### Core Framework
- **Astro 4.x**: Static site generator with excellent performance
- **TypeScript**: Type-safe development
- **jQuery 1.10.1**: Legacy support (consider migration to vanilla JS)

### Build Tools
- **Vite**: Fast build tool and dev server
- **pnpm**: Efficient package manager

### Code Quality
- **ESLint**: JavaScript/TypeScript linting (excludes `public/js/**` directory)
- **Prettier**: Code formatting (excludes `public/js/**` directory)
- **TypeScript Strict Mode**: Enhanced type safety

**Note**: The `public/js` directory contains third-party libraries and legacy code that is excluded from code quality checks to focus reviews on the core project source code in the `src` directory.

## Project Structure

```
web-tool/
├── .github/              # GitHub specific files
├── public/               # Static assets
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JavaScript
│   ├── images/          # Images and icons
│   ├── _headers         # Security headers configuration
│   └── robots.txt       # Search engine directives
├── src/
│   ├── components/      # Reusable Astro components
│   ├── config/          # Configuration files
│   ├── data/            # Data files (tool sections, etc.)
│   ├── i18n/            # Internationalization
│   ├── layouts/         # Page layouts
│   └── pages/           # Page routes
│       ├── index.astro  # Root redirect page
│       └── [lang]/      # Localized pages
├── astro.config.mjs     # Astro configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── .eslintrc.json       # ESLint configuration
└── .prettierrc.json     # Prettier configuration
```

## Key Concepts

### Internationalization (i18n)

The application supports 8 languages: English, Vietnamese, Chinese, Hindi, Spanish, French, Portuguese, and Japanese.

- Routes: `/{lang}/{tool}`
- Default language: English
- Language detection: Browser-based with fallback

### Client-Side Processing

All cryptographic and encoding operations happen in the browser:

1. User inputs data
2. JavaScript processes the data
3. Results displayed instantly
4. No server communication for operations

### Component Architecture

#### Base Components
- `BaseLayout.astro`: Main layout with meta tags, scripts
- `BasePage.astro`: Generic page wrapper
- `BaseHashPage.astro`: Hash tool pages
- `BaseCryptoPage.astro`: Encryption tool pages
- `EncodingPage.astro`: Encoding/decoding pages

#### Functional Components
- `Sidebar.astro`: Navigation sidebar
- `PageHeader.astro`: Page title and description
- `InputBlock.astro`: Input text area
- `OutputBlock.astro`: Output text area
- `FileHashPage.astro`: File upload and processing

### State Management

- **LocalStorage**: Used for:
  - Dark mode preference
  - Favorite tools
  - User settings
  - Section collapse states

- **No Server State**: All state is client-side

## Data Flow

```
User Input → JavaScript Processing → Display Output
     ↓
LocalStorage (optional)
```

### Example: Hash Calculation

1. User enters text or uploads file
2. Input validation
3. Hash algorithm applied (client-side)
4. Result displayed in output area
5. Optional download as file

## Security Architecture

### Client-Side Security

1. **Content Security Policy (CSP)**
   - Restricts script sources
   - Prevents XSS attacks
   - Defined in `public/_headers`

2. **Input Validation**
   - All inputs validated before processing
   - Error handling for invalid data

3. **No Data Transmission**
   - No user data sent to servers
   - Only anonymous analytics

### Privacy Features

- No cookies for tracking
- No user accounts or data storage
- No third-party data sharing
- Works offline after initial load

## Performance Optimization

### Build Optimization
- Static site generation
- CSS minification
- JavaScript bundling
- Image optimization

### Runtime Optimization
- Lazy loading of scripts
- Deferred script loading
- Resource hints (preconnect, dns-prefetch)
- Event listener optimization (passive, once)

### Analytics
- Google Analytics (delayed initialization)
- Loads only on user interaction
- Can be disabled for localhost

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ required
- Local Storage required
- File API support for file operations

## Deployment

### Build Process

```bash
# Install dependencies
pnpm install

# Type check
astro check

# Build static site
astro build

# Output: dist/ directory
```

### Deployment Targets

- Static hosting (Netlify, Vercel, GitHub Pages)
- CDN distribution
- No server-side requirements

## Future Improvements

### Code Quality
1. **Migrate from jQuery to Vanilla JS**
   - Reduce bundle size
   - Modern JavaScript features
   - Better performance

2. **TypeScript Migration**
   - Convert JavaScript files to TypeScript
   - Better type safety
   - Improved IDE support

3. **Component Modernization**
   - Break down large components
   - Improve reusability
   - Add unit tests

### Performance
1. **Code Splitting**
   - Load tools on demand
   - Reduce initial bundle size

2. **Web Workers**
   - Move heavy computations to workers
   - Better UI responsiveness

3. **Progressive Web App (PWA)**
   - Offline functionality
   - Install as app
   - Service worker caching

### Features
1. **Additional Tools**
   - More hash algorithms
   - More encoding formats
   - New utility tools

2. **Enhanced UI/UX**
   - Better mobile experience
   - Improved accessibility
   - Custom themes

3. **Developer Features**
   - API documentation
   - Code examples
   - CLI tool

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security information.

## License

See project root for license information.
