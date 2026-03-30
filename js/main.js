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
