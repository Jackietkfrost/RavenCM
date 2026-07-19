import { createVuetify } from 'vuetify'
import { ko, en, zhHans, zhHant, de, es, ja, fr, ru, pt, nl } from 'vuetify/locale'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'

import colors from 'vuetify/util/colors'

const getInitialTheme = (): string => {
  const saved = localStorage.getItem('theme')
  if (saved) return saved

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = prefersDark ? 'dark' : 'light'
  localStorage.setItem('theme', theme)
  return theme
}

export default createVuetify({
  locale: {
    messages: { ko, en, zhHans, zhHant, de, es, ja, fr, ru, pt, nl },
    locale: 'en',
    fallback: 'en'
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: getInitialTheme(),
    themes: {
      light: {
        dark: false,
        colors: {
          primary: colors.brown.lighten1,
          background: colors.brown.lighten5,
          button: colors.brown.darken1,
          accordion: colors.brown.lighten4,
          header: colors.brown.darken2,
          subheader: colors.brown.darken3
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: colors.brown.lighten1,
          background: colors.grey.darken4,
          button: colors.brown.lighten1,
          outline_button: colors.brown.lighten2,
          header: colors.brown.darken2,
          subheader: colors.brown.darken3
        }
      }
    }
  }
})
