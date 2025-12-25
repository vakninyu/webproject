// ===== Adopt page DOM elements =====
const petPreview = document.getElementById("petPreview");
const adoptError = document.getElementById("adoptError");

const adoptForm = document.getElementById("adoptForm");
const adoptFormError = document.getElementById("adoptFormError");
const adoptSuccess = document.getElementById("adoptSuccess");

const quizEcho = document.getElementById("quizEcho");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const phoneErr = document.getElementById("phoneErr");

// ===== Small helper functions for readable labels =====
function typeText(type) {
  // Convert internal type values to Hebrew labels
  return type === "dog" ? "כלב" : type === "cat" ? "חתול" : type === "rabbit" ? "ארנב" : "אחר";
}

function ageText(ageGroup) {
  // Convert age groups to user-friendly text
  return ageGroup === "puppy" ? "גור" :
    ageGroup === "young" ? "צעיר" :
    ageGroup === "adult" ? "בוגר" :
    ageGroup === "senior" ? "מבוגר" : "לא צוין";
}
function sizeText(size) {
  // Convert size values to Hebrew labels
  return size === "small" ? "קטן" : size === "medium" ? "בינוני" : size === "large" ? "גדול" : "לא צוין";
}

function yesNo(v) {
  // Convert booleans into "כן / לא / לא צוין"
  return v === true ? "כן" : v === false ? "לא" : "לא צוין";
}

// Safely parse JSON from localStorage without crashing the page
function safeJSON(key) {
  const raw = localStorage.getItem(key); 
  if (!raw) return null;
  try {
     return JSON.parse(raw); 
     } catch { 
      return null; }
}

// Fill adopt form fields based on quiz answers (if available)
function fillFromQuiz(quiz) {
  if (!adoptForm || !quiz) return;

  // Contact details from the quiz
  adoptForm.adopterName.value = quiz.fullName || "";
  adoptForm.adopterPhone.value = quiz.phone || "";
  adoptForm.adopterEmail.value = quiz.email || "";

  // Preferences are editable on the adopt page (only if those fields exist)
  const setVal = (name, val) => {
  const el = adoptForm.elements[name];
    if (!el) return;
    el.value = (val ?? "");
  };

  // Preferences from the quiz
  setVal("prefLivingType", quiz.livingType);
  setVal("prefHasKids", quiz.hasKids);
  setVal("prefHasOtherPets", quiz.hasOtherPets);

  setVal("prefPreferredType", quiz.preferredType);
  setVal("prefPreferredGender", quiz.preferredGender);
  setVal("prefPreferredAge", quiz.preferredAge);
  setVal("prefPreferredSize", quiz.preferredSize);
}

// Render the selected pet preview card on the left side
function renderPet(pet) {
  if (!petPreview) return;
  petPreview.style.display = "block";

  // Convert gender value to Hebrew label
  const genderText = pet.gender === "female" ? "נקבה" : pet.gender === "male" ? "זכר" : "לא צוין";

  // Build the pet preview HTML
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

  // Extra safety styling for the image (in case CSS isn't applied for some reason)
  const img = document.getElementById("petImg");
  if (img) {
    img.style.width = "100%";
    img.style.height = "320px";
    img.style.objectFit = "contain";
    img.style.backgroundColor = "#FFF9F0";
  }
}

// Phone validation rule: 10 digits, must start with 0
function validatePhone(value) {
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(String(value || "").trim());
}

// Build the submission payload from the form and selected pet
function buildSubmissionPayload(pet, quiz) {
  const payload = {
    createdAt: new Date().toISOString(), // Timestamp of submission

    // Selected pet details (minimal fields we care about)
    pet: pet ? {
      id: pet.id,
      name: pet.name,
      type: pet.type,
      gender: pet.gender,
      ageGroup: pet.ageGroup,
      size: pet.size,
      location: pet.location
    } : null,

    // Adopter details from the form
    adopter: {
      name: adoptForm.adopterName.value.trim(),
      phone: adoptForm.adopterPhone.value.trim(),
      email: adoptForm.adopterEmail.value.trim(),
      city: adoptForm.adopterCity.value.trim(),
      message: adoptForm.message.value.trim()
    },

    // Original quiz answers (for reference)
    quiz: quiz || null,

    // Preferences as edited on the adopt page
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

// ===== Main flow: run once adopt page is ready =====
document.addEventListener("DOMContentLoaded", () => {
  const selectedPetId = localStorage.getItem("selectedPetId");
  const quiz = safeJSON("quizAnswers");
  const draft = safeJSON("adoptDraft");

  // Initial form fill: prefer draft (if exists), otherwise use quiz data
  if (draft && adoptForm) {
    adoptForm.adopterName.value = draft?.adopter?.name || "";
    adoptForm.adopterPhone.value = draft?.adopter?.phone || "";
    adoptForm.adopterEmail.value = draft?.adopter?.email || "";
    adoptForm.adopterCity.value = draft?.adopter?.city || "";
    adoptForm.message.value = draft?.adopter?.message || "";
  } else {
    fillFromQuiz(quiz);
  }

  // If draft includes preferences, restore them (so user can continue editing)
  if (draft?.preferences && adoptForm) {
    Object.keys(draft.preferences).forEach(k => {
      if (adoptForm.elements[k]) {
        adoptForm.elements[k].value = draft.preferences[k];
      }
    });
  }

  // Must have a selected pet id, otherwise show an error and stop
  if (!selectedPetId) {
    if (adoptError) adoptError.style.display = "block";
    return;
  }

  // Load pet data and find the selected pet
  fetch("data/animals.json")
    .then(r => r.json())
    .then(allPets => {
      const pet = allPets.find(p => Number(p.id) === Number(selectedPetId));
      if (!pet) {
        if (adoptError) adoptError.style.display = "block";
        return;
      }

       // Pet found, show preview and hide any error state
      if (adoptError) adoptError.style.display = "none";
      renderPet(pet);

      // Store pet context on the form for later use
      adoptForm.dataset.petId = String(pet.id);
      adoptForm.dataset.petName = pet.name;
    })
    .catch(err => {
      console.error(err);
      if (adoptError) adoptError.style.display = "block";
    });

  // Save draft button: store current form state (including preferences)
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

        // Keys here match the field names in the adopt page
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

  // Submit flow: validate, build payload, save locally, then reset
  if (adoptForm) {
    adoptForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Clear previous errors / success messages
      if (adoptFormError) {
        adoptFormError.style.display = "none";
        adoptFormError.textContent = "";
      }
      if (adoptSuccess) adoptSuccess.style.display = "none";

      if (phoneErr) {
        phoneErr.style.display = "none";
        phoneErr.textContent = "";
      }

      // Basic required fields check
      if (!adoptForm.adopterName.value.trim() || !adoptForm.adopterPhone.value.trim()) {
        if (adoptFormError) {
          adoptFormError.textContent = "יש למלא שם וטלפון לפני שליחה.";
          adoptFormError.style.display = "block";
        }
        return;
      }

      // Phone validation with inline error near the field
      if (!validatePhone(adoptForm.adopterPhone.value)) {
        if (phoneErr) {
          phoneErr.textContent = "מספר הטלפון אינו תקין. יש להזין 10 ספרות ולהתחיל ב 0.";
          phoneErr.style.display = "block";
        }
        adoptForm.adopterPhone.focus();
        return;
      }

      // Reload pet data to include the full pet object in the payload
      let pet = null;
      const selectedPetIdNow = localStorage.getItem("selectedPetId");

      try {
        const allPets = await fetch("data/animals.json").then(r => r.json());
        pet = allPets.find(p => Number(p.id) === Number(selectedPetIdNow)) || null;
      } catch (err) {
        console.error(err);
      }

      // Build and store the "submission" payload locally
      const payload = buildSubmissionPayload(pet, quiz);

      // Save the adopt request locally
      localStorage.setItem("adoptRequest", JSON.stringify(payload));
      localStorage.removeItem("adoptDraft");

      // Show success message and reset the form
      if (adoptSuccess) adoptSuccess.style.display = "block";
      adoptForm.reset();

      // After reset, re-fill from quiz so it's easy to submit again
      fillFromQuiz(quiz);
    });
  }
});
