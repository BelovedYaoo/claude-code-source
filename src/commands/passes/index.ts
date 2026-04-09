import type { Command } from '../../commands.js'

export default {
  type: 'local-jsx',
  name: 'passes',
  description: 'Removed command placeholder',
  isHidden: true,
  isEnabled: () => false,
  load: () => import('./passes.js'),
} satisfies Command
