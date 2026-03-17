import type { SpellingList } from '../types/spelling';

export const mockLists: SpellingList[] = [
  {
    id: 'studio-week-3',
    name: 'Week 3 Nature Words',
    accessCode: 'NATURE25',
    wordCount: 8,
    teacherName: 'Ms. Patel',
    practiceWords: [
      {
        id: 'nature-forest',
        prompt: 'A large area filled with trees.',
        answer: 'forest',
      },
      {
        id: 'nature-branch',
        prompt: 'A part of a tree that grows out from the trunk.',
        answer: 'branch',
      },
      {
        id: 'nature-stream',
        prompt: 'A small flow of moving water.',
        answer: 'stream',
      },
      {
        id: 'nature-mountain',
        prompt: 'A very high natural rise of land.',
        answer: 'mountain',
      },
      {
        id: 'nature-valley',
        prompt: 'Low land between hills or mountains.',
        answer: 'valley',
      },
      {
        id: 'nature-pebble',
        prompt: 'A small smooth stone.',
        answer: 'pebble',
      },
      {
        id: 'nature-thunder',
        prompt: 'The loud sound that follows lightning.',
        answer: 'thunder',
      },
      {
        id: 'nature-sunset',
        prompt: 'The time when the sun goes down in the evening.',
        answer: 'sunset',
      },
    ],
  },
  {
    id: 'studio-core-review',
    name: 'Grade 4 Core Review',
    accessCode: 'CORE44',
    wordCount: 8,
    teacherName: 'Mr. Santos',
    practiceWords: [
      {
        id: 'core-fraction',
        prompt: 'A number that names part of a whole.',
        answer: 'fraction',
      },
      {
        id: 'core-journey',
        prompt: 'A trip from one place to another.',
        answer: 'journey',
      },
      {
        id: 'core-whisper',
        prompt: 'To speak in a very quiet voice.',
        answer: 'whisper',
      },
      {
        id: 'core-sparkle',
        prompt: 'To shine with small bright flashes of light.',
        answer: 'sparkle',
      },
      {
        id: 'core-lantern',
        prompt: 'A portable light with a handle.',
        answer: 'lantern',
      },
      {
        id: 'core-picture',
        prompt: 'An image made by drawing, painting, or photographing.',
        answer: 'picture',
      },
      {
        id: 'core-gentle',
        prompt: 'Kind, calm, and not rough.',
        answer: 'gentle',
      },
      {
        id: 'core-balance',
        prompt: 'To keep something steady and not tipping over.',
        answer: 'balance',
      },
    ],
  },
];
