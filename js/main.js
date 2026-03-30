// Small UI helpers: nav toggle, scroll reveals, year, smooth scroll, simple typing
(function () {
  // set year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // nav toggle for small screens
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const expanded = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!expanded));
      nav.style.display = expanded ? "" : "flex";
    });
  }

  // smooth scrolling for internal links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href && href.startsWith("#")) {
        const dest = document.querySelector(href);
        if (dest) {
          e.preventDefault();
          dest.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // intersection observer for reveal animation
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // tiny headline typing loop
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    const phrases = ["Frontend developer.", "UI engineer.", "Animation lover."];
    let i = 0,
      j = 0,
      dir = 1; // simple cycle
    const span = document.createElement("span");
    span.style.color = "var(--muted)";
    span.style.marginLeft = "0.6rem";
    heroTitle.appendChild(span);
    function tick() {
      const phrase = phrases[i];
      span.textContent = phrase.slice(0, j);
      j += dir;
      if (j > phrase.length) {
        dir = -1;
        j = phrase.length;
        setTimeout(tick, 900);
        return;
      }
      if (j < 0) {
        dir = 1;
        j = 0;
        i = (i + 1) % phrases.length;
      }
      setTimeout(tick, 80);
    }
    tick();
  }

  // small hover tilt effect for project cards
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
})();

// Submit/Contact form handling (attach handler to prevent navigation)
function attachFormHandler() {
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      userData();
    });
  }
}

// Initialize Lottie animation if container exists
function initLottie() {
  const container = document.querySelector(".hero-lottie");
  if (!container || !window.lottie) return;
  try {
    lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: true,
      // lightweight generic animation; user can replace with their JSON
      path: "https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json",
    });
  } catch (e) {
    console.warn("Lottie init failed", e);
  }
}

// Project preview video play/pause and lazy set src (data-video)
function initProjectPreviews() {
  document.querySelectorAll(".project-card").forEach((card) => {
    const video = card.querySelector("video.project-video");
    if (!video) return;
    const src = video.getAttribute("data-src");
    card.addEventListener("mouseenter", () => {
      if (src && !video.src) video.src = src;
      video.play().catch(() => {});
    });
    card.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}

// Back to top button behaviour
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) btn.classList.add("show");
    else btn.classList.remove("show");
  });
  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

// Simple testimonials auto-scroll
function initTestimonials() {
  const wrap = document.querySelector(".test-slider");
  if (!wrap) return;

  // Observe each testimonial and add .in-view when it's visible
  const items = Array.from(wrap.querySelectorAll(".testimonial"));
  const thr = 0.45;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((ent) => {
        if (ent.isIntersecting) {
          ent.target.classList.add("in-view");
        }
      });
    },
    { threshold: thr, root: wrap },
  );
  items.forEach((it) => io.observe(it));

  // Enable pointer drag to scroll the slider for a better UX on desktop
  let isDown = false;
  let startX, scrollLeft;
  wrap.addEventListener("pointerdown", (e) => {
    isDown = true;
    wrap.classList.add("dragging");
    startX = e.pageX - wrap.offsetLeft;
    scrollLeft = wrap.scrollLeft;
    wrap.setPointerCapture(e.pointerId);
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - wrap.offsetLeft;
    const walk = (x - startX) * 1.2; // scroll-fast
    wrap.scrollLeft = scrollLeft - walk;
  });
  wrap.addEventListener("pointerup", (e) => {
    isDown = false;
    wrap.classList.remove("dragging");
    try {
      wrap.releasePointerCapture(e.pointerId);
    } catch (e) {}
  });
  wrap.addEventListener("pointerleave", () => {
    isDown = false;
    wrap.classList.remove("dragging");
  });
}

// Custom cursor follow
function initCustomCursor() {
  const cur = document.querySelector(".custom-cursor");
  if (!cur) return;
  window.addEventListener("mousemove", (e) => {
    cur.style.left = e.clientX + "px";
    cur.style.top = e.clientY + "px";
  });
}

// Preloader hide after load
function hidePreloader() {
  const p = document.querySelector(".preloader");
  if (!p) return;
  window.addEventListener("load", () => {
    p.style.opacity = "0";
    setTimeout(() => p.remove(), 450);
  });
}

// Cursor trailing halo removed per user request

// Lightweight WebAudio click/pop sound (very low volume)
let __audioCtx = null;
function initSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    __audioCtx = new AC();
    // resume on first gesture to allow autoplay in browsers
    const resume = () => {
      if (__audioCtx.state === "suspended") __audioCtx.resume();
      window.removeEventListener("pointerdown", resume);
    };
    window.addEventListener("pointerdown", resume, { once: true });

    function clickSound() {
      if (!__audioCtx) return;
      const o = __audioCtx.createOscillator();
      const g = __audioCtx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.0022; // very soft
      o.connect(g);
      g.connect(__audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(
        0.00001,
        __audioCtx.currentTime + 0.12,
      );
      o.stop(__audioCtx.currentTime + 0.12);
    }

    document.querySelectorAll("button, a.btn").forEach((el) => {
      el.addEventListener("click", () => {
        try {
          clickSound();
        } catch (e) {}
      });
    });
  } catch (e) {
    // ignore
  }
}

// Initialize VanillaTilt for nicer tilt + glare
function initVanillaTilt() {
  if (!window.VanillaTilt) return;
  const nodes = document.querySelectorAll(".project-card");
  if (!nodes.length) return;
  VanillaTilt.init(nodes, {
    max: 12,
    speed: 400,
    glare: true,
    "max-glare": 0.22,
    scale: 1.03,
  });
}

// GSAP/ScrollTrigger animations and simple parallax
function initGSAP() {
  if (!window.gsap || !window.ScrollTrigger) return;
  try {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray(".project-media img").forEach((img) => {
      gsap.to(img, {
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: img,
          start: "top 85%",
          end: "bottom 20%",
          scrub: true,
        },
      });
    });

    // small hero title reveal with GSAP
    gsap.from(".hero-title", {
      y: 32,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
    });

    // parallax - elements with data-parallax
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const depth = parseFloat(el.getAttribute("data-parallax")) || 0.18;
      gsap.to(el, {
        yPercent: depth * -12,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  } catch (e) {
    console.warn("GSAP init failed", e);
  }
}

// Simple Three.js floating object (lightweight)
function initThreeScene() {
  const container = document.getElementById("threeContainer");
  if (!container || !window.THREE) return;
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.z = 3;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);

    const geo = new THREE.TorusKnotGeometry(0.6, 0.16, 128, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      metalness: 0.25,
      roughness: 0.35,
      emissive: 0x220022,
      emissiveIntensity: 0.04,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const p = new THREE.PointLight(0xffffff, 0.9);
    p.position.set(2, 2, 2);
    scene.add(p);

    function animate() {
      requestAnimationFrame(animate);
      mesh.rotation.x += 0.005;
      mesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
  } catch (e) {
    console.warn("Three init failed", e);
  }
}

// Page transitions for internal nav links (overlay)
function initPageTransitions() {
  const overlay = document.getElementById("pageTransition");
  if (!overlay) return;
  // only for site nav anchors
  document.querySelectorAll(".nav a, .hero-cta a").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return; // external links unaffected
      e.preventDefault();
      overlay.classList.add("show");
      setTimeout(() => {
        const dest = document.querySelector(href);
        if (dest) dest.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => overlay.classList.remove("show"), 650);
      }, 180);
    });
  });
}

// Magnet effect for social icons
function initMagnet() {
  const wrap = document.querySelector(".social");
  if (!wrap) return;
  const items = Array.from(wrap.querySelectorAll("a"));
  const strength = 36; // px max
  wrap.addEventListener("mousemove", (e) => {
    const mx = e.clientX;
    const my = e.clientY;
    items.forEach((it) => {
      const rect = it.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 220;
      const force = Math.max(0, (maxDist - dist) / maxDist);
      const tx = (dx / (dist || 1)) * strength * force * 0.7;
      const ty = (dy / (dist || 1)) * strength * force * 0.7;
      it.style.transform = `translate(${tx}px, ${ty}px)`;
    });
  });
  wrap.addEventListener("mouseleave", () => {
    items.forEach((it) => (it.style.transform = ""));
  });
}

// Live preview modal (iframe)
function initLivePreview() {
  const modal = document.getElementById("liveModal");
  if (!modal) return;
  const iframe = document.getElementById("liveIframe");
  const closeBtn = modal.querySelector(".live-modal-close");
  const backdrop = modal.querySelector(".live-modal-backdrop");

  function open(url) {
    iframe.src = url;
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function close() {
    modal.classList.remove("show");
    iframe.src = "about:blank";
    document.body.style.overflow = "";
  }

  document.querySelectorAll("a.live-preview").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const url = a.dataset.liveUrl || a.href;
      if (!url) return;
      open(url);
    });
  });

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  window.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") close();
  });
}

// Easter egg: key sequence 'D','E','V'
function initEasterEgg() {
  const seq = [];
  const target = ["d", "e", "v"];
  window.addEventListener("keydown", (e) => {
    seq.push(e.key.toLowerCase());
    if (seq.slice(-3).join("") === target.join("")) {
      console.log("Salom, dasturchi do'stim!");
      const root = document.documentElement;
      const prev = getComputedStyle(root).getPropertyValue("--accent");
      root.style.setProperty("--accent", "#ff2d95");
      document.body.classList.add("egg-flash");
      setTimeout(() => {
        root.style.setProperty("--accent", prev || "#7c3aed");
        document.body.classList.remove("egg-flash");
      }, 3500);
    }
  });
}

// Initialize small UI extras
document.addEventListener("DOMContentLoaded", () => {
  initLottie();
  initProjectPreviews();
  initBackToTop();
  initTestimonials();
  initCustomCursor();
  hidePreloader();
  initMagnet();
  initLivePreview();
  initEasterEgg();
  initSound();
  initVanillaTilt();
  initGSAP();
  initThreeScene();
  initPageTransitions();
  initReadModal();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", attachFormHandler);
} else {
  attachFormHandler();
}

async function userData() {
  const nameEl = document.querySelector("#username");
  const emailEl = document.querySelector("#useremail");
  const msgEl = document.querySelector("#usermessage");
  const submitBtn = document.querySelector("#subBtn");

  if (!nameEl || !emailEl || !msgEl || !submitBtn) {
    console.error("Form elements missing");
    return;
  }

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const message = msgEl.value.trim();

  if (!name || !email) {
    if (window.Swal)
      Swal.fire({
        title: "Eslatma",
        text: "Iltimos, ism va emailni kiriting!",
        icon: "warning",
      });
    else alert("Iltimos, ism va emailni kiriting!");
    return;
  }

  submitBtn.disabled = true;
  const prevHTML = submitBtn.innerHTML;
  submitBtn.innerText = "Yuborilmoqda...";
  submitBtn.style.opacity = "0.5";

  try {
    // 1) Try server endpoint (recommended: deploy to Vercel with env vars)
    const res = await fetch("/api/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.ok) {
        if (window.Swal) {
          Swal.fire({
            title: "Yuborildi!",
            text: "Xabaringiz muvaffaqiyatli yuborildi.",
            icon: "success",
          });
        } else {
          alert("Yuborildi!");
        }
        // reset form
        const form = document.getElementById("contact-form");
        if (form) form.reset();
        return;
      }
      // If server returned non-ok payload, continue to fallback
      console.warn("Server returned non-ok payload", data);
    } else {
      console.warn("Send endpoint returned status", res.status);
    }

    // 2) Fallback: copy to clipboard and offer mailto
    try {
      await navigator.clipboard.writeText(
        `Name: ${name}\nEmail: ${email}\n\n${message}`,
      );
    } catch (e) {
      console.warn("Clipboard copy failed", e);
    }

    if (window.Swal) {
      const result = await Swal.fire({
        title: "Tarmoq xatosi yoki endpoint mavjud emas",
        html: "Xabar serverga yuborilmadi. Xabaringiz nusxalandi (clipboard). E-mail orqali yuborishni xohlaysizmi?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "E-mail orqali yubor",
        cancelButtonText: "Bekor qilish",
      });
      if (result.isConfirmed) {
        const body = encodeURIComponent(
          `Ism: ${name}\nEmail: ${email}\n\n${message}`,
        );
        window.location.href = `mailto:?subject=${encodeURIComponent("Portfolio contact from " + name)}&body=${body}`;
      }
    } else {
      alert("Xabaringiz nusxalandi. Iltimos, e-mail orqali yuboring.");
    }
  } catch (err) {
    console.error("Submit error", err);
    if (window.Swal)
      Swal.fire({
        title: "Xatolik",
        text: "Xabar yuborishda muammo bo'ldi.",
        icon: "error",
      });
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = prevHTML;
    submitBtn.style.opacity = "1";
  }
}
