document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const scorecardContainer = document.getElementById('scorecard-container');
    const actionButtonsContainer = document.getElementById('action-buttons');
    let currentSport = 'cricket';
    let footballChart;
    let timerInterval;

    // --- DARK MODE LOGIC ---
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');
        if (footballChart) {
            updateChartTheme(footballChart);
        }
    });

    function updateChartTheme(chart) {
        const isDarkMode = document.body.classList.contains('dark');
        const gridColor = isDarkMode
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDarkMode ? '#f3f4f6' : '#374151';

        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.y.grid.color = gridColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.plugins.legend.labels.color = textColor;
        chart.update();
    }

    // --- SPORT SWITCHING LOGIC ---
    window.switchSport = (sport) => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        if (footballChart) {
            footballChart.destroy();
            footballChart = null;
        }

        currentSport = sport;
        updateUI();
    };

    function updateUI() {
        document
            .getElementById('cricket-btn')
            .classList.toggle('bg-white', currentSport === 'cricket');
        document
            .getElementById('cricket-btn')
            .classList.toggle('dark:bg-gray-900', currentSport === 'cricket');
        document
            .getElementById('football-btn')
            .classList.toggle('bg-white', currentSport === 'football');
        document
            .getElementById('football-btn')
            .classList.toggle('dark:bg-gray-900', currentSport === 'football');

        const template = document.getElementById(
            `${currentSport}-template`
        ).innerHTML;
        scorecardContainer.innerHTML = template;

        populateActionButtons();

        if (currentSport === 'football') {
            initFootballFeatures();
        }
    }

    function populateActionButtons() {
        actionButtonsContainer.innerHTML = '';
        let buttons = [];
        if (currentSport === 'cricket') {
            buttons = [
                { text: '+1 Run', action: () => updateCricketScore(1, 0) },
                { text: '+4 Runs', action: () => updateCricketScore(4, 0) },
                { text: '+6 Runs', action: () => updateCricketScore(6, 0) },
                { text: 'Wicket!', action: () => updateCricketScore(0, 1) },
            ];
        } else {
            buttons = [
                { text: 'Goal Team 1', action: () => updateFootballScore(1) },
                { text: 'Goal Team 2', action: () => updateFootballScore(2) },
                { text: 'Update Time', action: startFootballTimer },
            ];
        }
        buttons.forEach((btnInfo) => {
            const button = document.createElement('button');
            button.textContent = btnInfo.text;
            button.className =
                'bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg m-2 transition-transform transform hover:scale-105';
            button.onclick = btnInfo.action;
            actionButtonsContainer.appendChild(button);
        });
    }

    // --- CRICKET SPECIFIC LOGIC ---
    let c_score = 182,
        c_wickets = 4,
        c_overs = 18,
        c_balls = 2;
    let inningsOver = false;

    window.updateCricketScore = (runs, wickets) => {
        if (inningsOver) return;

        c_score += runs;
        c_wickets += wickets;

        if (c_wickets >= 10) {
            c_wickets = 10;
            updateDisplay();
            showCricketModal('All out!', `Runs needed to win: ${c_score}`);
            inningsOver = true;
            return;
        }

        c_balls++;
        if (c_balls === 6) {
            c_balls = 0;
            c_overs++;
        }

        if (c_overs === 20) {
            c_balls = 0;
            updateDisplay();
            showCricketModal('20 overs completed!', `Runs needed to win: ${c_score}`);
            inningsOver = true;
            return;
        }

        updateDisplay();
    };

    function updateDisplay() {
        const oversDisplay = `${c_overs}.${c_balls}`;
        const totalBalls = c_overs * 6 + c_balls;
        const crr = totalBalls > 0 ? ((c_score / totalBalls) * 6).toFixed(2) : 0;

        document.getElementById('c-score').textContent = c_score;
        document.getElementById('c-wickets').textContent = c_wickets;
        document.getElementById('c-overs').textContent = oversDisplay;
        document.getElementById('c-crr').textContent = crr;

        const progress = (totalBalls / 120) * 100;
        document.getElementById('cricket-progress').style.width = `${Math.min(
            progress,
            100
        )}%`;
    }

    window.showCricketModal = (msg, winMsg) => {
        document.getElementById('cricketModalMsg').textContent = msg;
        document.getElementById('cricketWinMsg').textContent = winMsg;
        document.getElementById('cricketModal').style.display = 'flex';
    };

    window.closeCricketModal = () => {
        document.getElementById('cricketModal').style.display = 'none';
    };

    // --- FOOTBALL SPECIFIC LOGIC ---
    let f_score1 = 2,
        f_score2 = 1,
        f_minutes = 78,
        f_seconds = 12;
    window.updateFootballScore = (team) => {
        if (team === 1) {
            f_score1++;
            document.getElementById('f-score1').textContent = f_score1;
        } else {
            f_score2++;
            document.getElementById('f-score2').textContent = f_score2;
        }
    };

    function startFootballTimer() {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            f_seconds++;
            if (f_seconds >= 60) {
                f_seconds = 0;
                f_minutes++;
            }
            if (f_minutes >= 90) clearInterval(timerInterval);

            const timeEl = document.getElementById('f-time');
            if (timeEl) {
                timeEl.textContent = `${String(f_minutes).padStart(2, '0')}:${String(
                    f_seconds
                ).padStart(2, '0')}`;
            }
        }, 1000);
    }

    function initFootballFeatures() {
        const tabs = scorecardContainer.querySelectorAll('[data-tab]');
        const summaryContent = document.getElementById('summary-content');
        const statsContent = document.getElementById('stats-content');

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                tabs.forEach((t) => t.classList.remove('tab-active'));
                tab.classList.add('tab-active');

                summaryContent.classList.toggle(
                    'hidden',
                    tab.dataset.tab !== 'summary'
                );
                statsContent.classList.toggle('hidden', tab.dataset.tab !== 'stats');

                if (tab.dataset.tab === 'stats' && !footballChart) {
                    createFootballChart();
                }
            });
        });
    }

    function createFootballChart() {
        const ctx = document
            .getElementById('football-stats-chart')
            .getContext('2d');
        const isDarkMode = document.body.classList.contains('dark');
        const gridColor = isDarkMode
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDarkMode ? '#f3f4f6' : '#374151';

        footballChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    'Shots',
                    'Shots on Target',
                    'Possession %',
                    'Passes',
                    'Fouls',
                    'Yellow Cards',
                ],
                datasets: [
                    {
                        label: 'Real Madrid',
                        data: [14, 8, 58, 550, 8, 1],
                        backgroundColor: 'rgba(254, 190, 16, 0.8)',
                        borderColor: 'rgba(254, 190, 16, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'FC Barcelona',
                        data: [11, 5, 42, 410, 12, 3],
                        backgroundColor: 'rgba(165, 0, 68, 0.8)',
                        borderColor: 'rgba(165, 0, 68, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { color: textColor },
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor },
                    },
                },
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                        },
                    },
                },
                responsive: true,
                maintainAspectRatio: false,
            },
        });
    }

    // --- INITIAL LOAD ---
    updateUI();
});