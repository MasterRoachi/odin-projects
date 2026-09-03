import { useState, useEffect, useRef, useCallback } from "react";
import { usePokemon } from "./hooks/usePokemon.js";
import { pick, shuffle } from "./lib/shuffle.js";
import { sizeFor, isLastLevel, LEVELS } from "./lib/levels.js";
import { loadBest, saveBest } from "./lib/storage.js";
import Hud from "./components/Hud.jsx";
import Board from "./components/Board.jsx";
import Overlay from "./components/Overlay.jsx";

/* =========================================================
   Don't Click Twice.

   Click every card on the board exactly once. After each pick
   the cards turn over and shuffle, so the position you just
   learned is worthless — only the picture matters.

   Click one you have already had, and the run is over.
   ========================================================= */

const FLIP_MS = 380; // how long the cards spend face-down
const SETTLE_MS = 80; // a beat after the shuffle before they turn back

export default function App() {
  const { status, roster, error, retry } = usePokemon();

  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [picked, setPicked] = useState([]); // ids taken this level
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(loadBest);

  /* idle → playing → flipping → cleared → playing … → won | lost */
  const [phase, setPhase] = useState("idle");

  /*
   * Every timer this component starts, so they can all be cancelled.
   * Without this, losing mid-flip leaves a timeout that fires afterwards and
   * turns the cards back over on a finished game.
   */
  const timers = useRef([]);

  const after = useCallback((ms, fn) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const cancelTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => cancelTimers, [cancelTimers]);

  /* --- dealing ---------------------------------------------- */

  /**
   * Deals a level.
   *
   * This has to be an action rather than something computed while rendering,
   * because it is random — a component that returned a different board every
   * time React chose to render it would be impossible to reason about.
   */
  const deal = useCallback(
    (forLevel) => {
      cancelTimers();
      setCards(pick(roster, sizeFor(forLevel)));
      setPicked([]);
      setPhase("playing");
    },
    [roster, cancelTimers]
  );

  const startRun = useCallback(() => {
    setLevel(1);
    setScore(0);
    deal(1);
  }, [deal]);

  /* the roster arriving is the cue to deal the first board */
  useEffect(() => {
    if (status === "ready" && phase === "idle") startRun();
  }, [status, phase, startRun]);

  /* the high score is the one thing that outlives the tab */
  useEffect(() => {
    saveBest(best);
  }, [best]);

  /* --- playing ---------------------------------------------- */

  const flipAndShuffle = useCallback(() => {
    setPhase("flipping");
    after(FLIP_MS, () => {
      setCards((current) => shuffle(current));
      after(SETTLE_MS, () => setPhase("playing"));
    });
  }, [after]);

  function handlePick(card) {
    // clicks during a flip, or after the run has ended, are not moves
    if (phase !== "playing") return;

    if (picked.includes(card.id)) {
      cancelTimers();
      setPhase("lost");
      return;
    }

    const nextPicked = [...picked, card.id];
    const nextScore = score + 1;

    setPicked(nextPicked);
    setScore(nextScore);
    setBest((previous) => Math.max(previous, nextScore));

    if (nextPicked.length < cards.length) {
      flipAndShuffle();
      return;
    }

    /* board cleared */
    if (isLastLevel(level)) {
      setPhase("won");
      return;
    }

    setPhase("cleared");
    after(900, () => {
      const next = level + 1;
      setLevel(next);
      deal(next);
    });
  }

  /* --- rendering -------------------------------------------- */

  if (status === "loading") {
    return (
      <Shell>
        <div className="system-state">
          <p className="system">Loading the roster…</p>
        </div>
      </Shell>
    );
  }

  if (status === "error") {
    return (
      <Shell>
        <div className="system-state">
          <p className="system system--bad">{error}</p>
          <button type="button" className="dex-button" onClick={retry}>
            Try again
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      hud={
        <Hud
          score={score}
          best={best}
          level={level}
          levels={LEVELS.length}
          picked={picked.length}
          total={cards.length}
        />
      }
    >
      <Board
        cards={cards}
        faceDown={phase === "flipping"}
        locked={phase !== "playing"}
        onPick={handlePick}
      />

      <Overlay phase={phase} score={score} best={best} level={level} onRestart={startRun} />
    </Shell>
  );
}

function Shell({ hud, children }) {
  return (
    <div className="dex">
      <div className="dex-body">
        <div className="dex-top">
          {/* the lens, the three lights and the seams are what make the object
              recognisable; none of them mean anything, so all of them are
              hidden from assistive technology */}
          <span className="lens" aria-hidden="true">
            <i className="glint" />
          </span>
          <span className="lights" aria-hidden="true">
            <i className="light light--red" />
            <i className="light light--amber" />
            <i className="light light--green" />
          </span>
          <header className="dex-label">
            <h1>
              Don&rsquo;t Click <span>Twice</span>
            </h1>
            <p>Every card once. The board shuffles after every pick.</p>
          </header>
        </div>

        <div className="bezel">
          <div className="screen">{children}</div>
        </div>

        <div className="deck">
          {hud}
          <div className="controls" aria-hidden="true">
            <span className="dpad" />
            <span className="knobs">
              <i />
              <i />
            </span>
            <span className="grille">
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
      </div>

      <footer className="plate">
        <p>
          <a href="../../">back to the projects</a> · <a href="../README.md">README</a> · data from{" "}
          <a href="https://pokeapi.co/">PokéAPI</a>
        </p>
      </footer>
    </div>
  );
}
