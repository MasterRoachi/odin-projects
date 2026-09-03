/* =========================================================
   Entry point. Everything it does is wire the two halves
   together: start the store, mount the interface, install
   the keyboard.
   ========================================================= */

import "./styles.css";
import { start } from "./model/store.js";
import { mount } from "./ui/app.js";
import { installKeyboard } from "./ui/keyboard.js";

start();
mount(document.querySelector("#app"));
installKeyboard();
