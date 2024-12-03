const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = $(window).width() //畫布寬度設定為視窗寬度
canvas.height = $(window).height() //畫布高度設定為視窗高度

//基礎設置
const playerWidth = 150 //玩家角色寬度
const playerHeight = 150 //玩家角色高度
const gravity = 0.95  //重力
const jumpStrength = 18 //跳躍高度
const groundHeight = 70 //地面高度
let gameLoopID

let playerImg = new Image();
playerImg.src = "img/padoru.gif";

let coinImg = new Image();
coinImg.src = "img/coin.png";

let boomImg = new Image();
boomImg.src = "img/boom.png";

let groundImg = new Image();
let groundColor = ['img/ground1.png', 'img/ground2.png', 'img/ground3.png', 'img/ground4.png']

groundImg.src = groundColor[Math.floor(Math.random()*4)]

//玩家資料
let player = {
    x: 150, //座標
    y: canvas.height - groundHeight - playerHeight, //Y軸座標初始位置
    width: playerWidth,//玩家角色寬度
    height: playerHeight, //玩家角色高度
    velocityY: 0, //垂直速度
    onGround: true,
    score: 0,
    life: 3
}

//地板設定
let grounds = []
let groundInterval = 0;
let groundWidth = 130;


//金幣設定
let coins = [] //紀錄金幣位置
let coinInterval = 0; //固定生成金幣時間
let coinRadius = 15; //金幣半徑

//鍵盤控制
let key = {}
let mouse

//鍵盤監聽事件
$(document).keydown(function (e) {
    key[e.key] = true
})

$(document).mousedown(function(e){
    mouse = true
})

$(document).on('touchstart',function(e){
    mouse = true
});

$(document).keyup(function (e) {
    key[e.key] = false
})

$(document).mouseup(function(e){
    mouse = false
})

$(document).on('touchend',function(e){
    mouse = false
});


// 隨機生成地板
function createGround() {
    const x = canvas.width + groundWidth; //固定生成位置
    const y = canvas.height - groundHeight //固定高度
    const color = Math.floor(Math.random()*4)
    grounds.push({ x, y, color });
}

let boomSum = 0
//隨機生成金幣/炸彈
function createCoin() {

    const x = canvas.width + coinRadius // 金幣生成位置
    const coinY = [playerHeight / 2, playerHeight * 1.5] //陣列，隨機生成金幣/炸彈的高度
    const y = canvas.height - groundHeight - coinY[Math.floor(Math.random() * 2)]
    let boom = Math.floor(Math.random() * 8)
    if(boom == 0){
        boomSum ++
    }
    if(boomSum > 2){
        boomSum = 0
        boom = 1
    }
    coins.push({ x, y, boom })

}

//遊戲啟動
function start() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    //玩家跳躍偵測
    if (key[' '] || mouse) {
        if (player.onGround) {
            player.velocityY = -jumpStrength //跳躍
            player.onGround = false
        }
    }

    // 重力效應
    player.velocityY += gravity;
    player.y += player.velocityY;

    //玩家與邊界碰撞監測(回地上)
    if (player.y >= canvas.height - playerHeight - groundHeight) {
        player.y = canvas.height - playerHeight - groundHeight
        player.velocityY = 0
        player.onGround = true
    }

    //移動金幣
    coins.forEach((coin, index) => {
        coin.x -= 6 //金幣移動速度
        if (coin.x + coinRadius < 0) {
            coins.splice(index, 1) //移除超出畫面的金幣/炸彈
        }

        //玩家是否吃到金幣/炸彈
        if (
            player.x < coin.x + coinRadius &&
            player.x + playerWidth / 2 > coin.x - coinRadius &&
            player.y < coin.y + coinRadius &&
            player.y + playerHeight > coin.y - coinRadius
        ) {
            coins.splice(index, 1) //吃到金幣/炸彈
            if (coin.boom == 0) {
                player.life -= 1 //吃到炸彈
            } else {
                player.score += 5 //吃到金幣
            }
        }

    });

    //畫出金幣
    coins.forEach(coin => {
        if (coin.boom == 0) {
            ctx.drawImage(boomImg, coin.x, coin.y, coinRadius * 2, coinRadius * 2);
        } else {
            ctx.drawImage(coinImg, coin.x, coin.y, coinRadius * 2, coinRadius * 2);
        }
    });

    // 移動地板
    grounds.forEach((ground, index) => {
        ground.x -= 6; // 地板向左移動
        if (ground.x + groundWidth < 0) {
            grounds.splice(index, 1); // 移除已超出畫面的地板
        }
    });

    // 畫出地板
    grounds.forEach(ground => {
        groundImg.src = groundColor[ground.color]
        ctx.drawImage(groundImg, ground.x, ground.y, groundWidth, 215);
    });

    //畫出玩家
    ctx.drawImage(playerImg, player.x, player.y, playerWidth, playerHeight);

    //寫出分數
    ctx.font = '30px Arial'
    ctx.fillStyle = '#fff'
    ctx.fillText(`分數: ${player.score} `, canvas.width * 0.02, canvas.height * 0.02 + 30)

    //寫出生命
    ctx.font = '30px Arial'
    ctx.fillStyle = '#fff'
    ctx.fillText(`生命: ${player.life} `, canvas.width * 0.02, canvas.height * 0.02 + 90)

    //每隔一段時間生成金幣/炸彈
    coinInterval++
    if (coinInterval > 20) {
        createCoin();
        coinInterval = 0
    }

    // 每隔一段時間創建地板
    groundInterval++;
    if (groundInterval > 20) {
        createGround();
        groundInterval = 0;
    }

    if (player.life == 0) {
        cancelAnimationFrame(gameLoopID);
        endding()
    } else {
        gameLoopID = requestAnimationFrame(start)
    }

}

function endding() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = '5vw Arial'
    ctx.fillStyle = '#fff'
    ctx.textAlign = "center"
    ctx.fillText(`為了莎莎，加油好嗎`, canvas.width * 0.5, canvas.height * 0.5 - 50)
    ctx.fillText(`分數: ${player.score} `, canvas.width * 0.5, canvas.height * 0.5)

    $('#replay').fadeIn(200)
    $('.btns').fadeOut(200)

}

$('#start').on('click', function () {
    start()
    $('#start').fadeOut(200)
    $('.btns').css('display','flex')
    // $('.ground').css({
    //     'animation': 'groundRun 2.05s 1 linear',
    //     'animation-fill-mode': 'forwards',
    //     'animation-delay': '0.55s',
    // })
})

$('.pause').on('click',function(){
    cancelAnimationFrame(gameLoopID)
    $(this).hide()
    $('.play').show()
})

$(".play").on('click',function(){
    gameLoopID = requestAnimationFrame(start)
    $(this).hide()
    $('.pause').show()
})

$('#replay, .replay').on('click',function(){
    location.reload()
})


//畫出地板
// ctx.fillStyle = '#909090'
// ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight)
// ctx.drawImage(groundImg, 0, canvas.height - groundHeight, canvas.Width, 215);