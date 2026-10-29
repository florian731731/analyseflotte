document.querySelector('.nav-toggle')?.addEventListener('click',()=>document.querySelector('.nav')?.classList.toggle('open'));
// === ANIMATION DASHBOARD ===
function animateCounters() {
  document.querySelectorAll('.dash-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const value = Math.round(ease * target);
      el.textContent = prefix + value.toLocaleString('fr-FR') + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
  // Animer les barres
  setTimeout(() => {
    document.querySelectorAll('.dash-fill').forEach(el => {
      const w = el.style.width;
      el.style.width = '0';
      setTimeout(() => { el.style.width = w; }, 50);
    });
  }, 200);
}

// Déclencher quand le dashboard est visible
const dashObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounters(); dashObs.disconnect(); }});
}, { threshold: 0.3 });
const dash = document.querySelector('.gps-dashboard');
if (dash) dashObs.observe(dash);

// === ANIMATION CARTE FRANCE ===
function animateMap() {
  // Animer les routes
  document.querySelectorAll('.fmap-route').forEach((el, i) => {
    setTimeout(() => el.classList.add('animated'), i * 400 + 200);
  });
  // Animer les villes avec délai
  document.querySelectorAll('.fmap-city').forEach((el, i) => {
    setTimeout(() => el.classList.add('animated'), i * 200 + 300);
  });
  // Animer les labels
  document.querySelectorAll('.fmap-label').forEach((el, i) => {
    setTimeout(() => el.classList.add('animated'), i * 200 + 500);
  });
  // Compter les villes
  document.querySelectorAll('.fmap-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      el.textContent = count;
      if (count >= target) clearInterval(interval);
    }, 40);
  });
}

const mapObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateMap(); mapObs.disconnect(); }});
}, { threshold: 0.3 });
const fmap = document.querySelector('.france-map-card-v2');
if (fmap) mapObs.observe(fmap);

// === REVEAL ON SCROLL ===
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 100);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// === BARRES COÛTS ===
const coutObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.cout-fill').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = w; }, 100);
      });
      coutObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.cout-grid').forEach(el => coutObs.observe(el));

// === KPI COUNTER ===
const kpiObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.kpi-num').forEach(el => {
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        let count = 0;
        const inc = Math.ceil(target / 40);
        const interval = setInterval(() => {
          count = Math.min(count + inc, target);
          el.textContent = count + suffix;
          if (count >= target) clearInterval(interval);
        }, 35);
      });
      kpiObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.kpi-grid').forEach(el => kpiObs.observe(el));

// === CALCULATEUR ECONOMIES ===
function updateCalc() {
  const veh = parseInt(document.getElementById('nb-veh')?.value || 5);
  const km = parseInt(document.getElementById('nb-km')?.value || 100);
  const carb = parseFloat(document.getElementById('prix-carb')?.value || 1.8);
  
  document.getElementById('val-veh') && (document.getElementById('val-veh').textContent = veh);
  document.getElementById('val-km') && (document.getElementById('val-km').textContent = km);
  document.getElementById('val-carb') && (document.getElementById('val-carb').textContent = carb.toFixed(2) + '€');

  // Calculs: 10% de km en moins, conso 8L/100km
  const kmEvites = Math.round(km * 0.10 * veh * 20);
  const ecoCarb = Math.round(kmEvites * 0.08 * carb);
  const ecoAn = ecoCarb * 12;

  document.getElementById('eco-carb') && (document.getElementById('eco-carb').textContent = ecoCarb.toLocaleString('fr-FR') + '€');
  document.getElementById('eco-km') && (document.getElementById('eco-km').textContent = kmEvites.toLocaleString('fr-FR') + ' km');
  document.getElementById('eco-an') && (document.getElementById('eco-an').textContent = ecoAn.toLocaleString('fr-FR') + '€');
}
['nb-veh','nb-km','prix-carb'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateCalc);
});
updateCalc();

// === FORMULAIRES WEB3FORMS (AJAX, message de succès en français, sans redirection) ===
document.querySelectorAll('form[action="https://api.web3forms.com/submit"]').forEach(form => {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const btnLabel = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours...'; }

    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    delete object.redirect; // on gère l'affichage nous-mêmes, pas besoin de redirection
    const json = JSON.stringify(object);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: json
    })
      .then(async (response) => {
        const result = await response.json();
        if (response.status === 200) {
          form.innerHTML =
            '<div class="form-success">' +
              '<div class="form-success-icon">✓</div>' +
              '<h3>Merci, votre demande a bien été envoyée !</h3>' +
              '<p>Florian vous recontacte sous 24h pour votre analyse gratuite.</p>' +
            '</div>';
        } else {
          if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
          alert("Une erreur est survenue lors de l'envoi. Merci de réessayer, ou de nous contacter directement au 07 43 69 63 07.");
        }
      })
      .catch(() => {
        if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
        alert("Une erreur est survenue lors de l'envoi. Merci de réessayer, ou de nous contacter directement au 07 43 69 63 07.");
      });
  });
});

// === RÉACTIVITÉ SOURIS ===
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // Radar lumineux qui suit le curseur sur le tableau de bord (thème "suivi en direct")
  const dashboardEl = document.querySelector('.gps-dashboard');
  if (dashboardEl) {
    dashboardEl.addEventListener('mousemove', (e) => {
      const rect = dashboardEl.getBoundingClientRect();
      dashboardEl.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      dashboardEl.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      dashboardEl.classList.add('glow-active');
    });
    dashboardEl.addEventListener('mouseleave', () => dashboardEl.classList.remove('glow-active'));
  }

  // Léger effet 3D au survol des cartes (discret, cohérent sur tout le site)
  const tiltSelector = '.cout-card, .sol-card, .secteur-big, .blog-card, .cards article, .feature-list article';
  document.querySelectorAll(tiltSelector).forEach(card => {
    card.classList.add('tilt-card');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - py) * 6;
      const rotateY = (px - 0.5) * 6;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}
