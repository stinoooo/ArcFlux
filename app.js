// app.js

// 1. UI Elements Mapping
const sliders = {
    spawnInterval: document.getElementById('spawn-interval'),
    spawnX: document.getElementById('spawn-x'),
    restitution: document.getElementById('restitution'),
    colorTolerance: document.getElementById('color-tolerance'),
    sMin: document.getElementById('s-min'),
    vMin: document.getElementById('v-min'),
    boxOpacity: document.getElementById('box-opacity')
};

const labels = {
    spawnInterval: document.getElementById('interval-val'),
    spawnX: document.getElementById('spawn-x-val'),
    restitution: document.getElementById('restitution-val'),
    colorTolerance: document.getElementById('color-tolerance-val'),
    sMin: document.getElementById('s-min-val'),
    vMin: document.getElementById('v-min-val'),
    boxOpacity: document.getElementById('box-opacity-val')
};

const targetColorPicker = document.getElementById('target-color');


const cameraSelect = document.getElementById('camera-select');
const startBtn = document.getElementById('start-btn');
const toggleBgBtn = document.getElementById('toggle-bg-btn');
const clearBtn = document.getElementById('clear-balls');
const statusMsg = document.getElementById('status-msg');
const uiPanel = document.getElementById('ui-panel');
const videoBgContainer = document.getElementById('video-bg-container');

// Update labels on input
Object.keys(sliders).forEach(key => {
    sliders[key].addEventListener('input', (e) => {
        labels[key].textContent = e.target.value;
    });
});

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h') {
        uiPanel.style.display = uiPanel.style.display === 'none' ? 'block' : 'none';
    }
});

toggleBgBtn.addEventListener('click', () => {
    videoBgContainer.style.display = videoBgContainer.style.display === 'none' ? 'block' : 'none';
});

// Wait for OpenCV.js
let cvReady = false;
window.onOpenCvReady = function () {
    cvReady = true;
    statusMsg.textContent = "OpenCV Ready! Waiting to start...";
    console.log('OpenCV.js is ready.');
};

// 2. Matter.js Initialization
const { Engine, Render, Runner, World, Bodies, Composite, Events } = Matter;

const engine = Engine.create();
const world = engine.world;

const render = Render.create({
    element: document.getElementById('canvas-container'),
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
    }
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// 3. Environment boundaries (floor & walls)
let walls = [];
function createBoundaries() {
    if (walls.length > 0) Composite.remove(world, walls);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const thickness = 100;

    // Left, Right (Removed Bottom wall so balls fall through)
    walls = [
        Bodies.rectangle(0 - thickness / 2, h / 2, thickness, h * 2, { isStatic: true }),
        Bodies.rectangle(w + thickness / 2, h / 2, thickness, h * 2, { isStatic: true })
    ];
    Composite.add(world, walls);
}
createBoundaries();

// Handle window resize
window.addEventListener('resize', () => {
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
    createBoundaries();
});

// 4. Webcam Setup & OpenCV Processing Loop
const video = document.getElementById('webcam');
const hiddenCanvas = document.getElementById('hidden-canvas');
const ctx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
const videoBgCanvas = document.getElementById('video-bg');
const bgCtx = videoBgCanvas.getContext('2d');

let webcamActive = false;
let procCols = 640;
let procRows = 480;

startBtn.addEventListener('click', async () => {
    if (webcamActive) return;
    if (!cvReady) {
        alert("Please wait for OpenCV to load.");
        return;
    }

    try {
        statusMsg.textContent = "Requesting webcam access...";
        let constraints = { video: { width: { ideal: 1280 }, height: { ideal: 720 } } };

        if (cameraSelect.value) {
            constraints.video.deviceId = { exact: cameraSelect.value };
        } else {
            constraints.video.facingMode = 'user';
        }

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (e1) {
            console.warn("First camera request failed, trying fallback...", e1);
            // Fallback to any available video without specific constraints
            constraints = { video: cameraSelect.value ? { deviceId: { exact: cameraSelect.value } } : true };
            stream = await navigator.mediaDevices.getUserMedia(constraints);
        }

        video.srcObject = stream;
        video.play();

        // Populate camera selector if not already populated
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (cameraSelect.options.length <= 1) {
            cameraSelect.innerHTML = ''; // clear default
            videoDevices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${index + 1}`;
                if (stream.getVideoTracks()[0].label === device.label) {
                    option.selected = true; // highlight currently used
                }
                cameraSelect.appendChild(option);
            });
        }

        video.onloadedmetadata = () => {
            // Keep aspect ratio for processing
            let aspect = video.videoWidth / video.videoHeight;
            procRows = 400; // lower res for faster cv processing
            procCols = Math.floor(procRows * aspect);

            hiddenCanvas.width = procCols;
            hiddenCanvas.height = procRows;

            // Background canvas matches screen size
            videoBgCanvas.width = window.innerWidth;
            videoBgCanvas.height = window.innerHeight;

            if (!webcamActive) {
                webcamActive = true;
                statusMsg.textContent = "Webcam active. Reading pink regions...";
                startProcessingLoop();
                startSpawner();
                startBtn.textContent = "Running Simulation";
                startBtn.style.opacity = 0.5;
            }
        };
    } catch (err) {
        statusMsg.textContent = "Error: " + err.message;
        console.error("Webcam error:", err);
    }
});

// Change camera handle
cameraSelect.addEventListener('change', () => {
    if (webcamActive) {
        // Stop current stream tracks
        const stream = video.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        // simulate click to restart with new settings
        webcamActive = false;
        startBtn.textContent = 'Restarting...';
        startBtn.click();
    }
});

cameraSelect.addEventListener('focus', async () => {
    // Attempt to load device list before starting stream if not populated
    if (cameraSelect.options.length <= 1) {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            cameraSelect.innerHTML = '';
            videoDevices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${index + 1}`;
                cameraSelect.appendChild(option);
            });
        } catch (e) {
            console.error("Could not enumerate devices ahead of time", e);
        }
    }
});

// Try to aggressively get device IDs on load
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        if (videoDevices.length > 0) {
            cameraSelect.innerHTML = '';
            videoDevices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.text = device.label || `Camera ${index + 1}`;
                cameraSelect.appendChild(option);
            });
        }
    } catch(e) {}
});

const toggleCalibBtn = document.getElementById('toggle-calibration-btn');

let isCalibrating = false;
let calibPts = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}]; // Proportions (0..1) = TL, TR, BR, BL
let draggedPt = -1;

let calibWindow = null;
let calibCanvasRemote = null;
let calibCtxRemote = null;

if (toggleCalibBtn) {
    toggleCalibBtn.addEventListener('click', () => {
        if(!webcamActive) { alert("Please Start Webcam first"); return; }
        
        if(isCalibrating) {
            isCalibrating = false;
            document.body.style.border = 'none';
            if(calibWindow) calibWindow.close();
            return;
        }

        isCalibrating = true;
        // White border on main canvas for easy mapping tracking!
        document.body.style.border = '10px solid white';
        document.body.style.boxSizing = 'border-box';
        
        calibWindow = window.open('', 'CornerPinMapping', 'width=800,height=600');
        if (!calibWindow) {
            alert("Popup blocked! Please allow popups for this site to open mapping window.");
            isCalibrating = false;
            document.body.style.border = 'none';
            return;
        }
        
        calibWindow.document.write(`
            <html><head><title>Corner Pin Mapping</title>
            <style>
                body { margin:0; background:#222; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; overflow:hidden;}
                h3 { color:white; font-family:sans-serif; margin-bottom:10px;}
            </style>
            </head>
            <body>
                <h3>Drag cyan corners to map projector area</h3>
                <canvas id="RemoteCalibCanvas" style="border:1px solid #444; background:#000; cursor:crosshair;"></canvas>
            </body></html>
        `);
        calibWindow.document.close();
        
        calibCanvasRemote = calibWindow.document.getElementById('RemoteCalibCanvas');
        calibCtxRemote = calibCanvasRemote.getContext('2d');
        
        calibCanvasRemote.addEventListener('mousedown', (e) => {
            const rect = calibCanvasRemote.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            for(let i=0; i<4; i++) {
                let px = calibPts[i].x * calibCanvasRemote.width;
                let py = calibPts[i].y * calibCanvasRemote.height;
                if(Math.hypot(mx - px, my - py) < 30) {
                    draggedPt = i;
                    break;
                }
            }
        });
        
        calibWindow.addEventListener('mousemove', (e) => {
            if(draggedPt !== -1 && calibCanvasRemote) {
                const rect = calibCanvasRemote.getBoundingClientRect();
                calibPts[draggedPt].x = Math.max(0, Math.min(1, (e.clientX - rect.left) / calibCanvasRemote.width));
                calibPts[draggedPt].y = Math.max(0, Math.min(1, (e.clientY - rect.top) / calibCanvasRemote.height));
            }
        });
        
        calibWindow.addEventListener('mouseup', () => { draggedPt = -1; });
        
        calibWindow.addEventListener('beforeunload', () => {
            isCalibrating = false;
            document.body.style.border = 'none';
            calibWindow = null;
            calibCanvasRemote = null;
            calibCtxRemote = null;
        });
    });
}

let webcamBodies = [];

function startProcessingLoop() {
    // OpenCV Mats
    let src = new cv.Mat(procRows, procCols, cv.CV_8UC4);
    let hsv = new cv.Mat();
    let mask = new cv.Mat();
    let hierarchy = new cv.Mat();

    function processFrame() {
        if (!webcamActive) return;

        let rotateNode = document.getElementById('cam-rotate');
        let angle = rotateNode ? parseInt(rotateNode.value) : 0;
        let isRotated90 = (Math.abs(angle) === 90);

        let destW = window.innerWidth;
        let destH = window.innerHeight;
        let destAsp = destW / destH;

        if (destAsp > 1) {
            procCols = 400;
            procRows = Math.floor(400 / destAsp);
        } else {
            procRows = 400;
            procCols = Math.floor(400 * destAsp);
        }

        if (hiddenCanvas.width !== procCols) hiddenCanvas.width = procCols;
        if (hiddenCanvas.height !== procRows) hiddenCanvas.height = procRows;

        if (src.cols !== procCols || src.rows !== procRows) {
            src.delete();
            src = new cv.Mat(procRows, procCols, cv.CV_8UC4);
        }

        let vW = video.videoWidth;
        let vH = video.videoHeight;
        
        function drawVideoCoverRotated(targetCtx, tW, tH) {
            targetCtx.save();
            targetCtx.translate(tW / 2, tH / 2);
            
            let flipNode = document.getElementById('cam-flip');
            let isFlipped = flipNode ? flipNode.checked : true;
            if (isFlipped) {
                targetCtx.scale(-1, 1); // Mirror
            }
            
            let drawW = tW; 
            let drawH = tH;
            let targetAsp = tW / tH;

            if (isRotated90) {
                targetCtx.rotate(angle * Math.PI / 180);
                targetAsp = tH / tW;
                drawW = tH;
                drawH = tW;
            } else if (angle === 180) {
                targetCtx.rotate(angle * Math.PI / 180);
            }

            let srcAsp = vW / vH;
            let sWidth = vW;
            let sHeight = vH;
            
            if (vH > 0 && vW > 0) {
                if (srcAsp > targetAsp) {
                    sWidth = vH * targetAsp;
                } else {
                    sHeight = vW / targetAsp;
                }
            }
            
            let sX = (vW - sWidth) / 2;
            let sY = (vH - sHeight) / 2;

            targetCtx.drawImage(video, sX, sY, sWidth, sHeight, -drawW / 2, -drawH / 2, drawW, drawH);
            targetCtx.restore();
        }

        if (isCalibrating && calibCtxRemote) {
            calibCanvasRemote.width = procCols * 2;
            calibCanvasRemote.height = procRows * 2;
            drawVideoCoverRotated(calibCtxRemote, calibCanvasRemote.width, calibCanvasRemote.height);
            
            calibCtxRemote.strokeStyle = 'cyan';
            calibCtxRemote.lineWidth = 2;
            calibCtxRemote.beginPath();
            for(let i=0; i<4; i++) {
                let px = calibPts[i].x * calibCanvasRemote.width;
                let py = calibPts[i].y * calibCanvasRemote.height;
                if(i===0) calibCtxRemote.moveTo(px,py); else calibCtxRemote.lineTo(px,py);
            }
            calibCtxRemote.closePath();
            calibCtxRemote.stroke();

            for(let i=0; i<4; i++) {
                let px = calibPts[i].x * calibCanvasRemote.width;
                let py = calibPts[i].y * calibCanvasRemote.height;
                calibCtxRemote.fillStyle = draggedPt === i ? 'red' : 'yellow';
                calibCtxRemote.beginPath();
                calibCtxRemote.arc(px,py,10,0,Math.PI*2);
                calibCtxRemote.fill();
            }
        }

        // 1. Draw to hidden canvas for OpenCV (lower res)
        drawVideoCoverRotated(ctx, procCols, procRows);

        // 2. Read image data into OpenCV mat
        let imageData = ctx.getImageData(0, 0, procCols, procRows);
        src.data.set(imageData.data);

        // 3. Apply Corner Pin Warp (Perspective Transform)
        let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            calibPts[0].x * procCols, calibPts[0].y * procRows,
            calibPts[1].x * procCols, calibPts[1].y * procRows,
            calibPts[2].x * procCols, calibPts[2].y * procRows,
            calibPts[3].x * procCols, calibPts[3].y * procRows
        ]);
        let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            procCols, 0,
            procCols, procRows,
            0, procRows
        ]);
        let MMatrix = cv.getPerspectiveTransform(srcTri, dstTri);
        cv.warpPerspective(src, src, MMatrix, new cv.Size(procCols, procRows));

        // 4. Overwrite video background with warped perspective directly from matched OpenCV Mat
        cv.imshow('video-bg', src);
        videoBgCanvas.style.width = '100vw'; // Stretch to screen bounds
        videoBgCanvas.style.height = '100vh';

        srcTri.delete(); dstTri.delete(); MMatrix.delete();

        // Convert to HSV
        cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
        cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

        // Convert RGB Hex to OpenCV HSV Space helper function
        function hexToOpencvHsv(hex) {
            let r = parseInt(hex.substring(1,3), 16) / 255;
            let g = parseInt(hex.substring(3,5), 16) / 255;
            let b = parseInt(hex.substring(5,7), 16) / 255;
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, v = max;
            let d = max - min;
            s = max === 0 ? 0 : d / max;
            if (max === min) {
                h = 0; // achromatic
            } else {
                switch(max){
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return {
                h: Math.round(h * 180), // OpenCV Hue is 0-179
                s: Math.round(s * 255),
                v: Math.round(v * 255)
            };
        }

        // Get threshold values
        let targetHex = targetColorPicker ? targetColorPicker.value : "#ff1493";
        let targetHsv = hexToOpencvHsv(targetHex);
        let tolerance = parseInt(sliders.colorTolerance.value);

        let hMin = (targetHsv.h - tolerance) % 180;
        if (hMin < 0) hMin += 180;
        let hMax = (targetHsv.h + tolerance) % 180;
        if (hMax < 0) hMax += 180;

        let sMin = parseInt(sliders.sMin.value);
        let vMin = parseInt(sliders.vMin.value);

        // Handle Hue Wrap Around (OpenCV Hue is 0-179)
        if (hMin <= hMax) {
            let low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [hMin, sMin, vMin, 0]);
            let high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [hMax, 255, 255, 0]);
            cv.inRange(hsv, low, high, mask);
            low.delete(); high.delete();
        } else {
            // If wrapping, we need two masks
            let mask1 = new cv.Mat();
            let mask2 = new cv.Mat();
            let low1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [hMin, sMin, vMin, 0]);
            let high1 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [179, 255, 255, 0]);
            cv.inRange(hsv, low1, high1, mask1);

            let low2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [0, sMin, vMin, 0]);
            let high2 = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), [hMax, 255, 255, 0]);
            cv.inRange(hsv, low2, high2, mask2);

            cv.bitwise_or(mask1, mask2, mask);
            mask1.delete(); mask2.delete(); low1.delete(); high1.delete(); low2.delete(); high2.delete();
        }

        // Clean up noise
        let M = cv.Mat.ones(5, 5, cv.CV_8U);
        cv.erode(mask, mask, M, new cv.Point(-1, -1), 1);
        cv.dilate(mask, mask, M, new cv.Point(-1, -1), 1);
        M.delete();

        // Find Contours
        let contours = new cv.MatVector();
        cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        let scaleX = window.innerWidth / procCols;
        let scaleY = window.innerHeight / procRows;

        let alpha = parseInt(sliders.boxOpacity.value) / 100;
        
        let newWebcamBodies = [];
        let unmatchedOldBodies = [...webcamBodies];

        // Process each contour
        for (let i = 0; i < contours.size(); ++i) {
            let cnt = contours.get(i);
            let area = cv.contourArea(cnt);

            // Ignore tiny noise
            if (area > 500) {
                let rotatedRect = cv.minAreaRect(cnt);

                // OpenCV angle is clockwise in degrees, Matter.js is radians
                let width = rotatedRect.size.width * scaleX;
                let height = rotatedRect.size.height * scaleY;
                let cx = rotatedRect.center.x * scaleX;
                let cy = rotatedRect.center.y * scaleY;
                let angle = rotatedRect.angle * (Math.PI / 180);

                // Find closest existing body
                let closestIdx = -1;
                let minDistSq = Infinity;
                
                for (let j = 0; j < unmatchedOldBodies.length; j++) {
                    let oldBody = unmatchedOldBodies[j];
                    let dx = oldBody.position.x - cx;
                    let dy = oldBody.position.y - cy;
                    let distSq = dx * dx + dy * dy;
                    if (distSq < minDistSq) {
                        minDistSq = distSq;
                        closestIdx = j;
                    }
                }

                // Check if the jitter-fix toggle is enabled
                let jitterFixToggle = document.getElementById('jitter-fix');
                let isJitterFixOn = jitterFixToggle ? jitterFixToggle.checked : true;

                // Threshold for jitter (distance in pixels squared). 60 pixels radius.
                // If it's a tiny move, keep the old completely identical body setup.
                if (isJitterFixOn && closestIdx !== -1 && minDistSq < 3600) {
                    let oldBody = unmatchedOldBodies[closestIdx];
                    newWebcamBodies.push(oldBody);
                    // Remove from matching pool
                    unmatchedOldBodies.splice(closestIdx, 1);
                } else {
                    // Create NEW Matter.js body because difference is big enough
                    let body = Bodies.rectangle(cx, cy, width, height, {
                        isStatic: true,
                        angle: angle,
                        render: {
                            fillStyle: `rgba(255, 255, 255, ${alpha * 0.3})`,
                            strokeStyle: `rgba(255, 255, 255, ${alpha})`,
                            lineWidth: 3
                        }
                    });
                    newWebcamBodies.push(body);
                    Composite.add(world, body);
                }
            }
            cnt.delete();
        }

        // Clean up any bodies from last frame that were not matched (they disappeared or moved too far)
        if (unmatchedOldBodies.length > 0) {
            Composite.remove(world, unmatchedOldBodies);
        }
        
        webcamBodies = newWebcamBodies;

        contours.delete();

        // Delay next frame slightly to save CPU
        setTimeout(() => { requestAnimationFrame(processFrame); }, 1000 / 30);
    }

    // Start loop
    processFrame();
}

// 5. Ball Spawner
let balls = [];
let lastSpawnTime = 0;

function getIntersection(A, B, C, D) {
    const denom = (A.x - B.x) * (C.y - D.y) - (A.y - B.y) * (C.x - D.x);
    if (denom === 0) return null;

    const t = ((A.x - C.x) * (C.y - D.y) - (A.y - C.y) * (C.x - D.x)) / denom;
    const u = -((A.x - B.x) * (A.y - C.y) - (A.y - B.y) * (A.x - C.x)) / denom;

    if (t > 0.0001 && t <= 1.0001 && u >= 0 && u <= 1) {
        return {
            x: A.x + t * (B.x - A.x),
            y: A.y + t * (B.y - A.y),
            t: t,
            // edge normal calculation (unnormalized)
            nx: D.y - C.y,
            ny: C.x - D.x
        };
    }
    return null;
}

function startSpawner() {
    Events.on(engine, 'beforeUpdate', () => {
        const mode = document.getElementById('spawn-mode').value;
        const now = Date.now();
        const interval = parseInt(sliders.spawnInterval.value);

        if (mode === 'balls') {
            if (now - lastSpawnTime > interval) {
                spawnBall();
                lastSpawnTime = now;
            }
        }

        // Cleanup fallen balls
        balls = balls.filter(ball => {
            if (ball.position.y > window.innerHeight + 20) {
                Composite.remove(world, ball);
                return false;
            }
            return true;
        });
    });

    Events.on(render, 'afterRender', () => {
        const mode = document.getElementById('spawn-mode').value;
        if (mode !== 'laser') return;

        const ctx = render.context;
        const xPct = parseInt(sliders.spawnX.value) / 100;
        const startX = window.innerWidth * xPct;
        const startY = 0;

        let start = { x: startX, y: startY };
        let dir = { x: 0, y: 1 };
        let bounces = 0;
        const maxBounces = 20;
        const maxDist = 3000;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.strokeStyle = '#00FF00'; // Green Laser
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00FF00';

        while (bounces < maxBounces) {
            let end = { x: start.x + dir.x * maxDist, y: start.y + dir.y * maxDist };
            let closestHit = null;

            const allBodies = Composite.allBodies(world);
            for (let body of allBodies) {
                if (!body.isStatic) continue; // Only bounce off walls and webcam blocks

                for (let i = 0; i < body.vertices.length; i++) {
                    let v1 = body.vertices[i];
                    let v2 = body.vertices[(i + 1) % body.vertices.length];
                    let hit = getIntersection(start, end, v1, v2);
                    if (hit) {
                        if (!closestHit || hit.t < closestHit.t) {
                            closestHit = hit;
                        }
                    }
                }
            }

            if (closestHit) {
                ctx.lineTo(closestHit.x, closestHit.y);
                start = { x: closestHit.x, y: closestHit.y };

                // Normalize normal
                let len = Math.sqrt(closestHit.nx * closestHit.nx + closestHit.ny * closestHit.ny);
                let nx = closestHit.nx / len;
                let ny = closestHit.ny / len;

                // Ensure the normal faces the incoming ray
                if (dir.x * nx + dir.y * ny > 0) {
                    nx = -nx;
                    ny = -ny;
                }

                // Reflection calculation: r = d - 2(d.n)n
                let dot = dir.x * nx + dir.y * ny;
                dir.x = dir.x - 2 * dot * nx;
                dir.y = dir.y - 2 * dot * ny;

                bounces++;
            } else {
                ctx.lineTo(end.x, end.y);
                break;
            }
        }

        ctx.stroke();

        // Reset context state so we don't bleed into matter.js renderer
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    });
}

function spawnBall() {
    const xPct = parseInt(sliders.spawnX.value) / 100;
    const xPos = window.innerWidth * xPct;
    const rest = parseFloat(sliders.restitution.value);

    const radius = 25; // Constant radius
    const jitter = (Math.random() - 0.5) * 50;

    const ball = Bodies.circle(xPos + jitter, -30, radius, {
        restitution: rest,
        friction: 0.05,
        render: {
            fillStyle: '#ffffffad', // Red
            lineWidth: 0
        }
    });

    balls.push(ball);
    Composite.add(world, ball);
}

clearBtn.addEventListener('click', () => {
    balls.forEach(b => Composite.remove(world, b));
    balls = [];
});

// Popout UI Logic
const popoutUiBtn = document.getElementById('popout-ui-btn');
let uiWindow = null;

if (popoutUiBtn) {
    popoutUiBtn.addEventListener('click', () => {
        const uiPanel = document.getElementById('ui-panel');
        // Hide local UI
        uiPanel.style.display = 'none';

        uiWindow = window.open('', 'PhysicsControls', 'width=450,height=850');
        if (!uiWindow) {
            alert('Popup blocked! Allow popups to use the separate controls window.');
            uiPanel.style.display = 'block';
            return;
        }

        // Clone UI HTML, but remove the popout button itself from the clone
        let clone = uiPanel.cloneNode(true);
        let cloneBtn = clone.querySelector('#popout-ui-btn');
        if (cloneBtn) cloneBtn.remove();
        
        let uiHtml = clone.innerHTML;

        uiWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Physics Controls</title>
                <style>
                    body {
                        font-family: 'Inter', sans-serif, system-ui;
                        background: #000;
                        color: #fff;
                        padding: 30px;
                        margin: 0;
                        box-sizing: border-box;
                    }
                    h2 {
                        color: #fff;
                        font-size: 1.2rem;
                        border-bottom: 2px solid #333;
                        padding-bottom: 8px;
                        margin-top: 0;
                        margin-bottom: 20px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    .control-group {
                        margin-bottom: 20px;
                    }
                    label {
                        display: block;
                        font-size: 0.9rem;
                        color: #ccc;
                        margin-bottom: 8px;
                    }
                    span { font-weight: bold; color: #fff; }
                    input[type=range] {
                        width: 100%;
                        cursor: pointer;
                        margin-bottom: 5px;
                    }
                    select, button {
                        width: 100%;
                        padding: 10px;
                        background: #222;
                        color: #fff;
                        border: 1px solid #555;
                        border-radius: 4px;
                        margin-top: 5px;
                        cursor: pointer;
                        font-size: 1rem;
                    }
                    select:focus, button:focus { outline: none; border-color: #888; }
                    button:hover { background: #333; }
                    input[type=checkbox] { cursor: pointer; transform: scale(1.2); }
                    .status { color: #888; text-align: center; margin-top: 20px; font-size: 0.9rem; }
                </style>
            </head>
            <body>
                <div id="remote-ui">${uiHtml}</div>
            </body>
            </html>
        `);
        uiWindow.document.close();

        // Data Synchronization (Remote -> Local)
        // For sliders and text inputs
        uiWindow.document.addEventListener('input', (e) => {
            if (e.target.id) {
                let localEl = document.getElementById(e.target.id);
                if (localEl) {
                    if (e.target.type === 'checkbox') {
                        localEl.checked = e.target.checked;
                    } else {
                        localEl.value = e.target.value;
                    }
                    localEl.dispatchEvent(new Event('input', { bubbles: true }));
                }
                
                // Sync text labels back to the popup visually
                setTimeout(() => {
                    const labelIds = ['interval-val', 'spawn-x-val', 'restitution-val', 'color-tolerance-val', 's-min-val', 'v-min-val', 'box-opacity-val'];
                    labelIds.forEach(id => {
                        let lSpan = document.getElementById(id);
                        let rSpan = uiWindow.document.getElementById(id);
                        if (lSpan && rSpan) rSpan.textContent = lSpan.textContent;
                    });
                }, 10);
            }
        });

        // For dropdowns and checkboxes
        uiWindow.document.addEventListener('change', (e) => {
            if (e.target.id) {
                let localEl = document.getElementById(e.target.id);
                if (localEl) {
                    if (e.target.type === 'checkbox') {
                        localEl.checked = e.target.checked;
                    } else {
                        localEl.value = e.target.value;
                    }
                    localEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });

        // For buttons
        uiWindow.document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.id) {
                let localEl = document.getElementById(e.target.id);
                if (localEl) localEl.click();
            }
        });

        // Handle popup close
        uiWindow.addEventListener('beforeunload', () => {
            uiPanel.style.display = 'block';
            uiWindow = null;
        });
    });
}
