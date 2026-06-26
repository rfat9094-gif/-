// 1. استيراد دالات الفايربيز المطلوبة من الـ CDN الحديث للإصدار v10
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// بيانات الفايربيز الحقيقية الخاصة بمشروعك (لوحة الصدارة)
const firebaseConfig = {
  apiKey: "AIzaSyAAdhb3qfhEuQQycvgWR3qlCm6sPZauhCU",
  authDomain: "test-yourself-b5dba.firebaseapp.com",
  projectId: "test-yourself-b5dba",
  storageBucket: "test-yourself-b5dba.firebasestorage.app",
  messagingSenderId: "340141411273",
  appId: "1:340141411273:web:8ad70abcd444c494c6b618",
  measurementId: "G-XENB7PVNV3"
};

let db = null;

try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
        const app = initializeApp(firebaseConfig);
        db = getDatabase(app);
        console.log("تم اتصال Firebase بنجاح! 🔥 ولوحة الصدارة جاهزة.");
    }
} catch (e) {
    console.log("تخطي الفايربيز مؤقتاً:", e);
}

// بنك الأسئلة الاحتياطي المدمج
const localBackupQuestions = {
  "countries": [
    { "id": "c_1", "question": "إلى أي دولة ينتمي هذا العلم؟", "correctAnswer": "مصر", "options": ["مصر", "سوريا", "العراق", "اليمن"], "image": "https://flagcdn.com/w320/eg.png" },
    { "id": "c_2", "question": "إلى أي دولة ينتمي هذا العلم؟", "correctAnswer": "السعودية", "options": ["السعودية", "الكويت", "عمان", "قطر"], "image": "https://flagcdn.com/w320/sa.png" },
    { "id": "c_3", "question": "إلى أي دولة ينتمي هذا العلم؟", "correctAnswer": "الإمارات", "options": ["الإمارات", "الأردن", "فلسطين", "السودان"], "image": "https://flagcdn.com/w320/ae.png" },
    { "id": "c_4", "question": "إلى أي دولة ينتمي هذا العلم؟", "correctAnswer": "الأردن", "options": ["الأردن", "الكويت", "البحرين", "تونس"], "image": "https://flagcdn.com/w320/jo.png" },
    { "id": "c_5", "question": "إلى أي دولة ينتمي هذا العلم؟", "correctAnswer": "اليابان", "options": ["اليابان", "الصين", "كوريا الجنوبية", "فيتنام"], "image": "https://flagcdn.com/w320/jp.png" }
  ],
  "cars": [
    { "id": "ca_1", "question": "ما هو شعار السيارة الموضح في الصورة؟", "correctAnswer": "مرسيدس", "options": ["مرسيدس", "بي إم دبليو", "أودي", "تويوتا"], "image": "https://www.carlogos.org/car-logos/mercedes-benz-logo.png" }
  ],
  "monuments": [
    { "id": "m_1", "question": "أين يقع هذا المعلم الأثري الشهير؟", "correctAnswer": "الأهرامات", "options": ["الأهرامات", "برج إيفل", "سور الصين العظيم", "تاج محل"], "image": "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=500" }
  ],
  "general": [
    { "id": "g_1", "question": "ما هو أطول نهر في العالم؟", "correctAnswer": "نهر النيل", "options": ["نهر النيل", "نهر الأمازون", "نهر الميسيسيبي", "نهر الدانوب"], "image": null },
    { "id": "g_2", "question": "ما هو الغاز الأساسي الذي يتنفسه الإنسان؟", "correctAnswer": "الأكسجين", "options": ["الأكسجين", "النيتروجين", "ثاني أكسيد الكربون", "الهيدروجين"], "image": null },
    { "id": "g_3", "question": "ما هي عاصمة جمهورية مصر العربية؟", "correctAnswer": "القاهرة", "options": ["القاهرة", "الإسكندرية", "الجيزة", "المنيا"], "image": null },
    { "id": "g_4", "question": "كم عدد قارات العالم؟", "correctAnswer": "7 قارات", "options": ["7 قارات", "6 قارات", "5 قارات", "8 قارات"], "image": null }
  ]
};

let gameState = {
    score: 0,
    correctAnswersCount: 0,
    wrongAnswersCount: 0,
    allBankQuestions: {}, 
    activeQuestions: [],   
    currentQuestionIndex: 0,
    timer: null,
    timeLeft: 15,
    isSoundEnabled: true,
    currentLevel: 1,
    highScore: 0
};

// عناصر واجهة المستخدم
const startScreen = document.getElementById('start-screen');
const triviaScreen = document.getElementById('trivia-screen');
const resultScreen = document.getElementById('result-screen');
const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');
const hudScore = document.getElementById('hud-score');
const timerText = document.getElementById('timer-text');
const progressBar = document.getElementById('progress-bar');
const qCategory = document.getElementById('question-category');
const qText = document.getElementById('question-text');
const qImageContainer = document.getElementById('question-image-container');
const qImage = document.getElementById('question-image');
const answersGrid = document.getElementById('answers-grid');
const btnGoHome = document.getElementById('go-home-btn');

const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');
const leaderboardModal = document.getElementById('leaderboard-modal');
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
const tabPlayers = document.getElementById('tab-players');
const tabCountries = document.getElementById('tab-countries');
const leaderboardList = document.getElementById('leaderboard-list');
const playerNameInput = document.getElementById('player-name-input');
const playerCountryInput = document.getElementById('player-country-input');

let currentTab = 'players';

// تشغيل اللعبة وتفعيل الأزرار فوراً
document.addEventListener("DOMContentLoaded", () => {
    loadSavedData(); 
    setupClickListeners(); 
    loadQuestionsFromLocalJSON(); 
});

async function loadQuestionsFromLocalJSON() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error("حجب الملف");
        const data = await response.json();
        gameState.allBankQuestions = data;
        console.log("تم تحميل بنك الأسئلة من الملف الخارجي ✅");
    } catch (error) {
        console.log("⚠️ تم تفعيل بنك الأسئلة المدمج كخطة بديلة آمنة.");
        gameState.allBankQuestions = localBackupQuestions;
    }
}

function setupClickListeners() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const selectedCategory = card.dataset.cat;
            startSpecificCategory(selectedCategory);
        });
    });

    btnGoHome.onclick = () => {
        playSound('victory');
        switchScreen(startScreen);
    };
    
    themeToggle.onclick = (e) => {
        e.preventDefault();
        toggleTheme();
    };

    soundToggle.onclick = (e) => {
        e.preventDefault();
        toggleSound();
    };

    viewLeaderboardBtn.onclick = (e) => {
        e.preventDefault();
        leaderboardModal.style.display = 'flex';
        renderLeaderboard();
    };

    closeLeaderboardBtn.onclick = () => {
        leaderboardModal.style.display = 'none';
    };

    tabPlayers.onclick = () => {
        currentTab = 'players';
        tabPlayers.classList.add('active');
        tabCountries.classList.remove('active');
        renderLeaderboard();
    };

    tabCountries.onclick = () => {
        currentTab = 'countries';
        tabCountries.classList.add('active');
        tabPlayers.classList.remove('active');
        renderLeaderboard();
    };
}

function loadSavedData() {
    gameState.highScore = parseInt(localStorage.getItem('quiz_high_score')) || 0;
    gameState.currentLevel = parseInt(localStorage.getItem('quiz_player_level')) || 1;
    playerNameInput.value = localStorage.getItem('saved_player_name') || '';
    playerCountryInput.value = localStorage.getItem('saved_player_country') || 'مصر';
    
    const savedTheme = localStorage.getItem('game_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.innerText = savedTheme === 'dark' ? '🌙' : '☀️';

    const savedSound = localStorage.getItem('game_sound');
    if (savedSound !== null) {
        gameState.isSoundEnabled = savedSound === 'true';
        soundToggle.innerText = gameState.isSoundEnabled ? "🔊" : "🔇";
    }

    updateMainMenuStats();
}

function updateMainMenuStats() {
    const subtitle = document.querySelector('.game-subtitle');
    if (subtitle) {
        subtitle.innerHTML = `المستوى الحالي: <span class="level-badge">${gameState.currentLevel}</span> | إجمالي النقاط أونلاين: ${gameState.highScore} نقطة`;
    }
}

function startSpecificCategory(category) {
    if (!gameState.allBankQuestions || Object.keys(gameState.allBankQuestions).length === 0) {
        gameState.allBankQuestions = localBackupQuestions;
    }

    let categoryPool = gameState.allBankQuestions[category] || [];
    if (categoryPool.length === 0 && category === "countries") categoryPool = gameState.allBankQuestions["country"] || [];
    if (categoryPool.length === 0 && category === "cars") categoryPool = gameState.allBankQuestions["car"] || [];
    if (categoryPool.length === 0 && category === "monuments") categoryPool = gameState.allBankQuestions["monument"] || [];

    if (categoryPool.length === 0) {
        alert("هذا القسم فارغ حالياً!");
        return;
    }

    let shuffled = shuffleArray([...categoryPool]);
    gameState.activeQuestions = shuffled.slice(0, 5); 
    
    gameState.score = 0;
    gameState.correctAnswersCount = 0;
    gameState.wrongAnswersCount = 0;
    gameState.currentQuestionIndex = 0;

    switchScreen(triviaScreen);
    renderQuestion();
}

function renderQuestion() {
    resetTimer();
    if (gameState.currentQuestionIndex >= gameState.activeQuestions.length) {
        endGameSession();
        return;
    }

    const currentQuestion = gameState.activeQuestions[gameState.currentQuestionIndex];
    // عرض السكور منسقاً بحيث لا تظهر أرقام سالبة مزعجة في شاشة الـ HUD للاعب
    hudScore.innerHTML = `⭐ ${Math.max(0, gameState.score)}`;
    qCategory.innerText = getCategoryArabicName(currentQuestion.category || (currentQuestion.id ? currentQuestion.id.split('_')[0] : "general"));
    qText.innerText = currentQuestion.question;

    if (currentQuestion.image) {
        qImage.src = currentQuestion.image;
        qImageContainer.classList.remove('hidden');
    } else {
        qImageContainer.classList.add('hidden');
    }

    answersGrid.innerHTML = "";
    const rawOptions = currentQuestion.options || currentQuestion.choices || [];
    
    if (!rawOptions || rawOptions.length === 0) {
        answersGrid.innerHTML = "<div style='color:#ff4d4d; text-align:center; width:100%; font-size:14px;'>🚨 لا توجد اختيارات لهذا السؤال</div>";
    } else {
        const shuffledOptions = shuffleArray([...rawOptions]);
        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = "answer-btn";
            button.innerText = option;
            
            const rightAns = currentQuestion.correctAnswer || currentQuestion.correct_answer;
            button.addEventListener('click', () => checkPlayerAnswer(button, option, rightAns));
            answersGrid.appendChild(button);
        });
    }

    const progressPercent = (gameState.currentQuestionIndex / gameState.activeQuestions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    startTimer();
}

function checkPlayerAnswer(selectedButton, selectedValue, correctAnswer) {
    clearInterval(gameState.timer);
    const allButtons = answersGrid.querySelectorAll('.answer-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (selectedValue === correctAnswer) {
        selectedButton.classList.add('correct');
        gameState.score += 10; // زيادة 10 نقاط عند الإجابة الصحيحة
        gameState.correctAnswersCount++;
        playSound('correct');
    } else {
        selectedButton.classList.add('wrong');
        gameState.wrongAnswersCount++;
        
        // تعديل: السماح بالنزول تحت الصفر داخلياً لكي يتم طرحها من إجمالي الفايربيز
        gameState.score -= 10; 
        
        playSound('wrong');
        allButtons.forEach(btn => {
            if (btn.innerText === correctAnswer) btn.classList.add('correct');
        });
    }

    // تحديث السكور في الواجهة مباشرة (مع منع ظهور قيمة سالبة شكلياً)
    hudScore.innerHTML = `⭐ ${Math.max(0, gameState.score)}`;

    setTimeout(() => {
        gameState.currentQuestionIndex++;
        renderQuestion();
    }, 1500);
}

function startTimer() {
    gameState.timeLeft = 15;
    timerText.innerText = gameState.timeLeft;
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        timerText.innerText = gameState.timeLeft;
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            handleTimeOut();
        }
    }, 1000);
}

function handleTimeOut() {
    gameState.wrongAnswersCount++;
    playSound('wrong');
    
    // عقوبة: خصم 10 نقاط داخلياً عند انتهاء الوقت
    gameState.score -= 10;
    hudScore.innerHTML = `⭐ ${Math.max(0, gameState.score)}`;

    const currentQuestion = gameState.activeQuestions[gameState.currentQuestionIndex];
    const correctAnswer = currentQuestion.correctAnswer || currentQuestion.correct_answer;
    const allButtons = answersGrid.querySelectorAll('.answer-btn');
    allButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.innerText === correctAnswer) btn.classList.add('correct');
    });
    setTimeout(() => {
        gameState.currentQuestionIndex++;
        renderQuestion();
    }, 1500);
}

function resetTimer() { clearInterval(gameState.timer); }

function endGameSession() {
    switchScreen(resultScreen);
    playSound('victory');
    
    // ⬇️ هنا بنحط رقم الوحدة الإعلانية البينية الخاصة بعبتك ⬇️
    try {
        (window.adsbygoogle = window.adsbygoogle || []).push({
            enable_page_level_ads: true,
            interstitial: { 
                ad_unit_id: "ca-app-pub-8549800035229580/6412792261" 
            }
        });
    } catch (adError) {
        console.log("انتظار تحميل الإعلان...");
    }

    const pName = playerNameInput.value.trim() || 'لاعب مجهول';
    const pCountry = playerCountryInput.value;
    // باقي الكود بتاعك...
}
    // عرض صافي نقاط الجولة في شاشة التهنئة (منع ظهور السوالب في الشاشة)
    document.getElementById('res-score').innerText = Math.max(0, gameState.score);
    document.getElementById('res-correct').innerText = gameState.correctAnswersCount;
    document.getElementById('res-wrong').innerText = gameState.wrongAnswersCount;

    // إرسال نقاط الجولة الحالية (سواء موجبة أو سالبة) ليتم دمجها تراكمياً في السيرفر
    if (db) {
        saveScoreToOnlineDatabase(pName, pCountry, gameState.score);
    } else {
        // حماية أوفلاين كخطة بديلة
        let fallbackScore = Math.max(0, gameState.score);
        if (fallbackScore > gameState.highScore) {
            gameState.highScore = fallbackScore;
            localStorage.setItem('quiz_high_score', fallbackScore);
            updateMainMenuStats();
        }
    }


function saveScoreToOnlineDatabase(name, country, currentRoundScore) {
    if (!db) return;
    
    const playerRef = ref(db, 'leaderboard/' + name);
    
    // 1. جلب السكور التراكمي القديم المخزن على السيرفر أولاً
    get(playerRef).then((snapshot) => {
        const data = snapshot.val();
        
        let oldScore = data ? data.score : 0;
        
        // 2. دمج السكور الجديد (إذا كان سالباً سيقوم بالطرح التلقائي من السيرفر)
        let totalScore = oldScore + currentRoundScore;
        
        // حماية: إجمالي نقاط اللاعب أونلاين لا يمكن أن تنزل تحت الصفر مطلقاً
        if (totalScore < 0) totalScore = 0;

        // 3. رفع وحفظ النتيجة التراكمية الجديدة بالكامل
        set(playerRef, {
            name: name,
            country: country,
            score: totalScore,
            timestamp: Date.now()
        }).then(() => {
            console.log(`تم تحديث السكور التراكمي أونلاين: ${totalScore}`);
            
            // تحديث السكور الأعلى محلياً في جهاز العميل بناءً على السيرفر
            gameState.highScore = totalScore;
            localStorage.setItem('quiz_high_score', totalScore);
            updateMainMenuStats();
        });
    }).catch((err) => {
        console.error("خطأ في الاتصال أثناء التحديث التراكمي:", err);
    });
}

function renderLeaderboard() {
    leaderboardList.innerHTML = '<div style="text-align:center; padding:10px; font-size:12px;">جاري تحميل الترتيب...⏳</div>';
    if (!db) {
        leaderboardList.innerHTML = '<div class="leaderboard-item" style="justify-content:center;">لوحة الصدارة بحاجة لربط الفايربيز 🌍</div>';
        return;
    }
    
    const leaderboardQuery = query(ref(db, 'leaderboard'), orderByChild('score'), limitToLast(10));
    get(leaderboardQuery).then((snapshot) => {
        let players = [];
        snapshot.forEach((childSnapshot) => { players.push(childSnapshot.val()); });
        players.reverse();

        if (currentTab === 'players') {
            leaderboardList.innerHTML = '';
            if(players.length === 0) {
                leaderboardList.innerHTML = '<div class="leaderboard-item" style="justify-content:center;">لا توجد نتائج بعد!</div>';
                return;
            }
            players.forEach((p, idx) => {
                let medal = idx === 0 ? "🥇 " : idx === 1 ? "🥈 " : idx === 2 ? "🥉 " : `${idx + 1}. `;
                let countryFlags = { "مصر": "🇪🇬", "السعودية": "🇸🇦", "الإمارات": "🇦🇪", "الأردن": "🇯🇴" };
                let flag = countryFlags[p.country] || "🌍";
                
                leaderboardList.innerHTML += `<div class="leaderboard-item"><span>${medal} ${p.name} ${flag}</span><span>⭐ ${p.score}</span></div>`;
            });
        } else {
            let countryScores = {};
            players.forEach(p => { countryScores[p.country] = (countryScores[p.country] || 0) + p.score; });
            
            let sortedCountries = Object.keys(countryScores).map(key => {
                return { country: key, score: countryScores[key] };
            }).sort((a,b) => b.score - a.score);

            leaderboardList.innerHTML = '';
            let countryFlags = { "مصر": "🇪🇬", "السعودية": "🇸🇦", "الإمارات": "🇦🇪", "الأردن": "🇯🇴" };
            sortedCountries.forEach((c, idx) => {
                let flag = countryFlags[c.country] || "🌍";
                leaderboardList.innerHTML += `<div class="leaderboard-item"><span>${idx + 1}. ${c.country} ${flag}</span><span>⭐ ${c.score}</span></div>`;
            });
        }
    }).catch(err => {
        leaderboardList.innerHTML = '<div class="leaderboard-item">خطأ في جلب البيانات.</div>';
    });
}

function switchScreen(targetScreen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getCategoryArabicName(cat) {
    const names = { countries: "🌍 أعلام الدول", country: "🌍 أعلام الدول", cars: "🚗 شعارات السيارات", car: "🚗 شعارات السيارات", monuments: "🏛️ معالم أثرية", general: "💡 معلومات عامة" };
    return names[cat] || "عام";
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.innerText = newTheme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('game_theme', newTheme);
}

function toggleSound() {
    gameState.isSoundEnabled = !gameState.isSoundEnabled;
    soundToggle.innerText = gameState.isSoundEnabled ? "🔊" : "🔇";
    localStorage.setItem('game_sound', gameState.isSoundEnabled);
}

function playSound(type) {
    if (!gameState.isSoundEnabled) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        if (type === 'correct') {
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start(); osc.stop(ctx.currentTime + 0.2);
        } else if (type === 'wrong') {
            osc.frequency.setValueAtTime(196, ctx.currentTime);
            osc.frequency.setValueAtTime(146, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            osc.start(); osc.stop(ctx.currentTime + 0.25);
        } else if (type === 'victory') {
            osc.frequency.setValueAtTime(523, ctx.currentTime);
            osc.frequency.setValueAtTime(784, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start(); osc.stop(ctx.currentTime + 0.3);
        }
    } catch (e) { console.log("Audio API Blocked"); }
}
