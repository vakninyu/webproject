// Run the script only after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {

  // Main quiz elements
  const quizForm = document.getElementById("quizForm");
  const quizError = document.getElementById("quizError");
  const submitBtn = quizForm?.querySelector('button[type="submit"]');
  const resetBtn = document.getElementById("resetQuizBtn");

  // Safety check: stop execution if critical elements are missing
  if (!quizForm || !quizError || !submitBtn) {
    console.warn("Quiz form elements are missing. Check your HTML.");
    return;
  }

  // Hide global error message on initial page load
  quizError.style.display = "none";
  quizError.textContent = "";

  /* ======= Restore saved answers (if exist) ======== */

  // Try to load previous quiz answers from localStorage
  const savedAnswers = localStorage.getItem("quizAnswers");
  if (savedAnswers) {
    try {
      const answers = JSON.parse(savedAnswers);

      // Loop over saved answers and restore each field
      Object.keys(answers).forEach((key) => {
        const field = quizForm.elements[key];
        if (!field) return; 

        // Support for future checkbox / radio inputs
        if (field.type === "checkbox" || field.type === "radio") {
          field.checked = field.value === answers[key];
        } else {
          field.value = answers[key];
        }
      });
    } catch (e) {
      console.warn("Failed to parse saved quiz answers:", e);
    }
  }

  /* ======= Reset quiz ========= */

  // Clear quiz data and reset the form
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem("quizAnswers"); // Remove saved data
      quizForm.reset(); // Reset all form fields
      quizError.style.display = "none";
      quizError.textContent = "";
      alert("השאלון אופס בהצלחה");
    });
  }

  /* ==== Submit handler ==== */
  quizForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission
    // Clear previous error messages
    quizError.style.display = "none";
    quizError.textContent = "";

    /* ==== Strict phone validationwith inline error message ==== */
    const phoneInput = quizForm.querySelector('input[name="phone"]');
    const phoneError = phoneInput?.parentElement?.querySelector(".field-error");

    // Clear previous phone error
    if (phoneError) {
      phoneError.style.display = "none";
      phoneError.textContent = "";
    }
    phoneInput.classList.remove("input-error");

    const phoneValue = phoneInput.value.trim();
    const phoneRegex = /^0\d{9}$/; // Must start with 0 and be 10 digits (Israeli phone number format)

    // Validate phone number
    if (!phoneRegex.test(phoneValue)) {
      if (phoneError) {
        phoneError.textContent = "מספר הטלפון אינו תקין. יש להזין 10 ספרות ולהתחיל ב־0.";
        phoneError.style.display = "block"; // Show inline error message
      }
      phoneInput.classList.add("input-error"); // Highlight the input with error
      phoneInput.focus(); // Focus the phone input for user convenience
      return;
    }

    /* ==== Required fields validation using native HTML validation ===== */
    if (!quizForm.checkValidity()) {
      quizError.textContent = "יש שדות חובה שלא מולאו. אנא בדקו את הטופס ונסו שוב.";
      quizError.style.display = "block"; // Show global error message

      const firstInvalid = quizForm.querySelector(":invalid"); // Focus the first invalid field
      if (firstInvalid) firstInvalid.focus(); // Focus the first invalid field
      return;
    }

    /* ==== Save answers to localStorage ==== */
    const formData = new FormData(quizForm); // Collect form data
    const answers = Object.fromEntries(formData.entries()); // Convert to plain object
    localStorage.setItem("quizAnswers", JSON.stringify(answers)); // Save to localStorage

     /* ===== User experience feedback (short loading state) ===== */
    submitBtn.disabled = true; // Disable the submit button to prevent multiple clicks
    const originalText = submitBtn.textContent; // Save original button text
    submitBtn.textContent = "טוען התאמות..."; // Show loading text

     /* ==== Redirect to results page ==== */
    setTimeout(() => { 
      submitBtn.disabled = false; // Re-enable the button
      submitBtn.textContent = originalText; // Restore original button text
      window.location.href = "results.html"; // Redirect to results page
    }, 1000); 
  });
});
