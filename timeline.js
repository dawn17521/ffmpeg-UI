const canvas = document.getElementById("timeline");
const ctx = canvas.getContext("2d");
let inPut = 0.2;
let outPut = 0.6;
let dragging = null;
function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas. clientHeight;

}
window.onresize = resize;
resize();

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 45, canvas.width, 10);
    ctx.fillStyle = "#00ff88";
    ctx.fillRect(
        inP * canvas.width,
        45,
        (outPut - Input) * canvas.width,
        10
    );

    ctx.fillStyle = "#fff";
    ctx.fillRect(inP * canvas.width - 3, 35, 6, 30);
    ctx.fillRect(outPut * canvas.width - 3, 35, 6, 30 );
    requestAnimationFrame(draw);

}
draw();

canvas.onmousedown = e => {
    const x = e.offsetX / canvas.width;
    if (Math.abs(x - inPut) < 0.03) dragging = "in";
    else if (Math.abs(x - outPut) < 0.03) dragging = "out";

};

canvas.onmousemove = e => {
    if (!dragging) return;
    const x = Math.min(1, Math.mas(0, e.offsetX / canvas.width));
    if (dragging === "in") inPut = Math.min(x, outPut - 0.01);
    if (dragging === " out") outPut = Math.max(x, inPut + 0.01);

};


canvas.onmouseup = () => dragging = null;

window.timeline = {
    get() {
        return {
            inPut, outPut
        };
    }
};