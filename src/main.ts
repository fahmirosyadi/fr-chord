import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'hammerjs';

// Support recovery links sent while the app was using a hash-style callback.
if (window.location.hash.startsWith('#/reset-password')) {
  const recoveryUrl = new URL(window.location.href);
  recoveryUrl.pathname = '/reset-password';
  recoveryUrl.hash = '';
  window.history.replaceState(window.history.state, '', recoveryUrl.toString());
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
