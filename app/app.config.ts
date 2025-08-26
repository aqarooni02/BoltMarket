import * as theme from './theme'

export default defineAppConfig({
  ui: {
    // Spread custom marketplace theme overrides
    ...theme.marketplaceTheme,
    button: theme.button,
    card: theme.card,
    alert: theme.alert
  }
})