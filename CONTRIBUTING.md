# Contributing to PumpPanda Trading Agent

Thank you for your interest in contributing to PumpPanda! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### 1. Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/pump-panda-trading-agent.git
cd pump-panda-trading-agent

# Add the original repository as upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/pump-panda-trading-agent.git
```

### 2. Create a Feature Branch
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-description
```

### 3. Make Your Changes
- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes
```bash
# Run the test suite
npm test

# Run specific tests
npm run test:pump-panda

# Check for linting issues
npm run lint

# Build the project
npm run build
```

### 5. Commit Your Changes
```bash
# Use conventional commit messages
git commit -m "feat: add new trading strategy for meme tokens"
git commit -m "fix: resolve blockchain connection timeout issue"
git commit -m "docs: update configuration guide with new parameters"
```

### 6. Push and Create a Pull Request
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear description of changes
- Reference to any related issues
- Screenshots if UI changes
- Test results

## 📋 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- TypeScript knowledge

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp env.template .env
# Edit .env with your configuration

# Run in development mode
npm run dev

# Run tests
npm test

# Build project
npm run build
```

## 🏗️ Project Structure

```
src/
├── core/           # Core agent logic
├── config/         # Configuration management
├── blockchain/     # Blockchain interactions
├── dex/           # DEX integrations
├── market/        # Market data management
├── strategy/      # Trading strategies
├── risk/          # Risk management
├── portfolio/     # Portfolio tracking
├── memory/        # Recall memory system
├── performance/   # Performance analytics
├── utils/         # Utility functions
└── examples/      # Example scripts
```

## 📝 Code Style Guidelines

### TypeScript
- Use strict TypeScript settings
- Prefer interfaces over types for objects
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Error Handling
- Use try-catch blocks appropriately
- Log errors with context
- Provide user-friendly error messages
- Handle edge cases gracefully

### Testing
- Write unit tests for all new functionality
- Aim for >80% code coverage
- Use descriptive test names
- Mock external dependencies

## 🧪 Testing Guidelines

### Running Tests
```bash
# All tests
npm test

# Specific test file
npm test -- --testNamePattern="PumpPanda"

# With coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

### Writing Tests
```typescript
describe('PumpPandaAgent', () => {
  describe('initialize', () => {
    it('should initialize all components successfully', async () => {
      // Arrange
      const agent = new PumpPandaAgent(config);
      
      // Act
      await agent.initialize();
      
      // Assert
      expect(agent.isInitialized()).toBe(true);
    });
  });
});
```

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for all public methods
- Include examples in complex functions
- Document configuration options
- Keep README.md updated

### API Documentation
- Document all public interfaces
- Include usage examples
- Specify parameter types and constraints
- Document error conditions

## 🐛 Bug Reports

### Before Reporting
- Check existing issues
- Search the documentation
- Try to reproduce the issue
- Check if it's a configuration issue

### Bug Report Template
```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 10, macOS 12]
- Node.js version: [e.g., 18.15.0]
- PumpPanda version: [e.g., 1.0.0]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the requested feature

**Use Case**
Why this feature would be useful

**Proposed Implementation**
How you think it could be implemented

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Any other relevant information
```

## 🔒 Security

### Security Guidelines
- Never commit private keys or sensitive data
- Use environment variables for secrets
- Validate all user inputs
- Follow security best practices
- Report security vulnerabilities privately

### Reporting Security Issues
If you find a security vulnerability, please:
1. **DO NOT** create a public issue
2. Email security@yourdomain.com
3. Include detailed description
4. Wait for response before disclosure

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No sensitive data is included
- [ ] Commit messages are conventional

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🏷️ Release Process

### Versioning
We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes written
- [ ] GitHub release created

## 🤝 Community Guidelines

### Be Respectful
- Treat all contributors with respect
- Be patient with newcomers
- Provide constructive feedback
- Help others learn and grow

### Communication
- Use clear, concise language
- Ask questions when unsure
- Share knowledge and experiences
- Be open to different approaches

## 📞 Getting Help

### Questions and Support
- Check the documentation first
- Search existing issues
- Ask in GitHub Discussions
- Join our community chat

### Contact Information
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/pump-panda-trading-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/pump-panda-trading-agent/discussions)
- **Email**: support@yourdomain.com

## 🙏 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Project documentation
- Release notes
- Community acknowledgments

---

Thank you for contributing to PumpPanda! 🐼

Your contributions help make this project better for everyone in the crypto trading community.
