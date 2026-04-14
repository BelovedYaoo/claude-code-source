import * as React from 'react'
import { Box, Text } from '../../ink.js'
import type { CommandResultDisplay } from '../../commands.js'

type Props = {
  onDone: (
    result?: string,
    options?: { display?: CommandResultDisplay },
  ) => void
}

