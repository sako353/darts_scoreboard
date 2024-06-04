$(function() {
    // プレイヤー情報を保持する配列。各プレイヤーの名前とスコアを格納。
    let players = [
        { name: "プレイヤー1", score: 0 },
        { name: "プレイヤー2", score: 0 },
        { name: "プレイヤー3", score: 0 },
        { name: "プレイヤー4", score: 0 }
    ];

    // 現在のプレイヤーのインデックス
    let currentPlayerIndex = 0;

    // クリック回数（投げた回数）をカウント
    let clickCount = 0;

    // 直前の得点
    let lastScore = 0;

    // 直前の得点ゾーン
    let lastScoreZone = '';

    // 現在のプレイヤー数（初期値は1）
    let playerCount = 1;

    // 現在のゲームモード（初期値はカウントアップモード）
    let currentMode = "countup";

    // 01モードの初期スコア
    let zeroOnePoints = 0;

    // クリケットモードのスコア
    let cricketScores = {
        20: [0, 0, 0, 0],
        19: [0, 0, 0, 0],
        18: [0, 0, 0, 0],
        17: [0, 0, 0, 0],
        16: [0, 0, 0, 0],
        15: [0, 0, 0, 0],
        bull: [0, 0, 0, 0]
    };

    // プレイヤー情報とスコアを表示更新
    function updateDisplay() {
        $('#player-turn').text(`${players[currentPlayerIndex].name}の番`);
        $('#total-score').text(players[currentPlayerIndex].score);
        $('#throw-count').text(clickCount + 1);
        $('#player1-score').text(players[0].score);
        $('#player2-score').text(players[1].score);
        $('#player3-score').text(players[2].score);
        $('#player4-score').text(players[3].score);

        for (let i = 1; i <= 4; i++) {
            if (i <= playerCount) {
                $(`#player${i}-score-display`).show();
                $(`#cricket-20-${i}`).show();
                $(`#cricket-19-${i}`).show();
                $(`#cricket-18-${i}`).show();
                $(`#cricket-17-${i}`).show();
                $(`#cricket-16-${i}`).show();
                $(`#cricket-15-${i}`).show();
                $(`#cricket-bull-${i}`).show();
            } else {
                $(`#player${i}-score-display`).hide();
                $(`#cricket-20-${i}`).hide();
                $(`#cricket-19-${i}`).hide();
                $(`#cricket-18-${i}`).hide();
                $(`#cricket-17-${i}`).hide();
                $(`#cricket-16-${i}`).hide();
                $(`#cricket-15-${i}`).hide();
                $(`#cricket-bull-${i}`).hide();
            }
        }
    }

    // クリケットモードのスコアを更新
    function updateCricketScore(target, multiplier) {
        const playerScores = cricketScores[target];

        let hits = 0;
        if (multiplier === 'single') {
            hits = 1;
        } else if (multiplier === 'double') {
            hits = 2;
        } else if (multiplier === 'triple') {
            hits = 3;
        }

        // プレイヤーのヒット数を更新
        if (playerScores[currentPlayerIndex] < 3) {
            playerScores[currentPlayerIndex] += hits;
            if (playerScores[currentPlayerIndex] > 3) {
                playerScores[currentPlayerIndex] = 3;
            }
        }

        // 他のプレイヤーが3回当てたかチェック
        let totalHits = playerScores.reduce((a, b) => a + (b >= 3 ? 3 : b), 0);
        if (totalHits === playerCount * 3) {
            // すべてのプレイヤーが3回当てた場合
            $(`#cricket-${target}-1`).addClass('strikethrough');
            $(`#cricket-${target}-2`).addClass('strikethrough');
            $(`#cricket-${target}-3`).addClass('strikethrough');
            $(`#cricket-${target}-4`).addClass('strikethrough');
        } else if (playerScores[currentPlayerIndex] >= 3) {
            // プレイヤーの得点を更新
            players[currentPlayerIndex].score += (playerScores[currentPlayerIndex] - 3) * parseInt(target);
        }

        // 得点表を更新
        for (let i = 1; i <= playerCount; i++) {
            $(`#cricket-${target}-${i}`).text(playerScores[i - 1]);
        }
    }

    // 得点を表示する関数
    function showScoreOverlay(score, zone) {
        const overlay = $('#score-display-overlay');
        overlay.text(score).removeClass('single double triple other');

        switch (zone) {
            case 'single':
                overlay.addClass('single');
                break;
            case 'double':
                overlay.addClass('double');
                break;
            case 'triple':
                overlay.addClass('triple');
                break;
            default:
                overlay.addClass('other');
                break;
        }

        overlay.fadeIn().delay(800).fadeOut();
    }

    // ゲームモードを切り替え
    function switchMode(mode) {
        currentMode = mode;
        players.forEach(player => player.score = 0); // 全プレイヤーのスコアをリセット
        currentPlayerIndex = 0;
        clickCount = 0;
        updateDisplay();

        switch (mode) {
            case 'カウントアップモード':
                $('body').css('background-color', '#ffffff'); // 白
                $('#zeroone-options').hide();
                $('#cricket-board').hide();
                break;
            case '01モード':
                $('body').css('background-color', '#add8e6'); // 薄い青
                $('#zeroone-options').show();
                $('#cricket-board').hide();
                break;
            case 'クリケットモード':
                $('body').css('background-color', '#ffffe0'); // 薄い黄色
                $('#zeroone-options').hide();
                $('#cricket-board').show();
                break;
        }

        alert(`${mode}に切り替えました`);
    }
    
    // 01モードの選択ボタンのクリックイベント
    $('.zeroone-option').on('click', function() {
        zeroOnePoints = parseInt($(this).data('points'));
        players.forEach(player => player.score = zeroOnePoints); // 01モードの初期スコアを設定
        $('#zeroone-options').hide();
        updateDisplay();
        alert(`${zeroOnePoints}モードを開始します`);
    });

    // ダーツボードをクリックしたときの処理
    $('#darts').on('click', function(event) {
        const rect = this.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // ダーツボードの中心からの距離を計算
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

        // 角度の計算
        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        // 角度を0〜360度の範囲に変換
        const normalizedAngle = (angle + 360) % 360;

        // ダーツのスコアリングのゾーンを定義
        let scoreZone = '';
        let score = 0;

        if (distance < 12.7) {
            scoreZone = 'Dbull';
            lastScoreZone = 'DBull';
            score = 50;
        } else if (distance < 31.8) {
            scoreZone = 'Sbull';
            lastScoreZone = 'SBull';
            score = 25;
        } else {
            // 角度に基づくスコアの倍率設定
            let scorerate = 0;
            if (normalizedAngle >= 9 && normalizedAngle < 27) {
                scorerate = 10;
            } else if (normalizedAngle >= 27 && normalizedAngle < 45) {
                scorerate = 15;
            } else if (normalizedAngle >= 45 && normalizedAngle < 63) {
                scorerate = 2;
            } else if (normalizedAngle >= 63 && normalizedAngle < 81) {
                scorerate = 17;
            } else if (normalizedAngle >= 81 && normalizedAngle < 99) {
                scorerate = 3;
            } else if (normalizedAngle >= 99 && normalizedAngle < 117) {
                scorerate = 19;
            } else if (normalizedAngle >= 117 && normalizedAngle < 135) {
                scorerate = 7;
            } else if (normalizedAngle >= 135 && normalizedAngle < 153) {
                scorerate = 16;
            } else if (normalizedAngle >= 153 && normalizedAngle < 171) {
                scorerate = 8;
            } else if (normalizedAngle >= 171 && normalizedAngle < 189) {
                scorerate = 11;
            } else if (normalizedAngle >= 189 && normalizedAngle < 207) {
                scorerate = 14;
            } else if (normalizedAngle >= 207 && normalizedAngle < 225) {
                scorerate = 9;
            } else if (normalizedAngle >= 225 && normalizedAngle < 243) {
                scorerate = 12;
            } else if (normalizedAngle >= 243 && normalizedAngle < 261) {
                scorerate = 5;
            } else if (normalizedAngle >= 261 && normalizedAngle < 279) {
                scorerate = 20;
            } else if (normalizedAngle >= 279 && normalizedAngle < 297) {
                scorerate = 1;
            } else if (normalizedAngle >= 297 && normalizedAngle < 315) {
                scorerate = 18;
            } else if (normalizedAngle >= 315 && normalizedAngle < 333) {
                scorerate = 4;
            } else if (normalizedAngle >= 333 && normalizedAngle < 351) {
                scorerate = 13;
            } else {
                scorerate = 6;
            }

            if (distance < 105) {
                scoreZone = 'single';
                score = scorerate;
                lastScoreZone = `S${scorerate}`;
            } else if (distance < 130) {
                scoreZone = 'triple';
                score = scorerate * 3;
                lastScoreZone = `T${scorerate}`;
            } else if (distance < 175) {
                scoreZone = 'single';
                score = scorerate;
                lastScoreZone = `S${scorerate}`;
            } else if (distance < 200) {
                scoreZone = 'double';
                score = scorerate * 2;
                lastScoreZone = `D${scorerate}`;
            } else {
                scoreZone = 'Miss';
                score = 0;
                lastScoreZone = 'Miss';
            }
        }

        lastScore = score;

        if (currentMode === '01モード') { // 01モード設定
            players[currentPlayerIndex].score -= score;
            if (players[currentPlayerIndex].score < 0) {
                players[currentPlayerIndex].score += score; // バスト処理
                showScoreOverlay('バースト', 'other');
                clickCount = 0;
                currentPlayerIndex = (currentPlayerIndex + 1) % playerCount;
                updateDisplay();
                return;
            } else if (players[currentPlayerIndex].score === 0) {
                showScoreOverlay(`${players[currentPlayerIndex].name}の勝利！`, 'other');
                players.forEach(player => player.score = 0); // 全プレイヤーのスコアをリセット
                clickCount = 0;
                currentPlayerIndex = 0;
                updateDisplay();
                return;
            }
        } else if (currentMode === 'クリケットモード') {
            updateCricketScore(lastScoreZone, scoreZone);
        } else {
            players[currentPlayerIndex].score += score;
        }

        clickCount++;
        if (clickCount === 3) {
            clickCount = 0;
            currentPlayerIndex = (currentPlayerIndex + 1) % playerCount;
        }
        updateDisplay();
        showScoreOverlay(lastScoreZone, scoreZone);
    });

    // リセットボタンのクリックイベント
    $('#reset').on('click', function() {
        if (clickCount > 0) {
            players[currentPlayerIndex].score -= lastScore;
            clickCount--;
            updateDisplay();
            alert(`直前の得点 ${lastScoreZone} を取り消しました。現在の総得点: ${players[currentPlayerIndex].score}`);
        } else {
            alert('取り消す得点がありません');
        }
    });

    // 終了ボタンのクリックイベント
    $('#finish').on('click', function() {
        alert(`ゲーム終了。${players[currentPlayerIndex].name}の総得点: ${players[currentPlayerIndex].score}`);
        players.forEach(player => player.score = 0);
        clickCount = 0;
        currentPlayerIndex = 0;
        updateDisplay();
    });

    // プレイヤー追加ボタンのクリックイベント
    $('#add-player').on('click', function() {
        if (playerCount < 4) {
            playerCount++;
            alert(`プレイヤー${playerCount}が追加されました。`);
            updateDisplay();
        } else {
            alert('これ以上プレイヤーを追加できません。');
        }
    });

    // プレイヤー削除ボタンのクリックイベント
    $('#remove-player').on('click', function() {
        if (playerCount > 1) {
            if (currentPlayerIndex >= playerCount - 1) {
                currentPlayerIndex = 0;
            }
            playerCount--;
            players[playerCount].score = 0; // 削除されるプレイヤーのスコアをリセット
            alert(`プレイヤー${playerCount + 1}が削除されました。`);
            updateDisplay();
        } else {
            alert('これ以上プレイヤーを削除できません。');
        }
    });

    // カウントアップモードボタンのクリックイベント
    $('#countup-mode').on('click', function() {
        switchMode('カウントアップモード');
    });

    // 01モードボタンのクリックイベント
    $('#zeroone-mode').on('click', function() {
        switchMode('01モード');
    });

    // クリケットモードボタンのクリックイベント
    $('#cricket-mode').on('click', function() {
        switchMode('クリケットモード');
    });

    // 初期表示の更新
    updateDisplay();
});
