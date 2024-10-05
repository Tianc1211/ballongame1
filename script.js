const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const maxRounds = 10;
let currentRound = 1;
let balloonSize = 0;
let balloonGrowth = 10;
let maxSize = getRandomInt(50, 150);
let trialPoints = 0;
let totalPoints = 0;
let inflateCount = 0;

let explodedBalloons = 0;
let nonExplodedBalloons = 0;
let totalExplodedPumps = 0;
let totalNonExplodedPumps = 0;

let studentId = '';
let averagePumps = 0;

let explosionImage = new Image();
explosionImage.src = 'assets/explosion.png'; // 图片路径

let explosionSound = new Audio('assets/explosion.wav'); // 音频路径

let isExploding = false; // 添加变量控制爆炸状态

let playersData = []; // 新增数组以存储玩家数据

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('studentId').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        startGame();
    }
});

// 处理重新开始按钮的点击事件
document.getElementById('restartGameBtn').addEventListener('click', restartGame);

// 处理“打气”和“保存”按钮的点击事件
document.getElementById('inflateButton').addEventListener('click', inflateBalloon);
document.getElementById('saveButton').addEventListener('click', saveScore);

function startGame() {
    studentId = document.getElementById('studentId').value;
    if (!studentId) {
        alert('请输入您的学号');
        return;
    }
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('inputForm').style.display = 'none'; // 隐藏输入框
    canvas.style.display = 'block';
    resetGame();
    gameLoop();
}

function resetGame() {
    currentRound = 1;
    balloonSize = 0;
    trialPoints = 0;
    totalPoints = 0;
    inflateCount = 0;
    maxSize = getRandomInt(50, 150);
    explodedBalloons = 0;
    nonExplodedBalloons = 0;
    totalExplodedPumps = 0;
    totalNonExplodedPumps = 0;
}

function restartGame() {
    document.getElementById('scoreSummary').classList.add('hidden'); // 隐藏游戏结束总结
    document.getElementById('inputForm').style.display = 'block'; // 显示输入框
    document.getElementById('studentId').value = ''; // 清空学号输入框
    canvas.style.display = 'none'; // 隐藏画布
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showExplosion() {
    isExploding = true; // 设置为爆炸状态
    explosionSound.play(); // 播放爆炸音效
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(explosionImage, canvas.width / 2 - explosionImage.width / 2, canvas.height / 2 - explosionImage.height / 2); // 绘制爆炸图片

    setTimeout(() => {
        balloonSize = 0;
        trialPoints = 0;
        maxSize = getRandomInt(50, 150);
        currentRound++;
        isExploding = false; // 重置为非爆炸状态
        gameLoop();
    }, 1000); // 显示爆炸动画1秒后继续游戏
}

// 打气功能
function inflateBalloon() {
    if (isExploding) {
        return; // 如果正在爆炸，忽略打气操作
    }
    
    if (balloonSize < maxSize) {
        balloonSize += balloonGrowth;
        trialPoints++;
        inflateCount++;
    } else {
        explodedBalloons++;
        totalExplodedPumps += trialPoints;
        showExplosion();
        return; // 不再绘制气球
    }
    // 重新绘制气球和得分信息
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBalloon(balloonSize);
    updateScoreDisplay(); // 更新得分信息
}

// 保存分数
function saveScore() {
    // 只有在气球爆炸后，才将本轮的打气次数加到未爆炸的总打气数中
    if (balloonSize < maxSize) {
        totalNonExplodedPumps += trialPoints; // 记录本轮未爆炸气球的打气次数
        nonExplodedBalloons++; // 未爆炸气球数量加一
    }
    totalPoints += trialPoints; // 更新总得分
    balloonSize = 0;
    trialPoints = 0;
    maxSize = getRandomInt(50, 150);
    currentRound++;
    gameLoop();
}

// 绘制气球
function drawBalloon(size) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

// 游戏循环
function gameLoop() {
    if (currentRound > maxRounds) {
        endGame();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBalloon(balloonSize);
    updateScoreDisplay();
}

// 更新得分显示
function updateScoreDisplay() {
    ctx.fillStyle = 'black';
    ctx.font = '24px Microsoft YaHei';
    ctx.fillText(`轮次: ${currentRound}`, 50, 40);
    ctx.fillText(`本轮得分: ${trialPoints}`, 50, 80);
    ctx.fillText(`总得分: ${totalPoints}`, 50, 120);
    ctx.fillText(`总打气次数: ${inflateCount}`, 50, 160);
}

function endGame() {
    // 计算平均调整打气次数
    averagePumps = nonExplodedBalloons > 0 ? totalNonExplodedPumps / nonExplodedBalloons : 0;

    // 记录玩家数据
    const playerData = {
        studentId: studentId,
        score: totalPoints,
        totalPumps: inflateCount,
        averagePumps: averagePumps.toFixed(2), // 保留两位小数
    };

    playersData.push(playerData); // 将玩家数据添加到数组中
    playersData.sort((a, b) => b.score - a.score); // 根据得分从高到低排序

    displayPlayerData(); // 显示玩家数据

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById('scoreSummary').classList.remove('hidden');
    document.getElementById('finalScore').innerText = `您的总得分是：${totalPoints}，您的总打气次数是：${inflateCount}，您的平均调整打气次数是：${averagePumps.toFixed(2)}`;
    document.getElementById('finalRank').innerText = `排名：${getPlayerRank(studentId)}`; // 更新排名
    canvas.style.display = 'none';
}

function displayPlayerData() {
    const playerDataDiv = document.getElementById('playerData');
    playerDataDiv.innerHTML = ''; // 清空之前的内容

    // 创建表格来显示数据
    const table = document.createElement('table');
    table.style.width = '100%';
    table.border = '1';

    // 表头
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>学号</th><th>分数</th><th>总打气次数</th><th>平均均衡打气次数</th>';
    table.appendChild(headerRow);

    // 添加玩家数据行
    playersData.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${player.studentId}</td><td>${player.score}</td><td>${player.totalPumps}</td><td>${player.averagePumps}</td>`;
        table.appendChild(row);
    });

    playerDataDiv.appendChild(table); // 将表格添加到显示区域
    playerDataDiv.classList.remove('hidden'); // 显示玩家数据区域
}

function getPlayerRank(studentId) {
    const playerIndex = playersData.findIndex(player => player.studentId === studentId);
    return playerIndex !== -1 ? playerIndex + 1 : '-'; // 返回排名
}
