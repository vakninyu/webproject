const petPreview = document.getElementById("petPreview");
const adoptError = document.getElementById("adoptError");

const adoptForm = document.getElementById("adoptForm");
const adoptFormError = document.getElementById("adoptFormError");
const adoptSuccess = document.getElementById("adoptSuccess");

const quizEcho = document.getElementById("quizEcho");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const phoneErr = document.getElementById("phoneErr");

function typeText(type) {
  return type === "dog" ? "כלב" : type === "cat" ? "חתול" : type === "rabbit" ? "ארנב" : "אחר";
}
function ageText(ageGroup) {
  return ageGroup === "puppy" ? "גור" :
    ageGroup === "young" ? "צעיר" :
    ageGroup === "adult" ? "בוגר" :
    ageGroup === "senior" ? "מבוגר" : "לא צוין";
}
function sizeText(size) {
  return size === "small" ? "קטן" : size === "medium" ? "בינוני" : size === "large" ? "גדול" : "לא צוין";
}
function yesNo(v) {
  return v === true ? "כן" : v === false ? "לא" : "לא צוין";
}

function safeJSON(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function fillFromQuiz(quiz) {
  if (!adoptForm || !quiz) return;

  // פרטי קשר מהשאלון
  adoptForm.adopterName.value = quiz.fullName || "";
  adoptForm.adopterPhone.value = quiz.phone || "";
  adoptForm.adopterEmail.value = quiz.email || "";

  // העדפות, ניתנות לעריכה בעמוד האימוץ (רק אם קיימים שדות כאלה ב-HTML)
  const setVal = (name, val) => {
    const el = adoptForm.elements[name];
    if (!el) return;
    el.value = (val ?? "");
  };

  setVal("prefLivingType", quiz.livingType);
  setVal("prefHasKids", quiz.hasKids);
  setVal("prefHasOtherPets", quiz.hasOtherPets);

  setVal("prefPreferredType", quiz.preferredType);
  setVal("prefPreferredGender", quiz.preferredGender);
  setVal("prefPreferredAge", quiz.preferredAge);
  setVal("prefPreferredSize", quiz.preferredSize);
}

function renderPet(pet) {
  if (!petPreview) return;
  petPreview.style.display = "block";

  const genderText = pet.gender === "female" ? "נקבה" : pet.gender === "male" ? "זכר" : "לא צוין";

  petPreview.innerHTML = `
    <div class="pet-preview__media">
      <img id="petImg" src="${pet.image}" alt="${pet.name}">
      <div class="pet-preview__badge">${typeText(pet.type)}</div>
    </div>

    <div class="pet-preview__body">
      <div class="pet-head">
        <h3 class="pet-name">${pet.name}</h3>
        <p class="pet-sub">
          ${genderText} · ${ageText(pet.ageGroup)} · ${sizeText(pet.size)} · ${pet.location || "לא צוין"}
        </p>
      </div>

      <div class="pet-tags">
        <span class="tag ${pet.kidsFriendly ? "ok" : "no"}">
          ילדים: ${yesNo(pet.kidsFriendly)}
        </span>
        <span class="tag ${pet.goodWithPets ? "ok" : "no"}">
          חיות נוספות: ${yesNo(pet.goodWithPets)}
        </span>
      </div>

      <div class="pet-desc">
        ${pet.description || ""}
      </div>
    </div>
  `;

  const img = document.getElementById("petImg");
  if (img) {
    img.style.width = "100%";
    img.style.height = "320px";
    img.style.objectFit = "contain";
    img.style.backgroundColor = "#FFF9F0";
  }
}

function validatePhone(value) {
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(String(value || "").trim());
}

function buildSubmissionPayload(pet, quiz) {
  const payload = {
    createdAt: new Date().toISOString(),
    pet: pet ? {
      id: pet.id,
      name: pet.name,
      type: pet.type,
      gender: pet.gender,
      ageGroup: pet.ageGroup,
      size: pet.size,
      location: pet.location
    } : null,
    adopter: {
      name: adoptForm.adopterName.value.trim(),
      phone: adoptForm.adopterPhone.value.trim(),
      email: adoptForm.adopterEmail.value.trim(),
      city: adoptForm.adopterCity.value.trim(),
      message: adoptForm.message.value.trim()
    },
    quiz: quiz || null,
    adoptPreferences: {
      livingType: adoptForm.elements.prefLivingType?.value || "",
      hasKids: adoptForm.elements.prefHasKids?.value || "",
      hasOtherPets: adoptForm.elements.prefHasOtherPets?.value || "",
      preferredType: adoptForm.elements.prefPreferredType?.value || "",
      preferredGender: adoptForm.elements.prefPreferredGender?.value || "",
      preferredAge: adoptForm.elements.prefPreferredAge?.value || "",
      preferredSize: adoptForm.elements.prefPreferredSize?.value || ""
    }
  };
  return payload;
}

document.addEventListener("DOMContentLoaded", () => {
  const selectedPetId = localStorage.getItem("selectedPetId");
  const quiz = safeJSON("quizAnswers");
  const draft = safeJSON("adoptDraft");

  // 1) מילוי ראשוני: טיוטה קודמת או מהשאלון
  if (draft && adoptForm) {
    adoptForm.adopterName.value = draft?.adopter?.name || "";
    adoptForm.adopterPhone.value = draft?.adopter?.phone || "";
    adoptForm.adopterEmail.value = draft?.adopter?.email || "";
    adoptForm.adopterCity.value = draft?.adopter?.city || "";
    adoptForm.message.value = draft?.adopter?.message || "";
  } else {
    fillFromQuiz(quiz);
  }

  // 2) אם קיימות העדפות בטיוטה, ממלאים אותן כאן (ולא בתוך submit)
  if (draft?.preferences && adoptForm) {
    Object.keys(draft.preferences).forEach(k => {
      if (adoptForm.elements[k]) {
        adoptForm.elements[k].value = draft.preferences[k];
      }
    });
  }

  // 3) בדיקת חיה נבחרת
  if (!selectedPetId) {
    if (adoptError) adoptError.style.display = "block";
    return;
  }

  fetch("data/animals.json")
    .then(r => r.json())
    .then(allPets => {
      const pet = allPets.find(p => Number(p.id) === Number(selectedPetId));
      if (!pet) {
        if (adoptError) adoptError.style.display = "block";
        return;
      }

      if (adoptError) adoptError.style.display = "none";
      renderPet(pet);

      // שמירת pet בקונטקסט כדי שנוכל לשלוח payload
      adoptForm.dataset.petId = String(pet.id);
      adoptForm.dataset.petName = pet.name;
    })
    .catch(err => {
      console.error(err);
      if (adoptError) adoptError.style.display = "block";
    });

  // 4) שמירת טיוטה כולל העדפות
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", () => {
      const petId = Number(adoptForm.dataset.petId || 0) || null;

      const draftPayload = {
        petId,
        adopter: {
          name: adoptForm.adopterName.value,
          phone: adoptForm.adopterPhone.value,
          email: adoptForm.adopterEmail.value,
          city: adoptForm.adopterCity.value,
          message: adoptForm.message.value
        },
        // שימי לב: keys כאן הם שמות השדות (name=...) בעמוד adopt
        preferences: {
          prefLivingType: adoptForm.elements.prefLivingType?.value || "",
          prefHasKids: adoptForm.elements.prefHasKids?.value || "",
          prefHasOtherPets: adoptForm.elements.prefHasOtherPets?.value || "",
          prefPreferredType: adoptForm.elements.prefPreferredType?.value || "",
          prefPreferredGender: adoptForm.elements.prefPreferredGender?.value || "",
          prefPreferredAge: adoptForm.elements.prefPreferredAge?.value || "",
          prefPreferredSize: adoptForm.elements.prefPreferredSize?.value || ""
        }
      };

      localStorage.setItem("adoptDraft", JSON.stringify(draftPayload));
      alert("הטיוטה נשמרה");
    });
  }

  // 5) שליחה
  if (adoptForm) {
    adoptForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (adoptFormError) {
        adoptFormError.style.display = "none";
        adoptFormError.textContent = "";
      }
      if (adoptSuccess) adoptSuccess.style.display = "none";

      if (phoneErr) {
        phoneErr.style.display = "none";
        phoneErr.textContent = "";
      }

      // ולידציה בסיסית
      if (!adoptForm.adopterName.value.trim() || !adoptForm.adopterPhone.value.trim()) {
        if (adoptFormError) {
          adoptFormError.textContent = "יש למלא שם וטלפון לפני שליחה.";
          adoptFormError.style.display = "block";
        }
        return;
      }

      if (!validatePhone(adoptForm.adopterPhone.value)) {
        if (phoneErr) {
          phoneErr.textContent = "מספר הטלפון אינו תקין. יש להזין 10 ספרות ולהתחיל ב 0.";
          phoneErr.style.display = "block";
        }
        adoptForm.adopterPhone.focus();
        return;
      }

      // נטען שוב את החיה כדי לבנות payload מלא
      let pet = null;
      const selectedPetIdNow = localStorage.getItem("selectedPetId");

      try {
        const allPets = await fetch("data/animals.json").then(r => r.json());
        pet = allPets.find(p => Number(p.id) === Number(selectedPetIdNow)) || null;
      } catch (err) {
        console.error(err);
      }

      const payload = buildSubmissionPayload(pet, quiz);

      // שמירה מקומית של הבקשה
      localStorage.setItem("adoptRequest", JSON.stringify(payload));
      localStorage.removeItem("adoptDraft");

      if (adoptSuccess) adoptSuccess.style.display = "block";
      adoptForm.reset();

      // אחרי reset נחזיר שוב את הנתונים מהשאלון כדי שיהיה נוח לתקן ולשלוח שוב
      fillFromQuiz(quiz);
    });
  }
});
