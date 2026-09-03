import Card from "./Card.jsx";

export default function Board({ cards, faceDown, locked, onPick }) {
  return (
    <ul className="board" data-count={cards.length}>
      {cards.map((card) => (
        /* keyed by the Pokémon's id, never by position — the whole game
           reorders this array on every pick, and an index key would leave
           React reusing the wrong element for the wrong card */
        <Card key={card.id} card={card} faceDown={faceDown} locked={locked} onPick={onPick} />
      ))}
    </ul>
  );
}
