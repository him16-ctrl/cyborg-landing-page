/* Cybernetix Interactive Engine & Web Audio Sound System */

// --- Web Audio API Sound Synthesizer ---
let audioCtx = null;
let audioEnabled = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(type) {
    if (!audioEnabled || !audioCtx) return;
    
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;
        
        if (type === 'beep') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
        } else if (type === 'click') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.setValueAtTime(600, now + 0.03);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.06);
        } else if (type === 'success') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(880, now + 0.1);
            osc.frequency.setValueAtTime(1320, now + 0.2);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    } catch (e) {
        console.log('Audio playback error:', e);
    }
}

const audioToggle = document.getElementById('audioToggle');
const audioStatus = document.getElementById('audioStatus');

audioToggle.addEventListener('click', () => {
    initAudio();
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
        audioStatus.textContent = 'AUDIO: ON';
        audioToggle.style.borderColor = 'var(--green)';
        audioToggle.style.color = 'var(--green)';
        playSound('success');
    } else {
        audioStatus.textContent = 'AUDIO: OFF';
        audioToggle.style.borderColor = 'var(--cyan)';
        audioToggle.style.color = 'var(--cyan)';
    }
});


// --- Particle Canvas Background ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const particles = [];
const particleCount = Math.min(window.innerWidth / 15, 75);

for (let i = 0; i < particleCount; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 1.5 + 0.5
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';

    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
            let p2 = particles[j];
            let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();


// --- Waveform Canvas (ECG / Neural Sync) ---
const waveCanvas = document.getElementById('waveformCanvas');
const waveCtx = waveCanvas.getContext('2d');

function resizeWaveCanvas() {
    waveCanvas.width = waveCanvas.parentElement.clientWidth - 40;
    waveCanvas.height = 220;
}
window.addEventListener('resize', resizeWaveCanvas);
resizeWaveCanvas();

let waveOffset = 0;

function drawWaveform() {
    waveCtx.fillStyle = 'rgba(3, 7, 18, 0.3)';
    waveCtx.fillRect(0, 0, waveCanvas.width, waveCanvas.height);

    waveCtx.lineWidth = 2;
    waveCtx.strokeStyle = '#00f0ff';
    waveCtx.shadowBlur = 10;
    waveCtx.shadowColor = '#00f0ff';

    waveCtx.beginPath();
    let sliceWidth = waveCanvas.width / 150;
    let x = 0;

    for (let i = 0; i < 150; i++) {
        let v = Math.sin((i + waveOffset) * 0.1);
        // Add ECG spike pattern
        if (i % 30 === 0) {
            v -= 3.5;
        } else if (i % 30 === 2) {
            v += 4.5;
        } else if (i % 30 === 4) {
            v -= 2.0;
        }

        let y = (waveCanvas.height / 2) + (v * 25);

        if (i === 0) {
            waveCtx.moveTo(x, y);
        } else {
            waveCtx.lineTo(x, y);
        }
        x += sliceWidth;
    }

    waveCtx.stroke();
    waveOffset += 1.5;
    requestAnimationFrame(drawWaveform);
}
drawWaveform();


// --- Cybernetic Configurator Interactive State ---
const selectedConfig = {
    neural: { name: 'Synapse-X Standard', cost: 12400, sync: 94 },
    ocular: { name: 'Viper-Vision Mk.IV', cost: 8500, sync: 92 },
    chassis: { name: 'Carbon-Fiber Weave', cost: 19000, sync: 95 }
};

const optButtons = document.querySelectorAll('.opt-btn');
const summaryCost = document.getElementById('summaryCost');
const summarySync = document.getElementById('summarySync');

optButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        playSound('click');
        const category = btn.getAttribute('data-category');
        const name = btn.getAttribute('data-name');
        const cost = parseInt(btn.getAttribute('data-cost'));
        const sync = parseFloat(btn.getAttribute('data-sync'));

        // Update active state in grid
        document.querySelectorAll(`.opt-btn[data-category="${category}"]`).forEach(b => {
            b.classList.remove('active');
        });
        btn.classList.add('active');

        // Update config state
        selectedConfig[category] = { name, cost, sync };
        updateConfigSummary();
    });
});

function updateConfigSummary() {
    const totalCost = selectedConfig.neural.cost + selectedConfig.ocular.cost + selectedConfig.chassis.cost;
    const avgSync = ((selectedConfig.neural.sync + selectedConfig.ocular.sync + selectedConfig.chassis.sync) / 3).toFixed(1);

    summaryCost.textContent = '$' + totalCost.toLocaleString();
    summarySync.textContent = avgSync + '%';
}


// --- Matrix Modals ---
const modalData = {
    neural: {
        title: "NEURAL SYNCHRONIZATION // CORTICAL CORE",
        text: "The Neural Core establishes a direct quantum link with the parietal and frontal lobes. Operating at 120GHz clock speed, it bypasses biological neural propagation delays, reducing response latency to 0.12ms. Integrated firewall safeguards against unauthorized neural hacking or remote override attempts."
    },
    ocular: {
        title: "ENHANCED OCULAR SUITE // MULTI-SPECTRUM",
        text: "Replaces organic crystalline lenses with quantum-resolution optical receptors. Features real-time optical zoom up to 40x, thermographic heat signature overlay, ultraviolet tracking, and automated biometric target scanning with integrated HUD compass and telemetry tracking."
    },
    chassis: {
        title: "EXOSKELETAL FRAMEWORK // TITANIUM-GRAPHENE",
        text: "Sub-dermal skeletal reinforcement utilizing grade-5 titanium interwoven with carbon-graphene lattice struts. Absorbs kinetic impact forces up to 12,000 Newtons, increases maximum load tolerance by 900%, and protects vital internal organs from ballistic penetration."
    },
    power: {
        title: "MICRO-FUSION POWERCELL // ISOTOPE GENERATOR",
        text: "Sub-dermal sustained isotope generator (Cold Hydrogen-Deuterium fusion). Generates continuous 48V DC power directly routed to muscular actuators and neural processors. Operates for 72 hours under maximum physical stress before automatic recharge cycle."
    }
};

const matrixCards = document.querySelectorAll('.matrix-card');
const matrixModal = document.getElementById('matrixModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');

matrixCards.forEach(card => {
    card.addEventListener('click', () => {
        playSound('beep');
        const modalKey = card.getAttribute('data-modal');
        const data = modalData[modalKey];
        if (data) {
            modalTitle.textContent = data.title;
            modalBody.textContent = data.text;
            matrixModal.classList.remove('hidden');
        }
    });
});

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        playSound('click');
        matrixModal.classList.add('hidden');
    });
});

window.addEventListener('click', (e) => {
    if (e.target === matrixModal) {
        matrixModal.classList.add('hidden');
    }
});


// --- Terminal Pre-Order Form Handling ---
const cyberForm = document.getElementById('cyberForm');
const formSuccessMessage = document.getElementById('formSuccessMessage');
const resetFormBtn = document.getElementById('resetFormBtn');

cyberForm.addEventListener('submit', (e) => {
    e.preventDefault();
    playSound('success');
    cyberForm.classList.add('hidden');
    formSuccessMessage.classList.remove('hidden');
});

resetFormBtn.addEventListener('click', () => {
    playSound('click');
    cyberForm.reset();
    formSuccessMessage.classList.add('hidden');
    cyberForm.classList.remove('hidden');
});


// --- Dynamic Terminal Log Generator ---
const terminalLogs = document.getElementById('terminalLogs');
const logMessages = [
    "[INFO] Quantum neural handshake verified.",
    "[DIAGNOSTIC] Ocular thermal sensors operating at nominal temperatures.",
    "[SECURE] Sub-dermal fusion reactor stable at 99.1%.",
    "[SYNC] Exoskeletal actuator telemetry stream normal.",
    "[ALERT] Zero packet loss across quantum encrypted channel.",
    "[MAINTENANCE] Micro-fusion coolant flow rate optimal."
];

setInterval(() => {
    if (Math.random() > 0.4) {
        const randomMsg = logMessages[Math.floor(Math.random() * logMessages.length)];
        const p = document.createElement('p');
        p.textContent = randomMsg;
        terminalLogs.appendChild(p);
        terminalLogs.scrollTop = terminalLogs.scrollHeight;
        
        if (terminalLogs.children.length > 25) {
            terminalLogs.removeChild(terminalLogs.children[0]);
        }
    }
}, 4000);
