import type { Command } from '../../commands.js'

export default {
  type: 'local-jsx',
  name: 'logout',
  description: 'Removed command placeholder',
  isHidden: true,
  isEnabled: () => false,
  load: () => import('./logout.js'),
} satisfies Command
