const deck1 = { 
    back: 'photo/ph99.jpg',
    fronts: [
        'photo/ph0.png',
        'photo/ph1.png',
        'photo/ph2.png',
        'photo/ph3.png',
        'photo/ph4.png',
        'photo/ph5.png',
        'photo/ph6.png',
        'photo/ph7.png',
        'photo/ph8.png',
        'photo/ph9.png',
        'photo/ph10.png',
        'photo/ph11.png',
        'photo/ph12.png',
        'photo/ph13.png',
        'photo/ph14.png',
        'photo/ph15.png',
        'photo/ph16.png',
        'photo/ph17.png'
    ]
};

const deck2 = {
    back: 'photo/10.png',
    fronts: [
        'photo/11.png',
        'photo/12.png',
        'photo/13.png',
        'photo/14.png',
        'photo/15.png',
        'photo/16.png',
        'photo/17.png',
        'photo/18.png',
        'photo/19.png',
        'photo/20.png',
        'photo/21.png',
        'photo/22.png',
        'photo/23.png',
        'photo/24.png',
        'photo/25.png',
        'photo/26.png',
        'photo/27.png',
        'photo/28.png',
    ]
};

const gameBoard = document.getElementById('gameBoard');
const restartBtn = document.getElementById('restartBtn');
const flipCoverBtn = document.getElementById('flipCoverBtn');
const styleToggleBtn = document.getElementById('styleToggleBtn');
const startBtn = document.getElementById('startBtn');
const cardCountSelect = document.getElementById('cardCountSelect');
const cardVisibilitySelect = document.getElementById('cardVisibility');

const timerDisplay = document.getElementById('timerDisplay');
const gameTimeDisplay = document.getElementById('gameTimeDisplay');

let currentDeck = deck1;
let cardValues = [];
let firstCard, secondCard;
let lockBoard = false;
let matchedCards = 0;
let isFlippingAll = false;

let countdownTimer;
let gameTimer;
let gameTime = 0;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createBoard() {
    gameBoard.innerHTML = '';
    matchedCards = 0;
    cardValues = [];
    
    const selectedCount = cardCountSelect.value;
    let rows, cols;

    switch (selectedCount) {
        case '2x2':
            rows = 2; cols = 2; break;
        case '2x3':
            rows = 2; cols = 3; break;
        case '2x4':
            rows = 2; cols = 4; break;
        case '3x4':
            rows = 3; cols = 4; break;
        case '4x4':
            rows = 4; cols = 4; break;
        case '4x6':
            rows = 4; cols = 6; break;
        case '6x6':
            rows = 6; cols = 6; break;
    }

    const totalCards = rows * cols;
    cardValues = [...currentDeck.fronts.slice(0, totalCards / 2), ...currentDeck.fronts.slice(0, totalCards / 2)];
    shuffle(cardValues);

    cardValues.forEach(value => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-face front">
                    <img src="${currentDeck.back}" alt="卡片背面">
                </div>
                <div class="card-face back">
                    <img src="${value}" alt="卡片正面">
                </div>
            </div>
        `;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });

    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 150px)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 150px)`;
}

function flipCard() {
    if (lockBoard || this.classList.contains('flipped')) return;

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    lockBoard = true;

    firstCard.classList.add('scale');
    secondCard.classList.add('scale');

    setTimeout(() => {
        checkForMatch();
    }, 600);
}

function checkForMatch() {
    const action = cardVisibilitySelect.value; // 使用下拉選單的值
    const isMatch = firstCard.querySelector('.back img').src === secondCard.querySelector('.back img').src;

    if (isMatch) {
        matchedCards += 2;
        if (action === 'hide') {
            firstCard.style.visibility = 'hidden';
            secondCard.style.visibility = 'hidden';
        }
        resetCards();

        // 播放音效
        const audio = new Audio('musicA.mp3');
        audio.play();
    } else {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetCards();
        }, 1000);

        // 播放不同圖案的音效
        const audioB = new Audio('musicB.mp3');
        audioB.play();
        showWhistleImage(); // 顯示圖片的函數
    }

    if (matchedCards === cardValues.length) {
        clearInterval(gameTimer);
        setTimeout(() => alert('恭喜你，遊戲結束！'), 500);
    }
}

function resetCards() {
    firstCard.classList.remove('scale');
    secondCard.classList.remove('scale');
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

function showWhistleImage() {
    const whistleImage = document.getElementById('whistleImage'); // 確保這裡的ID與HTML一致
    whistleImage.style.display = 'block'; // 顯示圖片
    whistleImage.style.opacity = 0; // 重設透明度

    // 首先淡入圖片
    whistleImage.animate([
        { opacity: 0 }, // 開始時透明
        { opacity: 1 }  // 結束時不透明
    ], {
        duration: 3000, // 持續時間，設為5秒
        fill: 'forwards' // 動畫完成後保持最後狀態
    }).onfinish = () => {
        // 淡出動畫
        whistleImage.animate([
            { opacity: 1 }, // 開始時不透明
            { opacity: 0 }  // 結束時透明
        ], {
            duration: 2000, // 淡出時間
            fill: 'forwards' // 動畫完成後保持最後狀態
        }).onfinish = () => {
            whistleImage.style.display = 'none'; // 動畫完成後隱藏圖片
        };
    };
}



function flipOrCoverCards() {
    const allCards = document.querySelectorAll('.card');

    if (!isFlippingAll) {
        allCards.forEach(card => {
            card.classList.add('flipped');
        });
        flipCoverBtn.textContent = '覆蓋所有卡片';
    } else {
        allCards.forEach(card => {
            card.classList.remove('flipped');
        });
        flipCoverBtn.textContent = '翻開所有卡片';
    }

    isFlippingAll = !isFlippingAll;
}

function toggleCardDeck() {
    currentDeck = currentDeck === deck1 ? deck2 : deck1;
    createBoard();
}

function startGame() {
    createBoard(); // 根據選擇的數量創建遊戲板

    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.add('flipped'); // 開始時所有卡片翻到正面
    });

    let countdown = 3;
    timerDisplay.textContent = `剩餘時間: ${countdown} 秒`;
    countdownTimer = setInterval(() => {
        countdown--;
        timerDisplay.textContent = `剩餘時間: ${countdown} 秒`;
        if (countdown <= 0) {
            clearInterval(countdownTimer);
            allCards.forEach(card => {
                card.classList.remove('flipped'); // 3秒後翻回背面
            });
            startGameTimer();
        }
    }, 1000); // 每秒更新

    gameTime = 0; // 重置遊戲時間顯示
    gameTimeDisplay.textContent = `遊戲時間: ${gameTime} 秒`;
}

function startGameTimer() {
    gameTimer = setInterval(() => {
        gameTime++;
        gameTimeDisplay.textContent = `遊戲時間: ${gameTime} 秒`;
    }, 1000); // 每秒更新
}

// 按鈕事件
restartBtn.addEventListener('click', () => {
    clearInterval(countdownTimer);
    clearInterval(gameTimer);
    createBoard();
    timerDisplay.textContent = '剩餘時間: 3 秒';
    gameTimeDisplay.textContent = '遊戲時間: 0 秒';
});

// 初始化createBoard(); // 初始化遊戲板


flipCoverBtn.addEventListener('click', flipOrCoverCards);
styleToggleBtn.addEventListener('click', toggleCardDeck);
startBtn.addEventListener('click', startGame); // 綁定開始遊戲按鈕事件
