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

// ==================== THEME TOGGLE ====================
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

const savedTheme = localStorage.getItem("theme") || "dark";
if (savedTheme === "light") {
  document.body.classList.add("light");
  if (themeIcon) themeIcon.className = "fa-solid fa-moon";
}

if (themeToggle && themeIcon) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    themeIcon.className = isLight ? "fa-solid fa-moon" : "fa-solid fa-sun";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

// ==================== TRANSLATIONS ====================
const translations = {
  en: {
    site_brand: "Mubina",
    nav_about: "About",
    nav_skills: "Skills",
    nav_projects: "Projects",
    nav_contact: "Contact",
    nav_aria_menu: "Toggle navigation",
    theme_toggle_title: "Toggle theme",
    hero_hi: "Hi, I'm",
    hero_name: "Mubina",
    hero_sub:
      "Frontend developer at an IT center — learning by shipping real projects, from healthcare concepts to music players and productivity tools.",
    hero_btn_work: "See my work",
    hero_btn_contact: "Contact",
    hero_btn_cv: "Download CV",
    hero_tagline_1: "Frontend developer.",
    hero_tagline_2: "Building real projects.",
    hero_tagline_3: "Learning fast.",
    about_title: "About me",
    about_lead:
      "I'm <strong>Mubina Naziraliyeva</strong>, a frontend developer currently completing my studies at an IT center. Over the past 7–8 months, I've been actively learning and building real projects — from healthcare concept sites to music players and productivity tools.",
    about_p:
      "I'm still growing, but I learn fast and I enjoy turning ideas into working interfaces. Every project I build teaches me something new.",
    about_btn_touch: "Get in touch",
    about_btn_work: "See work",
    skills_title: "Skills",
    skill_html_title: "HTML",
    skill_html_desc: "Semantic markup and page structure.",
    skill_css_title: "CSS",
    skill_css_desc: "Layouts, styling, and basic animations.",
    skill_js_title: "JavaScript",
    skill_js_desc: "DOM manipulation, events, and API calls.",
    skill_tailwind_title: "Tailwind CSS",
    skill_tailwind_desc: "Utility-first styling for fast layout and design.",
    skill_daisy_title: "DaisyUI",
    skill_daisy_desc: "Component-based UI on top of Tailwind.",
    skill_github_title: "GitHub",
    skill_github_desc: "Version control and keeping code organized.",
    skill_vercel_title: "Vercel",
    skill_vercel_desc: "Deploying projects and sharing live demos.",
    projects_title: "Projects",
    proj_live: "Live",
    meta_vercel: "Vercel",
    proj_ai_title: "AI Doktor",
    proj_ai_desc:
      "A concept platform for how AI could support healthcare — diagnostics, patient monitoring, and virtual consultations. Built with HTML, CSS, JavaScript, Tailwind, and DaisyUI.",
    proj_ai_stack: "HTML / CSS / JS",
    proj_music_title: "Music Player with AI",
    proj_music_desc:
      "A music player web app with a modern dark interface. Deployed on Vercel.",
    proj_music_meta: "Frontend",
    proj_todo_title: "Just Do It",
    proj_todo_desc:
      "A simple task management and productivity app — organize work in the browser.",
    proj_todo_meta: "Productivity",
    proj_book_title: "Tech Book",
    proj_book_desc:
      "A dark-themed technical blog interface — reading-focused UI on the web.",
    proj_book_meta: "Blog UI",
    proj_img_title: "Random Image",
    proj_img_desc:
      "A fun mini-app that generates random images — quick fetch and display practice.",
    proj_img_meta: "Mini app",
    proj_color_title: "Random Color",
    proj_color_desc:
      "A simple color generator — click, copy, and explore palettes in the browser.",
    proj_color_meta: "Tools",
    proj_ny_title: "New Year Page",
    proj_ny_desc:
      "A festive New Year themed landing page — layout, mood, and seasonal styling.",
    proj_ny_meta: "Landing",
    contact_title: "Contact",
    contact_p:
      "I'm open to junior frontend roles and internship opportunities. Feel free to reach out — or message me on Telegram <a href='https://t.me/Mubina0610' rel='noopener noreferrer'>@Mubina0610</a>.",
    contact_note:
      "You can also use the form below; I'll get back to you as soon as I can.",
    form_name: "Name",
    form_email: "Email",
    form_message: "Message",
    form_send: "Send message",
    footer_tagline: "Mubina Naziraliyeva — Frontend Developer",
    modal_close_aria: "Close preview",
    modal_iframe_title: "Live preview",
    back_top_aria: "Back to top",
    back_top_title: "Back to top",
    exp_title: "Experience",
    exp_p:
      "7–8 months of focused practice — shipping real interfaces and learning from each build.",
    edu_title: "Education",
    edu_p: "Completing frontend studies at an IT center.",
    int_title: "Interests",
    int_p:
      "Clean UI, practical JavaScript, and projects that solve small real problems.",
  },
  uz: {
    site_brand: "Mubina",
    nav_about: "Haqimda",
    nav_skills: "Ko'nikmalar",
    nav_projects: "Loyihalar",
    nav_contact: "Bog'lanish",
    nav_aria_menu: "Navigatsiyani ochish/yopish",
    theme_toggle_title: "Mavzuni almashtirish",
    hero_hi: "Salom, men",
    hero_name: "Mubina",
    hero_sub:
      "IT markazida frontend dasturlashni o'rganmoqdaman — tibbiyot konseptlaridan tortib musiqa playerlari va produktivlik ilovalarigacha real loyihalar yarataman.",
    hero_btn_work: "Ishlarimni ko'rish",
    hero_btn_contact: "Bog'lanish",
    hero_btn_cv: "CV yuklab olish",
    hero_tagline_1: "Frontend dasturchi.",
    hero_tagline_2: "Real loyihalar yarataman.",
    hero_tagline_3: "Tez o'rganaman.",
    about_title: "Men haqimda",
    about_lead:
      "Men <strong>Mubina Naziraliyeva</strong>, IT markazida frontend dasturlashni o'rganayotgan dasturchiman. So'nggi 7–8 oy ichida tibbiyot saytlari, musiqa playerlari va produktivlik vositalarigacha real loyihalar ustida ishladim.",
    about_p:
      "Hali o'sib bormoqdaman, lekin tez o'rganaman va g'oyalarni ishlaydigan interfeyslarga aylantirish menga zavq beradi. Har bir loyihadan yangi narsa o'rganaman.",
    about_btn_touch: "Aloqaga chiqish",
    about_btn_work: "Loyihalarni ko'rish",
    skills_title: "Ko'nikmalar",
    skill_html_title: "HTML",
    skill_html_desc: "Semantik markup va sahifa tuzilmasi.",
    skill_css_title: "CSS",
    skill_css_desc: "Layout, uslub va oddiy animatsiyalar.",
    skill_js_title: "JavaScript",
    skill_js_desc: "DOM, hodisalar va API bilan ishlash.",
    skill_tailwind_title: "Tailwind CSS",
    skill_tailwind_desc: "Tez layout va dizayn uchun utility-first uslub.",
    skill_daisy_title: "DaisyUI",
    skill_daisy_desc: "Tailwind ustidagi komponentli UI.",
    skill_github_title: "GitHub",
    skill_github_desc: "Versiya nazorati va kodni tartibda saqlash.",
    skill_vercel_title: "Vercel",
    skill_vercel_desc: "Loyihalarni joylashtirish va jonli demo ulashish.",
    projects_title: "Loyihalar",
    proj_live: "Jonli",
    meta_vercel: "Vercel",
    proj_ai_title: "AI Doktor",
    proj_ai_desc:
      "AI tibbiyotda qanday yordam berishi mumkinligi bo'yicha konsept — diagnostika, monitoring va virtual maslahat. HTML, CSS, JavaScript, Tailwind va DaisyUI.",
    proj_ai_stack: "HTML / CSS / JS",
    proj_music_title: "Music Player with AI",
    proj_music_desc:
      "Zamonaviy qorong'u interfeysli musiqa player veb-ilovasi. Vercelda joylashtirilgan.",
    proj_music_meta: "Frontend",
    proj_todo_title: "Just Do It",
    proj_todo_desc:
      "Vazifalar va produktivlik uchun oddiy ilova — brauzerda ishni tartibga solish.",
    proj_todo_meta: "Produktivlik",
    proj_book_title: "Tech Book",
    proj_book_desc:
      "Texnik blog uchun qorong'u interfeys — o'qishga qulay UI.",
    proj_book_meta: "Blog UI",
    proj_img_title: "Random Image",
    proj_img_desc:
      "Tasodifiy rasmlar yaratadigan mini-ilova — fetch va ko'rsatish mashqi.",
    proj_img_meta: "Mini ilova",
    proj_color_title: "Random Color",
    proj_color_desc:
      "Oddiy rang generatori — brauzerda bosish, nusxalash va palitralar.",
    proj_color_meta: "Vositalar",
    proj_ny_title: "New Year Page",
    proj_ny_desc:
      "Yangi yil mavzusidagi landing — layout, kayfiyat va mavsumiy uslub.",
    proj_ny_meta: "Landing",
    contact_title: "Bog'lanish",
    contact_p:
      "Junior frontend yoki amaliyot imkoniyatlariga ochiqman. Telegram orqali yozishingiz mumkin: <a href='https://t.me/Mubina0610' rel='noopener noreferrer'>@Mubina0610</a>.",
    contact_note:
      "Quyidagi formadan ham foydalanishingiz mumkin; imkon qadar tez javob beraman.",
    form_name: "Ism",
    form_email: "Email",
    form_message: "Xabar",
    form_send: "Xabar yuborish",
    footer_tagline: "Mubina Naziraliyeva — Frontend dasturchi",
    modal_close_aria: "Oldindan ko'rishni yopish",
    modal_iframe_title: "Jonli ko'rish",
    back_top_aria: "Yuqoriga",
    back_top_title: "Yuqoriga",
    exp_title: "Tajriba",
    exp_p:
      "7–8 oy amaliy mashq — real interfeyslar yaratish va har bir loyihadan o'rganish.",
    edu_title: "Ta'lim",
    edu_p: "IT markazida frontend dasturlash bo'yicha o'qishni yakunlamoqdaman.",
    int_title: "Qiziqishlar",
    int_p:
      "Toza UI, amaliy JavaScript va kichik muammolarni hal qiladigan loyihalar.",
  },
  ru: {
    site_brand: "Mubina",
    nav_about: "Обо мне",
    nav_skills: "Навыки",
    nav_projects: "Проекты",
    nav_contact: "Контакт",
    nav_aria_menu: "Открыть или закрыть меню",
    theme_toggle_title: "Переключить тему",
    hero_hi: "Привет, я",
    hero_name: "Мубина",
    hero_sub:
      "Frontend-разработчик в IT-центре — учусь на реальных проектах: от медицинских концептов до музыкальных плееров и инструментов продуктивности.",
    hero_btn_work: "Смотреть работы",
    hero_btn_contact: "Связаться",
    hero_btn_cv: "Скачать CV",
    hero_tagline_1: "Frontend-разработчик.",
    hero_tagline_2: "Создаю реальные проекты.",
    hero_tagline_3: "Быстро учусь.",
    about_title: "Обо мне",
    about_lead:
      "Я <strong>Мубина Назиралиева</strong>, frontend-разработчик, завершающая обучение в IT-центре. За последние 7–8 месяцев я активно училась и создавала реальные проекты — от медицинских концептов до музыкальных плееров и продуктивности.",
    about_p:
      "Я продолжаю расти, но учусь быстро и получаю удовольствие от превращения идей в работающие интерфейсы. Каждый проект чему-то меня учит.",
    about_btn_touch: "Написать",
    about_btn_work: "К проектам",
    skills_title: "Навыки",
    skill_html_title: "HTML",
    skill_html_desc: "Семантическая разметка и структура страницы.",
    skill_css_title: "CSS",
    skill_css_desc: "Вёрстка, стили и простые анимации.",
    skill_js_title: "JavaScript",
    skill_js_desc: "DOM, события и работа с API.",
    skill_tailwind_title: "Tailwind CSS",
    skill_tailwind_desc: "Utility-first стили для быстрой вёрстки.",
    skill_daisy_title: "DaisyUI",
    skill_daisy_desc: "Компонентный UI поверх Tailwind.",
    skill_github_title: "GitHub",
    skill_github_desc: "Контроль версий и порядок в коде.",
    skill_vercel_title: "Vercel",
    skill_vercel_desc: "Деплой проектов и демо-ссылки.",
    projects_title: "Проекты",
    proj_live: "Демо",
    meta_vercel: "Vercel",
    proj_ai_title: "AI Doktor",
    proj_ai_desc:
      "Концепт платформы, как ИИ может помогать в здравоохранении — диагностика, мониторинг и виртуальные консультации. HTML, CSS, JavaScript, Tailwind и DaisyUI.",
    proj_ai_stack: "HTML / CSS / JS",
    proj_music_title: "Music Player with AI",
    proj_music_desc:
      "Веб-плеер с тёмным современным интерфейсом. Развёрнуто на Vercel.",
    proj_music_meta: "Frontend",
    proj_todo_title: "Just Do It",
    proj_todo_desc:
      "Простое приложение для задач и продуктивности — в браузере.",
    proj_todo_meta: "Продуктивность",
    proj_book_title: "Tech Book",
    proj_book_desc:
      "Тёмный интерфейс технического блога — UI для чтения в вебе.",
    proj_book_meta: "Блог UI",
    proj_img_title: "Random Image",
    proj_img_desc:
      "Мини-приложение со случайными изображениями — практика fetch и отображения.",
    proj_img_meta: "Мини-приложение",
    proj_color_title: "Random Color",
    proj_color_desc:
      "Простой генератор цветов — клик, копирование и палитры в браузере.",
    proj_color_meta: "Инструменты",
    proj_ny_title: "New Year Page",
    proj_ny_desc:
      "Праздничный лендинг к Новому году — композиция, настроение и стилизация.",
    proj_ny_meta: "Лендинг",
    contact_title: "Контакт",
    contact_p:
      "Открыта к junior frontend позициям и стажировкам. Напишите в Telegram: <a href='https://t.me/Mubina0610' rel='noopener noreferrer'>@Mubina0610</a>.",
    contact_note:
      "Можно также использовать форму ниже — отвечу как можно скорее.",
    form_name: "Имя",
    form_email: "Email",
    form_message: "Сообщение",
    form_send: "Отправить",
    footer_tagline: "Мубина Назиралиева — Frontend-разработчик",
    modal_close_aria: "Закрыть предпросмотр",
    modal_iframe_title: "Живой предпросмотр",
    back_top_aria: "Наверх",
    back_top_title: "Наверх",
    exp_title: "Опыт",
    exp_p:
      "7–8 месяцев практики — реальные интерфейсы и обучение на каждом проекте.",
    edu_title: "Образование",
    edu_p: "Завершаю обучение frontend-разработке в IT-центре.",
    int_title: "Интересы",
    int_p:
      "Чистый UI, практический JavaScript и проекты, решающие реальные задачи.",
  },
};

let heroTypingTimeouts = [];
function clearHeroTyping() {
  heroTypingTimeouts.forEach(clearTimeout);
  heroTypingTimeouts = [];
}

function startHeroTyping(lang) {
  clearHeroTyping();
  const heroTitle = document.querySelector(".hero-title");
  const dict = translations[lang];
  if (!heroTitle || !dict) return;

  const phrases = [
    dict.hero_tagline_1,
    dict.hero_tagline_2,
    dict.hero_tagline_3,
  ];
  let span = heroTitle.querySelector(".hero-title-typed");
  if (!span) {
    span = document.createElement("span");
    span.className = "hero-title-typed";
    span.setAttribute("aria-live", "polite");
    span.style.color = "var(--muted)";
    span.style.marginLeft = "0.6rem";
    heroTitle.appendChild(span);
  }

  let i = 0;
  let j = 0;
  let dir = 1;

  function tick() {
    const phrase = phrases[i];
    span.textContent = phrase.slice(0, j);
    j += dir;
    if (j > phrase.length) {
      dir = -1;
      j = phrase.length;
      heroTypingTimeouts.push(setTimeout(tick, 900));
      return;
    }
    if (j < 0) {
      dir = 1;
      j = 0;
      i = (i + 1) % phrases.length;
    }
    heroTypingTimeouts.push(setTimeout(tick, 80));
  }

  tick();
}

function applyLang(lang) {
  const dict = translations[lang];
  if (!dict) return;

  document.documentElement.lang = lang === "uz" ? "uz" : lang === "ru" ? "ru" : "en";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (dict[key] !== undefined) el.title = dict[key];
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    if (dict[key] !== undefined) el.setAttribute("aria-label", dict[key]);
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
  localStorage.setItem("lang", lang);

  startHeroTyping(lang);
}

const savedLang = localStorage.getItem("lang") || "en";
applyLang(savedLang);

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => applyLang(btn.dataset.lang));
});