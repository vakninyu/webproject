
document.addEventListener("DOMContentLoaded", () => {
  const quizForm = document.getElementById("quizForm");
  const quizError = document.getElementById("quizError");
  const submitBtn = quizForm?.querySelector('button[type="submit"]');
  const resetBtn = document.getElementById("resetQuizBtn");

  // בדיקה שאלמנטים קיימים
  if (!quizForm || !quizError || !submitBtn) {
    console.warn("Quiz form elements are missing. Check your HTML.");
    return;
  }

  // לא להציג שגיאה בטעינת העמוד
  quizError.style.display = "none";
  quizError.textContent = "";

  /* =========================
     0) שחזור תשובות אם קיימות
  ========================== */
  const savedAnswers = localStorage.getItem("quizAnswers");
  if (savedAnswers) {
    try {
      const answers = JSON.parse(savedAnswers);

      Object.keys(answers).forEach((key) => {
        const field = quizForm.elements[key];
        if (!field) return;

        // אם בעתיד יהיו radio/checkbox
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

  /* =========================
     0.1) איפוס שאלון
  ========================== */
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem("quizAnswers");
      quizForm.reset();
      quizError.style.display = "none";
      quizError.textContent = "";
      alert("השאלון אופס בהצלחה");
    });
  }

  /* =========================
     Submit
  ========================== */
  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();

    quizError.style.display = "none";
    quizError.textContent = "";

    /* =========================
       1) ולידציה קפדנית לטלפון
       עם הודעה צמודה לשדה
    ========================== */
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

    /* =========================
       2) בדיקת שדות חובה (HTML)
    ========================== */
    if (!quizForm.checkValidity()) {
      quizError.textContent = "יש שדות חובה שלא מולאו. אנא בדקו את הטופס ונסו שוב.";
      quizError.style.display = "block";

      const firstInvalid = quizForm.querySelector(":invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* =========================
       3) שמירת נתונים ב־localStorage
    ========================== */
    const formData = new FormData(quizForm);
    const answers = Object.fromEntries(formData.entries());
    localStorage.setItem("quizAnswers", JSON.stringify(answers));

    /* =========================
       4) חוויית משתמש – טעינה קצרה
    ========================== */
    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "טוען התאמות...";

    /* =========================
       5) מעבר לעמוד התוצאות
    ========================== */
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      window.location.href = "results.html";
    }, 1000);
  });
});
