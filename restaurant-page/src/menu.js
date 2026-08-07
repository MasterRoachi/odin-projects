const menuItems = [
  {
    name: "Koi Gyoza",
    price: "R95",
    description:
      "Crispy chicken and shiitake dumplings with ponzu dipping sauce.",
    category: "Small Plates",
  },
  {
    name: "Firecracker Karaage",
    price: "R120",
    description:
      "Japanese fried chicken glazed with chilli, honey and toasted sesame.",
    category: "Small Plates",
  },
  {
    name: "Moon Pool Ramen",
    price: "R175",
    description:
      "Miso broth, pork belly, marinated egg, mushrooms and spring onion.",
    category: "Mains",
  },
  {
    name: "Miso Black Cod",
    price: "R245",
    description:
      "Charred cod with sweet miso glaze, pickled daikon and steamed rice.",
    category: "Mains",
  },
  {
    name: "Wagyu Yakiniku Don",
    price: "R210",
    description:
      "Seared wagyu-style beef, tare sauce, rice and crispy shallots.",
    category: "Mains",
  },
  {
    name: "Matcha Tiramisu",
    price: "R90",
    description:
      "Matcha-soaked sponge layered with mascarpone and white chocolate.",
    category: "Dessert",
  },
];

export const loadMenu = () => {
  const content = document.querySelector("#content");
  const container = document.createElement("div");
  container.classList.add("menu");
  const heading = document.createElement("h1");
  heading.textContent = "Our Menu";
  const paragraph = document.createElement("p");
  paragraph.textContent =
    "Japanese street-food favourites, refined with bold flavours and modern technique.";

  const menuGrid = document.createElement("div");
  menuGrid.classList.add("menu-grid");

  menuItems.forEach((item) => {
    const article = document.createElement("article");
    article.classList.add("menu-item");
    const category = document.createElement("p");
    category.textContent = item.category;
    category.classList.add("category");
    const itemName = document.createElement("h2");
    itemName.textContent = item.name;
    itemName.classList.add("name");
    const description = document.createElement("p");
    description.textContent = item.description;
    description.classList.add("description");
    const price = document.createElement("p");
    price.textContent = item.price;
    price.classList.add("price");

    article.append(category, itemName, description, price);
    menuGrid.appendChild(article);
  });
  container.append(heading, paragraph, menuGrid);
  content.appendChild(container);
};
