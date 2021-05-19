const dropZone = document.getElementById('drop-zone');
const inputFile = document.getElementById('input-file');
const exitArea = document.querySelector('.exit-area');
const video = document.getElementById('video');
const currentTime = document.getElementById('current-time');
const form = document.getElementById('form');
const button = document.getElementById('button');
const progress = document.getElementById('progress');
const canvas = document.getElementById('canvas');
const gifImg = document.getElementById('gif');
const download = document.getElementById('download')

const copyVideo = document.createElement('video');
//copyVideo.muted = true
let player

const dragover = (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
}

const dragleave = (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
}

const uploadDropZone = (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 1) {
        alert('ファイルを一つだけアップロードして下さい');
        return
    } else if (!e.dataTransfer.files[0].type.match(/video\/*/)) {
        alert('動画をアップロードして下さい');
        return
    }

    const droppedFile = e.dataTransfer.files[0];
    video.addEventListener('loadedmetadata', event => {
        console.log(video.videoWidth, video.videoHeight)
    })
    video.src = URL.createObjectURL(droppedFile);
    copyVideo.src = URL.createObjectURL(droppedFile);
    video.classList.remove('none');
    exitArea.classList.remove('none');
    reset('input')
}

const uploadInput = () => {
    const file = inputFile.files[0];
    video.src = URL.createObjectURL(file);
    copyVideo.src = URL.createObjectURL(file);
    video.classList.remove('none');
    exitArea.classList.remove('none');
    video.addEventListener('loadedmetadata', event => {
        console.log(video.duration)
    })
    reset('input')
}

const timeUpdate = () => {
    currentTime.innerText = `現在の再生時間：${video.currentTime.toFixed(1)}秒`
}

const createGIF = () => {
    if (parseInt(form.start_time.value) >= parseInt(form.end_time.value)) {
        alert('開始時間は終了時間より前に指定してください')
        return
    } else if (form.start_time.value === "" || form.end_time.value === "") {
        alert('開始時間または終了時間を指定してください')
        return
    }
    //gifの設定
    const gif = new GIF({
        workers: 2,
        quality: 10,
        width: video.clientWidth,
        height: video.clientHeight

    });
    copyVideo.currentTime = form.start_time.value;
    copyVideo.play();
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    reset()
    progress.innerText = "GIFを作成中です"
    gif.on('progress', p => progress.innerText = Math.round(p * 100) + '%')
    player = setInterval(() => {
        if (copyVideo.currentTime >= parseInt(form.end_time.value)) {
            clearInterval(player);
            copyVideo.pause();
            gif.on('finished', blob => {
                progress.classList.add('none');
                gifImg.src = URL.createObjectURL(blob);
                download.href = URL.createObjectURL(blob);
                download.download = "create-Gif"
                download.classList.remove('none');
            });
            gif.render();
        }
        canvas.getContext("2d").drawImage(copyVideo, 0, 0, video.clientWidth, video.clientHeight);
        gif.addFrame(canvas.getContext('2d'), { copy: true, delay: 20 });
    }, 1000 / 30);
}

const reset = (string) => {

    gifImg.removeAttribute('src')
    download.classList.add('none');
    progress.classList.remove('none');
    progress.innerText = ""

    if (string === "input") {
        form.start_time.value = ""
        form.end_time.value = ""
    }

}


dropZone.addEventListener('dragover', dragover);
dropZone.addEventListener('dragleave', dragleave);
dropZone.addEventListener('drop', uploadDropZone);
inputFile.addEventListener('change', uploadInput);
video.addEventListener('timeupdate', timeUpdate);
button.addEventListener('click', createGIF);