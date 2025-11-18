import { CharacterGender, CharacterStatus } from '../constants/character.constant';
import { LocationModel } from './location.model';

export interface CharacterModel {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  image: string;
  created: string;
  originLocationId?: string;
  currentLocationId?: string;
  origin?: LocationModel;
  location?: LocationModel;
}

export interface FilterArgs {
  id?: string;
  name?: string;
  status?: CharacterStatus;
  species?: string;
  gender?: CharacterGender;
  origin?: string;
}
