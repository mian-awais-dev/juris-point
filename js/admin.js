// Admin Dashboard Management Operations for Juris Point

// Global quiz and mock test questions arrays (for builders)
let builderMockQuestions = [];
let builderQuizQuestions = [];

// ==========================================
// 1. Dashboard Seeding & Statistics
// ==========================================
function loadAdminDashboard() {
    showLoader(true);
    
    // Fetch count stats
    const usersCount = db.collection('users').where('role', '==', 'student').get();
    const lecturesCount = db.collection('lectures').get();
    const notesCount = db.collection('notes').get();
    const papersCount = db.collection('pastpapers').get();
    const testsCount = db.collection('mocktests').get();

    Promise.all([usersCount, lecturesCount, notesCount, papersCount, testsCount])
        .then(([users, lectures, notes, papers, tests]) => {
            showLoader(false);
            
            // Render Widget Numbers
            document.getElementById('stat-admin-students').innerText = users.size;
            document.getElementById('stat-admin-lectures').innerText = lectures.size;
            document.getElementById('stat-admin-notes').innerText = notes.size;
            document.getElementById('stat-admin-papers').innerText = papers.size;
            document.getElementById('stat-admin-tests').innerText = tests.size;

            // Load primary lists
            loadAdminLecturesList();
            loadAdminNotesList();
            loadAdminPapersList();
            loadAdminMcqsList();
            loadAdminTestsList();
            loadAdminQuizzesList();
            loadAdminStudentsList();
        })
        .catch(error => {
            showLoader(false);
            console.error("Error loading dashboard stats:", error);
            showToast("Failed to load dashboard statistics.", "error");
        });
}

// ==========================================
// 2. Lectures Management
// ==========================================
function loadAdminLecturesList() {
    db.collection('lectures').get().then(snapshot => {
        const tbody = document.getElementById('admin-lectures-table-body');
        if (!tbody) return;
        
        if (snapshot.size === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No lectures uploaded yet.</td></tr>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const l = doc.data();
            html += `
                <tr>
                    <td><strong>${l.title}</strong></td>
                    <td>${l.category}</td>
                    <td>${l.duration || 'N/A'}</td>
                    <td><a href="${l.videoUrl}" target="_blank" style="color:var(--info);"><i class="fas fa-external-link-alt"></i> Video Link</a></td>
                    <td>
                        <button class="action-btn delete" onclick="deleteLecture('${doc.id}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    });
}

function handleUploadLecture(title, description, category, duration, videoUrl) {
    showLoader(true);
    db.collection('lectures').add({
        title,
        description,
        category,
        duration,
        videoUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showLoader(false);
        showToast("Lecture uploaded successfully!", "success");
        document.getElementById('add-lecture-form').reset();
        loadAdminDashboard();
    }).catch(error => {
        showLoader(false);
        showToast("Upload failed: " + error.message, "error");
    });
}

function deleteLecture(id) {
    if (confirm("Are you sure you want to delete this lecture?")) {
        showLoader(true);
        db.collection('lectures').doc(id).delete().then(() => {
            showLoader(false);
            showToast("Lecture deleted.", "success");
            loadAdminDashboard();
        }).catch(error => {
            showLoader(false);
            showToast("Deletion failed.", "error");
        });
    }
}

// ==========================================
// 3. Notes Management
// ==========================================
function loadAdminNotesList() {
    db.collection('notes').get().then(snapshot => {
        const tbody = document.getElementById('admin-notes-table-body');
        if (!tbody) return;
        
        if (snapshot.size === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No notes uploaded yet.</td></tr>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const n = doc.data();
            html += `
                <tr>
                    <td><strong>${n.title}</strong></td>
                    <td>${n.category}</td>
                    <td><a href="${n.fileUrl}" target="_blank" style="color:var(--info);"><i class="fas fa-file-pdf"></i> View PDF</a></td>
                    <td>
                        <button class="action-btn delete" onclick="deleteNote('${doc.id}', '${n.filePath}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    });
}

function handleUploadNotes(title, description, category, fileUrl) {
    if (!fileUrl) {
        showToast("Please enter a PDF link (Google Drive or any direct URL).", "error");
        return;
    }

    if (!fileUrl.startsWith('http')) {
        showToast("Please enter a valid URL starting with http:// or https://.", "error");
        return;
    }

    showLoader(true);
    db.collection('notes').add({
        title,
        description,
        category,
        fileUrl: fileUrl,
        filePath: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showLoader(false);
        showToast("Notes added successfully!", "success");
        document.getElementById('add-notes-form').reset();
        loadAdminDashboard();
    }).catch(error => {
        showLoader(false);
        console.error(error);
        showToast("Failed: " + error.message, "error");
    });
}

function deleteNote(id, filePath) {
    if (confirm("Are you sure you want to delete these notes?")) {
        showLoader(true);
        db.collection('notes').doc(id).delete().then(() => {
            showLoader(false);
            showToast("Notes deleted successfully.", "success");
            loadAdminDashboard();
        }).catch(error => {
            showLoader(false);
            console.error(error);
            showToast("Deletion failed.", "error");
            loadAdminDashboard();
        });
    }
}

// ==========================================
// 4. Past Papers Management
// ==========================================
function loadAdminPapersList() {
    db.collection('pastpapers').get().then(snapshot => {
        const tbody = document.getElementById('admin-papers-table-body');
        if (!tbody) return;
        
        if (snapshot.size === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No past papers uploaded yet.</td></tr>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const p = doc.data();
            html += `
                <tr>
                    <td><strong>${p.title}</strong></td>
                    <td>${p.examType}</td>
                    <td>${p.subject}</td>
                    <td>${p.year || 'N/A'}</td>
                    <td>
                        <button class="action-btn delete" onclick="deletePastPaper('${doc.id}', '${p.filePath}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    });
}

function handleUploadPastPaper(title, subject, examType, year, fileUrl) {
    if (!fileUrl) {
        showToast("Please enter a PDF link (Google Drive or any direct URL).", "error");
        return;
    }

    if (!fileUrl.startsWith('http')) {
        showToast("Please enter a valid URL starting with http:// or https://.", "error");
        return;
    }

    showLoader(true);
    db.collection('pastpapers').add({
        title,
        subject,
        examType,
        year,
        fileUrl: fileUrl,
        filePath: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showLoader(false);
        showToast("Past paper added successfully!", "success");
        document.getElementById('add-paper-form').reset();
        loadAdminDashboard();
    }).catch(error => {
        showLoader(false);
        console.error(error);
        showToast("Failed: " + error.message, "error");
    });
}

function deletePastPaper(id, filePath) {
    if (confirm("Are you sure you want to delete this past paper?")) {
        showLoader(true);
        db.collection('pastpapers').doc(id).delete().then(() => {
            showLoader(false);
            showToast("Past paper deleted.", "success");
            loadAdminDashboard();
        }).catch(error => {
            showLoader(false);
            console.error(error);
            showToast("Deletion failed.", "error");
            loadAdminDashboard();
        });
    }
}

// ==========================================
// 5. Expected MCQs Management
// ==========================================
function loadAdminMcqsList() {
    db.collection('expected_mcqs').get().then(snapshot => {
        const tbody = document.getElementById('admin-mcqs-table-body');
        if (!tbody) return;
        
        if (snapshot.size === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No practice MCQs created yet.</td></tr>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const m = doc.data();
            html += `
                <tr>
                    <td><strong>${m.category}</strong></td>
                    <td style="max-width:300px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${m.question}</td>
                    <td><strong>${m.correctOption}</strong></td>
                    <td>
                        <button class="action-btn delete" onclick="deleteExpectedMcq('${doc.id}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    });
}

function handleAddExpectedMcq(question, optionA, optionB, optionC, optionD, correctOption, category, explanation) {
    showLoader(true);
    db.collection('expected_mcqs').add({
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
        category,
        explanation,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showLoader(false);
        showToast("Expected MCQ added successfully!", "success");
        document.getElementById('add-mcq-form').reset();
        loadAdminDashboard();
    }).catch(error => {
        showLoader(false);
        showToast("Failed to add MCQ: " + error.message, "error");
    });
}

function deleteExpectedMcq(id) {
    if (confirm("Delete this practice MCQ?")) {
        showLoader(true);
        db.collection('expected_mcqs').doc(id).delete().then(() => {
            showLoader(false);
            showToast("MCQ deleted.", "success");
            loadAdminDashboard();
        }).catch(error => {
            showLoader(false);
            showToast("Deletion failed.", "error");
        });
    }
}

// ==========================================
// 6. Mock Tests & Quiz Builders
// ==========================================
function loadAdminTestsList() {
    db.collection('mocktests').get().then(snapshot => {
        const tbody = document.getElementById('admin-tests-table-body');
        if (!tbody) return;

        if (snapshot.size === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No Mock Tests constructed yet.</td></tr>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const t = doc.data();
            html += `
                <tr>
                    <td><strong>${t.title}</strong></td>
                    <td>${t.duration} mins</td>
                    <td>${t.questions ? t.questions.length : 0} MCQs</td>
                    <td>
                        <button class="action-btn delete" onclick="deleteMockTest('${doc.id}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    });
}

function loadAdminQuizzesList() {
    db.collection('quizzes').get().then(snapshot => {
        const tbody = document.getElementById('admin-quizzes-table-body');
        if (!tbody) return;

        if (snapshot.size === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No quizzes created yet.</td></tr>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const q = doc.data();
            html += `
                <tr>
                    <td><strong>${q.title}</strong></td>
                    <td>${q.category}</td>
                    <td>${q.questions ? q.questions.length : 0} Questions</td>
                    <td>
                        <button class="action-btn delete" onclick="deleteQuiz('${doc.id}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    });
}

// Question adding helper for builders
function addQuestionToBuilderList(type) {
    const qText = document.getElementById(`${type}-q-text`).value;
    const optA = document.getElementById(`${type}-opt-a`).value;
    const optB = document.getElementById(`${type}-opt-b`).value;
    const optC = document.getElementById(`${type}-opt-c`).value;
    const optD = document.getElementById(`${type}-opt-d`).value;
    const correct = document.getElementById(`${type}-correct`).value;
    const explanation = document.getElementById(`${type}-explanation`).value;

    if (!qText || !optA || !optB || !optC || !optD || !correct) {
        showToast("Please complete all question fields.", "error");
        return;
    }

    const questionObj = {
        question: qText,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctOption: correct,
        explanation: explanation
    };

    if (type === 'mock') {
        builderMockQuestions.push(questionObj);
        renderBuilderQuestions('mock');
    } else {
        builderQuizQuestions.push(questionObj);
        renderBuilderQuestions('quiz');
    }

    // Reset fields
    document.getElementById(`${type}-q-text`).value = '';
    document.getElementById(`${type}-opt-a`).value = '';
    document.getElementById(`${type}-opt-b`).value = '';
    document.getElementById(`${type}-opt-c`).value = '';
    document.getElementById(`${type}-opt-d`).value = '';
    document.getElementById(`${type}-explanation`).value = '';
    showToast("Question added to list.", "success");
}

function renderBuilderQuestions(type) {
    const list = document.getElementById(`${type}-questions-preview`);
    const arr = type === 'mock' ? builderMockQuestions : builderQuizQuestions;
    
    if (arr.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted); font-size:13px;">No questions added yet.</p>';
        return;
    }

    list.innerHTML = arr.map((q, idx) => `
        <div style="background-color:var(--bg-light); border:1px solid #E2E8F0; padding:12px; border-radius:6px; margin-bottom:10px; font-size:13px;">
            <div class="flex-between">
                <strong>Q${idx + 1}: ${q.question}</strong>
                <button type="button" onclick="removeQuestionFromBuilder('${type}', ${idx})" style="color:var(--error); background:none; border:none; cursor:pointer;"><i class="fas fa-times-circle"></i></button>
            </div>
            <div>A: ${q.optionA} | B: ${q.optionB} | C: ${q.optionC} | D: ${q.optionD}</div>
            <div>Correct: <strong>${q.correctOption}</strong></div>
        </div>
    `).join('');
}

function removeQuestionFromBuilder(type, idx) {
    if (type === 'mock') {
        builderMockQuestions.splice(idx, 1);
        renderBuilderQuestions('mock');
    } else {
        builderQuizQuestions.splice(idx, 1);
        renderBuilderQuestions('quiz');
    }
}

function handleSaveMockTest(title, duration) {
    if (!title || !duration) {
        showToast("Please fill in mock test title and duration.", "error");
        return;
    }

    if (builderMockQuestions.length === 0) {
        showToast("Please add at least one question.", "error");
        return;
    }

    showLoader(true);
    db.collection('mocktests').add({
        title,
        duration: parseInt(duration),
        questions: builderMockQuestions,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showLoader(false);
        showToast("Mock Test saved successfully!", "success");
        builderMockQuestions = [];
        document.getElementById('add-mocktest-form').reset();
        document.getElementById('mock-questions-preview').innerHTML = '';
        loadAdminDashboard();
    }).catch(error => {
        showLoader(false);
        showToast("Failed to save Mock Test: " + error.message, "error");
    });
}

function handleSaveQuiz(title, category) {
    if (!title || !category) {
        showToast("Please select title and category.", "error");
        return;
    }

    if (builderQuizQuestions.length === 0) {
        showToast("Please add at least one question.", "error");
        return;
    }

    showLoader(true);
    db.collection('quizzes').add({
        title,
        category,
        questions: builderQuizQuestions,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        showLoader(false);
        showToast("Quiz saved successfully!", "success");
        builderQuizQuestions = [];
        document.getElementById('add-quiz-form').reset();
        document.getElementById('quiz-questions-preview').innerHTML = '';
        loadAdminDashboard();
    }).catch(error => {
        showLoader(false);
        showToast("Failed to save Quiz: " + error.message, "error");
    });
}

function deleteMockTest(id) {
    if (confirm("Are you sure you want to delete this Mock Test?")) {
        showLoader(true);
        db.collection('mocktests').doc(id).delete().then(() => {
            showLoader(false);
            showToast("Mock Test deleted.", "success");
            loadAdminDashboard();
        }).catch(error => {
            showLoader(false);
            showToast("Deletion failed.", "error");
        });
    }
}

function deleteQuiz(id) {
    if (confirm("Are you sure you want to delete this Quiz?")) {
        showLoader(true);
        db.collection('quizzes').doc(id).delete().then(() => {
            showLoader(false);
            showToast("Quiz deleted.", "success");
            loadAdminDashboard();
        }).catch(error => {
            showLoader(false);
            showToast("Deletion failed.", "error");
        });
    }
}

// ==========================================
// 7. Student Management & Scoring Statistics
// ==========================================
function loadAdminStudentsList() {
    db.collection('users').where('role', '==', 'student').get().then(snapshot => {
        const tbody = document.getElementById('admin-students-table-body');
        if (!tbody) return;

        if (snapshot.size === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No students registered yet.</td></tr>';
            return;
        }

        let html = '';
        snapshot.forEach(doc => {
            const s = doc.data();
            const date = s.createdAt ? new Date(s.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
            html += `
                <tr>
                    <td><strong>${s.fullName || 'Student'}</strong></td>
                    <td>${s.email}</td>
                    <td>${date}</td>
                    <td style="display:flex; gap:8px; align-items:center;">
                        <button class="btn btn-outline" style="padding: 4px 8px; font-size:12px;" onclick="viewStudentResults('${s.uid}', '${s.fullName || 'Student'}')"><i class="fas fa-eye"></i> View Results</button>
                        <button class="action-btn delete" style="padding: 4px 8px; font-size:12px;" onclick="deleteStudent('${doc.id}', '${s.fullName || 'Student'}')"><i class="fas fa-trash-alt"></i> Delete</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }).catch(error => {
        console.error("Error fetching students: ", error);
    });
}

function deleteStudent(docId, fullName) {
    if (confirm(`Are you sure you want to delete "${fullName}"? This action cannot be undone.`)) {
        showLoader(true);
        db.collection('users').doc(docId).delete().then(() => {
            showLoader(false);
            showToast(`${fullName} successfully deleted.`, "success");
            loadAdminDashboard();
        }).catch(error => {
            showLoader(false);
            console.error("Error deleting student:", error);
            showToast("Delete failed: " + error.message, "error");
        });
    }
}

function viewStudentResults(uid, fullName) {
    showLoader(true);
    db.collection('results')
      .where('uid', '==', uid)
      .get()
      .then(snapshot => {
          showLoader(false);
          
          let resultsHtml = '';
          if (snapshot.size === 0) {
              resultsHtml = '<p class="text-center" style="padding:16px;">This student has not attempted any assessments.</p>';
          } else {
              resultsHtml = `
                  <div class="table-wrapper">
                      <table>
                          <thead>
                              <tr>
                                  <th>Assessment</th>
                                  <th>Type</th>
                                  <th>Score</th>
                                  <th>Percentage</th>
                                  <th>Date</th>
                              </tr>
                          </thead>
                          <tbody>
              `;
              snapshot.forEach(doc => {
                  const res = doc.data();
                  const date = res.timestamp ? new Date(res.timestamp.seconds * 1000).toLocaleDateString() : 'Just now';
                  resultsHtml += `
                      <tr>
                          <td><strong>${res.testTitle}</strong></td>
                          <td><span class="badge ${res.testType === 'mock' ? 'badge-info' : 'badge-success'}">${res.testType}</span></td>
                          <td>${res.score} / ${res.totalQuestions}</td>
                          <td>${Math.round(res.percentage)}%</td>
                          <td>${date}</td>
                      </tr>
                  `;
              });
              resultsHtml += `
                          </tbody>
                      </table>
                  </div>
              `;
          }

          // Open in a modal
          let resultsModal = document.getElementById('student-results-modal');
          if (!resultsModal) {
              resultsModal = document.createElement('div');
              resultsModal.id = 'student-results-modal';
              resultsModal.className = 'modal';
              document.body.appendChild(resultsModal);
          }
          
          resultsModal.innerHTML = `
              <div class="modal-content" style="max-width:700px;">
                  <button class="modal-close" style="color:var(--text-dark);" onclick="closeStudentResultsModal()">&times;</button>
                  <div class="modal-info" style="border-bottom:1px solid #E2E8F0;">
                      <h3>Results for ${fullName}</h3>
                  </div>
                  <div style="padding:24px; max-height:400px; overflow-y:auto;">
                      ${resultsHtml}
                  </div>
                  <div style="padding:16px 24px; background-color:#F8FAFC; text-align:right;">
                      <button class="btn btn-primary" style="padding:6px 16px; font-size:13px;" onclick="closeStudentResultsModal()">Close</button>
                  </div>
              </div>
          `;
          
          resultsModal.classList.add('active');
      }).catch(error => {
          showLoader(false);
          console.error("Error viewing results:", error);
          showToast("Failed to retrieve student records.", "error");
      });
}

function closeStudentResultsModal() {
    const modal = document.getElementById('student-results-modal');
    if (modal) modal.classList.remove('active');
}