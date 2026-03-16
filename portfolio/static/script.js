/* ============================================================
   DEEPTHI DESETTY – PREMIUM PORTFOLIO SCRIPT v2.0
   Three.js Hero · Particles · Scroll Progress · Cursor FX
   Typewriter · Skill Bars · Tilt Cards · Counter Animation
   Code Terminal · Chatbot · Theme Toggle · Scroll Reveal
   ============================================================ */

'use strict';

// ===== UTILITY =====
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


// ================================================================
// 1. SCROLL PROGRESS BAR
// ================================================================
(function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scrollProgress';
  bar.style.cssText = `
    position:fixed; top:0; left:0; height:3px; width:0%;
    background:linear-gradient(90deg,#7c3aed,#06d6fa,#10e8a0);
    z-index:10000; transition:width .1s linear;
    box-shadow:0 0 10px rgba(6,214,250,0.7), 0 0 20px rgba(124,58,237,0.5);
    border-radius:0 3px 3px 0;
  `;
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  }, { passive: true });
})();


// ================================================================
// 2. SCROLL REVEAL (IntersectionObserver)
// ================================================================
function checkImmediateReveals() {
  $$('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
      el.classList.add('visible');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  $$('.hero .reveal-up, .hero .reveal-left, .hero .reveal-right').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 130);
  });
  setTimeout(checkImmediateReveals, 120);
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

$$('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add('visible');
  else revealObserver.observe(el);
});


// ================================================================
// 3. THREE.JS HERO 3D SCENE
// ================================================================
(function initHero3D() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);
  camera.position.set(0, 0, 22);

  // Lights
  scene.add(new THREE.AmbientLight(0x1a1a3e, 3));
  const dirLight = new THREE.DirectionalLight(0x00d4ff, 1.5);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);
  const pLight = new THREE.PointLight(0x7c3aed, 2, 30);
  pLight.position.set(-8, 4, 8);
  scene.add(pLight);

  // Neural network nodes
  const nodeCount = 90;
  const nodeGeo   = new THREE.BufferGeometry();
  const positions = new Float32Array(nodeCount * 3);
  for (let i = 0; i < nodeCount; i++) {
    const phi   = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const r     = 7 + Math.random() * 3.5;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const nodeMat  = new THREE.PointsMaterial({
    color: 0x00d4ff, size: 0.14, transparent: true, opacity: 0.65,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const nodesMesh = new THREE.Points(nodeGeo, nodeMat);
  scene.add(nodesMesh);

  // Neural lines
  const lineMat  = new THREE.LineBasicMaterial({
    color: 0x6366f1, transparent: true, opacity: 0.09,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const lineVerts = [];
  const posArr    = positions;
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const dx = posArr[i*3]   - posArr[j*3];
      const dy = posArr[i*3+1] - posArr[j*3+1];
      const dz = posArr[i*3+2] - posArr[j*3+2];
      if (Math.sqrt(dx*dx + dy*dy + dz*dz) < 5.2) {
        lineVerts.push(posArr[i*3], posArr[i*3+1], posArr[i*3+2]);
        lineVerts.push(posArr[j*3], posArr[j*3+1], posArr[j*3+2]);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  // Central sphere
  const sphereGeo = new THREE.SphereGeometry(2.6, 36, 36);
  const sphereMat = new THREE.MeshPhongMaterial({
    color: 0x0a1628, emissive: 0x003355,
    transparent: true, opacity: 0.65, shininess: 120
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphere);

  // Wireframe overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.065
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(2.65, 20, 20), wireMat));

  // Inner glow ring
  const ringGeo = new THREE.TorusGeometry(3.2, 0.04, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x7c3aed, transparent: true, opacity: 0.5
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.9;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.9;
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    nodesMesh.rotation.y = t * 0.13 + mouseX * 0.35;
    nodesMesh.rotation.x = t * 0.07 + mouseY * 0.22;
    sphere.rotation.y    = t * 0.32;
    sphere.rotation.x    = Math.sin(t * 0.5) * 0.15;
    ring.rotation.z      = t * 0.2;
    pLight.position.x    = Math.sin(t * 0.8) * 10;
    pLight.position.y    = Math.cos(t * 0.5) * 8;

    camera.position.x += (mouseX * 3 - camera.position.x) * 0.035;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.035;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
})();


// ================================================================
// 4. PARTICLES.JS BACKGROUND
// ================================================================
(function initParticles() {
  if (typeof particlesJS === 'undefined') return;
  // Create container if needed
  let pc = document.getElementById('particles-js');
  if (!pc) {
    pc = document.createElement('div');
    pc.id = 'particles-js';
    pc.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;';
    document.body.prepend(pc);
  }
  particlesJS('particles-js', {
    particles: {
      number: { value: 55, density: { enable: true, value_area: 1100 } },
      color: { value: ['#00d4ff', '#7c3aed', '#10e8a0'] },
      shape: { type: 'circle' },
      opacity: { value: 0.22, random: true, anim: { enable: true, speed: 0.7, opacity_min: 0.04, sync: false } },
      size: { value: 2.4, random: true },
      line_linked: { enable: true, distance: 145, color: '#6366f1', opacity: 0.07, width: 1 },
      move: { enable: true, speed: 0.75, direction: 'none', random: true, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, resize: true },
      modes: { grab: { distance: 210, line_linked: { opacity: 0.28 } } }
    },
    retina_detect: true
  });
})();


// ================================================================
// 5. CUSTOM CURSOR
// ================================================================
(function initCursor() {
  const dot      = $('#cursor');
  const follower = $('#cursorFollower');
  if (!dot || !follower) return;

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animateFollower);
  })();

  $$('a, button, .surface-card, .project-card, .cert-card, input, textarea, .bento-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform      = 'translate(-50%,-50%) scale(2.8)';
      follower.style.transform = 'translate(-50%,-50%) scale(1.6)';
      follower.style.opacity   = '0.35';
      follower.style.borderColor = 'rgba(124,58,237,0.5)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform      = 'translate(-50%,-50%) scale(1)';
      follower.style.transform = 'translate(-50%,-50%) scale(1)';
      follower.style.opacity   = '1';
      follower.style.borderColor = '';
    });
  });
})();


// ================================================================
// 6. TYPEWRITER EFFECT
// ================================================================
(function initTypewriter() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const phrases = [
    'AI / ML Systems',
    'Deep Learning Models',
    'NLP Applications',
    'Data Pipelines',
    'Fraud Detection AIs',
    'Intelligent Solutions'
  ];

  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const current = phrases[pi];
    if (!deleting) {
      el.textContent = current.slice(0, ci + 1);
      ci++;
      if (ci === current.length) { deleting = true; setTimeout(tick, 1900); return; }
    } else {
      el.textContent = current.slice(0, ci - 1);
      ci--;
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 50 : 80);
  }
  setTimeout(tick, 700);
})();


// ================================================================
// 7. NAVBAR — scroll spy + hamburger
// ================================================================
(function initNavbar() {
  const navbar    = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileNav = $('#mobileNav');

  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);

    const btt = $('#backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 500);

    highlightNav();
    checkImmediateReveals();
  }, { passive: true });

  // Active link
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  function highlightNav() {
    const sy = window.scrollY + 140;
    sections.forEach(sec => {
      if (sy >= sec.offsetTop && sy < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id));
      }
    });
  }

  // Hamburger
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      const spans = $$('span', hamburger);
      spans[0].style.transform = open ? 'translateY(7px) rotate(45deg)' : '';
      spans[1].style.opacity   = open ? '0' : '1';
      spans[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
    });
  }

  $$('.mobile-link').forEach(a => {
    a.addEventListener('click', () => {
      if (mobileNav) mobileNav.classList.remove('open');
      if (hamburger) $$('span', hamburger).forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  // Smooth scroll
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      if (mobileNav) mobileNav.classList.remove('open');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


// ================================================================
// 8. BACK TO TOP
// ================================================================
(function initBTT() {
  const btn = $('#backToTop');
  if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


// ================================================================
// 9. THEME TOGGLE
// ================================================================
(function initTheme() {
  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateIcon(saved);

  const btn = $('#themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);
      updateIcon(next);
    });
  }

  function updateIcon(theme) {
    const icon = $('#themeIcon');
    if (!icon) return;
    if (theme === 'light') icon.classList.replace('fa-moon', 'fa-sun');
    else icon.classList.replace('fa-sun', 'fa-moon');
  }
})();


// ================================================================
// 10. SKILL BAR ANIMATION
// ================================================================
(function initSkillBars() {
  const skillSection = $('#skills');
  if (!skillSection) return;

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      $$('.skill-bar-fill').forEach(fill => {
        fill.style.width = fill.dataset.width || '0%';
      });
      obs.disconnect();
    }
  }, { threshold: 0.25 });
  obs.observe(skillSection);
})();


// ================================================================
// 11. 3D CARD TILT EFFECT
// ================================================================
(function initTilt() {
  $$('.project-card, .cert-card, .surface-card').forEach(card => {
    let rafId = null;
    card.addEventListener('mousemove', e => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 14;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * 14;
        card.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg) translateY(-6px)`;
        card.style.transition = 'transform 0.1s ease';
      });
    });
    card.addEventListener('mouseleave', () => {
      cancelAnimationFrame(rafId);
      card.style.transform  = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
    });
  });
})();


// ================================================================
// 12. COUNTER ANIMATION
// ================================================================
(function initCounters() {
  const section = $('#about');
  if (!section) return;

  function animateCounter(el, target, duration = 1500) {
    const isFloat   = String(target).includes('.');
    const hasSuffix = el.dataset.suffix || '';
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const prog  = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      el.textContent = isFloat ? (eased * target).toFixed(1) : Math.floor(eased * target) + hasSuffix;
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      $$('.stat-num', section).forEach(el => {
        const raw = parseFloat(el.textContent.replace('+', '').replace(',', ''));
        el.dataset.suffix = el.textContent.includes('+') ? '+' : '';
        animateCounter(el, raw);
      });
      obs.disconnect();
    }
  }, { threshold: 0.5 });
  obs.observe(section);
})();


// ================================================================
// 13. CODE TERMINAL ANIMATION
// ================================================================
(function initTerminal() {
  const terminalBody = document.getElementById('codeTerminal');
  if (!terminalBody) return;

  const lines = [
    { html: '<span class="t-cmt"># Deepthi\'s AI profile</span>' },
    { html: '<span class="t-kw">class</span> <span class="t-cls">Deepthi</span><span class="t-op">:</span>' },
    { html: '  <span class="t-kw">def</span> <span class="t-fn">__init__</span>(self)<span class="t-op">:</span>' },
    { html: '    self<span class="t-op">.</span>role     <span class="t-op">=</span> <span class="t-str">"AI/ML Engineer"</span>' },
    { html: '    self<span class="t-op">.</span>skills   <span class="t-op">=</span> [<span class="t-str">"TensorFlow"</span>, <span class="t-str">"PyTorch"</span>, <span class="t-str">"NLP"</span>]' },
    { html: '    self<span class="t-op">.</span>passion  <span class="t-op">=</span> <span class="t-str">"Artificial Intelligence"</span>' },
    { html: '    self<span class="t-op">.</span>problems <span class="t-op">=</span> <span class="t-num">250</span><span class="t-str">+" DSA solved"</span>' },
    { html: '  <span class="t-kw">def</span> <span class="t-fn">build</span>(self)<span class="t-op">:</span> <span class="t-kw">return</span> <span class="t-str">"🚀 Intelligent Systems"</span>' },
  ];

  let idx = 0;
  function typeLine() {
    if (idx >= lines.length) {
      const cur = document.createElement('span');
      cur.className = 't-cursor';
      terminalBody.appendChild(cur);
      return;
    }
    const span = document.createElement('span');
    span.className = 't-line';
    span.innerHTML = lines[idx].html;
    terminalBody.appendChild(span);
    idx++;
    setTimeout(typeLine, idx === 1 ? 250 : 130);
  }

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { setTimeout(typeLine, 400); obs.disconnect(); }
  }, { threshold: 0.3 });
  obs.observe(terminalBody);
})();


// ================================================================
// 14. SKILL TABS
// ================================================================
(function initSkillTabs() {
  $$('.skill-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.skill-tab-btn').forEach(b => b.classList.remove('active'));
      $$('.skill-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById('tab-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
})();


// ================================================================
// 15. CONTACT FORM
// ================================================================
(function initContactForm() {
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form || !submitBtn) return;

  form.addEventListener('submit', () => {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
    submitBtn.disabled  = true;
  });
})();


// ================================================================
// 16. CHATBOT — Smart & Context-Aware
// ================================================================
(function initChatbot() {
  const fab      = document.getElementById('chatbotFab');
  const panel    = document.getElementById('chatbotPanel');
  const closer   = document.getElementById('chatClose');
  const input    = document.getElementById('chatInput');
  const sendBtn  = document.getElementById('chatSend');
  const msgs     = document.getElementById('chatMessages');
  const typing   = document.getElementById('chatTyping');
  if (!fab || !panel) return;

  const kb = [
    {
      keys: ['skill','know','tech','stack','language','framework','tool','good at','expert','proficient'],
      ans: '💡 Deepthi is skilled in:\n\n**Languages** → Python, C/C++, Java, SQL, HTML/CSS\n**AI/ML** → TensorFlow, PyTorch, Scikit-learn, NLP, Deep Learning, LLMs\n**Data** → Pandas, NumPy, Matplotlib, Django\n**Cloud** → AWS (Lambda, DynamoDB, API Gateway)\n**Tools** → Jupyter, VS Code, Git, Docker, Colab'
    },
    {
      keys: ['python','tensorflow','pytorch','scikit','nlp','bert','neural','deep learn','machine learn','ai','ml','artificial','genai','llm','model','transformer'],
      ans: '🤖 Deepthi is deeply into AI/ML! She works with **TensorFlow & PyTorch** for deep learning, uses **BERT & transformers** for NLP, and has experience with **LLMs & GenAI**. She has built models for sentiment analysis, fraud detection, stock prediction, and crop disease classification!'
    },
    {
      keys: ['project','built','app','system','stock','fraud','fake news','peaceful','crop','disease','predict','portfolio'],
      ans: '🚀 Deepthi has built **5+ AI/ML projects**:\n\n📈 **Stock Prediction App** – LSTM + ARIMA + React.js + Django\n🛡️ **Fraud Detection System** – Random Forest + Logistic Regression\n📰 **Fake News Detector** – BERT + TF-IDF NLP classifier\n🧘 **Peaceful Mind App** – Sentiment AI mental health companion\n🌿 **Crop Disease Predictor** – CNN + OpenCV + TensorFlow\n\nAll deployed end-to-end! 💪'
    },
    {
      keys: ['internship','experience','company','internselite','professional','industry','work experience'],
      ans: '💼 **Internselite Pvt Ltd** (Oct – Dec 2024)\n\n• Built serverless apps on **AWS** (API Gateway, Lambda, DynamoDB)\n• Optimised trees, graphs, heaps & dynamic programming algorithms\n• Applied advanced **C++ STL** features on real-world projects\n• Focused on time/space complexity and scalable architecture'
    },
    {
      keys: ['education','degree','study','university','lpu','lovely professional','school','cgpa','grade','10th','intermediate','marks','academic'],
      ans: '🎓 **Education Journey:**\n\n🏛️ B.Tech CSE – Lovely Professional University *(2023–Present)* — CGPA: **7.4**\n📚 Intermediate (PCM) – SR Educational Academy — **89%**\n🏫 10th Standard – Red Cherries School — **98%**\n\nConsistently strong academic record! 🌟'
    },
    {
      keys: ['certificate','certif','course','coursera','infosys','ibm','deeplearning','stanford','credential'],
      ans: '🏆 **6+ Certifications:**\n\n🔹 Data Structures & Algorithms – CipherSchools *(Jul 2025)*\n🔹 Master Generative AI & Tools – Infosys Springboard *(Aug 2025)*\n🔹 Machine Learning Specialization – Coursera/Stanford *(2025)*\n🔹 Deep Learning Specialization – DeepLearning.AI *(2025)*\n🔹 Natural Language Processing – Coursera *(2025)*\n🔹 Python for Data Science & AI – IBM *(2024)*'
    },
    {
      keys: ['contact','reach','email','phone','linkedin','github','hire','connect','recruit','opportunity','touch','message'],
      ans: '📬 **Connect with Deepthi!**\n\n✉️ deepthidesetty22@gmail.com\n📞 +91-9392951537\n💼 linkedin.com/in/deepthi99\n🐙 github.com/Deepthi006\n\nShe is **actively open to opportunities** — internships, full-time roles, and collaborations! 🚀'
    },
    {
      keys: ['volunteer','nss','community','social','service','rural','camp','help'],
      ans: '🌱 **NSS Volunteer at LPU**\n\n• 🌳 Tree plantation drives\n• 🩸 Blood donation awareness\n• 📱 Digital literacy programs\n• 🏘️ Rural development camps\n• 📖 Education support for underprivileged youth\n\nGrowth means lifting others along the way! 💚'
    },
    {
      keys: ['achievement','dsa','problem','leetcode','geeksforgeeks','solve','competitive','coding','250'],
      ans: '🏅 **Deepthi\'s Scoreboard:**\n\n🔢 **250+ DSA problems** on LeetCode & GeeksforGeeks\n🤖 **5+ AI/ML projects** built & deployed\n🏆 **6+ certifications** from top platforms\n\nStrong problem-solving + practical AI skills = 🔥'
    },
    {
      keys: ['soft skill','communication','leadership','team','adapt','manage','creative','critical thinking'],
      ans: '💡 **Soft Skills:**\n\n🗣️ Communication — clear & concise\n🤝 Teamwork — collaborative project experience\n🧩 Problem Solving — 250+ DSA problems\n⏰ Time Management — juggling studies, projects & certs\n🔄 Adaptability — always learning new tech\n👑 Leadership — NSS volunteer initiatives'
    },
    {
      keys: ['resume','cv','download','pdf','portfolio doc'],
      ans: '📄 Download Deepthi\'s resume from the **About section** — look for the glowing green **"Download Resume"** button! 💚\n\nOr scroll up and click it!'
    },
    {
      keys: ['available','open','hire','fresher','looking','job','role','position'],
      ans: '✅ Yes! Deepthi is **actively open to opportunities** — internships, full-time AI/ML roles, research positions, and collaborations.\n\n📩 Reach her at **deepthidesetty22@gmail.com** or connect on LinkedIn!'
    },
    {
      keys: ['location','where','india','city','place','based'],
      ans: '📍 Deepthi is based in **India** and is open to both **remote and on-site opportunities** globally! 🌏'
    },
    {
      keys: ['thank','thanks','appreciate','great','awesome','cool','nice','wow','good','perfect','helpful'],
      ans: '😊 You\'re welcome! Feel free to ask anything else about Deepthi. She\'d love to hear from you — drop her an email at **deepthidesetty22@gmail.com**! 💌'
    },
    {
      keys: ['bye','goodbye','see you','cya','later','done','exit'],
      ans: '👋 Goodbye! Don\'t forget to check out Deepthi\'s projects and reach out if you\'re interested. See you around! 🌟'
    },
    {
      keys: ['hi','hello','hey','sup','hola','howdy','yo','morning','evening','greet','start'],
      ans: '👋 Hey there! I\'m **DD**, Deepthi\'s personal AI assistant.\n\nAsk me about her **skills, projects, internship, education, certifications** or how to get in touch! 😊'
    },
    {
      keys: ['who','about','deepthi','yourself','tell me','introduce','background','profile'],
      ans: '🤖 **Deepthi Desetty** is an AI/ML Engineer from India, currently pursuing **B.Tech CSE at Lovely Professional University**.\n\nPassionate about **Deep Learning, NLP & intelligent systems** with **5+ projects, 6+ certifications**, and **250+ DSA problems** solved.\n\n📍 India | Open to opportunities worldwide 🌍'
    },
  ];

  let fallbackIdx = 0;
  const fallbacks = [
    'Hmm, I\'m not sure about that! 🤔 Try asking about Deepthi\'s **skills, projects, education, or certifications** — or reach her at **deepthidesetty22@gmail.com** 💌',
    'Good question! That\'s a bit beyond what I know. 😅 For anything specific, Deepthi is best reached at **deepthidesetty22@gmail.com** ✉️',
    'I don\'t have an answer for that, but Deepthi would love to tell you herself! Drop her a message on **LinkedIn** or via email! 📨',
  ];

  function getReply(q) {
    const lower = q.toLowerCase().trim();
    // Score all entries by number of keyword matches
    let best = null, bestScore = 0;
    for (const item of kb) {
      const score = item.keys.filter(k => lower.includes(k)).length;
      if (score > bestScore) { bestScore = score; best = item; }
    }
    if (best && bestScore > 0) return best.ans;
    return fallbacks[fallbackIdx++ % fallbacks.length];
  }

  function appendMsg(text, role) {
    const div    = document.createElement('div');
    div.className = `chat-msg ${role}`;
    const bubble  = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    div.appendChild(bubble);
    div.style.cssText = 'opacity:0;transform:translateY(8px);';
    msgs.appendChild(div);
    requestAnimationFrame(() => {
      div.style.transition = 'opacity 0.3s ease,transform 0.3s ease';
      div.style.opacity = '1'; div.style.transform = 'translateY(0)';
    });
    msgs.scrollTop = msgs.scrollHeight;
  }

  function send(q) {
    if (!q.trim()) return;
    appendMsg(q, 'user');
    const qr = document.getElementById('quickReplies');
    if (qr) qr.remove();
    typing.style.display = 'flex';
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => {
      typing.style.display = 'none';
      appendMsg(getReply(q), 'bot');
    }, 850 + Math.random() * 550);
  }

  fab.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    document.getElementById('chatFabIcon').className = isOpen ? 'fas fa-times' : 'fas fa-comment-dots';
    if (isOpen && input) setTimeout(() => input.focus(), 300);
  });
  if (closer) closer.addEventListener('click', () => {
    panel.classList.remove('open');
    document.getElementById('chatFabIcon').className = 'fas fa-comment-dots';
  });
  if (sendBtn) sendBtn.addEventListener('click', () => { const v=input.value.trim(); if(v){send(v);input.value='';} });
  if (input) {
    input.addEventListener('keydown', e => { if (e.key==='Enter'&&!e.shiftKey){const v=input.value.trim();if(v){send(v);input.value='';}e.preventDefault();} });
    input.addEventListener('input', () => { if(sendBtn) sendBtn.style.opacity = input.value.trim() ? '1' : '0.6'; });
  }
  document.addEventListener('click', e => { if (e.target.classList.contains('qr-btn')) send(e.target.dataset.q); });
})();


// ================================================================
// 17. GLOWING MOUSE TRAIL (premium touch)
// ================================================================
(function initMouseTrail() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const trailCanvas = document.createElement('canvas');
  trailCanvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;opacity:0.35;';
  hero.style.position = 'relative';
  hero.appendChild(trailCanvas);

  const ctx2 = trailCanvas.getContext('2d');
  let w, h;
  function resize() {
    w = trailCanvas.width  = hero.clientWidth;
    h = trailCanvas.height = hero.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const trail = [];
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    trail.push({ x: e.clientX - r.left, y: e.clientY - r.top, life: 1 });
    if (trail.length > 40) trail.shift();
  });

  function drawTrail() {
    ctx2.clearRect(0, 0, w, h);
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i];
      p.life -= 0.035;
      if (p.life <= 0) { trail.splice(i, 1); continue; }
      ctx2.beginPath();
      const grad = ctx2.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18);
      grad.addColorStop(0, `rgba(6,214,250,${p.life * 0.55})`);
      grad.addColorStop(1, 'transparent');
      ctx2.fillStyle = grad;
      ctx2.arc(p.x, p.y, 18, 0, Math.PI * 2);
      ctx2.fill();
    }
    requestAnimationFrame(drawTrail);
  }
  drawTrail();
})();


// ================================================================
// 18. SECTION HEADER HIGHLIGHT ON ENTER
// ================================================================
(function initSectionHighlights() {
  const headerObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('section-header-active');
    });
  }, { threshold: 0.3 });

  $$('.section-header').forEach(h => headerObs.observe(h));
})();


// ================================================================
// 19. BENTO CARD SHIMMER on hover (CSS driven, JS triggers)
// ================================================================
(function initBentoCards() {
  $$('.bento-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width)  * 100;
      const y = ((e.clientY - r.top)  / r.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });
})();


// ================================================================
// 20. FLOATING ORBIT TAGS — subtle parallax with scroll
// ================================================================
(function initFloatTagParallax() {
  const tags = $$('.float-tag');
  if (!tags.length) return;

  let heroTop = 0;
  function update() {
    heroTop = window.scrollY * 0.06;
    tags.forEach((tag, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      tag.style.transform = `translateY(${heroTop * dir * (i + 1) * 0.4}px)`;
    });
    requestAnimationFrame(update);
  }
  update();
})();

// ================================================================
// 21. SCROLL REVEAL OBSERVER & LEVITATION (Triggers animations on scroll)
// ================================================================
(function initScrollReveals() {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('active');
        
        // Let CSS slide-up transition complete (800ms) before floating
        setTimeout(() => {
          const addLev = (el) => {
            el.classList.add('levitate');
            const dur = 3 + (Math.random() * 2);
            el.style.animationDuration = dur.toFixed(1) + 's';
          };
          if (e.target.classList.contains('surface-card') || e.target.classList.contains('bento-card')) {
            addLev(e.target);
          }
          // Also apply to children (like cards inside timeline items)
          e.target.querySelectorAll('.surface-card, .bento-card').forEach(addLev);
        }, 800);
        
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  $$('.reveal-up, .reveal-left, .reveal-right').forEach(el => revealObs.observe(el));
})();