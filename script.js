// デバイス検出とレスポンシブ対応
let isMobile = false;
let isTablet = false;

// デバイス検出関数
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;
    
    // モバイルデバイスの検出
    isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || screenWidth <= 768;
    
    // タブレットの検出
    isTablet = screenWidth > 768 && screenWidth <= 1024;
    
    // デバイスに応じたクラスをbodyに追加
    document.body.classList.remove('mobile-device', 'tablet-device', 'desktop-device');
    if (isMobile) {
        document.body.classList.add('mobile-device');
    } else if (isTablet) {
        document.body.classList.add('tablet-device');
    } else {
        document.body.classList.add('desktop-device');
    }
    
    // デバッグ用（開発時のみ）
    console.log(`デバイス検出: ${isMobile ? 'モバイル' : isTablet ? 'タブレット' : 'デスクトップ'} (${screenWidth}px)`);
}

// スマホ専用のナビゲーション最適化
function optimizeMobileNavigation() {
    if (!isMobile) return;
    
    const nav = document.querySelector('.sticky-nav');
    const navLinks = nav.querySelectorAll('.nav-link');
    
    // ナビゲーションリンクを小さくする
    navLinks.forEach(link => {
        link.classList.add('text-sm', 'px-2', 'py-1');
    });
    
    // ナビゲーションタイトルを短縮
    const navTitle = nav.querySelector('.text-xl');
    if (navTitle) {
        navTitle.textContent = '適職診断';
        navTitle.classList.remove('text-xl');
        navTitle.classList.add('text-lg');
    }
}


// スマホ専用のチャート最適化
function optimizeMobileCharts() {
    if (!isMobile) return;
    
    // チャートコンテナのサイズを調整
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.style.height = '250px';
        container.style.maxWidth = '100%';
    });
}

// スマホ専用のフォーム最適化
function optimizeMobileForm() {
    if (!isMobile) return;
    
    // 質問グループのパディングを調整
    const questionGroups = document.querySelectorAll('.question-group');
    questionGroups.forEach(group => {
        group.classList.add('p-3');
        group.classList.remove('p-4');
    });
    
    // 質問アイテムのマージンを調整
    const questionItems = document.querySelectorAll('.question-item');
    questionItems.forEach(item => {
        item.classList.add('mb-2');
        item.classList.remove('mb-3');
    });
}

// スマホ専用のボタン最適化
function optimizeMobileButtons() {
    if (!isMobile) return;
    
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.classList.add('text-sm', 'py-2', 'px-4');
        button.classList.remove('py-3', 'px-6');
    });
}

// レスポンシブ対応の初期化
function initializeResponsive() {
    detectDevice();
    optimizeMobileNavigation();
    optimizeMobileCharts();
    optimizeMobileForm();
    optimizeMobileButtons();
}

// ウィンドウリサイズ時の対応
let resizeTimeout;
function handleResize() {
    // リサイズの連続呼び出しを防ぐため、デバウンス処理
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const previousMobile = isMobile;
        const previousTablet = isTablet;
        
        detectDevice();
        
        // デバイスタイプが変わった場合のみ再最適化
        if (previousMobile !== isMobile || previousTablet !== isTablet) {
            // リロードの代わりに、必要な最適化のみ再実行
            initializeResponsive();
            // チャートが存在する場合は再描画
            if (userProfileChartInstance) {
                const currentScores = userProfileChartInstance.data.datasets[0].data;
                displayUserProfileChart(currentScores);
            }
        } else {
            // デバイスタイプが同じ場合は、チャートのサイズのみ調整
            optimizeMobileCharts();
        }
    }, 150);
}

// チャート関連のユーティリティ関数
function wrapLabels(labels, maxLength = 16) {
    // スマホの場合は短めに設定
    const maxLen = isMobile ? 12 : maxLength;
    
    return labels.map(label => {
        if (typeof label === 'string' && label.length > maxLen) {
            // 日本語対応: 文字数ベースで改行
            let lines = [];
            let currentLine = '';
            
            // スペースまたは区切り文字で分割を試みる
            const segments = label.split(/([\s・\(\)])/).filter(s => s.length > 0);
            
            segments.forEach(segment => {
                // 現在の行に追加した場合の長さを計算
                const testLine = currentLine + segment;
                
                // セグメント自体が長い場合は強制的に分割
                if (segment.length > maxLen) {
                    // 長いセグメントをさらに分割
                    for (let i = 0; i < segment.length; i += maxLen) {
                        const chunk = segment.substring(i, i + maxLen);
                        if (currentLine.length > 0) {
                            lines.push(currentLine);
                            currentLine = chunk;
                        } else {
                            currentLine = chunk;
                        }
                    }
                } else if (testLine.length > maxLen && currentLine.length > 0) {
                    // 現在の行が長くなりすぎる場合は改行
                    lines.push(currentLine);
                    currentLine = segment;
                } else {
                    // 追加しても問題ない
                    currentLine = testLine;
                }
            });
            
            // 残りの行を追加
            if (currentLine.trim().length > 0) {
                lines.push(currentLine.trim());
            }
            
            return lines.length > 0 ? lines : [label];
        }
        return label;
    });
}

// 共通チャートオプション（スマホ対応）
const commonChartOptions = (titleText = '') => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: { 
                    size: isMobile ? 10 : 12, 
                    family: "'Noto Sans JP', sans-serif" 
                },
                color: '#262626'
            }
        },
        title: {
            display: !!titleText,
            text: titleText,
            font: { 
                size: isMobile ? 14 : 16, 
                family: "'Noto Sans JP', sans-serif", 
                weight: 'bold' 
            },
            color: '#1d4ed8'
        },
        tooltip: {
            callbacks: {
                title: function(tooltipItems) {
                    const item = tooltipItems[0];
                    let label = item.chart.data.labels[item.dataIndex];
                    if (Array.isArray(label)) {
                      return label.join(' ');
                    }
                    return label;
                }
            },
            bodyFont: { 
                size: isMobile ? 10 : 12,
                family: "'Noto Sans JP', sans-serif" 
            },
            titleFont: { 
                size: isMobile ? 10 : 12,
                family: "'Noto Sans JP', sans-serif" 
            }
        }
    }
});


// 診断フォーム関連
const diagnosisForm = document.getElementById('diagnosisForm');
const diagnoseButton = document.getElementById('diagnoseButton');
const resetButton = document.getElementById('resetButton');
const diagnosisResultDiv = document.getElementById('diagnosisResult');
const userScoresList = document.getElementById('userScoresList');
const recommendedJobSpan = document.getElementById('recommendedJob');
const jobDescriptionDiv = document.getElementById('jobDescription');
const jobIllustrationDiv = document.getElementById('jobIllustration');
const shareToTwitterButton = document.getElementById('shareToTwitterButton');
const copyResultButton = document.getElementById('copyResultButton');
const shareTextPreview = document.getElementById('shareTextPreview');
const errorMessageDiv = document.getElementById('errorMessage');
const errorMessageText = document.getElementById('errorMessageText');
let userProfileChartInstance;

// 診断質問のレンダリング
function renderDiagnosisQuestions() {
    diagnosisForm.innerHTML = '';
    Object.keys(diagnosisQuestions).forEach(categoryKey => {
        const category = diagnosisQuestions[categoryKey];
        const groupDiv = document.createElement('div');
        groupDiv.className = 'question-group';
        groupDiv.setAttribute('role', 'group');
        groupDiv.setAttribute('aria-labelledby', `category-${categoryKey}`);
        const categoryTitle = document.createElement('h4');
        categoryTitle.id = `category-${categoryKey}`;
        categoryTitle.className = 'text-lg font-semibold whitespace-nowrap';
        categoryTitle.textContent = category.label;
        groupDiv.appendChild(categoryTitle);

        category.questions.forEach((questionObj, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            const questionId = `${categoryKey}-${index}`;

            // 質問がオブジェクトの場合はtextプロパティを取得、文字列の場合はそのまま使用
            let questionText, questionFootnotes = [];
            if (typeof questionObj === 'object' && questionObj.text) {
                questionText = questionObj.text;
                questionFootnotes = questionObj.footnotes || [];
            } else {
                questionText = questionObj;
            }

            const questionP = document.createElement('p');
            questionP.className = 'mb-2 text-neutral-800';
            questionP.id = `question-${questionId}`;
            
            // 質問文に脚注番号を追加
            let displayText = `${index + 1}. ${questionText}`;
            if (questionFootnotes.length > 0) {
                // 脚注番号を質問文内の特定語句の後に挿入
                questionFootnotes.forEach((footnoteNum) => {
                    // 脚注番号1の場合は「競プロ」の後に挿入
                    if (footnoteNum === 1) {
                        displayText = displayText.replace('競プロ', `競プロ<sup class="text-xs align-super">※${footnoteNum}</sup>`);
                    } else {
                        // 他の脚注番号の場合は最後に追加
                        displayText += ` <sup class="text-xs align-super">※${footnoteNum}</sup>`;
                    }
                });
                // HTMLタグを含む場合はinnerHTMLを使用（ただし、data.jsの静的なデータのみ）
                questionP.innerHTML = displayText;
            } else {
                // HTMLタグがない場合はtextContentを使用
                questionP.textContent = displayText;
            }
            questionDiv.appendChild(questionP);

            // この質問に脚注がある場合、質問文の下に脚注説明を追加
            if (questionFootnotes.length > 0 && category.footnotes) {
                const footnotesDiv = document.createElement('div');
                footnotesDiv.className = 'text-xs text-neutral-600 mb-2 mt-1';
                questionFootnotes.forEach((footnoteNum) => {
                    if (category.footnotes[footnoteNum]) {
                        const footnoteP = document.createElement('p');
                        footnoteP.className = 'mb-1';
                        // data.jsの静的なデータなので、textContentで十分
                        footnoteP.textContent = `※${footnoteNum} ${category.footnotes[footnoteNum]}`;
                        footnotesDiv.appendChild(footnoteP);
                    }
                });
                questionDiv.appendChild(footnotesDiv);
            }

            const fieldset = document.createElement('fieldset');
            fieldset.className = 'mb-2';
            const legend = document.createElement('legend');
            legend.className = 'sr-only';
            // legendには脚注番号を含まない元の質問文を使用
            legend.textContent = `${index + 1}. ${questionText}`;
            fieldset.appendChild(legend);

            const yesInput = document.createElement('input');
            yesInput.type = 'radio';
            yesInput.id = `yes-${questionId}`;
            yesInput.name = `q-${questionId}`;
            yesInput.value = 'yes';
            yesInput.className = 'radio-input text-blue-500 focus:ring-blue-500';
            yesInput.setAttribute('aria-labelledby', `question-${questionId} yes-label-${questionId}`);
            fieldset.appendChild(yesInput);
            const yesLabel = document.createElement('label');
            yesLabel.id = `yes-label-${questionId}`;
            yesLabel.htmlFor = `yes-${questionId}`;
            yesLabel.className = 'radio-label text-neutral-700 mr-4';
            yesLabel.textContent = 'はい';
            fieldset.appendChild(yesLabel);

            const noInput = document.createElement('input');
            noInput.type = 'radio';
            noInput.id = `no-${questionId}`;
            noInput.name = `q-${questionId}`;
            noInput.value = 'no';
            noInput.className = 'radio-input text-neutral-500 focus:ring-neutral-500';
            noInput.setAttribute('aria-labelledby', `question-${questionId} no-label-${questionId}`);
            fieldset.appendChild(noInput);
            const noLabel = document.createElement('label');
            noLabel.id = `no-label-${questionId}`;
            noLabel.htmlFor = `no-${questionId}`;
            noLabel.className = 'radio-label text-neutral-700';
            noLabel.textContent = 'いいえ';
            fieldset.appendChild(noLabel);

            questionDiv.appendChild(fieldset);
            groupDiv.appendChild(questionDiv);
        });
        diagnosisForm.appendChild(groupDiv);
    });
}

// 診断計算
function calculateDiagnosis() {
    const userScores = { A1: 0, A2: 0, B: 0, C: 0, D: 0, E: 0 };
    let allAnswered = true;

    // カテゴリの順序を定義（categoryLabelsの順序に合わせる）
    const categoryOrder = ['A1', 'A2', 'B', 'C', 'D', 'E'];

    Object.keys(diagnosisQuestions).forEach(categoryKey => {
        diagnosisQuestions[categoryKey].questions.forEach((_, index) => {
            const questionName = `q-${categoryKey}-${index}`;
            const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`);
            if (!selectedOption) {
                allAnswered = false;
            } else if (selectedOption.value === 'yes') {
                userScores[categoryKey]++;
            }
        });
    });

    if (!allAnswered) {
        showErrorMessage('全ての質問に回答してください。');
        return;
    }
    
    // エラーメッセージを非表示にする
    hideErrorMessage();

    displayUserScores(userScores, categoryOrder);
    const scoresArray = categoryOrder.map(key => userScores[key]);
    const recommendedJob = findBestMatchJob(scoresArray);
    recommendedJobSpan.textContent = recommendedJob;
    displayJobDescription(recommendedJob);
    displayJobIllustration(recommendedJob);
    displayUserProfileChart(scoresArray);
    updateShareTextPreview(recommendedJob);
    diagnosisResultDiv.classList.remove('hidden');
    diagnosisResultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 職種説明の表示
function displayJobDescription(jobName) {
    if (jobDescriptionDiv) {
        if (jobDescriptions && jobDescriptions[jobName]) {
            jobDescriptionDiv.textContent = jobDescriptions[jobName];
            jobDescriptionDiv.classList.remove('hidden');
        } else {
            jobDescriptionDiv.classList.add('hidden');
        }
    }
}

// 職種イラストの表示（診断結果用：*_add.png を優先、なければ SVG）
function displayJobIllustration(jobName) {
    if (jobIllustrationDiv) {
        // 既存の内容をクリア
        jobIllustrationDiv.innerHTML = '';
        
        const imagePath = (jobResultImages && jobResultImages[jobName]) ? jobResultImages[jobName] : '';
        
        if (imagePath !== '') {
            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = `${jobName}のイラスト`;
            img.className = 'w-full h-full object-contain';
            jobIllustrationDiv.appendChild(img);
            jobIllustrationDiv.classList.remove('border-2', 'border-neutral-400', 'bg-neutral-100');
        } else {
            // イラストが設定されていない場合、プレースホルダーを表示
            const placeholder = document.createElement('span');
            placeholder.className = 'text-neutral-500 text-sm';
            placeholder.textContent = 'イラスト（準備中）';
            jobIllustrationDiv.appendChild(placeholder);
            jobIllustrationDiv.classList.add('border-2', 'border-neutral-400', 'bg-neutral-100');
        }
    }
}

// ユーザースコアの表示
function displayUserScores(scores, categoryOrder) {
    userScoresList.innerHTML = '';
    categoryOrder.forEach((key, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${categoryLabels[index]}: ${scores[key]}点`;
        userScoresList.appendChild(listItem);
    });
}

// 最適な職種の検索
function findBestMatchJob(userScoresArray) {
    let minDifference = Infinity;
    let bestMatchJob = 'N/A';

    for (const jobName in jobData) {
        const jobProfile = jobData[jobName];
        let currentDifference = 0;
        for (let i = 0; i < userScoresArray.length; i++) {
            currentDifference += Math.abs(userScoresArray[i] - jobProfile[i]);
        }
        if (currentDifference < minDifference) {
            minDifference = currentDifference;
            bestMatchJob = jobName;
        }
    }
    return bestMatchJob;
}

// ユーザープロファイルチャートの表示
function displayUserProfileChart(scores) {
    const userProfileCtx = document.getElementById('userProfileChart').getContext('2d');
    if (userProfileChartInstance) {
        userProfileChartInstance.destroy();
    }
    userProfileChartInstance = new Chart(userProfileCtx, {
        type: 'radar',
        data: {
            labels: wrapLabels(categoryLabels, 20),
            datasets: [{
                label: 'あなたのスキルプロファイル',
                data: scores,
                fill: true,
                backgroundColor: 'rgba(2, 132, 199, 0.2)',
                borderColor: 'rgb(2, 132, 199)',
                pointBackgroundColor: 'rgb(2, 132, 199)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(2, 132, 199)'
            }]
        },
        options: {
            ...commonChartOptions(),
            scales: {
                r: {
                    angleLines: { display: true, color: '#d4d4d4' },
                    suggestedMin: 0,
                    suggestedMax: 5,
                    pointLabels: {
                        font: { 
                            size: isMobile ? 8 : 10, 
                            family: "'Noto Sans JP', sans-serif" 
                        },
                        color: '#262626'
                    },
                    ticks: {
                        stepSize: 1,
                        backdropColor: 'rgba(255,250,240,0.5)',
                        color: '#737373',
                        font: {
                            size: isMobile ? 8 : 10
                        }
                    },
                    grid: { color: '#e5e5e5' }
                }
            },
            elements: {
                line: { borderWidth: 2 }
            }
        }
    });
}

// エラーメッセージの表示
function showErrorMessage(message) {
    if (errorMessageText) {
        errorMessageText.textContent = message;
    }
    if (errorMessageDiv) {
        errorMessageDiv.classList.remove('hidden');
        errorMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// エラーメッセージの非表示
function hideErrorMessage() {
    if (errorMessageDiv) {
        errorMessageDiv.classList.add('hidden');
    }
}

// 診断のリセット
function resetDiagnosis() {
    diagnosisForm.reset();
    diagnosisResultDiv.classList.add('hidden');
    hideErrorMessage();
    if (jobDescriptionDiv) {
        jobDescriptionDiv.classList.add('hidden');
    }
    if (jobIllustrationDiv) {
        jobIllustrationDiv.innerHTML = '<span class="text-neutral-500 text-sm">イラスト（仮置き）</span>';
        jobIllustrationDiv.classList.add('border-2', 'border-neutral-400', 'bg-neutral-100');
    }
    if (userProfileChartInstance) {
        userProfileChartInstance.destroy();
        userProfileChartInstance = null;
    }
}

// 職種名からHTMLページのパスを取得
function getJobPagePath(jobName) {
    const jobPageMap = {
        "CEO": "ceo.html",
        "CISO": "ciso.html",
        "脆弱性診断士・ペネトレーションテスト": "penetration-test.html",
        "SOC/CSIRT": "soc-csirt.html",
        "Security Analysts": "security-analysts.html",
        "フォレンジクス": "forensics.html",
        "セキュリティーソリューション開発エンジニア": "security-engineer.html",
        "技術営業": "technical-sales.html",
        "セキュリティコンサルタント": "security-consultant.html"
    };
    return jobPageMap[jobName] || null;
}

// 共有用URLのみ取得
function getShareUrl(jobName) {
    if (!jobName) return '';
    const jobPagePath = getJobPagePath(jobName);
    return jobPagePath
        ? `https://nanami-takemoto.github.io/security-aptitude-test/share/${jobPagePath}`
        : '';
}

// 共有用テキストを取得（表示・コピー両方で使用）
function getShareText(jobName) {
    if (!jobName) return '';
    const text = `私におすすめの職種は${jobName}でした #セキュリティ適職診断`;
    const url = getShareUrl(jobName);
    return url ? `${text}\n\n${url}` : text;
}

// 共有用テキストのプレビューを更新
function updateShareTextPreview(jobName) {
    var name = jobName || (recommendedJobSpan && recommendedJobSpan.textContent);
    if (shareTextPreview) {
        shareTextPreview.value = getShareText(name);
    }
}

// 汎用: テキストをコピーしてボタンにフィードバック
function copyToClipboardWithFeedback(text, buttonEl) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            showCopyFeedback(buttonEl);
        }).catch(function() {
            fallbackCopyToClipboard(text, buttonEl);
        });
    } else {
        fallbackCopyToClipboard(text, buttonEl);
    }
}
function showCopyFeedback(buttonEl) {
    if (buttonEl) {
        var orig = buttonEl.textContent;
        buttonEl.textContent = 'コピーしました！';
        buttonEl.disabled = true;
        setTimeout(function() {
            buttonEl.textContent = orig;
            buttonEl.disabled = false;
        }, 2000);
    } else {
        alert('コピーしました。');
    }
}

// 診断結果テキストをクリップボードにコピー
function copyResultToClipboard() {
    if (!recommendedJobSpan || !recommendedJobSpan.textContent) {
        alert('診断結果が表示されていません。');
        return;
    }
    const copyText = getShareText(recommendedJobSpan.textContent);
    if (!copyText) {
        alert('共有用テキストを取得できませんでした。');
        return;
    }
    copyToClipboardWithFeedback(copyText, copyResultButton);
}
function fallbackCopyToClipboard(text, buttonEl) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showCopyFeedback(buttonEl || copyResultButton);
    } catch (e) {
        alert('コピーに失敗しました。');
    }
    document.body.removeChild(ta);
}

// 診断結果をXに投稿
function shareToTwitter(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!recommendedJobSpan || !recommendedJobSpan.textContent) {
        alert('診断結果が表示されていません。');
        return;
    }
    var jobName = recommendedJobSpan.textContent;
    var jobPagePath = getJobPagePath(jobName);
    if (!jobPagePath) {
        alert('職種ページが見つかりません。');
        return;
    }
    var text = '私におすすめの職種は' + jobName + 'でした #セキュリティ適職診断';
    var jobPageUrl = 'https://nanami-takemoto.github.io/security-aptitude-test/share/' + jobPagePath;
    var tweetText = encodeURIComponent(text + '\n\n' + jobPageUrl);
    window.open('https://x.com/intent/tweet?text=' + tweetText, '_blank');
}

// イベントリスナーの設定
function setupEventListeners() {
    diagnoseButton.addEventListener('click', calculateDiagnosis);
    resetButton.addEventListener('click', resetDiagnosis);
    if (shareToTwitterButton) {
        shareToTwitterButton.addEventListener('click', shareToTwitter);
    }
    if (copyResultButton) {
        copyResultButton.addEventListener('click', copyResultToClipboard);
    }
    
    // リサイズイベントリスナー
    window.addEventListener('resize', handleResize);
}

// 初期化関数
function initialize() {
    initializeResponsive();
    setupEventListeners();
    renderDiagnosisQuestions();
    // テスト用：診断結果を常に表示
    displayTestResult();
}

// テスト用：診断結果を表示
function displayTestResult() {
    const testScores = { A1: 2, A2: 0, B: 1, C: 1, D: 4, E: 5 };
    const categoryOrder = ['A1', 'A2', 'B', 'C', 'D', 'E'];
    const scoresArray = categoryOrder.map(key => testScores[key]);
    const recommendedJob = 'CEO';
    
    displayUserScores(testScores, categoryOrder);
    recommendedJobSpan.textContent = recommendedJob;
    displayJobDescription(recommendedJob);
    displayJobIllustration(recommendedJob);
    displayUserProfileChart(scoresArray);
    updateShareTextPreview(recommendedJob);
    diagnosisResultDiv.classList.remove('hidden');
}

// DOMContentLoadedイベントで初期化
document.addEventListener('DOMContentLoaded', initialize); 