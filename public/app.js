// I'm keeping track of all the flags globally so I can reference them easily
let currentFlags = [];

// DOM elements I'll be working with frequently
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessageEl = document.getElementById('error-message');
const flagsContainerEl = document.getElementById('flags-container');
const emptyStateEl = document.getElementById('empty-state');
const flagsTableBodyEl = document.getElementById('flags-table-body');
const flagsCountEl = document.getElementById('flags-count');

// I'm loading the flags as soon as the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadFlags();
});

// Main function to fetch and display flags
// I like keeping this async so I can handle errors properly
async function loadFlags() {
    showLoading();
    
    try {
        const response = await fetch('/flags');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const flags = await response.json();
        currentFlags = flags;
        displayFlags(flags);
        
    } catch (error) {
        console.error('Failed to load flags:', error);
        showError(`Failed to load flags: ${error.message}`);
    }
}

// Display the flags in the table
// I'm building the HTML dynamically to keep it flexible
function displayFlags(flags) {
    hideAllStates();
    
    if (flags.length === 0) {
        emptyStateEl.classList.remove('d-none');
        return;
    }
    
    // Update the count badge
    flagsCountEl.textContent = flags.length;
    
    // Build the table rows
    flagsTableBodyEl.innerHTML = flags.map(flag => createFlagRow(flag)).join('');
    
    flagsContainerEl.classList.remove('d-none');
}

// Create a single table row for a flag
// I'm using template literals to keep the HTML readable
function createFlagRow(flag) {
    const statusBadge = flag.enabled 
        ? '<span class="badge bg-success"><i class="bi bi-check-circle-fill me-1"></i>Enabled</span>'
        : '<span class="badge bg-secondary"><i class="bi bi-x-circle-fill me-1"></i>Disabled</span>';
    
    const lastUsed = flag.lastUsedAt 
        ? new Date(flag.lastUsedAt).toLocaleString()
        : '<span class="text-muted">Never</span>';
    
    const toggleButtonClass = flag.enabled ? 'btn-outline-danger' : 'btn-outline-success';
    const toggleButtonText = flag.enabled ? 'Disable' : 'Enable';
    const toggleButtonIcon = flag.enabled ? 'bi-toggle-on' : 'bi-toggle-off';
    
    return `
        <tr>
            <td>
                <strong>${escapeHtml(flag.key)}</strong>
            </td>
            <td>${escapeHtml(flag.description)}</td>
            <td>${statusBadge}</td>
            <td>${lastUsed}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn ${toggleButtonClass}" 
                            onclick="toggleFlag('${flag.key}')"
                            title="Toggle this flag">
                        <i class="bi ${toggleButtonIcon} me-1"></i>
                        ${toggleButtonText}
                    </button>
                    <button class="btn btn-outline-primary" 
                            onclick="useFlag('${flag.key}')"
                            title="Simulate using this flag">
                        <i class="bi bi-play-fill me-1"></i>
                        Use
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Toggle a flag's enabled state
// I'm adding some visual feedback so users know something's happening
async function toggleFlag(flagKey) {
    const button = event.target.closest('button');
    const originalContent = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Updating...';
    button.disabled = true;
    
    try {
        const response = await fetch(`/flags/${flagKey}/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Reload the flags to show the updated state
        await loadFlags();
        
    } catch (error) {
        console.error('Failed to toggle flag:', error);
        showError(`Failed to toggle flag: ${error.message}`);
        
        // Restore the button
        button.innerHTML = originalContent;
        button.disabled = false;
    }
}

// Simulate using a flag
// This helps demonstrate the usage tracking functionality
async function useFlag(flagKey) {
    const button = event.target.closest('button');
    const originalContent = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Using...';
    button.disabled = true;
    
    try {
        const response = await fetch(`/flags/${flagKey}/use`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Show success feedback
        button.innerHTML = '<i class="bi bi-check-lg me-1"></i>Used!';
        button.classList.remove('btn-outline-primary');
        button.classList.add('btn-success');
        
        // Reload flags to show updated lastUsedAt
        setTimeout(async () => {
            await loadFlags();
        }, 1000);
        
    } catch (error) {
        console.error('Failed to use flag:', error);
        showError(`Failed to use flag: ${error.message}`);
        
        // Restore the button
        button.innerHTML = originalContent;
        button.disabled = false;
    }
}

// Refresh flags (called by the refresh button)
function refreshFlags() {
    loadFlags();
}

// UI state management functions
// I like keeping these separate so I can easily control what's visible
function showLoading() {
    hideAllStates();
    loadingEl.classList.remove('d-none');
}

function showError(message) {
    hideAllStates();
    errorMessageEl.textContent = message;
    errorEl.classList.remove('d-none');
}

function hideAllStates() {
    loadingEl.classList.add('d-none');
    errorEl.classList.add('d-none');
    flagsContainerEl.classList.add('d-none');
    emptyStateEl.classList.add('d-none');
}

// Utility function to escape HTML and prevent XSS
// I always include this when building HTML dynamically
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
