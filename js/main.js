/**
 * Mirocam Web — Interactive Simulator & Enhancements
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Film Recipe Configurations
  const recipes = {
    portra: {
      name: 'Portra 400',
      tag: 'KODAK PORTRA 400',
      iso: 'ISO 400',
      ss: '1/250s',
      wb: '5200K',
      filter: 'contrast(1.08) saturate(1.12) sepia(0.18) brightness(1.02)',
      halation: 0.35,
      image: 'assets/hero_sample.jpg'
    },
    velvia: {
      name: 'Velvia 50',
      tag: 'FUJIFILM VELVIA 50',
      iso: 'ISO 50',
      ss: '1/125s',
      wb: '5600K',
      filter: 'contrast(1.35) saturate(1.45) hue-rotate(-5deg) brightness(0.98)',
      halation: 0.15,
      image: 'assets/velvia_sample.jpg'
    },
    cinestill: {
      name: 'CineStill 800T',
      tag: 'CINESTILL 800T',
      iso: 'ISO 800',
      ss: '1/60s',
      wb: '3200K (T)',
      filter: 'contrast(1.15) saturate(1.05) hue-rotate(18deg) brightness(1.05)',
      halation: 0.75,
      image: 'assets/hero_sample.jpg'
    },
    chrome: {
      name: 'Classic Chrome',
      tag: 'FUJI CLASSIC CHROME',
      iso: 'ISO 200',
      ss: '1/500s',
      wb: '5800K',
      filter: 'contrast(1.22) saturate(0.82) sepia(0.1) brightness(0.97)',
      halation: 0.2,
      image: 'assets/hero_sample.jpg'
    },
    trix: {
      name: 'Tri-X 400',
      tag: 'KODAK TRI-X 400 (B&W)',
      iso: 'ISO 400',
      ss: '1/500s',
      wb: 'MONO',
      filter: 'grayscale(1) contrast(1.4) brightness(0.95)',
      halation: 0.0,
      image: 'assets/hero_sample.jpg'
    }
  };

  let activeRecipeKey = 'portra';
  const viewfinderImg = document.getElementById('vfImage');
  const hudBadge = document.getElementById('vfBadge');
  const hudIso = document.getElementById('vfIso');
  const hudSs = document.getElementById('vfSs');
  const hudWb = document.getElementById('vfWb');
  const halationEl = document.getElementById('vfHalation');
  const expCounter = document.getElementById('vfExp');

  const grainSlider = document.getElementById('grainSlider');
  const halationSlider = document.getElementById('halationSlider');
  const grainVal = document.getElementById('grainVal');
  const halationVal = document.getElementById('halationVal');

  let currentExp = 24;

  function updateViewfinder() {
    const r = recipes[activeRecipeKey];
    if (!r) return;

    hudBadge.textContent = r.tag;
    hudIso.textContent = r.iso;
    hudSs.textContent = r.ss;
    hudWb.textContent = r.wb;

    if (viewfinderImg.getAttribute('src') !== r.image) {
      viewfinderImg.style.opacity = '0.4';
      setTimeout(() => {
        viewfinderImg.src = r.image;
        viewfinderImg.style.opacity = '1';
      }, 150);
    }

    const grainPercent = grainSlider ? grainSlider.value : 35;
    const halationPercent = halationSlider ? halationSlider.value : (r.halation * 100);

    // Apply calculated CSS filters
    viewfinderImg.style.filter = r.filter;
    if (halationEl) {
      halationEl.style.opacity = (halationPercent / 100).toFixed(2);
    }
  }

  // Recipe buttons
  const recipeButtons = document.querySelectorAll('.recipe-btn');
  recipeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      recipeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const recipeKey = btn.dataset.recipe;
      if (recipeKey && recipes[recipeKey]) {
        activeRecipeKey = recipeKey;
        if (halationSlider) {
          halationSlider.value = Math.round(recipes[recipeKey].halation * 100);
          halationVal.textContent = halationSlider.value + '%';
        }
        updateViewfinder();
        playShutterSound(0.08);
      }
    });
  });

  // Slider adjustments
  if (grainSlider) {
    grainSlider.addEventListener('input', (e) => {
      grainVal.textContent = e.target.value + '%';
      updateViewfinder();
    });
  }

  if (halationSlider) {
    halationSlider.addEventListener('input', (e) => {
      halationVal.textContent = e.target.value + '%';
      updateViewfinder();
    });
  }

  // Shutter sound generator using Web Audio API
  function playShutterSound(volume = 0.15) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Blade click 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1400, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
      gain1.gain.setValueAtTime(volume, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.04);

      // Blade click 2 (rebound)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(800, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);
        gain2.gain.setValueAtTime(volume * 0.8, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.05);
      }, 55);
    } catch (e) {
      // AudioContext unavailable or blocked
    }
  }

  // Click viewfinder to trigger simulated exposure shot
  const vfBezel = document.getElementById('vfBezel');
  if (vfBezel) {
    vfBezel.addEventListener('click', () => {
      playShutterSound(0.25);
      vfBezel.style.transform = 'scale(0.985)';
      const flash = document.createElement('div');
      flash.style.position = 'absolute';
      flash.style.inset = '0';
      flash.style.background = '#fff';
      flash.style.zIndex = '50';
      flash.style.opacity = '0.85';
      flash.style.pointerEvents = 'none';
      flash.style.transition = 'opacity 0.25s ease';
      vfBezel.appendChild(flash);

      setTimeout(() => {
        flash.style.opacity = '0';
        vfBezel.style.transform = 'none';
        setTimeout(() => flash.remove(), 260);
      }, 40);

      currentExp++;
      if (currentExp > 36) currentExp = 1;
      if (expCounter) expCounter.textContent = `EXP ${currentExp}/36`;
    });
  }

  // 2. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  // 3. Privacy Policy Modal
  const modal = document.getElementById('privacyModal');
  const openButtons = document.querySelectorAll('[data-modal="privacy"]');
  const closeBtn = document.getElementById('modalClose');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.classList.add('open');
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  // Initialize
  updateViewfinder();
});
