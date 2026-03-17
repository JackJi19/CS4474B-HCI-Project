interface ParsedReviewListProps {
  words: string[];
  emptyMessage: string;
  onRemoveWord: (index: number) => void;
}

export function ParsedReviewList({
  words,
  emptyMessage,
  onRemoveWord,
}: ParsedReviewListProps) {
  if (!words.length) {
    return (
      <div className="teacher-setup__empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="teacher-setup__parsed-list">
      {words.map((word, index) => (
        <li className="teacher-setup__parsed-item" key={`${word}-${index}`}>
          <span className="teacher-setup__parsed-word">{word}</span>
          <button
            aria-label={`Remove ${word} from the spelling list`}
            className="teacher-setup__remove-word"
            onClick={() => onRemoveWord(index)}
            type="button"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
