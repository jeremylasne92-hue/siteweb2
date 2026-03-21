/* Google Analytics gtag.js global type declaration */
export {};

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetOrName: string | Date,
      params?: Record<string, unknown>,
    ) => void;
    dataLayer: Array<unknown>;
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
