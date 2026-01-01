/**
 * Coin simulation visualizations using ThreeJS and DOM.
 */
import * as THREE from "https://esm.sh/three@0.160.0";

const simGold = "#ffd700";
const simSilver = "#888888";

function createSimIcon(text, bgColor, textColor) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = textColor;
    ctx.font = "bold 80px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

const headTex = createSimIcon("H", simGold, simSilver);
const tailTex = createSimIcon("T", simSilver, simGold);
const edgeMatSetup = new THREE.MeshStandardMaterial({
    color: 0xb0b0b0,
    metalness: 0.8,
    roughness: 0.2,
});
const headMatSetup = new THREE.MeshStandardMaterial({
    map: headTex,
    metalness: 0.7,
    roughness: 0.3,
});
const tailMatSetup = new THREE.MeshStandardMaterial({
    map: tailTex,
    metalness: 0.6,
    roughness: 0.4,
});
const simCoinGeo = new THREE.CylinderGeometry(1, 1, 0.2, 32);

/**
 * Runs a 3D coin simulation in a line.
 */
export function runCoinSim(container, data, invalidation) {
    const width = container.clientWidth || 640;
    const height = 250;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const coins = [];
    const spacing = 2.5;

    data.forEach((face, i) => {
        const coin = new THREE.Mesh(simCoinGeo, [
            edgeMatSetup,
            headMatSetup,
            tailMatSetup,
        ]);

        const x = i * spacing;
        coin.position.set(x, 15, 0);
        coin.visible = false;

        const targetRotX = face === "Heads" ? 0 : Math.PI;

        coins.push({
            mesh: coin,
            targetY: 0.1,
            finalX: x,
            targetRotX: targetRotX,
            state: "waiting",
            rotVel: {
                x: Math.random() * 0.2,
                z: Math.random() * 0.2,
            },
        });
        scene.add(coin);
    });

    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    let activeIndex = 0;
    let isRunning = true;
    let nextDrop = 0;

    function animate(time) {
        if (!isRunning) return;

        if (activeIndex < coins.length && time > nextDrop) {
            coins[activeIndex].state = "falling";
            coins[activeIndex].mesh.visible = true;
            activeIndex++;
            nextDrop = time + 300;
        }

        coins.forEach((c) => {
            if (c.state === "falling") {
                c.mesh.position.y -= 0.5;
                c.mesh.rotation.x += c.rotVel.x;
                c.mesh.rotation.z += c.rotVel.z;

                if (c.mesh.position.y <= c.targetY) {
                    c.mesh.position.y = c.targetY;
                    c.state = "landed";
                    c.mesh.rotation.set(c.targetRotX, 0, 0);
                }
            }
        });

        const targetIndex = Math.max(0, activeIndex - 1);
        const targetX = targetIndex * spacing;
        const idealX = targetX;
        camera.position.x += (idealX - camera.position.x) * 0.05;
        camera.lookAt(camera.position.x, 0, 0);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    if (invalidation) {
        invalidation.then(() => {
            isRunning = false;
            renderer.dispose();
            scene.clear();
        });
    }
}

/**
 * Runs the initial 3D coin drop simulation in a grid.
 */
export function runGridSim(container, data, invalidation) {
    const width = container.clientWidth || 640;
    const height = 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const rolls = data.length;
    const colsAdjust = Math.ceil(Math.sqrt(rolls));
    const adaptiveZ = Math.max(15, colsAdjust * 2.5);
    camera.position.z = adaptiveZ;
    camera.position.y = adaptiveZ * 0.7;
    camera.lookAt(0, 0, 0);

    const coins = [];
    const spacing = 2.5;
    const cols = Math.ceil(Math.sqrt(rolls));
    const offset = ((cols - 1) * spacing) / 2;

    for (let i = 0; i < rolls; i++) {
        const isHeads = data[i] === "Heads";
        const coin = new THREE.Mesh(simCoinGeo, [
            edgeMatSetup,
            headMatSetup,
            tailMatSetup,
        ]);

        const gridX = (i % cols) * spacing - offset;
        const gridZ = Math.floor(i / cols) * spacing - offset;
        const jitterX = (Math.random() - 0.5) * 1;
        const jitterZ = (Math.random() - 0.5) * 1;

        const targetX = gridX + jitterX;
        const targetZ = gridZ + jitterZ;

        coin.position.set(targetX, 15 + Math.random() * 20, targetZ);
        coin.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        const velocity = -0.1 - Math.random() * 0.1;
        const rotationSpeed = {
            x: (Math.random() - 0.5) * 0.2,
            y: (Math.random() - 0.5) * 0.2,
            z: (Math.random() - 0.5) * 0.2,
        };

        scene.add(coin);
        coins.push({
            mesh: coin,
            vel: velocity,
            rot: rotationSpeed,
            landingY: 0.1,
            landed: false,
            targetRotX: isHeads ? 0 : Math.PI,
            targetRotZ: 0,
        });
    }

    let frame = 0;
    let isRunning = true;
    function animate() {
        if (!isRunning) return;
        frame++;
        let allLanded = true;
        coins.forEach((c) => {
            if (!c.landed) {
                c.mesh.position.y += c.vel;
                c.mesh.rotation.x += c.rot.x;
                c.mesh.rotation.y += c.rot.y;
                c.mesh.rotation.z += c.rot.z;

                if (c.mesh.position.y <= c.landingY) {
                    c.mesh.position.y = c.landingY;
                    c.mesh.rotation.set(c.targetRotX, 0, c.targetRotZ);
                    c.landed = true;
                } else {
                    allLanded = false;
                }
            }
        });

        renderer.render(scene, camera);
        if (!allLanded && frame < 1000) {
            requestAnimationFrame(animate);
        }
    }
    animate();

    if (invalidation) {
        invalidation.then(() => {
            isRunning = false;
            renderer.dispose();
            scene.clear();
        });
    }
}

/**
 * Creates a 2D coin image for shuffle simulations.
 */
export function createCoinImg(text, bg, fg) {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, 2 * Math.PI);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#b0b0b0";
    ctx.stroke();
    ctx.fillStyle = fg;
    ctx.font = "bold 36px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, size / 2);
    return canvas.toDataURL();
}

/**
 * Runs a 2D shuffle simulation.
 */
export function runShuffleSim(container, heads, tails, shuffles, width) {
    const height = 180;
    const gold = "#ffd700";
    const silver = "#888888";
    const imgH = createCoinImg("H", gold, silver);
    const imgT = createCoinImg("T", silver, gold);

    const coinSize = 40;
    const gap = 10;
    const totalCoins = heads + tails;
    const w = width || container.clientWidth || 600;
    const totalW = totalCoins * (coinSize + gap) - gap;
    const startX = Math.max(10, (w - totalW) / 2);

    let items = [];
    for (let i = 0; i < heads; i++) items.push({ type: "H", src: imgH });
    for (let i = 0; i < tails; i++) items.push({ type: "T", src: imgT });

    const els = items.map((item, i) => {
        const el = document.createElement("img");
        el.src = item.src;
        el.style.position = "absolute";
        el.style.width = coinSize + "px";
        el.style.height = coinSize + "px";
        el.style.top = (height - coinSize) / 2 + "px";
        el.style.left = startX + i * (coinSize + gap) + "px";
        container.appendChild(el);
        return {
            el,
            ...item,
            idx: i,
            currentLeft: startX + i * (coinSize + gap),
        };
    });

    (async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        await sleep(500);

        for (let k = 0; k < shuffles; k++) {
            if (!container.isConnected) break;

            const idx1 = Math.floor(Math.random() * els.length);
            let idx2 = Math.floor(Math.random() * els.length);
            while (idx1 === idx2 && els.length > 1) {
                idx2 = Math.floor(Math.random() * els.length);
            }

            if (idx1 !== idx2) {
                const iMin = Math.min(idx1, idx2);
                const iMax = Math.max(idx1, idx2);
                const el1 = els[iMin];
                const el2 = els[iMax];

                const startL1 = el1.currentLeft;
                const startL2 = el2.currentLeft;
                const dist = startL2 - startL1;

                const duration = 600;
                const startTime = performance.now();

                while (true) {
                    const now = performance.now();
                    let p = (now - startTime) / duration;
                    if (p > 1) p = 1;

                    const t = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
                    const arcH = 40;
                    const y1 = -Math.sin(t * Math.PI) * arcH;
                    const y2 = Math.sin(t * Math.PI) * arcH;

                    const curL1 = startL1 + dist * t;
                    const curL2 = startL2 - dist * t;

                    el1.el.style.left = curL1 + "px";
                    el1.el.style.transform = `translateY(${y1}px)`;
                    el2.el.style.left = curL2 + "px";
                    el2.el.style.transform = `translateY(${y2}px)`;

                    if (p === 1) break;
                    await new Promise((r) => requestAnimationFrame(r));
                }

                el1.currentLeft = startL2;
                el2.currentLeft = startL1;
                els[iMin] = el2;
                els[iMax] = el1;
                await sleep(200);
            }
        }
    })();
}
