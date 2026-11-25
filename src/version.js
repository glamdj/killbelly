// NATIVE: subir (e igualar o versionCode em android/app/build.gradle) sempre que muda algo nativo
// (plugins, permissões, ícones). WEB: número da compilação, injetado pelo GitHub Actions.
export const NATIVE = 9;
/* global __WEB_BUILD__ */
export const WEB = typeof __WEB_BUILD__ !== 'undefined' ? __WEB_BUILD__ : 0;
