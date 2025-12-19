# Contributing to myAI Maestro

Thank you for considering contributing to myAI Maestro! This document provides guidelines and instructions for contributing.

## 🤝 How Can I Contribute?

### Reporting Bugs

If you find a bug, please open an issue with:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs. actual behavior
- **Environment details** (browser, OS, Node version)
- **Screenshots** if applicable
- **Error messages** from console

### Suggesting Enhancements

Feature requests are welcome! Please include:

- **Use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - What else did you think about?
- **Additional context** - Screenshots, mockups, etc.

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

## 🛠️ Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Gemini API key (for testing)

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/myAI-Mastro.git
cd myAI-Mastro

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Add your API key to .env.local
# GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

Visit http://localhost:3000 to see the app.

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### React

- Use functional components with hooks
- Keep components focused and small
- Extract reusable logic to custom hooks
- Use proper prop types

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Follow existing code patterns
- Use meaningful commit messages

### File Organization

```
myAI-Mastro/
├── components/       # React components
├── services/        # API services
├── types.ts         # TypeScript types
├── constants.tsx    # Constants
└── App.tsx          # Main app
```

## 🧪 Testing

### Before Submitting

- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] App runs in dev mode: `npm run dev`
- [ ] App works in production mode: `npm run preview`
- [ ] No console errors
- [ ] All features still work

### Manual Testing

Test these key features:
- Contract Builder flow
- Orchestration View
- Governance View
- Lineage View
- Automation View
- ChatBot functionality

## 📋 Pull Request Process

1. **Update the README** if adding features
2. **Update documentation** for API changes
3. **Follow the PR template** (if available)
4. **Link related issues** in PR description
5. **Request review** from maintainers

### PR Title Format

```
feat: Add new feature X
fix: Resolve issue with Y
docs: Update deployment guide
style: Format code in component Z
refactor: Improve service implementation
```

### PR Description Should Include

- **What**: What changes were made?
- **Why**: Why were these changes necessary?
- **How**: How do the changes work?
- **Testing**: How was this tested?
- **Screenshots**: If UI changes were made

## 🌳 Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Test additions

## 💬 Communication

- Be respectful and constructive
- Provide context in discussions
- Ask questions if unclear
- Be patient with reviews

## 🔒 Security

- Never commit API keys or secrets
- Report security issues privately
- Follow [SECURITY.md](SECURITY.md) guidelines

## 📜 Code of Conduct

### Our Standards

- **Be respectful** of differing viewpoints
- **Be collaborative** and help others
- **Be professional** in all interactions
- **Be patient** with newcomers
- **Be constructive** in feedback

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing private information
- Spam or off-topic content

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## 🎯 First Time Contributors

New to open source? Welcome! Here are good first issues:

- Documentation improvements
- Adding tests
- Fixing typos
- Improving error messages
- Adding code comments

Don't hesitate to ask questions!

## 🚀 Release Process

For maintainers:

1. Update version in `package.json`
2. Update CHANGELOG
3. Create git tag
4. Push to GitHub
5. Deploy to production

## 📞 Getting Help

- Check existing issues
- Read the documentation
- Ask in discussions
- Reach out to maintainers

## 🎉 Recognition

Contributors will be:
- Added to CONTRIBUTORS.md (if created)
- Mentioned in release notes
- Recognized in the community

Thank you for contributing! 🙏
