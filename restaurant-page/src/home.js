import koiLogo from "./assets/image.png"

export const loadHome = () => {
    const content = document.querySelector("#content");
    const container = document.createElement("div");
    container.classList.add("home");
    const heading = document.createElement("h1");
    heading.textContent = "KOI"
    const image = document.createElement("img");
    image.src = koiLogo;
    image.alt = "KOI restaurant logo";
    image.classList.add("koi-logo");
    const paragraph = document.createElement("p");
    paragraph.textContent = "KOI blends the energy of Japanese street food with a modern, elevated dining experience—bold flavours, refined dishes, and an urban atmosphere inspired by balance and perseverance."

    container.append(heading, image, paragraph);
    content.appendChild(container);
}