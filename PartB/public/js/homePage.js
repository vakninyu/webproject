// Wait until the HTML is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
    // Grab main elements from the DOM
  const form = document.getElementById("contactForm");
  const modal = document.getElementById("successModal");
  const closeBtn = document.getElementById("closeModal");

    // Safety check: stop if one of the elements is missing
  if (!form || !modal || !closeBtn) return;

    // Handle form submission
  form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form data
  const formData = new FormData(form);
  const data = {
    name: formData.get('name') || form.querySelector('input[type="text"]').value,
    email: formData.get('email') || form.querySelector('input[type="email"]').value,
    message: formData.get('message') || form.querySelector('textarea').value
  };

  try {
    // Send to server
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      // Success - show modal
      form.reset();
      modal.style.display = "flex";
    } else {
      // Error from server
      alert('שגיאה: ' + (result.message || 'נסה שוב'));
    }
  } catch (error) {
    // Network error
    console.error(error);
    alert('שגיאה בשליחה, בדקי שהשרת רץ');
  }
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
