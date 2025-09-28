// Глобальные переменные
let playerClan = null;
let gameBoard = [];
let foundSymbols = 0;
let gameOver = false;
let musicPlaying = false;
let symbols = []; // Сохраняем расположение символов между играми

// Управление экранами
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showClanSelection() {
    showScreen('clanScreen');
}

function selectClan(clan) {
    playerClan = clan;
    const enemyClan = clan === '🕸️' ? '💀' : '🕸️';
    
    // Убираем выделение со всех кланов
    document.querySelectorAll('.clan-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Выделяем выбранный клан
    event.currentTarget.classList.add('selected');
    
    // Активируем кнопку подтверждения
    document.getElementById('confirmClan').disabled = false;
    
    // Обновляем информацию в правилах
    document.getElementById('playerClanInfo').innerHTML = `
        <h4>Твой клан: ${clan}</h4>
        <p>Твои символы: ${clan} | Вражеские символы: ${enemyClan}</p>
        <p><strong>Найди 5 своих символов для победы!</strong></p>
    `;
}

function showRules() {
    if (!playerClan) return;
    showScreen('rulesScreen');
}

function startGame() {
    if (!playerClan) return;
    showScreen('gameScreen');
    initializeGame();
}

function showRulesFromGame() {
    showScreen('rulesScreen');
}

// Управление музыкой
function toggleMusic() {
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.querySelector('.music-btn');
    const musicBtnSmall = document.querySelector('.music-btn-small');
    
    if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
        if (musicBtn) musicBtn.textContent = '🔊 Включить музыку';
        if (musicBtnSmall) musicBtnSmall.textContent = '🔇';
    } else {
        // Пытаемся воспроизвести музыку
        bgMusic.play().then(() => {
            musicPlaying = true;
            if (musicBtn) musicBtn.textContent = '🔊 Выключить музыку';
            if (musicBtnSmall) musicBtnSmall.textContent = '🔊';
        }).catch(error => {
            console.log('Автовоспроизведение заблокировано:', error);
            // Показываем сообщение только если это не мобильное устройство
            if (window.innerWidth > 768) {
                alert('Нажмите "OK" чтобы включить музыку, затем нажмите кнопку музыки еще раз');
            }
        });
    }
}

// Игровая логика
function initializeGame() {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';
    
    // Создаём игровое поле
    gameBoard = [];
    foundSymbols = 0;
    gameOver = false;
    
    const enemyClan = playerClan === '🕸️' ? '💀' : '🕸️';
    
    // Если это первая игра или игрок проиграл - создаём новое расположение
    if (symbols.length === 0) {
        // Создаём массив символов: 5 своих, 4 вражеских
        symbols = [
            playerClan, playerClan, playerClan, playerClan, playerClan,
            enemyClan, enemyClan, enemyClan, enemyClan
        ];
        
        // Перемешиваем массив только при создании новой игры
        shuffleArray(symbols);
    }
    
    // Создаём клетки
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const index = i * 3 + j;
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.dataset.symbol = symbols[index];
            cell.addEventListener('click', () => handleCellClick(cell));
            
            boardElement.appendChild(cell);
            gameBoard.push({
                element: cell,
                symbol: symbols[index],
                revealed: false
            });
        }
    }
    
    updateGameDisplay();
    showMessage("Битва начинается... Запомни расположение символов!");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function handleCellClick(cell) {
    if (gameOver) return;
    
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const index = row * 3 + col;
    
    if (gameBoard[index].revealed) return;
    
    // Открываем клетку
    gameBoard[index].revealed = true;
    cell.classList.add('revealed');
    cell.textContent = gameBoard[index].symbol;
    
    // Проверяем результат
    if (gameBoard[index].symbol === playerClan) {
        // Найден свой символ
        foundSymbols++;
        
        if (foundSymbols === 5) {
            // Победа!
            gameOver = true;
            showVictory();
        } else {
            showMessage(`Отлично! Найден твой символ! Осталось найти ${5 - foundSymbols}`);
        }
    } else {
        // Найден вражеский символ - смерть!
        gameOver = true;
        cell.classList.add('death');
        showDefeat();
    }
    
    updateGameDisplay();
}

function updateGameDisplay() {
    document.getElementById('foundSymbols').textContent = `${foundSymbols}/5`;
    
    const remaining = gameBoard.filter(cell => !cell.revealed).length;
    document.getElementById('remainingCells').textContent = remaining;
    
    document.getElementById('playerInfo').innerHTML = `
        Твой клан: <span class="player-symbol">${playerClan}</span>
    `;
}

function showMessage(message) {
    document.getElementById('messageArea').textContent = message;
}

function showVictory() {
    const victoryMessages = [
        `🏆 ВЕЛИКАЯ ПОБЕДА! 🏆 Ты принёс славу клану ${playerClan}!`,
        `🎉 ТРИУМФ! 🎉 ${playerClan} правят замком!`,
        `⚡ НЕВЕРОЯТНО! ⚡ Ты пережил все испытания!`
    ];
    
    const message = victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
    
    document.getElementById('resultContent').innerHTML = `
        <h2 class="result-title">🏆 ПОБЕДА! 🏆</h2>
        <div class="result-message">
            <p>${message}</p>
            <p>Ты нашёл все 5 символов своего клана и выжил в этой смертельной битве!</p>
            <p style="margin-top: 20px; font-size: 4em;">${playerClan}${playerClan}${playerClan}</p>
        </div>
        <button class="gothic-btn" onclick="newGameWithNewLayout()">⚔️ Новая Битва</button>
    `;
    
    showScreen('resultScreen');
}

function showDefeat() {
    const defeatMessages = [
        `💀 СМЕРТЕЛЬНАЯ ОШИБКА! 💀 Ты наткнулся на вражеский символ...`,
        `⚰️ КОНЕЦ БИТВЫ... ⚰️ Вражеский клан торжествует...`,
        `🌑 ТЬМА ПОГЛОТИЛА... 🌑 Ты не смог избежать ловушки...`
    ];
    
    const message = defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
    
    document.getElementById('resultContent').innerHTML = `
        <h2 class="result-title">💀 ПОРАЖЕНИЕ 💀</h2>
        <div class="result-message">
            <p>${message}</p>
            <p>Ты нашёл ${foundSymbols} из 5 нужных символов...</p>
            <p>Запомни расположение символов и попробуй снова!</p>
            <p style="margin-top: 20px; font-size: 4em;">💀⚰️🌑</p>
        </div>
        <button class="gothic-btn" onclick="resetGame()">⚔️ Попробовать Снова</button>
    `;
    
    showScreen('resultScreen');
}

function resetGame() {
    // При проигрыше НЕ меняем расположение символов
    if (playerClan) {
        showScreen('gameScreen');
        // Восстанавливаем игровое поле с теми же символами
        restoreGameBoard();
    } else {
        showScreen('startScreen');
    }
}

function newGameWithNewLayout() {
    // При победе создаём новое расположение
    symbols = [];
    if (playerClan) {
        startGame();
    } else {
        showScreen('startScreen');
    }
}

function restoreGameBoard() {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';
    
    gameBoard = [];
    foundSymbols = 0;
    gameOver = false;
    
    // Восстанавливаем клетки с теми же символами
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const index = i * 3 + j;
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.dataset.symbol = symbols[index];
            cell.addEventListener('click', () => handleCellClick(cell));
            
            boardElement.appendChild(cell);
            gameBoard.push({
                element: cell,
                symbol: symbols[index],
                revealed: false
            });
        }
    }
    
    updateGameDisplay();
    showMessage("Попробуй снова! Запомни расположение символов...");
}

// Инициализация
showScreen('startScreen');