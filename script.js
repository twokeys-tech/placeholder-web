const canvas = document.querySelector("#network");
const ctx = canvas.getContext("2d");
const cursor = document.createElement("div");

let width = 0;
let height = 0;
let animationFrame = 0;
let startTime = performance.now();

const pointer = {
  x: 0.5,
  y: 0.5,
};
const pointerTarget = {
  x: 0.5,
  y: 0.5,
};

cursor.className = "cursor-square";
cursor.setAttribute("aria-hidden", "true");
document.body.append(cursor);

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawWave(time, options) {
  const {
    offset,
    amplitude,
    frequency,
    speed,
    color,
    width: lineWidth,
    phase,
  } = options;

  ctx.beginPath();

  for (let x = -80; x <= width + 80; x += 16) {
    const progress = x / width;
    const drift = Math.sin(time * speed + progress * frequency + phase);
    const pulse = Math.sin(time * speed * 0.63 + progress * frequency * 1.7);
    const y =
      height * offset +
      drift * amplitude +
      pulse * amplitude * 0.38 +
      (pointer.y - 0.5) * 44;

    if (x === -80) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 28;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawPrism(time) {
  const centerX = width * (0.5 + (pointer.x - 0.5) * 0.08);
  const centerY = height * (0.5 + (pointer.y - 0.5) * 0.08);
  const maxRadius = Math.max(width, height) * 0.62;

  for (let i = 0; i < 9; i += 1) {
    const radius = maxRadius * (0.2 + i * 0.095 + Math.sin(time * 0.7 + i) * 0.012);
    const alpha = 0.08 - i * 0.006;
    const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.15, centerX, centerY, radius);

    gradient.addColorStop(0, `rgba(87, 216, 255, ${alpha})`);
    gradient.addColorStop(0.54, `rgba(255, 79, 135, ${alpha * 0.72})`);
    gradient.addColorStop(1, "rgba(5, 6, 9, 0)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      radius * 1.35,
      radius * 0.38,
      -0.28 + Math.sin(time * 0.18) * 0.08,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }
}

function draw(timestamp) {
  const time = (timestamp - startTime) / 1000;

  pointer.x += (pointerTarget.x - pointer.x) * 0.035;
  pointer.y += (pointerTarget.y - pointer.y) * 0.035;

  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "screen";

  drawPrism(time);
  drawWave(time, {
    offset: 0.33,
    amplitude: height * 0.09,
    frequency: 11,
    speed: 0.92,
    color: "rgba(87, 216, 255, 0.32)",
    width: 2.2,
    phase: 0,
  });
  drawWave(time, {
    offset: 0.58,
    amplitude: height * 0.12,
    frequency: 8,
    speed: -0.78,
    color: "rgba(255, 79, 135, 0.2)",
    width: 2.8,
    phase: 2.4,
  });
  drawWave(time, {
    offset: 0.48,
    amplitude: height * 0.075,
    frequency: 15,
    speed: 1.18,
    color: "rgba(185, 255, 102, 0.16)",
    width: 1.4,
    phase: 4.1,
  });

  ctx.globalCompositeOperation = "source-over";
  animationFrame = requestAnimationFrame(draw);
}

function start() {
  resize();
  startTime = performance.now();

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    draw(startTime);
  }
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointerTarget.x = event.clientX / width;
  pointerTarget.y = event.clientY / height;
  cursor.style.transform = `translate3d(${event.clientX - 25}px, ${event.clientY - 25}px, 0)`;
  cursor.style.opacity = "0.5";
});
window.addEventListener("pointerleave", () => {
  pointerTarget.x = 0.5;
  pointerTarget.y = 0.5;
  cursor.style.opacity = "0";
});
window.addEventListener("beforeunload", () => cancelAnimationFrame(animationFrame));

start();
