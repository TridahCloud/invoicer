// Invoice Creator JavaScript

let rowCounter = 1;
let isLoggedIn = false; // Will be set by PHP session check
let currentUser = null; // Store current user data
let selectedClientId = null; // Store selected client ID for invoice
let availableClients = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeDates();
    attachEventListeners();
    calculateTotals();
    checkLoginStatus();
    // loadCustomizations will be called after checkLoginStatus to use server data if logged in
    
    // Auto-save for logged-in users (every 30 seconds)
    if (isLoggedIn) {
        setInterval(autoSave, 30000);
    }
});

// Initialize default dates
function initializeDates() {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    document.getElementById('issueDate').value = today;
    document.getElementById('dueDate').value = dueDateStr;
}

// Attach event listeners
function attachEventListeners() {
    // Add item button
    document.getElementById('addItemBtn').addEventListener('click', addNewRow);
    
    // Print button
    document.getElementById('printBtn').addEventListener('click', function() {
        // Track anonymous invoice creation
        if (!isLoggedIn) {
            trackAnonymousInvoice();
        }
        window.print();
    });
    
    // Download PDF button
    document.getElementById('downloadBtn').addEventListener('click', downloadPDF);
    
    // Save button (for logged-in users)
    document.getElementById('saveBtn').addEventListener('click', saveInvoice);
    
    // Logo upload
    document.getElementById('logoUpload').addEventListener('click', function() {
        document.getElementById('logoInput').click();
    });
    
    document.getElementById('logoInput').addEventListener('change', handleLogoUpload);
    
    // Tax rate change
    document.getElementById('taxRate').addEventListener('input', calculateTotals);
    
    // Item calculations
    document.getElementById('itemsBody').addEventListener('input', function(e) {
        if (e.target.classList.contains('item-qty') || 
            e.target.classList.contains('item-rate')) {
            const row = e.target.closest('.item-row');
            calculateRowTotal(row);
        }
    });
    
    // Remove item buttons
    document.getElementById('itemsBody').addEventListener('click', function(e) {
        if (e.target.closest('.btn-remove')) {
            const row = e.target.closest('.item-row');
            removeRow(row);
        }
    });
    
    // Customization sidebar
    document.getElementById('customizeBtn').addEventListener('click', openCustomizeSidebar);
    document.getElementById('closeCustomize').addEventListener('click', closeCustomizeSidebar);
    document.getElementById('customizeOverlay').addEventListener('click', closeCustomizeSidebar);
    
    // Client import
    const importClientBtn = document.getElementById('importClientBtn');
    if (importClientBtn) {
        importClientBtn.addEventListener('click', openClientImportSidebar);
    }
    const closeClientImport = document.getElementById('closeClientImport');
    if (closeClientImport) {
        closeClientImport.addEventListener('click', closeClientImportSidebar);
    }
    const clientImportOverlay = document.getElementById('clientImportOverlay');
    if (clientImportOverlay) {
        clientImportOverlay.addEventListener('click', closeClientImportSidebar);
    }
    
    // Toggle listeners for customization
    document.getElementById('toggle-logo').addEventListener('change', function(e) {
        toggleSection('logo', e.target.checked);
    });
    document.getElementById('toggle-invoice-number').addEventListener('change', function(e) {
        toggleSection('invoice-number', e.target.checked);
    });
    document.getElementById('toggle-issue-date').addEventListener('change', function(e) {
        toggleSection('issue-date', e.target.checked);
    });
    document.getElementById('toggle-due-date').addEventListener('change', function(e) {
        toggleSection('due-date', e.target.checked);
    });
    document.getElementById('toggle-status').addEventListener('change', function(e) {
        toggleSection('status', e.target.checked);
    });
    document.getElementById('toggle-company-address').addEventListener('change', function(e) {
        toggleSection('company-address', e.target.checked);
    });
    document.getElementById('toggle-company-email').addEventListener('change', function(e) {
        toggleSection('company-email', e.target.checked);
    });
    document.getElementById('toggle-company-phone').addEventListener('change', function(e) {
        toggleSection('company-phone', e.target.checked);
    });
    document.getElementById('toggle-client-section').addEventListener('change', function(e) {
        toggleSection('client-section', e.target.checked);
    });
    document.getElementById('toggle-client-address').addEventListener('change', function(e) {
        toggleSection('client-address', e.target.checked);
    });
    document.getElementById('toggle-client-email').addEventListener('change', function(e) {
        toggleSection('client-email', e.target.checked);
    });
    document.getElementById('toggle-notes').addEventListener('change', function(e) {
        toggleSection('notes', e.target.checked);
    });
    document.getElementById('toggle-bank-details').addEventListener('change', function(e) {
        toggleSection('bank-details', e.target.checked);
    });
    document.getElementById('toggle-footer').addEventListener('change', function(e) {
        toggleSection('footer', e.target.checked);
    });
}

// Add new row
function addNewRow() {
    rowCounter++;
    const tbody = document.getElementById('itemsBody');
    const newRow = document.createElement('tr');
    newRow.className = 'item-row';
    newRow.dataset.row = rowCounter;
    newRow.innerHTML = `
        <td>
            <div class="editable item-description" contenteditable="true" data-placeholder="Service or product description"></div>
        </td>
        <td>
            <input type="number" class="item-input item-qty" value="1" min="0" step="1">
        </td>
        <td>
            <input type="text" class="item-input item-unit" value="items" placeholder="items">
        </td>
        <td>
            <div class="currency-input">
                <span class="currency-symbol">$</span>
                <input type="number" class="item-input item-rate" value="0.00" min="0" step="0.01">
            </div>
        </td>
        <td>
            <div class="item-amount">$0.00</div>
        </td>
        <td>
            <button class="btn-remove" title="Remove item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </td>
    `;
    tbody.appendChild(newRow);
    
    // Focus on description
    newRow.querySelector('.item-description').focus();
}

// Remove row
function removeRow(row) {
    const tbody = document.getElementById('itemsBody');
    if (tbody.children.length > 1) {
        row.remove();
        calculateTotals();
    } else {
        alert('Invoice must have at least one item.');
    }
}

// Calculate row total
function calculateRowTotal(row) {
    const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
    const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
    const amount = qty * rate;
    
    row.querySelector('.item-amount').textContent = formatCurrency(amount);
    calculateTotals();
}

// Calculate all totals
function calculateTotals() {
    const rows = document.querySelectorAll('.item-row');
    let subtotal = 0;
    
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        subtotal += qty * rate;
    });
    
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    document.getElementById('subtotalValue').textContent = formatCurrency(subtotal);
    document.getElementById('taxValue').textContent = formatCurrency(taxAmount);
    document.getElementById('totalValue').textContent = formatCurrency(total);
}

// Format currency
function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Logo upload handler
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const logoUpload = document.getElementById('logoUpload');
            logoUpload.innerHTML = `<img src="${event.target.result}" alt="Company Logo">`;
            logoUpload.classList.add('has-logo');
        };
        reader.readAsDataURL(file);
    }
}

// Download PDF (using browser print to PDF)
function downloadPDF() {
    // Track anonymous invoice creation
    if (!isLoggedIn) {
        trackAnonymousInvoice();
    }
    
    // In a production environment, you'd use a library like jsPDF or html2pdf
    // For now, we'll use the browser's print to PDF functionality
    alert('Please use your browser\'s Print function and select "Save as PDF" as the destination.');
    window.print();
}

// Track anonymous invoice creation
function trackAnonymousInvoice() {
    // Check if we already tracked this session
    if (sessionStorage.getItem('invoiceTracked')) {
        return;
    }
    
    fetch('api/track-anonymous-invoice.php', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem('invoiceTracked', 'true');
        }
    })
    .catch(error => {
        console.error('Error tracking invoice:', error);
    });
}

// Check login status
function checkLoginStatus() {
    // Check if editing existing invoice from URL first
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    
    if (invoiceId) {
        window.currentInvoiceId = parseInt(invoiceId);
    }
    
    fetch('api/check-session.php')
        .then(response => response.json())
        .then(data => {
            isLoggedIn = data.loggedIn;
            
            if (isLoggedIn) {
                document.getElementById('saveBtn').style.display = 'inline-flex';
                document.getElementById('statusRow').style.display = 'flex';
                const importBtn = document.getElementById('importClientBtn');
                if (importBtn) importBtn.style.display = 'inline-flex';
                
                loadUserData(data.user);
                loadUserItems();
                loadAvailableClients();
                
                // Load customizations from database
                loadCustomizations(data.user?.invoice_customizations);
                
                // Update back button to go to dashboard
                const backLink = document.querySelector('.toolbar-btn[href]');
                if (backLink) {
                    backLink.href = 'dashboard.html';
                }
                
                // Load existing invoice if editing
                if (window.currentInvoiceId) {
                    loadInvoice(window.currentInvoiceId);
                }
            } else {
                // Not logged in, load from localStorage
                loadCustomizations();
            }
        })
        .catch(error => {
            console.error('Error checking session:', error);
        });
}

// Load user data
function loadUserData(user) {
    currentUser = user; // Store user data globally
    
    if (user.company_name) {
        document.querySelector('.company-name').textContent = user.company_name;
    }
    if (user.company_address) {
        const addressLines = user.company_address.split('\n');
        const detailElements = document.querySelectorAll('.company-detail');
        addressLines.forEach((line, index) => {
            if (detailElements[index]) {
                detailElements[index].textContent = line;
            }
        });
    }
    if (user.company_email) {
        document.querySelectorAll('.company-detail')[2].textContent = user.company_email;
    }
    if (user.company_phone) {
        document.querySelectorAll('.company-detail')[3].textContent = user.company_phone;
    }
    if (user.logo_url) {
        const logoUpload = document.getElementById('logoUpload');
        logoUpload.innerHTML = `<img src="${user.logo_url}" alt="Company Logo">`;
        logoUpload.classList.add('has-logo');
    }
    
    // Set invoice number for new invoices (not when editing)
    if (!window.currentInvoiceId && user.invoice_prefix && user.next_invoice_number) {
        const invoiceNumberEl = document.querySelector('.invoice-meta .meta-value.editable');
        if (invoiceNumberEl) {
            const paddedNumber = String(user.next_invoice_number).padStart(3, '0');
            invoiceNumberEl.textContent = `${user.invoice_prefix}-${paddedNumber}`;
        }
    }
    
    // Auto-populate bank details if available (for logged-in users)
    if (user.bank_name) {
        document.getElementById('bankName').textContent = user.bank_name;
    }
    if (user.bank_account_name) {
        document.getElementById('bankAccountName').textContent = user.bank_account_name;
    }
    if (user.bank_routing_label) {
        document.getElementById('bankRoutingLabel').textContent = user.bank_routing_label + ':';
    }
    if (user.bank_routing_number) {
        document.getElementById('bankRoutingNumber').textContent = user.bank_routing_number;
    }
    if (user.bank_account_number) {
        document.getElementById('bankAccountNumber').textContent = user.bank_account_number;
    }
}

// Load user's saved items
function loadUserItems() {
    fetch('api/get-user-items.php')
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const library = document.getElementById('itemLibrary');
                const libraryItems = document.getElementById('libraryItems');
                
                libraryItems.innerHTML = '';
                data.items.forEach(item => {
                    const itemBtn = document.createElement('button');
                    itemBtn.className = 'library-item';
                    itemBtn.textContent = item.name;
                    itemBtn.onclick = () => addItemFromLibrary(item);
                    libraryItems.appendChild(itemBtn);
                });
                
                library.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error loading user items:', error);
        });
}

// Add item from library
function addItemFromLibrary(item) {
    addNewRow();
    const lastRow = document.querySelector('.item-row:last-child');
    lastRow.querySelector('.item-description').textContent = item.description || item.name;
    lastRow.querySelector('.item-unit').value = item.unit || 'items';
    lastRow.querySelector('.item-rate').value = item.default_price || 0;
    calculateRowTotal(lastRow);
}

// Save invoice
function saveInvoice() {
    const invoiceData = collectInvoiceData();
    
    // Add invoice ID if we're editing an existing invoice
    if (window.currentInvoiceId) {
        invoiceData.id = parseInt(window.currentInvoiceId);
    }
    
    fetch('api/save-invoice.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (window.currentInvoiceId) {
                alert('Invoice updated successfully!');
            } else {
                alert('Invoice created successfully!');
            }
            if (data.invoice_id) {
                // Store invoice ID for future updates
                window.currentInvoiceId = parseInt(data.invoice_id);
                
                // Update URL to reflect we're now editing this invoice
                if (!window.location.search.includes('id=')) {
                    const newUrl = window.location.pathname + '?id=' + window.currentInvoiceId;
                    window.history.replaceState({}, '', newUrl);
                }
            }
        } else {
            alert('Error saving invoice: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving invoice');
    });
}

// Auto-save
function autoSave() {
    if (isLoggedIn && window.currentInvoiceId) {
        const invoiceData = collectInvoiceData();
        invoiceData.id = window.currentInvoiceId;
        
        fetch('api/save-invoice.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invoiceData)
        })
        .then(response => response.json())
        .then(data => {
            // Auto-saved successfully
        })
        .catch(error => {
            console.error('Auto-save error:', error);
        });
    }
}

// Collect invoice data
function collectInvoiceData() {
    const items = [];
    document.querySelectorAll('.item-row').forEach((row, index) => {
        const description = row.querySelector('.item-description').textContent.trim();
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const unit = row.querySelector('.item-unit').value.trim();
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        
        items.push({
            description: description,
            quantity: qty,
            unit: unit,
            unit_price: rate,
            item_order: index
        });
    });
    
    const subtotal = parseFloat(document.getElementById('subtotalValue').textContent.replace(/[$,]/g, ''));
    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const taxAmount = parseFloat(document.getElementById('taxValue').textContent.replace(/[$,]/g, ''));
    const total = parseFloat(document.getElementById('totalValue').textContent.replace(/[$,]/g, ''));
    
    const invoiceNumberEl = document.querySelector('.invoice-meta .meta-value.editable');
    const clientNameEl = document.querySelector('.client-name');
    const clientDetailEls = document.querySelectorAll('.bill-to .client-detail');
    
    const invoiceData = {
        invoice_number: invoiceNumberEl ? invoiceNumberEl.textContent.trim() : 'INV-001',
        client_name: clientNameEl ? clientNameEl.textContent.trim() : '',
        client_address: Array.from(clientDetailEls).map(el => el.textContent.trim()).join('\n'),
        issue_date: document.getElementById('issueDate').value,
        due_date: document.getElementById('dueDate').value,
        status: document.getElementById('statusSelect')?.value || 'draft',
        notes: document.querySelector('.notes-content').textContent.trim(),
        subtotal: subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total: total,
        items: items
    };
    
    // Add client_id if a client was imported
    if (selectedClientId) {
        invoiceData.client_id = selectedClientId;
    }
    
    return invoiceData;
}

// Load invoice (for editing existing invoices)
function loadInvoice(invoiceId) {
    fetch(`api/get-invoice.php?id=${invoiceId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateInvoice(data.invoice);
                window.currentInvoiceId = parseInt(invoiceId);
            } else {
                alert('Error loading invoice: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error loading invoice:', error);
            alert('Error loading invoice');
        });
}

// Populate invoice with data
function populateInvoice(invoice) {
    // Populate invoice number
    const invoiceNumberEl = document.querySelector('.invoice-meta .meta-value.editable');
    if (invoiceNumberEl) {
        invoiceNumberEl.textContent = invoice.invoice_number || '';
    }
    
    // Populate client name
    const clientNameEl = document.querySelector('.client-name');
    if (clientNameEl) {
        clientNameEl.textContent = invoice.client_name || '';
    }
    
    // Populate client address
    if (invoice.client_address) {
        const clientDetails = invoice.client_address.split('\n');
        const clientDetailElements = document.querySelectorAll('.bill-to .client-detail');
        clientDetails.forEach((detail, index) => {
            if (clientDetailElements[index]) {
                clientDetailElements[index].textContent = detail;
            }
        });
    }
    
    // Populate dates
    document.getElementById('issueDate').value = invoice.issue_date || '';
    document.getElementById('dueDate').value = invoice.due_date || '';
    
    // Populate status (if logged in)
    const statusSelect = document.getElementById('statusSelect');
    if (statusSelect && invoice.status) {
        statusSelect.value = invoice.status;
    }
    
    // Populate notes
    const notesEl = document.querySelector('.notes-content');
    if (notesEl) {
        notesEl.textContent = invoice.notes || '';
    }
    
    // Populate tax rate
    document.getElementById('taxRate').value = invoice.tax_rate || 0;
    
    // Clear existing items and add invoice items
    const tbody = document.getElementById('itemsBody');
    tbody.innerHTML = '';
    rowCounter = 0;
    
    if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item, index) => {
            rowCounter++;
            const newRow = document.createElement('tr');
            newRow.className = 'item-row';
            newRow.dataset.row = rowCounter;
            newRow.innerHTML = `
                <td>
                    <div class="editable item-description" contenteditable="true" data-placeholder="Service or product description">${item.description || ''}</div>
                </td>
                <td>
                    <input type="number" class="item-input item-qty" value="${item.quantity || 0}" min="0" step="1">
                </td>
                <td>
                    <input type="text" class="item-input item-unit" value="${item.unit || 'items'}" placeholder="items">
                </td>
                <td>
                    <div class="currency-input">
                        <span class="currency-symbol">$</span>
                        <input type="number" class="item-input item-rate" value="${item.unit_price || 0}" min="0" step="0.01">
                    </div>
                </td>
                <td>
                    <div class="item-amount">$0.00</div>
                </td>
                <td>
                    <button class="btn-remove" title="Remove item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </td>
            `;
            tbody.appendChild(newRow);
            calculateRowTotal(newRow);
        });
    } else {
        // Add default empty row if no items
        rowCounter = 1;
        const newRow = document.createElement('tr');
        newRow.className = 'item-row';
        newRow.dataset.row = rowCounter;
        newRow.innerHTML = `
            <td>
                <div class="editable item-description" contenteditable="true" data-placeholder="Service or product description"></div>
            </td>
            <td>
                <input type="number" class="item-input item-qty" value="1" min="0" step="1">
            </td>
            <td>
                <input type="text" class="item-input item-unit" value="items" placeholder="items">
            </td>
            <td>
                <div class="currency-input">
                    <span class="currency-symbol">$</span>
                    <input type="number" class="item-input item-rate" value="0.00" min="0" step="0.01">
                </div>
            </td>
            <td>
                <div class="item-amount">$0.00</div>
            </td>
            <td>
                <button class="btn-remove" title="Remove item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(newRow);
    }
    
    // Recalculate totals
    calculateTotals();
}

// This function is no longer used but kept for compatibility
function populateRow(row, item) {
    row.querySelector('.item-description').textContent = item.description;
    row.querySelector('.item-qty').value = item.quantity;
    row.querySelector('.item-unit').value = item.unit;
    row.querySelector('.item-rate').value = item.unit_price;
    calculateRowTotal(row);
}

// Customization functions
function openCustomizeSidebar() {
    document.getElementById('customizeSidebar').classList.add('active');
    document.getElementById('customizeOverlay').classList.add('active');
}

function closeCustomizeSidebar() {
    document.getElementById('customizeSidebar').classList.remove('active');
    document.getElementById('customizeOverlay').classList.remove('active');
}

function toggleSection(sectionName, show) {
    const elements = document.querySelectorAll(`[data-section="${sectionName}"]`);
    elements.forEach(element => {
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    });
    
    // Save to localStorage
    saveCustomization(sectionName, show);
}

function saveCustomization(sectionName, show) {
    const customizations = JSON.parse(localStorage.getItem('invoiceCustomizations') || '{}');
    customizations[sectionName] = show;
    localStorage.setItem('invoiceCustomizations', JSON.stringify(customizations));
    
    // If user is logged in, also save to database
    if (isLoggedIn) {
        fetch('api/save-customizations.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customizations: customizations })
        })
        .catch(error => {
            console.error('Error saving customizations to database:', error);
        });
    }
}

// Load available clients
function loadAvailableClients() {
    fetch('api/get-clients.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                availableClients = data.clients || [];
            }
        })
        .catch(error => console.error('Error loading clients:', error));
}

// Client import sidebar
function openClientImportSidebar() {
    const sidebar = document.getElementById('clientImportSidebar');
    const overlay = document.getElementById('clientImportOverlay');
    const clientList = document.getElementById('clientImportList');
    
    if (availableClients.length === 0) {
        clientList.innerHTML = '<p style="color: var(--gray); text-align: center;">No clients saved. Add clients in the dashboard first.</p>';
    } else {
        clientList.innerHTML = availableClients.map(client => `
            <div class="client-item" onclick="importClient(${client.id})">
                <div class="client-item-name">${client.name}</div>
                <div class="client-item-details">
                    ${client.email || ''} ${client.phone ? '• ' + client.phone : ''}
                </div>
            </div>
        `).join('');
    }
    
    sidebar.classList.add('active');
    overlay.classList.add('active');
}

function closeClientImportSidebar() {
    document.getElementById('clientImportSidebar').classList.remove('active');
    document.getElementById('clientImportOverlay').classList.remove('active');
}

function importClient(clientId) {
    const client = availableClients.find(c => c.id == clientId);
    if (!client) return;
    
    selectedClientId = clientId;
    
    // Populate client fields
    document.querySelector('.client-name').textContent = client.name;
    
    const clientDetails = document.querySelectorAll('.bill-to .client-detail');
    let addressParts = [];
    if (client.address) addressParts.push(client.address);
    if (client.city || client.state || client.zip) {
        let cityLine = [client.city, client.state, client.zip].filter(Boolean).join(', ');
        if (cityLine) addressParts.push(cityLine);
    }
    
    if (clientDetails[0] && addressParts[0]) clientDetails[0].textContent = addressParts[0];
    if (clientDetails[1] && addressParts[1]) clientDetails[1].textContent = addressParts[1];
    if (clientDetails[2] && client.email) clientDetails[2].textContent = client.email;
    
    closeClientImportSidebar();
}

function loadCustomizations(userCustomizations = null) {
    let customizations;
    
    // If user is logged in and has saved customizations, use those
    if (userCustomizations) {
        try {
            customizations = typeof userCustomizations === 'string' 
                ? JSON.parse(userCustomizations) 
                : userCustomizations;
            // Also save to localStorage for offline use
            localStorage.setItem('invoiceCustomizations', JSON.stringify(customizations));
        } catch (e) {
            // If parsing fails, fall back to localStorage
            customizations = JSON.parse(localStorage.getItem('invoiceCustomizations') || '{}');
        }
    } else {
        // Fall back to localStorage
        customizations = JSON.parse(localStorage.getItem('invoiceCustomizations') || '{}');
    }
    
    // Apply saved customizations
    Object.keys(customizations).forEach(sectionName => {
        const show = customizations[sectionName];
        const checkbox = document.getElementById(`toggle-${sectionName}`);
        if (checkbox) {
            checkbox.checked = show;
            toggleSection(sectionName, show);
        }
    });
}

