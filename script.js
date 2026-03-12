// ====== LUCIDE ICONS ======
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initTerminal();
    initScrollProgress();
    initIntersectionObserver();
    initParallax();
});

// ====== LIVE TERMINAL ANIMATION ======
const terminalPhases = ['cd', 'cd-pause', 'cd-execute', 'python', 'python-pause', 'loading', 'processing', 'error', 'reset'];
const terminalOutput = [
    "Loading module: yuzu.core.engine",
    "Loading module: yuzu.memory.postgres_store",
    "Loading module: yuzu.api.routes",
    "Initializing database connection...",
    "Mounting API routers...",
    "Starting event loop..."
];

let currentPhase = 0;
let typedCmd = '';
let dots = 1;
let cursorVisible = true;
let processLines = [];
let terminalInterval = null;

function initTerminal() {
    const cursorEl = document.getElementById('terminalCursor');
    
    // Blink cursor
    setInterval(() => {
        cursorVisible = !cursorVisible;
        if (cursorEl) {
            cursorEl.style.opacity = cursorVisible ? '1' : '0';
        }
    }, 530);
    
    runTerminalPhase();
}

function runTerminalPhase() {
    const phase = terminalPhases[currentPhase];
    const container = document.getElementById('terminalContainer');
    
    // Hide all phase elements
    document.querySelectorAll('.terminal-phase').forEach(el => el.classList.add('hidden'));
    
    switch(phase) {
        case 'cd':
            document.getElementById('phase-cd').classList.remove('hidden');
            typedCmd = '';
            const cdCmd = "cd workspace/yuzu-v2";
            let cdIndex = 0;
            terminalInterval = setInterval(() => {
                if (cdIndex <= cdCmd.length) {
                    typedCmd = cdCmd.slice(0, cdIndex);
                    document.getElementById('cdTyped').textContent = typedCmd;
                    cdIndex++;
                } else {
                    clearInterval(terminalInterval);
                    setTimeout(() => nextPhase(), 600);
                }
            }, 120);
            break;
            
        case 'cd-pause':
            document.getElementById('phase-cd-pause').classList.remove('hidden');
            setTimeout(() => nextPhase(), 900);
            break;
            
        case 'cd-execute':
            document.getElementById('phase-cd-execute').classList.remove('hidden');
            setTimeout(() => nextPhase(), 800);
            break;
            
        case 'python':
            document.getElementById('phase-python').classList.remove('hidden');
            typedCmd = '';
            const pyCmd = "python main.py";
            let pyIndex = 0;
            terminalInterval = setInterval(() => {
                if (pyIndex <= pyCmd.length) {
                    typedCmd = pyCmd.slice(0, pyIndex);
                    document.getElementById('pythonTyped').textContent = typedCmd;
                    pyIndex++;
                } else {
                    clearInterval(terminalInterval);
                    setTimeout(() => nextPhase(), 700);
                }
            }, 120);
            break;
            
        case 'python-pause':
            document.getElementById('phase-python-pause').classList.remove('hidden');
            setTimeout(() => nextPhase(), 900);
            break;
            
        case 'loading':
            document.getElementById('phase-loading').classList.remove('hidden');
            dots = 1;
            terminalInterval = setInterval(() => {
                dots = Math.min(dots + 1, 3);
                document.getElementById('loadingDots').textContent = '.'.repeat(dots) + ' '.repeat(3 - dots);
            }, 400);
            setTimeout(() => {
                clearInterval(terminalInterval);
                nextPhase();
            }, 1400);
            break;
            
        case 'processing':
            document.getElementById('phase-processing').classList.remove('hidden');
            processLines = [];
            let lineIndex = 0;
            terminalInterval = setInterval(() => {
                if (lineIndex < terminalOutput.length) {
                    processLines.push(terminalOutput[lineIndex]);
                    updateProcessLines();
                    lineIndex++;
                } else {
                    clearInterval(terminalInterval);
                    setTimeout(() => nextPhase(), 600);
                }
            }, 180);
            break;
            
        case 'error':
            document.getElementById('phase-error').classList.remove('hidden');
            updateErrorLines();
            setTimeout(() => nextPhase(), 2500);
            break;
            
        case 'reset':
            document.getElementById('phase-reset').classList.remove('hidden');
            setTimeout(() => nextPhase(), 1200);
            break;
    }
}

function nextPhase() {
    if (terminalInterval) clearInterval(terminalInterval);
    currentPhase = (currentPhase + 1) % terminalPhases.length;
    runTerminalPhase();
}

function updateProcessLines() {
    const container = document.getElementById('processLines');
    container.innerHTML = processLines.map((line, i) => `
        <div class="text-zinc-500 text-[9px] flex items-center gap-1.5">
            <span class="text-zinc-600">${i === processLines.length - 1 && processLines.length < terminalOutput.length ? '└─' : '├─'}</span>
            <span>${line}</span>
        </div>
    `).join('');
    if (processLines.length < terminalOutput.length) {
        container.innerHTML += '<div class="text-zinc-600 text-[9px]">└─ ...</div>';
    }
}

function updateErrorLines() {
    const container = document.getElementById('errorLines');
    container.innerHTML = terminalOutput.map((line, i) => `
        <div class="text-zinc-500 text-[9px] flex items-center gap-1.5">
            <span class="text-zinc-600">├─</span>
            <span>${line}</span>
        </div>
    `).join('') + `
        <div class="text-red-400/80 text-[9px] flex items-center gap-1.5 mt-1">
            <span class="text-red-500/60">✗</span>
            <span>[Errno 2] No such file or directory</span>
        </div>
        <div class="text-orange-400/60 text-[9px] pl-3.5">the project is still under construction, please stay tuned</div>
    `;
}

// ====== TAB NAVIGATION ======
let activeTab = 'story';
let contentVisible = true;

function switchTab(tab) {
    if (tab === activeTab) return;
    
    contentVisible = false;
    document.getElementById('tabContent').style.opacity = '0';
    document.getElementById('tabContent').style.transform = 'translateY(8px)';
    
    setTimeout(() => {
        activeTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === tab) {
                btn.classList.add('text-orange-400');
                btn.classList.remove('text-zinc-500', 'hover:text-zinc-300');
                btn.querySelector('.tab-bg').classList.remove('hidden');
            } else {
                btn.classList.remove('text-orange-400');
                btn.classList.add('text-zinc-500', 'hover:text-zinc-300');
                btn.querySelector('.tab-bg').classList.add('hidden');
            }
        });
        
        // Show/hide content
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.add('hidden');
        });
        document.getElementById(`panel-${tab}`).classList.remove('hidden');
        
        contentVisible = true;
        document.getElementById('tabContent').style.opacity = '1';
        document.getElementById('tabContent').style.transform = 'translateY(0)';
        
        // Re-trigger animations for new content
        initIntersectionObserver();
    }, 150);
}

// ====== CONTACT PANEL ======
let contactExpanded = false;

function toggleContact() {
    contactExpanded = !contactExpanded;
    const panel = document.getElementById('contactPanel');
    const content = document.getElementById('contactContent');
    const mailIcon = document.getElementById('contactIconMail');
    const closeIcon = document.getElementById('contactIconClose');
    
    if (contactExpanded) {
        panel.style.width = 'min(360px, calc(100vw - 2rem))';
        panel.classList.remove('bg-gradient-to-br', 'from-orange-500', 'via-orange-600', 'to-amber-500');
        panel.classList.add('bg-zinc-900/95', 'backdrop-blur-xl', 'border', 'border-zinc-700');
        content.classList.remove('opacity-0', 'w-0', 'overflow-hidden');
        content.classList.add('opacity-100', 'flex-1');
        mailIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
        document.getElementById('contactToggle').classList.add('hover:bg-zinc-800', 'text-orange-400', 'rounded-r-2xl');
        document.getElementById('contactToggle').classList.remove('hover:scale-105', 'active:scale-95', 'text-white');
    } else {
        panel.style.width = '56px';
        panel.classList.add('bg-gradient-to-br', 'from-orange-500', 'via-orange-600', 'to-amber-500');
        panel.classList.remove('bg-zinc-900/95', 'backdrop-blur-xl', 'border', 'border-zinc-700');
        content.classList.add('opacity-0', 'w-0', 'overflow-hidden');
        content.classList.remove('opacity-100', 'flex-1');
        mailIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        document.getElementById('contactToggle').classList.remove('hover:bg-zinc-800', 'text-orange-400', 'rounded-r-2xl');
        document.getElementById('contactToggle').classList.add('hover:scale-105', 'active:scale-95', 'text-white');
    }
}

// ====== SCROLL PROGRESS ======
function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    
    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        progressBar.style.width = `${progress}%`;
    }, { passive: true });
}

// ====== INTERSECTION OBSERVER FOR REVEALS ======
function initIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px' });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ====== PARALLAX EFFECT ======
function initParallax() {
    const heroBg = document.getElementById('heroBg');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const rate = scrolled * 0.3;
        if (heroBg && scrolled < window.innerHeight) {
            heroBg.style.transform = `translateY(${rate}px) scale(1.05)`;
        }
    }, { passive: true });
}
