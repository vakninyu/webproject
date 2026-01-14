// Main containers on the results page
const resultsGrid = document.getElementById("resultsGrid");
const userSummary = document.getElementById("userSummary");
const noResultsMessage = document.getElementById("noResultsMessage");

// Render the user's quiz preferences at the top of the results page
function renderUserSummary(answers) {
  // If we don't have answers (or the container doesn't exist), do nothing
  if (!answers || !userSummary) return;

  // Convert the saved "preferredType" into a Hebrew label
  const preferredTypeText =
    answers.preferredType === "dog" ? "כלב" :
    answers.preferredType === "cat" ? "חתול" :
    answers.preferredType === "rabbit" ? "ארנב" :
    answers.preferredType === "other" ? "אחר" :
    "לא משנה";

  // Build a quick summary of the user's preferences
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

// Checks if a pet's age group matches the user's selected age preference
function ageMatches(preferredAge, petAgeGroup) {
  // If the user didn't pick an age, everything matches
  if (!preferredAge) return true;

  // In the quiz we don't have "young", so "puppy" should match both puppy + young
  if (preferredAge === "puppy") return petAgeGroup === "puppy" || petAgeGroup === "young";
  if (preferredAge === "adult") return petAgeGroup === "adult";
  if (preferredAge === "senior") return petAgeGroup === "senior";

  // Default fallback (keeps the function safe)
  return true;
}

// Give each pet a score based on how well it fits the user's answers
function scorePet(pet, answers) {
  let score = 0;

 // Direct preference matches (small positive weights)
  if (answers.preferredGender && pet.gender === answers.preferredGender) score += 2;
  if (answers.preferredSize && pet.size === answers.preferredSize) score += 2;
  if (answers.preferredAge && ageMatches(answers.preferredAge, pet.ageGroup)) score += 2;

  // If the user has kids, heavily favor kid-friendly pets, penalize the rest
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

// Render a list of pets as cards in the results grid
function renderResults(pets) {
  // If the grid isn't in the page, nothing to render
  if (!resultsGrid) return;

  // Clear existing results (important when re-rendering)
  resultsGrid.innerHTML = "";

  // If no pets to show, display the "no results" message
  if (!pets || pets.length === 0) {
    if (noResultsMessage) noResultsMessage.style.display = "block";
    return;
  }
  // Otherwise, hide the "no results" message
  if (noResultsMessage) noResultsMessage.style.display = "none";

  // Create a card for each pet
  pets.forEach(pet => {
    const card = document.createElement("div"); // Pet card container
    card.className = "pet-card"; 

    // Convert pet attributes to Hebrew labels
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

    // Build the card HTML
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

    // Add the card to the results grid
    resultsGrid.appendChild(card);
  });
}

// Navigate to the adopt page for the selected pet
function goToAdopt(petId) {
  localStorage.setItem("selectedPetId", String(petId)); // Save the selected pet ID
  window.location.href = "adopt.html"; // Navigate to the adopt page
}

async function getLatestSubmission() {
  try {
    const res = await fetch("/api/quiz/latest");
    const data = await res.json();
    if (!res.ok || !data.ok || !data.rows || data.rows.length === 0) return null;
    return data.rows[0];
  } catch (e) {
    console.error("Failed to fetch latest submission:", e);
    return null;
  }
}

// Main flow: run when results page is ready
document.addEventListener("DOMContentLoaded", async () => {
  // 1) localStorage fallback
  const answersJson = localStorage.getItem("quizAnswers");
  const answers = answersJson ? JSON.parse(answersJson) : null;

  // 2) DB preferred source
  const latest = await getLatestSubmission();

  // 3) merge: keep all fields from localStorage, but override key filters from DB if exists
  const mergedAnswers = answers ? { ...answers } : {};

  if (latest) {
    mergedAnswers.preferredType = latest.preferred_type === "no_matter" ? "" : latest.preferred_type;
    mergedAnswers.preferredAge  = latest.age_group === "no_matter" ? "" : latest.age_group;
    mergedAnswers.preferredSize = latest.size === "no_matter" ? "" : latest.size;

    // keep submission id for the banner
    localStorage.setItem("submissionId", String(latest.id));
  }

  // Show the summary section based on the quiz answers
  renderUserSummary(mergedAnswers);

  // Load all pets data from the JSON file
  fetch("data/animals.json")
    .then(response => response.json())
    .then(allPets => {
    // If there are no saved quiz answers in localStorage
    // and no latest submission found in the database,
    // show all pets without applying any filters
     const hasAnyAnswers = answers && Object.keys(answers).length > 0;
if (!hasAnyAnswers && !latest) {
  renderResults(allPets);
  return;
}

      // Start with the full list, then filter down
      let pool = allPets;

     // Hard filter: preferred animal type
// Apply only if the user selected a specific type
if (mergedAnswers.preferredType && mergedAnswers.preferredType.trim() !== "") {

  // If the user selected "other":
  // show all animals that are NOT dog, cat, or rabbit
  if (mergedAnswers.preferredType === "other") {
    pool = pool.filter(p =>
      !["dog", "cat", "rabbit"].includes(p.type)
    );
  } 
  // Otherwise, filter by the exact selected type
  else {
    pool = pool.filter(p => p.type === mergedAnswers.preferredType);
  }
}

const dbStatus = document.getElementById("dbStatus");
const submissionId = localStorage.getItem("submissionId");

if (dbStatus) {
  if (submissionId) {
    dbStatus.textContent = `הטופס נשמר בהצלחה. מספר פנייה: ${submissionId}`;
  } else {
    dbStatus.textContent = "הטופס מוצג ללא שמירה למסד נתונים.";
  }
}

      // Hard filter: preferred gender (only if selected)
      if (mergedAnswers.preferredGender && mergedAnswers.preferredGender.trim() !== "") {
        pool = pool.filter(p => p.gender === mergedAnswers.preferredGender);
    }

      // Apartment rule: remove large animals
      if (mergedAnswers.livingType === "apartment") {
        pool = pool.filter(p => p.size !== "large");
      }

      // If no pets left after filtering, show no results
      if (pool.length === 0) {
        renderResults([]);
        return;
      }

      // Score and sort the remaining pets
      const scored = pool
        .map(p => ({ pet: p, score: scorePet(p, mergedAnswers) }))
        .sort((a, b) => b.score - a.score);

      // Render pets in best-match order
      renderResults(scored.map(x => x.pet));
    })
    .catch(error => {
      console.error("שגיאה בטעינת הנתונים", error); // Log data loading error
      if (noResultsMessage) noResultsMessage.style.display = "block"; // Show no results message
    });
});
