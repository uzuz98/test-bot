export const errorMessages = {
  pleaseSignIn: () => 'Please sign in first',
  isNotInitialized: (item: string) => `${item} is not initialized`,
  notSupported: (item: string) => `${item} is not supported`,
  notFound: (item: string) => `${item} is not found`,
  notImplemented: (item: string) => `${item} is not implemented`,
  failedToGet: (item: string) => `Failed to get ${item}`,
  invalid: (item: string) => `Invalid ${item}`,

  // NEAR
  onlyUsedOn: (item: string) => `only used on ${item}`
}
