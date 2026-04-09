import type { Command } from '../../commands.js'

const voice = {
  type: 'local',
  name: 'voice',
  description: 'Removed command placeholder',
  isHidden: true,
  isEnabled: () => false,
  supportsNonInteractive: false,
  load: () => import('./voice.js'),
} satisfies Command

export default voice
