// Run only after the page HTML is ready
document.addEventListener("DOMContentLoaded", () => {
  // ========= Grab elements =========
  const quizForm = document.getElementById("quizForm");
  const quizError = document.getElementById("quizError");
  const submitBtn = quizForm?.querySelector('button[type="submit"]');
  const resetBtn = document.getElementById("resetQuizBtn");

  // Stop if something critical is missing
  if (!quizForm || !quizError || !submitBtn) {
    console.warn("Quiz form elements are missing. Check your HTML.");
    return;
  }

  // Hide the global error on load
  quizError.style.display = "none";
  quizError.textContent = "";

  // ========= Restore saved answers from localStorage =========
  const savedAnswers = localStorage.getItem("quizAnswers");
  if (savedAnswers) {
    try {
      const answers = JSON.parse(savedAnswers);

      // Put each saved value back into the matching form field
      Object.keys(answers).forEach((key) => {
        const field = quizForm.elements[key];
        if (!field) return;

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

  // ========= Reset button =========
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem("quizAnswers");
      quizForm.reset();
      quizError.style.display = "none";
      quizError.textContent = "";
      alert("השאלון אופס בהצלחה");
    });
  }

  // ========= Submit handler =========
  quizForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // we handle submit with JS (fetch), not HTML action

    // Clear global error
    quizError.style.display = "none";
    quizError.textContent = "";

    // Save original button text so we can restore it
    const originalText = submitBtn.textContent;

    // ========= Phone validation (custom) =========
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

    // ========= Required fields validation (HTML built-in) =========
    if (!quizForm.checkValidity()) {
      quizError.textContent = "יש שדות חובה שלא מולאו. אנא בדקו את הטופס ונסו שוב.";
      quizError.style.display = "block";

      const firstInvalid = quizForm.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // ========= Collect all answers from the form =========
    const formData = new FormData(quizForm);
    const answers = Object.fromEntries(formData.entries());

    // Save answers so they can be restored if the user returns to this page
    localStorage.setItem("quizAnswers", JSON.stringify(answers));

    // ========= Normalize values for "no preference" =========
    // (server / DB expects a string even when the user did not choose)
    const normalizeNoMatter = (v) => (v ? v : "no_matter");

    // ========= Prepare payload for server =========
    
  const payload = {
  // required fields from the form
  full_name: answers.fullName,
  phone: answers.phone,
  email: answers.email || null,
  living_type: answers.livingType,
  has_kids: answers.hasKids,
  has_other_pets: answers.hasOtherPets,

  // matching fields
  preferred_type: normalizeNoMatter(answers.preferredType),
  age_group: normalizeNoMatter(answers.preferredAge),
  size: normalizeNoMatter(answers.preferredSize),
  preferred_gender: normalizeNoMatter(answers.preferredGender),
  preferred_personality: normalizeNoMatter(answers.preferredPersonality),

  notes: answers.idealPet || answers.adoptionReason || "",
  answers_json: answers
};

    // ========= Send to server =========
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
        quizError.textContent = "אחד הנתונים שגוי, אנא בדקו שוב.";
        quizError.style.display = "block";
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        return;
      }

      // Save the DB row id (optional debug)
      localStorage.setItem("submissionId", data.id);

    } catch (e) {
      console.error(e);
      quizError.textContent = "לא הצלחנו להתחבר לשרת, בדקו שהשרת רץ ונסו שוב.";
      quizError.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    // ========= UX: short loading then go to results =========
    submitBtn.textContent = "טוען התאמות...";

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      window.location.href = "results.html";
    }, 1000);
  });
});
