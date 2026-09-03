/* =========================================================
   The smallest possible helper for building elements, so the
   rendering code reads as structure rather than as thirty
   lines of createElement.
   ========================================================= */

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);

  Object.entries(props).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return;

    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key === "dataset") Object.assign(node.dataset, value);
    else if (key === "style") Object.assign(node.style, value);
    else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key in node && key !== "list") node[key] = value;
    else node.setAttribute(key, value === true ? "" : value);
  });

  [].concat(children).forEach((child) => {
    if (child === null || child === undefined || child === false) return;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  });

  return node;
}

export const svg = (markup, className = "") => {
  const wrapper = document.createElement("span");
  wrapper.innerHTML = `<svg viewBox="0 0 16 16" class="${className}" aria-hidden="true">${markup}</svg>`;
  return wrapper.firstElementChild;
};

export const TICK = () => svg('<polyline points="2,8 6,12 14,4" />');
export const CHEVRON = () => svg('<polyline points="4,6 8,10 12,6" />');
