import type { Command } from '../../commands.js'

const bridge = {
  type: 'local-jsx',
  name: 'remote-control',
  aliases: ['rc'],
  description: 'Removed command placeholder',
  argumentHint: '[name]',
  isEnabled: () => false,
  isHidden: true,
  immediate: true,
  load: () => import('./bridge.js'),
} satisfies Command

export default bridge
