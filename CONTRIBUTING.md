# Contributing to Invoicer

First off, thank you for considering contributing to Invoicer! It's people like you that make Invoicer such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected
- **Include screenshots** if relevant
- **Include your environment details** (PHP version, browser, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List some examples** of how it would be used

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/TridahCloud/invoicer.git
cd invoicer

# Set up database
mysql -u root -p < database/schema.sql

# Configure your local environment
cp config/database.php.example config/database.php
# Edit config/database.php with your credentials
```

## Coding Standards

### PHP
- Follow PSR-12 coding standards
- Use meaningful variable and function names
- Add comments for complex logic
- Use prepared statements for all database queries
- Validate and sanitize all user input

### JavaScript
- Use ES6+ features where appropriate
- Use meaningful variable names
- Add comments for complex functions
- Keep functions small and focused
- Use async/await for asynchronous operations

### HTML/CSS
- Use semantic HTML5 elements
- Follow BEM naming convention for CSS classes
- Keep CSS organized by component
- Use CSS variables for colors and spacing
- Ensure responsive design works on all devices

### Database
- Use meaningful table and column names
- Add indexes for frequently queried columns
- Include proper foreign key constraints
- Document complex queries

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Examples:
```
Add multi-currency support

- Add currency field to invoices table
- Implement currency converter API
- Update invoice template to display currency
- Add currency selector to settings

Fixes #123
```

## Testing

Before submitting a pull request:

1. **Test manually** in multiple browsers
2. **Test different screen sizes** (responsive design)
3. **Test with and without JavaScript** enabled
4. **Check for PHP errors** (enable error reporting in development)
5. **Test database operations** (create, read, update, delete)
6. **Test security** (SQL injection, XSS, CSRF)

## Documentation

- Update README.md if you change functionality
- Update INSTALLATION.md if you change setup process
- Add inline code comments for complex logic
- Document new API endpoints
- Update database schema documentation

## Project Structure

Understanding the project structure:

```
invoicer/
├── api/              # Backend PHP endpoints
├── assets/
│   ├── css/          # Stylesheets
│   └── js/           # JavaScript files
├── config/           # Configuration files
├── database/         # Database schemas and migrations
├── *.html            # Frontend pages
└── docs/             # Additional documentation
```

## Features We're Looking For

- Multi-currency support
- Recurring invoices
- Email notifications
- Export to various formats (PDF, Excel, CSV)
- Invoice templates
- Multi-language support
- Payment gateway integration
- Expense tracking
- Advanced reporting

## Questions?

Feel free to open an issue with the `question` label if you need help or have questions about contributing.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Invoicer! 🎉

