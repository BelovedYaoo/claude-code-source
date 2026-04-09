import type { Command } from '../../commands.js'

const web = {
  type: 'local-jsx',
  name: 'web-setup',
  description: 'Removed command placeholder',
  isHidden: true,
  isEnabled: () => false,
  load: () => import('./remote-setup.js'),
} satisfies Command

export default web
