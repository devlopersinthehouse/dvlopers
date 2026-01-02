/* =========================
   GLOBAL AUTH STATE
========================= */
let currentUser = null;
let isLoggedIn = false;

/* =========================
   CHECK AUTH ON PAGE LOAD
========================= */
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initDashboard();
});

/* =========================
   CHECK IF USER IS LOGGED IN
========================= */
async function checkAuth() {
    try {
        const res = await fetch('/api/auth/profile', {
            credentials: 'include'
        });

        if (res.ok) {
            currentUser = await res.json();
            isLoggedIn = true;
            renderAuthSection();
            await loadUserOrders();
            loadUserProfile();
        } else {
            isLoggedIn = false;
            renderAuthSection();
            showToast('Please login to access dashboard', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        }
    } catch (err) {
        console.error('Auth check error:', err);
        isLoggedIn = false;
        renderAuthSection();
        showToast('Error loading dashboard', 'error');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
    }
}

/* =========================
   RENDER AUTH SECTION IN TOP NAVBAR
========================= */
function renderAuthSection() {
    const authSection = document.getElementById('authSection');

    if (isLoggedIn && currentUser) {
        const firstLetter = currentUser.name.charAt(0).toUpperCase();

        authSection.innerHTML = `
            <div class="profile-wrapper">
                <div class="profile-circle" id="profileCircle">${firstLetter}</div>
                <div class="profile-dropdown" id="profileDropdown">
                    <div class="profile-info">
                        <p class="profile-name">${currentUser.name}</p>
                        <p class="profile-email">${currentUser.email}</p>
                    </div>
                    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:10px 0;">
                    <a href="/" class="dropdown-btn" style="text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px;">
                        <i class="fa-solid fa-home"></i> Back to Home
                    </a>
                    <button class="dropdown-btn" onclick="handleLogout()">
                        <i class="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                </div>
            </div>
        `;

        // Dropdown toggle
        const profileCircle = document.getElementById('profileCircle');
        if (profileCircle) {
            profileCircle.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('profileDropdown').classList.toggle('show');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('profileDropdown');
            const circle = document.getElementById('profileCircle');
            if (dropdown && !dropdown.contains(e.target) && circle && !circle.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    } else {
        authSection.innerHTML = `<a href="login.html" class="login-btn">Log In</a>`;
    }
}

/* =========================
   LOGOUT WITH CONFIRMATION
========================= */
async function handleLogout() {
    const confirmed = confirm('Are you sure you want to logout?');
    
    if (!confirmed) return;

    try {
        const res = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (res.ok) {
            showToast('Logged out successfully! 👋', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showToast('Logout failed. Please try again.', 'error');
        }
    } catch (err) {
        console.error('Logout error:', err);
        showToast('Network error. Please try again.', 'error');
    }
}

/* =========================
   DASHBOARD NAVIGATION
========================= */
function initDashboard() {
    const menuItems = document.querySelectorAll('.menu-item[data-section]');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Password show/hide
    document.querySelectorAll('.show-pass').forEach(icon => {
        icon.addEventListener('click', () => {
            const target = document.getElementById(icon.dataset.target);
            if (target) {
                target.type = target.type === 'password' ? 'text' : 'password';
            }
        });
    });

    // Update profile button
    const updateProfileBtn = document.getElementById('updateProfileBtn');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', updateProfile);
    }

    // Change password button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
    }

    // Delete account button
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', deleteAccount);
    }
}

function switchSection(sectionName) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    const activeMenuItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeMenuItem) {
        activeMenuItem.classList.add('active');
    }

    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });

    if (sectionName === 'orders') {
        document.getElementById('ordersSection').classList.add('active');
    } else if (sectionName === 'profile') {
        document.getElementById('profileSection').classList.add('active');
    }
}

/* =========================
   LOAD USER ORDERS (Placeholder – backend endpoint nahi hai abhi)
========================= */
async function loadUserOrders() {
    const ordersLoader = document.getElementById('ordersLoader');
    const ordersContent = document.getElementById('ordersContent');
    const noOrders = document.getElementById('noOrders');

    ordersLoader.style.display = 'block';
    ordersContent.style.display = 'none';

    // Temporary – backend endpoint nahi hai abhi
    setTimeout(() => {
        ordersLoader.style.display = 'none';
        ordersContent.style.display = 'block';
        noOrders.style.display = 'block';
    }, 1000);
}

/* =========================
   LOAD USER PROFILE
========================= */
function loadUserProfile() {
    if (!currentUser) return;

    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');

    if (profileName) profileName.value = currentUser.name;
    if (profileEmail) profileEmail.value = currentUser.email;
}

/* =========================
   UPDATE PROFILE (Placeholder)
========================= */
async function updateProfile() {
    showToast('Profile update feature coming soon!', 'info');
}

/* =========================
   CHANGE PASSWORD (Placeholder)
========================= */
async function changePassword() {
    showToast('Password change feature coming soon!', 'info');
}

/* =========================
   DELETE ACCOUNT (Placeholder)
========================= */
async function deleteAccount() {
    showToast('Account deletion feature coming soon!', 'info');
}

/* =========================
   TOAST NOTIFICATION (Single Toast – tumhara existing)
========================= */
function showToast(message, type = 'info') {
    const existingToast = document.getElementById('customToast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'customToast';
    toast.className = `custom-toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}