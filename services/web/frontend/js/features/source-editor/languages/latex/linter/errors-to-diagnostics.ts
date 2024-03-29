import { Diagnostic } from '@codemirror/lint'
import { Range } from '../../../utils/range'
import { renderMessage } from '@/features/source-editor/extensions/annotations'

export type LintError = {
  startPos: number
  endPos: number
  pos: number
  suppressIfEditing: boolean
  type: 'info' | 'warning' | 'error'
  text: string
}

// Convert errors generated by the linter to Diagnostic objects that CM6
// expects. Filter and adjust positions based on cursor position. This is
// adapted from roughly equivalent Ace code:
// https://github.com/overleaf/ace/blob/31998cd6178c4115ad67f8e101f41590dcb32522/lib/ace/mode/latex.js#L58-L183
export const errorsToDiagnostics = (
  errors: LintError[],
  cursorPosition: number,
  docLength: number
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []
  const cursorAtEndOfDocument = cursorPosition === docLength
  const suppressions = []

  for (const error of errors) {
    const errorRange = new Range(error.startPos, error.endPos)

    // Reject an error that starts or ends after the document length. This
    // can happen if the document changed while the linter was running and
    // would cause an exception if a diagnostic was created for it
    if (errorRange.from > docLength || errorRange.to > docLength) {
      continue
    }

    const cursorInRange = errorRange.contains(cursorPosition)
    const cursorAtStart = cursorPosition === errorRange.from + 1 // cursor after start not before
    const cursorAtEnd = cursorPosition === errorRange.to

    // If the user is editing at the beginning or end of this error, suppress
    // it from display
    if (error.suppressIfEditing && (cursorAtStart || cursorAtEnd)) {
      suppressions.push(errorRange)
      continue
    }

    // Otherwise, check if this error starts inside a
    // suppressed error range (it's probably a cascading
    // error, so we hide it while the user is typing)
    let isCascadeError = false
    for (const badRange of suppressions) {
      if (badRange.intersects(errorRange)) {
        isCascadeError = true
        break
      }
    }

    // Hide cascade errors
    if (isCascadeError) {
      continue
    }

    // Adjust the error range if the cursor is inside the range.
    //
    // If the cause of the error is at the beginning, move the end of the range
    // to the cursor position.
    //
    // If the cause of the error is at the end, and the cursor is inside the
    // range, move the beginning of the range to the cursor position.
    //
    // If the cursor is at the end of the document, make no adjustment because
    // doing the regular adjustments doesn't always give intuitive results at
    // the end of the document.
    const errorAtStart = error.pos === error.startPos
    const movableStart =
      cursorInRange && !errorAtStart && !cursorAtEndOfDocument
    const movableEnd = cursorInRange && errorAtStart && !cursorAtEndOfDocument
    const newStart = movableStart ? cursorPosition : errorRange.from
    const newEnd = movableEnd ? cursorPosition : errorRange.to

    const diagnostic: Diagnostic = {
      from: newStart,
      to: newEnd,
      severity: error.type,
      message: error.text,
    }

    // Create the diagnostic
    diagnostics.push({
      ...diagnostic,
      renderMessage: () => renderMessage(diagnostic),
    })
  }

  return diagnostics
}
