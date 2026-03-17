import { mockLists } from '../data/mockLists';
import type { SpellingList } from '../types/spelling';

export interface StudentEntryValidationResult {
  isValid: boolean;
  normalizedValue: string;
  matchedList?: SpellingList;
  error?: string;
}

export function validateStudentEntry(rawValue: string): StudentEntryValidationResult {
  const normalizedValue = rawValue.trim();

  if (!normalizedValue) {
    return {
      isValid: false,
      normalizedValue,
      error: 'Enter an access code or list name to begin practice.',
    };
  }

  const loweredValue = normalizedValue.toLowerCase();
  const matchedList = mockLists.find((list) => {
    return (
      list.accessCode.toLowerCase() === loweredValue ||
      list.name.toLowerCase() === loweredValue
    );
  });

  if (!matchedList) {
    return {
      isValid: false,
      normalizedValue,
      error:
        'That code or list name was not found. Try "NATURE25" or "Week 3 Nature Words".',
    };
  }

  return {
    isValid: true,
    normalizedValue,
    matchedList,
  };
}
