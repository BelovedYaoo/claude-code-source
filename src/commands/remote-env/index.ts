import type { Command } from '../../commands.js'

export default {
  type: 'local-jsx',
  name: 'remote-env',
  description: 'Removed command placeholder',
  isEnabled: () => false,
  isHidden: true,
  load: () => import('./remote-env.js'),
} satisfies Command
