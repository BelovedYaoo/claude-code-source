import type { Command } from '../../commands.js'
const privacySettings = {
  type: 'local-jsx',
  name: 'privacy-settings',
  description: 'Removed command placeholder',
  isEnabled: () => false,
  isHidden: true,
  load: () => import('./privacy-settings.js'),
} satisfies Command

export default privacySettings
