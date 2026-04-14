
import { getGlobalConfig, saveGlobalConfig } from '../utils/config.js'

export function resetProToOpusDefault(): void {
  const config = getGlobalConfig()

  if (config.opusProMigrationComplete) {
    return
  }

  saveGlobalConfig(current => ({
    ...current,
    opusProMigrationComplete: true,
  }))
}
