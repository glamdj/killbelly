(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/@capacitor/core/dist/index.js
  var ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor, registerPlugin, WebPlugin, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp, SystemBarsStyle, SystemBarType, SystemBarsPluginWeb, SystemBars;
  var init_dist = __esm({
    "node_modules/@capacitor/core/dist/index.js"() {
      (function(ExceptionCode2) {
        ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
        ExceptionCode2["Unavailable"] = "UNAVAILABLE";
      })(ExceptionCode || (ExceptionCode = {}));
      CapacitorException = class extends Error {
        constructor(message, code, data) {
          super(message);
          this.message = message;
          this.code = code;
          this.data = data;
        }
      };
      getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
          return "android";
        } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
          return "ios";
        } else {
          return "web";
        }
      };
      createCapacitor = (win) => {
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins = cap.Plugins = cap.Plugins || {};
        const getPlatform = () => {
          return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
        };
        const isNativePlatform = () => getPlatform() !== "web";
        const isPluginAvailable = (pluginName) => {
          const plugin = registeredPlugins.get(pluginName);
          if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            return true;
          }
          if (getPluginHeader(pluginName)) {
            return true;
          }
          return false;
        };
        const getPluginHeader = (pluginName) => {
          var _a;
          return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h) => h.name === pluginName);
        };
        const handleError = (err) => win.console.error(err);
        const registeredPlugins = /* @__PURE__ */ new Map();
        const registerPlugin2 = (pluginName, jsImplementations = {}) => {
          const registeredPlugin = registeredPlugins.get(pluginName);
          if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
          }
          const platform = getPlatform();
          const pluginHeader = getPluginHeader(pluginName);
          let jsImplementation;
          const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
              jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
            } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
              jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
            }
            return jsImplementation;
          };
          const createPluginMethod = (impl, prop) => {
            var _a, _b;
            if (pluginHeader) {
              const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
              if (methodHeader) {
                if (methodHeader.rtype === "promise") {
                  return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                } else {
                  return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                }
              } else if (impl) {
                return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
              }
            } else if (impl) {
              return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
            } else {
              throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
          };
          const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
              const p = loadPluginImplementation().then((impl) => {
                const fn = createPluginMethod(impl, prop);
                if (fn) {
                  const p2 = fn(...args);
                  remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                  return p2;
                } else {
                  throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                }
              });
              if (prop === "addListener") {
                p.remove = async () => remove();
              }
              return p;
            };
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, "name", {
              value: prop,
              writable: false,
              configurable: false
            });
            return wrapper;
          };
          const addListener = createPluginMethodWrapper("addListener");
          const removeListener = createPluginMethodWrapper("removeListener");
          const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback).then((callbackId) => callbackId);
            const remove = async () => {
              const callbackId = await call;
              await removeListener({
                eventName,
                callbackId
              });
            };
            const p = new Promise((resolve) => call.then(() => resolve({ remove })));
            p.remove = async () => {
              console.warn(`Using addListener() without 'await' is deprecated.`);
              await remove();
            };
            return p;
          };
          const proxy = new Proxy({}, {
            get(_, prop) {
              switch (prop) {
                // https://github.com/facebook/react/issues/20030
                case "$$typeof":
                  return void 0;
                case "toJSON":
                  return () => ({});
                case "addListener":
                  return pluginHeader ? addListenerNative : addListener;
                case "removeListener":
                  return removeListener;
                default:
                  return createPluginMethodWrapper(prop);
              }
            }
          });
          Plugins[pluginName] = proxy;
          registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: /* @__PURE__ */ new Set([...Object.keys(jsImplementations), ...pluginHeader ? [platform] : []])
          });
          return proxy;
        };
        if (!cap.convertFileSrc) {
          cap.convertFileSrc = (filePath) => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.registerPlugin = registerPlugin2;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        return cap;
      };
      initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
      Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      registerPlugin = Capacitor.registerPlugin;
      WebPlugin = class {
        constructor() {
          this.listeners = {};
          this.retainedEventArguments = {};
          this.windowListeners = {};
        }
        addListener(eventName, listenerFunc) {
          let firstListener = false;
          const listeners = this.listeners[eventName];
          if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
          }
          this.listeners[eventName].push(listenerFunc);
          const windowListener = this.windowListeners[eventName];
          if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
          }
          if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
          }
          const remove = async () => this.removeListener(eventName, listenerFunc);
          const p = Promise.resolve({ remove });
          return p;
        }
        async removeAllListeners() {
          this.listeners = {};
          for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
          }
          this.windowListeners = {};
        }
        notifyListeners(eventName, data, retainUntilConsumed) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            if (retainUntilConsumed) {
              let args = this.retainedEventArguments[eventName];
              if (!args) {
                args = [];
              }
              args.push(data);
              this.retainedEventArguments[eventName] = args;
            }
            return;
          }
          listeners.forEach((listener) => listener(data));
        }
        hasListeners(eventName) {
          var _a;
          return !!((_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.length);
        }
        registerWindowListener(windowEventName, pluginEventName) {
          this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: (event) => {
              this.notifyListeners(pluginEventName, event);
            }
          };
        }
        unimplemented(msg = "not implemented") {
          return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = "not available") {
          return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            return;
          }
          const index = listeners.indexOf(listenerFunc);
          if (index !== -1) {
            this.listeners[eventName].splice(index, 1);
          }
          if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
          }
        }
        addWindowListener(handle) {
          window.addEventListener(handle.windowEventName, handle.handler);
          handle.registered = true;
        }
        removeWindowListener(handle) {
          if (!handle) {
            return;
          }
          window.removeEventListener(handle.windowEventName, handle.handler);
          handle.registered = false;
        }
        sendRetainedArgumentsForEvent(eventName) {
          const args = this.retainedEventArguments[eventName];
          if (!args) {
            return;
          }
          delete this.retainedEventArguments[eventName];
          args.forEach((arg) => {
            this.notifyListeners(eventName, arg);
          });
        }
      };
      encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
      CapacitorCookiesPluginWeb = class extends WebPlugin {
        async getCookies() {
          const cookies = document.cookie;
          const cookieMap = {};
          cookies.split(";").forEach((cookie) => {
            if (cookie.length <= 0)
              return;
            let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
          });
          return cookieMap;
        }
        async setCookie(options) {
          try {
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            const expires = options.expires ? `; expires=${options.expires.replace("expires=", "")}` : "";
            const path = (options.path || "/").replace("path=", "");
            const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
            document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async deleteCookie(options) {
          try {
            document.cookie = `${options.key}=; Max-Age=0`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearCookies() {
          try {
            const cookies = document.cookie.split(";") || [];
            for (const cookie of cookies) {
              document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearAllCookies() {
          try {
            await this.clearCookies();
          } catch (error) {
            return Promise.reject(error);
          }
        }
      };
      CapacitorCookies = registerPlugin("CapacitorCookies", {
        web: () => new CapacitorCookiesPluginWeb()
      });
      readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
      normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
          acc[key] = headers[originalKeys[index]];
          return acc;
        }, {});
        return normalized;
      };
      buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
          return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
          const [key, value] = entry;
          let encodedValue;
          let item;
          if (Array.isArray(value)) {
            item = "";
            value.forEach((str) => {
              encodedValue = shouldEncode ? encodeURIComponent(str) : str;
              item += `${key}=${encodedValue}&`;
            });
            item.slice(0, -1);
          } else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
          }
          return `${accumulator}&${item}`;
        }, "");
        return output.substr(1);
      };
      buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers["content-type"] || "";
        if (typeof options.data === "string") {
          output.body = options.data;
        } else if (type.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
          }
          output.body = params.toString();
        } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
          const form = new FormData();
          if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
              form.append(key, value);
            });
          } else {
            for (const key of Object.keys(options.data)) {
              form.append(key, options.data[key]);
            }
          }
          output.body = form;
          const headers2 = new Headers(output.headers);
          headers2.delete("content-type");
          output.headers = headers2;
        } else if (type.includes("application/json") || typeof options.data === "object") {
          output.body = JSON.stringify(options.data);
        }
        return output;
      };
      CapacitorHttpPluginWeb = class extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
          const requestInit = buildRequestInit(options, options.webFetchExtra);
          const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
          const url = urlParams ? `${options.url}?${urlParams}` : options.url;
          const response = await fetch(url, requestInit);
          const contentType = response.headers.get("content-type") || "";
          let { responseType = "text" } = response.ok ? options : {};
          if (contentType.includes("application/json")) {
            responseType = "json";
          }
          let data;
          let blob;
          switch (responseType) {
            case "arraybuffer":
            case "blob":
              blob = await response.blob();
              data = await readBlobAsBase64(blob);
              break;
            case "json":
              data = await response.json();
              break;
            case "document":
            case "text":
            default:
              data = await response.text();
          }
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            data,
            headers,
            status: response.status,
            url: response.url
          };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
        }
      };
      CapacitorHttp = registerPlugin("CapacitorHttp", {
        web: () => new CapacitorHttpPluginWeb()
      });
      (function(SystemBarsStyle2) {
        SystemBarsStyle2["Dark"] = "DARK";
        SystemBarsStyle2["Light"] = "LIGHT";
        SystemBarsStyle2["Default"] = "DEFAULT";
      })(SystemBarsStyle || (SystemBarsStyle = {}));
      (function(SystemBarType2) {
        SystemBarType2["StatusBar"] = "StatusBar";
        SystemBarType2["NavigationBar"] = "NavigationBar";
      })(SystemBarType || (SystemBarType = {}));
      SystemBarsPluginWeb = class extends WebPlugin {
        async setStyle() {
          this.unavailable("not available for web");
        }
        async setAnimation() {
          this.unavailable("not available for web");
        }
        async show() {
          this.unavailable("not available for web");
        }
        async hide() {
          this.unavailable("not available for web");
        }
      };
      SystemBars = registerPlugin("SystemBars", {
        web: () => new SystemBarsPluginWeb()
      });
    }
  });

  // node_modules/@capacitor-community/text-to-speech/dist/esm/web.js
  var web_exports = {};
  __export(web_exports, {
    TextToSpeechWeb: () => TextToSpeechWeb
  });
  var TextToSpeechWeb;
  var init_web = __esm({
    "node_modules/@capacitor-community/text-to-speech/dist/esm/web.js"() {
      init_dist();
      TextToSpeechWeb = class extends WebPlugin {
        constructor() {
          super();
          this.speechSynthesis = null;
          if ("speechSynthesis" in window) {
            this.speechSynthesis = window.speechSynthesis;
            window.addEventListener("beforeunload", () => {
              this.stop();
            });
          }
        }
        async speak(options) {
          if (!this.speechSynthesis) {
            this.throwUnsupportedError();
          }
          await this.stop();
          const speechSynthesis = this.speechSynthesis;
          const utterance = this.createSpeechSynthesisUtterance(options);
          return new Promise((resolve, reject) => {
            utterance.onend = () => {
              resolve();
            };
            utterance.onerror = (event) => {
              reject(event);
            };
            speechSynthesis.speak(utterance);
          });
        }
        async stop() {
          if (!this.speechSynthesis) {
            this.throwUnsupportedError();
          }
          this.speechSynthesis.cancel();
        }
        async getSupportedLanguages() {
          const voices = this.getSpeechSynthesisVoices();
          const languages = voices.map((voice) => voice.lang);
          const filteredLanguages = languages.filter((v, i, a) => a.indexOf(v) == i);
          return { languages: filteredLanguages };
        }
        async getSupportedVoices() {
          const voices = this.getSpeechSynthesisVoices();
          return { voices };
        }
        async isLanguageSupported(options) {
          const result = await this.getSupportedLanguages();
          const isLanguageSupported = result.languages.includes(options.lang);
          return { supported: isLanguageSupported };
        }
        async openInstall() {
          this.throwUnimplementedError();
        }
        createSpeechSynthesisUtterance(options) {
          const voices = this.getSpeechSynthesisVoices();
          const utterance = new SpeechSynthesisUtterance();
          const { text, lang, rate, pitch, volume, voice } = options;
          if (voice !== void 0) {
            utterance.voice = voices[voice];
          }
          if (volume !== void 0) {
            utterance.volume = volume >= 0 && volume <= 1 ? volume : 1;
          }
          if (rate !== void 0) {
            utterance.rate = rate >= 0.1 && rate <= 10 ? rate : 1;
          }
          if (pitch !== void 0) {
            utterance.pitch = pitch >= 0 && pitch <= 2 ? pitch : 2;
          }
          if (lang) {
            utterance.lang = lang;
          }
          utterance.text = text;
          return utterance;
        }
        getSpeechSynthesisVoices() {
          if (!this.speechSynthesis) {
            this.throwUnsupportedError();
          }
          if (!this.supportedVoices || this.supportedVoices.length < 1) {
            this.supportedVoices = this.speechSynthesis.getVoices();
          }
          return this.supportedVoices;
        }
        throwUnsupportedError() {
          throw this.unavailable("SpeechSynthesis API not available in this browser.");
        }
        throwUnimplementedError() {
          throw this.unimplemented("Not implemented on web.");
        }
      };
    }
  });

  // node_modules/@capacitor-community/keep-awake/dist/esm/web.js
  var web_exports2 = {};
  __export(web_exports2, {
    KeepAwakeWeb: () => KeepAwakeWeb
  });
  var KeepAwakeWeb;
  var init_web2 = __esm({
    "node_modules/@capacitor-community/keep-awake/dist/esm/web.js"() {
      init_dist();
      KeepAwakeWeb = class extends WebPlugin {
        constructor() {
          super(...arguments);
          this.wakeLock = null;
          this._isSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;
          this.handleVisibilityChange = () => {
            if (document.visibilityState === "visible")
              this.keepAwake();
          };
        }
        async keepAwake() {
          if (!this._isSupported) {
            this.throwUnsupportedError();
          }
          if (this.wakeLock) {
            await this.allowSleep();
          }
          this.wakeLock = await navigator.wakeLock.request("screen");
          document.addEventListener("visibilitychange", this.handleVisibilityChange);
          document.addEventListener("fullscreenchange", this.handleVisibilityChange);
        }
        async allowSleep() {
          var _a;
          if (!this._isSupported) {
            this.throwUnsupportedError();
          }
          (_a = this.wakeLock) === null || _a === void 0 ? void 0 : _a.release();
          this.wakeLock = null;
          document.removeEventListener("visibilitychange", this.handleVisibilityChange);
          document.removeEventListener("fullscreenchange", this.handleVisibilityChange);
        }
        async isSupported() {
          const result = {
            isSupported: this._isSupported
          };
          return result;
        }
        async isKeptAwake() {
          if (!this._isSupported) {
            this.throwUnsupportedError();
          }
          const result = {
            isKeptAwake: !!this.wakeLock
          };
          return result;
        }
        throwUnsupportedError() {
          throw this.unavailable("Screen Wake Lock API not available in this browser.");
        }
      };
    }
  });

  // node_modules/@capgo/capacitor-updater/dist/esm/definitions.js
  var AppUpdateAvailability, FlexibleUpdateInstallStatus, AppUpdateResultCode;
  var init_definitions = __esm({
    "node_modules/@capgo/capacitor-updater/dist/esm/definitions.js"() {
      (function(AppUpdateAvailability2) {
        AppUpdateAvailability2[AppUpdateAvailability2["UNKNOWN"] = 0] = "UNKNOWN";
        AppUpdateAvailability2[AppUpdateAvailability2["UPDATE_NOT_AVAILABLE"] = 1] = "UPDATE_NOT_AVAILABLE";
        AppUpdateAvailability2[AppUpdateAvailability2["UPDATE_AVAILABLE"] = 2] = "UPDATE_AVAILABLE";
        AppUpdateAvailability2[AppUpdateAvailability2["UPDATE_IN_PROGRESS"] = 3] = "UPDATE_IN_PROGRESS";
      })(AppUpdateAvailability || (AppUpdateAvailability = {}));
      (function(FlexibleUpdateInstallStatus2) {
        FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["UNKNOWN"] = 0] = "UNKNOWN";
        FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["PENDING"] = 1] = "PENDING";
        FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["DOWNLOADING"] = 2] = "DOWNLOADING";
        FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["INSTALLING"] = 3] = "INSTALLING";
        FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["INSTALLED"] = 4] = "INSTALLED";
        FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["FAILED"] = 5] = "FAILED";
        FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["CANCELED"] = 6] = "CANCELED";
        FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["DOWNLOADED"] = 11] = "DOWNLOADED";
      })(FlexibleUpdateInstallStatus || (FlexibleUpdateInstallStatus = {}));
      (function(AppUpdateResultCode2) {
        AppUpdateResultCode2[AppUpdateResultCode2["OK"] = 0] = "OK";
        AppUpdateResultCode2[AppUpdateResultCode2["CANCELED"] = 1] = "CANCELED";
        AppUpdateResultCode2[AppUpdateResultCode2["FAILED"] = 2] = "FAILED";
        AppUpdateResultCode2[AppUpdateResultCode2["NOT_AVAILABLE"] = 3] = "NOT_AVAILABLE";
        AppUpdateResultCode2[AppUpdateResultCode2["NOT_ALLOWED"] = 4] = "NOT_ALLOWED";
        AppUpdateResultCode2[AppUpdateResultCode2["INFO_MISSING"] = 5] = "INFO_MISSING";
      })(AppUpdateResultCode || (AppUpdateResultCode = {}));
    }
  });

  // node_modules/@capgo/capacitor-updater/dist/esm/web.js
  var web_exports3 = {};
  __export(web_exports3, {
    CapacitorUpdaterWeb: () => CapacitorUpdaterWeb
  });
  var BUNDLE_BUILTIN, CapacitorUpdaterWeb;
  var init_web3 = __esm({
    "node_modules/@capgo/capacitor-updater/dist/esm/web.js"() {
      init_dist();
      init_definitions();
      BUNDLE_BUILTIN = {
        status: "success",
        version: "",
        downloaded: "1970-01-01T00:00:00.000Z",
        id: "builtin",
        checksum: ""
      };
      CapacitorUpdaterWeb = class extends WebPlugin {
        async setStatsUrl(options) {
          console.warn("Cannot setStatsUrl in web", options);
          return;
        }
        async setUpdateUrl(options) {
          console.warn("Cannot setUpdateUrl in web", options);
          return;
        }
        async setChannelUrl(options) {
          console.warn("Cannot setChannelUrl in web", options);
          return;
        }
        async download(options) {
          console.warn("Cannot download version in web", options);
          return BUNDLE_BUILTIN;
        }
        async next(options) {
          console.warn("Cannot set next version in web", options);
          return BUNDLE_BUILTIN;
        }
        async isAutoUpdateEnabled() {
          console.warn("Cannot get isAutoUpdateEnabled in web");
          return { enabled: false };
        }
        async set(options) {
          console.warn("Cannot set active bundle in web", options);
          return;
        }
        async startPreviewSession(options) {
          console.warn("Cannot start preview session in web", options);
          return;
        }
        async listPreviews() {
          console.warn("Cannot list previews in web");
          return { previews: [], currentBundle: BUNDLE_BUILTIN };
        }
        async setPreview(options) {
          console.warn("Cannot set preview in web", options);
          return;
        }
        async resetPreview() {
          console.warn("Cannot reset preview in web");
          return;
        }
        async deletePreview(options) {
          console.warn("Cannot delete preview in web", options);
          return { removed: false, deleted: false };
        }
        async checkPreviewUpdate(options) {
          console.warn("Cannot check preview update in web", options);
          throw this.unimplemented("Preview updates are not available on web platform");
        }
        async updatePreview(options) {
          console.warn("Cannot update preview in web", options);
          throw this.unimplemented("Preview updates are not available on web platform");
        }
        async getDeviceId() {
          console.warn("Cannot get ID in web");
          return { deviceId: "default" };
        }
        async getBuiltinVersion() {
          console.warn("Cannot get version in web");
          return { version: "default" };
        }
        async getPluginVersion() {
          console.warn("Cannot get plugin version in web");
          return { version: "default" };
        }
        async delete(options) {
          console.warn("Cannot delete bundle in web", options);
        }
        async setBundleError(options) {
          console.warn("Cannot setBundleError in web", options);
          return BUNDLE_BUILTIN;
        }
        async list() {
          console.warn("Cannot list bundles in web");
          return { bundles: [] };
        }
        async reset(options) {
          console.warn("Cannot reset version in web", options);
        }
        async current() {
          console.warn("Cannot get current bundle in web");
          return { bundle: BUNDLE_BUILTIN, native: "0.0.0" };
        }
        async reload() {
          console.warn("Cannot reload current bundle in web");
          return;
        }
        async getLatest() {
          console.warn("Cannot getLatest current bundle in web");
          return {
            version: "0.0.0",
            message: "Cannot getLatest current bundle in web"
          };
        }
        async triggerUpdateCheck() {
          console.warn("Cannot triggerUpdateCheck in web");
          return { status: "unavailable", queued: false };
        }
        async getMissingBundleFiles(options) {
          var _a, _b, _c;
          console.warn("Cannot inspect missing bundle files in web", { manifestLength: (_b = (_a = options.manifest) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0 });
          const missing = (_c = options.manifest) !== null && _c !== void 0 ? _c : [];
          return {
            missing,
            total: missing.length,
            missingCount: missing.length,
            reusableCount: 0
          };
        }
        async getBundleDownloadSize(options) {
          var _a, _b, _c, _d, _e;
          console.warn("Cannot estimate bundle download size in web", { manifestLength: (_b = (_a = options.manifest) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0 });
          return {
            totalSize: 0,
            knownFiles: 0,
            unknownFiles: (_d = (_c = options.manifest) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0,
            files: ((_e = options.manifest) !== null && _e !== void 0 ? _e : []).map((entry) => ({
              file_name: entry.file_name,
              file_hash: entry.file_hash,
              download_url: entry.download_url,
              error: "unavailable"
            }))
          };
        }
        async setChannel(options) {
          console.warn("Cannot setChannel in web", options);
          return {
            status: "error",
            error: "Cannot setChannel in web"
          };
        }
        async unsetChannel(options) {
          console.warn("Cannot unsetChannel in web", options);
          return;
        }
        async setCustomId(options) {
          console.warn("Cannot setCustomId in web", options);
          return;
        }
        async getChannel() {
          console.warn("Cannot getChannel in web");
          return {
            status: "error",
            error: "Cannot getChannel in web"
          };
        }
        async listChannels() {
          console.warn("Cannot listChannels in web");
          throw {
            message: "Cannot listChannels in web",
            error: "platform_not_supported"
          };
        }
        async notifyAppReady() {
          return { bundle: BUNDLE_BUILTIN };
        }
        async setMultiDelay(options) {
          console.warn("Cannot setMultiDelay in web", options === null || options === void 0 ? void 0 : options.delayConditions);
          return;
        }
        async cancelDelay() {
          console.warn("Cannot cancelDelay in web");
          return;
        }
        async isAutoUpdateAvailable() {
          console.warn("Cannot isAutoUpdateAvailable in web");
          return { available: false };
        }
        async getCurrentBundle() {
          console.warn("Cannot get current bundle in web");
          return BUNDLE_BUILTIN;
        }
        async getNextBundle() {
          return Promise.resolve(null);
        }
        async getFailedUpdate() {
          console.warn("Cannot getFailedUpdate in web");
          return null;
        }
        async setShakeMenu(_options) {
          throw this.unimplemented("Shake menu not available on web platform");
        }
        async isShakeMenuEnabled() {
          return Promise.resolve({ enabled: false, gesture: "shake" });
        }
        async setShakeChannelSelector(_options) {
          throw this.unimplemented("Shake channel selector not available on web platform");
        }
        async isShakeChannelSelectorEnabled() {
          return Promise.resolve({ enabled: false });
        }
        async getAppId() {
          console.warn("Cannot getAppId in web");
          return { appId: "default" };
        }
        async setAppId(options) {
          console.warn("Cannot setAppId in web", options);
          return;
        }
        // ============================================================================
        // App Store / Play Store Update Methods (Web stubs)
        // ============================================================================
        async getAppUpdateInfo(_options) {
          console.warn("getAppUpdateInfo is not available on web platform");
          return {
            currentVersionName: "0.0.0",
            currentVersionCode: "0",
            updateAvailability: AppUpdateAvailability.UNKNOWN
          };
        }
        async openAppStore(_options) {
          throw this.unimplemented("openAppStore is not available on web platform");
        }
        async performImmediateUpdate() {
          throw this.unimplemented("performImmediateUpdate is only available on Android");
        }
        async startFlexibleUpdate() {
          throw this.unimplemented("startFlexibleUpdate is only available on Android");
        }
        async completeFlexibleUpdate() {
          throw this.unimplemented("completeFlexibleUpdate is only available on Android");
        }
      };
    }
  });

  // node_modules/@capacitor/local-notifications/dist/esm/web.js
  var web_exports4 = {};
  __export(web_exports4, {
    LocalNotificationsWeb: () => LocalNotificationsWeb
  });
  var LocalNotificationsWeb;
  var init_web4 = __esm({
    "node_modules/@capacitor/local-notifications/dist/esm/web.js"() {
      init_dist();
      LocalNotificationsWeb = class extends WebPlugin {
        constructor() {
          super(...arguments);
          this.pending = [];
          this.deliveredNotifications = [];
          this.hasNotificationSupport = () => {
            if (!("Notification" in window) || !Notification.requestPermission) {
              return false;
            }
            if (Notification.permission !== "granted") {
              try {
                new Notification("");
              } catch (e) {
                if (e instanceof Error && e.name === "TypeError") {
                  return false;
                }
              }
            }
            return true;
          };
        }
        async getDeliveredNotifications() {
          const deliveredSchemas = [];
          for (const notification of this.deliveredNotifications) {
            const deliveredSchema = {
              title: notification.title,
              id: parseInt(notification.tag),
              body: notification.body
            };
            deliveredSchemas.push(deliveredSchema);
          }
          return {
            notifications: deliveredSchemas
          };
        }
        async removeDeliveredNotifications(delivered) {
          for (const toRemove of delivered.notifications) {
            const found = this.deliveredNotifications.find((n) => n.tag === String(toRemove.id));
            found === null || found === void 0 ? void 0 : found.close();
            this.deliveredNotifications = this.deliveredNotifications.filter(() => !found);
          }
        }
        async removeDeliveredNotificationsById(options) {
          for (const id of options.ids) {
            const found = this.deliveredNotifications.find((n) => n.tag === String(id));
            found === null || found === void 0 ? void 0 : found.close();
            this.deliveredNotifications = this.deliveredNotifications.filter((n) => n !== found);
          }
        }
        async removeAllDeliveredNotifications() {
          for (const notification of this.deliveredNotifications) {
            notification.close();
          }
          this.deliveredNotifications = [];
        }
        async getByIds(options) {
          const ids = options.ids.map((id) => String(id));
          const scheduled = this.pending.filter((n) => ids.includes(String(n.id)));
          const delivered = this.deliveredNotifications.filter((n) => ids.includes(n.tag)).map((n) => this.deliveredToSchema(n));
          return { notifications: [...scheduled, ...delivered] };
        }
        async getAll(options) {
          const scheduled = [...this.pending];
          const delivered = this.deliveredNotifications.map((n) => this.deliveredToSchema(n));
          if ((options === null || options === void 0 ? void 0 : options.state) === "SCHEDULED") {
            return { notifications: scheduled };
          }
          if ((options === null || options === void 0 ? void 0 : options.state) === "TRIGGERED") {
            return { notifications: delivered };
          }
          return { notifications: [...scheduled, ...delivered] };
        }
        deliveredToSchema(notification) {
          return {
            title: notification.title,
            id: parseInt(notification.tag),
            body: notification.body
          };
        }
        async createChannel() {
          throw this.unimplemented("Not implemented on web.");
        }
        async deleteChannel() {
          throw this.unimplemented("Not implemented on web.");
        }
        async listChannels() {
          throw this.unimplemented("Not implemented on web.");
        }
        async schedule(options) {
          if (!this.hasNotificationSupport()) {
            throw this.unavailable("Notifications not supported in this browser.");
          }
          for (const notification of options.notifications) {
            this.sendNotification(notification);
          }
          return {
            notifications: options.notifications.map((notification) => ({
              id: notification.id
            }))
          };
        }
        async update(options) {
          if (!this.hasNotificationSupport()) {
            throw this.unavailable("Notifications not supported in this browser.");
          }
          const updated = [];
          for (const notification of options.notifications) {
            const index = this.pending.findIndex((n) => n.id === notification.id);
            if (index === -1) {
              continue;
            }
            this.pending.splice(index, 1);
            this.sendNotification(notification);
            updated.push(notification);
          }
          return {
            notifications: updated.map((notification) => ({ id: notification.id }))
          };
        }
        async getPending() {
          return {
            notifications: this.pending
          };
        }
        async cancelAll() {
          this.pending = [];
        }
        async registerActionTypes() {
          throw this.unimplemented("Not implemented on web.");
        }
        async cancel(pending) {
          this.pending = this.pending.filter((notification) => !pending.notifications.find((n) => n.id === notification.id));
        }
        async areEnabled() {
          const { display } = await this.checkPermissions();
          return {
            value: display === "granted"
          };
        }
        async changeExactNotificationSetting() {
          throw this.unimplemented("Not implemented on web.");
        }
        async checkExactNotificationSetting() {
          throw this.unimplemented("Not implemented on web.");
        }
        async requestPermissions() {
          if (!this.hasNotificationSupport()) {
            throw this.unavailable("Notifications not supported in this browser.");
          }
          const display = this.transformNotificationPermission(await Notification.requestPermission());
          return { display };
        }
        async checkPermissions() {
          if (!this.hasNotificationSupport()) {
            throw this.unavailable("Notifications not supported in this browser.");
          }
          const display = this.transformNotificationPermission(Notification.permission);
          return { display };
        }
        transformNotificationPermission(permission) {
          switch (permission) {
            case "granted":
              return "granted";
            case "denied":
              return "denied";
            default:
              return "prompt";
          }
        }
        sendPending() {
          var _a;
          const toRemove = [];
          const now = (/* @__PURE__ */ new Date()).getTime();
          for (const notification of this.pending) {
            if (((_a = notification.schedule) === null || _a === void 0 ? void 0 : _a.at) && notification.schedule.at.getTime() <= now) {
              this.buildNotification(notification);
              toRemove.push(notification);
            }
          }
          this.pending = this.pending.filter((notification) => !toRemove.find((n) => n === notification));
        }
        sendNotification(notification) {
          var _a;
          if ((_a = notification.schedule) === null || _a === void 0 ? void 0 : _a.at) {
            const diff = notification.schedule.at.getTime() - (/* @__PURE__ */ new Date()).getTime();
            this.pending.push(notification);
            setTimeout(() => {
              this.sendPending();
            }, diff);
            return;
          }
          this.buildNotification(notification);
        }
        buildNotification(notification) {
          const localNotification = new Notification(notification.title, {
            body: notification.body,
            tag: String(notification.id)
          });
          localNotification.addEventListener("click", this.onClick.bind(this, notification), false);
          localNotification.addEventListener("show", this.onShow.bind(this, notification), false);
          localNotification.addEventListener("close", () => {
            this.deliveredNotifications = this.deliveredNotifications.filter(() => !this);
          }, false);
          this.deliveredNotifications.push(localNotification);
          return localNotification;
        }
        onClick(notification) {
          const data = {
            actionId: "tap",
            notification
          };
          this.notifyListeners("localNotificationActionPerformed", data);
        }
        onShow(notification) {
          this.notifyListeners("localNotificationReceived", notification);
        }
      };
    }
  });

  // src/data.js
  var SESSIONS = {
    A: {
      title: "Calistenia A \u2014 parte superior + core",
      place: "Circuito do condom\xEDnio",
      dur: "40\u201345 min",
      note: "Aquecimento de 5\u20138 min primeiro. Pausas por tipo de exerc\xEDcio (ajust\xE1veis em Defini\xE7\xF5es). Experimente o modo pares.",
      pairs: [[1, 3], [2, 4], [5, 7], [6]],
      items: [
        "Aquecimento: marcha r\xE1pida 3 min, c\xEDrculos de bra\xE7os, rota\xE7\xF5es de anca, 10 agachamentos, 20 s suspenso na barra",
        "Remada australiana na barra baixa \u2014 3 \xD7 8\u201312",
        "Eleva\xE7\xF5es na barra \u2014 3 \xD7 m\xE1ximo (ou 3\u20135 negativas lentas)",
        "Flex\xF5es \u2014 3 \xD7 8\u201315 (m\xE3os no banco se for dif\xEDcil)",
        "Fundos no banco \u2014 3 \xD7 8\u201312",
        "Press de ombro com haltere 3 kg \u2014 3 \xD7 12 cada bra\xE7o",
        "Eleva\xE7\xE3o de joelhos suspenso na barra \u2014 3 \xD7 8\u201312",
        "Prancha frontal \u2014 3 \xD7 30\u201345 s"
      ]
    },
    B: {
      title: "Calistenia B \u2014 pernas + core",
      place: "Circuito do condom\xEDnio",
      dur: "45\u201350 min",
      note: "Pausas por tipo de exerc\xEDcio (ajust\xE1veis em Defini\xE7\xF5es). Experimente o modo pares.",
      pairs: [[1, 6], [2, 7], [3, 5], [4]],
      items: [
        "Aquecimento: marcha r\xE1pida 3 min, rota\xE7\xF5es de anca e tornozelos, 10 agachamentos",
        "Agachamento goblet com haltere 3 kg \u2014 3 \xD7 15",
        "Afundos alternados \u2014 3 \xD7 10 cada perna",
        "Subidas ao banco (step-up) \u2014 3 \xD7 10 cada perna",
        "Saltos laterais sobre a trave \u2014 3 \xD7 20\u201330 s",
        "Ponte de gl\xFAteos \u2014 3 \xD7 15 (2 s em cima)",
        "Abdominais no banco inclinado \u2014 3 \xD7 10\u201315",
        "Dead bug \u2014 3 \xD7 8 cada lado"
      ]
    },
    C: {
      title: "Calistenia C \u2014 circuito corpo inteiro",
      place: "Circuito do condom\xEDnio",
      dur: "35\u201340 min",
      note: "40 s de trabalho / 20 s de pausa. 3 voltas (4 a partir da 3.\xAA semana), 1\u20132 min entre voltas.",
      guided: { type: "circuit", work: 40, rest: 20, roundRest: 90, rounds: [3, 4], ex: ["Agachamento com salto", "Remada australiana", "Saltos frontais sobre a trave", "Flex\xF5es", "Mountain climbers", "Eleva\xE7\xE3o de pernas no banco", "Prancha lateral"] },
      items: [
        "Aquecimento 5 min",
        "Agachamento com salto (ou burpees)",
        "Remada australiana",
        "Saltos frontais sobre a trave",
        "Flex\xF5es",
        "Mountain climbers",
        "Eleva\xE7\xE3o de pernas no banco",
        "Prancha lateral \u2014 20 s cada lado",
        "Volta 2 conclu\xEDda",
        "Volta 3 conclu\xEDda"
      ]
    },
    CORE: {
      title: "Core em casa \u2014 roda + haltere",
      place: "Casa",
      dur: "15 min",
      note: "Na roda, ir s\xF3 at\xE9 onde consegue manter a lombar direita.",
      pairs: [[0, 1], [2, 3], [4]],
      items: [
        "Roda de abdominais, de joelhos \u2014 3 \xD7 6\u201310",
        "Russian twist com haltere 3 kg \u2014 3 \xD7 20",
        "Hollow hold \u2014 3 \xD7 20\u201330 s",
        "Prancha lateral \u2014 3 \xD7 20\u201330 s cada lado",
        "Vacuum abdominal \u2014 3 \xD7 20 s",
        "Alongamentos 3 min"
      ]
    },
    WALK: {
      title: "Caminhada r\xE1pida",
      place: "Rua / condom\xEDnio",
      dur: "25\u201330 min",
      note: "Passo acelerado, bra\xE7os a acompanhar. Se houver subidas, melhor. De madrugada leve um agasalho.",
      items: ["Copo de \xE1gua ao acordar", "Caminhada 25\u201330 min", "Alongamentos 3 min"]
    },
    JOG: {
      title: "Caminhada + jogging leve",
      place: "Rua / condom\xEDnio",
      dur: "25 min",
      note: "Alternar 2 min a andar com 1 min a correr devagar. Jogging = corrida lenta em que ainda consegue dizer frases curtas (esfor\xE7o 5\u20136 em 10). Se n\xE3o consegue falar, abrande. No Lubango a altitude cansa mais: ritmo confort\xE1vel.",
      guided: { type: "intervals", warm: 300, reps: 6, work: 60, rest: 120 },
      items: ["Copo de \xE1gua ao acordar", "5 min a andar", "6 \xD7 (1 min jogging + 2 min a andar)", "Alongamentos 3 min"]
    },
    BIKE: {
      title: "Bicicleta \u2014 ritmo moderado",
      place: "Rua / trilho",
      dur: "30 min",
      note: "Ritmo em que consegue falar frases curtas. Luzes e colete refletor de madrugada.",
      items: ["Copo de \xE1gua ao acordar", "Pedalada 30 min", "Alongamentos 3 min"]
    },
    BIKELONG: {
      title: "Volta longa de bicicleta",
      place: "Trilho",
      dur: "1h30\u20132h",
      note: "Ritmo confort\xE1vel, subidas \xE0 vontade. Levar 1 L de \xE1gua e um snack (banana).",
      items: ["Garrafa de \xE1gua + snack", "Volta 1h30\u20132h", "Alongamentos 5 min"]
    },
    WALKLONG: {
      title: "Caminhada longa e leve",
      place: "Rua / natureza",
      dur: "45\u201360 min",
      note: "Ritmo tranquilo. Pode ser em fam\xEDlia.",
      items: ["Caminhada 45\u201360 min", "Mobilidade 5 min"]
    },
    WALKPM: {
      title: "Caminhada r\xE1pida (noite)",
      place: "Condom\xEDnio",
      dur: "40 min",
      note: "Passo acelerado. Boa altura para ouvir um podcast.",
      items: ["Caminhada 40 min", "Alongamentos 3 min"]
    },
    CASA: {
      title: "Corpo inteiro em casa (sem material)",
      place: "Casa / parque",
      dur: "35\u201340 min",
      note: "Sem equipamento. 3 s\xE9ries de cada exerc\xEDcio; ideal em modo pares. Uma cadeira firme chega.",
      pairs: [[2, 1], [4, 3], [5, 6], [7]],
      items: [
        "Aquecimento: marcha no lugar 3 min, c\xEDrculos de bra\xE7os, 10 agachamentos",
        "Agachamento \u2014 3 \xD7 15\u201320",
        "Flex\xF5es \u2014 3 \xD7 8\u201315 (m\xE3os numa mesa se for dif\xEDcil)",
        "Afundos alternados \u2014 3 \xD7 10 cada perna",
        "Fundos numa cadeira \u2014 3 \xD7 8\u201312",
        "Ponte de gl\xFAteos \u2014 3 \xD7 15",
        "Prancha frontal \u2014 3 \xD7 30\u201345 s",
        "Dead bug \u2014 3 \xD7 8 cada lado"
      ]
    },
    COREPT: {
      title: "Core em casa (sem material)",
      place: "Casa",
      dur: "15 min",
      note: "Lombar sempre controlada.",
      pairs: [[0, 1], [2, 3], [4]],
      items: [
        "Hollow hold \u2014 3 \xD7 20\u201330 s",
        "Dead bug \u2014 3 \xD7 8 cada lado",
        "Prancha lateral \u2014 3 \xD7 20\u201330 s cada lado",
        "Mountain climbers \u2014 3 \xD7 30 s",
        "Vacuum abdominal \u2014 3 \xD7 20 s"
      ]
    },
    BTT: {
      title: "Volta de BTT",
      place: "Trilho",
      dur: "1h30\u20132h",
      note: "Frio de dezembro: camadas, luvas e corta-vento. Levar \xE1gua e uma banana. Regressar antes de escurecer (\u224817h).",
      items: ["\xC1gua + snack + luzes", "Volta 1h30\u20132h", "Alongamentos 5 min"]
    },
    BTTCURTA: {
      title: "BTT curta / estrada",
      place: "Rua / trilho",
      dur: "1h",
      note: "Ritmo moderado, em que consegue falar.",
      items: ["\xC1gua", "Pedalada 1h", "Alongamentos 3 min"]
    },
    PASSEIO: {
      title: "Caminhada / passeio",
      place: "Rua / natureza",
      dur: "45\u201360 min",
      note: "Passo r\xE1pido. Pode ser em fam\xEDlia, na praia ou na serra.",
      items: ["Caminhada 45\u201360 min", "Alongamentos 3 min"]
    },
    REST: {
      title: "Descanso + mobilidade",
      place: "Casa",
      dur: "10 min",
      note: "Dormir bem tamb\xE9m \xE9 treino.",
      items: ["Mobilidade / alongamentos 10 min"]
    }
  };
  var DAY_NAMES = ["Domingo", "Segunda", "Ter\xE7a", "Quarta", "Quinta", "Sexta", "S\xE1bado"];
  var DEFAULT_WEEK = {
    1: { am: { s: "WALK", t: "05:20" }, pm: { s: "A", t: "18:45" } },
    2: { am: { s: "BIKE", t: "05:20" }, pm: { s: "CORE", t: "19:00" } },
    3: { am: { s: "JOG", t: "05:20" }, pm: { s: "B", t: "18:45" } },
    4: { am: { s: "BIKE", t: "05:20" }, pm: { s: "WALKPM", t: "18:45" } },
    5: { am: { s: "WALK", t: "05:20" }, pm: { s: "C", t: "18:45" } },
    6: { am: { s: "WALK", t: "05:20" }, pm: { s: "BIKELONG", t: "15:30" } },
    0: { am: { s: "WALKLONG", t: "07:00" }, pm: { s: "CORE", t: "18:45" } }
  };
  var DEFAULT_WEEK_FERIAS = {
    1: { am: { s: "BTTCURTA", t: "11:30" }, pm: { s: "CASA", t: "17:30" } },
    2: { am: { s: "PASSEIO", t: "11:30" }, pm: { s: "REST", t: "17:30" } },
    3: { am: { s: "BTT", t: "11:00" }, pm: { s: "COREPT", t: "17:30" } },
    4: { am: { s: "REST", t: "11:30" }, pm: { s: "REST", t: "17:30" } },
    5: { am: { s: "PASSEIO", t: "11:30" }, pm: { s: "CASA", t: "17:30" } },
    6: { am: { s: "BTT", t: "11:00" }, pm: { s: "REST", t: "17:30" } },
    0: { am: { s: "REST", t: "11:30" }, pm: { s: "REST", t: "17:30" } }
  };
  var TEAS = [
    {
      name: "\xC1gua com lim\xE3o e gengibre",
      when: "Ao acordar, morna",
      good: "Ajuda a come\xE7ar o dia hidratado e d\xE1 sabor \xE0 \xE1gua sem a\xE7\xFAcar.",
      how: "1 copo de \xE1gua morna, sumo de \xBD lim\xE3o, 2\u20133 rodelas de gengibre fresco."
    },
    {
      name: "Gengibre",
      when: "Depois das refei\xE7\xF5es",
      good: "Ajuda na digest\xE3o, nas n\xE1useas e na sensa\xE7\xE3o de incha\xE7o.",
      how: "3\u20134 rodelas de raiz fresca em \xE1gua a ferver, 5\u201310 min. Pode juntar lim\xE3o."
    },
    {
      name: "Hortel\xE3",
      when: "Depois das refei\xE7\xF5es",
      good: "Alivia gases e incha\xE7o. Evite se tiver refluxo ou azia.",
      how: "Um punhado de folhas frescas em \xE1gua quente, 5 min."
    },
    {
      name: "Erva-pr\xEDncipe (capim-lim\xE3o)",
      when: "\xC0 noite",
      good: "F\xE1cil de encontrar em Angola. Calmante e digestiva, sem cafe\xEDna.",
      how: "3\u20134 folhas lavadas e cortadas, ferver 5 min. Tamb\xE9m \xE9 \xF3tima gelada."
    },
    {
      name: "Camomila",
      when: "Antes de dormir",
      good: "Relaxa e ajuda a adormecer. Tamb\xE9m acalma o est\xF4mago.",
      how: "1 saqueta ou 1 c. sopa de flores secas, 5 min tapado."
    },
    {
      name: "Funcho / erva-doce",
      when: "Depois do jantar",
      good: "Das melhores para gases e barriga inchada.",
      how: "1 c. ch\xE1 de sementes ligeiramente esmagadas, 10 min tapado."
    },
    {
      name: "Ch\xE1 verde",
      when: "Manh\xE3 ou in\xEDcio da tarde",
      good: "Antioxidantes e um pouco de cafe\xEDna. Ajuda pouco a queimar gordura; vale mais como troca de bebidas a\xE7ucaradas.",
      how: "\xC1gua quente, n\xE3o a ferver, 2\u20133 min. At\xE9 3 ch\xE1venas por dia, nunca \xE0 noite."
    },
    {
      name: "Hibisco (gelado)",
      when: "\xC0 tarde, como refresco",
      good: "Refrescante e sem calorias. Pode baixar a tens\xE3o: cuidado se tomar medica\xE7\xE3o para a tens\xE3o.",
      how: "1 c. sopa de flores secas por 500 ml, 10 min, deixar arrefecer, gelo e lim\xE3o."
    },
    {
      name: "Canela com cravinho",
      when: "Quando apetecer doce",
      good: "Sabor adocicado sem a\xE7\xFAcar. Ajuda a matar a vontade de doces.",
      how: "1 pau de canela + 2 cravinhos, ferver 5 min."
    },
    {
      name: "Moringa",
      when: "Manh\xE3",
      good: "Folhas ricas em vitaminas e minerais. Sabor a erva.",
      how: "1 c. ch\xE1 de folha seca ou um punhado de folha fresca, 5 min. Junte lim\xE3o."
    },
    {
      name: "\xC1gua aromatizada fresca",
      when: "Fim do trabalho, em vez da 1.\xAA cerveja",
      good: 'Hidrata, enche o est\xF4mago e quebra o h\xE1bito "chego e abro uma cerveja".',
      how: "1 L de \xE1gua fria, rodelas de pepino e lim\xE3o, folhas de hortel\xE3. Deixar no frigor\xEDfico de manh\xE3."
    }
  ];
  var SNACKS = [
    { name: "Fruta + uma m\xE3o pequena de amendoim", prep: "separar ~20 g de amendoim num saquinho e escolher uma pe\xE7a de fruta" },
    { name: "2 ovos cozidos + 1 pe\xE7a de fruta", prep: "cozer ovos (10 min) \u2014 pode cozer 6 para a semana" },
    { name: "1 pacotinho de crackers + 1 ovo cozido", prep: "cozer um ovo e p\xF4r um pacotinho de crackers na mochila (s\xF3 um!)" },
    { name: "Atum ao natural + palitos de pepino e cenoura", prep: "cortar os palitos para uma caixinha e levar uma lata pequena de atum" },
    { name: "Banana + 1 c. sopa de manteiga de amendoim", prep: "p\xF4r a manteiga de amendoim num frasquinho" },
    { name: "Papaia ou manga cortada + amendoim", prep: "cortar a fruta para uma caixinha" },
    { name: "Tostas de centeio + queijo flamengo", prep: "preparar 2\u20133 tostas com queijo numa caixinha" }
  ];
  var DETOX_NOTE = 'Sobre "detox": quem desintoxica o corpo s\xE3o o f\xEDgado e os rins. Estes ch\xE1s n\xE3o queimam gordura sozinhos. Ajudam porque hidratam, aliviam o incha\xE7o e substituem cerveja, refrigerantes e sumos a\xE7ucarados \u2014 e isso faz muita diferen\xE7a.';
  var ing = (q, i, c) => ({ q, i, c });
  var RECIPES = [
    // --- Pequeno-almoço ---
    {
      id: "papas",
      name: "Papas de aveia com banana",
      meal: "Pequeno-almo\xE7o",
      time: "10 min",
      serves: 1,
      ing: [ing("40 g", "Aveia", "mercearia"), ing("200 ml", "Leite meio-gordo", "lacticinios"), ing("1", "Banana", "frescos"), ing("1 c. sopa", "Amendoim torrado sem sal", "mercearia"), ing("q.b.", "Canela", "mercearia")],
      steps: ["Cozer a aveia no leite 4\u20135 min, mexendo.", "Servir com a banana \xE0s rodelas, o amendoim picado e canela."],
      tip: "Sem a\xE7\xFAcar: a banana j\xE1 ado\xE7a."
    },
    {
      id: "panquecas",
      name: "Panquecas de aveia e banana",
      meal: "Pequeno-almo\xE7o",
      time: "15 min",
      serves: 1,
      ing: [ing("2", "Ovos", "lacticinios"), ing("1", "Banana", "frescos"), ing("40 g", "Aveia", "mercearia"), ing("q.b.", "Canela", "mercearia"), ing("1 pe\xE7a", "Papaia ou manga", "frescos")],
      steps: ["Triturar ovos, banana, aveia e canela (ou esmagar com um garfo).", "Fazer 4\u20135 panquecas numa frigideira antiaderente, sem \xF3leo.", "Servir com fruta \xE0s fatias."],
      tip: "Sabe a doce e tem muita prote\xEDna."
    },
    {
      id: "ovos-mexidos",
      name: "Ovos mexidos com tomate e p\xE3o escuro",
      meal: "Pequeno-almo\xE7o",
      time: "10 min",
      serves: 1,
      ing: [ing("3", "Ovos", "lacticinios"), ing("1", "Tomate", "frescos"), ing("\xBD", "Cebola", "frescos"), ing("1 fatia", "P\xE3o de forma integral", "mercearia")],
      steps: ["Saltear a cebola e o tomate picados 3 min.", "Juntar os ovos batidos com sal e mexer em lume brando.", "Servir com a fatia de p\xE3o torrada."],
      tip: "Uma fatia de p\xE3o, n\xE3o tr\xEAs."
    },
    // --- Marisco ---
    {
      id: "camarao",
      name: "Camar\xE3o salteado com alho e legumes",
      meal: "Almo\xE7o / jantar",
      time: "20 min",
      serves: 2,
      ing: [ing("400 g", "Camar\xE3o", "peixe"), ing("4 dentes", "Alho", "frescos"), ing("1", "Pimento", "frescos"), ing("1", "Cebola", "frescos"), ing("1", "Courgette ou cenoura", "frescos"), ing("q.b.", "Coentros", "frescos"), ing("q.b.", "Jindungo", "frescos"), ing("1", "Lim\xE3o", "frescos"), ing("1 c. sopa", "Azeite", "mercearia")],
      steps: ["Saltear alho e jindungo no azeite 1 min.", "Juntar os legumes \xE0s tiras e saltear 4\u20135 min (ficam estaladi\xE7os).", "Juntar o camar\xE3o descascado, 3\u20134 min at\xE9 ficar rosado.", "Temperar com lim\xE3o, sal e coentros."],
      tip: "Com salada ou meia ch\xE1vena de arroz. O camar\xE3o tem muita prote\xEDna e poucas calorias."
    },
    {
      id: "ameijoas",
      name: "Am\xEAijoas \xE0 Bulh\xE3o Pato",
      meal: "Jantar / petisco",
      time: "20 min",
      serves: 2,
      ing: [ing("1 kg", "Am\xEAijoas", "peixe"), ing("5 dentes", "Alho", "frescos"), ing("1 molho", "Coentros", "frescos"), ing("1", "Lim\xE3o", "frescos"), ing("2 c. sopa", "Azeite", "mercearia")],
      steps: ["Deixar as am\xEAijoas 1\u20132 h em \xE1gua com sal para largarem a areia.", "Alourar o alho laminado no azeite.", "Juntar as am\xEAijoas, tapar e abanar o tacho at\xE9 abrirem (5 min).", "Juntar coentros picados e lim\xE3o. Deitar fora as que n\xE3o abrirem."],
      tip: "\xD3timo petisco para a noite em vez de amendoins e batatas fritas."
    },
    {
      id: "mexilhao",
      name: "Mexilh\xE3o com tomate e cebolada",
      meal: "Jantar",
      time: "25 min",
      serves: 2,
      ing: [ing("1 kg", "Mexilh\xE3o", "peixe"), ing("2", "Cebola", "frescos"), ing("3", "Tomate", "frescos"), ing("3 dentes", "Alho", "frescos"), ing("1", "Pimento", "frescos"), ing("q.b.", "Salsa ou coentros", "frescos"), ing("1 c. sopa", "Azeite", "mercearia")],
      steps: ["Lavar e raspar os mexilh\xF5es.", "Fazer um refogado de cebola, alho, pimento e tomate.", "Juntar os mexilh\xF5es, tapar e cozinhar 6\u20138 min at\xE9 abrirem.", "Polvilhar com salsa."],
      tip: "Molhe pouco p\xE3o no molho \u2014 \xE9 a\xED que se escondem as calorias."
    },
    {
      id: "lulas",
      name: "Lulas grelhadas com salada",
      meal: "Almo\xE7o / jantar",
      time: "20 min",
      serves: 2,
      ing: [ing("600 g", "Lulas limpas", "peixe"), ing("3 dentes", "Alho", "frescos"), ing("1", "Lim\xE3o", "frescos"), ing("\xBD p\xE9", "Alface", "frescos"), ing("2", "Tomate", "frescos"), ing("1", "Cebola", "frescos"), ing("1 c. sopa", "Azeite", "mercearia")],
      steps: ["Temperar as lulas com alho, lim\xE3o e sal.", "Grelhar na frigideira bem quente, 2\u20133 min de cada lado (mais tempo ficam duras).", "Servir com salada de alface, tomate e cebola."],
      tip: "Com 1\u20132 batatas-doces cozidas fica uma refei\xE7\xE3o completa."
    },
    {
      id: "polvo",
      name: "Salada de polvo",
      meal: "Almo\xE7o / jantar",
      time: "50 min",
      serves: 3,
      ing: [ing("1 kg", "Polvo", "peixe"), ing("1", "Cebola", "frescos"), ing("1", "Pimento vermelho", "frescos"), ing("1", "Pimento verde", "frescos"), ing("1 molho", "Coentros", "frescos"), ing("2 c. sopa", "Azeite", "mercearia"), ing("2 c. sopa", "Vinagre", "mercearia")],
      steps: ["Cozer o polvo em \xE1gua sem sal, 40\u201345 min (de prefer\xEAncia congelado antes, fica mais tenro).", "Deixar arrefecer e cortar aos peda\xE7os.", "Misturar com cebola, pimentos e coentros picados; temperar com azeite, vinagre e sal."],
      tip: "Melhor no dia seguinte. D\xE1 para 2\u20133 refei\xE7\xF5es."
    },
    {
      id: "choco",
      name: "Choco estufado com tomate",
      meal: "Almo\xE7o / jantar",
      time: "40 min",
      serves: 3,
      ing: [ing("800 g", "Choco limpo", "peixe"), ing("2", "Cebola", "frescos"), ing("4", "Tomate", "frescos"), ing("4 dentes", "Alho", "frescos"), ing("1", "Pimento", "frescos"), ing("1 folha", "Louro", "mercearia"), ing("1 c. sopa", "Azeite", "mercearia")],
      steps: ["Refogar cebola, alho, pimento e louro no azeite.", "Juntar o tomate e o choco \xE0s tiras.", "Tapar e estufar 25\u201330 min em lume brando."],
      tip: "Com arroz ou batata-doce cozida \u2014 meia ch\xE1vena chega."
    },
    // --- Peixe ---
    {
      id: "peixe-grelhado",
      name: "Corvina ou garoupa grelhada com legumes",
      meal: "Almo\xE7o / jantar",
      time: "25 min",
      serves: 1,
      ing: [ing("250 g", "Corvina, garoupa ou pescada (posta ou filete)", "peixe"), ing("1", "Lim\xE3o", "frescos"), ing("2 dentes", "Alho", "frescos"), ing("2", "Cenoura", "frescos"), ing("100 g", "Feij\xE3o-verde", "frescos"), ing("1 m\xE9dia", "Batata-doce", "frescos")],
      steps: ["Temperar o peixe com alho, lim\xE3o e sal 15 min.", "Cozer a batata-doce, a cenoura e o feij\xE3o-verde.", "Grelhar o peixe na frigideira, 4\u20135 min de cada lado.", "Regar tudo com um fio de azeite."],
      tip: "Metade do prato legumes, \xBC peixe, \xBC batata-doce."
    },
    {
      id: "caldeirada",
      name: "Caldeirada leve de peixe",
      meal: "Almo\xE7o / jantar",
      time: "40 min",
      serves: 3,
      ing: [ing("800 g", "Peixe variado (garoupa, corvina, pescada)", "peixe"), ing("2", "Cebola", "frescos"), ing("4", "Tomate", "frescos"), ing("1", "Pimento", "frescos"), ing("2 m\xE9dias", "Batata-doce", "frescos"), ing("4 dentes", "Alho", "frescos"), ing("q.b.", "Coentros", "frescos"), ing("1 c. sopa", "Azeite", "mercearia")],
      steps: ["No tacho, fazer camadas: cebola, tomate, pimento, batata-doce \xE0s rodelas e peixe. Repetir.", "Juntar alho, coentros, sal, o azeite e um copo de \xE1gua.", "Tapar e cozinhar 25 min sem mexer (abanar o tacho)."],
      tip: "Pode juntar tamb\xE9m camar\xE3o ou mexilh\xE3o."
    },
    // --- Carne / ovos ---
    {
      id: "frango-frigideira",
      name: "Frango na frigideira com legumes salteados",
      meal: "Almo\xE7o / jantar",
      time: "25 min",
      serves: 2,
      ing: [ing("400 g", "Peito de frango", "proteina"), ing("2", "Cenoura", "frescos"), ing("1", "Pimento", "frescos"), ing("1", "Cebola", "frescos"), ing("3 dentes", "Alho", "frescos"), ing("1", "Lim\xE3o", "frescos"), ing("q.b.", "Colorau e oreg\xE3os", "mercearia"), ing("1 c. sopa", "Azeite ou \xF3leo", "mercearia")],
      steps: ["Cortar o frango em bifes finos e temperar com alho, lim\xE3o, colorau, oreg\xE3os e sal.", "Grelhar na frigideira 4\u20135 min de cada lado e reservar.", "Na mesma frigideira, saltear os legumes \xE0s tiras 5 min."],
      tip: "Fa\xE7a a dobrar e leve para o almo\xE7o do dia seguinte."
    },
    {
      id: "frango-arroz",
      name: "Arroz de frango com legumes",
      meal: "Almo\xE7o",
      time: "35 min",
      serves: 3,
      ing: [ing("400 g", "Peito de frango", "proteina"), ing("1 ch\xE1vena", "Arroz", "mercearia"), ing("1 saco", "Legumes congelados (ervilha, cenoura, feij\xE3o-verde)", "mercearia"), ing("1", "Cebola", "frescos"), ing("2 dentes", "Alho", "frescos"), ing("2", "Tomate", "frescos")],
      steps: ["Refogar cebola, alho e tomate.", "Juntar o frango aos cubos e alourar.", "Juntar o arroz, os legumes e 2,5 ch\xE1venas de \xE1gua; 15\u201318 min tapado."],
      tip: "Mais legumes do que arroz no prato."
    },
    {
      id: "bolonhesa",
      name: "Esparguete \xE0 bolonhesa leve",
      meal: "Almo\xE7o / jantar",
      time: "30 min",
      serves: 3,
      ing: [ing("400 g", "Carne picada de vaca (magra)", "proteina"), ing("200 g", "Esparguete", "mercearia"), ing("1 lata", "Tomate pelado", "mercearia"), ing("2", "Cenoura", "frescos"), ing("1", "Cebola", "frescos"), ing("2 dentes", "Alho", "frescos"), ing("1", "Pimento", "frescos")],
      steps: ["Refogar cebola e alho com pouco \xF3leo; juntar a carne e deixar alourar.", "Juntar cenoura ralada, pimento picado e o tomate; 15 min em lume brando.", "Cozer a massa e servir com bastante molho e pouca massa."],
      tip: 'A cenoura e o pimento "esticam" o molho: mais volume, menos calorias.'
    },
    {
      id: "omelete",
      name: "Omelete de espinafres e queijo",
      meal: "Jantar r\xE1pido",
      time: "10 min",
      serves: 1,
      ing: [ing("3", "Ovos", "lacticinios"), ing("1 m\xE3o", "Espinafres (ou gimboa)", "frescos"), ing("1 fatia", "Queijo flamengo", "lacticinios"), ing("\xBD", "Cebola", "frescos"), ing("1 c. ch\xE1", "Azeite ou \xF3leo", "mercearia")],
      steps: ["Saltear cebola e espinafres 2\u20133 min.", "Juntar os ovos batidos com sal e o queijo em tiras.", "Cozinhar em lume brando e dobrar."],
      tip: "Pronta em 10 minutos depois do treino da noite."
    },
    {
      id: "grao-atum",
      name: "Salada de gr\xE3o com atum",
      meal: "Almo\xE7o r\xE1pido",
      time: "10 min",
      serves: 1,
      ing: [ing("1 lata", "Atum ao natural", "peixe"), ing("\xBD lata", "Gr\xE3o-de-bico cozido", "mercearia"), ing("\xBD", "Cebola", "frescos"), ing("1", "Tomate", "frescos"), ing("1", "Ovos", "lacticinios"), ing("q.b.", "Coentros", "frescos"), ing("1", "Lim\xE3o", "frescos")],
      steps: ["Cozer o ovo 10 min.", "Misturar atum escorrido, gr\xE3o passado por \xE1gua, cebola e tomate picados.", "Temperar com lim\xE3o, sal e coentros; juntar o ovo \xE0s rodelas."],
      tip: "\xD3tima para levar para o trabalho."
    },
    {
      id: "muamba",
      name: "Muamba de galinha leve",
      meal: "Almo\xE7o de fim de semana",
      time: "60 min",
      serves: 4,
      ing: [ing("800 g", "Frango sem pele", "proteina"), ing("300 g", "Quiabo", "frescos"), ing("400 g", "Ab\xF3bora", "frescos"), ing("2", "Cebola", "frescos"), ing("3", "Tomate", "frescos"), ing("4 dentes", "Alho", "frescos"), ing("q.b.", "Jindungo", "frescos"), ing("2 c. sopa", "\xD3leo de palma (dend\xE9m)", "mercearia")],
      steps: ["Refogar cebola, alho e tomate no \xF3leo de palma.", "Juntar o frango e cozinhar 20 min com um pouco de \xE1gua.", "Juntar a ab\xF3bora e o quiabo e cozinhar mais 20 min."],
      tip: "Menos dend\xE9m do que o habitual e frango sem pele. Com funge: uma concha pequena."
    },
    // --- Sopas ---
    {
      id: "sopa",
      name: "Sopa de ab\xF3bora e legumes (sem batata)",
      meal: "Entrada / jantar leve",
      time: "30 min",
      serves: 5,
      ing: [ing("700 g", "Ab\xF3bora", "frescos"), ing("3", "Cenoura", "frescos"), ing("2", "Cebola", "frescos"), ing("3 dentes", "Alho", "frescos"), ing("1", "Courgette ou chuchu", "frescos"), ing("3 folhas", "Couve", "frescos")],
      steps: ["Cozer tudo (menos a couve) em 1,5 L de \xE1gua com sal, 20 min. A ab\xF3bora espessa a sopa sem precisar de batata.", "Triturar e juntar a couve cortada fina; ferver mais 5 min.", "Um fio de azeite no fim, j\xE1 no prato."],
      tip: "Fa\xE7a uma panela para 4\u20135 dias. Uma tigela antes do jantar ajuda a comer menos do resto."
    },
    {
      id: "sopa-peixe",
      name: "Sopa de peixe com ab\xF3bora",
      meal: "Jantar",
      time: "40 min",
      serves: 4,
      ing: [ing("500 g", "Pescada ou garoupa (com cabe\xE7a para o caldo)", "peixe"), ing("500 g", "Ab\xF3bora", "frescos"), ing("2", "Cenoura", "frescos"), ing("2", "Tomate", "frescos"), ing("1", "Cebola", "frescos"), ing("3 dentes", "Alho", "frescos"), ing("q.b.", "Coentros", "frescos")],
      steps: ["Cozer o peixe em 1,5 L de \xE1gua com sal e cebola, 15 min. Retirar, limpar de peles e espinhas.", "No caldo, cozer ab\xF3bora, cenoura, tomate e alho 20 min e triturar.", "Juntar o peixe desfiado e os coentros."],
      tip: "\xC9 um jantar completo e leve. Pode juntar camar\xE3o nos \xFAltimos 3 min."
    },
    // --- Lanches / petiscos ---
    {
      id: "fruta-amendoim",
      name: "Fruta com amendoim",
      meal: "Lanche",
      time: "2 min",
      serves: 1,
      ing: [ing("1 pe\xE7a", "Fruta da \xE9poca (papaia, manga, ma\xE7\xE3, banana)", "frescos"), ing("1 m\xE3o pequena", "Amendoim torrado sem sal", "mercearia")],
      steps: ["Uma pe\xE7a de fruta e uma m\xE3o pequena (cerca de 20 g) de amendoim."],
      tip: "A gordura e a prote\xEDna do amendoim seguram a fome at\xE9 ao jantar."
    },
    {
      id: "batido",
      name: "Batido de banana e leite",
      meal: "P\xF3s-treino",
      time: "5 min",
      serves: 1,
      ing: [ing("1", "Banana", "frescos"), ing("250 ml", "Leite meio-gordo", "lacticinios"), ing("2 c. sopa", "Aveia", "mercearia"), ing("1 c. sopa", "Manteiga de amendoim", "mercearia")],
      steps: ["Triturar tudo com gelo."],
      tip: "Bom depois da calistenia: prote\xEDna e hidratos para recuperar."
    },
    {
      id: "ovos-cozidos",
      name: "Ovos cozidos + fruta",
      meal: "Lanche antes de sair do trabalho",
      time: "12 min",
      serves: 1,
      ing: [ing("2", "Ovos", "lacticinios"), ing("1 pe\xE7a", "Ma\xE7\xE3 ou banana", "frescos")],
      steps: ["Cozer os ovos 10 min (pode cozer 6 de uma vez para a semana).", "Comer com uma pe\xE7a de fruta."],
      tip: "Chegar a casa com fome \xE9 meio caminho para o petisco."
    },
    {
      id: "petisco-tv",
      name: "Petiscos para a TV",
      meal: "Petisco da noite",
      time: "5 min",
      serves: 1,
      ing: [ing("1", "Pepino", "frescos"), ing("2", "Cenoura", "frescos"), ing("100 g", "Camar\xE3o cozido", "peixe"), ing("1", "Lim\xE3o", "frescos"), ing("q.b.", "Tremo\xE7os", "mercearia")],
      steps: ["Palitos de pepino e cenoura com lim\xE3o e sal.", "Camar\xE3o cozido frio ou uma ta\xE7a de tremo\xE7os."],
      tip: "Trocar batatas fritas e amendoins salgados por isto corta muitas calorias da noite."
    }
  ];
  var CAT_NAMES = {
    frescos: "Frescos (fruta e legumes)",
    peixe: "Peixe e marisco",
    proteina: "Carne",
    lacticinios: "Ovos e lactic\xEDnios",
    mercearia: "Mercearia"
  };
  var ALC_TIPS = [
    "Antes do primeiro copo, um copo grande de \xE1gua. Muitas vezes \xE9 sede.",
    "Vinho: copo de 150 ml, n\xE3o cheio at\xE9 cima. Sirva e guarde a garrafa.",
    "Dias sem \xE1lcool durante a semana (ex.: segunda a quinta) valem mais do que cortar um pouco todos os dias.",
    "Alterne: uma bebida, um copo de \xE1gua.",
    "Uma cerveja de 330 ml \u2248 140 kcal; um copo de vinho de 150 ml \u2248 120 kcal; um destilado com \xE1gua ou soda \u2248 100 kcal.",
    "O \xE1lcool \xE0 noite piora o sono \u2014 e dormir mal aumenta a fome no dia seguinte.",
    "Cuidado com o petisco: com \xE1lcool come-se mais sem dar conta.",
    'Cerveja sem \xE1lcool ou \xE1gua com g\xE1s e lim\xE3o tamb\xE9m "fazem companhia" \xE0 TV.'
  ];

  // src/anims.js
  var STAND = {
    h: [80, 22],
    n: [80, 32],
    p: [80, 62],
    k1: [80, 81],
    f1: [80, 100],
    k2: [80, 81],
    f2: [80, 100],
    e1: [80, 48],
    w1: [80, 63],
    e2: [80, 48],
    w2: [80, 63]
  };
  var J = Object.keys(STAND);
  function P(over = {}, base = STAND, dx = 0, dy = 0) {
    const o = {};
    for (const k of J) o[k] = [base[k][0] + dx, base[k][1] + dy];
    for (const [k, v] of Object.entries(over)) {
      if (k === "arm") {
        o.e1 = v[0];
        o.w1 = v[1];
        o.e2 = v[0];
        o.w2 = v[1];
      } else if (k === "leg") {
        o.k1 = v[0];
        o.f1 = v[1];
        o.k2 = v[0];
        o.f2 = v[1];
      } else o[k] = v;
    }
    return o;
  }
  var shift = (pose, dx, dy) => P({}, pose, dx, dy);
  var PUSH_UP = P({ h: [117, 66], n: [106, 70], p: [74, 85], leg: [[57, 92], [40, 100]], arm: [[107, 85], [108, 100]] });
  var PUSH_DOWN = P({ h: [117, 86], n: [106, 88], p: [73, 94], leg: [[56, 97], [40, 100]], arm: [[94, 86], [108, 100]] });
  var HANG = P({ h: [80, 25], n: [80, 34], p: [80, 64], leg: [[80, 82], [77, 99]], arm: [[73, 22], [72, 10]] });
  var SQUAT_LOW = P({ h: [87, 44], n: [83, 54], p: [62, 76], leg: [[86, 78], [82, 100]], arm: [[92, 64], [90, 56]] });
  var FRONT = P({ k1: [74, 81], f1: [71, 100], k2: [86, 81], f2: [89, 100], e1: [70, 46], w1: [67, 60], e2: [90, 46], w2: [93, 60] });
  var FRONT_AIR = P({ k1: [75, 79], f1: [74, 96], k2: [85, 79], f2: [86, 96], e1: [68, 38], w1: [64, 26], e2: [92, 38], w2: [96, 26] }, STAND, 0, -14);
  var BAR = (y, x1 = 50, x2 = 110) => [{ t: "line", a: [x1, y], b: [x2, y], w: 3 }, { t: "line", a: [x1, y], b: [x1, 100], w: 2, c: "post" }, { t: "line", a: [x2, y], b: [x2, 100], w: 2, c: "post" }];
  var BENCH = (x, y, w, h = 6) => [{ t: "rect", x, y, w, h }, { t: "line", a: [x + 4, y + h], b: [x + 4, 100], w: 2, c: "post" }, { t: "line", a: [x + w - 4, y + h], b: [x + w - 4, 100], w: 2, c: "post" }];
  var TRAVE = (x) => [{ t: "rect", x, y: 95, w: 8, h: 5 }];
  var ANIMS = {
    squat: {
      dur: 2400,
      frames: [P({ arm: [[88, 46], [86, 38]] }), { ...SQUAT_LOW, e1: [92, 60], w1: [90, 52], e2: [92, 60], w2: [90, 52] }],
      props: [{ t: "dumbbell", at: "w1" }],
      tip: "Peito aberto, peso nos calcanhares, joelhos na dire\xE7\xE3o dos p\xE9s."
    },
    jumpsquat: {
      dur: 1500,
      frames: [SQUAT_LOW, P({ arm: [[84, 18], [88, 4]] }, STAND, 0, -12), P({}, STAND), SQUAT_LOW],
      tip: "Aterrar suave, a dobrar os joelhos."
    },
    lunge: {
      dur: 2600,
      frames: [STAND, P({ h: [80, 32], n: [80, 42], p: [80, 72], k1: [98, 76], f1: [99, 100], k2: [70, 94], f2: [52, 99], arm: [[80, 58], [80, 72]] })],
      tip: "Tronco direito; o joelho de tr\xE1s quase toca no ch\xE3o."
    },
    stepup: {
      dur: 2600,
      frames: [
        P({ k1: [82, 70], f1: [90, 82] }, STAND, -12, 0),
        P({ k2: [84, 74], f2: [76, 88] }, STAND, 26, -16)
      ],
      props: BENCH(84, 82, 44, 0),
      tip: "Suba com a for\xE7a da perna da frente, sem dar impulso com a de tr\xE1s."
    },
    pushup: { dur: 2200, frames: [PUSH_UP, PUSH_DOWN], tip: "Corpo em linha reta, cotovelos a 45\xB0." },
    plank: {
      dur: 3e3,
      frames: [
        P({ h: [117, 79], n: [106, 82], p: [73, 88], leg: [[56, 94], [40, 100]], arm: [[106, 100], [124, 100]] }),
        P({ h: [117, 78], n: [106, 81], p: [73, 86], leg: [[56, 93], [40, 100]], arm: [[106, 100], [124, 100]] })
      ],
      tip: "Contrair barriga e gl\xFAteos. N\xE3o deixar a anca cair."
    },
    sideplank: {
      dur: 3e3,
      frames: [
        P({ h: [118, 72], n: [108, 79], p: [74, 86], leg: [[57, 93], [40, 100]], e1: [110, 100], w1: [124, 100], e2: [108, 63], w2: [109, 47] }),
        P({ h: [118, 73], n: [108, 80], p: [74, 91], leg: [[57, 96], [40, 100]], e1: [110, 100], w1: [124, 100], e2: [108, 64], w2: [109, 48] })
      ],
      tip: "Apoio no antebra\xE7o, corpo em linha. Pequenas descidas de anca."
    },
    hollow: {
      dur: 3e3,
      frames: [
        P({ h: [114, 84], n: [106, 89], p: [80, 97], leg: [[61, 92], [41, 86]], arm: [[122, 83], [137, 78]] }),
        P({ h: [114, 85], n: [106, 90], p: [80, 97], leg: [[61, 93], [41, 89]], arm: [[122, 84], [137, 80]] })
      ],
      tip: "Lombar colada ao ch\xE3o; ombros e pernas no ar."
    },
    deadbug: {
      dur: 2600,
      frames: [
        P({ h: [116, 94], n: [106, 96], p: [80, 97], leg: [[78, 78], [62, 78]], e1: [107, 81], w1: [108, 65], e2: [105, 81], w2: [106, 65] }),
        P({ h: [116, 94], n: [106, 96], p: [80, 97], k1: [78, 78], f1: [62, 78], k2: [60, 91], f2: [40, 94], e1: [120, 92], w1: [135, 90], e2: [105, 81], w2: [106, 65] })
      ],
      tip: "Estender bra\xE7o e perna opostos devagar, lombar sempre no ch\xE3o."
    },
    bridge: {
      dur: 2400,
      frames: [
        P({ h: [123, 94], n: [112, 96], p: [88, 97], leg: [[75, 79], [67, 100]], arm: [[100, 98], [90, 99]] }),
        P({ h: [123, 94], n: [112, 95], p: [88, 78], leg: [[73, 75], [67, 100]], arm: [[100, 98], [90, 99]] })
      ],
      tip: "Empurrar pelos calcanhares e apertar os gl\xFAteos em cima."
    },
    pullup: {
      dur: 2800,
      frames: [HANG, P({ h: [80, 7], n: [80, 17], p: [80, 47], leg: [[80, 65], [77, 82]], arm: [[66, 22], [72, 10]] })],
      props: BAR(10),
      noGround: true,
      tip: "Peito \xE0 barra, descer controlado at\xE9 bra\xE7os esticados."
    },
    negative: {
      dur: 4e3,
      frames: [P({ h: [80, 7], n: [80, 17], p: [80, 47], leg: [[80, 65], [77, 82]], arm: [[66, 22], [72, 10]] }), HANG],
      props: BAR(10),
      noGround: true,
      tip: "Comece em cima (com um salto) e des\xE7a o mais devagar poss\xEDvel."
    },
    row: {
      dur: 2400,
      frames: [
        P({ h: [111, 82], n: [100, 84], p: [64, 93], leg: [[47, 97], [30, 100]], arm: [[102, 72], [104, 58]] }),
        P({ h: [108, 62], n: [98, 66], p: [63, 84], leg: [[46, 92], [30, 100]], arm: [[88, 60], [104, 58]] })
      ],
      props: BAR(58, 90, 140),
      tip: "Corpo direito como uma prancha; puxar o peito at\xE9 \xE0 barra."
    },
    dips: {
      dur: 2400,
      frames: [
        P({ h: [87, 40], n: [85, 50], p: [88, 78], leg: [[112, 84], [134, 100]], arm: [[83, 63], [80, 76]] }),
        P({ h: [88, 54], n: [86, 64], p: [88, 92], leg: [[112, 92], [134, 100]], arm: [[70, 66], [80, 76]] })
      ],
      props: BENCH(40, 76, 40),
      tip: "Ombros longe das orelhas; descer at\xE9 90\xB0 nos cotovelos."
    },
    press: {
      dur: 2400,
      frames: [P({ e1: [87, 44], w1: [87, 30], e2: [73, 44], w2: [73, 30] }), P({ e1: [86, 20], w1: [87, 4], e2: [74, 20], w2: [73, 4] })],
      props: [{ t: "dumbbell", at: "w1" }],
      tip: "Barriga contra\xEDda, sem arquear as costas."
    },
    kneeraise: {
      dur: 2400,
      frames: [HANG, P({ k1: [100, 62], f1: [100, 82], k2: [100, 62], f2: [100, 82] }, HANG)],
      props: BAR(10),
      noGround: true,
      tip: "Subir os joelhos sem balan\xE7ar o corpo."
    },
    legraise: {
      dur: 2600,
      frames: [
        P({ h: [120, 78], n: [110, 80], p: [82, 81], leg: [[60, 81], [38, 81]], arm: [[122, 72], [130, 80]] }),
        P({ h: [120, 78], n: [110, 80], p: [82, 81], leg: [[78, 59], [76, 37]], arm: [[122, 72], [130, 80]] })
      ],
      props: BENCH(40, 84, 92),
      tip: "Descer as pernas devagar, sem tocar no banco."
    },
    situp: {
      dur: 2600,
      frames: [
        P({ h: [116, 92], n: [106, 90], p: [80, 82], leg: [[60, 70], [44, 82]], arm: [[96, 84], [100, 80]] }),
        P({ h: [70, 54], n: [72, 64], p: [80, 82], leg: [[60, 70], [44, 82]], arm: [[78, 70], [82, 66]] })
      ],
      props: [{ t: "line", a: [44, 78], b: [130, 98], w: 6, c: "bench" }],
      tip: "Subir enrolando a coluna; descer devagar."
    },
    climbers: {
      dur: 900,
      frames: [
        P({ k1: [94, 90], f1: [86, 99] }, PUSH_UP),
        P({ k2: [94, 90], f2: [86, 99] }, PUSH_UP)
      ],
      tip: "Ombros sobre as m\xE3os, ritmo r\xE1pido."
    },
    lateralhop: {
      dur: 1400,
      frames: [shift(FRONT, -20, 0), shift(FRONT_AIR, 0, 0), shift(FRONT, 20, 0), shift(FRONT_AIR, 0, 0)],
      props: TRAVE(76),
      tip: "P\xE9s juntos, saltos curtos e r\xE1pidos."
    },
    fronthop: {
      dur: 1600,
      frames: [P({}, SQUAT_LOW, -30, 0), P({ arm: [[84, 18], [88, 4]] }, STAND, -4, -16), P({}, SQUAT_LOW, 24, 0), P({ arm: [[84, 18], [88, 4]] }, STAND, -4, -16)],
      props: TRAVE(78),
      tip: "Salto para a frente e para tr\xE1s sobre a trave."
    },
    wheel: {
      dur: 3200,
      frames: [
        P({ h: [94, 56], n: [84, 62], p: [66, 76], leg: [[60, 98], [42, 99]], arm: [[90, 78], [96, 92]] }),
        P({ h: [116, 78], n: [106, 82], p: [78, 87], leg: [[60, 98], [42, 99]], arm: [[122, 88], [134, 92]] })
      ],
      props: [{ t: "wheel", at: "w1" }],
      tip: "S\xF3 at\xE9 onde a lombar fica direita. Voltar com a barriga."
    },
    twist: {
      dur: 1800,
      frames: [
        P({ h: [80, 54], n: [80, 64], p: [80, 92], k1: [72, 80], f1: [66, 92], k2: [88, 80], f2: [94, 92], e1: [70, 72], w1: [62, 80], e2: [74, 76], w2: [64, 81] }),
        P({ h: [80, 54], n: [80, 64], p: [80, 92], k1: [72, 80], f1: [66, 92], k2: [88, 80], f2: [94, 92], e1: [90, 72], w1: [98, 80], e2: [86, 76], w2: [96, 81] })
      ],
      props: [{ t: "dumbbell", at: "w1" }],
      tip: "Rodar o tronco, n\xE3o s\xF3 os bra\xE7os. P\xE9s no ch\xE3o para come\xE7ar."
    },
    walk: {
      dur: 1100,
      frames: [
        P({ k1: [86, 80], f1: [92, 100], k2: [76, 82], f2: [68, 99], e1: [74, 47], w1: [70, 60], e2: [86, 47], w2: [92, 58] }),
        P({ k2: [86, 80], f2: [92, 100], k1: [76, 82], f1: [68, 99], e2: [74, 47], w2: [70, 60], e1: [86, 47], w1: [92, 58] })
      ],
      tip: "Passo largo e r\xE1pido, bra\xE7os a acompanhar."
    }
  };
  var MAP = [
    [/goblet|Agachamento goblet/i, "squat"],
    [/Agachamento com salto|burpee/i, "jumpsquat"],
    [/^Agachamento/i, "squat"],
    [/Afundos/i, "lunge"],
    [/step-up|Subidas ao banco/i, "stepup"],
    [/^Flexões/i, "pushup"],
    [/Prancha lateral/i, "sideplank"],
    [/Prancha/i, "plank"],
    [/Hollow/i, "hollow"],
    [/Dead bug/i, "deadbug"],
    [/Ponte de glúteos/i, "bridge"],
    [/Elevações na barra/i, "pullup"],
    [/Remada australiana/i, "row"],
    [/Fundos/i, "dips"],
    [/Press de ombro/i, "press"],
    [/joelhos suspenso/i, "kneeraise"],
    [/Elevação de pernas/i, "legraise"],
    [/Abdominais no banco/i, "situp"],
    [/Mountain climbers/i, "climbers"],
    [/Saltos laterais/i, "lateralhop"],
    [/Saltos frontais/i, "fronthop"],
    [/Roda de abdominais/i, "wheel"],
    [/Russian twist/i, "twist"],
    [/Caminhada|jogging|a andar/i, "walk"]
  ];
  function animFor(text) {
    for (const [re, id] of MAP) if (re.test(text)) return id;
    return null;
  }
  var ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
  function poseAt(a, t) {
    const n = a.frames.length;
    const pos = t % 1 * n, i = Math.floor(pos), f = ease(pos - i);
    const A = a.frames[i], B = a.frames[(i + 1) % n], o = {};
    for (const k of J) o[k] = [A[k][0] + (B[k][0] - A[k][0]) * f, A[k][1] + (B[k][1] - A[k][1]) * f];
    return o;
  }
  var L = (a, b, cls = "limb") => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" class="${cls}"/>`;
  function drawProps(a, p) {
    return (a.props || []).map((pr) => {
      if (pr.t === "line") return `<line x1="${pr.a[0]}" y1="${pr.a[1]}" x2="${pr.b[0]}" y2="${pr.b[1]}" class="prop ${pr.c || ""}" stroke-width="${pr.w || 3}"/>`;
      if (pr.t === "rect") return `<rect x="${pr.x}" y="${pr.y}" width="${pr.w}" height="${Math.max(pr.h, 3)}" rx="1.5" class="prop-fill"/>`;
      const j = p[pr.at];
      if (pr.t === "dumbbell") return `<rect x="${(j[0] - 7).toFixed(1)}" y="${(j[1] - 2).toFixed(1)}" width="14" height="4" rx="1" class="prop-fill"/><rect x="${(j[0] - 8).toFixed(1)}" y="${(j[1] - 4).toFixed(1)}" width="4" height="8" rx="1" class="prop-fill"/><rect x="${(j[0] + 4).toFixed(1)}" y="${(j[1] - 4).toFixed(1)}" width="4" height="8" rx="1" class="prop-fill"/>`;
      if (pr.t === "wheel") return `<circle cx="${j[0].toFixed(1)}" cy="${(100 - 7).toFixed(1)}" r="7" class="wheel"/>`;
      return "";
    }).join("");
  }
  function drawFrame(id, t) {
    const a = ANIMS[id];
    if (!a) return "";
    const p = poseAt(a, t);
    return `${a.noGround ? "" : '<line x1="6" y1="100.5" x2="154" y2="100.5" class="ground"/>'}${drawProps(a, p)}
    ${L(p.n, p.e2, "limb back")}${L(p.e2, p.w2, "limb back")}${L(p.p, p.k2, "limb back")}${L(p.k2, p.f2, "limb back")}
    ${L(p.n, p.p, "limb torso")}${L(p.p, p.k1)}${L(p.k1, p.f1)}${L(p.n, p.e1)}${L(p.e1, p.w1)}
    <circle cx="${p.h[0].toFixed(1)}" cy="${p.h[1].toFixed(1)}" r="7" class="head"/>`;
  }
  var running = false;
  function startAnimLoop() {
    if (running) return;
    running = true;
    let last = 0;
    const tick2 = (now) => {
      if (now - last > 33) {
        last = now;
        document.querySelectorAll("svg[data-anim]").forEach((svg) => {
          const a = ANIMS[svg.dataset.anim];
          if (!a) return;
          svg.innerHTML = drawFrame(svg.dataset.anim, now / a.dur);
        });
      }
      requestAnimationFrame(tick2);
    };
    requestAnimationFrame(tick2);
  }

  // src/coach.js
  init_dist();

  // node_modules/@capacitor-community/text-to-speech/dist/esm/index.js
  init_dist();

  // node_modules/@capacitor-community/text-to-speech/dist/esm/definitions.js
  var QueueStrategy;
  (function(QueueStrategy2) {
    QueueStrategy2[QueueStrategy2["Flush"] = 0] = "Flush";
    QueueStrategy2[QueueStrategy2["Add"] = 1] = "Add";
  })(QueueStrategy || (QueueStrategy = {}));

  // node_modules/@capacitor-community/text-to-speech/dist/esm/index.js
  var TextToSpeech = registerPlugin("TextToSpeech", {
    web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.TextToSpeechWeb())
  });
  if ("speechSynthesis" in window) {
    window.speechSynthesis;
  }

  // node_modules/@capacitor-community/keep-awake/dist/esm/index.js
  init_dist();
  var KeepAwake = registerPlugin("KeepAwake", {
    web: () => Promise.resolve().then(() => (init_web2(), web_exports2)).then((m) => new m.KeepAwakeWeb())
  });

  // src/coach.js
  var voiceOn = true;
  var setVoice = (v) => {
    voiceOn = v;
  };
  function say(text) {
    if (!voiceOn || !text) return;
    if (Capacitor.isNativePlatform()) {
      TextToSpeech.stop().catch(() => {
      }).finally(() => TextToSpeech.speak({ text, lang: "pt-PT", rate: 1.05, pitch: 1, volume: 1, category: "playback" }).catch(() => {
      }));
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-PT";
      window.speechSynthesis.speak(u);
    }
  }
  var actx = null;
  function beep(freq = 880, ms = 140) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = freq;
      o.connect(g);
      g.connect(actx.destination);
      g.gain.setValueAtTime(0.25, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(1e-3, actx.currentTime + ms / 1e3);
      o.start();
      o.stop(actx.currentTime + ms / 1e3);
    } catch {
    }
    try {
      navigator.vibrate && navigator.vibrate(80);
    } catch {
    }
  }
  var steps = [];
  var idx = 0;
  var endAt = 0;
  var paused = null;
  var timer = null;
  var onFinish = null;
  var spoken = {};
  var bar = document.createElement("div");
  bar.id = "coach";
  document.body.appendChild(bar);
  var fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  function draw() {
    document.body.classList.toggle("coaching", steps.length > 0);
    if (!steps.length) {
      bar.className = "";
      bar.innerHTML = "";
      return;
    }
    const st = steps[idx];
    const rem = st.manual ? Math.floor((Date.now() - endAt) / 1e3) : paused != null ? paused : Math.max(0, Math.ceil((endAt - Date.now()) / 1e3));
    const pct = st.manual ? 0 : st.sec ? Math.min(100, (st.sec - rem) / st.sec * 100) : 0;
    const next = steps[idx + 1];
    bar.className = `on ${st.kind}`;
    bar.innerHTML = `<div class="c-top"><span class="c-kind">${st.kind === "rest" ? "Pausa" : st.kind === "prep" ? "Prepare-se" : st.manual ? "S\xE9rie \u2014 toque em Feito no fim" : "Trabalho"}</span>
    <span class="c-step">${idx + 1}/${steps.length}</span></div>
    <div class="c-label">${st.label}</div>
    <div class="c-time">${fmt(rem)}</div>
    <div class="c-prog"><div style="width:${pct}%"></div></div>
    ${st.reps ? `<div class="c-reps">${st.reps} repeti\xE7\xF5es</div>` : ""}
    ${next ? `<div class="c-next">A seguir: ${next.label}</div>` : ""}
    <div class="c-btns">${st.manual ? '<button data-c="skip" class="done">\u2713 Feito</button>' : `<button data-c="minus">\u221215 s</button><button data-c="pause">${paused != null ? "\u25B6 Retomar" : "\u23F8 Pausa"}</button><button data-c="plus">+15 s</button><button data-c="skip">\u23ED</button>`}<button data-c="stop">\u2715</button></div>`;
  }
  function startStep(i) {
    idx = i;
    spoken = {};
    const st = steps[idx];
    endAt = st.manual ? Date.now() : Date.now() + st.sec * 1e3;
    paused = null;
    if (st.say) say(st.say);
    beep(st.kind === "work" ? 1040 : 660, 220);
    draw();
  }
  function finishStep() {
    const st = steps[idx];
    try {
      st.onEnd && st.onEnd();
    } catch {
    }
    if (idx + 1 < steps.length) startStep(idx + 1);
    else end(true);
  }
  function tick() {
    if (!steps.length || paused != null) return;
    const st = steps[idx];
    if (st.manual) {
      draw();
      return;
    }
    const rem = Math.ceil((endAt - Date.now()) / 1e3);
    const elapsed = st.sec - rem;
    for (const m of st.mid || []) if (elapsed >= m.at && !spoken["m" + m.at]) {
      spoken["m" + m.at] = 1;
      say(m.say);
      beep(760, 160);
    }
    if (st.kind === "rest" && st.sec >= 20 && rem === 10 && !spoken.t10) {
      spoken.t10 = 1;
      say("Dez segundos");
    }
    if (rem <= 3 && rem >= 1 && !spoken["c" + rem]) {
      spoken["c" + rem] = 1;
      beep(880, 120);
    }
    if (rem <= 0) finishStep();
    else draw();
  }
  function end(completed) {
    clearInterval(timer);
    timer = null;
    const cb = onFinish;
    steps = [];
    onFinish = null;
    paused = null;
    draw();
    KeepAwake.allowSleep().catch(() => {
    });
    if (cb) cb(completed);
  }
  function run(newSteps, finished) {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    steps = newSteps.filter((s) => s.manual || s.sec > 0);
    onFinish = finished || null;
    if (!steps.length) {
      if (finished) finished(true);
      return;
    }
    KeepAwake.keepAwake().catch(() => {
    });
    startStep(0);
    timer = setInterval(tick, 250);
  }
  bar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]");
    if (!b || !steps.length) return;
    const c = b.dataset.c;
    if (c === "stop") return end(false);
    if (c === "skip") return finishStep();
    if (c === "pause") {
      if (paused == null) {
        paused = Math.max(0, Math.ceil((endAt - Date.now()) / 1e3));
        say("Pausa");
      } else {
        endAt = Date.now() + paused * 1e3;
        paused = null;
      }
    }
    if (c === "plus" || c === "minus") {
      const d = c === "plus" ? 15 : -15;
      if (paused != null) paused = Math.max(1, paused + d);
      else endAt = Math.max(Date.now() + 1e3, endAt + d * 1e3);
      steps[idx].sec = Math.max(1, steps[idx].sec + d);
    }
    draw();
  });

  // src/updater.js
  init_dist();

  // node_modules/@capgo/capacitor-updater/dist/esm/index.js
  init_dist();

  // node_modules/@capgo/capacitor-updater/dist/esm/history.js
  var KEEP_FLAG_KEY = "__capgo_keep_url_path_after_reload";
  var HISTORY_STORAGE_KEY = "__capgo_history_stack__";
  var MAX_STACK_ENTRIES = 100;
  var isBrowser = typeof window !== "undefined" && typeof document !== "undefined" && typeof history !== "undefined";
  if (isBrowser) {
    const win = window;
    if (!win.__capgoHistoryPatched) {
      win.__capgoHistoryPatched = true;
      const isFeatureConfigured = () => {
        try {
          if (win.__capgoKeepUrlPathAfterReload) {
            return true;
          }
        } catch (_a) {
        }
        try {
          return window.localStorage.getItem(KEEP_FLAG_KEY) === "1";
        } catch (_b) {
          return false;
        }
      };
      const readStored = () => {
        try {
          const raw = window.sessionStorage.getItem(HISTORY_STORAGE_KEY);
          if (!raw) {
            return { stack: [], index: -1 };
          }
          const parsed = JSON.parse(raw);
          if (!parsed || !Array.isArray(parsed.stack) || typeof parsed.index !== "number") {
            return { stack: [], index: -1 };
          }
          return parsed;
        } catch (_a) {
          return { stack: [], index: -1 };
        }
      };
      const writeStored = (stack, index) => {
        try {
          window.sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({ stack, index }));
        } catch (_a) {
        }
      };
      const clearStored = () => {
        try {
          window.sessionStorage.removeItem(HISTORY_STORAGE_KEY);
        } catch (_a) {
        }
      };
      const normalize = (url) => {
        try {
          const base = url !== null && url !== void 0 ? url : window.location.href;
          const parsed = new URL(base instanceof URL ? base.toString() : base, window.location.href);
          return `${parsed.pathname}${parsed.search}${parsed.hash}`;
        } catch (_a) {
          return null;
        }
      };
      const trimStack = (stack, index) => {
        if (stack.length <= MAX_STACK_ENTRIES) {
          return { stack, index };
        }
        const start = stack.length - MAX_STACK_ENTRIES;
        const trimmed = stack.slice(start);
        const adjustedIndex = Math.max(0, index - start);
        return { stack: trimmed, index: adjustedIndex };
      };
      const runWhenReady = (fn) => {
        if (document.readyState === "complete" || document.readyState === "interactive") {
          fn();
        } else {
          window.addEventListener("DOMContentLoaded", fn, { once: true });
        }
      };
      let featureActive = false;
      let isRestoring = false;
      let restoreScheduled = false;
      const ensureCurrentTracked = () => {
        if (!featureActive) {
          return;
        }
        const stored = readStored();
        const current = normalize();
        if (!current) {
          return;
        }
        if (stored.stack.length === 0) {
          stored.stack.push(current);
          stored.index = 0;
          writeStored(stored.stack, stored.index);
          return;
        }
        if (stored.index < 0 || stored.index >= stored.stack.length) {
          stored.index = stored.stack.length - 1;
        }
        if (stored.stack[stored.index] !== current) {
          stored.stack[stored.index] = current;
          writeStored(stored.stack, stored.index);
        }
      };
      const record = (url, replace) => {
        if (!featureActive || isRestoring) {
          return;
        }
        const normalized = normalize(url);
        if (!normalized) {
          return;
        }
        let { stack, index } = readStored();
        if (stack.length === 0) {
          stack.push(normalized);
          index = stack.length - 1;
        } else if (replace) {
          if (index < 0 || index >= stack.length) {
            index = stack.length - 1;
          }
          stack[index] = normalized;
        } else {
          if (index >= stack.length - 1) {
            stack.push(normalized);
            index = stack.length - 1;
          } else {
            stack = stack.slice(0, index + 1);
            stack.push(normalized);
            index = stack.length - 1;
          }
        }
        ({ stack, index } = trimStack(stack, index));
        writeStored(stack, index);
      };
      const restoreHistory = () => {
        if (!featureActive || isRestoring) {
          return;
        }
        const stored = readStored();
        if (stored.stack.length === 0) {
          ensureCurrentTracked();
          return;
        }
        const targetIndex = stored.index >= 0 && stored.index < stored.stack.length ? stored.index : stored.stack.length - 1;
        const normalizedCurrent = normalize();
        if (stored.stack.length === 1 && normalizedCurrent === stored.stack[0]) {
          return;
        }
        const firstEntry = stored.stack[0];
        if (!firstEntry) {
          return;
        }
        isRestoring = true;
        try {
          history.replaceState(history.state, document.title, firstEntry);
          for (let i = 1; i < stored.stack.length; i += 1) {
            history.pushState(history.state, document.title, stored.stack[i]);
          }
        } catch (_a) {
          isRestoring = false;
          return;
        }
        isRestoring = false;
        const currentIndex = stored.stack.length - 1;
        const offset = targetIndex - currentIndex;
        if (offset !== 0) {
          history.go(offset);
        } else {
          history.replaceState(history.state, document.title, stored.stack[targetIndex]);
          window.dispatchEvent(new PopStateEvent("popstate"));
        }
      };
      const scheduleRestore = () => {
        if (!featureActive || restoreScheduled) {
          return;
        }
        restoreScheduled = true;
        runWhenReady(() => {
          restoreScheduled = false;
          restoreHistory();
        });
      };
      let originalPushState = null;
      let originalReplaceState = null;
      const popstateHandler = () => {
        if (!featureActive || isRestoring) {
          return;
        }
        const normalized = normalize();
        if (!normalized) {
          return;
        }
        const stored = readStored();
        const idx2 = stored.stack.lastIndexOf(normalized);
        if (idx2 >= 0) {
          stored.index = idx2;
        } else {
          stored.stack.push(normalized);
          stored.index = stored.stack.length - 1;
        }
        const trimmed = trimStack(stored.stack, stored.index);
        writeStored(trimmed.stack, trimmed.index);
      };
      const patchHistory = () => {
        if (originalPushState && originalReplaceState) {
          return;
        }
        originalPushState = history.pushState;
        originalReplaceState = history.replaceState;
        history.pushState = function pushStatePatched(state2, title, url) {
          const result = originalPushState === null || originalPushState === void 0 ? void 0 : originalPushState.call(history, state2, title, url);
          record(url, false);
          return result;
        };
        history.replaceState = function replaceStatePatched(state2, title, url) {
          const result = originalReplaceState === null || originalReplaceState === void 0 ? void 0 : originalReplaceState.call(history, state2, title, url);
          record(url, true);
          return result;
        };
        window.addEventListener("popstate", popstateHandler);
      };
      const unpatchHistory = () => {
        if (originalPushState) {
          history.pushState = originalPushState;
          originalPushState = null;
        }
        if (originalReplaceState) {
          history.replaceState = originalReplaceState;
          originalReplaceState = null;
        }
        window.removeEventListener("popstate", popstateHandler);
      };
      const setFeatureActive = (enabled) => {
        if (featureActive === enabled) {
          if (featureActive) {
            ensureCurrentTracked();
            scheduleRestore();
          }
          return;
        }
        featureActive = enabled;
        if (featureActive) {
          patchHistory();
          ensureCurrentTracked();
          scheduleRestore();
        } else {
          unpatchHistory();
          clearStored();
        }
      };
      window.addEventListener("CapacitorUpdaterKeepUrlPathAfterReload", (event) => {
        var _a;
        const evt = event;
        const enabled = (_a = evt === null || evt === void 0 ? void 0 : evt.detail) === null || _a === void 0 ? void 0 : _a.enabled;
        if (typeof enabled === "boolean") {
          win.__capgoKeepUrlPathAfterReload = enabled;
          setFeatureActive(enabled);
        } else {
          win.__capgoKeepUrlPathAfterReload = true;
          setFeatureActive(true);
        }
      });
      setFeatureActive(isFeatureConfigured());
    }
  }

  // node_modules/@capgo/capacitor-updater/dist/esm/index.js
  init_definitions();
  var CapacitorUpdater = registerPlugin("CapacitorUpdater", {
    web: () => Promise.resolve().then(() => (init_web3(), web_exports3)).then((m) => new m.CapacitorUpdaterWeb())
  });

  // node_modules/@capacitor/local-notifications/dist/esm/index.js
  init_dist();

  // node_modules/@capacitor/local-notifications/dist/esm/definitions.js
  var Weekday;
  (function(Weekday2) {
    Weekday2[Weekday2["Sunday"] = 1] = "Sunday";
    Weekday2[Weekday2["Monday"] = 2] = "Monday";
    Weekday2[Weekday2["Tuesday"] = 3] = "Tuesday";
    Weekday2[Weekday2["Wednesday"] = 4] = "Wednesday";
    Weekday2[Weekday2["Thursday"] = 5] = "Thursday";
    Weekday2[Weekday2["Friday"] = 6] = "Friday";
    Weekday2[Weekday2["Saturday"] = 7] = "Saturday";
  })(Weekday || (Weekday = {}));

  // node_modules/@capacitor/local-notifications/dist/esm/index.js
  var LocalNotifications = registerPlugin("LocalNotifications", {
    web: () => Promise.resolve().then(() => (init_web4(), web_exports4)).then((m) => new m.LocalNotificationsWeb())
  });

  // src/version.js
  var NATIVE = 8;
  var WEB = true ? 0 : 0;

  // src/updater.js
  var BASE = "https://raw.githubusercontent.com/glamdj/killbelly-updates/main/";
  var status = { native: NATIVE, web: WEB, latest: null, apkUrl: null, pending: null, checking: false, error: null, lastCheck: 0 };
  async function appReady() {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await CapacitorUpdater.notifyAppReady();
    } catch {
    }
  }
  async function checkUpdates({ manual = false } = {}) {
    if (status.checking) return status;
    status.checking = true;
    status.error = null;
    try {
      const r = await fetch(`${BASE}latest.json?t=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const L2 = await r.json();
      status.latest = L2;
      status.lastCheck = Date.now();
      if (L2.native > NATIVE) {
        status.apkUrl = BASE + L2.apk;
        const seen = Number(localStorage.getItem("kb.apkNotified") || 0);
        if (Capacitor.isNativePlatform() && (manual || seen < L2.native)) {
          localStorage.setItem("kb.apkNotified", String(L2.native));
          await LocalNotifications.schedule({ notifications: [{
            id: 9100,
            title: "\u2B06\uFE0F Nova vers\xE3o do KillBelly",
            body: `${L2.notes || "Melhorias"} \u2014 toque para instalar.`,
            channelId: "treino",
            extra: { kind: "apk" },
            schedule: { at: new Date(Date.now() + 1500), allowWhileIdle: true }
          }] }).catch(() => {
          });
        }
      } else if (L2.minNative <= NATIVE && L2.web > WEB && Capacitor.isNativePlatform()) {
        const b = await CapacitorUpdater.download({ url: BASE + L2.zip, version: String(L2.web) });
        await CapacitorUpdater.next({ id: b.id });
        status.pending = { id: b.id, web: L2.web, notes: L2.notes };
      }
    } catch (e) {
      status.error = String(e.message || e);
    }
    status.checking = false;
    return status;
  }
  async function applyNow() {
    if (status.pending) await CapacitorUpdater.set({ id: status.pending.id });
  }
  function openApk() {
    if (status.apkUrl) window.location.href = status.apkUrl;
  }

  // src/notify.js
  init_dist();
  function snacksFor(date) {
    const d0 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 864e5;
    const i = d0 * 2 % SNACKS.length;
    return [SNACKS[i], SNACKS[(i + 1) % SNACKS.length]];
  }
  var isNative = () => Capacitor.isNativePlatform();
  var CHANNELS = [
    { id: "treino", name: "Treinos", description: "Lembretes de treino" },
    { id: "agua", name: "\xC1gua", description: "Lembretes para beber \xE1gua" },
    { id: "peso", name: "Peso e cintura", description: "Registo de peso e cintura" },
    { id: "cerveja", name: "Antes de beber", description: "\xC1gua antes da primeira bebida" },
    { id: "chas", name: "Ch\xE1s e infus\xF5es", description: "Sugest\xF5es de ch\xE1s" }
  ];
  var parseT = (t) => {
    const [h, m] = t.split(":").map(Number);
    return { h, m };
  };
  async function setupNotifications() {
    if (!isNative()) return { ok: false, reason: "web" };
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") perm = await LocalNotifications.requestPermissions();
    for (const c of CHANNELS) {
      await LocalNotifications.createChannel({ ...c, importance: 5, visibility: 1, vibration: true, lights: true });
    }
    await LocalNotifications.registerActionTypes({
      types: [
        { id: "AGUA", actions: [{ id: "drink", title: "Bebi 250 ml" }] },
        { id: "TREINO", actions: [{ id: "done", title: "Feito \u2714" }] }
      ]
    });
    return { ok: perm.display === "granted" };
  }
  async function exactAlarmStatus() {
    if (!isNative()) return "granted";
    try {
      const r = await LocalNotifications.checkExactNotificationSetting();
      return r.exact_alarm;
    } catch {
      return "granted";
    }
  }
  async function openExactAlarmSettings() {
    if (!isNative()) return;
    try {
      await LocalNotifications.changeExactNotificationSetting();
    } catch {
    }
  }
  var pad = (n) => String(n).padStart(2, "0");
  var dkey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function isVacation(state2, date = /* @__PURE__ */ new Date()) {
    const s = state2.settings;
    if (s.feriasModo === "on") return true;
    if (s.feriasModo === "off") return false;
    const k = dkey(date);
    return !!(s.feriasInicio && s.feriasFim && k >= s.feriasInicio && k <= s.feriasFim);
  }
  function profile(state2, date = /* @__PURE__ */ new Date()) {
    const s = state2.settings;
    if (!isVacation(state2, date)) return { vac: false, week: state2.week, s };
    return {
      vac: true,
      week: state2.weekFerias,
      s: {
        ...s,
        pesoHora: s.vPeso,
        aguaInicio: s.vAguaInicio,
        aguaFim: s.vAguaFim,
        metaAgua: s.vMetaAgua,
        cervejaHora: s.vCerveja,
        cervejaSabado: s.vCerveja,
        chaManha: s.vChaManha,
        chaNoite: s.vChaNoite,
        snackManha: "",
        snackTarde: s.vSnackTarde,
        snackPrep: ""
      }
    };
  }
  var DAYS_AHEAD = 14;
  var at = (date, t) => {
    const { h, m } = parseT(t);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
  };
  function buildNotifications(state2, from = /* @__PURE__ */ new Date()) {
    const list = [];
    const now = from.getTime();
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    for (let di = 0; di < DAYS_AHEAD; di++) {
      const day = new Date(start);
      day.setDate(start.getDate() + di);
      const { vac, week, s } = profile(state2, day);
      const wd = day.getDay();
      const base = 1e4 + di * 100;
      const push = (n) => {
        if (n.schedule.at.getTime() > now + 3e4) list.push({ ...n, schedule: { ...n.schedule, allowWhileIdle: true } });
      };
      if (s.notifTreino) {
        for (const slot of ["am", "pm"]) {
          const cfg = week[wd][slot];
          if (!cfg || cfg.s === "REST") continue;
          const ses = SESSIONS[cfg.s];
          const when = at(day, cfg.t);
          when.setMinutes(when.getMinutes() - s.treinoAntes);
          push({
            id: base + (slot === "am" ? 1 : 2),
            title: `${slot === "am" ? parseInt(cfg.t) < 12 ? "\u{1F305}" : "\u2600\uFE0F" : parseInt(cfg.t) < 17 ? "\u2600\uFE0F" : "\u{1F319}"} ${ses.title}`,
            body: `\xC0s ${cfg.t} \xB7 ${ses.dur} \xB7 ${ses.place}`,
            channelId: "treino",
            actionTypeId: "TREINO",
            extra: { kind: "treino", slot },
            schedule: { at: when }
          });
        }
      }
      if (s.notifAgua) {
        const a = parseT(s.aguaInicio), b = parseT(s.aguaFim);
        let i = 0;
        for (let t = a.h * 60 + a.m; t <= b.h * 60 + b.m && i < 30; t += Number(s.aguaIntervalo), i++) {
          push({
            id: base + 40 + i,
            title: "\u{1F4A7} Hora de beber \xE1gua",
            body: `Um copo de ${s.copoMl} ml. Meta de hoje: ${(s.metaAgua / 1e3).toFixed(1).replace(".", ",")} L.`,
            channelId: "agua",
            actionTypeId: "AGUA",
            extra: { kind: "agua" },
            schedule: { at: at(day, `${Math.floor(t / 60)}:${t % 60}`) }
          });
        }
      }
      if (s.notifPeso) {
        push({ id: base + 10, title: "\u2696\uFE0F Pesagem di\xE1ria", body: "Em jejum, depois da casa de banho e antes de beber \xE1gua.", channelId: "peso", extra: { kind: "peso" }, schedule: { at: at(day, s.pesoHora) } });
        if (wd === Number(s.cinturaDia)) {
          const w = at(day, s.pesoHora);
          w.setMinutes(w.getMinutes() + 1);
          push({ id: base + 11, title: "\u{1F4CF} Medir a cintura", body: "Fita m\xE9trica \xE0 altura do umbigo, barriga relaxada, a expirar.", channelId: "peso", extra: { kind: "cintura" }, schedule: { at: w } });
        }
      }
      if (s.notifCerveja && (vac || wd !== 0)) {
        push({ id: base + 20, title: "\u{1F377} Antes de beber\u2026", body: "Primeiro 500 ml de \xE1gua ou infus\xE3o. Depois decide.", channelId: "cerveja", extra: { kind: "cerveja" }, schedule: { at: at(day, wd === 6 ? s.cervejaSabado : s.cervejaHora) } });
      }
      if (s.notifSnack) {
        const [sm, st] = snacksFor(day);
        if (s.snackManha && wd !== 0) push({ id: base + 50, title: "\u{1F34E} Lanche da manh\xE3", body: sm.name, channelId: "chas", extra: { kind: "snack" }, schedule: { at: at(day, s.snackManha) } });
        if (s.snackTarde) push({ id: base + 51, title: "\u{1F34C} Lanche da tarde", body: st.name, channelId: "chas", extra: { kind: "snack" }, schedule: { at: at(day, s.snackTarde) } });
        const tmr = new Date(day);
        tmr.setDate(day.getDate() + 1);
        const pt = profile(state2, tmr);
        if (s.snackPrep && !pt.vac && tmr.getDay() !== 0) {
          const [a1, a2] = snacksFor(tmr);
          push({ id: base + 52, title: "\u{1F961} Preparar os snacks de amanh\xE3", body: `Manh\xE3: ${a1.name}. Tarde: ${a2.name}. Preparar: ${a1.prep}${a2.prep !== a1.prep ? `; ${a2.prep}` : ""}.`, channelId: "chas", extra: { kind: "snack" }, schedule: { at: at(day, s.snackPrep) } });
        }
      }
      if (s.notifChas) {
        push({ id: base + 30, title: "\u{1F375} Ch\xE1", body: vac ? "Ch\xE1 verde, gengibre ou moringa \u2014 sem a\xE7\xFAcar." : "Ch\xE1 verde, gengibre ou moringa \u2014 sem a\xE7\xFAcar.", channelId: "chas", extra: { kind: "cha" }, schedule: { at: at(day, s.chaManha) } });
        push({ id: base + 31, title: "\u{1F33F} Infus\xE3o da noite", body: "Camomila, erva-pr\xEDncipe ou funcho. Ajuda a dormir e a desinchar.", channelId: "chas", extra: { kind: "cha" }, schedule: { at: at(day, s.chaNoite) } });
      }
    }
    const renew = new Date(start);
    renew.setDate(start.getDate() + DAYS_AHEAD - 2);
    renew.setHours(12, 0, 0, 0);
    list.push({ id: 9e3, title: "\u{1F504} KillBelly", body: "Abra a app para renovar os lembretes das pr\xF3ximas semanas.", channelId: "treino", schedule: { at: renew, allowWhileIdle: true } });
    return list;
  }
  async function rescheduleAll(state2) {
    if (!isNative()) return { count: buildNotifications(state2).length, web: true };
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });
    }
    const list = buildNotifications(state2);
    let warning = null;
    if (list.length) {
      const r = await LocalNotifications.schedule({ notifications: list });
      warning = r.warning || null;
    }
    return { count: list.length, warning };
  }
  async function testNotification() {
    if (!isNative()) {
      alert("As notifica\xE7\xF5es s\xF3 funcionam na app instalada no Android.");
      return;
    }
    await LocalNotifications.schedule({
      notifications: [{
        id: 9999,
        title: "\u2705 KillBelly \u2014 teste",
        body: "Se isto apareceu no rel\xF3gio, est\xE1 tudo pronto.",
        channelId: "treino",
        schedule: { at: new Date(Date.now() + 5e3), allowWhileIdle: true }
      }]
    });
  }
  function onAction(handler) {
    if (!isNative()) return;
    LocalNotifications.addListener("localNotificationActionPerformed", handler);
  }

  // src/app.js
  var KEY = "killbelly.v1";
  var DEFAULT_SETTINGS = {
    nome: "Lu\xEDs",
    notifTreino: true,
    treinoAntes: 10,
    notifAgua: true,
    aguaInicio: "06:00",
    aguaFim: "21:00",
    aguaIntervalo: 60,
    copoMl: 250,
    metaAgua: 3e3,
    notifPeso: true,
    pesoHora: "05:05",
    cinturaDia: 1,
    notifCerveja: true,
    cervejaHora: "17:30",
    cervejaSabado: "13:30",
    metaCerveja: 10,
    notifChas: true,
    chaManha: "10:00",
    chaNoite: "21:15",
    metaPeso: "",
    voz: true,
    notifSnack: true,
    snackManha: "10:30",
    snackTarde: "16:00",
    snackPrep: "21:00",
    vSnackTarde: "16:30",
    pausaDificil: 60,
    pausaLeve: 40,
    pausaCore: 25,
    pausaPar: 45,
    pausaTroca: 10,
    feriasModo: "auto",
    feriasInicio: "2026-12-17",
    feriasFim: "2027-01-08",
    vPeso: "10:15",
    vAguaInicio: "10:30",
    vAguaFim: "22:30",
    vMetaAgua: 2500,
    vCerveja: "19:30",
    vChaManha: "16:00",
    vChaNoite: "23:00"
  };
  var clone = (o) => JSON.parse(JSON.stringify(o));
  function migrateBeer(b) {
    const o = {};
    for (const [k, v] of Object.entries(b)) if (v) o[k] = { c: v };
    return o;
  }
  function load() {
    let s = null;
    try {
      s = JSON.parse(localStorage.getItem(KEY));
    } catch {
    }
    s = s || {};
    return {
      week: s.week || clone(DEFAULT_WEEK),
      weekFerias: s.weekFerias || clone(DEFAULT_WEEK_FERIAS),
      settings: { ...DEFAULT_SETTINGS, ...s.settings || {} },
      water: s.water || {},
      weight: s.weight || {},
      waist: s.waist || {},
      alc: s.alc || migrateBeer(s.beer || {}),
      log: s.log || {},
      shop: s.shop || { sel: [], checked: {} }
    };
  }
  var state = load();
  state.shop.sel = state.shop.sel.filter((id) => RECIPES.some((r) => r.id === id));
  function save(resched = false) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
    }
    if (resched) scheduleSoon();
  }
  var schedTimer = null;
  var lastSched = null;
  var lastTz = (/* @__PURE__ */ new Date()).getTimezoneOffset();
  var lastSchedAt = Date.now();
  function scheduleSoon() {
    clearTimeout(schedTimer);
    schedTimer = setTimeout(async () => {
      try {
        lastSched = await rescheduleAll(state);
      } catch (e) {
        lastSched = { error: String(e) };
      }
      if (tab === "def") render();
    }, 600);
  }
  var pad2 = (n) => String(n).padStart(2, "0");
  var dkey2 = (d = /* @__PURE__ */ new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  var fromKey = (k) => {
    const [y, m, d] = k.split("-").map(Number);
    return new Date(y, m - 1, d);
  };
  var addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  var mondayOf = (d = /* @__PURE__ */ new Date()) => {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const wd = (x.getDay() + 6) % 7;
    return addDays(x, -wd);
  };
  var fmtShort = (k) => {
    const d = fromKey(k);
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
  };
  var MONTHS = ["janeiro", "fevereiro", "mar\xE7o", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var num = (v, dec = 1) => Number(v).toFixed(dec).replace(".", ",");
  var waterToday = () => state.water[dkey2()] || 0;
  function addWater(ml) {
    const k = dkey2();
    state.water[k] = Math.max(0, (state.water[k] || 0) + ml);
    save();
  }
  var alcDay = (k) => {
    const a = state.alc[k] || {};
    return (a.c || 0) + (a.v || 0) + (a.o || 0);
  };
  function beerWeek(monday = mondayOf()) {
    let t = 0;
    for (let i = 0; i < 7; i++) t += alcDay(dkey2(addDays(monday, i)));
    return t;
  }
  function slotLog(k, slot) {
    state.log[k] = state.log[k] || {};
    state.log[k][slot] = state.log[k][slot] || { checks: [], done: false };
    return state.log[k][slot];
  }
  function dayDone(k) {
    const l = state.log[k];
    return !!(l && (l.am && l.am.done || l.pm && l.pm.done));
  }
  function streak() {
    let d = /* @__PURE__ */ new Date(), n = 0;
    if (!dayDone(dkey2(d))) d = addDays(d, -1);
    while (dayDone(dkey2(d))) {
      n++;
      d = addDays(d, -1);
    }
    return n;
  }
  function avg7(endKey) {
    const end2 = fromKey(endKey);
    const vals = [];
    for (let i = 0; i < 7; i++) {
      const v = state.weight[dkey2(addDays(end2, -i))];
      if (v) vals.push(v);
    }
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  var sortedKeys = (o) => Object.keys(o).sort();
  function lineChart(series, { h = 170, unit = "", avg = null } = {}) {
    const W = 340, H = h, P2 = { l: 34, r: 8, t: 10, b: 22 };
    if (series.length < 2) return `<p class="muted">Precisa de pelo menos 2 registos para ver o gr\xE1fico.</p>`;
    const xs = series.map((p) => fromKey(p.k).getTime());
    const all = series.map((p) => p.v).concat(avg ? avg.map((p) => p.v) : []);
    let min = Math.min(...all), max = Math.max(...all);
    if (max - min < 1) {
      min -= 0.5;
      max += 0.5;
    }
    const pad22 = (max - min) * 0.1;
    min -= pad22;
    max += pad22;
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const X = (t) => P2.l + (t - x0) / (x1 - x0 || 1) * (W - P2.l - P2.r);
    const Y = (v) => P2.t + (1 - (v - min) / (max - min)) * (H - P2.t - P2.b);
    const path = (arr) => arr.map((p, i) => `${i ? "L" : "M"}${X(fromKey(p.k).getTime()).toFixed(1)},${Y(p.v).toFixed(1)}`).join("");
    const ticks = [min + (max - min) * 0.15, (min + max) / 2, max - (max - min) * 0.15];
    let g = ticks.map((v) => `<line x1="${P2.l}" x2="${W - P2.r}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${P2.l - 4}" y="${Y(v) + 3}" class="axis" text-anchor="end">${num(v, 1)}</text>`).join("");
    g += `<text x="${P2.l}" y="${H - 6}" class="axis">${fmtShort(series[0].k)}</text><text x="${W - P2.r}" y="${H - 6}" class="axis" text-anchor="end">${fmtShort(series[series.length - 1].k)}</text>`;
    const dots = series.length <= 40 ? series.map((p) => `<circle cx="${X(fromKey(p.k).getTime())}" cy="${Y(p.v)}" r="2.6" class="dot"/>`).join("") : "";
    return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img">${g}
    <path d="${path(series)}" class="${avg ? "line-raw" : "line"}"/>${avg ? `<path d="${path(avg)}" class="line"/>` : ""}${dots}</svg>`;
  }
  function barChart(bars, { goal = null, h = 130 } = {}) {
    const W = 340, H = h, P2 = { l: 8, r: 8, t: 20, b: 20 };
    const max = Math.max(goal || 0, ...bars.map((b) => b.v), 1) * 1.1;
    const bw = (W - P2.l - P2.r) / bars.length;
    const Y = (v) => P2.t + (1 - v / max) * (H - P2.t - P2.b);
    let s = bars.map((b, i) => {
      var _a;
      const x = P2.l + i * bw + bw * 0.18, w = bw * 0.64, y = Y(b.v);
      const over = goal != null && b.over;
      return `<rect x="${x}" y="${y}" width="${w}" height="${H - P2.b - y}" rx="3" class="${over ? "bar-over" : "bar"}"/>
      <text x="${x + w / 2}" y="${y - 3}" class="axis" text-anchor="middle">${(_a = b.label2) != null ? _a : b.v}</text>
      <text x="${x + w / 2}" y="${H - 6}" class="axis" text-anchor="middle">${b.label}</text>`;
    }).join("");
    if (goal) s += `<line x1="${P2.l}" x2="${W - P2.r}" y1="${Y(goal)}" y2="${Y(goal)}" class="goal"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" class="chart">${s}</svg>`;
  }
  var planEdit = null;
  var planWeek = () => (planEdit || (isVacation(state) ? "ferias" : "normal")) === "ferias" ? state.weekFerias : state.week;
  var tab = "hoje";
  var nutriTab = "chas";
  var open = {};
  var exactStatus = "granted";
  var notifOk = true;
  var app = document.getElementById("app");
  var TABS = [
    ["hoje", "\u{1F3E0}", "Hoje"],
    ["treino", "\u{1F4AA}", "Treino"],
    ["prog", "\u{1F4C8}", "Progresso"],
    ["nutri", "\u{1F957}", "Nutri\xE7\xE3o"],
    ["def", "\u2699\uFE0F", "Defini\xE7\xF5es"]
  ];
  function render() {
    const views = { hoje: vHoje, treino: vTreino, prog: vProg, nutri: vNutri, def: vDef };
    app.innerHTML = `<main>${views[tab]()}</main>
  <nav>${TABS.map(([id, ic, l]) => `<button data-tab="${id}" class="${tab === id ? "on" : ""}"><span>${ic}</span>${l}</button>`).join("")}</nav>`;
  }
  function animBtn(text, key) {
    const id = animFor(text);
    if (!id) return "";
    return `<button class="play ${open[key] ? "on" : ""}" data-toggle="${key}" aria-label="Ver anima\xE7\xE3o">${open[key] ? "\u25A0" : "\u25B6"}</button>`;
  }
  function animBox(text, key) {
    const id = animFor(text);
    if (!id || !open[key]) return "";
    return `<div class="anim"><svg viewBox="0 0 160 110" data-anim="${id}"></svg><p class="small">${ANIMS[id].tip}</p></div>`;
  }
  function parseSets(text) {
    if (/\(\s*\d+\s*min/.test(text)) return null;
    const m = text.match(/(\d+)\s*×\s*(\d+)?(?:–(\d+))?\s*(s\b)?/);
    if (!m) return null;
    const n = Number(m[1]);
    if (!n || n > 10) return null;
    const sec = m[4] && m[2] ? Number(m[2]) : null;
    return { n, sec, sides: !!sec && /cada lado/.test(text) };
  }
  var exName = (t) => t.split(" \u2014 ")[0].replace(/\(.*?\)/g, "").trim();
  function exType(t) {
    if (/Elevações|Remada|Flexões|Fundos|Press de ombro|Roda de abdominais/i.test(t)) return "dificil";
    if (/Prancha|Dead bug|Hollow|Vacuum|Abdominais|Elevação de (joelhos|pernas)|Mountain|Russian/i.test(t)) return "core";
    return "leve";
  }
  var restFor = (t) => Number(state.settings[{ dificil: "pausaDificil", leve: "pausaLeve", core: "pausaCore" }[exType(t)]]) || 45;
  function repsText(t) {
    const m = t.match(/×\s*(\d+)(?:–(\d+))?\s*(s\b)?/);
    if (/×\s*máximo/.test(t)) return { txt: "m\xE1ximo", say: "o m\xE1ximo de repeti\xE7\xF5es" };
    if (!m || m[3]) return null;
    const extra = /cada perna/.test(t) ? " cada perna" : /cada braço/.test(t) ? " cada bra\xE7o" : /cada lado/.test(t) ? " cada lado" : "";
    return m[2] ? { txt: `${m[1]}\u2013${m[2]}${extra}`, say: `${m[1]} a ${m[2]} repeti\xE7\xF5es${extra}` } : { txt: `${m[1]}${extra}`, say: `${m[1]} repeti\xE7\xF5es${extra}` };
  }
  function setsRow(k, slot, i, it, lg, editable) {
    const ps = parseSets(it);
    if (!ps || !editable) return "";
    const done = lg.sets && lg.sets[i] || 0;
    let b = "";
    for (let j = 0; j < ps.n; j++) b += `<button class="setb ${j < done ? "ok" : j === done ? "next" : ""}" data-setb="${k}|${slot}|${i}|${j}">${j < done ? "\u2713" : j + 1}</button>`;
    return `<div class="sets"><span class="muted small">${ps.sec ? `\u23F1 ${ps.sec} s${ps.sides ? " cada lado" : ""}` : "S\xE9ries"} \xB7 pausa ${restFor(it)} s</span>${b}</div>`;
  }
  function guidedBtns(k, slot, ses) {
    const g = ses.guided;
    if (!g) return ses.pairs ? `<div class="row guided"><button class="btn sm" data-guided="${k}|${slot}|pairs">\u{1F501} Modo pares com voz</button></div><p class="muted small">Pares: ${ses.pairs.map((p) => p.map((i) => exName(ses.items[i])).join(" + ")).join(" \xB7 ")}</p>` : "";
    if (g.type === "circuit") return `<div class="row guided">${g.rounds.map((r) => `<button class="btn sm" data-guided="${k}|${slot}|${r}">\u{1F50A} Circuito guiado \xB7 ${r} voltas</button>`).join("")}</div>`;
    return `<div class="row guided"><button class="btn sm" data-guided="${k}|${slot}|0">\u{1F50A} Iniciar intervalos com voz</button></div>`;
  }
  function sessionCard(k, slot, cfg, editable = true) {
    if (!cfg) return "";
    const ses = SESSIONS[cfg.s];
    const lg = state.log[k] && state.log[k][slot] || { checks: [], done: false };
    const id = `${k}-${slot}`;
    const isOpen = open[id];
    const n = lg.checks.length, tot = ses.items.length;
    return `<div class="ses ${lg.done ? "done" : ""}">
    <div class="ses-h" data-toggle="${id}">
      <div><div class="ses-t">${slot === "am" ? "\u{1F305} Manh\xE3" : parseInt(cfg.t) < 17 ? "\u2600\uFE0F Tarde" : "\u{1F319} Noite"} \xB7 ${cfg.t}</div><b>${ses.title}</b>
      <div class="muted">${ses.dur} \xB7 ${ses.place}${tot > 1 ? ` \xB7 ${n}/${tot}` : ""}</div></div>
      <div class="chev">${lg.done ? "\u2705" : isOpen ? "\u25B4" : "\u25BE"}</div>
    </div>
    ${isOpen ? `<div class="ses-b"><p class="note">${ses.note}</p>${editable ? guidedBtns(k, slot, ses) : ""}
      ${ses.items.map((it, i) => `<div class="ex"><div class="ex-row"><label class="chk"><input type="checkbox" ${editable ? "" : "disabled"} data-check="${k}|${slot}|${i}" ${lg.checks.includes(i) ? "checked" : ""}><span>${it}</span></label>${animBtn(it, `an-${id}-${i}`)}</div>${setsRow(k, slot, i, it, lg, editable)}${animBox(it, `an-${id}-${i}`)}</div>`).join("")}
      ${editable ? `<button class="btn ${lg.done ? "ghost" : ""}" data-done="${k}|${slot}">${lg.done ? "Desmarcar" : "Marcar treino como feito"}</button>` : ""}
    </div>` : ""}
  </div>`;
  }
  function banners() {
    let b = "";
    if (status.apkUrl) b += `<div class="upd">\u2B06\uFE0F Nova vers\xE3o da app dispon\xEDvel${status.latest && status.latest.notes ? `: ${status.latest.notes}` : ""}. <button class="link" data-act="apk">Descarregar e instalar</button></div>`;
    else if (status.pending) b += `<div class="upd">\u2728 Atualiza\xE7\xE3o pronta${status.pending.notes ? `: ${status.pending.notes}` : ""}. <button class="link" data-act="applyUpd">Aplicar agora</button></div>`;
    if (isNative() && !notifOk) b += `<div class="warn">As notifica\xE7\xF5es est\xE3o desligadas. <button class="link" data-act="perm">Ativar</button></div>`;
    if (isNative() && exactStatus !== "granted") b += `<div class="warn">Para os alarmes tocarem \xE0 hora certa, permita "Alarmes e lembretes". <button class="link" data-act="exact">Abrir defini\xE7\xE3o</button></div>`;
    return b;
  }
  function vHoje() {
    var _a;
    const now = /* @__PURE__ */ new Date(), k = dkey2(now), pr = profile(state, now), cfg = pr.week[now.getDay()];
    const s = pr.s;
    const w = waterToday(), pct = Math.min(100, Math.round(w / s.metaAgua * 100));
    const hr = now.getHours();
    const greet = hr < 12 ? "Bom dia" : hr < 19 ? "Boa tarde" : "Boa noite";
    const wt = state.weight[k];
    const prevKeys = sortedKeys(state.weight).filter((x) => x < k);
    const last = prevKeys.length ? state.weight[prevKeys[prevKeys.length - 1]] : null;
    const a7 = avg7(k), a7prev = avg7(dkey2(addDays(now, -7)));
    const monday = dkey2(mondayOf());
    const waistThisWeek = sortedKeys(state.waist).filter((x) => x >= monday);
    const showWaist = now.getDay() === Number(s.cinturaDia) || !waistThisWeek.length;
    const bw = beerWeek(), at2 = state.alc[k] || {};
    const tip = ALC_TIPS[now.getDate() % ALC_TIPS.length];
    const alcRow = (t, ic, l) => `<div class="alc-r"><span>${ic} ${l}</span><button class="btn sm ghost" data-alc="${t}|-1">\u2212</button><b>${at2[t] || 0}</b><button class="btn sm" data-alc="${t}|1">+</button></div>`;
    const tea = hr < 12 ? TEAS[0] : hr < 16 ? TEAS[6] : hr < 19 ? TEAS[10] : TEAS[hr < 21 ? 5 : 4];
    const st = streak();
    return `<header><div><h1>${greet}, ${s.nome}</h1><div class="muted">${DAY_NAMES[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}</div></div>
    <div class="streak" title="Dias seguidos com treino">\u{1F525} ${st}</div></header>
    ${banners()}${pr.vac ? `<div class="vac">\u{1F3D6}\uFE0F Modo f\xE9rias${s.feriasModo === "auto" && s.feriasFim ? ` at\xE9 ${fmtShort(s.feriasFim)}` : ""} \u2014 durma bem, o treino \xE9 ao fim da manh\xE3.</div>` : ""}
    <section class="card"><h2>\u{1F4A7} \xC1gua <span class="right">${num(w / 1e3, 2)} / ${num(s.metaAgua / 1e3, 1)} L</span></h2>
      <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div class="row"><button class="btn sm ghost" data-water="-${s.copoMl}">\u2212${s.copoMl}</button><button class="btn sm" data-water="${s.copoMl}">+ copo ${s.copoMl} ml</button><button class="btn sm" data-water="500">+ garrafa 500 ml</button></div>
      <p class="muted small">${w >= s.metaAgua ? "\u2705 Meta de hoje cumprida!" : `Faltam ${num((s.metaAgua - w) / 1e3, 2)} L (\u2248 ${Math.ceil((s.metaAgua - w) / s.copoMl)} copos).`} Ch\xE1 e infus\xF5es sem a\xE7\xFAcar tamb\xE9m contam.</p></section>
    ${s.notifSnack ? (() => {
      const [sm, st2] = snacksFor(now), tm = new Date(now);
      tm.setDate(now.getDate() + 1);
      const [t1, t2] = snacksFor(tm);
      return `<section class="card"><h2>\u{1F34E} Snacks de hoje</h2>
      ${s.snackManha ? `<div class="hist"><span>${s.snackManha} \xB7 manh\xE3</span><span>${sm.name}</span></div>` : ""}
      <div class="hist"><span>${s.snackTarde} \xB7 tarde</span><span>${st2.name}</span></div>
      ${s.snackPrep ? `<p class="muted small">Amanh\xE3: ${t1.name} \xB7 ${t2.name}</p>` : ""}</section>`;
    })() : ""}
    <section class="card"><h2>Treino de hoje</h2>${sessionCard(k, "am", cfg.am)}${sessionCard(k, "pm", cfg.pm)}</section>
    <section class="card"><h2>\u2696\uFE0F Peso de hoje</h2>
      <div class="row"><input id="inPeso" type="number" inputmode="decimal" step="0.1" placeholder="kg" value="${wt != null ? wt : ""}"><button class="btn sm" data-act="savePeso">Guardar</button></div>
      <p class="muted small">${a7 ? `M\xE9dia 7 dias: <b>${num(a7)} kg</b>${a7prev ? ` (${a7 - a7prev <= 0 ? "" : "+"}${num(a7 - a7prev)} vs. semana anterior)` : ""}` : last ? `\xDAltimo: ${num(last)} kg` : "O peso oscila de dia para dia \u2014 o que conta \xE9 a m\xE9dia semanal."}</p>
      ${showWaist ? `<h3>\u{1F4CF} Cintura (semanal)</h3><div class="row"><input id="inCintura" type="number" inputmode="decimal" step="0.5" placeholder="cm" value="${(_a = state.waist[k]) != null ? _a : ""}"><button class="btn sm" data-act="saveCintura">Guardar</button></div>
      <p class="muted small">\xC0 altura do umbigo, barriga relaxada, a expirar.</p>` : ""}
    </section>
    <section class="card"><h2>\u{1F377} \xC1lcool <span class="right ${bw > s.metaCerveja ? "bad" : ""}">${bw} / ${s.metaCerveja} bebidas esta semana</span></h2>
      ${alcRow("c", "\u{1F37A}", "Cerveja (330 ml)")}${alcRow("v", "\u{1F377}", "Vinho (copo 150 ml)")}${alcRow("o", "\u{1F943}", "Destilado (dose 40 ml)")}
      <p class="muted small">\u{1F4A1} ${tip}</p></section>
    <section class="card tea"><h2>\u{1F375} Sugest\xE3o para agora</h2><b>${tea.name}</b><p class="small">${tea.good}</p><p class="muted small">${tea.how}</p></section>`;
  }
  function vTreino() {
    const today = /* @__PURE__ */ new Date();
    const order = [1, 2, 3, 4, 5, 6, 0];
    const opts = (sel) => Object.entries(SESSIONS).map(([id, s]) => `<option value="${id}" ${id === sel ? "selected" : ""}>${s.title}</option>`).join("");
    let cells = "";
    const start = addDays(mondayOf(), -21);
    for (let i = 0; i < 28; i++) {
      const d = addDays(start, i), k = dkey2(d), l = state.log[k] || {};
      const c = (l.am && l.am.done ? 1 : 0) + (l.pm && l.pm.done ? 1 : 0);
      cells += `<div class="cell c${c} ${k === dkey2() ? "today" : ""} ${d > today ? "fut" : ""}" title="${fmtShort(k)}">${d.getDate()}</div>`;
    }
    let weekDone = 0, weekPlanned = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(mondayOf(), i), l = state.log[dkey2(d)] || {}, cfg = profile(state, d).week[d.getDay()];
      for (const sl of ["am", "pm"]) {
        if (cfg[sl] && cfg[sl].s !== "REST") weekPlanned++;
        if (l[sl] && l[sl].done) weekDone++;
      }
    }
    const recent = sortedKeys(state.log).reverse().filter(dayDone).slice(0, 10);
    return `<header><h1>Treino</h1><div class="streak">\u{1F525} ${streak()}</div></header>
  <section class="card"><h2>Esta semana <span class="right">${weekDone} / ${weekPlanned} sess\xF5es</span></h2>
    <div class="bar-wrap"><div class="bar-fill" style="width:${weekPlanned ? Math.round(weekDone / weekPlanned * 100) : 0}%"></div></div>
    <div class="cal">${["S", "T", "Q", "Q", "S", "S", "D"].map((x) => `<div class="cal-h">${x}</div>`).join("")}${cells}</div>
    <p class="muted small">\xDAltimas 4 semanas \xB7 verde claro = 1 sess\xE3o, verde escuro = 2.</p></section>
  <section class="card"><h2>Plano semanal</h2>
    <div class="seg">${[["normal", "Normal (Lubango)"], ["ferias", "\u{1F3D6}\uFE0F F\xE9rias"]].map(([id, l]) => `<button data-plan="${id}" class="${(planEdit || (isVacation(state) ? "ferias" : "normal")) === id ? "on" : ""}">${l}${(isVacation(state) ? "ferias" : "normal") === id ? " \xB7 ativo" : ""}</button>`).join("")}</div>
    <p class="muted small">Toque num dia para editar a sess\xE3o ou a hora. Os alarmes atualizam-se sozinhos.</p>
    ${order.map((d) => {
      const c = planWeek()[d], id = `plan-${d}`;
      return `<div class="plan-d ${d === today.getDay() ? "is-today" : ""}"><div class="plan-h" data-toggle="${id}"><b>${DAY_NAMES[d]}</b>
        <span class="muted small">${c.am.t} ${SESSIONS[c.am.s].title.split(" \u2014")[0]} \xB7 ${c.pm.t} ${SESSIONS[c.pm.s].title.split(" \u2014")[0]}</span></div>
        ${open[id] ? ["am", "pm"].map((sl) => `<div class="plan-e"><span>${sl === "am" ? "\u{1F305}" : "\u{1F319}"}</span><input type="time" value="${c[sl].t}" data-plan-t="${d}|${sl}"><select data-plan-s="${d}|${sl}">${opts(c[sl].s)}</select></div>`).join("") : ""}
      </div>`;
    }).join("")}
    <button class="btn ghost sm" data-act="resetPlan">Repor plano original</button></section>
  <section class="card"><h2>Sess\xF5es</h2>${Object.entries(SESSIONS).filter(([id]) => ["A", "B", "C", "CORE"].includes(id)).map(([id, s]) => {
      const oid = `sesinfo-${id}`;
      return `<div class="plan-d"><div class="plan-h" data-toggle="${oid}"><b>${s.title}</b><span class="muted small">${s.dur}</span></div>${open[oid] ? `<p class="note">${s.note}</p><div class="small">${s.items.map((x, i) => `<div class="ex"><div class="ex-row"><span class="ex-t">${i + 1}. ${x}</span>${animBtn(x, `an-${oid}-${i}`)}</div>${animBox(x, `an-${oid}-${i}`)}</div>`).join("")}</div>` : ""}</div>`;
    }).join("")}
    <p class="muted small"><b>Progress\xE3o:</b> semana 1 com 2 s\xE9ries; semana 2 com 3; semana 3 mais reps ou menos descanso (circuito C com 4 voltas); semana 4 manter ou aliviar, e reavaliar.</p></section>
  <section class="card"><h2>Hist\xF3rico</h2>${recent.length ? recent.map((k) => {
      const l = state.log[k], c = profile(state, fromKey(k)).week[fromKey(k).getDay()];
      const parts = ["am", "pm"].filter((sl) => l[sl] && l[sl].done).map((sl) => SESSIONS[l[sl].s || c[sl].s].title.split(" \u2014")[0]);
      return `<div class="hist"><span>${DAY_NAMES[fromKey(k).getDay()].slice(0, 3)} ${fmtShort(k)}</span><span>${parts.join(" + ")}</span></div>`;
    }).join("") : '<p class="muted">Ainda sem treinos registados. O primeiro \xE9 o mais dif\xEDcil \u{1F4AA}</p>'}</section>`;
  }
  function vProg() {
    const s = state.settings;
    const wk = sortedKeys(state.weight);
    const since = dkey2(addDays(/* @__PURE__ */ new Date(), -120));
    const series = wk.filter((k) => k >= since).map((k) => ({ k, v: state.weight[k] }));
    const avgS = series.map((p) => ({ k: p.k, v: avg7(p.k) }));
    const first = wk.length ? state.weight[wk[0]] : null;
    const cur = wk.length ? avg7(wk[wk.length - 1]) : null;
    const ck = sortedKeys(state.waist);
    const cSeries = ck.map((k) => ({ k, v: state.waist[k] }));
    const waterBars = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(/* @__PURE__ */ new Date(), -i), v = state.water[dkey2(d)] || 0;
      waterBars.push({ v: v / 1e3, label: DAY_NAMES[d.getDay()].slice(0, 3), label2: num(v / 1e3, 1) });
    }
    const beerBars = [];
    for (let i = 7; i >= 0; i--) {
      const m = addDays(mondayOf(), -7 * i), v = beerWeek(m);
      beerBars.push({ v, label: fmtShort(dkey2(m)), over: v > s.metaCerveja });
    }
    const entries = wk.slice(-14).reverse();
    return `<header><h1>Progresso</h1></header>
  <section class="card"><h2>\u2696\uFE0F Peso</h2>
    <div class="stats"><div><small>In\xEDcio</small><b>${first ? num(first) : "\u2014"}</b></div><div><small>M\xE9dia 7 dias</small><b>${cur ? num(cur) : "\u2014"}</b></div>
    <div><small>Varia\xE7\xE3o</small><b class="${first && cur && cur - first <= 0 ? "good" : ""}">${first && cur ? `${cur - first > 0 ? "+" : ""}${num(cur - first)}` : "\u2014"}</b></div>
    ${s.metaPeso ? `<div><small>Meta</small><b>${num(s.metaPeso)}</b></div>` : ""}</div>
    ${lineChart(series, { avg: avgS })}
    <p class="muted small">Linha clara = pesagens di\xE1rias. Linha forte = m\xE9dia de 7 dias (\xE9 esta que conta).</p>
    ${entries.length ? `<details><summary>\xDAltimos registos</summary>${entries.map((k) => `<div class="hist"><span>${fmtShort(k)}</span><span>${num(state.weight[k])} kg <button class="link" data-del="weight|${k}">apagar</button></span></div>`).join("")}</details>` : ""}
  </section>
  <section class="card"><h2>\u{1F4CF} Cintura</h2>
    <div class="stats"><div><small>In\xEDcio</small><b>${ck.length ? num(state.waist[ck[0]]) : "\u2014"}</b></div><div><small>Atual</small><b>${ck.length ? num(state.waist[ck[ck.length - 1]]) : "\u2014"}</b></div>
    <div><small>Varia\xE7\xE3o</small><b>${ck.length > 1 ? `${num(state.waist[ck[ck.length - 1]] - state.waist[ck[0]])} cm` : "\u2014"}</b></div></div>
    ${lineChart(cSeries)}
    ${ck.length ? `<details><summary>Registos</summary>${ck.slice().reverse().map((k) => `<div class="hist"><span>${fmtShort(k)}</span><span>${num(state.waist[k])} cm <button class="link" data-del="waist|${k}">apagar</button></span></div>`).join("")}</details>` : ""}
  </section>
  <section class="card"><h2>\u{1F4A7} \xC1gua \u2014 \xFAltimos 7 dias (L)</h2>${barChart(waterBars, { goal: s.metaAgua / 1e3 })}</section>
  <section class="card"><h2>\u{1F377} Bebidas alco\xF3licas por semana</h2>${barChart(beerBars, { goal: s.metaCerveja })}<p class="muted small">A linha \xE9 a sua meta semanal (${s.metaCerveja}).</p></section>`;
  }
  function vNutri() {
    const sub = { chas: "Ch\xE1s", receitas: "Receitas", compras: "Compras" };
    let body = "";
    if (nutriTab === "chas") {
      body = `<p class="note">${DETOX_NOTE}</p>${TEAS.map((t) => `<section class="card tea"><b>${t.name}</b><div class="muted small">\u23F0 ${t.when}</div><p class="small">${t.good}</p><p class="muted small">\u{1FAD6} ${t.how}</p></section>`).join("")}`;
    } else if (nutriTab === "receitas") {
      body = `<p class="muted small">S\xF3 ingredientes comuns de supermercado. Regra do prato: \xBD legumes, \xBC prote\xEDna, \xBC hidratos (arroz, massa, batata, batata-doce, funge).</p>` + RECIPES.map((r) => {
        const sel = state.shop.sel.includes(r.id), oid = `rec-${r.id}`;
        return `<section class="card"><div class="plan-h" data-toggle="${oid}"><div><b>${r.name}</b><div class="muted small">${r.meal} \xB7 ${r.time} \xB7 ${r.serves} ${r.serves > 1 ? "pessoas" : "pessoa"}</div></div><div class="chev">${open[oid] ? "\u25B4" : "\u25BE"}</div></div>
        ${open[oid] ? `<h3>Ingredientes</h3><ul class="small">${r.ing.map((x) => `<li>${x.q} ${x.i}</li>`).join("")}</ul><h3>Prepara\xE7\xE3o</h3><ol class="small">${r.steps.map((x) => `<li>${x}</li>`).join("")}</ol><p class="note">\u{1F4A1} ${r.tip}</p>` : ""}
        <button class="btn sm ${sel ? "ghost" : ""}" data-shop="${r.id}">${sel ? "\u2713 Na lista de compras" : "+ Lista de compras"}</button></section>`;
      }).join("");
    } else {
      const agg = {};
      for (const id of state.shop.sel) {
        const r = RECIPES.find((x) => x.id === id);
        if (!r) continue;
        for (const ing2 of r.ing) {
          agg[ing2.c] = agg[ing2.c] || {};
          agg[ing2.c][ing2.i] = agg[ing2.c][ing2.i] || [];
          agg[ing2.c][ing2.i].push(ing2.q);
        }
      }
      const cats = Object.keys(CAT_NAMES).filter((c) => agg[c]);
      body = !state.shop.sel.length ? `<p class="muted">A lista est\xE1 vazia. V\xE1 a <b>Receitas</b> e toque em "+ Lista de compras".</p>` : `<p class="muted small">Receitas: ${state.shop.sel.map((id) => {
        var _a;
        return (_a = RECIPES.find((r) => r.id === id)) == null ? void 0 : _a.name;
      }).filter(Boolean).join(", ")}</p>` + cats.map((c) => `<section class="card"><h3>${CAT_NAMES[c]}</h3>${Object.entries(agg[c]).sort().map(([item, qs]) => {
        const key = `${c}|${item}`;
        return `<label class="chk"><input type="checkbox" data-buy="${key}" ${state.shop.checked[key] ? "checked" : ""}><span>${item} <span class="muted">\u2014 ${qs.join(" + ")}</span></span></label>`;
      }).join("")}</section>`).join("") + `<button class="btn ghost" data-act="clearShop">Limpar lista</button>`;
    }
    return `<header><h1>Nutri\xE7\xE3o</h1></header><div class="seg">${Object.entries(sub).map(([id, l]) => `<button data-nutri="${id}" class="${nutriTab === id ? "on" : ""}">${l}${id === "compras" && state.shop.sel.length ? ` (${state.shop.sel.length})` : ""}</button>`).join("")}</div>${body}`;
  }
  function vDef() {
    const s = state.settings;
    const tg = (k, l) => `<label class="tg"><span>${l}</span><input type="checkbox" data-set="${k}" ${s[k] ? "checked" : ""}></label>`;
    const tm = (k, l) => `<label class="fld"><span>${l}</span><input type="time" data-set="${k}" value="${s[k]}"></label>`;
    const nm = (k, l, step = 1) => `<label class="fld"><span>${l}</span><input type="number" inputmode="decimal" step="${step}" data-set="${k}" value="${s[k]}"></label>`;
    return `<header><h1>Defini\xE7\xF5es</h1></header>${banners()}
  <section class="card"><h2>Notifica\xE7\xF5es</h2>
    ${tg("notifTreino", "\u{1F4AA} Treinos")}${nm("treinoAntes", "Avisar quantos minutos antes")}
    ${tg("notifAgua", "\u{1F4A7} \xC1gua")}${tm("aguaInicio", "Desde")}${tm("aguaFim", "At\xE9")}
    <label class="fld"><span>Intervalo</span><select data-set="aguaIntervalo">${[45, 60, 90, 120].map((v) => `<option value="${v}" ${s.aguaIntervalo == v ? "selected" : ""}>${v} min</option>`).join("")}</select></label>
    ${tg("notifPeso", "\u2696\uFE0F Peso di\xE1rio + cintura semanal")}${tm("pesoHora", "Hora da pesagem")}
    <label class="fld"><span>Dia da cintura</span><select data-set="cinturaDia">${DAY_NAMES.map((d, i) => `<option value="${i}" ${s.cinturaDia == i ? "selected" : ""}>${d}</option>`).join("")}</select></label>
    ${tg("notifCerveja", "\u{1F377} Lembrete antes de beber")}${tm("cervejaHora", "Seg\u2013Sex")}${tm("cervejaSabado", "S\xE1bado")}
    ${tg("notifSnack", "\u{1F34E} Snacks")}${tm("snackManha", "Lanche da manh\xE3 (Seg\u2013S\xE1b)")}${tm("snackTarde", "Lanche da tarde")}${tm("snackPrep", "Preparar snacks (noite anterior)")}
    ${tg("notifChas", "\u{1F375} Ch\xE1s")}${tm("chaManha", "Ch\xE1 da manh\xE3")}${tm("chaNoite", "Infus\xE3o da noite")}
    <p class="muted small">${lastSched ? lastSched.error ? `Erro ao agendar: ${lastSched.error}` : `${lastSched.count} lembretes agendados${lastSched.web ? " (pr\xE9-visualiza\xE7\xE3o web)" : ""}${lastSched.warning ? " \u2014 sem permiss\xE3o de alarme exato, podem atrasar" : ""}.` : ""}</p>
    <button class="btn" data-act="test">Enviar notifica\xE7\xE3o de teste (5 s)</button></section>
  <section class="card"><h2>\u{1F50A} Treinador</h2>${tg("voz", "Voz durante o treino")}${nm("pausaDificil", "Pausa \xB7 exerc\xEDcios dif\xEDceis (s)", 5)}${nm("pausaLeve", "Pausa \xB7 exerc\xEDcios leves (s)", 5)}${nm("pausaCore", "Pausa \xB7 core (s)", 5)}${nm("pausaPar", "Pausa no fim de cada par (s)", 5)}${nm("pausaTroca", "Troca dentro do par (s)", 5)}<p class="muted small">Dif\xEDceis: eleva\xE7\xF5es, remada, flex\xF5es, fundos, press, roda. Core: pranchas, dead bug, hollow, abdominais, eleva\xE7\xF5es de pernas. Leves: o resto. Contagem de s\xE9ries, pausas e intervalos com voz em portugu\xEAs. O ecr\xE3 fica ligado enquanto o temporizador corre.</p>
    <button class="btn ghost sm" data-act="testVoz">Testar voz</button></section>
  <section class="card"><h2>\u{1F3D6}\uFE0F Modo f\xE9rias</h2>
    <label class="fld"><span>Ativar</span><select data-set="feriasModo">${[["auto", "Autom\xE1tico nas datas"], ["on", "Sempre ligado"], ["off", "Desligado"]].map(([v, l]) => `<option value="${v}" ${s.feriasModo === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>
    <label class="fld"><span>De</span><input type="date" data-set="feriasInicio" value="${s.feriasInicio}"></label>
    <label class="fld"><span>At\xE9</span><input type="date" data-set="feriasFim" value="${s.feriasFim}"></label>
    ${tm("vPeso", "Pesagem")}${tm("vAguaInicio", "\xC1gua desde")}${tm("vAguaFim", "\xC1gua at\xE9")}${nm("vMetaAgua", "Meta de \xE1gua (ml)", 250)}
${tm("vSnackTarde", "Lanche da tarde")}    ${tm("vCerveja", "Lembrete antes de beber")}${tm("vChaManha", "Ch\xE1 da tarde")}${tm("vChaNoite", "Infus\xE3o da noite")}
    <p class="muted small">Estado: ${isVacation(state) ? "<b>ativo</b>" : "inativo"}. O plano de treino de f\xE9rias edita-se no separador Treino.</p></section>
  <section class="card"><h2>Metas</h2>${nm("metaAgua", "\xC1gua por dia (ml)", 250)}${nm("copoMl", "Tamanho do copo (ml)", 50)}${nm("metaCerveja", "Bebidas alco\xF3licas por semana (m\xE1x.)")}${nm("metaPeso", "Peso objetivo (kg)", 0.5)}
    <p class="muted small">\xC1gua: cerca de 35 ml por kg de peso. No Lubango (altitude, ar seco) e nos dias de treino, 3 L \xE9 um bom alvo.</p></section>
  <section class="card"><h2>\u231A Huawei Watch GT 6</h2><ol class="small">
    <li>Na app <b>Huawei Health</b> \u2192 Dispositivos \u2192 GT 6 \u2192 <b>Notifica\xE7\xF5es</b>: ative e ligue o <b>KillBelly</b>.</li>
    <li>No telem\xF3vel, em Defini\xE7\xF5es \u2192 Apps \u2192 KillBelly \u2192 Notifica\xE7\xF5es: tudo ligado, incluindo "Mostrar no ecr\xE3 bloqueado".</li>
    <li>Bateria: Defini\xE7\xF5es \u2192 Apps \u2192 KillBelly \u2192 Bateria \u2192 <b>Sem restri\xE7\xF5es</b> (Huawei: "Gerir manualmente" e ativar tudo em "Iniciar aplica\xE7\xF5es").</li>
    <li>Permita <b>"Alarmes e lembretes"</b> quando a app pedir.</li>
    <li>Use o bot\xE3o de teste acima com o ecr\xE3 bloqueado para confirmar que o rel\xF3gio vibra.</li>
    <li>O rel\xF3gio n\xE3o mostra notifica\xE7\xF5es enquanto est\xE1 a ser usado o telem\xF3vel (o ecr\xE3 do telem\xF3vel ligado) \u2014 \xE9 normal.</li>
  </ol></section>
  <section class="card"><h2>C\xF3pia de seguran\xE7a</h2><p class="muted small">Copie o texto e guarde-o (ex.: email para si pr\xF3prio). Para restaurar, cole e toque em Importar.</p>
    <textarea id="backup" rows="4" placeholder="Cole aqui para importar"></textarea>
    <div class="row"><button class="btn sm ghost" data-act="export">Exportar</button><button class="btn sm ghost" data-act="import">Importar</button></div></section>
  <section class="card"><h2>\u2B06\uFE0F Atualiza\xE7\xF5es</h2>
    <p class="small">Vers\xE3o instalada: app <b>${status.native}</b> \xB7 conte\xFAdo <b>${status.web || "local"}</b>${status.latest ? ` \xB7 mais recente: app ${status.latest.native} \xB7 conte\xFAdo ${status.latest.web}` : ""}</p>
    <p class="muted small">${status.error ? `N\xE3o foi poss\xEDvel verificar (${status.error}).` : status.apkUrl ? "H\xE1 uma APK nova \u2014 use o aviso no topo." : status.pending ? "Atualiza\xE7\xE3o descarregada; aplica-se ao reabrir a app." : status.lastCheck ? "Est\xE1 atualizado." : "A app verifica sozinha sempre que \xE9 aberta."}</p>
    <button class="btn ghost sm" data-act="checkUpd">Verificar agora</button></section>
  <p class="muted small center">KillBelly \xB7 os dados ficam s\xF3 no seu telem\xF3vel.</p>`;
  }
  function sesOf(k, slot) {
    return SESSIONS[profile(state, fromKey(k)).week[fromKey(k).getDay()][slot].s];
  }
  function markItem(k, slot, i) {
    const l = slotLog(k, slot), ses = sesOf(k, slot);
    l.s = profile(state, fromKey(k)).week[fromKey(k).getDay()][slot].s;
    if (!l.checks.includes(i)) l.checks.push(i);
    if (l.checks.length === ses.items.length) {
      l.done = true;
      say("Treino conclu\xEDdo. Muito bem!");
    }
  }
  function setTap(k, slot, i, j) {
    i = Number(i);
    j = Number(j);
    const ses = sesOf(k, slot), it = ses.items[i], ps = parseSets(it), l = slotLog(k, slot);
    l.sets = l.sets || {};
    const done = l.sets[i] || 0;
    if (j < done) {
      l.sets[i] = j;
      l.checks = l.checks.filter((x) => x !== i);
      l.done = false;
      save();
      render();
      return;
    }
    const rest = restFor(it), name = exName(it), nr = done + 1;
    const finishSet = () => {
      l.sets[i] = nr;
      if (nr >= ps.n) {
        markItem(k, slot, i);
        if (!l.done) say(`${name} conclu\xEDdo.`);
        save();
        render();
        return;
      }
      save();
      render();
      run(
        [{ kind: "rest", label: `Pausa \xB7 a seguir: ${name}, s\xE9rie ${nr + 1} de ${ps.n}`, sec: rest, say: `Pausa. ${rest} segundos.` }],
        (ok) => {
          if (ok) say(ps.sec ? "Pr\xF3xima s\xE9rie. Toque para come\xE7ar." : `S\xE9rie ${nr + 1}. Vai!`);
        }
      );
    };
    if (!ps.sec) {
      finishSet();
      return;
    }
    const steps2 = [{ kind: "prep", label: `${name} \xB7 s\xE9rie ${nr}/${ps.n}`, sec: 5, say: `${name}. S\xE9rie ${nr} de ${ps.n}. Prepare-se.` }];
    if (ps.sides) {
      steps2.push({ kind: "work", label: `${name} \xB7 lado direito`, sec: ps.sec, say: "Vai! Lado direito." });
      steps2.push({ kind: "prep", label: "Troca de lado", sec: 5, say: "Troca de lado." });
      steps2.push({ kind: "work", label: `${name} \xB7 lado esquerdo`, sec: ps.sec, say: "Vai! Lado esquerdo." });
    } else steps2.push({ kind: "work", label: `${name} \xB7 s\xE9rie ${nr}/${ps.n}`, sec: ps.sec, say: "Vai!" });
    run(steps2, (ok) => {
      if (ok) finishSet();
    });
  }
  function guided(k, slot, rounds) {
    const ses = sesOf(k, slot), g = ses.guided, steps2 = [];
    if (rounds === "pairs") return pairsRun(k, slot, ses);
    if (g.type === "circuit") {
      const R = Number(rounds);
      steps2.push({ kind: "prep", label: `Circuito \xB7 ${R} voltas`, sec: 10, say: `Circuito de ${R} voltas. Primeiro: ${g.ex[0]}. Prepare-se.` });
      for (let r = 1; r <= R; r++) {
        g.ex.forEach((e, n) => {
          const side = /lateral/i.test(e);
          steps2.push({ kind: "work", label: `${e} \xB7 volta ${r}/${R}`, sec: g.work, say: `${e}. Vai!`, mid: side ? [{ at: Math.floor(g.work / 2), say: "Troca de lado" }] : [] });
          const last = n === g.ex.length - 1;
          if (last && r === R) return;
          steps2.push(last ? { kind: "rest", label: `Fim da volta ${r} \xB7 a seguir: ${g.ex[0]}`, sec: g.roundRest, say: `Fim da volta ${r}. Descanse ${g.roundRest} segundos.` } : { kind: "rest", label: `Pausa \xB7 a seguir: ${g.ex[n + 1]}`, sec: g.rest, say: `Pausa. A seguir: ${g.ex[n + 1]}.` });
        });
      }
      run(steps2, (ok) => {
        if (!ok) return;
        const l = slotLog(k, slot);
        ses.items.forEach((_, i) => {
          if (!l.checks.includes(i)) l.checks.push(i);
        });
        l.done = true;
        l.s = profile(state, fromKey(k)).week[fromKey(k).getDay()][slot].s;
        say("Circuito terminado. Excelente!");
        save();
        render();
      });
    } else {
      steps2.push({ kind: "rest", label: "Aquecimento a andar", sec: g.warm, say: `Aquecimento. ${Math.round(g.warm / 60)} minutos a andar.` });
      for (let r = 1; r <= g.reps; r++) {
        steps2.push({ kind: "work", label: `Jogging leve ${r}/${g.reps}`, sec: g.work, say: r === 1 ? "Corre! Ritmo leve, em que consegue falar." : `Corre! ${r} de ${g.reps}.` });
        steps2.push({ kind: "rest", label: `A andar ${r}/${g.reps}`, sec: g.rest, say: r === g.reps ? "Anda. \xDAltimo intervalo." : "Agora anda." });
      }
      run(steps2, (ok) => {
        if (!ok) return;
        const l = slotLog(k, slot);
        ses.items.forEach((it, i) => {
          if (/andar|jogging/.test(it) && !l.checks.includes(i)) l.checks.push(i);
        });
        l.s = profile(state, fromKey(k)).week[fromKey(k).getDay()][slot].s;
        say("Terminado! Fa\xE7a os alongamentos.");
        save();
        render();
      });
    }
  }
  function pairsRun(k, slot, ses) {
    const st = state.settings, l = slotLog(k, slot), steps2 = [];
    l.sets = l.sets || {};
    l.s = profile(state, fromKey(k)).week[fromKey(k).getDay()][slot].s;
    const mark = (i, n) => () => {
      l.sets[i] = Math.max(l.sets[i] || 0, n);
      const ps = parseSets(ses.items[i]);
      if (ps && l.sets[i] >= ps.n) markItem(k, slot, i);
      save();
      render();
    };
    steps2.push({ kind: "prep", label: "Modo pares", sec: 8, say: `Modo pares. Primeiro par: ${ses.pairs[0].map((i) => exName(ses.items[i])).join(" e ")}.` });
    ses.pairs.forEach((pair, pi) => {
      const sets = Math.max(...pair.map((i) => (parseSets(ses.items[i]) || { n: 1 }).n));
      for (let s = 1; s <= sets; s++) {
        pair.forEach((i, ei) => {
          const it = ses.items[i], ps = parseSets(it), name = exName(it);
          if (!ps || s > ps.n || (l.sets[i] || 0) >= s) return;
          const head = `${name} \xB7 s\xE9rie ${s}/${ps.n}`;
          if (ps.sec) {
            if (ps.sides) {
              steps2.push({ kind: "work", label: `${head} \xB7 lado direito`, sec: ps.sec, say: `${name}. Lado direito. Vai!` });
              steps2.push({ kind: "prep", label: "Troca de lado", sec: 5, say: "Troca de lado." });
              steps2.push({ kind: "work", label: `${head} \xB7 lado esquerdo`, sec: ps.sec, say: "Lado esquerdo. Vai!", onEnd: mark(i, s) });
            } else steps2.push({ kind: "work", label: head, sec: ps.sec, say: `${name}. ${ps.sec} segundos. Vai!`, onEnd: mark(i, s) });
          } else {
            const r = repsText(it);
            steps2.push({ kind: "work", manual: true, label: head, reps: r ? r.txt : "", say: `${name}. S\xE9rie ${s}. ${r ? r.say : ""}`, onEnd: mark(i, s) });
          }
          const lastInPair = ei === pair.length - 1 || pair.slice(ei + 1).every((j) => {
            const p2 = parseSets(ses.items[j]);
            return !p2 || s > p2.n;
          });
          if (!lastInPair) {
            const nx = exName(ses.items[pair[ei + 1]]);
            steps2.push({ kind: "prep", label: `Troca \u2192 ${nx}`, sec: Number(st.pausaTroca) || 10, say: `Troca. ${nx}.` });
          } else {
            const lastAll = pi === ses.pairs.length - 1 && s === sets;
            if (!lastAll) {
              const nextPair = s < sets ? pair : ses.pairs[pi + 1];
              const label = s < sets ? `Pausa \xB7 a seguir: s\xE9rie ${s + 1}` : `Pausa \xB7 pr\xF3ximo par: ${nextPair.map((j) => exName(ses.items[j])).join(" + ")}`;
              const pr = pair.length > 1 ? Number(st.pausaPar) || 45 : restFor(ses.items[pair[0]]);
              steps2.push({ kind: "rest", label, sec: pr, say: s < sets ? `Pausa. ${pr} segundos.` : `Par conclu\xEDdo. Pausa de ${pr} segundos. A seguir: ${nextPair.map((j) => exName(ses.items[j])).join(" e ")}.` });
            }
          }
        });
      }
    });
    run(steps2, (ok) => {
      if (ok) {
        say("Treino de pares conclu\xEDdo. Muito bem!");
        save();
        render();
      }
    });
  }
  app.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-tab],[data-toggle],[data-done],[data-water],[data-alc],[data-act],[data-nutri],[data-shop],[data-del],[data-plan],[data-setb],[data-guided]");
    if (!t) return;
    const d = t.dataset;
    if (d.tab) {
      tab = d.tab;
      render();
      window.scrollTo(0, 0);
      return;
    }
    if (d.toggle) {
      open[d.toggle] = !open[d.toggle];
      render();
      return;
    }
    if (d.done) {
      const [k, sl] = d.done.split("|");
      const l = slotLog(k, sl);
      l.done = !l.done;
      l.s = profile(state, fromKey(k)).week[fromKey(k).getDay()][sl].s;
      if (l.done) {
        l.checks = SESSIONS[l.s].items.map((_, i) => i);
        open[`${k}-${sl}`] = false;
      }
      save();
      render();
      return;
    }
    if (d.water) {
      addWater(Number(d.water));
      render();
      return;
    }
    if (d.alc) {
      const [ty, n] = d.alc.split("|"), k = dkey2();
      state.alc[k] = state.alc[k] || {};
      state.alc[k][ty] = Math.max(0, (state.alc[k][ty] || 0) + Number(n));
      save();
      render();
      return;
    }
    if (d.nutri) {
      nutriTab = d.nutri;
      render();
      return;
    }
    if (d.plan) {
      planEdit = d.plan;
      render();
      return;
    }
    if (d.setb) {
      setTap(...d.setb.split("|"));
      return;
    }
    if (d.guided) {
      guided(...d.guided.split("|"));
      return;
    }
    if (d.shop) {
      const i = state.shop.sel.indexOf(d.shop);
      if (i >= 0) state.shop.sel.splice(i, 1);
      else state.shop.sel.push(d.shop);
      save();
      render();
      return;
    }
    if (d.del) {
      const [obj, k] = d.del.split("|");
      delete state[obj][k];
      save();
      render();
      return;
    }
    switch (d.act) {
      case "savePeso": {
        const v = parseFloat(String(document.getElementById("inPeso").value).replace(",", "."));
        if (v > 30 && v < 300) {
          state.weight[dkey2()] = Math.round(v * 10) / 10;
          save();
          render();
        }
        break;
      }
      case "saveCintura": {
        const v = parseFloat(String(document.getElementById("inCintura").value).replace(",", "."));
        if (v > 40 && v < 250) {
          state.waist[dkey2()] = v;
          save();
          render();
        }
        break;
      }
      case "clearShop":
        state.shop = { sel: [], checked: {} };
        save();
        render();
        break;
      case "resetPlan":
        if (confirm("Repor o plano original?")) {
          if (planEdit === "ferias") state.weekFerias = clone(DEFAULT_WEEK_FERIAS);
          else state.week = clone(DEFAULT_WEEK);
          save(true);
          render();
        }
        break;
      case "test":
        await testNotification();
        break;
      case "apk":
        openApk();
        break;
      case "applyUpd":
        await applyNow();
        break;
      case "checkUpd": {
        const b0 = t;
        b0.textContent = "A verificar\u2026";
        await checkUpdates({ manual: true });
        render();
        break;
      }
      case "testVoz":
        say("Ol\xE1 Lu\xEDs. S\xE9rie um de tr\xEAs. Vai!");
        break;
      case "perm": {
        const r = await setupNotifications();
        notifOk = r.ok;
        save(true);
        render();
        break;
      }
      case "exact":
        await openExactAlarmSettings();
        break;
      case "export": {
        const ta = document.getElementById("backup");
        ta.value = JSON.stringify(state);
        ta.select();
        try {
          await navigator.clipboard.writeText(ta.value);
        } catch {
        }
        break;
      }
      case "import": {
        try {
          const v = JSON.parse(document.getElementById("backup").value);
          if (!v.settings || !v.week) throw new Error();
          if (confirm("Substituir os dados atuais pela c\xF3pia?")) {
            localStorage.setItem(KEY, JSON.stringify(v));
            state = load();
            save(true);
            render();
          }
        } catch {
          alert("Texto inv\xE1lido.");
        }
        break;
      }
    }
  });
  app.addEventListener("change", (e) => {
    const t = e.target, d = t.dataset;
    if (d.check) {
      const [k, sl, i] = d.check.split("|");
      const l = slotLog(k, sl);
      const n = Number(i);
      if (t.checked) {
        if (!l.checks.includes(n)) l.checks.push(n);
      } else l.checks = l.checks.filter((x) => x !== n);
      l.s = profile(state, fromKey(k)).week[fromKey(k).getDay()][sl].s;
      if (l.checks.length === SESSIONS[l.s].items.length) l.done = true;
      save();
      render();
    } else if (d.buy) {
      state.shop.checked[d.buy] = t.checked;
      save();
    } else if (d.planT) {
      const [day, sl] = d.planT.split("|");
      planWeek()[day][sl].t = t.value;
      save(true);
      render();
    } else if (d.planS) {
      const [day, sl] = d.planS.split("|");
      planWeek()[day][sl].s = t.value;
      save(true);
      render();
    } else if (d.set) {
      const k = d.set;
      let v;
      if (t.type === "checkbox") v = t.checked;
      else if (t.type === "number" || k === "aguaIntervalo" || k === "cinturaDia") v = t.value === "" ? "" : Number(t.value);
      else v = t.value;
      state.settings[k] = v;
      if (k === "voz") setVoice(!!v);
      save(true);
    }
  });
  onAction((a) => {
    const n = a.notification, extra = n.extra || {};
    if (extra.kind === "apk") {
      openApk();
      return;
    }
    if (a.actionId === "drink") addWater(state.settings.copoMl);
    else if (a.actionId === "done" && extra.slot) {
      const k = dkey2(), l = slotLog(k, extra.slot);
      l.done = true;
      l.s = profile(state).week[(/* @__PURE__ */ new Date()).getDay()][extra.slot].s;
      l.checks = SESSIONS[l.s].items.map((_, i) => i);
      save();
    } else if (extra.kind) tab = "hoje";
    render();
  });
  document.addEventListener("visibilitychange", async () => {
    if (!document.hidden) {
      exactStatus = await exactAlarmStatus();
      const tz = (/* @__PURE__ */ new Date()).getTimezoneOffset();
      if (tz !== lastTz || Date.now() - lastSchedAt > 6 * 36e5) {
        lastTz = tz;
        lastSchedAt = Date.now();
        scheduleSoon();
      }
      if (Date.now() - status.lastCheck > 3 * 36e5) checkUpdates().then(render);
      render();
    }
  });
  (async function init() {
    setVoice(state.settings.voz !== false);
    appReady();
    render();
    startAnimLoop();
    try {
      const r = await setupNotifications();
      notifOk = r.ok !== false || r.reason === "web";
      exactStatus = await exactAlarmStatus();
      lastSched = await rescheduleAll(state);
    } catch (e) {
      lastSched = { error: String(e) };
    }
    render();
    await checkUpdates();
    render();
  })();
})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
