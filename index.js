let canvas = document.querySelector("#canvas");
let ctx = canvas.getContext("2d"); // 캔버스에 그래픽을 그리는 메소드

// 캔버스 크기
canvas.width = 500;
canvas.height = 400;

// 캐릭터 이미지 객체 생성
let characterImgs = [
    "../images/1.png",
    "../images/2.png"
];
let currentImageIndex = 0;
let characterImg = new Image();
characterImg.src = characterImgs[currentImageIndex];
// 장애물 이미지 생성
let objectImg = new Image();
objectImg.src = "../images/3.png"
// 배경 이미지 생성
let bgX = 0; // 배경 이미지의 x 좌표
let bgImg = new Image();
bgImg.src = "../images/bg.png";
// 배경 이미지 그리기 함수
function drawBackground() {
    ctx.drawImage(bgImg, bgX, 300, canvas.width, 100);
    ctx.drawImage(bgImg, bgX + canvas.width, 300, canvas.width, 100);
}
// 배경 이미지 이동 함수
function moveBackground() {
    bgX -= 1; // 배경 이미지를 왼쪽으로 이동
    if (bgX <= -canvas.width) {
        bgX = 0; // 이미지가 화면을 벗어나면 다시 처음으로 이동
    }
}
// 메인 캐릭터의 좌표와 크기, 그래픽 호출 메소드 객체에 정의
let character = {
    x : 20,
    y : 300,
    width: 60,
    height: 75,
    draw() {
        ctx.fillStyle = "pink";
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(characterImg, this.x, this.y);
    }
}
// 장애물 객체 정의(여러개일 수 있기때문에 클래스로)
class Object {
    constructor() {
        this.x = 500;
        this.y = 325;
        this.width = 60;
        this.height = 60;
    }
    draw() {
        ctx.fillStyle = "lightblue";
        // ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(objectImg, this.x, this.y);
    }
}
let timer = 0; // 장애물 생성 타이머
let objects = [] // 장애물 여러개를 담는 배열
let jumping = false; // 점프조작
let jumplimit = false; // 중복점프방지
let animation;

// 캔버스 애니메이션 만들기(1초에 프레임만큼(대부분 60) 호출되게 해주는 함수 requestAnimationFrame)
function frame() {
    animation = requestAnimationFrame(frame);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 캔버스 비우기(잔상 제거/매번 지우고 그려진다.)
    moveBackground(); // 배경 이미지 이동
    drawBackground(); // 배경 이미지 그리기
    /* 장애물 스폰 후, 왼쪽으로 이동시키기
    (캐릭터를 이동하는 것이 아닌 장애물이 다가옴으로 움직이는 느낌을 준다.) */
    timer++; // 1초에 60번 ++된다. 즉 1초에 60까지 올라감
    if(timer % 120 === 0) { // 2초에 하나씩 장애물을 담는다.
        let object = new Object();
        objects.push(object);
    }
    // 담긴 장애물들 그리기
    objects.forEach((item, index, array) => {
        if(item.x < 0) {
            array.splice(index, 1); // item의 x좌표가 화면을 벗어나면 배열에서 삭제
        }
        item.x -= 5; // 하나의 item당 1초에 60번 --되면서 그려진다. 즉 1초에 1~60픽셀까지 왼쪽으로 이동 되는 것
        if(timer >= 600) {
            item.x -= 6 ;
        }
        // 충돌체크
        collision(character, item); // 모든 장애물에 대해 체크해야하기 때문에 반복문 안에
        item.draw(); //장애물 그리기
    })
    
    character.draw(); // 캐릭터 그리기
    changeImage();
    // 점프
    if(jumping) { // 점프할때 위로 이동
        character.y -= 10;
    }
    if(character.y <= 50) { // 캐릭터가 100위치에 가면 위로 이동 멈춤
        jumping = false;
    }
    if(!jumping) { // 점프상태 false일경우 아래 이동
        if(character.y <= 300) {
            character.y += 10;
        }
        if(character.y === 300) { // 캐릭터가 바닥에 닿으면 다시 점프가능
            jumplimit = false;
        }
    }
}
// 충돌확인
function collision(character, object) {
    let x축차이 = object.x - (character.x + character.width);
    let y축차이 = object.y - (character.y + character.height);
    if(x축차이 <= 0 && y축차이 <= 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animation);
        gameOver();
    }
}
// 게임 오버 함수
function gameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 지우기
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("GAME OVER!", canvas.width / 2 - 80, canvas.height / 2 - 15); // 게임 오버 메시지 표시
    createRestartButton(); // 재시작 버튼 생성
}

// 재시작 버튼 생성 함수
function createRestartButton() {
    let button = document.createElement("button");
    button.innerHTML = "재시작";
    button.style.position = "absolute";
    button.style.left = canvas.offsetLeft + (canvas.width / 2) + "px";
    button.style.top = canvas.offsetTop + (canvas.height / 2) + "px";
    button.addEventListener("click", function() {
        location.reload(); // 페이지 다시 로드하여 게임 재시작
    });
    document.body.appendChild(button);
}
// 점프 이벤트 리스너
document.addEventListener("keydown", (e) => {
    if(e.code === "Space" && !jumplimit) {
        jumping = true;
        jumplimit = true; // 점프중엔 다시 점프못하도록
    }
})
// 이미지 변경 함수
function changeImage() {
    if(timer % 30 === 0) {
        currentImageIndex = (currentImageIndex === 0) ? 1 : 0;
        characterImg.src = characterImgs[currentImageIndex];
    }
}
frame();

