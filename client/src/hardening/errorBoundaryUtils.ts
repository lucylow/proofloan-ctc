export function shouldResetBoundaryOnRouteChange(previousPath: string, nextPath: string) {
  return previousPath !== nextPath;
}

export function shouldExposeTechnicalDetails(isDevelopment: boolean) {
  return isDevelopment;
}

export function safeTechnicalDetails(error: Error | null, isDevelopment: boolean) {
  if (!error || !isDevelopment) return null;
  return {
    name: error.name,
    message: error.message,
    stack: error.stack?.slice(0, 4000),
  };
}
