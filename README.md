# Invoicer 💼

A free, modern, and beautiful web-based invoice generator. Create professional invoices in seconds, track their status, manage clients, and organize with tags - all completely free.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-green.svg)
![PHP](https://img.shields.io/badge/PHP-7.4+-777BB4.svg)
![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1.svg)

## 🌐 Live Demo

**✨ Try it now:** [https://invoicer.tridah.cloud](https://invoicer.tridah.cloud)

No installation required - start creating professional invoices instantly!

---

## 📸 Preview

Create beautiful, professional invoices with:
- ✏️ **Inline editing** - Click and type anywhere
- 🎨 **Modern design** - Impress your clients
- 📱 **Mobile friendly** - Works on any device
- 🖨️ **Print perfect** - A4 optimized layout

## ✨ Features

### 🎯 Core Features (Everyone)
- **⚡ Quick Invoice Creation** - Create professional invoices instantly without signing up
- **🎨 Beautiful Design** - Modern, sleek interface with A4 page simulation
- **✏️ Inline Editing** - Edit invoice details directly on the page, no clunky forms
- **🧮 Auto-Calculations** - Automatic line item calculations, tax, and totals
- **🖨️ Print Ready** - Perfect for printing or saving as PDF
- **🏦 Bank Details** - Add payment information with customizable routing labels (BSB, Sort Code, etc.)
- **🎛️ Customization** - Show/hide individual sections (dates, addresses, bank details, etc.)
- **💯 100% Free** - No hidden costs, no premium tiers, no ads

### 🔐 Premium Features (Free with Account)
- **💾 Save & Track** - Store unlimited invoices in one place
- **📊 Dashboard** - Beautiful analytics dashboard with statistics
- **👥 Client Management** - Store client details with invoice history and financial overview
  - Track invoices per client
  - Monitor total invoiced, paid, and overdue amounts
  - Quick import to invoices
- **🏷️ Tags & Organization** - Create custom color-coded tags to organize invoices
  - Filter invoices by tag
  - Multiple tags per invoice
- **📦 Pre-made Items** - Save commonly used items for quick invoice creation
- **🔢 Auto-Numbering** - Custom invoice prefix with auto-incrementing numbers
- **🏢 Company Profile** - Save company details, logo, and bank info for auto-fill
- **⚙️ Saved Preferences** - Invoice customization settings saved across devices
- **📈 Statistics** - Track drafts, sent, paid, and overdue invoices
- **🎯 Status Management** - Track invoice status with visual indicators

## 🚀 Getting Started

### Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache/Nginx)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TridahCloud/invoicer.git
   cd invoicer
   ```

2. **Set up the database**
   - Create a MySQL database
   - Import the schema:
   ```bash
   mysql -u your_user -p your_database < database/schema.sql
   ```

3. **Configure database connection**
   - Edit `config/database.php` with your database credentials:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'invoicer');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   ```

4. **Configure base URL** (if not in root directory)
   - Edit `config/config.php`:
   ```php
   define('BASE_URL', '/invoicer'); // Change based on your setup
   ```

5. **Create uploads directory**
   ```bash
   mkdir -p uploads/logos
   chmod 755 uploads
   chmod 755 uploads/logos
   ```

6. **Access the application**
   - Open your browser and navigate to your configured URL
   - Example: `http://localhost/invoicer`
   
For detailed installation instructions, see [INSTALLATION.md](INSTALLATION.md)

## 📖 Usage

### Creating an Invoice (Guest Mode)

1. Click **"Create Now"** on the homepage
2. Click on any field to edit it inline
3. Add/remove line items as needed
4. Calculations happen automatically
5. Customize what sections to show (dates, addresses, bank details, etc.)
6. Print or download as PDF

### Creating an Account

1. Click **"Get Started"** on the homepage
2. Enter your email and create a password
3. Complete your company profile
4. Set invoice prefix and starting number
5. Add bank details for payment information
6. Start creating and saving invoices!

### Managing Clients

1. Go to **"Clients"** in the dashboard
2. Click "Add Client" and enter their details
3. View statistics per client (invoices, total invoiced, paid, overdue)
4. When creating invoices, click "Import Client" to auto-fill details

### Managing Invoices (Logged In)

1. View all invoices from your dashboard with real-time stats
2. Filter by tags or view all
3. Update status directly from the table (Draft, Sent, Paid, Overdue, Cancelled)
4. Assign color-coded tags for organization
5. Edit invoices by clicking the edit icon
6. Track total revenue and invoice counts

### Using Tags

1. Go to **"Tags"** in the dashboard
2. Create tags with custom names and colors
3. Assign multiple tags to any invoice
4. Filter invoices by clicking tags in the filter bar

### Saving Reusable Items

1. Go to **"Saved Items"** in the dashboard
2. Click "Add New Item"
3. Enter item details and default price
4. When creating invoices, items appear in the quick-add library

## 🎨 Design Philosophy

Invoicer was designed with a modern tech startup aesthetic in mind:

- **Minimalist** - Clean, uncluttered interface focusing on what matters
- **Intuitive** - Everything works as you'd expect, no learning curve
- **Fast** - No page reloads, instant calculations, optimized performance
- **Professional** - Invoices that impress clients and look credible
- **Accessible** - Easy to use for everyone, from freelancers to businesses
- **Flexible** - Works for any industry, any country, any currency

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Design**: Custom CSS with modern gradients and shadows
- **Icons**: Custom SVG icons

## 📁 Project Structure

```
invoicer/
├── api/                          # PHP backend API
│   ├── check-session.php         # Session validation
│   ├── login.php                 # User login
│   ├── signup.php                # User registration
│   ├── logout.php                # User logout
│   ├── save-invoice.php          # Save/update invoice
│   ├── get-invoice.php           # Get single invoice
│   ├── get-invoices.php          # Get all user invoices
│   ├── delete-invoice.php        # Delete invoice
│   ├── update-invoice-status.php # Update invoice status
│   ├── get-clients.php           # Get all clients
│   ├── save-client.php           # Save/update client
│   ├── delete-client.php         # Delete client
│   ├── get-tags.php              # Get user tags
│   ├── create-tag.php            # Create new tag
│   ├── delete-tag.php            # Delete tag
│   ├── assign-invoice-tags.php   # Assign tags to invoice
│   ├── get-user-items.php        # Get user's saved items
│   ├── save-user-item.php        # Save new item
│   ├── delete-user-item.php      # Delete item
│   ├── update-profile.php        # Update user profile
│   ├── upload-logo.php           # Upload company logo
│   ├── save-customizations.php   # Save invoice preferences
│   ├── get-stats.php             # Get platform statistics
│   └── track-anonymous-invoice.php # Track anonymous usage
├── assets/
│   ├── css/
│   │   ├── style.css             # Main stylesheet
│   │   ├── invoice.css           # Invoice page styles
│   │   ├── customize.css         # Customization sidebar
│   │   ├── auth.css              # Authentication styles
│   │   └── dashboard.css         # Dashboard styles
│   └── js/
│       ├── invoice.js            # Invoice functionality
│       ├── auth.js               # Authentication logic
│       └── dashboard.js          # Dashboard functionality
├── config/
│   ├── config.php                # Global configuration
│   └── database.php              # Database connection
├── database/
│   ├── schema.sql                # Full database schema
│   └── add_customizations_column.sql # Migration script
├── uploads/
│   └── logos/                    # User uploaded logos
├── index.html                    # Homepage
├── invoice.html                  # Invoice creator
├── login.html                    # Login page
├── signup.html                   # Registration page
├── dashboard.html                # User dashboard
├── .htaccess                     # Apache configuration
├── robots.txt                    # SEO robots file
├── LICENSE                       # MIT License
├── README.md                     # This file
├── INSTALLATION.md               # Detailed setup guide
└── CONTRIBUTING.md               # Contribution guidelines
```

## 🔒 Security Features

- Password hashing with bcrypt
- Prepared SQL statements (PDO)
- Session management with timeout
- CSRF protection ready
- Input validation and sanitization
- SQL injection protection

## 🎯 Key Highlights

- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🌍 International Support** - Customizable bank routing labels (Routing Number, BSB, Sort Code, IBAN, etc.)
- **🎨 Customizable Invoice Display** - Toggle individual sections on/off
- **📊 Real-time Statistics** - Track usage metrics on homepage
- **🔐 Secure** - Bcrypt password hashing, prepared statements, session management
- **⚡ Fast** - No page reloads, instant calculations, optimized queries
- **💼 Professional** - Clean, modern invoices that impress clients

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

Quick start:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌐 About Tridah

Invoicer is provided by **Tridah**, dedicated to creating useful, free tools for freelancers, small businesses, and entrepreneurs worldwide. Our mission is to make professional business tools accessible to everyone, regardless of budget.

**Why Free?**
- ✅ No paywalls or feature restrictions
- ✅ No ads or sponsored content  
- ✅ Open source for transparency
- ✅ Community-driven development

Visit our live platform: [invoicer.tridah.cloud](https://invoicer.tridah.cloud)

## 💡 Roadmap

Future features we're considering:

- [ ] Multi-currency support
- [ ] Recurring invoices
- [ ] Email invoice directly to clients
- [ ] More export formats (Excel, CSV)
- [ ] Custom invoice templates
- [ ] Multi-language support
- [ ] Mobile app (iOS/Android)
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Expense tracking
- [ ] Advanced reports and analytics
- [ ] Invoice reminders
- [ ] Bulk operations
- [ ] API access

## 🎨 Screenshots

### Invoice Creator
Beautiful, modern invoice creation with inline editing and real-time calculations.

### Dashboard
Track all your invoices, clients, and statistics in one place.

### Client Management
Manage clients with complete financial overview and invoice history.

### Tags & Organization
Color-coded tags for easy invoice organization and filtering.

## 🐛 Bug Reports

Found a bug? Please open an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 📧 Contact & Support

- 🌐 **Live Demo**: [invoicer.tridah.cloud](https://invoicer.tridah.cloud)
- 💻 **GitHub**: [@TridahCloud](https://github.com/TridahCloud)
- 🐛 **Issues**: [GitHub Issues](https://github.com/TridahCloud/invoicer/issues)
- 📖 **Docs**: See [INSTALLATION.md](INSTALLATION.md) for setup guide

## 🙏 Acknowledgments

- Icons: Custom SVG designs
- Fonts: Inter by Rasmus Andersson
- Inspiration: Modern SaaS applications

## 📊 Platform Statistics

The live platform tracks real-time usage:
- Total registered users
- Invoices generated (including anonymous)
- Total value of paid invoices

Visit [invoicer.tridah.cloud](https://invoicer.tridah.cloud) to see live stats!

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub! It helps others discover the tool.

---

**Made with ❤️ by [Tridah](https://github.com/TridahCloud)**

Free Forever • Open Source • Community Driven

[Live Demo](https://invoicer.tridah.cloud) • [Report Bug](https://github.com/TridahCloud/invoicer/issues) • [Request Feature](https://github.com/TridahCloud/invoicer/issues)

