import type { Command } from '../../commands.js'

const desktop = {
  type: 'local-jsx',
  name: 'desktop',
  aliases: ['app'],
  description: 'Removed command placeholder',
  isHidden: true,
  isEnabled: () => false,
  load: () => import('./desktop.js'),
} satisfies Command

export default desktop
