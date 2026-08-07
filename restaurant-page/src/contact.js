export const loadContact = () => {
    const content = document.querySelector("#content");
    const container = document.createElement("div");
    container.classList.add("contact");
    const heading = document.createElement("h1");
    heading.textContent = "Visit KOI";
    heading.classList.add("heading");
    const intro = document.createElement("p");
    intro.textContent = "Join us for bold Japanese flavours, late-night energy, and an unforgettable dining experience.";
    intro.classList.add("intro");
    const address = document.createElement("address");
    address.textContent = "18 Koi Lane, Maboneng, Johannesburg"
    address.classList.add("address");
    const telephone = document.createElement("p");
    telephone.textContent = "+27 11 000 0000";
    telephone.classList.add("telephone");
    const phoneLink = document.createElement("a");
    phoneLink.href = "tel:+27110000000";
    phoneLink.textContent = "+27 11 000 0000";
    telephone.append("Telephone: ", phoneLink);
    const email = document.createElement("p");
    email.classList.add("email");
    const emailLink = document.createElement("a");
    emailLink.href = "mailto:reservations@koi.example";
    email.append("Email: ", emailLink);
    const hours = document.createElement("h2");
    hours.textContent = "Operating Hours:";
    hours.classList.add("hours");
    const hoursList = document.createElement("ul");
    const listItem1 = document.createElement("li");
    listItem1.textContent = "Monday–Thursday: 12:00–22:00";
    const listItem2 = document.createElement("li");
    listItem2.textContent = "Friday–Saturday: 12:00–23:30";
    const listItem3 = document.createElement("li");
    listItem3.textContent = "Sunday: 12:00–21:00";

    hoursList.append(listItem1, listItem2, listItem3);
    address.append(telephone, email);
    container.append(heading, intro, address, hours, hoursList);
    content.appendChild(container);
}