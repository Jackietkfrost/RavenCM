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
  proficiencies?: ProficiencyInfo[]
  weapons?: any[]
  armors?: any[]
  deities?: any[]
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
}

export type ClassInfo = {
  name: string
  type: string
  source: string
  id: string
  description: string
  htmlDescription?: string
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
}

// type EquipmentInfo = {
//   name: string
//   type: string
//   source: string
//   id: string
//   description: string
// }
