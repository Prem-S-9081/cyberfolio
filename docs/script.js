// Preloader: counts 0-100, holds at 90 until window load, then slides up
(function () {
    const pre = document.getElementById('preloader');
    if (!pre) return;
    const countEl = document.getElementById('preloaderCount');
    const fill = document.getElementById('preloaderFill');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DURATION = 1100;
    let loaded = document.readyState === 'complete';
    let finished = false;

    function finish() {
        if (finished) return;
        finished = true;
        document.body.classList.remove('is-loading');
        pre.classList.add('is-done');
        window.__preloaderDone = true;
        document.dispatchEvent(new Event('preloader:done'));
        setTimeout(() => pre.remove(), 600);
    }

    if (reduce) { finish(); return; }

    window.addEventListener('load', () => { loaded = true; });
    setTimeout(finish, 6000); // safety net

    const start = performance.now();
    function tick(now) {
        const p = Math.min(Math.round(((now - start) / DURATION) * 100), loaded ? 100 : 90);
        countEl.textContent = String(p).padStart(3, '0');
        fill.style.transform = `scaleX(${p / 100})`;
        if (p >= 100) { setTimeout(finish, 200); return; }
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
})();

// Cyber rain: hex/binary streams (red = "threat" columns) plus floating security tags
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const glyphs = '0123456789ABCDEF<>/{}#$%=;:'.split('');
const fontSize = 14;
const TAGS = [
    { t: 'CVE-2026', threat: true }, { t: 'XSS', threat: true }, { t: 'SQLi', threat: true },
    { t: '0-DAY', threat: true }, { t: 'RCE', threat: true },
    { t: 'MFA' }, { t: 'TLS 1.3' }, { t: 'AES-256' }, { t: 'SHA-256' }, { t: 'IAM' },
    { t: 'SIEM' }, { t: 'ZERO TRUST' }, { t: 'SSH' }, { t: 'EDR' }
];
let W = 0, H = 0, drops = [], tags = [], heroVisible = true;

function sizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drops = Array.from({ length: Math.floor(W / fontSize) }, () => -Math.floor(Math.random() * 40));
    tags = [];
}

function spawnTag() {
    const def = TAGS[Math.floor(Math.random() * TAGS.length)];
    ctx.font = 'bold 13px monospace';
    const w = Math.ceil(ctx.measureText(def.t).width) + 20;
    const x = Math.floor(Math.random() * Math.max(1, (W - w) / fontSize)) * fontSize;
    const y = Math.floor(Math.random() * Math.max(1, (H - 60) / fontSize)) * fontSize + 30;
    tags.push({ ...def, w, x, y, life: 60 + Math.floor(Math.random() * 40) });
}

function drawCyber() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.fillRect(0, 0, W, H);

    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'alphabetic';
    for (let i = 0; i < drops.length; i++) {
        ctx.fillStyle = i % 9 === 0 ? 'rgba(255, 48, 0, 0.75)' : 'rgba(0, 0, 0, 0.38)';
        ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }

    if (tags.length < 4 && Math.random() < 0.06) spawnTag();
    tags = tags.filter(tag => tag.life-- > 0);
    ctx.font = 'bold 13px monospace';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 2;
    for (const tag of tags) {
        const rgb = tag.threat ? '255, 48, 0' : '0, 0, 0';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(tag.x, tag.y - 12, tag.w, 24);
        ctx.strokeStyle = `rgba(${rgb}, 0.6)`;
        ctx.strokeRect(tag.x + 1, tag.y - 11, tag.w - 2, 22);
        ctx.fillStyle = `rgba(${rgb}, 0.6)`;
        ctx.fillText(tag.t, tag.x + 10, tag.y + 1);
    }
}

sizeCanvas();
if (!reduceMotion) {
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(canvas.parentElement);
    setInterval(() => { if (heroVisible && !document.hidden) drawCyber(); }, 50);
}
window.addEventListener('resize', sizeCanvas);

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const nav = document.getElementById('nav');

mobileMenuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('active');
    mobileMenuBtn.setAttribute('aria-expanded', open);
});

// Close mobile menu when clicking a link
const navLinks = document.querySelectorAll('.nav a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]:not([data-contact])').forEach(anchor => {   // contact buttons turn into mailto:/tel: links, so they must not be intercepted
    anchor.addEventListener('click', function (e) {
        const id = this.getAttribute('href');
        if (id.length < 2 || id.charAt(0) !== '#') return;
        e.preventDefault();
        const target = document.querySelector(id);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* =========================================================
   PROJECTS DATA
   Each project needs a "github" link for the "Dig Deeper"
   button. Replace every REPLACE_WITH_GITHUB_LINK value with
   the real repo URL.
========================================================= */
const projects = [
    {
        id: 1,
        title: 'Singularity XDR:<br> Real-Time SOC & Threat Detection Platform',
        description: 'Developed an open-source, full-stack SOC platform with 34 interactive views for threat monitoring, alert triage, incident response, and compliance tracking. Integrated NSL-KDD and CIC-IDS2018 datasets using Python/FastAPI, REST APIs, and WebSockets, with a modular JavaScript frontend. Implemented automated response playbooks and enterprise-tool connectors; deployed through GitHub Actions CI/CD, GitHub Pages, and Render.',
        technologies: ['SOC Operations', 'XDR ', 'Threat Detection', 'Incident Response Automation', 'Python', 'FastAPI'],
        impact: 'Unified threat monitoring, alert triage, incident response, and compliance tracking across 34 interactive views, translating benchmark attack datasets into actionable SOC workflows. Delivered a live, modular platform with real-time alert streaming and zero proprietary licensing costs.',
        github: 'https://github.com/Prem-S-9081/Singularity-XDR-Real-Time-SOC-Threat-Detection-Platform.git'
    },
    {
        id: 2,
        title: 'Luna Bags:<br> Network Security Hardening & Firewall Implementation',
        description: 'Configured a Linux iptables firewall with default-deny policies, stateful inspection, and segmentation across External, DMZ, Internal, and VPN zones. Deployed an Apache web server in the DMZ and configured NAT, controlled SSH access, VPN traffic rules, connection limits, and security logging. Validated defenses using Nmap, hping3, Netcat, and curl to test stealth scans, unauthorized access, and legitimate connectivity',
        technologies: ['Network Security', 'Linux iptables', 'Network Segmentation', 'Firewall Hardening', 'Security Testing'],
        impact: 'Blocked tested reconnaissance attempts, unauthorized service access, and DMZ-to-internal connections while preserving required HTTP, SSH, and VPN connectivity. Reduced exposed services and restricted lateral-movement paths, with logged firewall events supporting security monitoring and troubleshooting.',
        github: 'https://github.com/Prem-S-9081/Network-Security-Hardening-and-Firewall-Implementation.git' 
    },
    {
        id: 3,
        title: 'OSINT Cyber Risk Assessment: Financial Services Attack Surface Analysis',
        description: 'An academic cyber risk assessment of Broadridge Financial Solutions using passive OSINT, MXToolbox, Robtex, public disclosures, and CISA KEV/NVD research. Profiled cloud infrastructure, enterprise technologies, DNS/email configurations, third-party dependencies, and social-engineering exposure. Correlated identified technologies with relevant CVEs and developed a likelihood–impact risk matrix with phased mitigation recommendations—without active scanning or employee contact.',
        technologies: ['OSINT', 'Attack Surface Analysis', 'Cyber Threat Intelligence', 'CVE Analysis', 'Cyber Risk Assessment'],
        impact: 'Converted publicly available intelligence into a prioritized assessment covering eight risk areas, supporting patch verification, DNS/email hardening, identity security, and third-party risk management. Distinguished potential technology-related exposure from findings requiring internal validation, providing an actionable foundation for further security review.',
        github: 'https://github.com/Prem-S-9081/Financial-Services-Attack-Surface-Analysis.git' 
    },
    {
        id: 4,
        title: 'OmniCommerce Solutions: Enterprise Cybersecurity Strategy & Cloud Security Architecture',
        description: 'Developed a comprehensive cybersecurity strategy and phased implementation roadmap for an omnichannel retail case study, aligning recommendations with NIST CSF 2.0, ISO 27001, PCI DSS, and FedRAMP. Defined Zero Trust, IAM/RBAC/MFA, PKI, encryption, and cloud shared-responsibility controls across SaaS, PaaS, and IaaS. Conducted STRIDE threat modeling for payment workflows and recommended SSDLC security practices incorporating SAST, DAST, and CI/CD security checks.',
        technologies: ['Cloud Security', 'Zero Trust Architecture', 'Governance, Risk & Compliance (GRC)', 'Identity & Access Management (IAM)', 'STRIDE Threat Modeling'],
        impact: 'Translated an omnichannel retailer’s security requirements into a phased, actionable roadmap covering cloud security, identity governance, data protection, and secure development. Identified payment-workflow threats through STRIDE analysis and mapped recommended controls to major compliance frameworks to support risk reduction and scalable growth.',
        github: 'https://github.com/Prem-S-9081/Enterprise-Cybersecurity-Strategy-and-Cloud-Security-Architecture.git' 
    },
    {
        id: 5,
        title: 'Elastic SIEM Home Lab: Security Monitoring & Threat Detection',
        description: 'Built an Elastic SIEM home lab integrating a Kali Linux VM with Elastic Cloud through Elastic Agent and Elastic Defend. Generated security events using Nmap and analyzed network traffic with Wireshark. Queried endpoint logs in Kibana, created security-event dashboards, and configured custom detection rules and alerts for scan-related activity.',
        technologies: ['Elastic SIEM', 'Log Analysis', 'Threat Detection', 'Kibana ', 'Network Traffic Analysis'],
        impact: 'Established an end-to-end workflow for endpoint log collection, event investigation, visualization, and alerting. Developed hands-on SOC analysis skills by tracing simulated reconnaissance activity through centralized telemetry and custom detection rules.',
        github: 'https://github.com/Prem-S-9081/Security-Monitoring-and-Threat-Detection.git'
    },
    {
        id: 6,
        title: 'Smart & Secure Voting System: Biometric Authentication & OTP Verification',
        description: 'Designed an academic electronic voting system combining fingerprint authentication, facial recognition, and OTP verification for voter identity checks. Documented OpenCV-based facial processing, minutiae-based fingerprint matching, RFID identification, GSM communication, and cloud-database architecture. Proposed workflows for voter enrollment, duplicate-vote checks, encrypted ballot storage, and automated vote tallying.',
        technologies: ['Biometric Authentication', 'OpenCV', 'OTP Verification', 'Secure Electronic Voting', 'Cloud Database'],
        impact: 'Developed a layered authentication design intended to reduce voter impersonation and duplicate voting while streamlining registration and counting. Translated research on 12 related voting systems into an integrated architecture covering identity verification, ballot handling, and centralized results management.',
        github: 'https://github.com/Prem-S-9081/Smart-Secure-Voting-System.git' 
    },
    {
        id: 7,
        title: 'Python Keylogger: Keystroke Capture Tool',
        description: 'Developed a Python-based keylogger for educational use, demonstrating keystroke capture and local file logging. Recorded keyboard input to Captures.txt while running visibly through a command prompt, intentionally excluding covert operation to support transparent, user-aware testing.',
        technologies: ['Python', 'Keystroke Logging', 'Endpoint Security', 'Cybersecurity Awareness', 'Ethical Security Research'],
        impact: 'Created a practical demonstration of how keylogging can expose sensitive keyboard input, supporting understanding of endpoint security risks and responsible cybersecurity experimentation.',
        github: 'https://github.com/Prem-S-9081/Python-Keylogger-Keystroke-Capture-Tool.git'
    },
    {
        id: 8,
        title: 'Live Face Recognition & Attendance System: React, Python & AWS',
        description: 'Adapted a face recognition and attendance web application with a React frontend and Python/FastAPI backend. Documented AWS EC2 deployment using Ubuntu, Nginx reverse proxies, and Uvicorn, including frontend-to-backend API configuration and browser webcam access.',
        technologies: ['Face Recognition', 'React ', 'Python/FastAPI', 'AWS EC2','Nginx'],
        impact: 'Demonstrated an integrated approach to webcam-based face recognition and attendance tracking, connecting a browser interface with Python API services. Provided a reproducible cloud-deployment workflow for hosting frontend and backend components on AWS EC2.',
        github: 'https://github.com/Prem-S-9081/Live-Face-Recognition-Attendance-System.git'
    },
    {
        id: 9,
        title: 'Jarvis-AI Voice Assistant: Python Voice Recognition',
        description: 'Developed a Python-based voice recognition tool inspired by Jarvis, exploring voice-driven interaction through a personal assistant project.',
        technologies: ['Python', 'Voice Recognition', 'Voice Assistant', 'Speech Processing', 'Human–Computer Interaction'],
        impact: 'Demonstrated Python-based voice recognition as a foundation for a voice assistant, building practical experience in speech-enabled application development.',
        github: 'https://github.com/Prem-S-9081/Jarvis-AI-Voice-Assistant.git'
    }
];

/* =========================================================
   RESEARCH & PUBLICATIONS DATA
   The first two entries are your real, published/under-review
   papers. Six placeholder slots follow — replace every
   REPLACE_WITH_... value, and set status to 'published' or
   'under-review' as appropriate.
========================================================= */
const researchPapers = [
    {
        id: 1,
        title: 'Q-FlexiViT : A Quantum-Flexible Vision Transformer Optimized By Octopus-Inspired Algorithm For Intrusion Detection',
        authors: 'Prem Kumar Santhanam, Himaja Vellanki Chowdary, Sai Rohith Reddy, Mithra Gowtham',
        date: 'Jan 2026',
        publication: 'Elsevier Journal of Computers and Electrical Engineering',
        status: 'published',
        link: 'https://www.sciencedirect.com/science/article/pii/S0045790625007360'
    },
    {
        id: 2,
        title: 'Luminosity-Adaptive Contrast Enhancement Using CLAHE for Retinal Fundus Images with Multi-Dataset Validation, Statistical Analysis, and Comparative Benchmarking',
        authors: 'Prem Kumar Santhanam, Mithra Gowtham',
        date: 'April 2026',
        publication: 'TechScience Journal of Intelligent Medicine and Healthcare',
        status: 'published',
        link: 'https://www.techscience.com/JIMH/v4n1/67115'
    },
    {
        id: 3,
        title: 'From Pixel to Prognosis: Convolutional and GLCM Feature Fusion for Automated Four-Class Cataract Severity Classification',
        authors: 'Prem Kumar Santhanam, Mithra Gowtham',
        date: 'Jun 2026',
        publication: 'TechScience Journal of Intelligent Medicine and Healthcare',
        status: 'published',
        link: 'https://doi.org/10.48550/arXiv.2607.18349'
    },
    {
        id: 4,
        title: 'Adaptive Power Allocation for Energy-Efficient Uplink Transmission in Cognitive Femtocell-Assisted 5G Heterogeneous Networks with Device-to-Device Communication',
        authors: 'Prem Kumar Santhanam, Mithra Gowtham',
        date: 'Under Review',
        publication: 'TechScience Journal',
        status: 'Under Review',
        link: 'index.html'
    },
    {
        id: 5,
        title: 'UPI Fraud, Financial Cyber Crime, and the Limits of the 1930 Helpline',
        authors: 'Prem Kumar Santhanam, Sudiksha S',
        date: 'Jun 2026',
        publication: 'THE TAMIL NADU DR.AMBEDKAR LAW UNIVERSITY',
        status: 'published',
        link: 'https://drive.google.com/file/d/1bBdo-vt5K2dJfLyWpXRK6BoyK2pKzBew/view?usp=drive_link'
    },
    {
        id: 6,
        title: 'CRIMINALISING THE INVISIBLE PERPETRATOR: CLOSING INDIA LEGAL VACCUM ON NON-CONSENSUAL AI-GENERATED INTIMATE IMAGERY',
        authors: 'Prem Kumar Santhanam, Sudiksha S',
        date: 'July 2026',
        publication: 'THE TAMIL NADU DR.AMBEDKAR LAW UNIVERSITY',
        status: 'published',
        link: 'https://drive.google.com/file/d/1l1wwMVh05SOZaoAywdcP2grTW_6Lkv8q/view?usp=sharing'
    },
    {
        id: 7,
        title: 'India and the Shared Cyber Future: AI Governance, Emerging Threats, and the Road to Convergence',
        authors: 'Prem Kumar Santhanam, Sudiksha S',
        date: 'July 2026',
        publication: 'THE TAMIL NADU DR.AMBEDKAR LAW UNIVERSITY',
        status: 'published',
        link: 'Link_in_Future'
    }
];

/* =========================================================
   BLOG DATA
   The first two entries are real posts found on your Medium.
   Six placeholder slots follow — replace every
   REPLACE_WITH_... value with the real post details.
========================================================= */
const blogPosts = [
    {
        id: 1,
        title: 'WordPress 7.1.1 Security Update: Click2Shell and 10 Other Fixes',
        date: '09-29-2026',
        description: 'Publisher : CodeX',
        link: 'https://medium.com/codex/wordpress-7-1-1-security-update-click2shell-and-10-other-fixes-9d75aa0a346d'
    },
    {
        id: 2,
        title: 'Google Gemini Security Incident: AI Test Reached Three Real Companies',
        date: '09-21-2026',
        description: 'Publisher : Generative AI',
        link: 'https://medium.com/generative-ai/google-gemini-security-incident-ai-test-reached-three-real-companies-17050d315f2c'
    },
    {
        id: 3,
        title: 'WSO2 Vulnerability CVE-2026-5430 Explained: How Attackers Are Bypassing Authentication in the Wild',
        date: '09-21-2026',
        description: 'Publisher : Write A Catalyst',
        link: 'https://medium.com/write-a-catalyst/wso2-vulnerability-cve-2026-5430-explained-how-attackers-are-bypassing-authentication-in-the-wild-d291883b9309'
    },
    {
        id: 4,
        title: 'Kerberos vs NTLM vs LDAP: Best Auth for E-Commerce',
        date: '02-13-2026',
        description: 'Publisher : MeetCyber',
        link: 'https://medium.com/meetcyber/kerberos-vs-ntlm-vs-ldap-best-auth-for-e-commerce-441c43155c75'
    },
    {
        id: 5,
        title: 'Security Harderning: Stateful iptables Firewall for DMZ Isolation & Cyber Threat Mitigation',
        date: '02-13-2026',
        description: 'Publisher : MeetCyber',
        link: 'https://medium.com/meetcyber/strengthening-network-defense-for-a-startup-proposal-502dfd359d16'
    },
    {
        id: 6,
        title: 'SIEM Implementation Guide : Kibana',
        date: '02-26-2026',
        description: 'Publisher : MeetCyber',
        link: 'https://medium.com/meetcyber/complete-siem-implementation-guide-log-collection-correlation-rules-alerting-and-dashboards-799cf9c388d8'
    },
    {
        id: 7,
        title: 'NIST CSF 2.0 : GOVERN FUNCTION',
        date: '03-10-2026',
        description: 'Publisher : MeetCyber',
        link: 'https://medium.com/meetcyber/nist-csf-2-0-part-1-how-the-new-govern-function-reshapes-enterprise-cybersecurity-leadership-aff485f6f1c2'
    },
    {
        id: 8,
        title: 'NIST CSF 2.0 : IMPLEMENTATION GUIDE',
        date: '04-22-2026',
        description: 'Publisher : MeetCyber',
        link: 'https://medium.com/meetcyber/nist-csf-2-0-implementation-guide-profiles-tiers-board-reporting-and-supply-chain-risk-6e07a2d0a86d'
    },
    {
        id: 9,
        title: 'NIST CSF 2.0 : IDENTITY, PROTECT & DETECT',
        date: '08-24-2026',
        description: 'Publisher : MeetCyber',
        link: 'https://medium.com/meetcyber/nist-csf-2-0-guide-identify-protect-and-detect-cybersecurity-risks-0b04295ccaa0'
    },
    {
        id: 10,
        title: 'NIST CSF 2.0 : INCIDENT RESPONSE & RECOVERY',
        date: '08-27-2026',
        description: 'Publisher : MeetCyber',
        link: 'https://medium.com/meetcyber/nist-csf-2-0-incident-response-recovery-guide-to-cyber-resilience-508a01b5c26c'
    }
];

/* =========================================================
   CARD TEMPLATES
========================================================= */
const ICONS = {
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4"/><path d="M3 10h18"/>',
    pen: '<path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'
};
function svg(name, size = 20, cls = '') {
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" aria-hidden="true">${ICONS[name]}</svg>`;
}

function projectCardHTML(p) {
    return `
        <div class="project-card">
            <h3 class="project-title">${p.title}</h3>
            <p class="project-description">${p.description}</p>
            <div class="project-tech">
                ${p.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <div class="project-impact">Impact: ${p.impact}</div>
            <a href="${p.github}" target="_blank" rel="noopener" class="card-link project-link">Dig Deeper ${svg('arrow', 16, 'link-arrow')}</a>
        </div>
    `;
}

function researchCardHTML(r) {
    const published = r.status === 'published';
    return `
        <div class="research-card">
            <div class="research-header">
                <div class="card-icon">${svg('file', 22)}</div>
                <span class="research-status ${published ? 'published' : 'under-review'}">${published ? 'Published' : 'Under Review'}</span>
            </div>
            <h3 class="research-title">${r.title}</h3>
            <div class="research-meta">
                <div class="meta-item">${svg('users', 16)}<span>${r.authors}</span></div>
                <div class="meta-item">${svg('calendar', 16)}<span>${r.date}</span></div>
            </div>
            <div class="research-publication">${r.publication}</div>
            <a href="${r.link}" target="_blank" rel="noopener" class="card-link research-link">View Publication ${svg('arrow', 16, 'link-arrow')}</a>
        </div>
    `;
}

function blogCardHTML(b) {
    return `
        <div class="blog-card">
            <div class="blog-header">
                <div class="card-icon">${svg('pen', 22)}</div>
                <span class="blog-date">${b.date}</span>
            </div>
            <h3 class="blog-title">${b.title}</h3>
            <p class="blog-description">${b.description}</p>
            <a href="${b.link}" target="_blank" rel="noopener" class="card-link blog-link">Read Post ${svg('arrow', 16, 'link-arrow')}</a>
        </div>
    `;
}

/* =========================================================
   GENERIC SCROLL-ROW + "VIEW ALL" MODAL RENDERER
   A "View All" tile is always appended to the end of the row
   (even when every item is already visible) so there's a
   consistent way to open the full modal view.
========================================================= */
function renderCardSection({ items, visibleCount, rowId, modalGridId, modalId, cardHTML, label }) {
    const row = document.getElementById(rowId);
    const modalGrid = document.getElementById(modalGridId);
    if (!row || !modalGrid) return;

    modalGrid.innerHTML = items.map(cardHTML).join('');

    const visibleItems = items.slice(0, visibleCount);
    row.innerHTML = visibleItems.map(cardHTML).join('');

    if (items.length > 0) {
        row.insertAdjacentHTML('beforeend', `
            <div class="show-more-card" role="button" tabindex="0" data-modal-open="${modalId}">
                <div class="show-more-icon">${items.length}</div>
                <div class="show-more-text">View All ${label}</div>
            </div>
        `);
    }

    initScrollArrows(rowId);
}

/* =========================================================
   ARROW NAVIGATION FOR SCROLL ROWS
========================================================= */
function scrollRowBy(rowId, direction) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const firstCard = row.firstElementChild;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 340;
    const gap = parseFloat(getComputedStyle(row).columnGap) || 32;
    row.scrollBy({ left: direction * (cardWidth + gap), behavior: 'smooth' });
}

function initScrollArrows(rowId) {
    const row = document.getElementById(rowId);
    if (!row) return;
    const wrapper = row.closest('.scroll-wrapper');
    if (!wrapper) return;
    const leftArrow = wrapper.querySelector('.scroll-arrow-left');
    const rightArrow = wrapper.querySelector('.scroll-arrow-right');
    if (!leftArrow || !rightArrow) return;

    const updateArrows = () => {
        const maxScroll = row.scrollWidth - row.clientWidth;
        if (row.scrollLeft > 4) wrapper.classList.add('has-scrolled');
        leftArrow.classList.toggle('disabled', row.scrollLeft <= 2);
        rightArrow.classList.toggle('disabled', row.scrollLeft >= maxScroll - 2);
    };

    row.removeEventListener('scroll', row._scrollArrowHandler || (() => {}));
    row._scrollArrowHandler = updateArrows;
    row.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();
}

/* =========================================================
   MODAL CONTROLS
========================================================= */
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
    }
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(overlay.id);
        }
    });
});

/* =========================================================
   INIT ALL SECTIONS ON LOAD
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    renderCardSection({
        items: projects,
        visibleCount: 4,
        rowId: 'projectsScroll',
        modalGridId: 'projectsModalGrid',
        modalId: 'projectsModal',
        cardHTML: projectCardHTML,
        label: 'Projects'
    });

    renderCardSection({
        items: researchPapers,
        visibleCount: 4,
        rowId: 'researchScroll',
        modalGridId: 'researchModalGrid',
        modalId: 'researchModal',
        cardHTML: researchCardHTML,
        label: 'Research'
    });

    renderCardSection({
        items: blogPosts,
        visibleCount: 4,
        rowId: 'blogScroll',
        modalGridId: 'blogModalGrid',
        modalId: 'blogModal',
        cardHTML: blogCardHTML,
        label: 'Posts'
    });
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

// Replace with your Google Apps Script web app URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJ-8padOlAWdd0m0_MRgsbUpMF1LrpW1Q5oZBhcta_75r9TdpsSkVunZ97wDKb4HOHUg/exec';

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Show loading status
    formStatus.textContent = 'Sending message...';
    formStatus.dataset.state = 'sending';
    formStatus.classList.add('show');

    try {
        // Send data to Google Sheets
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        });

        // Show success message
        formStatus.textContent = 'Message sent successfully! I\'ll get back to you soon.';
        formStatus.dataset.state = 'success';
        formStatus.classList.add('show');

        // Celebrate (Swiss palette, skipped for reduced motion)
        fireConfetti(contactForm.querySelector('.submit-btn'));

        // Reset form
        contactForm.reset();

    } catch (error) {
        // Show error message
        formStatus.textContent = 'Error sending message. Please try again.';
        formStatus.dataset.state = 'error';
        formStatus.classList.add('show');
        console.error('Error:', error);
    }

    // Hide status after 5 seconds
    setTimeout(() => {
        formStatus.classList.remove('show');
    }, 5000);
});

// Escape closes the mobile menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
        nav.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.focus();
    }
});

/* =========================================================
   MAGIC UI PORTS (vanilla): Dia Text Reveal, Interactive Hover Button,
   Progressive Blur, Confetti. Border Beam is CSS-only.
========================================================= */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Dia Text Reveal ----------
   A colour band sweeps left to right; text behind the band takes its normal colour.
   Elements: [data-dia] (starts on view) or [data-dia="preloader"] (starts after the preloader). */
(function () {
    const BAND = 17, START = -BAND, END = 100 + BAND, DURATION = 1500;
    const ease = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

    function gradient(pos, colors, text) {
        const bandStart = pos - BAND, bandEnd = pos + BAND;
        if (bandStart >= 100) return `linear-gradient(90deg, ${text}, ${text})`;
        const n = colors.length, parts = [];
        if (bandStart > 0) parts.push(`${text} 0%`, `${text} ${bandStart.toFixed(2)}%`);
        colors.forEach((c, i) => {
            const pct = n === 1 ? pos : bandStart + (i / (n - 1)) * BAND * 2;
            parts.push(`${c} ${pct.toFixed(2)}%`);
        });
        if (bandEnd < 100) parts.push(`transparent ${bandEnd.toFixed(2)}%`, 'transparent 100%');
        return `linear-gradient(90deg, ${parts.join(', ')})`;
    }

    function prepare(el) {
        const cs = getComputedStyle(el);
        const text = cs.color;
        const accent = cs.getPropertyValue('--dia-accent').trim() || '#FF3000';
        const colors = [text, accent, accent, accent];
        el.classList.add('dia-ready');
        el.style.backgroundImage = gradient(START, colors, text);
        return { el, text, colors };
    }

    function play({ el, text, colors }, delay = 0) {
        let t0 = null;
        function frame(now) {
            if (t0 === null) t0 = now + delay;
            const t = Math.min(Math.max((now - t0) / DURATION, 0), 1);
            el.style.backgroundImage = gradient(START + (END - START) * ease(t), colors, text);
            if (t < 1) { requestAnimationFrame(frame); return; }
            el.classList.remove('dia-ready');       // hand the text back to normal CSS
            el.style.backgroundImage = '';
        }
        requestAnimationFrame(frame);
    }

    if (prefersReducedMotion) return;
    const targets = [...document.querySelectorAll('[data-dia]')].map((el) => ({ el, state: prepare(el), wait: el.dataset.dia }));

    const io = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            io.unobserve(entry.target);
            play(targets.find((t) => t.el === entry.target).state);
        }), { threshold: 0.1 })
        : null;

    targets.forEach(({ el, state, wait }) => {
        if (wait === 'preloader') {
            const go = () => play(state, 150);
            window.__preloaderDone ? go() : document.addEventListener('preloader:done', go, { once: true });
        } else if (io) {
            io.observe(el);
        } else {
            play(state);
        }
    });
})();

/* ---------- Interactive Hover Button ----------
   Wraps every .btn / .submit-btn: a square dot grows to fill the button, the label
   slides out and the label plus an arrow slides in. Keeps the original element and handlers. */
(function () {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    function arrow() {
        const svg = document.createElementNS(SVG_NS, 'svg');
        ['width', 'height'].forEach((a) => svg.setAttribute(a, '18'));
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '3');
        svg.setAttribute('stroke-linecap', 'square');
        svg.setAttribute('aria-hidden', 'true');
        ['M5 12h14', 'm12 5 7 7-7 7'].forEach((d) => {
            const p = document.createElementNS(SVG_NS, 'path');
            p.setAttribute('d', d);
            svg.appendChild(p);
        });
        return svg;
    }
    const el = (tag, cls, text) => {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text) node.textContent = text;
        return node;
    };
    document.querySelectorAll('.btn, .submit-btn').forEach((btn) => {
        if (btn.classList.contains('ihb')) return;
        const label = btn.textContent.trim();
        const main = el('span', 'ihb-main');
        const dot = el('span', 'ihb-dot');
        dot.setAttribute('aria-hidden', 'true');
        main.append(dot, el('span', 'ihb-label', label));
        const hover = el('span', 'ihb-hover');
        hover.setAttribute('aria-hidden', 'true');
        hover.append(el('span', '', label), arrow());
        btn.classList.add('ihb');
        btn.replaceChildren(main, hover);
    });
})();

/* ---------- Progressive Blur ----------
   Stacked backdrop-filter layers with staggered masks: blur ramps up toward the edge.
   Fewer layers on small screens to keep scrolling smooth. */
(function () {
    const DESKTOP = [0.5, 1, 2, 4, 8, 16, 32, 64];
    const MOBILE = [1, 4, 16, 48];
    const small = window.matchMedia('(max-width: 767px)');

    function build(host) {
        const levels = small.matches ? MOBILE : DESKTOP;
        const dir = host.dataset.pblur === 'top' ? 'to top' : 'to bottom';
        const step = 100 / levels.length;
        host.replaceChildren();
        levels.forEach((blur, k) => {
            const mask = `linear-gradient(${dir}, rgba(0,0,0,0) ${k * step}%, rgba(0,0,0,1) ${(k + 1) * step}%, rgba(0,0,0,1) ${(k + 2) * step}%, rgba(0,0,0,0) ${(k + 3) * step}%)`;
            const layer = document.createElement('div');
            layer.style.backdropFilter = layer.style.webkitBackdropFilter = `blur(${blur}px)`;
            layer.style.maskImage = layer.style.webkitMaskImage = mask;
            host.appendChild(layer);
        });
    }
    const hosts = [...document.querySelectorAll('[data-pblur]')];
    hosts.forEach(build);
    small.addEventListener('change', () => hosts.forEach(build));
})();

/* ---------- Confetti (canvas-confetti, vendored) ---------- */
let confettiFire = null;
function getConfetti() {
    if (confettiFire || typeof confetti !== 'function') return confettiFire;
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    // main-thread canvas: no Blob worker, so the CSP needs no worker-src
    confettiFire = confetti.create(canvas, { resize: true, useWorker: false });
    return confettiFire;
}
function fireConfetti(origin) {
    const fire = getConfetti();
    if (!fire || !origin) return;
    const r = origin.getBoundingClientRect();
    const o = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
    const base = {
        origin: o, shapes: ['square'], colors: ['#000000', '#FF3000', '#FFFFFF'],
        startVelocity: 42, ticks: 220, scalar: 1.1, disableForReducedMotion: true
    };
    fire({ ...base, particleCount: 60, angle: 60, spread: 65 });
    fire({ ...base, particleCount: 60, angle: 120, spread: 65 });
}

/* ---------- Event wiring (replaces inline onclick/onerror so the CSP can forbid inline script) ---------- */
document.addEventListener('click', (e) => {
    const open = e.target.closest('[data-modal-open]');
    if (open) { openModal(open.dataset.modalOpen); return; }
    const close = e.target.closest('[data-modal-close]');
    if (close) { closeModal(close.dataset.modalClose); return; }
    const arrow = e.target.closest('[data-scroll-row]');
    if (arrow) scrollRowBy(arrow.dataset.scrollRow, Number(arrow.dataset.scrollDir));
});
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const tile = e.target.closest && e.target.closest('[data-modal-open][role="button"]');
    if (tile) { e.preventDefault(); openModal(tile.dataset.modalOpen); }
});
(function () {
    const photo = document.querySelector('.bh-photo img');   // optional portrait: drop it if the file is missing
    if (!photo) return;
    const drop = () => photo.remove();
    photo.addEventListener('error', drop, { once: true });
    if (photo.complete && photo.naturalWidth === 0) drop();
})();

/* =========================================================
   CONTACT BUTTONS
   The email and phone are kept in pieces and only assembled when someone points at,
   focuses or taps a button, so they never appear in the page source or the visible text.
   To change them, edit the arrays below.
========================================================= */
(function () {
    const PIECES = { email: ['premksnm', 'gmail.com'], phone: ['+1', '201', '238', '8400'] };
    const value = { email: () => PIECES.email.join('@'), phone: () => PIECES.phone.join('') };
    const href = {
        email: () => 'mailto:' + value.email() + '?subject=' + encodeURIComponent('Hello from your portfolio'),
        phone: () => 'tel:' + value.phone()
    };
    const status = document.getElementById('contactStatus');
    let statusTimer;
    function say(text) {
        if (!status) return;
        status.textContent = text;
        clearTimeout(statusTimer);
        statusTimer = setTimeout(() => { status.textContent = ''; }, 7000);
    }
    function arm(link) {
        if (!link.dataset.armed) { link.href = href[link.dataset.contact](); link.dataset.armed = '1'; }
    }
    ['pointerover', 'focusin', 'touchstart'].forEach((type) => {
        document.addEventListener(type, (e) => {
            const link = e.target.closest && e.target.closest('[data-contact]');
            if (link) arm(link);
        }, { capture: true, passive: true });
    });
    async function copy(text) {
        try { await navigator.clipboard.writeText(text); return true; } catch (err) { /* fall through */ }
        const box = document.createElement('textarea');
        box.value = text; box.setAttribute('readonly', ''); box.className = 'sr-copy';
        document.body.appendChild(box); box.select();
        let done = false;
        try { done = document.execCommand('copy'); } catch (err) { done = false; }
        box.remove();
        return done;
    }
    document.addEventListener('click', async (e) => {
        const link = e.target.closest('[data-contact]');
        if (link) {
            arm(link);
            say(link.dataset.contact === 'email'
                ? 'Opening your email app. Nothing opened? Use the copy button.'
                : 'Starting a call. On a computer, use the copy button instead.');
            return;
        }
        const btn = e.target.closest('[data-copy]');
        if (btn) {
            const ok = await copy(value[btn.dataset.copy]());
            say(ok ? (btn.dataset.copy === 'email' ? 'Email address copied.' : 'Phone number copied.') : 'Copy failed. Use the Email or Call button.');
            if (ok) {
                btn.classList.add('is-copied');
                setTimeout(() => btn.classList.remove('is-copied'), 1800);
            }
        }
    });
})();

/* ---------- Floating contact button: shows after the hero, hides on the contact section ---------- */
(function () {
    const fab = document.getElementById('contactFab');
    const hero = document.querySelector('.hero');
    const contact = document.getElementById('contact');
    if (!fab || !hero || !contact) return;
    if (!('IntersectionObserver' in window)) { fab.classList.add('is-visible'); return; }
    let heroOn = true, contactOn = false;
    const sync = () => fab.classList.toggle('is-visible', !heroOn && !contactOn);
    new IntersectionObserver(([entry]) => { heroOn = entry.isIntersecting; sync(); }).observe(hero);
    new IntersectionObserver(([entry]) => { contactOn = entry.isIntersecting; sync(); }, { threshold: 0.15 }).observe(contact);
})();
