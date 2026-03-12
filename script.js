// ====== LIVE TERMINAL ANIMATION ======
const TerminalAnimation = {
    phases: ['cd', 'cd-pause', 'cd-execute', 'python', 'python-pause', 'loading', 'processing', 'error', 'reset'],
    currentPhase: 0,
    typedCmd: '',
    dots: 1,
    processLines: [],
    processOutput: [
        'Loading module: yuzu.core.engine',
        'Loading module: yuzu.memory.postgres_store',
        'Loading module: yuzu.api.routes',
        'Initializing database connection...',
        'Mounting API routers...',
        'Starting event loop...'
    ],
    container: null,
    cursorVisible: true,
    typeInterval: null,
    dotInterval: null,
    processInterval: null,
    phaseTimeout: null,

    init() {
        this.container = document.getElementById('terminal');
        if (!this.container) return;

        // Start cursor blink
        setInterval(() => {
            this.cursorVisible = !this.cursorVisible;
            this.render();
        }, 530);

        this.runPhase();
    },

    runPhase() {
        const phase = this.phases[this.currentPhase];
        const typeSpeed = 120;

        clearTimeout(this.phaseTimeout);
        clearInterval(this.typeInterval);
        clearInterval(this.dotInterval);
        clearInterval(this.processInterval);

        switch (phase) {
            case 'cd':
                this.typedCmd = '';
                const cdCmd = 'cd workspace/yuzu-v2';
                let cdI = 0;
                this.typeInterval = setInterval(() => {
                    if (cdI <= cdCmd.length) {
                        this.typedCmd = cdCmd.slice(0, cdI);
                        cdI++;
                        this.render();
                    } else {
                        clearInterval(this.typeInterval);
                        this.phaseTimeout = setTimeout(() => this.nextPhase(), 600);
                    }
                }, typeSpeed);
                break;

            case 'cd-pause':
                this.typedCmd = 'cd workspace/yuzu-v2';
                this.render();
                this.phaseTimeout = setTimeout(() => this.nextPhase(), 900);
                break;

            case 'cd-execute':
                this.typedCmd = '';
                this.render();
                this.phaseTimeout = setTimeout(() => this.nextPhase(), 800);
                break;

            case 'python':
                this.typedCmd = '';
                const pyCmd = 'python main.py';
                let pyI = 0;
                this.typeInterval = setInterval(() => {
                    if (pyI <= pyCmd.length) {
                        this.typedCmd = pyCmd.slice(0, pyI);
                        pyI++;
                        this.render();
                    } else {
                        clearInterval(this.typeInterval);
                        this.phaseTimeout = setTimeout(() => this.nextPhase(), 700);
                    }
                }, typeSpeed);
                break;

            case 'python-pause':
                this.typedCmd = 'python main.py';
                this.render();
                this.phaseTimeout = setTimeout(() => this.nextPhase(), 900);
                break;

            case 'loading':
                this.typedCmd = 'python main.py';
                this.dots = 1;
                this.render();
                this.dotInterval = setInterval(() => {
                    this.dots = this.dots >= 3 ? 3 : this.dots + 1;
                    this.render();
                }, 400);
                this.phaseTimeout = setTimeout(() => {
                    clearInterval(this.dotInterval);
                    this.nextPhase();
                }, 1400);
                break;

            case 'processing':
                this.typedCmd = 'python main.py';
                this.dots = 3;
                this.processLines = [];
                this.render();
                let lineIndex = 0;
                this.processInterval = setInterval(() => {
                    if (lineIndex < this.processOutput.length) {
                        this.processLines.push(this.processOutput[lineIndex]);
                        lineIndex++;
                        this.render();
                    } else {
                        clearInterval(this.processInterval);
                        this.phaseTimeout = setTimeout(() => this.nextPhase(), 600);
                    }
                }, 180);
                break;

            case 'error':
                this.typedCmd = 'python main.py';
                this.processLines = [...this.processOutput];
                this.render();
                this.phaseTimeout = setTimeout(() => this.nextPhase(), 2500);
                break;

            case 'reset':
                this.typedCmd = '';
                this.processLines = [];
                this.render();
                this.phaseTimeout = setTimeout(() => this.nextPhase(), 1200);
                break;
        }
    },

    nextPhase() {
        this.currentPhase = (this.currentPhase + 1) % this.phases.length;
        this.runPhase();
    },

    render() {
        if (!this.container) return;
        const phase = this.phases[this.currentPhase];
        let html = '';

        const cursor = `<span class="terminal-cursor" style="opacity: ${this.cursorVisible ? 1 : 0}">_</span>`;

        switch (phase) {
            case 'cd':
                html = `
                    <div class="terminal-line"><span class="terminal-user">icedeyes12@titit-dev</span> <span class="terminal-path">~</span></div>
                    <div class="terminal-line"><span class="terminal-prompt">❯</span> <span class="terminal-cmd">${this.typedCmd}</span>${cursor}</div>
                `;
                break;

            case 'cd-pause':
                html = `
                    <div class="terminal-line"><span class="terminal-user">icedeyes12@titit-dev</span> <span class="terminal-path">~</span></div>
                    <div class="terminal-line"><span class="terminal-prompt">❯</span> <span class="terminal-cmd">cd workspace/yuzu-v2</span>${cursor}</div>
                `;
                break;

            case 'cd-execute':
                html = `
                    <div class="terminal-line"><span class="terminal-user">icedeyes12@titit-dev</span> <span class="terminal-path">yuzu-v2</span> <span class="terminal-branch">master</span></div>
                    <div class="terminal-line"><span class="terminal-prompt">❯</span>${cursor}</div>
                `;
                break;

            case 'python':
                html = `
                    <div class="terminal-line"><span class="terminal-user">icedeyes12@titit-dev</span> <span class="terminal-path">yuzu-v2</span> <span class="terminal-branch">master</span></div>
                    <div class="terminal-line"><span class="terminal-prompt">❯</span> <span class="terminal-cmd">${this.typedCmd}</span>${cursor}</div>
                `;
                break;

            case 'python-pause':
                html = `
                    <div class="terminal-line"><span class="terminal-user">icedeyes12@titit-dev</span> <span class="terminal-path">yuzu-v2</span> <span class="terminal-branch">master</span></div>
                    <div class="terminal-line"><span class="terminal-prompt">❯</span> <span class="terminal-cmd">python main.py</span>${cursor}</div>
                `;
                break;

            case 'loading':
                const dotStr = '.'.repeat(this.dots) + ' '.repeat(3 - this.dots);
                html = `
                    <div class="terminal-line"><span class="terminal-user">icedeyes12@titit-dev</span> <span class="terminal-path">yuzu-v2</span> <span class="terminal-branch">master</span></div>
                    <div class="terminal-line"><span class="terminal-prompt">❯</span> <span class="terminal-cmd">python main.py</span></div>
                    <div class="terminal-dots">starting${dotStr}</div>
                `;
                break;

            case 'processing':
                const linesHtml = this.processLines.map(line => 
                    `<div class="terminal-output-line"><span class="branch">├─</span> ${line}</div>`
                ).join('');
                const pending = this.processLines.length < this.processOutput.length ? 
                    '<div class="terminal-output-line"><span class="branch">└─</span> ...</div>' : '';
                html = `
                    <div class="terminal-line"><span class="terminal-user">icedeyes12@titit-dev</span> <span class="terminal-path">yuzu-v2</span> <span class="terminal-branch">master</span></div>
                    <div class="terminal-line"><span class="terminal-prompt">❯</span> <span class="terminal-cmd">python main.py</span></div>
                    <div class="terminal-dots">starting...</div>
                    <div class="terminal-output">${linesHtml}${pending}</div>
                `;
                break;

            case 'error':
                const allLinesHtml = this.processOutput.map(line => 
                    `<div class="terminal-output-line"><span class="branch">├─</span> ${line}</div>`
                ).join('');
                html = `
                    <div class="terminal-line"><span class="terminal-user">icedeyes12@titit-dev</span> <span class="terminal-path">yuzu-v2</span> <span class="terminal-branch">master</span></div>
                    <div class="terminal-line"><span class="terminal-prompt">❯</span> <span class="terminal-cmd">python main.py</span></div>
                    <div class="terminal-output">${allLinesHtml}
                        <div class="terminal-output-line terminal-error"><span class="terminal-error-icon">✗</span> [Errno 2] No such file or directory</div>
                        <div class="terminal-message">the project is still under construction, please stay tuned</div>
                    </div>
                `;
                break;

            case 'reset':
                html = `
                    <div class="terminal-line"><span class="terminal-user">icedeyes12@titit-dev</span> <span class="terminal-path">~</span></div>
                    <div class="terminal-line"><span class="terminal-prompt">❯</span>${cursor}</div>
                `;
                break;
        }

        this.container.innerHTML = html;
    }
};

// ====== TAB NAVIGATION ======
const TabNavigation = {
    init() {
        const tabs = document.querySelectorAll('.tab-btn');
        const panels = document.querySelectorAll('.tab-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = tab.dataset.tab;

                // Update tabs
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update panels with fade transition
                panels.forEach(panel => {
                    if (panel.id === targetId) {
                        panel.classList.add('active');
                    } else {
                        panel.classList.remove('active');
                    }
                });
            });
        });
    }
};

// ====== SCROLL PROGRESS ======
const ScrollProgress = {
    init() {
        const bar = document.querySelector('.scroll-progress-bar');
        if (!bar) return;

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            bar.style.width = `${progress}%`;
        }, { passive: true });
    }
};

// ====== CONTACT PANEL ======
const ContactPanel = {
    init() {
        const panel = document.getElementById('contact-panel');
        const toggle = document.getElementById('contact-toggle');
        if (!panel || !toggle) return;

        toggle.addEventListener('click', () => {
            panel.classList.toggle('expanded');
        });
    }
};

// ====== SCROLL REVEAL ANIMATION ======
const ScrollReveal = {
    init() {
        const reveals = document.querySelectorAll('.timeline-item, .philosophy-card, .skill-card, .project-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 50);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        reveals.forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }
};

// ====== AVATAR IMAGE LOADING ======
const AvatarLoader = {
    init() {
        const avatarImg = document.getElementById('avatar-img');
        if (!avatarImg) return;

        // Try GitHub avatar first, fallback to a generated gradient if it fails
        avatarImg.onerror = () => {
            avatarImg.src = 'data:image/svg+xml,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                    <defs>
                        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#f97316"/>
                            <stop offset="100%" style="stop-color:#fbbf24"/>
                        </linearGradient>
                    </defs>
                    <rect fill="#18181b" width="200" height="200"/>
                    <circle cx="100" cy="80" r="40" fill="url(#g)"/>
                    <ellipse cx="100" cy="180" rx="60" ry="50" fill="url(#g)"/>
                </svg>
            `);
        };
    }
};

// ====== PRELOAD SKILL ICONS ======
const PreloadIcons = {
    init() {
        const skills = ['python', 'bash', 'fastapi', 'postgres', 'html', 'css'];
        skills.forEach(skill => {
            const img = new Image();
            img.src = `https://skillicons.dev/icons?i=${skill}`;
        });
    }
};

// ====== INITIALIZE ======
document.addEventListener('DOMContentLoaded', () => {
    TerminalAnimation.init();
    TabNavigation.init();
    ScrollProgress.init();
    ContactPanel.init();
    ScrollReveal.init();
    AvatarLoader.init();
    PreloadIcons.init();
});
