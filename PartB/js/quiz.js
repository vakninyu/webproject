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
  quizForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    quizError.style.display = "none";
    quizError.textContent = "";

    // Save original button text FIRST (so we can restore it on errors)
    const originalText = submitBtn.textContent;

    /* ==== Strict phone validation with inline error message ==== */
    const phoneInput = quizForm.querySelector('input[name="phone"]');
    const phoneError = phoneInput?.parentElement?.querySelector(".field-error");

    if (phoneError) {
      phoneError.style.display = "none";
      phoneError.textContent = "";
    }
    phoneInput.classList.remove("input-error");

    const phoneValue = phoneInput.value.trim();
    const phoneRegex = /^0\d{9}$/;

    if (!phoneRegex.test(phoneValue)) {
      if (phoneError) {
        phoneError.textContent = "מספר הטלפון אינו תקין. יש להזין 10 ספרות ולהתחיל ב־0.";
        phoneError.style.display = "block";
      }
      phoneInput.classList.add("input-error");
      phoneInput.focus();
      return;
    }

    /* ==== Required fields validation ==== */
    if (!quizForm.checkValidity()) {
      quizError.textContent = "יש שדות חובה שלא מולאו. אנא בדקו את הטופס ונסו שוב.";
      quizError.style.display = "block";
      const firstInvalid = quizForm.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* ==== Collect answers ==== */
    const formData = new FormData(quizForm);
    const answers = Object.fromEntries(formData.entries());

    // Keep localStorage behavior (your existing flow)
    localStorage.setItem("quizAnswers", JSON.stringify(answers));

    /* ==== Prepare payload for server (match DB columns) ==== */
    const normalizeNoMatter = (v) => {
      if (!v) return "no_matter";
      const s = String(v).trim().toLowerCase();
      if (s === "no_matter" || s === "nomatter" || s === "any" || s === "all") return "no_matter";
      return v;
    };

    // Map from your HTML field names to DB enum columns
    const payload = {
      preferred_type: normalizeNoMatter(answers.preferredType),
      age_group: normalizeNoMatter(answers.preferredAge),
      size: normalizeNoMatter(answers.preferredSize),

      // Put some free text into notes (you can change priority)
      notes: answers.idealPet || answers.experienceDetails || answers.adoptionReason || null,

      // Store EVERYTHING in JSON too
      answers_json: answers
    };

    /* ==== Send to server ==== */
    submitBtn.disabled = true;
    submitBtn.textContent = "שומר לשרת...";

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        console.error("Server error:", data);
        quizError.textContent = "שגיאה בשמירה למסד הנתונים, נסו שוב.";
        quizError.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
      }

      // Useful for debugging, if you want later
      localStorage.setItem("submissionId", data.id);

    } catch (e) {
      console.error(e);
      quizError.textContent = "לא הצלחנו להתחבר לשרת, בדקו שהשרת רץ ונסו שוב.";
      quizError.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    /* ===== User experience feedback (short loading state) ===== */
    submitBtn.textContent = "טוען התאמות...";

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      window.location.href = "results.html";
    }, 1000);
  });

  });
});
