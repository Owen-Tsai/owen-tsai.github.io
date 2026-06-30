type TransitionHandler = (navigate: () => void) => void

let handler: TransitionHandler | null = null

export function setTransitionHandler(fn: TransitionHandler | null) {
  handler = fn
}

export function navigateWithTransition(navigate: () => void) {
  if (handler) {
    handler(navigate)
  } else {
    navigate()
  }
}
