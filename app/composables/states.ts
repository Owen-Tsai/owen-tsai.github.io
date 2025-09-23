export const useAppStates = () => {
  return useState('appState', () => ({
    isInitialLoad: true,
  }))
}
