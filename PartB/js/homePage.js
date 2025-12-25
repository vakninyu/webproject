// Wait until the HTML is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    // Grab main elements from the DOM
  const form = document.getElementById("contactForm");
  const modal = document.getElementById("successModal");
  const closeBtn = document.getElementById("closeModal");

    // Safety check: stop if one of the elements is missing
  if (!form || !modal || !closeBtn) return;

    // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)

    form.reset(); // Clear all form fields
    modal.style.display = "flex"; // Show the success modal
  });

    // Close modal when clicking the close button
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

    // Close modal when clicking outside the modal content
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  // ===== Reveal animation on scroll (About section) =====
const revealEls = document.querySelectorAll(".reveal");

  // Create an IntersectionObserver to detect when elements enter the viewport
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible"); // Add class to trigger CSS animation
        io.unobserve(entry.target); // Stop observing once revealed
      }
    });
  },
  { threshold: 0.12 } // Element becomes visible when ~12% is in view
);
  // Start observing each reveal element
revealEls.forEach((el) => io.observe(el)); 

});
