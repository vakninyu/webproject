document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const modal = document.getElementById("successModal");
  const closeBtn = document.getElementById("closeModal");

  if (!form || !modal || !closeBtn) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    form.reset();
    modal.style.display = "flex";
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // סגירה בלחיצה מחוץ לחלונית
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
