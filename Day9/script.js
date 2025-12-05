const API_KEY = "use your key";
const url = "https://newsapi.org/v2/everything?q=";

window.addEventListener("load", () => fetchNews("india"));

async function fetchNews(query) {
    const response = await fetch(`${url}${query}&apiKey=${API_KEY}`);
    const data = await response.json();
    const sortedArticles = data.articles.sort((a, b) => {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    bindData(sortedArticles);
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const template = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    articles.forEach(article => {
        if (!article.urlToImage) return;

        const card = template.content.cloneNode(true);
        fillCardData(card, article);
        cardsContainer.appendChild(card);
    });
}

function fillCardData(card, article) {
    card.querySelector("#news-img").src = article.urlToImage;
    card.querySelector("#news-title").innerText = article.title;
    card.querySelector("#news-desc").innerText = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-IN");
    card.querySelector("#news-source").innerText = `${article.source.name} • ${date}`;

    const cardElement = card.querySelector(".news-card");
    cardElement.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

let activeNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const nav = document.getElementById(id);

    if (activeNav) activeNav.classList.remove("active");
    nav.classList.add("active");

    activeNav = nav;
}

document.getElementById("search-button").addEventListener("click", () => {
    let query = document.getElementById("search-text").value.trim();
    if (query) fetchNews(query);

    if (activeNav) activeNav.classList.remove("active");
    activeNav = null;
});
