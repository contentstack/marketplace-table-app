# Marketplace Table App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-45ba4b?logo=playwright&logoColor=white)

A modern, feature-rich table custom field extension for Contentstack marketplace apps. This React-based application provides an intuitive table editing interface that integrates seamlessly with Contentstack's content management system

## 🎨 Features

- **Interactive Table Editor**: Full-featured table with row/column operations
- **Drag & Drop**: Reorder rows and columns with drag and drop
- **CSV Import/Export**: Import data from CSV files and export table data
- **Search & Sort**: Search through table data and sort columns
- **Header Rows/Columns**: Toggle header styling for rows and columns
- **Full Screen Mode**: Expand table to full screen for better editing
- **Accessibility**: Full keyboard navigation support
- **TypeScript**: Fully typed for better development experience
- **Testing**: Comprehensive test suite with Playwright for E2E testing
- **Modern UI**: Clean, professional interface using Contentstack's Venus components

## 📋 Prerequisites

- Node.js (v20 or higher)
- npm
- Contentstack account (for marketplace deployment)

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/contentstack/marketplace-table-app.git
cd marketplace-table-app

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm start

# Run linting
npm run lint

# Format code
npm run format

```

### Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:chrome
npm run test:firefox
npm run test:safari

# Run E2E tests in headed mode
npm run test:chrome-headed
```

### Building for Production

```bash
# Build the application
npm run build

```

## 🏗️ Project Structure

```
marketplace-table-app/
├── src/
│   ├── assets/              # SVG icons and static assets
│   ├── common/
│   │   ├── locale/          # Internationalization strings
│   │   ├── ui/              # Shared UI components
│   │   └── utils/           # Utility functions
│   ├── components/          # Reusable React components
│   │   ├── csvImport/       # CSV import dialog
│   │   ├── ErrorBoundary/   # Error boundary component
│   │   ├── Home/            # Home page component
│   │   └── PageLayout/      # Page layout component
│   ├── hooks/               # Custom React hooks
│   │   ├── useAnalytics.tsx # Analytics tracking hook
│   │   ├── useAppSdk.ts     # Contentstack App SDK hook
│   │   └── useJsErrorTracker.tsx # Error tracking hook
│   ├── pages/
│   │   └── FieldExtension/  # Table field extension
│   │       ├── cell.tsx     # Table cell component
│   │       ├── header.tsx   # Table header component
│   │       ├── store.tsx    # Table state management
│   │       ├── table.tsx    # Main table component
│   │       └── fullScreenPage.tsx # Full screen modal
│   ├── routes/
│   │   └── App/             # Main app router
│   ├── styles/              # Global styles
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite type definitions
├── tests/
│   └── e2e/                 # End-to-end tests
│       ├── pages/           # Page objects
│       ├── test-spec/       # Test specifications
│       └── utils/           # Test utilities
├── .husky/                  # Git hooks
├── index.html               # HTML entry point
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── playwright.config.ts     # Playwright configuration
└── package.json             # Dependencies and scripts
```

## 🧪 Testing

This project includes comprehensive testing:

### Unit Tests

```bash
npm test                    # Run unit tests
npm run test:watch          # Run tests in watch mode
```

### E2E Tests

```bash
npm run test:chrome         # Run E2E tests in Chrome
npm run test:firefox        # Run E2E tests in Firefox
npm run test:safari         # Run E2E tests in Safari
npm run show-report         # Show test report
```

### Code Quality

```bash
npm run lint               # Run ESLint
npm run lint:check         # Check linting issues
npm run format             # Format code with Prettier
npm run format:check       # Check formatting
npm run typecheck          # TypeScript type checking
```

### App Configuration

The app configuration is defined in `update-app-info.json`:

```json
{
  "name": "Table",
  "target_type": "stack",
  "ui_location": {
    "locations": [
      {
        "type": "cs.cm.stack.custom_field",
        "meta": [
          {
            "signed": true,
            "path": "/field-extension",
            "data_type": "json"
          }
        ]
      }
    ]
  }
}
```

## 🛠️ Development

### Adding New Features

1. Create feature branch from `main`
2. Implement your changes
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

### Code Style

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new table feature
fix: resolve table rendering issue
docs: update README with new features
test: add unit tests for cell component
refactor: improve table state management
```

## 📦 Deployment

### Contentstack Marketplace

1. Build the application: `npm run build`
2. Package the `build` directory
3. Upload to Contentstack marketplace
4. Install in your Contentstack stack

### Local Development

For local development with Contentstack:

1. npm install
2. Run `npm start` for development server

## 🤝 Contributing

We welcome contributions!

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Start development
npm start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Contentstack](https://www.contentstack.com/) for the marketplace platform
- [Table App Documentation](https://www.contentstack.com/docs/developers/marketplace-apps/table) for the table functionality
- [Vite](https://vitejs.dev/) for the build tool

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/contentstack/marketplace-table-app/issues)
- **Documentation**: [Contentstack Developer Hub](https://www.contentstack.com/docs/developers)
- **Community**: [Contentstack Community](https://community.contentstack.com/)

---

Made with ❤️ by the Contentstack team
