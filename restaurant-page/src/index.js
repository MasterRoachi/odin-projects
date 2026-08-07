import "./styles.css";
import { loadHome } from "./home.js";
import { loadMenu } from "./menu.js";
import { loadContact } from "./contact.js";

const content = document.querySelector("#content");
const home = document.querySelector("#home");
const menu = document.querySelector("#menu");
const contact = document.querySelector("#contact");

let active = "home";

function renderPage() {
  content.replaceChildren();
  if (active === "contact") {
    loadContact();
  } else if (active === "menu") {
    loadMenu();
  } else {
    loadHome();
  }
}

home.addEventListener("click", () => {
  active = "home";
  renderPage();
});
menu.addEventListener("click", () => {
  active = "menu";
  renderPage();
});
contact.addEventListener("click", () => {
  active = "contact";
  renderPage();
});

renderPage();