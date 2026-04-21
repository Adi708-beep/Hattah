const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.getElementById("navLinks");
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
