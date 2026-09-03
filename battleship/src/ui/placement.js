/* =========================================================
   Dragging ships onto the board.

   Pointer events rather than HTML drag-and-drop, because this
   needs to show whether the drop is legal *while* the ship is
   moving, and it has to work under a finger.

   The placed fleet is kept here as a plain list, and the board
   is rebuilt from it whenever it changes. That is why picking
   a ship back up needs no `remove` on the gameboard: there is
   only ever one way a board gets built, from this list.
   ========================================================= */

import { cellSize } from "./boardView.js";

export function createPlacement({ game, container, fleet, tray, onChange }) {
  /** @type {{name: string, length: number, origin: number[], orientation: string}[]} */
  let placed = [];

  let drag = null; // { name, length, orientation, grabIndex, ghost, pointerId }

  /* ---------------------------------------------------- */

  /** Rebuilds the human board from the list. The list is the truth. */
  function sync() {
    game.clearFleet("human");
    placed.forEach(({ name, length, origin, orientation }) => {
      game.place("human", name, length, origin, orientation);
    });
    onChange();
  }

  const isPlaced = (name) => placed.some((p) => p.name === name);

  const footprint = (length, [x, y], orientation) =>
    Array.from({ length }, (_, i) => (orientation === "vertical" ? [x, y + i] : [x + i, y]));

  /* --- the tray ---------------------------------------- */

  function renderTray() {
    tray.replaceChildren();

    fleet.forEach(({ name, length }) => {
      const item = document.createElement("div");
      item.className = `tray-ship${isPlaced(name) ? " is-placed" : ""}`;
      item.dataset.name = name;

      const hull = document.createElement("div");
      hull.className = "hull";
      // width in cells, resolved by CSS — measuring here left the tray ships
      // at the wrong length whenever the board changed size
      hull.style.setProperty("--len", length);

      const caption = document.createElement("span");
      caption.className = "tray-label";
      caption.textContent = `${name} (${length})`;

      item.append(hull, caption);
      item.addEventListener("pointerdown", (event) => {
        if (isPlaced(name)) return;
        startDrag(event, { name, length, orientation: "horizontal", grabIndex: grabFrom(event, hull, length) });
      });

      tray.append(item);
    });
  }

  /** Which segment of the hull the pointer went down on. */
  function grabFrom(event, hull, length) {
    const rect = hull.getBoundingClientRect();
    const along = (event.clientX - rect.left) / rect.width;
    return Math.min(length - 1, Math.max(0, Math.floor(along * length)));
  }

  /* --- picking a placed ship back up -------------------- */

  function pickUpAt(event, coord) {
    const found = placed.find((p) =>
      footprint(p.length, p.origin, p.orientation).some((c) => c[0] === coord[0] && c[1] === coord[1])
    );
    if (!found) return false;

    const cells = footprint(found.length, found.origin, found.orientation);
    const grabIndex = cells.findIndex((c) => c[0] === coord[0] && c[1] === coord[1]);

    placed = placed.filter((p) => p.name !== found.name);
    sync();
    renderTray();

    startDrag(event, {
      name: found.name,
      length: found.length,
      orientation: found.orientation,
      grabIndex,
    });
    return true;
  }

  /* --- the drag ---------------------------------------- */

  function startDrag(event, spec) {
    event.preventDefault();
    drag = { ...spec, pointerId: event.pointerId };

    const ghost = document.createElement("div");
    ghost.className = "ghost";
    document.body.append(ghost);
    drag.ghost = ghost;

    sizeGhost();
    moveGhost(event);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKey);
  }

  function sizeGhost() {
    const size = cellSize(container) || 34;
    const { length, orientation, ghost } = drag;
    ghost.classList.toggle("vertical", orientation === "vertical");
    ghost.style.width = `${orientation === "vertical" ? size : length * size}px`;
    ghost.style.height = `${orientation === "vertical" ? length * size : size}px`;
  }

  function moveGhost(event) {
    const size = cellSize(container) || 34;
    const { grabIndex, orientation, ghost } = drag;
    // hold the ship by the segment that was grabbed, so it sits under the
    // pointer the way it was picked up
    const offsetX = orientation === "vertical" ? size / 2 : (grabIndex + 0.5) * size;
    const offsetY = orientation === "vertical" ? (grabIndex + 0.5) * size : size / 2;
    ghost.style.left = `${event.clientX - offsetX}px`;
    ghost.style.top = `${event.clientY - offsetY}px`;
  }

  /** The square under the pointer, or null if the pointer is off the grid. */
  function cellUnder(event) {
    const rect = container.getBoundingClientRect();
    const size = cellSize(container);
    if (!size) return null;

    const x = Math.floor((event.clientX - rect.left) / size);
    const y = Math.floor((event.clientY - rect.top) / size);
    if (x < 0 || y < 0 || x >= game.size || y >= game.size) return null;
    return [x, y];
  }

  function originFor(coord) {
    const { grabIndex, orientation } = drag;
    return orientation === "vertical"
      ? [coord[0], coord[1] - grabIndex]
      : [coord[0] - grabIndex, coord[1]];
  }

  function clearHighlight() {
    container.querySelectorAll(".drop-ok, .drop-bad").forEach((c) => {
      c.classList.remove("drop-ok", "drop-bad");
    });
  }

  function onMove(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    moveGhost(event);
    clearHighlight();

    const coord = cellUnder(event);
    if (!coord) return;

    const origin = originFor(coord);
    const ok = game.player("human").board.canPlace(drag.length, origin, drag.orientation);

    footprint(drag.length, origin, drag.orientation).forEach(([x, y]) => {
      const cell = container.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
      if (cell) cell.classList.add(ok ? "drop-ok" : "drop-bad");
    });
  }

  function onKey(event) {
    if (!drag) return;
    if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      drag.orientation = drag.orientation === "vertical" ? "horizontal" : "vertical";
      sizeGhost();
    }
    if (event.key === "Escape") cancelDrag();
  }

  function onUp(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;

    const coord = cellUnder(event);
    if (coord) {
      const origin = originFor(coord);
      if (game.player("human").board.canPlace(drag.length, origin, drag.orientation)) {
        placed.push({
          name: drag.name,
          length: drag.length,
          origin,
          orientation: drag.orientation,
        });
        sync();
      }
    }

    cancelDrag();
  }

  function cancelDrag() {
    if (!drag) return;
    drag.ghost.remove();
    drag = null;
    clearHighlight();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    window.removeEventListener("keydown", onKey);
    renderTray();
  }

  /* ---------------------------------------------------- */

  return {
    get placed() {
      return placed.map((p) => ({ ...p }));
    },

    get complete() {
      return placed.length === fleet.length;
    },

    get dragging() {
      return drag !== null;
    },

    /** Called by the board's own pointerdown, to lift a ship already down. */
    tryPickUp(event, coord) {
      return pickUpAt(event, coord);
    },

    shuffle() {
      game.randomiseFleet("human");
      placed = game
        .player("human")
        .board.ships.map((ship) => {
          const cells = game.player("human").board.cellsOf(ship);
          const vertical = cells.length > 1 && cells[0][0] === cells[1][0];
          return {
            name: ship.name,
            length: ship.length,
            origin: cells[0],
            orientation: vertical ? "vertical" : "horizontal",
          };
        });
      renderTray();
      onChange();
    },

    clear() {
      placed = [];
      sync();
      renderTray();
    },

    render: renderTray,
  };
}
