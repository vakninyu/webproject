const resultsGrid = document.getElementById("resultsGrid");
const userSummary = document.getElementById("userSummary");
const noResultsMessage = document.getElementById("noResultsMessage");

function renderUserSummary(answers) {
    if (!answers || !userSummary) return;

    const preferredTypeText =
        answers.preferredType === "dog" ? "כלב" :
        answers.preferredType === "cat" ? "חתול" :
        answers.preferredType === "rabbit" ? "ארנב" :
        answers.preferredType === "other" ? "אחר" :
        "לא משנה";

    userSummary.innerHTML = `
        <p>
            <strong>סיכום העדפות שלך:</strong><br>
            סוג חיה מועדף: ${preferredTypeText}<br>
            מגורים: ${answers.livingType === "apartment" ? "דירה" : answers.livingType === "house" ? "בית עם חצר" : "לא צוין"}<br>
            ילדים בבית: ${answers.hasKids === "yes" ? "יש" : answers.hasKids === "no" ? "אין" : "לא צוין"}
        </p>
    `;
}

function renderResults(pets) {
    if (!resultsGrid) return;

    resultsGrid.innerHTML = "";

    if (!pets || pets.length === 0) {
        if (noResultsMessage) noResultsMessage.style.display = "block";
        return;
    }

    if (noResultsMessage) noResultsMessage.style.display = "none";

    pets.forEach(pet => {
        const card = document.createElement("div");
        card.className = "pet-card";

        card.innerHTML = `
            <img src="${pet.image}" alt="${pet.name}">
            <h3>${pet.name}</h3>
            <div class="pet-details">
                <p>סוג: ${pet.type === "dog" ? "כלב" : pet.type === "cat" ? "חתול" : "אחר"}</p>
                <p>גיל: ${pet.age === "puppy" ? "גור" : pet.age === "adult" ? "בוגר" : pet.age === "senior" ? "מבוגר" : "לא צוין"}</p>
                <p>גודל: ${pet.size === "small" ? "קטן" : pet.size === "medium" ? "בינוני" : pet.size === "large" ? "גדול" : "לא צוין"}</p>
                <p>${pet.description}</p>
            </div>
            <div class="pet-actions">
                <button class="primary-btn" onclick="goToAdopt(${pet.id})">
                    אני רוצה לאמץ
                </button>
            </div>
        `;

        resultsGrid.appendChild(card);
    });
}

function goToAdopt(petId) {
    localStorage.setItem("selectedPetId", String(petId));
    window.location.href = "adopt.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const answersJson = localStorage.getItem("quizAnswers");
    let answers = null;

    if (answersJson) {
        answers = JSON.parse(answersJson);
    }

    renderUserSummary(answers);

    fetch("data/animals.json")
        .then(response => response.json())
        .then(allPets => {
            let filtered = allPets;

            if (answers && answers.preferredType) {
                filtered = filtered.filter(p => p.type === answers.preferredType);
            }

            renderResults(filtered);
        })
        .catch(error => {
            console.error("שגיאה בטעינת הנתונים", error);
            if (noResultsMessage) noResultsMessage.style.display = "block";
        });
});
