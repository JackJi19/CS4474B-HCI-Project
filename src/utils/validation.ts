import type { SpellingList } from '../types/spelling';
import { findListByEntry } from './practiceStorage';

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

  const matchedList = findListByEntry(normalizedValue);

  if (!matchedList) {
    return {
      isValid: false,
      normalizedValue,
      error:
        'That code or list name was not found. Try NATURE25, CORE44, or a code from Teacher Setup.',
    };
  }

  return {
    isValid: true,
    normalizedValue,
    matchedList,
  };
}
