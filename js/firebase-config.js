// Firebase Configuration and Initialization for Juris Point

// TODO: Replace with your actual Firebase project configuration keys
const firebaseConfig = {
    
  apiKey: "AIzaSyC20gaNCk9YrGK8dpeui7GuC8uqs0qwiPo",
  authDomain: "juris-point.firebaseapp.com",
  projectId: "juris-point",
  storageBucket: "juris-point.firebasestorage.app",
  messagingSenderId: "751925536779",
  appId: "1:751925536779:web:d9d826fcd9bde5eb95bf0e",
  measurementId: "G-8X5EQSG0MF"
};



// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Helper to show/hide loading indicators
function showLoader(show) {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        if (show) loader.classList.add('active');
        else loader.classList.remove('active');
    }
}

// Helper to show notifications
function showToast(message, type = 'success') {
    // Check if toast element exists, if not create one
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '6px';
        toast.style.color = '#fff';
        toast.style.fontSize = '14px';
        toast.style.fontWeight = '600';
        toast.style.zIndex = '9999';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.transition = 'opacity 0.3s, transform 0.3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        document.body.appendChild(toast);
    }
    
    // Set colors
    if (type === 'success') {
        toast.style.backgroundColor = '#10B981'; // success green
    } else if (type === 'error') {
        toast.style.backgroundColor = '#EF4444'; // error red
    } else {
        toast.style.backgroundColor = '#3B82F6'; // info blue
    }
    
    toast.innerText = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 3000);
}

// Role-Based Route Guard
function checkAuthAndRole(allowedRoles, redirectUrl = 'student-login.html') {
    showLoader(true);
    auth.onAuthStateChanged(user => {
        if (!user) {
            // No user logged in, redirect
            showLoader(false);
            window.location.href = redirectUrl;
        } else {
            // User logged in, check role in firestore
            db.collection('users').doc(user.uid).get().then(doc => {
                showLoader(false);
                if (doc.exists) {
                    const userData = doc.data();
                    if (allowedRoles.includes(userData.role)) {
                        // Authorized! Dispatch custom event to signal auth ready
                        const event = new CustomEvent('authReady', { detail: { user, role: userData.role, data: userData } });
                        window.dispatchEvent(event);
                    } else {
                        // Role not allowed, redirect
                        showToast("Access Denied: Unauthorized role.", "error");
                        setTimeout(() => {
                            if (userData.role === 'admin') {
                                window.location.href = 'admin-dashboard.html';
                            } else {
                                window.location.href = 'student-dashboard.html';
                            }
                        }, 1000);
                    }
                } else {
                    // Check if it's admin seed user or fallback
                    showToast("User record not found in database.", "error");
                    auth.signOut();
                    window.location.href = redirectUrl;
                }
            }).catch(error => {
                showLoader(false);
                console.error("Error fetching user role: ", error);
                showToast("Error checking authorization.", "error");
                auth.signOut();
                window.location.href = redirectUrl;
            });
        }
    });
}
