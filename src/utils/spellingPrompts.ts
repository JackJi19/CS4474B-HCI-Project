import type { PracticeWord } from '../types/spelling';

const generatedPromptText = 'Teacher-selected spelling word.';

function normalizePromptText(value?: string) {
  return value?.trim() ?? '';
}

export function buildGeneratedPrompt() {
  return generatedPromptText;
}

export function hasMeaningfulPrompt(word: PracticeWord) {
  const teacherClue = normalizePromptText(word.teacherClue);
  if (teacherClue) {
    return true;
  }

  const prompt = normalizePromptText(word.prompt);
  return Boolean(prompt) && prompt.toLowerCase() !== generatedPromptText.toLowerCase();
}

export function resolvePrimaryPrompt(word: PracticeWord) {
  const teacherClue = normalizePromptText(word.teacherClue);
  if (teacherClue) {
    return teacherClue;
  }

  const prompt = normalizePromptText(word.prompt);
  if (prompt) {
    return prompt;
  }

  return generatedPromptText;
}

export function isDuplicatePromptText(primaryPrompt: string, secondaryPrompt?: string | null) {
  const normalizedPrimaryPrompt = normalizePromptText(primaryPrompt).toLowerCase();
  const normalizedSecondaryPrompt = normalizePromptText(secondaryPrompt ?? '').toLowerCase();

  return Boolean(normalizedPrimaryPrompt) && normalizedPrimaryPrompt === normalizedSecondaryPrompt;
}
