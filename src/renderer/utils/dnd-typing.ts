export type ElementsInfo = {
  races: RaceInfo[]
  classes: ClassInfo[]
  spells: SpellInfo[]
  languages: LanguageInfo[]
  items: string[]
  companions: string[]
  feats: string[]
  grants: string[]
  rules: string[]
  magicItems: string[]
  backgrounds: BackgroundInfo[]
  equipment: string[]
  archetypes: string[]
  archetypeFeatures: string[]
}

export type ItemInfo = {
  name: string
  type: string
  source: string
  id: string
  description: string
  category: string
  cost: number
  slot: string
}

export type CharacterInfo = {
  name: string
  avatar: string
  class: string
  race: string
  pronouns: string
  level: number
  background: BackgroundInfo
  archetype: string
  alignment: string
  languages: LanguageInfo[]
  proficiency: string
  feat: string
  spells: SpellInfo[]
  abilityGenerationOption: string
}

export type SubRaceInfo = {
  name: string
  id: string
  type: string
  description: string
}

export type RaceInfo = {
  name: string
  type: string
  source: string
  id: string
  subraces: SubRaceInfo
  description: string
}

export type ClassInfo = {
  name: string
  type: string
  source: string
  id: string
  description: string
}

export type SpellInfo = {
  name: string
  level: string
  school: string
  description: string
  source: string
  id: string
}

export type LanguageInfo = {
  name: string
  description: string
  source: string
  id: string
}

export type BackgroundInfo = {
  name: string
  description: string
  source: string
  id: string
}

// type EquipmentInfo = {
//   name: string
//   type: string
//   source: string
//   id: string
//   description: string
// }
