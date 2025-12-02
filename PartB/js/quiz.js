const quizForm = document.getElementById("quizForm");
const quizError = document.getElementById("quizError");

if (quizForm) {
    quizForm.addEventListener("submit", function (event) {
        event.preventDefault();

        // בדיקת שדות חובה בסיסית דרך התכונה required של HTML
        if (!quizForm.checkValidity()) {
            quizError.style.display = "block";
            return;
        }

        quizError.style.display = "none";

        const formData = new FormData(quizForm);
        const answers = Object.fromEntries(formData.entries());

        // שמירת התשובות ב localStorage
        localStorage.setItem("quizAnswers", JSON.stringify(answers));

        // מעבר לעמוד התוצאות
        window.location.href = "results.html";
    });
}
