// チャート関連のユーティリティ関数
function wrapLabels(labels, maxLength = 16) {
    return labels.map(label => {
        if (typeof label === 'string' && label.length > maxLength) {
            const words = label.split(' ');
            let lines = [];
            let currentLine = '';
            words.forEach(word => {
                if ((currentLine + word).length > maxLength && currentLine.length > 0) {
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

// 共通チャートオプション
const commonChartOptions = (titleText = '') => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: { size: 12, family: "'Noto Sans JP', sans-serif" },
                 color: '#262626'
            }
        },
        title: {
            display: !!titleText,
            text: titleText,
            font: { size: 16, family: "'Noto Sans JP', sans-serif", weight: 'bold' },
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
            bodyFont: { family: "'Noto Sans JP', sans-serif" },
            titleFont: { family: "'Noto Sans JP', sans-serif" }
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
                                    font: { size: 10, family: "'Noto Sans JP', sans-serif" },
                                    color: '#262626'
                                },
                                ticks: {
                                    stepSize: 1,
                                    backdropColor: 'rgba(255,250,240,0.5)',
                                    color: '#737373'
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
                        font: { size: 10, family: "'Noto Sans JP', sans-serif" },
                        color: '#262626'
                    },
                    ticks: {
                        stepSize: 1,
                        backdropColor: 'rgba(255,250,240,0.5)',
                        color: '#737373'
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
}

// 初期化関数
function initialize() {
    initializeJobSelector();
    setupJobProfileChart();
    setupEventListeners();
    renderDiagnosisQuestions();
}

// DOMContentLoadedイベントで初期化
document.addEventListener('DOMContentLoaded', initialize); 