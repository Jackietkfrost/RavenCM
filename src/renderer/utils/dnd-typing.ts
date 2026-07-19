export type ElementsInfo = {
  races: RaceInfo[]
  classes: ClassInfo[]
  spells: SpellInfo[]
  languages: LanguageInfo[]
  items: any[]
  companions: any[]
  feats: FeatInfo[]
  grants: any[]
  rules: any[]
  magicItems: any[]
  backgrounds: BackgroundInfo[]
  equipment: any[]
  archetypes: any[]
  archetypeFeatures: any[]
  classFeatures?: any[]
  proficiencies?: ProficiencyInfo[]
  weapons?: any[]
  armors?: any[]
  deities?: any[]
  sources?: any[]
  subRaces?: any[]
  raceVariants?: any[]
  backgroundVariants?: any[]
  backgroundFeatures?: any[]
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
  htmlDescription?: string
}

export type CharacterInfo = {
  name: string
  avatar: string
  class: string
  race: string
  subrace?: string
  backgroundVariant?: string
  backgroundFeature?: string
  pronouns: string
  level: number
  background: BackgroundInfo
  archetype: string
  alignment: string
  languages: string[]
  proficiency: string
  filePath?: string
  feat: string
  spells: SpellInfo[]
  abilityGenerationOption: string
  averageHitPoints?: boolean
  feats?: boolean
  multiclassing?: boolean
  inventory?: any[]
  equipment?: any[]
  gender?: string
  playerName?: string
  experience?: number
  deity?: string
  age?: string
  height?: string
  weight?: string
  eyes?: string
  skin?: string
  hair?: string
  additionalFeatures?: string
  armorClass?: string
  hp?: number
  str?: number
  dex?: number
  con?: number
  int?: number
  wis?: number
  cha?: number
  speed?: number
  proficientSkills?: string[]
  proficientSavingThrows?: string[]
}

export type SubRaceInfo = {
  name: string
  id: string
  type: string
  description: string
  htmlDescription?: string
}

export type RaceInfo = {
  name: string
  type: string
  source: string
  id: string
  subraces: SubRaceInfo
  description: string
  htmlDescription?: string
  setters?: any
  rules?: any[]
}

export type ClassInfo = {
  name: string
  type: string
  source: string
  id: string
  description: string
  htmlDescription?: string
  setters?: any
  rules?: any[]
}

export type SpellInfo = {
  name: string
  level: string
  school: string
  description: string
  source: string
  id: string
  htmlDescription?: string
}

export type LanguageInfo = {
  name: string
  description: string
  source: string
  id: string
  htmlDescription?: string
}

export type BackgroundInfo = {
  name: string
  description: string
  source: string
  id: string
  htmlDescription?: string
  setters?: any
  rules?: any[]
}

export type ProficiencyInfo = {
  name: string
  description: string
  source: string
  id: string
  htmlDescription?: string
}

export type FeatInfo = {
  name: string
  description: string
  source: string
  id: string
  htmlDescription?: string
  setters?: any
  rules?: any[]
}

// type EquipmentInfo = {
//   name: string
//   type: string
//   source: string
//   id: string
//   description: string
// }
