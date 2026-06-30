// Authentication Logic for Juris Point

// Register student
function registerStudent(fullName, email, password) {
    showLoader(true);
    const alertBox = document.getElementById('alert-box');
    if (alertBox) alertBox.style.display = 'none';

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            
            // Create user profile in Firestore
            return db.collection('users').doc(user.uid).set({
                uid: user.uid,
                fullName: fullName,
                email: email,
                role: 'student',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            showLoader(false);
            showToast("Registration successful! Redirecting...", "success");
            setTimeout(() => {
                window.location.href = 'student-dashboard.html';
            }, 1000);
        })
        .catch(error => {
            showLoader(false);
            if (alertBox) {
                alertBox.innerText = error.message;
                alertBox.className = 'alert alert-danger';
                alertBox.style.display = 'block';
            }
            showToast(error.message, "error");
        });
}

// Student Login
function loginStudent(email, password) {
    showLoader(true);
    const alertBox = document.getElementById('alert-box');
    if (alertBox) alertBox.style.display = 'none';

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            
            // Check role in Firestore
            return db.collection('users').doc(user.uid).get();
        })
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                showLoader(false);
                if (userData.role === 'student') {
                    showToast("Login successful!", "success");
                    setTimeout(() => {
                        const params = new URLSearchParams(window.location.search);
                        const redirect = params.get('redirect');
                        window.location.href = redirect ? redirect : 'student-dashboard.html';
                    }, 1000);
                } else if (userData.role === 'admin') {
                    showToast("Admin account detected! Redirecting...", "info");
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1000);
                } else {
                    showToast("Unauthorized account role.", "error");
                    auth.signOut();
                }
            } else {
                showLoader(false);
                showToast("Account record not found in database.", "error");
                auth.signOut();
            }
        })
        .catch(error => {
            showLoader(false);
            if (alertBox) {
                alertBox.innerText = error.message;
                alertBox.className = 'alert alert-danger';
                alertBox.style.display = 'block';
            }
            showToast(error.message, "error");
        });
}

// Admin Login
function loginAdmin(email, password) {
    showLoader(true);
    const alertBox = document.getElementById('alert-box');
    if (alertBox) alertBox.style.display = 'none';

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            
            // Check if user is admin in Firestore
            return db.collection('users').doc(user.uid).get();
        })
        .then(doc => {
            showLoader(false);
            if (doc.exists) {
                const userData = doc.data();
                if (userData.role === 'admin') {
                    showToast("Welcome Administrator!", "success");
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1000);
                } else {
                    showToast("Access Denied: Not an admin.", "error");
                    if (alertBox) {
                        alertBox.innerText = "Access Denied: This account is registered as a student.";
                        alertBox.className = 'alert alert-danger';
                        alertBox.style.display = 'block';
                    }
                    auth.signOut();
                }
            } else {
                showToast("Account record not found in database.", "error");
                auth.signOut();
            }
        })
        .catch(error => {
            showLoader(false);
            if (alertBox) {
                alertBox.innerText = error.message;
                alertBox.className = 'alert alert-danger';
                alertBox.style.display = 'block';
            }
            showToast(error.message, "error");
        });
}

// Reset Password
function resetPassword(email) {
    showLoader(true);
    const alertBox = document.getElementById('alert-box');
    if (alertBox) alertBox.style.display = 'none';

    auth.sendPasswordResetEmail(email)
        .then(() => {
            showLoader(false);
            if (alertBox) {
                alertBox.innerText = "Password reset email sent! Check your inbox.";
                alertBox.className = 'alert alert-success';
                alertBox.style.display = 'block';
            }
            showToast("Reset link sent!", "success");
        })
        .catch(error => {
            showLoader(false);
            if (alertBox) {
                alertBox.innerText = error.message;
                alertBox.className = 'alert alert-danger';
                alertBox.style.display = 'block';
            }
            showToast(error.message, "error");
        });
}

// Update Profile (Student Dashboard)
function updateStudentProfile(fullName, newPassword = "") {
    showLoader(true);
    const user = auth.currentUser;
    if (!user) {
        showLoader(false);
        showToast("Session expired. Please log in again.", "error");
        return;
    }

    const docRef = db.collection('users').doc(user.uid);
    let promise = docRef.update({
        fullName: fullName
    });

    if (newPassword && newPassword.trim().length >= 6) {
        promise = promise.then(() => {
            return user.updatePassword(newPassword);
        });
    }

    promise.then(() => {
        showLoader(false);
        showToast("Profile updated successfully!", "success");
        // Trigger profile data refresh
        const updateEvent = new CustomEvent('profileUpdated', { detail: { fullName } });
        window.dispatchEvent(updateEvent);
    }).catch(error => {
        showLoader(false);
        showToast("Update failed: " + error.message, "error");
    });
}
