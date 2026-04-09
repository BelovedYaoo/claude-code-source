import type { Command } from '../../commands.js'

const upgrade = {
  type: 'local-jsx',
  name: 'upgrade',
  description: 'Removed command placeholder',
  isHidden: true,
  isEnabled: () => false,
  load: () => import('./upgrade.js'),
} satisfies Command

export default upgrade
