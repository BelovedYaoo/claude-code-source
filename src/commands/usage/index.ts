import type { Command } from '../../commands.js'

export default {
  type: 'local-jsx',
  name: 'usage',
  description: 'Removed command placeholder',
  isHidden: true,
  isEnabled: () => false,
  load: () => import('./usage.js'),
} satisfies Command
