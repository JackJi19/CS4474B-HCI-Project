import { Input } from '../../../components/ui/Input';

interface ParsedReviewItem {
  word: string;
  teacherClue: string;
}

interface ParsedReviewListProps {
  items: ParsedReviewItem[];
  emptyMessage: string;
  onClueChange: (word: string, nextClue: string) => void;
  onRemoveWord: (index: number) => void;
}

export function ParsedReviewList({
  items,
  emptyMessage,
  onClueChange,
  onRemoveWord,
}: ParsedReviewListProps) {
  if (!items.length) {
    return (
      <div className="teacher-setup__empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="teacher-setup__parsed-list">
      {items.map(({ word, teacherClue }, index) => (
        <li className="teacher-setup__parsed-item" key={`${word}-${index}`}>
          <div className="teacher-setup__parsed-item-header">
            <span className="teacher-setup__parsed-word">{word}</span>
            <button
              aria-label={`Remove ${word} from the spelling list`}
              className="teacher-setup__remove-word"
              onClick={() => onRemoveWord(index)}
              type="button"
            >
              Remove
            </button>
          </div>

          <div className="field-group teacher-setup__clue-field">
            <label className="field-label" htmlFor={`teacher-word-clue-${index}`}>
              Optional clue
            </label>
            <Input
              id={`teacher-word-clue-${index}`}
              name={`teacher-word-clue-${index}`}
              onChange={(event) => onClueChange(word, event.target.value)}
              placeholder="Example: A person you like and trust"
              value={teacherClue}
            />
            <p className="field-help">Add a short clue to help students identify the word.</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
