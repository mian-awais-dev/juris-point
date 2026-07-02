# Juris Point – Legal Preparation Web Application

Juris Point is a premium, fully responsive, and modern legal education portal built specifically using HTML5, CSS3, and Vanilla JavaScript (No React, Angular, or Flutter frameworks). It incorporates secure administrative operations and client-side exam engines using Firebase Services.

## Features Catalog

### 1. Home / Landing Page
- Premium law-themed hero section and branding.
- Feature grid outlining lectures, study documents, and simulation examinations.
- Social feed grid links to YouTube, Instagram, TikTok, and Facebook.
- Responsive sticky navigation bar and footer.

### 2. Lectures Panel (`lectures.html`)
- Displays legal prep seminars uploaded by administrators.
- Supports YouTube embeds and raw video URLs (direct streaming).
- Instant video player modal interface.

### 3. Study Notes (`notes.html`)
- Displays categorized PDF study guides.
- Built-in PDF reader preview modal.
- One-click direct PDF downloads.

### 4. Past Papers (`pastpapers.html`)
- Catalog of LAT and LL.B past papers.
- Categorized by year, exam type, and subject.
- Full PDF previews and download triggers.

### 5. Interactive Mock Tests (`mocktests.html`)
- Clean exam engine that locks selection panels.
- Real-time countdown timer.
- Floating sidebar question grid navigator (jump to any question, highlights answered items).
- Automatic exam submission on timer expiration.
- Instant score percentage calculations and history logged to database profiles.

### 6. Quizzes (`quizzes.html`)
- Short topic-specific assessments.
- Real-time progress bar tracking.
- Immediate click feedback (turns choice green if correct, red if incorrect).
- Explanations display detailing correct legal citation arguments.

### 7. Expected MCQs (`expected-mcqs.html`)
- Category-filtered question banks for self-paced practicing.
- Instant correct/incorrect highlighting on click.
- Reveals reference notes immediately.

### 8. Role-Based Dashboards
- **Student Dashboard (`student-dashboard.html`)**: Personal metrics (completed mocks, average percentage), scorecard logs table, name changes, and password security updates.
- **Admin Dashboard (`admin-dashboard.html`)**: Operations hub containing overall widgets counts, upload/management panels for lectures, notes, papers, expected MCQs, test builders (adding questions to memory and saving assessments), and a student records table displaying individual grades history.

---

## Technical Folder Structure
```text
/juris-point/
├── index.html                   # Home Landing Page
├── student-register.html        # Student registration page
├── student-login.html           # Student portal login
├── forgot-password.html         # Password recovery
├── admin-login.html             # Secure Admin portal login
├── student-dashboard.html       # Student analytics and settings
├── admin-dashboard.html         # Admin operational control panel
├── lectures.html                # Lectures listing page
├── notes.html                   # notes listing page
├── pastpapers.html              # Past papers listing page
├── mocktests.html               # Real-time timed exam engine
├── quizzes.html                 # Topic-wise quick quizzes
├── expected-mcqs.html           # Practice MCQ banks
├── admin-setup.html             # Setup helper & database seeder
├── firestore.rules              # Firestore authorization policies
├── storage.rules                # Storage secure access configurations
├── css/
│   └── style.css                # Primary premium style sheet
└── js/
    ├── firebase-config.js       # Firebase initialization & route guards
    ├── auth.js                  # Login/Signup/Reset utility functions
    ├── components.js            # Header/Footer injector and modals
    ├── student.js               # Exam engine, quizzes, and stats loader
    └── admin.js                 # Content uploads and test constructors
```

---

## Deployment & Setup Guide

### Phase 1: Firebase Project Configuration
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and configure your naming preferences.
3. Once ready, click the **Web Icon (</>)** in the Project Overview dashboard to register a Web App.
4. Copy the initialized `firebaseConfig` object variables:
   ```javascript
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."


---

### Phase 2: Firebase Products Activation

#### 1. Authentication
- Under the Build menu, click **Authentication**.
- Go to the **Sign-in Method** tab.
- Enable **Email/Password** provider and save changes.

#### 2. Firestore Database
- Under the Build menu, click **Firestore Database**.
- Click **Create Database**.
- Select a hosting location and click Next.
- Initialize database in **Test Mode** (you will upload secure rules later).

#### 3. Storage
- Under the Build menu, click **Storage**.
- Click **Get Started**.
- Initialize storage and click Done.

---

### Phase 3: Setup Initial Administrator & Seed Data
As public registration for administrators is disabled for security reasons, a setup file is provided:
1. Run a local web server in the `juris-point` directory (e.g. `npx serve` or double-click to run locally).
2. Navigate to `admin-setup.html` in your browser.
3. Complete the **Create Master Admin Account** form to register your first admin account.
4. Click **Seed Database Collections** to instantly populate the application with lectures, quizzes, mock tests, and notes.
5. **CRITICAL**: Delete the `admin-setup.html` file from your directory after setting up to prevent unauthorized admin creation.

---

### Phase 4: Deploying Security Rules

#### Firestore Security Rules
1. Copy the contents of [firestore.rules](file:///C:/Users/Awais/.gemini/antigravity/scratch/juris-point/firestore.rules).
2. In the Firebase Console, go to **Firestore Database** -> **Rules** tab.
3. Paste the rules and click **Publish**.

#### Storage Security Rules
1. Copy the contents of [storage.rules](file:///C:/Users/Awais/.gemini/antigravity/scratch/juris-point/storage.rules).
2. Go to **Storage** -> **Rules** tab.
3. Paste the rules and click **Publish**.

---

### Phase 5: Hosting (Optional)
If you wish to host your application on Firebase Hosting:
1. Install firebase-tools: `npm install -g firebase-tools`
2. Run `firebase login` in your terminal.
3. Run `firebase init` in the project root:
   - Select **Hosting: Configure files for Firebase Hosting**.
   - Select **Use an existing project** (pick your project).
   - Specify your public directory as `.` (current folder) when prompted.
   - Configure as a single-page app: **No**.
   - Set up automatic builds: **No**.
4. Run `firebase deploy` to publish the website!
