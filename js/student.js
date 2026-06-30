// Student Operations and Exam Engine for Juris Point

// Global state variables for test taker
let currentExam = null;
let examQuestions = [];
let userAnswers = {};
let examTimerInterval = null;
let secondsRemaining = 0;
let currentQuestionIndex = 0;

// Global state for topic quizzes
let currentQuiz = null;
let quizQuestions = [];
let currentQuizIndex = 0;
let quizScore = 0;

// ==========================================
// 1. Student Dashboard Functions
// ==========================================
function loadStudentDashboard(user) {
    // Set Profile Info
    document.getElementById('student-name-welcome').innerText = user.fullName || "Student";
    document.getElementById('profile-name-input').value = user.fullName || "";
    document.getElementById('profile-email-input').value = user.email || "";

    // Fetch stats and results
    db.collection('results')
      .where('uid', '==', user.uid)
      .orderBy('timestamp', 'desc')
      .get()
      .then(snapshot => {
          const resultsList = [];
          let totalScore = 0;
          let testCount = 0;

          snapshot.forEach(doc => {
              const res = doc.data();
              resultsList.push(res);
              if (res.testType === 'mock') {
                  totalScore += parseFloat(res.percentage);
                  testCount++;
              }
          });

          // Update widgets
          document.getElementById('stat-completed-tests').innerText = testCount;
          document.getElementById('stat-avg-score').innerText = testCount > 0 ? Math.round(totalScore / testCount) + "%" : "0%";
          
          // Render recent results table
          const tbody = document.getElementById('recent-results-table-body');
          if (tbody) {
              if (resultsList.length === 0) {
                  tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color:var(--text-muted);">No tests attempted yet.</td></tr>';
              } else {
                  tbody.innerHTML = resultsList.map(res => `
                      <tr>
                          <td><strong>${res.testTitle}</strong></td>
                          <td><span class="badge ${res.testType === 'mock' ? 'badge-info' : 'badge-success'}">${res.testType}</span></td>
                          <td>${res.score} / ${res.totalQuestions}</td>
                          <td><strong>${Math.round(res.percentage)}%</strong></td>
                          <td>${res.timestamp ? new Date(res.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}</td>
                      </tr>
                  `).join('');
              }
          }
      })
      .catch(error => {
          console.error("Error loading dashboard stats:", error);
          showToast("Error loading stats.", "error");
      });
}

// ==========================================
// 2. Lectures Fetch & Render
// ==========================================
function loadLectures(search = "", category = "all") {
    showLoader(true);
    let query = db.collection('lectures');
    
    query.get().then(snapshot => {
        showLoader(false);
        const grid = document.getElementById('lectures-container');
        if (!grid) return;
        
        let lectures = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            lectures.push({ id: doc.id, ...data });
        });

        // Client side filtering
        if (category !== 'all') {
            lectures = lectures.filter(l => l.category === category);
        }
        if (search.trim() !== '') {
            const s = search.toLowerCase();
            lectures = lectures.filter(l => l.title.toLowerCase().includes(s) || l.description.toLowerCase().includes(s));
        }

        if (lectures.length === 0) {
            grid.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--text-muted);"><i class="fas fa-video-slash" style="font-size: 40px; margin-bottom: 16px;"></i><p>No lectures match your criteria.</p></div>';
            return;
        }

        grid.innerHTML = lectures.map(l => {
            // Get YouTube thumbnail if applicable
            let thumb = 'assets/images/lecture-placeholder.jpg';
            if (l.videoUrl && (l.videoUrl.includes('youtube.com') || l.videoUrl.includes('youtu.be'))) {
                let videoId = '';
                if (l.videoUrl.includes('v=')) videoId = l.videoUrl.split('v=')[1].split('&')[0];
                else if (l.videoUrl.includes('youtu.be/')) videoId = l.videoUrl.split('youtu.be/')[1].split('?')[0];
                if (videoId) thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
            
            return `
                <div class="lecture-card">
                    <div class="lecture-thumbnail">
                        <img src="${thumb}" alt="${l.title}" onerror="this.src='https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'">
                        <button class="play-btn" onclick="openVideoModal('${l.videoUrl}', '${l.title.replace(/'/g, "\\'")}', '${l.description.replace(/'/g, "\\'")}')"><i class="fas fa-play"></i></button>
                    </div>
                    <div class="lecture-info">
                        <span class="lecture-category">${l.category}</span>
                        <h3 class="lecture-title">${l.title}</h3>
                        <p class="lecture-desc">${l.description}</p>
                        <div class="lecture-footer">
                            <span><i class="far fa-clock" style="margin-right:6px;"></i> ${l.duration || 'Video'}</span>
                            <span><i class="far fa-calendar-alt" style="margin-right:6px;"></i> Academic Prep</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }).catch(error => {
        showLoader(false);
        console.error("Error loading lectures:", error);
    });
}

// ==========================================
// 3. Notes Fetch & Render
// ==========================================
function loadNotes(search = "", category = "all") {
    showLoader(true);
    db.collection('notes').get().then(snapshot => {
        showLoader(false);
        const grid = document.getElementById('notes-container');
        if (!grid) return;

        let notes = [];
        snapshot.forEach(doc => {
            notes.push({ id: doc.id, ...doc.data() });
        });

        if (category !== 'all') {
            notes = notes.filter(n => n.category === category);
        }
        if (search.trim() !== '') {
            const s = search.toLowerCase();
            notes = notes.filter(n => n.title.toLowerCase().includes(s) || n.description.toLowerCase().includes(s));
        }

        if (notes.length === 0) {
            grid.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--text-muted);"><i class="fas fa-file-excel" style="font-size: 40px; margin-bottom: 16px;"></i><p>No study notes found.</p></div>';
            return;
        }

        grid.innerHTML = notes.map(n => `
            <div class="doc-card">
                <div class="doc-icon"><i class="fas fa-file-pdf"></i></div>
                <h3 class="doc-title">${n.title}</h3>
                <p class="doc-meta"><i class="fas fa-tags" style="margin-right:6px;"></i> ${n.category}</p>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:16px; flex-grow:1;">${n.description || 'Prep notes uploaded by admin.'}</div>
                <div class="doc-actions">
                    <button class="btn btn-outline" style="padding: 8px;" onclick="openPdfModal('${n.fileUrl}', '${n.title.replace(/'/g, "\\'")}')">
                        <i class="fas fa-eye" style="margin-right:6px;"></i> Preview
                    </button>
                    <a href="${n.fileUrl}" download target="_blank" class="btn btn-primary" style="padding: 8px;">
                        <i class="fas fa-download" style="margin-right:6px;"></i> Download
                    </a>
                </div>
            </div>
        `).join('');
    }).catch(error => {
        showLoader(false);
        console.error("Error loading notes:", error);
    });
}

// ==========================================
// 4. Past Papers Fetch & Render
// ==========================================
function loadPastPapers(search = "", examType = "all") {
    showLoader(true);
    db.collection('pastpapers').get().then(snapshot => {
        showLoader(false);
        const grid = document.getElementById('pastpapers-container');
        if (!grid) return;

        let papers = [];
        snapshot.forEach(doc => {
            papers.push({ id: doc.id, ...doc.data() });
        });

        if (examType !== 'all') {
            papers = papers.filter(p => p.examType === examType);
        }
        if (search.trim() !== '') {
            const s = search.toLowerCase();
            papers = papers.filter(p => p.title.toLowerCase().includes(s) || p.subject.toLowerCase().includes(s));
        }

        if (papers.length === 0) {
            grid.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 40px; color: var(--text-muted);"><i class="fas fa-file-invoice" style="font-size: 40px; margin-bottom: 16px;"></i><p>No past papers found.</p></div>';
            return;
        }

        grid.innerHTML = papers.map(p => `
            <div class="doc-card">
                <div class="doc-icon" style="color:var(--primary-medium);"><i class="fas fa-graduation-cap"></i></div>
                <h3 class="doc-title">${p.title} (${p.year || 'N/A'})</h3>
                <p class="doc-meta"><i class="fas fa-book" style="margin-right:6px;"></i> ${p.examType} - ${p.subject}</p>
                <div class="doc-actions">
                    <button class="btn btn-outline" style="padding: 8px;" onclick="openPdfModal('${p.fileUrl}', '${p.title.replace(/'/g, "\\'")}')">
                        <i class="fas fa-eye" style="margin-right:6px;"></i> Preview
                    </button>
                    <a href="${p.fileUrl}" download target="_blank" class="btn btn-primary" style="padding: 8px;">
                        <i class="fas fa-download" style="margin-right:6px;"></i> Download
                    </a>
                </div>
            </div>
        `).join('');
    }).catch(error => {
        showLoader(false);
        console.error("Error loading past papers:", error);
    });
}

// ==========================================
// 5. Expected MCQs Logic (Practice Mode)
// ==========================================
function loadExpectedMCQs(category = "all") {
    showLoader(true);
    db.collection('expected_mcqs').get().then(snapshot => {
        showLoader(false);
        const container = document.getElementById('mcq-practice-container');
        if (!container) return;

        let mcqs = [];
        snapshot.forEach(doc => {
            mcqs.push({ id: doc.id, ...doc.data() });
        });

        if (category !== 'all') {
            mcqs = mcqs.filter(m => m.category === category);
        }

        if (mcqs.length === 0) {
            container.innerHTML = '<div class="text-center" style="padding: 40px; color: var(--text-muted);"><i class="fas fa-question-circle" style="font-size: 40px; margin-bottom: 16px;"></i><p>No MCQs uploaded for this category yet.</p></div>';
            return;
        }

        container.innerHTML = mcqs.map((m, idx) => `
            <div class="mcq-practice-card" id="mcq-card-${m.id}">
                <div class="mcq-question">Q${idx + 1}: ${m.question}</div>
                <div class="mcq-options">
                    <button class="mcq-option-btn" onclick="checkMcqAnswer('${m.id}', 'A', '${m.correctOption}')">A: ${m.optionA}</button>
                    <button class="mcq-option-btn" onclick="checkMcqAnswer('${m.id}', 'B', '${m.correctOption}')">B: ${m.optionB}</button>
                    <button class="mcq-option-btn" onclick="checkMcqAnswer('${m.id}', 'C', '${m.correctOption}')">C: ${m.optionC}</button>
                    <button class="mcq-option-btn" onclick="checkMcqAnswer('${m.id}', 'D', '${m.correctOption}')">D: ${m.optionD}</button>
                </div>
                <div class="quiz-explanation" id="explanation-${m.id}">
                    <strong>Correct Answer: ${m.correctOption}</strong><br>
                    ${m.explanation || 'Study reference: Legal principles apply.'}
                </div>
            </div>
        `).join('');
    }).catch(error => {
        showLoader(false);
        console.error("Error fetching MCQs:", error);
    });
}

function checkMcqAnswer(mcqId, selected, correct) {
    const card = document.getElementById(`mcq-card-${mcqId}`);
    if (!card) return;
    
    const buttons = card.querySelectorAll('.mcq-option-btn');
    buttons.forEach(btn => {
        // Disable after clicking
        btn.disabled = true;
        
        // Highlight correct and incorrect
        const label = btn.innerText.substring(0, 1);
        if (label === correct) {
            btn.classList.add('correct');
        } else if (label === selected) {
            btn.classList.add('incorrect');
        }
    });

    // Show explanation
    const exp = document.getElementById(`explanation-${mcqId}`);
    if (exp) exp.style.display = 'block';
}

// ==========================================
// 6. Quizzes (Topic-wise) System
// ==========================================
function loadQuizzes() {
    showLoader(true);
    db.collection('quizzes').get().then(snapshot => {
        showLoader(false);
        const listDiv = document.getElementById('quizzes-list');
        if (!listDiv) return;

        let quizzes = [];
        snapshot.forEach(doc => {
            quizzes.push({ id: doc.id, ...doc.data() });
        });

        if (quizzes.length === 0) {
            listDiv.innerHTML = '<div class="text-center" style="padding: 40px; color: var(--text-muted);"><p>No quizzes available yet.</p></div>';
            return;
        }

        listDiv.innerHTML = quizzes.map(q => `
            <div class="card" style="padding:24px; margin-bottom:16px;">
                <div class="flex-between">
                    <div>
                        <h3 style="font-size:18px; margin-bottom:4px;">${q.title}</h3>
                        <p style="font-size:13px; color:var(--text-muted); margin:0;">Category: ${q.category} | ${q.questions ? q.questions.length : 0} Questions</p>
                    </div>
                    <button class="btn btn-primary" style="padding: 8px 16px; font-size:13px;" onclick="startQuiz('${q.id}')">Start Quiz</button>
                </div>
            </div>
        `).join('');
    }).catch(error => {
        showLoader(false);
        console.error("Error loading quizzes:", error);
    });
}

function startQuiz(quizId) {
    showLoader(true);
    db.collection('quizzes').doc(quizId).get().then(doc => {
        showLoader(false);
        if (!doc.exists) {
            showToast("Quiz details not found.", "error");
            return;
        }
        
        currentQuiz = doc.data();
        currentQuiz.id = doc.id;
        quizQuestions = currentQuiz.questions || [];
        currentQuizIndex = 0;
        quizScore = 0;

        if (quizQuestions.length === 0) {
            showToast("This quiz has no questions.", "warning");
            return;
        }

        // Toggle Quiz Panels
        document.getElementById('quizzes-selection-view').style.display = 'none';
        document.getElementById('quiz-play-view').style.display = 'block';
        
        loadQuizQuestion();
    }).catch(error => {
        showLoader(false);
        showToast("Error starting quiz.", "error");
    });
}

function loadQuizQuestion() {
    if (currentQuizIndex >= quizQuestions.length) {
        finishQuiz();
        return;
    }

    const q = quizQuestions[currentQuizIndex];
    
    // Progress
    const progressPercent = ((currentQuizIndex) / quizQuestions.length) * 100;
    document.getElementById('quiz-progress-bar-fill').style.width = `${progressPercent}%`;
    document.getElementById('quiz-progress-text').innerText = `Question ${currentQuizIndex + 1} of ${quizQuestions.length}`;
    
    // UI Question
    document.getElementById('quiz-question-container').innerHTML = `
        <div class="question-text">${q.question}</div>
        <ul class="options-list">
            <li class="option-item" onclick="selectQuizAnswer(this, 'A', '${q.correctOption}')">
                <div class="option-letter">A</div> <span>${q.optionA}</span>
            </li>
            <li class="option-item" onclick="selectQuizAnswer(this, 'B', '${q.correctOption}')">
                <div class="option-letter">B</div> <span>${q.optionB}</span>
            </li>
            <li class="option-item" onclick="selectQuizAnswer(this, 'C', '${q.correctOption}')">
                <div class="option-letter">C</div> <span>${q.optionC}</span>
            </li>
            <li class="option-item" onclick="selectQuizAnswer(this, 'D', '${q.correctOption}')">
                <div class="option-letter">D</div> <span>${q.optionD}</span>
            </li>
        </ul>
        <div class="quiz-explanation" id="quiz-question-explanation">
            <strong>Explanation:</strong> ${q.explanation || 'No explanation provided.'}
        </div>
    `;

    document.getElementById('quiz-next-btn').style.display = 'none';
}

function selectQuizAnswer(element, selected, correct) {
    const listItems = element.parentNode.querySelectorAll('.option-item');
    
    // Highlight correct & incorrect
    listItems.forEach(item => {
        item.style.pointerEvents = 'none'; // Lock selections
        const letter = item.querySelector('.option-letter').innerText;
        if (letter === correct) {
            item.classList.add('correct');
        } else if (letter === selected) {
            item.classList.add('incorrect');
        }
    });

    if (selected === correct) {
        quizScore++;
        showToast("Correct!", "success");
    } else {
        showToast("Incorrect answer.", "error");
    }

    // Show Explanation
    document.getElementById('quiz-question-explanation').style.display = 'block';
    
    // Show Next Button
    document.getElementById('quiz-next-btn').style.display = 'inline-flex';
}

function nextQuizQuestion() {
    currentQuizIndex++;
    loadQuizQuestion();
}

function finishQuiz() {
    showLoader(true);
    const user = auth.currentUser;
    const percentage = (quizScore / quizQuestions.length) * 100;
    
    // Save to results collection
    db.collection('results').add({
        uid: user.uid,
        userEmail: user.email,
        testTitle: currentQuiz.title,
        testType: 'quiz',
        score: quizScore,
        totalQuestions: quizQuestions.length,
        percentage: percentage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showLoader(false);
        // Show results UI
        document.getElementById('quiz-play-view').style.display = 'none';
        document.getElementById('quiz-results-view').style.display = 'block';
        
        document.getElementById('quiz-score-number').innerText = `${quizScore} / ${quizQuestions.length}`;
        document.getElementById('quiz-score-percent').innerText = `${Math.round(percentage)}%`;
    }).catch(error => {
        showLoader(false);
        console.error("Error saving quiz score:", error);
        showToast("Error saving results to server.", "error");
    });
}

function exitQuiz() {
    document.getElementById('quiz-results-view').style.display = 'none';
    document.getElementById('quiz-play-view').style.display = 'none';
    document.getElementById('quizzes-selection-view').style.display = 'block';
    loadQuizzes();
}

// ==========================================
// 7. Mock Test Engine (Fullscreen Interface)
// ==========================================
function loadMockTests() {
    showLoader(true);
    db.collection('mocktests').get().then(snapshot => {
        showLoader(false);
        const listDiv = document.getElementById('mocktests-list');
        if (!listDiv) return;

        let tests = [];
        snapshot.forEach(doc => {
            tests.push({ id: doc.id, ...doc.data() });
        });

        if (tests.length === 0) {
            listDiv.innerHTML = '<div class="text-center" style="padding: 40px; color: var(--text-muted);"><p>No Mock Tests available yet.</p></div>';
            return;
        }

        listDiv.innerHTML = tests.map(t => `
            <div class="card" style="padding:28px; margin-bottom:20px;">
                <h3 style="font-size:20px; margin-bottom:8px;">${t.title}</h3>
                <p style="color:var(--text-muted); font-size:14px; margin-bottom:16px;">
                    <i class="far fa-clock" style="margin-right:6px;"></i> Time Limit: ${t.duration || 30} mins | 
                    <i class="far fa-question-circle" style="margin-right:6px;"></i> ${t.questions ? t.questions.length : 0} Questions
                </p>
                <div style="font-size:14px; color:var(--text-dark); margin-bottom:20px;">This is a simulated exam format matching LAT and Law bar entries. Fullscreen environment, auto-submits on timer end.</div>
                <div>
                    <button class="btn btn-gold" onclick="startMockTest('${t.id}')">Start Assessment</button>
                </div>
            </div>
        `).join('');
    }).catch(error => {
        showLoader(false);
        console.error("Error loading mock tests:", error);
    });
}

function startMockTest(testId) {
    showLoader(true);
    db.collection('mocktests').doc(testId).get().then(doc => {
        showLoader(false);
        if (!doc.exists) {
            showToast("Test details not found.", "error");
            return;
        }

        currentExam = doc.data();
        currentExam.id = doc.id;
        examQuestions = currentExam.questions || [];
        userAnswers = {};
        currentQuestionIndex = 0;
        
        if (examQuestions.length === 0) {
            showToast("This mock test has no questions.", "warning");
            return;
        }

        // Show Exam UI in Fullscreen Mode
        document.getElementById('mocktests-selection-view').style.display = 'none';
        
        let examContainer = document.getElementById('exam-fullscreen-container');
        if (!examContainer) {
            examContainer = document.createElement('div');
            examContainer.id = 'exam-fullscreen-container';
            examContainer.className = 'exam-fullscreen';
            document.body.appendChild(examContainer);
        }
        examContainer.style.display = 'flex';

        // Setup timer
        secondsRemaining = (parseInt(currentExam.duration) || 30) * 60;
        
        renderExamLayout();
        startExamTimer();
    }).catch(error => {
        showLoader(false);
        showToast("Error starting mock test.", "error");
    });
}

function renderExamLayout() {
    const container = document.getElementById('exam-fullscreen-container');
    container.innerHTML = `
        <div class="exam-nav flex-between">
            <h3 style="color:var(--text-light); font-size:18px;">${currentExam.title}</h3>
            <div class="exam-timer">
                <i class="far fa-clock"></i> <span id="exam-timer-display">00:00</span>
            </div>
        </div>
        <div class="exam-body">
            <div class="exam-content" id="exam-question-area">
                <!-- Question content will be rendered here -->
            </div>
            <div class="exam-sidebar">
                <h4 style="font-size:15px; margin-bottom:16px;">Question Navigator</h4>
                <div class="question-nav-grid" id="exam-navigator-grid">
                    <!-- Navigator buttons -->
                </div>
                <div style="margin-top:auto; display:flex; flex-direction:column; gap:12px;">
                    <button class="btn btn-gold" onclick="confirmSubmitExam()"><i class="fas fa-file-import" style="margin-right:8px;"></i> Submit Exam</button>
                    <button class="btn btn-outline" style="border-color:#CBD5E1; color:var(--text-muted);" onclick="cancelExam()"><i class="fas fa-times" style="margin-right:8px;"></i> Exit</button>
                </div>
            </div>
        </div>
    `;

    renderQuestionNavigator();
    loadExamQuestion(0);
}

function renderQuestionNavigator() {
    const grid = document.getElementById('exam-navigator-grid');
    grid.innerHTML = examQuestions.map((_, idx) => `
        <button class="q-nav-btn ${userAnswers[idx] ? 'answered' : ''} ${idx === currentQuestionIndex ? 'current' : ''}" 
                onclick="loadExamQuestion(${idx})">${idx + 1}</button>
    `).join('');
}

function loadExamQuestion(index) {
    // Save current selection visual state before switching
    currentQuestionIndex = index;
    const q = examQuestions[index];
    const area = document.getElementById('exam-question-area');
    
    // Redraw navigator highlights
    renderQuestionNavigator();

    area.innerHTML = `
        <div class="flex-between" style="border-bottom:1px solid #E2E8F0; padding-bottom:12px; margin-bottom:24px;">
            <span style="font-weight:600; color:var(--primary-medium);">Question ${index + 1} of ${examQuestions.length}</span>
            <span style="font-size:12px; background-color:#E2E8F0; padding:4px 8px; border-radius:4px;">1 Mark</span>
        </div>
        
        <div class="question-text" style="font-size:22px; line-height:1.5; margin-bottom:30px;">${q.question}</div>
        
        <ul class="options-list" style="max-width:700px;">
            <li class="option-item ${userAnswers[index] === 'A' ? 'selected' : ''}" onclick="selectExamAnswer('A')">
                <div class="option-letter">A</div> <span>${q.optionA}</span>
            </li>
            <li class="option-item ${userAnswers[index] === 'B' ? 'selected' : ''}" onclick="selectExamAnswer('B')">
                <div class="option-letter">B</div> <span>${q.optionB}</span>
            </li>
            <li class="option-item ${userAnswers[index] === 'C' ? 'selected' : ''}" onclick="selectExamAnswer('C')">
                <div class="option-letter">C</div> <span>${q.optionC}</span>
            </li>
            <li class="option-item ${userAnswers[index] === 'D' ? 'selected' : ''}" onclick="selectExamAnswer('D')">
                <div class="option-letter">D</div> <span>${q.optionD}</span>
            </li>
        </ul>

        <div style="margin-top:40px; display:flex; gap:16px;">
            <button class="btn btn-outline" onclick="prevExamQuestion()" ${index === 0 ? 'disabled style="opacity:0.5;"' : ''}>Previous</button>
            <button class="btn btn-primary" onclick="nextExamQuestion()" ${index === examQuestions.length - 1 ? 'disabled style="opacity:0.5;"' : ''}>Next</button>
        </div>
    `;
}

function selectExamAnswer(option) {
    userAnswers[currentQuestionIndex] = option;
    
    // Re-highlight options
    const items = document.querySelectorAll('#exam-question-area .option-item');
    items.forEach((item, idx) => {
        const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
        if (optionLabel === option) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    renderQuestionNavigator();
}

function prevExamQuestion() {
    if (currentQuestionIndex > 0) {
        loadExamQuestion(currentQuestionIndex - 1);
    }
}

function nextExamQuestion() {
    if (currentQuestionIndex < examQuestions.length - 1) {
        loadExamQuestion(currentQuestionIndex + 1);
    }
}

function startExamTimer() {
    if (examTimerInterval) clearInterval(examTimerInterval);
    
    updateTimerDisplay();
    examTimerInterval = setInterval(() => {
        secondsRemaining--;
        updateTimerDisplay();
        
        if (secondsRemaining <= 0) {
            clearInterval(examTimerInterval);
            showToast("Time expired! Submitting exam automatically.", "warning");
            submitMockExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    const display = document.getElementById('exam-timer-display');
    if (display) {
        display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        // Turn red if less than 5 minutes
        if (secondsRemaining < 300) {
            display.parentNode.style.backgroundColor = '#EF4444';
            display.parentNode.style.color = '#fff';
        }
    }
}

function confirmSubmitExam() {
    const unansweredCount = examQuestions.length - Object.keys(userAnswers).length;
    let confirmMsg = "Are you sure you want to submit your exam?";
    if (unansweredCount > 0) {
        confirmMsg = `You have ${unansweredCount} unanswered questions. Are you sure you want to submit your exam?`;
    }

    if (confirm(confirmMsg)) {
        submitMockExam();
    }
}

function submitMockExam() {
    clearInterval(examTimerInterval);
    showLoader(true);
    
    let score = 0;
    examQuestions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctOption) {
            score++;
        }
    });

    const percentage = (score / examQuestions.length) * 100;
    const user = auth.currentUser;

    db.collection('results').add({
        uid: user.uid,
        userEmail: user.email,
        testTitle: currentExam.title,
        testType: 'mock',
        score: score,
        totalQuestions: examQuestions.length,
        percentage: percentage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showLoader(false);
        // Display score in fullscreen result page
        renderExamResults(score, percentage);
    }).catch(error => {
        showLoader(false);
        console.error("Error submitting mock test:", error);
        showToast("Error saving results.", "error");
    });
}

function renderExamResults(score, percentage) {
    const container = document.getElementById('exam-fullscreen-container');
    container.innerHTML = `
        <div class="exam-nav flex-center">
            <h3 style="color:var(--text-light); font-size:18px;">Exam Score Summary</h3>
        </div>
        <div class="flex-center" style="flex-grow:1; padding:40px; overflow-y:auto;">
            <div class="auth-card text-center" style="max-width:550px; margin:0;">
                <div class="results-circle">
                    <div class="results-score">${Math.round(percentage)}%</div>
                    <div class="results-label">Score</div>
                </div>
                <h2 style="margin-bottom:16px;">Assessment Complete!</h2>
                <p style="color:var(--text-muted); margin-bottom:24px;">
                    You answered <strong>${score}</strong> out of <strong>${examQuestions.length}</strong> questions correctly.
                </p>
                <button class="btn btn-primary" onclick="closeExamMode()">Return to Portal</button>
            </div>
        </div>
    `;
}

function cancelExam() {
    if (confirm("Are you sure you want to exit the exam? Your progress will be lost.")) {
        clearInterval(examTimerInterval);
        closeExamMode();
    }
}

function closeExamMode() {
    const container = document.getElementById('exam-fullscreen-container');
    if (container) container.style.display = 'none';
    
    // Toggle main selection view
    document.getElementById('mocktests-selection-view').style.display = 'block';
    loadMockTests();
}
