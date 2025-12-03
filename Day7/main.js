const SEARCH_API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const RANDOM_API_URL = "https://www.themealdb.com/api/json/v1/1/random.php";
const LOOKUP_API_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsGrid = document.getElementById("results-grid");
const messageArea = document.getElementById("message-area");
const randomButton = document.getElementById("random-button");
const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseBtn = document.getElementById("modal-close-btn");

function showMessage(message, isError = false, isLoading = false) {
  messageArea.className = "message"; // Reset classes
  messageArea.textContent = message;

  if (isError) messageArea.classList.add("error");
  if (isLoading) messageArea.classList.add("loading");
}

function clearMessage() {
  messageArea.textContent = "";
  messageArea.className = "message";
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const term = searchInput.value.trim();

  if (term) {
    searchRecipes(term);
  } else {
    showMessage("Please enter a search term.", true);
  }
});

async function searchRecipes(query) {
  showMessage(`Searching for "${query}"...`, false, true);
  resultsGrid.innerHTML = "";

  try {
    const response = await fetch(`${SEARCH_API_URL}${query}`);
    if (!response.ok) throw new Error("Network error");

    const data = await response.json();
    clearMessage();

    if (data.meals) {
      displayRecipes(data.meals);
    } else {
      showMessage(`No recipes found for "${query}".`, true);
    }
  } catch (err) {
    showMessage("Something went wrong. Please try again.", true);
  }
}

function displayRecipes(recipes) {
  resultsGrid.innerHTML = "";

  resultsGrid.classList.toggle("single", recipes.length === 1);

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.classList.add("recipe-item");
    card.dataset.id = recipe.idMeal;

    card.innerHTML = `
      <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy">
      <h3>${recipe.strMeal}</h3>
    `;

    resultsGrid.appendChild(card);
  });
}

randomButton.addEventListener("click", getRandomRecipe);

async function getRandomRecipe() {
  showMessage("Fetching a random recipe...", false, true);
  resultsGrid.innerHTML = "";

  try {
    const response = await fetch(RANDOM_API_URL);
    if (!response.ok) throw new Error("API error");

    const data = await response.json();
    clearMessage();

    if (data.meals?.length) {
      displayRecipes(data.meals);
    } else {
      showMessage("Could not fetch a random recipe.", true);
    }
  } catch (err) {
    showMessage("Failed to fetch a random recipe. Try again.", true);
  }
}

function showModal() {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

modalCloseBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

resultsGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".recipe-item");
  if (card) getRecipeDetails(card.dataset.id);
});

async function getRecipeDetails(id) {
  modalContent.innerHTML = '<p class="message loading">Loading details...</p>';
  showModal();

  try {
    const response = await fetch(`${LOOKUP_API_URL}${id}`);
    if (!response.ok) throw new Error("Details fetch error");

    const data = await response.json();

    if (data.meals?.length) {
      displayRecipeDetails(data.meals[0]);
    } else {
      modalContent.innerHTML =
        '<p class="message error">Could not load recipe details.</p>';
    }
  } catch (err) {
    modalContent.innerHTML =
      '<p class="message error">Failed to load details. Try again.</p>';
  }
}

function displayRecipeDetails(recipe) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ing = recipe[`strIngredient${i}`]?.trim();
    const measure = recipe[`strMeasure${i}`]?.trim();

    if (ing) {
      ingredients.push(`<li>${measure ? `${measure} ` : ""}${ing}</li>`);
    }
  }

  modalContent.innerHTML = `
    <h2>${recipe.strMeal}</h2>
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
    
    <p><strong>Category:</strong> ${recipe.strCategory || "N/A"}</p>
    <p><strong>Area:</strong> ${recipe.strArea || "N/A"}</p>

    ${ingredients.length ? `<h3>Ingredients</h3><ul>${ingredients.join("")}</ul>` : ""}

    <h3>Instructions</h3>
    <p>${recipe.strInstructions.replace(/\r?\n/g, "<br>")}</p>

    ${
      recipe.strYoutube
        ? `<h3>Video Recipe</h3><a href="${recipe.strYoutube}" target="_blank">Watch on YouTube</a>`
        : ""
    }

    ${
      recipe.strSource
        ? `<div class="source-wrapper"><a href="${recipe.strSource}" target="_blank">View Original Source</a></div>`
        : ""
    }
  `;
}
