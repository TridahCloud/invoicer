// Dashboard JavaScript

let currentView = 'invoices';
let invoices = [];
let userItems = [];
let clients = [];

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeNavigation();
    loadInvoices();
    attachEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    fetch('api/check-session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.loggedIn) {
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            console.error('Auth check error:', error);
            window.location.href = 'login.html';
        });
}

// Initialize navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.dataset.view;
            switchView(view);
        });
    });
}

// Switch view
function switchView(view) {
    currentView = view;
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-view="${view}"]`).classList.add('active');
    
    // Hide all views
    document.querySelectorAll('.view-container').forEach(container => {
        container.style.display = 'none';
    });
    
    // Show selected view
    const viewMap = {
        'invoices': 'invoicesView',
        'clients': 'clientsView',
        'items': 'itemsView',
        'tags': 'tagsView',
        'profile': 'profileView'
    };
    
    document.getElementById(viewMap[view]).style.display = 'block';
    
    // Update page title
    const titles = {
        'invoices': ['My Invoices', 'Manage and track your invoices'],
        'clients': ['Clients', 'Manage your clients and view statistics'],
        'items': ['Saved Items', 'Manage your reusable invoice items'],
        'tags': ['Tags', 'Organize your invoices with tags'],
        'profile': ['Profile Settings', 'Update your company information']
    };
    
    document.getElementById('pageTitle').textContent = titles[view][0];
    document.getElementById('pageSubtitle').textContent = titles[view][1];
    
    // Load data for view
    if (view === 'invoices') {
        loadInvoices();
    } else if (view === 'clients') {
        loadClients();
    } else if (view === 'items') {
        loadUserItems();
    } else if (view === 'tags') {
        loadTags();
    } else if (view === 'profile') {
        loadProfile();
    }
}

// Attach event listeners
function attachEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Add item modal
    document.getElementById('addItemBtn').addEventListener('click', openAddItemModal);
    document.getElementById('closeModal').addEventListener('click', closeAddItemModal);
    document.getElementById('cancelItem').addEventListener('click', closeAddItemModal);
    document.getElementById('itemForm').addEventListener('submit', saveUserItem);
    
    // Tag modals
    document.getElementById('addTagBtn').addEventListener('click', openTagModal);
    document.getElementById('closeTagModal').addEventListener('click', closeTagModal);
    document.getElementById('cancelTag').addEventListener('click', closeTagModal);
    document.getElementById('tagForm').addEventListener('submit', createTag);
    
    document.getElementById('closeAssignTagsModal').addEventListener('click', closeAssignTagsModal);
    document.getElementById('cancelAssignTags').addEventListener('click', closeAssignTagsModal);
    document.getElementById('saveTagsBtn').addEventListener('click', saveInvoiceTags);
    
    // Client modals
    document.getElementById('addClientBtn').addEventListener('click', openClientModal);
    document.getElementById('closeClientModal').addEventListener('click', closeClientModal);
    document.getElementById('cancelClient').addEventListener('click', closeClientModal);
    document.getElementById('clientForm').addEventListener('submit', saveClient);
    
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', saveProfile);
}

// Load invoices
function loadInvoices() {
    fetch('api/get-invoices.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                invoices = data.invoices;
                allInvoices = data.invoices;
                renderInvoices();
                updateStats();
                loadTags();
            }
        })
        .catch(error => {
            console.error('Error loading invoices:', error);
        });
}

// Render invoices
function renderInvoices() {
    const tbody = document.getElementById('invoicesTableBody');
    
    // Filter by active tag if set
    let displayedInvoices = invoices;
    if (activeTagFilter) {
        displayedInvoices = invoices.filter(invoice => 
            invoice.tags && invoice.tags.some(tag => tag.id == activeTagFilter)
        );
    }
    
    if (displayedInvoices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        <h3>No invoices yet</h3>
                        <p>Create your first invoice to get started</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = displayedInvoices.map(invoice => {
        const tagsHtml = invoice.tags && invoice.tags.length > 0 
            ? invoice.tags.map(tag => `<span class="tag-badge" style="background-color: ${tag.color};">${tag.name}</span>`).join(' ')
            : '<span style="color: var(--gray); font-size: 0.813rem;">No tags</span>';
        
        return `
        <tr>
            <td><strong>${invoice.invoice_number}</strong></td>
            <td>${invoice.client_name || 'N/A'}</td>
            <td>${formatDate(invoice.issue_date)}</td>
            <td>${formatDate(invoice.due_date)}</td>
            <td>
                <select class="status-dropdown status-${invoice.status}" data-invoice-id="${invoice.id}" onchange="updateInvoiceStatus(${invoice.id}, this.value)">
                    <option value="draft" ${invoice.status === 'draft' ? 'selected' : ''}>Draft</option>
                    <option value="sent" ${invoice.status === 'sent' ? 'selected' : ''}>Sent</option>
                    <option value="paid" ${invoice.status === 'paid' ? 'selected' : ''}>Paid</option>
                    <option value="overdue" ${invoice.status === 'overdue' ? 'selected' : ''}>Overdue</option>
                    <option value="cancelled" ${invoice.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td><div class="invoice-tags">${tagsHtml}</div></td>
            <td><strong>${formatCurrency(invoice.total)}</strong></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" data-invoice-id="${invoice.id}" data-invoice-number="${invoice.invoice_number}" onclick="openAssignTagsForInvoice(this)" title="Manage Tags">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                    </button>
                    <button class="action-btn" onclick="editInvoice(${invoice.id})" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteInvoice(${invoice.id})" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
        `;
    }).join('');
}

// Update stats
function updateStats() {
    const stats = {
        draft: 0,
        sent: 0,
        paid: 0,
        total: 0
    };
    
    invoices.forEach(invoice => {
        if (invoice.status === 'draft') stats.draft++;
        else if (invoice.status === 'sent') stats.sent++;
        else if (invoice.status === 'paid') {
            stats.paid++;
            stats.total += parseFloat(invoice.total);
        }
    });
    
    document.getElementById('statDraft').textContent = stats.draft;
    document.getElementById('statSent').textContent = stats.sent;
    document.getElementById('statPaid').textContent = stats.paid;
    document.getElementById('statTotal').textContent = formatCurrency(stats.total);
}

// Edit invoice
function editInvoice(id) {
    window.location.href = `invoice.html?id=${id}`;
}

// Update invoice status
function updateInvoiceStatus(id, newStatus) {
    const dropdown = document.querySelector(`select[data-invoice-id="${id}"]`);
    
    fetch('api/update-invoice-status.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id, status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update local invoices array
            const invoice = invoices.find(inv => inv.id === id);
            if (invoice) {
                invoice.status = newStatus;
                updateStats();
            }
            
            // Update dropdown color immediately
            if (dropdown) {
                // Remove all status classes
                dropdown.className = 'status-dropdown';
                // Add new status class
                dropdown.classList.add(`status-${newStatus}`);
            }
        } else {
            alert('Error updating status: ' + data.message);
            loadInvoices(); // Reload to reset
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating status');
        loadInvoices();
    });
}

// Delete invoice
function deleteInvoice(id) {
    if (!confirm('Are you sure you want to delete this invoice?')) {
        return;
    }
    
    fetch('api/delete-invoice.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadInvoices();
        } else {
            alert('Error deleting invoice: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting invoice');
    });
}

// Load user items
function loadUserItems() {
    fetch('api/get-user-items.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                userItems = data.items;
                renderUserItems();
            }
        })
        .catch(error => {
            console.error('Error loading items:', error);
        });
}

// Render user items
function renderUserItems() {
    const grid = document.getElementById('itemsGrid');
    
    if (userItems.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                </svg>
                <h3>No saved items</h3>
                <p>Create reusable items for faster invoice creation</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = userItems.map(item => `
        <div class="item-card">
            <div class="item-card-header">
                <h4 class="item-name">${item.name}</h4>
                <div class="item-actions">
                    <button class="action-btn" onclick="editUserItem(${item.id})" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteUserItem(${item.id})" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="item-description">${item.description || 'No description'}</p>
            <div class="item-meta">
                <span>${item.unit}</span>
                <strong>${formatCurrency(item.default_price)}</strong>
            </div>
        </div>
    `).join('');
}

// Open add item modal
function openAddItemModal() {
    document.getElementById('addItemModal').classList.add('active');
    document.getElementById('itemForm').reset();
    document.getElementById('editItemId').value = '';
    document.querySelector('#itemForm button[type="submit"]').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
        </svg>
        Save Item
    `;
}

// Close add item modal
function closeAddItemModal() {
    document.getElementById('addItemModal').classList.remove('active');
}

// Edit user item
function editUserItem(id) {
    const item = userItems.find(i => i.id == id);
    if (!item) return;
    
    document.getElementById('editItemId').value = item.id;
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemDescription').value = item.description || '';
    document.getElementById('itemUnit').value = item.unit;
    document.getElementById('itemPrice').value = item.default_price;
    
    document.querySelector('#itemForm button[type="submit"]').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
        </svg>
        Update Item
    `;
    
    document.getElementById('addItemModal').classList.add('active');
}

// Delete user item
function deleteUserItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    fetch('api/delete-user-item.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadUserItems();
        } else {
            alert('Error deleting item: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting item');
    });
}

// Save user item
function saveUserItem(e) {
    e.preventDefault();
    
    const itemId = document.getElementById('editItemId').value;
    const itemData = {
        name: document.getElementById('itemName').value,
        description: document.getElementById('itemDescription').value,
        unit: document.getElementById('itemUnit').value,
        default_price: parseFloat(document.getElementById('itemPrice').value) || 0
    };
    
    if (itemId) {
        itemData.id = itemId;
    }
    
    fetch('api/save-user-item.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeAddItemModal();
            loadUserItems();
        } else {
            alert('Error saving item: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving item');
    });
}

// Load profile
function loadProfile() {
    fetch('api/check-session.php')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn && data.user) {
                const user = data.user;
                document.getElementById('profileCompanyName').value = user.company_name || '';
                document.getElementById('profileCompanyAddress').value = user.company_address || '';
                document.getElementById('profileCompanyPhone').value = user.company_phone || '';
                document.getElementById('profileCompanyEmail').value = user.company_email || '';
                document.getElementById('profileCompanyWebsite').value = user.company_website || '';
                document.getElementById('profileInvoicePrefix').value = user.invoice_prefix || 'INV';
                document.getElementById('profileNextInvoiceNumber').value = user.next_invoice_number || 1;
                document.getElementById('profileBankName').value = user.bank_name || '';
                document.getElementById('profileBankAccountName').value = user.bank_account_name || '';
                document.getElementById('profileBankRoutingLabel').value = user.bank_routing_label || 'Routing Number';
                document.getElementById('profileBankRoutingNumber').value = user.bank_routing_number || '';
                document.getElementById('profileBankAccountNumber').value = user.bank_account_number || '';
                
                // Load logo if exists
                if (user.logo_url) {
                    const logoPreview = document.getElementById('logoPreview');
                    logoPreview.innerHTML = `<img src="${user.logo_url}" alt="Company Logo">`;
                    logoPreview.classList.add('has-logo');
                }
            }
        })
        .catch(error => {
            console.error('Error loading profile:', error);
        });
    
    // Handle logo upload
    document.getElementById('profileLogoInput').addEventListener('change', handleProfileLogoUpload);
}

// Handle profile logo upload
function handleProfileLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('logo', file);
        
        fetch('api/upload-logo.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const logoPreview = document.getElementById('logoPreview');
                logoPreview.innerHTML = `<img src="${data.logo_url}" alt="Company Logo">`;
                logoPreview.classList.add('has-logo');
                alert('Logo uploaded successfully!');
            } else {
                alert('Error uploading logo: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error uploading logo');
        });
    }
}

// Save profile
function saveProfile(e) {
    e.preventDefault();
    
    const profileData = {
        company_name: document.getElementById('profileCompanyName').value,
        company_address: document.getElementById('profileCompanyAddress').value,
        company_phone: document.getElementById('profileCompanyPhone').value,
        company_email: document.getElementById('profileCompanyEmail').value,
        company_website: document.getElementById('profileCompanyWebsite').value,
        invoice_prefix: document.getElementById('profileInvoicePrefix').value,
        next_invoice_number: parseInt(document.getElementById('profileNextInvoiceNumber').value) || 1,
        bank_name: document.getElementById('profileBankName').value,
        bank_account_name: document.getElementById('profileBankAccountName').value,
        bank_routing_label: document.getElementById('profileBankRoutingLabel').value,
        bank_routing_number: document.getElementById('profileBankRoutingNumber').value,
        bank_account_number: document.getElementById('profileBankAccountNumber').value
    };
    
    fetch('api/update-profile.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profile updated successfully!');
        } else {
            alert('Error updating profile: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error updating profile');
    });
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch('api/logout.php')
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Logout error:', error);
                window.location.href = 'index.html';
            });
    }
}

// Utility functions
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0.00';
    return '$' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Tags Management
let allTags = [];
let activeTagFilter = null;
let allInvoices = [];

function loadTags() {
    fetch('api/get-tags.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allTags = data.tags || [];
                displayTags();
                updateTagFilters();
            }
        })
        .catch(error => console.error('Error loading tags:', error));
}

function displayTags() {
    const tagsGrid = document.getElementById('tagsGrid');
    
    if (allTags.length === 0) {
        tagsGrid.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                <h3>No tags yet</h3>
                <p>Create tags to organize your invoices</p>
            </div>
        `;
        return;
    }
    
    tagsGrid.innerHTML = allTags.map(tag => `
        <div class="tag-card">
            <div class="tag-info">
                <div class="tag-color-dot" style="background-color: ${tag.color};"></div>
                <span class="tag-name">${tag.name}</span>
            </div>
            <div class="tag-actions">
                <button class="btn-icon" onclick="deleteTag(${tag.id})" title="Delete tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function createTag(e) {
    e.preventDefault();
    
    const name = document.getElementById('tagName').value.trim();
    const color = document.querySelector('input[name="tagColor"]:checked').value;
    
    if (!name) return;
    
    fetch('api/create-tag.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, color })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeTagModal();
            loadTags();
            document.getElementById('tagForm').reset();
        } else {
            alert('Error creating tag: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error creating tag');
    });
}

function deleteTag(tagId) {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    
    fetch('api/delete-tag.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: tagId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTags();
            loadInvoices();
        } else {
            alert('Error deleting tag: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting tag');
    });
}

function openAssignTagsForInvoice(button) {
    const invoiceId = button.getAttribute('data-invoice-id');
    const invoiceNumber = button.getAttribute('data-invoice-number');
    
    // Find the invoice to get its tags
    const invoice = invoices.find(inv => inv.id == invoiceId);
    const currentTags = invoice ? (invoice.tags || []) : [];
    
    openAssignTagsModal(invoiceId, invoiceNumber, currentTags);
}

function openAssignTagsModal(invoiceId, invoiceNumber, currentTags) {
    document.getElementById('assignInvoiceId').value = invoiceId;
    document.getElementById('assignInvoiceNumber').textContent = invoiceNumber;
    
    const checkboxesContainer = document.getElementById('tagCheckboxes');
    checkboxesContainer.innerHTML = allTags.map(tag => {
        const isChecked = currentTags.some(t => t.id === tag.id);
        return `
            <label class="tag-checkbox-option">
                <input type="checkbox" value="${tag.id}" ${isChecked ? 'checked' : ''}>
                <div class="tag-color-dot" style="background-color: ${tag.color};"></div>
                <span>${tag.name}</span>
            </label>
        `;
    }).join('');
    
    document.getElementById('assignTagsModal').classList.add('active');
}

function saveInvoiceTags() {
    const invoiceId = document.getElementById('assignInvoiceId').value;
    const checkboxes = document.querySelectorAll('#tagCheckboxes input[type="checkbox"]:checked');
    const tagIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    fetch('api/assign-invoice-tags.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ invoice_id: parseInt(invoiceId), tag_ids: tagIds })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeAssignTagsModal();
            loadInvoices();
        } else {
            alert('Error saving tags: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving tags');
    });
}

function updateTagFilters() {
    const tagFilterBar = document.getElementById('tagFilterBar');
    const tagFilters = document.getElementById('tagFilters');
    
    if (allTags.length === 0) {
        tagFilterBar.style.display = 'none';
        return;
    }
    
    tagFilterBar.style.display = 'flex';
    tagFilters.innerHTML = allTags.map(tag => `
        <div class="filter-tag ${activeTagFilter === tag.id ? 'active' : ''}" 
             style="background-color: ${tag.color}; color: white;"
             onclick="toggleTagFilter(${tag.id})">
            ${tag.name}
        </div>
    `).join('');
}

function toggleTagFilter(tagId) {
    if (activeTagFilter === tagId) {
        activeTagFilter = null;
    } else {
        activeTagFilter = tagId;
    }
    updateTagFilters();
    renderInvoices();
}

function openTagModal() {
    document.getElementById('addTagModal').classList.add('active');
}

function closeTagModal() {
    document.getElementById('addTagModal').classList.remove('active');
}

function closeAssignTagsModal() {
    document.getElementById('assignTagsModal').classList.remove('active');
}

// Client Management
function loadClients() {
    fetch('api/get-clients.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                clients = data.clients || [];
                renderClients();
            }
        })
        .catch(error => console.error('Error loading clients:', error));
}

function renderClients() {
    const tbody = document.getElementById('clientsTableBody');
    
    if (clients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    <div class="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                        </svg>
                        <h3>No clients yet</h3>
                        <p>Add clients to quickly populate invoice details</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = clients.map(client => `
        <tr>
            <td><strong>${client.name}</strong></td>
            <td>${client.email || '-'}</td>
            <td>${client.phone || '-'}</td>
            <td><strong>${client.invoice_count || 0}</strong></td>
            <td>${formatCurrency(client.total_invoiced)}</td>
            <td><span class="badge badge-success">${formatCurrency(client.total_paid)}</span></td>
            <td><span class="badge badge-danger">${formatCurrency(client.total_overdue)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="editClient(${client.id})" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteClient(${client.id})" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openClientModal() {
    document.getElementById('clientModalTitle').textContent = 'Add Client';
    document.getElementById('editClientId').value = '';
    document.getElementById('clientForm').reset();
    document.getElementById('addClientModal').classList.add('active');
}

function closeClientModal() {
    document.getElementById('addClientModal').classList.remove('active');
}

function editClient(clientId) {
    const client = clients.find(c => c.id == clientId);
    if (!client) return;
    
    document.getElementById('clientModalTitle').textContent = 'Edit Client';
    document.getElementById('editClientId').value = client.id;
    document.getElementById('clientName').value = client.name || '';
    document.getElementById('clientEmail').value = client.email || '';
    document.getElementById('clientPhone').value = client.phone || '';
    document.getElementById('clientAddress').value = client.address || '';
    document.getElementById('clientCity').value = client.city || '';
    document.getElementById('clientState').value = client.state || '';
    document.getElementById('clientZip').value = client.zip || '';
    document.getElementById('clientCountry').value = client.country || '';
    document.getElementById('clientNotes').value = client.notes || '';
    
    document.getElementById('addClientModal').classList.add('active');
}

function saveClient(e) {
    e.preventDefault();
    
    const clientData = {
        id: document.getElementById('editClientId').value || null,
        name: document.getElementById('clientName').value.trim(),
        email: document.getElementById('clientEmail').value.trim(),
        phone: document.getElementById('clientPhone').value.trim(),
        address: document.getElementById('clientAddress').value.trim(),
        city: document.getElementById('clientCity').value.trim(),
        state: document.getElementById('clientState').value.trim(),
        zip: document.getElementById('clientZip').value.trim(),
        country: document.getElementById('clientCountry').value.trim(),
        notes: document.getElementById('clientNotes').value.trim()
    };
    
    if (clientData.id) {
        clientData.id = parseInt(clientData.id);
    }
    
    fetch('api/save-client.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(clientData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(clientData.id ? 'Client updated successfully!' : 'Client created successfully!');
            closeClientModal();
            loadClients();
        } else {
            alert('Error saving client: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving client');
    });
}

function deleteClient(clientId) {
    if (!confirm('Are you sure you want to delete this client? Their invoices will remain but will no longer be linked to this client.')) return;
    
    fetch('api/delete-client.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id: clientId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadClients();
        } else {
            alert('Error deleting client: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting client');
    });
}

