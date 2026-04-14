import chalk from 'chalk';
import React, { useMemo } from 'react';
import { useClipboardImageHint } from '../hooks/useClipboardImageHint.js';
import { useSettings } from '../hooks/useSettings.js';
import { useTextInput } from '../hooks/useTextInput.js';
import { Box, color, useTerminalFocus, useTheme } from '../ink.js';
import type { BaseTextInputProps } from '../types/textInputTypes.js';
import { isEnvTruthy } from '../utils/envUtils.js';
import type { TextHighlight } from '../utils/textHighlighting.js';
import { BaseTextInput } from './BaseTextInput.js';

// Block characters for waveform bars: space (silent) + 8 rising block elements.
const BARS = ' \u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588';

// Mini waveform cursor width
const CURSOR_WAVEFORM_WIDTH = 1;

// Smoothing factor (0 = instant, 1 = frozen). Applied as EMA to
// smooth both rises and falls for a steady, non-jittery bar.
const SMOOTH = 0.7;

// Boost factor for audio levels — computeLevel normalizes with a
// conservative divisor (rms/2000), so normal speech sits around
// 0.3-0.5. This multiplier lets the bar use the full range.
const LEVEL_BOOST = 1.8;

// Raw audio level threshold (pre-boost) below which the cursor is
// grey. computeLevel returns sqrt(rms/2000), so ambient mic noise
// typically sits at 0.05-0.15. Speech starts around 0.2+.
const SILENCE_THRESHOLD = 0.15;
export type Props = BaseTextInputProps & {
  highlights?: TextHighlight[];
};
export default function TextInput(props: Props): React.ReactNode {
  const [theme] = useTheme();
  const isTerminalFocused = useTerminalFocus();
  // Hoisted to mount-time — this component re-renders on every keystroke.
  const accessibilityEnabled = useMemo(() => isEnvTruthy(process.env.CLAUDE_CODE_ACCESSIBILITY), []);
  const settings = useSettings();
  void settings;
  const isVoiceRecording = false;
  const animRef = () => {};

  // Show hint when terminal regains focus and clipboard has an image
  useClipboardImageHint(isTerminalFocused, !!props.onImagePaste);

  const canShowCursor = isTerminalFocused && !accessibilityEnabled;
  const invert: (text: string) => string = canShowCursor ? chalk.inverse : (text: string) => text;
  const textInputState = useTextInput({
    value: props.value,
    onChange: props.onChange,
    onSubmit: props.onSubmit,
    onExit: props.onExit,
    onExitMessage: props.onExitMessage,
    onHistoryReset: props.onHistoryReset,
    onHistoryUp: props.onHistoryUp,
    onHistoryDown: props.onHistoryDown,
    onClearInput: props.onClearInput,
    focus: props.focus,
    mask: props.mask,
    multiline: props.multiline,
    cursorChar: props.showCursor ? ' ' : '',
    highlightPastedText: props.highlightPastedText,
    invert,
    themeText: color('text', theme),
    columns: props.columns,
    maxVisibleLines: props.maxVisibleLines,
    onImagePaste: props.onImagePaste,
    disableCursorMovementForUpDownKeys: props.disableCursorMovementForUpDownKeys,
    disableEscapeDoublePress: props.disableEscapeDoublePress,
    externalOffset: props.cursorOffset,
    onOffsetChange: props.onChangeCursorOffset,
    inputFilter: props.inputFilter,
    inlineGhostText: props.inlineGhostText,
    dim: chalk.dim
  });
  return <Box ref={animRef}>
      <BaseTextInput inputState={textInputState} terminalFocus={isTerminalFocused} highlights={props.highlights} invert={invert} hidePlaceholderText={isVoiceRecording} {...props} />
    </Box>;
}

