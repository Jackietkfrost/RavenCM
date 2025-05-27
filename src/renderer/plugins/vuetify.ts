import { createVuetify } from 'vuetify'
import { ko, en, zhHans, zhHant, de, es, ja, fr, ru, pt, nl } from 'vuetify/locale'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import 'vuetify/styles'

import colors from 'vuetify/util/colors'

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
    themes: {
      light: {
        dark: false,
        colors: {
          primary: colors.brown.darken2,
          background: colors.brown.lighten5,
          button: colors.brown.darken1,
          accordion: colors.brown.lighten4
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: colors.brown.darken4,
          background: colors.grey.darken4,
          button: colors.brown.lighten1,
        }
      }
    }
  }
})
