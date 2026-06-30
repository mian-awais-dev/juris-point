// Global Component Injector for Juris Point

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject FontAwesome and Styles dynamically if they aren't loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
        document.head.appendChild(fa);
    }
    
    // 2. Inject loading overlay if it doesn't exist
    if (!document.getElementById('loading-overlay')) {
        const loader = document.createElement('div');
        loader.id = 'loading-overlay';
        loader.className = 'loading-overlay';
        loader.innerHTML = '<div class="spinner"></div><p style="font-weight: 600; color: #1E3E62;">Juris Point - Preparing Environment...</p>';
        document.body.appendChild(loader);
    }

    // 3. Inject Modals for global PDF and Video preview
    injectModals();

    // 4. Initialize Header and Footer
    initHeader();
    initFooter();

    // WhatsApp floating button
    if (!document.getElementById('wa-float')) {
        const wa = document.createElement('a');
        wa.id = 'wa-float';
        wa.href = 'https://chat.whatsapp.com/JxjE0CXOvwe8Y3Le6dmp7p';
        wa.target = '_blank';
        wa.title = 'Join our WhatsApp Group';
        wa.style.cssText = 'position:fixed;bottom:28px;right:28px;width:56px;height:56px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(37,211,102,0.5);z-index:1000;text-decoration:none;transition:transform 0.2s;';
        wa.innerHTML = '<i class="fab fa-whatsapp" style="font-size:28px;color:#fff;"></i>';
        wa.onmouseover = () => wa.style.transform = 'scale(1.12)';
        wa.onmouseout  = () => wa.style.transform = 'scale(1)';
        document.body.appendChild(wa);
    }

    // 5. Inject WhatsApp floating button
    if (!document.getElementById('whatsapp-float-btn')) {
        const wa = document.createElement('a');
        wa.id = 'whatsapp-float-btn';
        wa.href = 'https://chat.whatsapp.com/JxjE0CXOvwe8Y3Le6dmp7p';
        wa.target = '_blank';
        wa.className = 'whatsapp-float';
        wa.title = 'Join our WhatsApp Group';
        wa.innerHTML = '<i class="fab fa-whatsapp"></i>';
        document.body.appendChild(wa);
    }
});

// Inject PDF & Video Modals
function injectModals() {
    // Video Modal
    if (!document.getElementById('video-modal')) {
        const videoModal = document.createElement('div');
        videoModal.id = 'video-modal';
        videoModal.className = 'modal';
        videoModal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="closeVideoModal()">&times;</button>
                <div class="video-container" id="video-modal-container">
                    <!-- Dynamic Video Element or Iframe injected here -->
                </div>
                <div class="modal-info">
                    <h3 id="video-modal-title" style="margin-bottom:8px;">Lecture Video</h3>
                    <p id="video-modal-desc" style="color:var(--text-muted); font-size:14px;">Study Guide</p>
                </div>
            </div>
        `;
        document.body.appendChild(videoModal);
    }

    // PDF Modal
    if (!document.getElementById('pdf-modal')) {
        const pdfModal = document.createElement('div');
        pdfModal.id = 'pdf-modal';
        pdfModal.className = 'modal';
        pdfModal.innerHTML = `
            <div class="modal-content" style="max-width:900px;">
                <button class="modal-close" style="color:var(--text-dark);" onclick="closePdfModal()">&times;</button>
                <div class="modal-info" style="border-bottom:1px solid #E2E8F0; padding:16px 24px;">
                    <h3 id="pdf-modal-title">Document Preview</h3>
                </div>
                <div class="pdf-preview-container">
                    <iframe id="pdf-modal-iframe" src=""></iframe>
                </div>
                <div class="modal-info" style="display:flex; justify-content:flex-end; gap:12px; padding:12px 24px; background-color:#F8FAFC;">
                    <a id="pdf-modal-download" class="btn btn-primary" style="padding:8px 20px; font-size:12px;" href="" download target="_blank">
                        <i class="fas fa-download" style="margin-right:8px;"></i> Download PDF
                    </a>
                    <button class="btn btn-outline" style="padding:8px 20px; font-size:12px;" onclick="closePdfModal()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(pdfModal);
    }
}

// Global modal triggers
function openVideoModal(url, title = "Lecture Video", desc = "Study Guide") {
    const modal = document.getElementById('video-modal');
    const container = document.getElementById('video-modal-container');
    document.getElementById('video-modal-title').innerText = title;
    document.getElementById('video-modal-desc').innerText = desc;
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // Convert youtube link to embed link
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }
        container.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allowfullscreen allow="autoplay"></iframe>`;
    } else {
        // Direct MP4 from Firebase Storage
        container.innerHTML = `<video src="${url}" controls autoplay></video>`;
    }
    modal.classList.add('active');
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const container = document.getElementById('video-modal-container');
    container.innerHTML = ''; // Stops playback
    modal.classList.remove('active');
}

function openPdfModal(url, title = "Document Preview") {
    const modal = document.getElementById('pdf-modal');
    const iframe = document.getElementById('pdf-modal-iframe');
    const downloadBtn = document.getElementById('pdf-modal-download');
    document.getElementById('pdf-modal-title').innerText = title;
    
    // Use Google Docs viewer as backup if direct browser rendering doesn't work,
    // but for PDFs direct link is usually fine.
    iframe.src = url;
    downloadBtn.href = url;
    
    modal.classList.add('active');
}

function closePdfModal() {
    const modal = document.getElementById('pdf-modal');
    const iframe = document.getElementById('pdf-modal-iframe');
    iframe.src = '';
    modal.classList.remove('active');
}

// Inject Navbar
function initHeader() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;

    // Check current path to mark active link
    const path = window.location.pathname.split('/').pop() || 'index.html';

    // Check login state
    auth.onAuthStateChanged(user => {
        let menuItems = '';
        let actionButtons = '';

        if (user) {
            // Fetch role to render dashboard links
            db.collection('users').doc(user.uid).get().then(doc => {
                const role = doc.exists ? doc.data().role : 'student';
                
                if (role === 'admin') {
                    menuItems = `
                        <li><a href="admin-dashboard.html" class="${path === 'admin-dashboard.html' ? 'active' : ''}">Admin Dashboard</a></li>
                    `;
                    actionButtons = `
                        <button onclick="handleLogout()" class="btn btn-outline-gold"><i class="fas fa-sign-out-alt" style="margin-right:8px;"></i> Logout</button>
                    `;
                } else {
                    menuItems = `
                        <li><a href="index.html" class="${path === 'index.html' ? 'active' : ''}">Home</a></li>
                        <li><a href="lectures.html" class="${path === 'lectures.html' ? 'active' : ''}">Lectures</a></li>
                        <li><a href="notes.html" class="${path === 'notes.html' ? 'active' : ''}">Notes</a></li>
                        <li><a href="pastpapers.html" class="${path === 'pastpapers.html' ? 'active' : ''}">Past Papers</a></li>
                        <li><a href="mocktests.html" class="${path === 'mocktests.html' ? 'active' : ''}">Mock Tests</a></li>
                        <li><a href="quizzes.html" class="${path === 'quizzes.html' ? 'active' : ''}">Quizzes</a></li>
                        <li><a href="expected-mcqs.html" class="${path === 'expected-mcqs.html' ? 'active' : ''}">MCQs</a></li>
                    `;
                    actionButtons = `
                        <a href="student-dashboard.html" class="btn btn-gold" style="margin-right:8px; padding: 8px 16px;"><i class="fas fa-user-shield" style="margin-right:8px;"></i> Dashboard</a>
                        <button onclick="handleLogout()" class="btn btn-outline-gold" style="padding: 8px 16px;"><i class="fas fa-sign-out-alt" style="margin-right:8px;"></i> Logout</button>
                    `;
                }
                renderNavbar(placeholder, menuItems, actionButtons);
            }).catch(() => {
                // Fallback standard guest menu
                renderGuestNavbar(placeholder, path);
            });
        } else {
            renderGuestNavbar(placeholder, path);
        }
    });
}

function renderGuestNavbar(placeholder, path) {
    const menuItems = `
        <li><a href="index.html" class="${path === 'index.html' ? 'active' : ''}">Home</a></li>
        <li><a href="lectures.html" class="${path === 'lectures.html' ? 'active' : ''}">Lectures</a></li>
        <li><a href="notes.html" class="${path === 'notes.html' ? 'active' : ''}">Notes</a></li>
        <li><a href="pastpapers.html" class="${path === 'pastpapers.html' ? 'active' : ''}">Past Papers</a></li>
        <li><a href="mocktests.html" class="${path === 'mocktests.html' ? 'active' : ''}">Mock Tests</a></li>
        <li><a href="quizzes.html" class="${path === 'quizzes.html' ? 'active' : ''}">Quizzes</a></li>
        <li><a href="expected-mcqs.html" class="${path === 'expected-mcqs.html' ? 'active' : ''}">MCQs</a></li>
    `;
    const actionButtons = `
        <a href="student-login.html" class="btn btn-outline-gold" style="margin-right:8px; padding: 8px 16px;">Login</a>
        <a href="student-register.html" class="btn btn-gold" style="padding: 8px 16px;">Register</a>
    `;
    renderNavbar(placeholder, menuItems, actionButtons);
}

function renderNavbar(placeholder, menuItems, actionButtons) {
    placeholder.innerHTML = `
        <header>
            <div class="container">
                <a href="index.html" class="logo-container">
                    <img src="assets/images/logo.png" alt="Juris Point Logo" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="logo-fallback" style="display:none;">
                        <i class="fas fa-balance-scale"></i> <span>JURIS</span> POINT
                    </div>
                </a>
                <nav id="nav-menu">
                    <ul class="nav-links">
                        ${menuItems}
                    </ul>
                    <div class="nav-actions">
                        ${actionButtons}
                    </div>
                </nav>
                <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </header>
    `;
}

function toggleMobileMenu() {
    const nav = document.getElementById('nav-menu');
    const icon = document.querySelector('.mobile-menu-btn i');
    if (nav.classList.contains('mobile-active')) {
        nav.classList.remove('mobile-active');
        icon.className = 'fas fa-bars';
    } else {
        nav.classList.add('mobile-active');
        icon.className = 'fas fa-times';
    }
}

function handleLogout() {
    showLoader(true);
    auth.signOut().then(() => {
        showLoader(false);
        showToast("Logged out successfully.", "success");
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }).catch(error => {
        showLoader(false);
        showToast("Logout failed: " + error.message, "error");
    });
}

// Inject Footer
function initFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;

    placeholder.innerHTML = `
        <footer>
            <div class="container">
                <div class="footer-grid">
                    <div class="footer-col footer-about">
                        <a href="index.html" class="logo-container" style="margin-bottom: 20px;">
                            <img src="assets/images/logo.png" alt="Juris Point Logo" class="logo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="logo-fallback" style="display:none;">
                                <i class="fas fa-balance-scale" style="color:var(--accent-gold);"></i> <span style="color:var(--accent-gold);">JURIS</span> POINT
                            </div>
                        </a>
                        <p>Juris Point is a premium digital portal designed for law students and graduates preparing for LAT (Law Admission Test) and comprehensive Law examinations.</p>
                        <div class="footer-socials">
                            <a href="https://youtube.com/@jurispoint14?si=LOkLY56PzKRUThyt" class="social-icon" target="_blank" title="YouTube"><i class="fab fa-youtube"></i></a>
                            <a href="https://www.instagram.com/jurispoint14?igsh=MWtqcGFubHNuamRuZA==" class="social-icon" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>
                            <a href="https://www.tiktok.com/@jurispoint14?_r=1&_t=ZN-97WQxsh2dr4" class="social-icon" target="_blank" title="TikTok"><i class="fab fa-tiktok"></i></a>
                            <a href="https://www.facebook.com/share/1BUhNQFHun/" class="social-icon" target="_blank" title="Facebook"><i class="fab fa-facebook-f"></i></a>
                            <a href="https://chat.whatsapp.com/JxjE0CXOvwe8Y3Le6dmp7p" class="social-icon" target="_blank" title="WhatsApp" style="background:#25D366;"><i class="fab fa-whatsapp"></i></a>
                        </div>
                    </div>
                    
                    <div class="footer-col">
                        <h3>Quick Links</h3>
                        <ul class="footer-links">
                            <li><a href="index.html">Home</a></li>
                            <li><a href="lectures.html">Lectures</a></li>
                            <li><a href="notes.html">Notes</a></li>
                            <li><a href="pastpapers.html">Past Papers</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-col">
                        <h3>Preparation</h3>
                        <ul class="footer-links">
                            <li><a href="mocktests.html">Mock Tests</a></li>
                            <li><a href="quizzes.html">Topic Quizzes</a></li>
                            <li><a href="expected-mcqs.html">Expected MCQs</a></li>
                            <li><a href="student-register.html">Student Registration</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-col">
                        <h3>Contact Info</h3>
                        <ul class="footer-contact">
                            <li>
                                <i class="fas fa-user-tie"></i>
                                <span>Founder: Malik Babar Zahoor</span>
                            </li>
                            <li>
                                <i class="fas fa-phone-alt"></i>
                                <a href="tel:+923401143163" style="color:inherit; text-decoration:none;"><span>0340-1143163</span></a>
                            </li>
                            <li>
                                <i class="fas fa-envelope"></i>
                                <a href="mailto:lawprepa@gmail.com" style="color:inherit; text-decoration:none;"><span>lawprepa@gmail.com</span></a>
                            </li>
                            <li>
                                <i class="fab fa-whatsapp" style="color:#25D366;"></i>
                                <a href="https://chat.whatsapp.com/JxjE0CXOvwe8Y3Le6dmp7p" target="_blank" style="color:inherit; text-decoration:none;"><span>Join WhatsApp Group</span></a>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer-bottom flex-between">
                    <p>&copy; ${new Date().getFullYear()} Juris Point. All Rights Reserved. Developed by Malik Babar Zahoor.</p>
                    <div>
                        <a href="#" style="margin-right: 16px; color:#64748B;">Privacy Policy</a>
                        <a href="#" style="color:#64748B;">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    `;
}
