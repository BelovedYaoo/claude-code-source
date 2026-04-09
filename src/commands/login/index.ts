import type { Command } from '../../commands.js'

const removedLoginCommand = {
  type: 'local-jsx',
  name: 'login',
  description: 'Removed command placeholder',
  isHidden: true,
  isEnabled: () => false,
  load: () => import('./login.js'),
} satisfies Command

export default () => removedLoginCommand
