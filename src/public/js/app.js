// Staff Club API Server - Main JavaScript

// Global variables
let refreshInterval;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    console.log('Staff Club API Server loaded');

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Auto-refresh health page every 30 seconds
    if (window.location.pathname === '/health') {
        startAutoRefresh();
    }

    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Start auto-refresh for health page
function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        location.reload();
    }, 30000); // 30 seconds

    // Show notification
    showToast('Auto-refresh enabled (30s)', 'info');
}

// Stop auto-refresh
function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        showToast('Auto-refresh disabled', 'warning');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Test API endpoint
function testAPI() {
    const button = event.target;
    const originalText = button.innerHTML;

    button.innerHTML = '<span class="loading"></span> Testing...';
    button.disabled = true;

    fetch('/api/health')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            showToast('API Test Successful! Status: ' + data.status, 'success');
            button.innerHTML = '<i class="fas fa-check me-2"></i>Success';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        })
        .catch(error => {
            showToast('API Test Failed: ' + error.message, 'danger');
            button.innerHTML = '<i class="fas fa-times me-2"></i>Failed';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        });
}

// Refresh health status
function refreshHealth() {
    const button = event.target;
    const originalText = button.innerHTML;

    button.innerHTML = '<span class="loading"></span> Refreshing...';
    button.disabled = true;

    setTimeout(() => {
        location.reload();
    }, 1000);
}

// View logs (placeholder)
function viewLogs() {
    showToast('Log viewing functionality would be implemented here', 'info');
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy to clipboard', 'danger');
    });
}

// Format bytes for display
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format uptime
function formatUptime(uptime) {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
}

// Export functions for global use
window.staffClub = {
    testAPI,
    refreshHealth,
    viewLogs,
    copyToClipboard,
    formatBytes,
    formatUptime,
    showToast,
    startAutoRefresh,
    stopAutoRefresh
}; 