const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.getElementById("navLinks");
const navActions = document.querySelector(".nav-actions");
const yearNode = document.getElementById("currentYear");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    const clickedInsideMenu = navLinks.contains(event.target);
    const clickedToggle = navToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {
      navLinks.classList.remove("open");
    }
  });

  // Close menu when links are clicked
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

// Handle nav-actions on mobile
if (navActions) {
  document.addEventListener("click", (event) => {
    const clickedInsideActions = navActions.contains(event.target);
    const clickedToggle = navToggle && navToggle.contains(event.target);

    if (!clickedInsideActions && !clickedToggle) {
      navActions.classList.remove("open");
    }
  });

  // Close actions when links are clicked
  navActions.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navActions.classList.remove("open");
    });
  });
}

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const path = window.location.pathname;
const links = document.querySelectorAll("[data-nav]");

links.forEach((link) => {
  const href = link.getAttribute("href");

  if (href && (path.endsWith(href) || (href === "/index.html" && path === "/"))) {
    link.classList.add("active");
  }

  link.addEventListener("click", () => {
    if (navLinks) {
      navLinks.classList.remove("open");
    }
  });
});
