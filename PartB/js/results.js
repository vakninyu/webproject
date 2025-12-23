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
      ילדים בבית: ${answers.hasKids === "yes" ? "יש" : answers.hasKids === "no" ? "אין" : "לא צוין"}<br>
      חיות נוספות בבית: ${answers.hasOtherPets === "yes" ? "יש" : answers.hasOtherPets === "no" ? "אין" : "לא צוין"}
    </p>
  `;
}

function ageMatches(preferredAge, petAgeGroup) {
  if (!preferredAge) return true;

  // בשאלון אין young, אז גור תואם גם puppy וגם young
  if (preferredAge === "puppy") return petAgeGroup === "puppy" || petAgeGroup === "young";
  if (preferredAge === "adult") return petAgeGroup === "adult";
  if (preferredAge === "senior") return petAgeGroup === "senior";

  return true;
}

function scorePet(pet, answers) {
  let score = 0;

  if (answers.preferredGender && pet.gender === answers.preferredGender) score += 2;
  if (answers.preferredSize && pet.size === answers.preferredSize) score += 2;
  if (answers.preferredAge && ageMatches(answers.preferredAge, pet.ageGroup)) score += 2;

  if (answers.hasKids === "yes") {
    if (pet.kidsFriendly === true) score += 3;
    else score -= 6;
  }

  if (answers.hasOtherPets === "yes") {
    if (pet.goodWithPets === true) score += 2;
    else score -= 5;
  }

  return score;
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

    const typeText =
      pet.type === "dog" ? "כלב" :
      pet.type === "cat" ? "חתול" :
      pet.type === "rabbit" ? "ארנב" : "אחר";

    const ageText =
      pet.ageGroup === "puppy" ? "גור" :
      pet.ageGroup === "young" ? "צעיר" :
      pet.ageGroup === "adult" ? "בוגר" :
      pet.ageGroup === "senior" ? "מבוגר" : "לא צוין";

    const sizeText =
      pet.size === "small" ? "קטן" :
      pet.size === "medium" ? "בינוני" :
      pet.size === "large" ? "גדול" : "לא צוין";

    const petsText =
      pet.goodWithPets === true ? "כן" :
      pet.goodWithPets === false ? "לא" : "לא צוין";

    const kidsText =
      pet.kidsFriendly === true ? "כן" :
      pet.kidsFriendly === false ? "לא" : "לא צוין";

    card.innerHTML = `
      <img src="${pet.image}" alt="${pet.name}">
      <h3>${pet.name}</h3>
      <div class="pet-details">
        <p>סוג: ${typeText}</p>
        <p>גיל: ${ageText}</p>
        <p>גודל: ${sizeText}</p>
        <p>מיקום: ${pet.location || "לא צוין"}</p>
        <p>מסתדר עם ילדים: ${kidsText}</p>
        <p>מסתדר עם חיות: ${petsText}</p>
        <p>${pet.description || ""}</p>
      </div>
      <div class="pet-actions">
        <button class="primary-btn" type="button" onclick="goToAdopt(${pet.id})">
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
  const answers = answersJson ? JSON.parse(answersJson) : null;

  renderUserSummary(answers);

  fetch("data/animals.json")
    .then(response => response.json())
    .then(allPets => {
      // אם אין תשובות, מציגים הכל
      if (!answers) {
        renderResults(allPets);
        return;
      }

      let pool = allPets;

      // סינון קשיח לפי סוג חיה, רק אם נבחר בפועל
      if (answers.preferredType && answers.preferredType.trim() !== "") {
        pool = pool.filter(p => p.type === answers.preferredType);
      }

      // סינון קשיח לפי מין, אם נבחר
if (answers.preferredGender && answers.preferredGender.trim() !== "") {
  pool = pool.filter(p => p.gender === answers.preferredGender);
}

      // כלל דירה, מסננים חיות גדולות
      if (answers.livingType === "apartment") {
        pool = pool.filter(p => p.size !== "large");
      }

      // אם יצא ריק אחרי סינון קשיח, נציג הודעה
      if (pool.length === 0) {
        renderResults([]);
        return;
      }

      // ניקוד ומיון בתוך הבריכה
      const scored = pool
        .map(p => ({ pet: p, score: scorePet(p, answers) }))
        .sort((a, b) => b.score - a.score);

      renderResults(scored.map(x => x.pet));
    })
    .catch(error => {
      console.error("שגיאה בטעינת הנתונים", error);
      if (noResultsMessage) noResultsMessage.style.display = "block";
    });
});
