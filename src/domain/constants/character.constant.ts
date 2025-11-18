export const CHARACTER_STATUS = {
  ALIVE: 'Alive',
  DEAD: 'Dead',
  UNKNOWN: 'unknown',
} as const;
export type CharacterStatus = (typeof CHARACTER_STATUS)[keyof typeof CHARACTER_STATUS];

export const CHARACTER_GENDER = {
  MALE: 'Male',
  FEMALE: 'Female',
  GENDERLESS: 'Genderless',
  UNKNOWN: 'unknown',
} as const;
export type CharacterGender = (typeof CHARACTER_GENDER)[keyof typeof CHARACTER_GENDER];
