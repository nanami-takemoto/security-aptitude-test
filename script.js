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

// スマホ専用のテーブル最適化
function optimizeMobileTable() {
    if (!isMobile) return;
    
    const table = document.getElementById('jobProfilesTable');
    if (!table) return;
    
    // テーブルを横スクロール可能にする
    table.classList.add('text-xs');
    
    // ヘッダーセルを小さくする
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
        header.classList.add('text-xs', 'px-1', 'py-1');
    });
    
    // データセルを小さくする
    const cells = table.querySelectorAll('td');
    cells.forEach(cell => {
        cell.classList.add('text-xs', 'px-1', 'py-1');
    });
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
    optimizeMobileTable();
    optimizeMobileCharts();
    optimizeMobileForm();
    optimizeMobileButtons();
}

// ウィンドウリサイズ時の対応
function handleResize() {
    const previousMobile = isMobile;
    const previousTablet = isTablet;
    
    detectDevice();
    
    // デバイスタイプが変わった場合のみ再最適化
    if (previousMobile !== isMobile || previousTablet !== isTablet) {
        location.reload(); // 簡単な実装のため、リロードで対応
    }
}

// チャート関連のユーティリティ関数
function wrapLabels(labels, maxLength = 16) {
    // スマホの場合は短めに設定
    const maxLen = isMobile ? 12 : maxLength;
    
    return labels.map(label => {
        if (typeof label === 'string' && label.length > maxLen) {
            const words = label.split(' ');
            let lines = [];
            let currentLine = '';
            words.forEach(word => {
                if ((currentLine + word).length > maxLen && currentLine.length > 0) {
                    lines.push(currentLine.trim());
                    currentLine = word + ' ';
                } else {
                    currentLine += word + ' ';
                }
            });
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
            color: '#b45309'
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

// 職種プロファイルチャート関連
let jobProfileChartInstance;
const jobProfileCtx = document.getElementById('jobProfileChart');
const jobProfileChartDesc = document.getElementById('jobProfileChartDesc');
const jobSelector = document.getElementById('jobSelector');

// 職種セレクターの初期化
function initializeJobSelector() {
    if (jobSelector) {
        Object.keys(jobData).forEach(jobName => {
            const option = document.createElement('option');
            option.value = jobName;
            option.textContent = jobName;
            jobSelector.appendChild(option);
        });
    }
}

// 職種プロファイルチャートのイベントリスナー
function setupJobProfileChart() {
    if (jobSelector && jobProfileCtx) {
        jobSelector.addEventListener('change', function() {
            const selectedJob = this.value;
            if (selectedJob && jobData[selectedJob]) {
                const scores = jobData[selectedJob];
                if (jobProfileChartInstance) {
                    jobProfileChartInstance.destroy();
                }
                jobProfileChartInstance = new Chart(jobProfileCtx.getContext('2d'), {
                    type: 'radar',
                    data: {
                        labels: wrapLabels(categoryLabels, 20),
                        datasets: [{
                            label: selectedJob + ' スキルプロファイル',
                            data: scores,
                            fill: true,
                            backgroundColor: 'rgba(217, 119, 6, 0.2)',
                            borderColor: 'rgb(217, 119, 6)',
                            pointBackgroundColor: 'rgb(217, 119, 6)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgb(217, 119, 6)'
                        }]
                    },
                    options: {
                        ...commonChartOptions(),
                        scales: {
                            r: {
                                angleLines: { display: true, color: '#d4d4d4' },
                                suggestedMin: 0,
                                suggestedMax: 4,
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
                jobProfileChartDesc.textContent = `${selectedJob}の理想的なスキルプロファイル。各カテゴリのスコアは0～4点で評価されます。`;
            } else {
                 if (jobProfileChartInstance) {
                    jobProfileChartInstance.destroy();
                    jobProfileChartInstance = null;
                }
                jobProfileChartDesc.textContent = '職種を選択すると、ここにスキルプロファイルが表示されます。';
            }
        });
    }
}

// 診断フォーム関連
const diagnosisForm = document.getElementById('diagnosisForm');
const diagnoseButton = document.getElementById('diagnoseButton');
const resetButton = document.getElementById('resetButton');
const diagnosisResultDiv = document.getElementById('diagnosisResult');
const userScoresList = document.getElementById('userScoresList');
const recommendedJobSpan = document.getElementById('recommendedJob');
let userProfileChartInstance;

// 診断質問のレンダリング
function renderDiagnosisQuestions() {
    diagnosisForm.innerHTML = '';
    Object.keys(diagnosisQuestions).forEach(categoryKey => {
        const category = diagnosisQuestions[categoryKey];
        const groupDiv = document.createElement('div');
        groupDiv.className = 'question-group';
        const categoryTitle = document.createElement('h4');
        categoryTitle.className = 'text-lg font-semibold';
        categoryTitle.textContent = category.label;
        groupDiv.appendChild(categoryTitle);

        category.questions.forEach((questionText, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            const questionId = `${categoryKey}-${index}`;

            const questionP = document.createElement('p');
            questionP.className = 'mb-2 text-neutral-800';
            questionP.textContent = `${index + 1}. ${questionText}`;
            questionDiv.appendChild(questionP);

            const yesInput = document.createElement('input');
            yesInput.type = 'radio';
            yesInput.id = `yes-${questionId}`;
            yesInput.name = `q-${questionId}`;
            yesInput.value = 'yes';
            yesInput.className = 'radio-input text-amber-500 focus:ring-amber-500';
            questionDiv.appendChild(yesInput);
            const yesLabel = document.createElement('label');
            yesLabel.htmlFor = `yes-${questionId}`;
            yesLabel.className = 'radio-label text-neutral-700 mr-4';
            yesLabel.textContent = 'はい';
            questionDiv.appendChild(yesLabel);

            const noInput = document.createElement('input');
            noInput.type = 'radio';
            noInput.id = `no-${questionId}`;
            noInput.name = `q-${questionId}`;
            noInput.value = 'no';
            noInput.className = 'radio-input text-neutral-500 focus:ring-neutral-500';
            questionDiv.appendChild(noInput);
            const noLabel = document.createElement('label');
            noLabel.htmlFor = `no-${questionId}`;
            noLabel.className = 'radio-label text-neutral-700';
            noLabel.textContent = 'いいえ';
            questionDiv.appendChild(noLabel);

            groupDiv.appendChild(questionDiv);
        });
        diagnosisForm.appendChild(groupDiv);
    });
}

// 診断計算
function calculateDiagnosis() {
    const userScores = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    let allAnswered = true;

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
        alert('全ての質問に回答してください。');
        return;
    }

    displayUserScores(userScores);
    const recommendedJob = findBestMatchJob(Object.values(userScores));
    recommendedJobSpan.textContent = recommendedJob;
    displayUserProfileChart(Object.values(userScores));
    diagnosisResultDiv.classList.remove('hidden');
    diagnosisResultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ユーザースコアの表示
function displayUserScores(scores) {
    userScoresList.innerHTML = '';
    Object.keys(scores).forEach((key, index) => {
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
                    suggestedMax: 4,
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

// 診断のリセット
function resetDiagnosis() {
    diagnosisForm.reset();
    diagnosisResultDiv.classList.add('hidden');
    if (userProfileChartInstance) {
        userProfileChartInstance.destroy();
        userProfileChartInstance = null;
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    diagnoseButton.addEventListener('click', calculateDiagnosis);
    resetButton.addEventListener('click', resetDiagnosis);
    
    // リサイズイベントリスナー
    window.addEventListener('resize', handleResize);
}

// 初期化関数
function initialize() {
    initializeResponsive();
    initializeJobSelector();
    setupJobProfileChart();
    setupEventListeners();
    renderDiagnosisQuestions();
}

// DOMContentLoadedイベントで初期化
document.addEventListener('DOMContentLoaded', initialize); 