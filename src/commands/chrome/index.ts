import type { Command } from '../../commands.js'

const command: Command = {
  name: 'chrome',
  description: 'Removed command placeholder',
  isHidden: true,
  isEnabled: () => false,
  type: 'local-jsx',
  load: () => import('./chrome.js'),
}

export default command
