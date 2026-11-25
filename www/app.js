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

  // node_modules/@capacitor/local-notifications/dist/esm/web.js
  var web_exports = {};
  __export(web_exports, {
    LocalNotificationsWeb: () => LocalNotificationsWeb
  });
  var LocalNotificationsWeb;
  var init_web = __esm({
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
      note: "Aquecimento de 5\u20138 min primeiro. Descanso de 60\u201390 s entre s\xE9ries.",
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
      note: "Descanso de 60 s entre s\xE9ries.",
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
      note: "Alternar 2 min a andar com 1 min a correr devagar. Lembre-se da altitude do Lubango: ritmo confort\xE1vel.",
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
  var DETOX_NOTE = 'Sobre "detox": quem desintoxica o corpo s\xE3o o f\xEDgado e os rins. Estes ch\xE1s n\xE3o queimam gordura sozinhos. Ajudam porque hidratam, aliviam o incha\xE7o e substituem cerveja, refrigerantes e sumos a\xE7ucarados \u2014 e isso faz muita diferen\xE7a.';
  var RECIPES = [
    {
      id: "papas",
      name: "Papas de aveia com banana e ginguba",
      meal: "Pequeno-almo\xE7o",
      time: "10 min",
      serves: 1,
      ing: [
        { q: "40 g", i: "Aveia", c: "mercearia" },
        { q: "200 ml", i: "Leite (ou \xE1gua)", c: "lacticinios" },
        { q: "1", i: "Banana", c: "frescos" },
        { q: "1 c. sopa", i: "Ginguba torrada sem sal", c: "mercearia" },
        { q: "q.b.", i: "Canela", c: "mercearia" }
      ],
      steps: ["Cozer a aveia no leite 4\u20135 min, mexendo.", "Servir com a banana \xE0s rodelas, a ginguba picada e canela."],
      tip: "Sem a\xE7\xFAcar: a banana j\xE1 ado\xE7a."
    },
    {
      id: "omelete",
      name: "Omelete de gimboa e tomate",
      meal: "Pequeno-almo\xE7o / jantar",
      time: "10 min",
      serves: 1,
      ing: [
        { q: "3", i: "Ovos", c: "lacticinios" },
        { q: "1 m\xE3o", i: "Gimboa (ou espinafre)", c: "frescos" },
        { q: "\xBD", i: "Cebola", c: "frescos" },
        { q: "1", i: "Tomate", c: "frescos" },
        { q: "1 c. ch\xE1", i: "\xD3leo", c: "mercearia" }
      ],
      steps: ["Saltear a cebola e a gimboa picadas no \xF3leo 3 min.", "Juntar os ovos batidos com sal e o tomate em cubos.", "Cozinhar em lume brando e dobrar."],
      tip: "Muita prote\xEDna e quase sem hidratos."
    },
    {
      id: "cacusso",
      name: "Cacusso grelhado com batata-doce e salada",
      meal: "Almo\xE7o / jantar",
      time: "35 min",
      serves: 1,
      ing: [
        { q: "1 m\xE9dio", i: "Cacusso (til\xE1pia)", c: "proteina" },
        { q: "1 m\xE9dia", i: "Batata-doce", c: "frescos" },
        { q: "1", i: "Lim\xE3o", c: "frescos" },
        { q: "2 dentes", i: "Alho", c: "frescos" },
        { q: "\xBD p\xE9", i: "Alface", c: "frescos" },
        { q: "1", i: "Tomate", c: "frescos" },
        { q: "\xBD", i: "Pepino", c: "frescos" }
      ],
      steps: ["Temperar o cacusso com alho, lim\xE3o e sal 15 min.", "Cozer ou assar a batata-doce com casca.", "Grelhar o peixe 5\u20136 min de cada lado.", "Servir com salada de alface, tomate e pepino."],
      tip: "Metade do prato salada, \xBC peixe, \xBC batata-doce."
    },
    {
      id: "carapau",
      name: "Carapau no forno com legumes",
      meal: "Almo\xE7o / jantar",
      time: "40 min",
      serves: 2,
      ing: [
        { q: "4", i: "Carapau", c: "proteina" },
        { q: "1", i: "Cebola", c: "frescos" },
        { q: "1", i: "Pimento", c: "frescos" },
        { q: "2", i: "Tomate", c: "frescos" },
        { q: "2", i: "Cenoura", c: "frescos" },
        { q: "3 dentes", i: "Alho", c: "frescos" },
        { q: "1", i: "Lim\xE3o", c: "frescos" },
        { q: "1 c. sopa", i: "\xD3leo", c: "mercearia" }
      ],
      steps: ["Forrar o tabuleiro com cebola, pimento, tomate e cenoura \xE0s rodelas.", "P\xF4r o carapau por cima, temperado com alho, lim\xE3o e sal.", "Regar com o \xF3leo e levar ao forno a 200 \xB0C, 25\u201330 min."],
      tip: "Peixe barato, rico em \xF3mega-3."
    },
    {
      id: "frango-feijao",
      name: "Frango grelhado com feij\xE3o e couve",
      meal: "Almo\xE7o",
      time: "25 min",
      serves: 1,
      ing: [
        { q: "150 g", i: "Peito de frango", c: "proteina" },
        { q: "\xBD ch\xE1vena", i: "Feij\xE3o cozido", c: "mercearia" },
        { q: "3 folhas", i: "Couve", c: "frescos" },
        { q: "2 dentes", i: "Alho", c: "frescos" },
        { q: "1", i: "Lim\xE3o", c: "frescos" },
        { q: "opcional", i: "Jindungo", c: "frescos" }
      ],
      steps: ["Temperar o frango com alho, lim\xE3o, sal e jindungo.", "Grelhar 5\u20136 min de cada lado.", "Saltear a couve cortada fina 3 min e juntar o feij\xE3o para aquecer."],
      tip: "O feij\xE3o d\xE1 fibra e saciedade \u2014 mas se inchar, comece com pouco."
    },
    {
      id: "atum-frade",
      name: "Salada de atum com feij\xE3o-frade",
      meal: "Almo\xE7o r\xE1pido",
      time: "10 min",
      serves: 1,
      ing: [
        { q: "1 lata", i: "Atum ao natural", c: "proteina" },
        { q: "1 ch\xE1vena", i: "Feij\xE3o-frade cozido", c: "mercearia" },
        { q: "\xBD", i: "Cebola", c: "frescos" },
        { q: "1", i: "Tomate", c: "frescos" },
        { q: "q.b.", i: "Coentros ou salsa", c: "frescos" },
        { q: "1", i: "Lim\xE3o", c: "frescos" }
      ],
      steps: ["Misturar o atum escorrido, o feij\xE3o-frade, a cebola e o tomate picados.", "Temperar com lim\xE3o, sal e coentros."],
      tip: "\xD3tima para levar para o trabalho."
    },
    {
      id: "sopa",
      name: "Sopa de ab\xF3bora e cenoura",
      meal: "Entrada / jantar leve",
      time: "30 min",
      serves: 4,
      ing: [
        { q: "500 g", i: "Ab\xF3bora", c: "frescos" },
        { q: "3", i: "Cenoura", c: "frescos" },
        { q: "1", i: "Cebola", c: "frescos" },
        { q: "2 dentes", i: "Alho", c: "frescos" },
        { q: "1 pequena", i: "Batata", c: "frescos" },
        { q: "q.b.", i: "Couve", c: "frescos" }
      ],
      steps: ["Cozer tudo (menos a couve) em 1,5 L de \xE1gua com sal, 20 min.", "Triturar e juntar couve cortada fina; ferver mais 5 min."],
      tip: "Uma tigela antes do jantar ajuda a comer menos do resto."
    },
    {
      id: "muamba",
      name: "Muamba de galinha leve",
      meal: "Almo\xE7o de fim de semana",
      time: "60 min",
      serves: 4,
      ing: [
        { q: "800 g", i: "Frango sem pele", c: "proteina" },
        { q: "300 g", i: "Quiabo", c: "frescos" },
        { q: "400 g", i: "Ab\xF3bora", c: "frescos" },
        { q: "2", i: "Cebola", c: "frescos" },
        { q: "3", i: "Tomate", c: "frescos" },
        { q: "4 dentes", i: "Alho", c: "frescos" },
        { q: "q.b.", i: "Jindungo", c: "frescos" },
        { q: "2 c. sopa", i: "\xD3leo de palma (dend\xE9m)", c: "mercearia" }
      ],
      steps: ["Refogar a cebola, o alho e o tomate no \xF3leo de palma.", "Juntar o frango e cozinhar 20 min em lume m\xE9dio com um pouco de \xE1gua.", "Juntar a ab\xF3bora e o quiabo e cozinhar mais 20 min."],
      tip: "Menos dend\xE9m do que o habitual e frango sem pele. Com funge: uma concha pequena."
    },
    {
      id: "kizaca",
      name: "Kizaca com peixe grelhado",
      meal: "Almo\xE7o / jantar",
      time: "45 min",
      serves: 2,
      ing: [
        { q: "400 g", i: "Folha de mandioca pisada (kizaca)", c: "frescos" },
        { q: "1", i: "Cebola", c: "frescos" },
        { q: "2", i: "Tomate", c: "frescos" },
        { q: "3 dentes", i: "Alho", c: "frescos" },
        { q: "2 c. sopa", i: "Ginguba mo\xEDda", c: "mercearia" },
        { q: "400 g", i: "Peixe (cacusso, carapau ou corvina)", c: "proteina" }
      ],
      steps: ["Cozer a kizaca 20\u201325 min.", "Refogar cebola, alho e tomate com pouco \xF3leo, juntar a kizaca e a ginguba mo\xEDda; 10 min.", "Servir com o peixe grelhado."],
      tip: "Folhas verdes \xE0 vontade; a ginguba em pouca quantidade."
    },
    {
      id: "batido",
      name: "Batido de papaia e aveia",
      meal: "Lanche / p\xF3s-treino",
      time: "5 min",
      serves: 1,
      ing: [
        { q: "1 fatia grande", i: "Papaia", c: "frescos" },
        { q: "2 c. sopa", i: "Aveia", c: "mercearia" },
        { q: "1", i: "Iogurte natural", c: "lacticinios" },
        { q: "100 ml", i: "\xC1gua ou leite", c: "lacticinios" }
      ],
      steps: ["Triturar tudo com gelo."],
      tip: "A papaia \xE9 \xF3tima para o tr\xE2nsito intestinal."
    },
    {
      id: "ovos-abacate",
      name: "Ovos cozidos com abacate e tomate",
      meal: "Lanche",
      time: "12 min",
      serves: 1,
      ing: [
        { q: "2", i: "Ovos", c: "lacticinios" },
        { q: "\xBD", i: "Abacate", c: "frescos" },
        { q: "1", i: "Tomate", c: "frescos" },
        { q: "\xBD", i: "Lim\xE3o", c: "frescos" }
      ],
      steps: ["Cozer os ovos 10 min.", "Servir com abacate e tomate \xE0s fatias, lim\xE3o e sal."],
      tip: "Mata a fome at\xE9 ao jantar e evita o petisco com a cerveja."
    },
    {
      id: "feijoada",
      name: "Feijoada leve com legumes",
      meal: "Almo\xE7o",
      time: "35 min",
      serves: 3,
      ing: [
        { q: "3 ch\xE1venas", i: "Feij\xE3o cozido", c: "mercearia" },
        { q: "2", i: "Cenoura", c: "frescos" },
        { q: "4 folhas", i: "Couve", c: "frescos" },
        { q: "1", i: "Cebola", c: "frescos" },
        { q: "2", i: "Tomate", c: "frescos" },
        { q: "3 dentes", i: "Alho", c: "frescos" },
        { q: "300 g", i: "Peito de frango", c: "proteina" }
      ],
      steps: ["Refogar cebola, alho e tomate com pouco \xF3leo.", "Juntar o frango aos cubos e a cenoura; 10 min.", "Juntar o feij\xE3o, um pouco de \xE1gua e a couve; 15 min."],
      tip: "Sem chouri\xE7o nem toucinho \u2014 o sabor vem do refogado."
    },
    {
      id: "frango-manga",
      name: "Salada de frango com manga",
      meal: "Jantar",
      time: "20 min",
      serves: 1,
      ing: [
        { q: "120 g", i: "Peito de frango", c: "proteina" },
        { q: "\xBD", i: "Manga", c: "frescos" },
        { q: "\xBD p\xE9", i: "Alface", c: "frescos" },
        { q: "\xBD", i: "Cebola", c: "frescos" },
        { q: "1", i: "Lim\xE3o", c: "frescos" }
      ],
      steps: ["Grelhar o frango e cortar em tiras.", "Misturar com alface, manga em cubos e cebola fina.", "Temperar com lim\xE3o, sal e um fio de \xF3leo."],
      tip: "Jantar leve depois do treino da noite."
    }
  ];
  var CAT_NAMES = {
    frescos: "Frescos (fruta e legumes)",
    proteina: "Peixe e carne",
    lacticinios: "Ovos e lactic\xEDnios",
    mercearia: "Mercearia"
  };
  var BEER_TIPS = [
    "Beba primeiro 500 ml de \xE1gua ou infus\xE3o gelada. Muitas vezes \xE9 sede, n\xE3o vontade de cerveja.",
    "Coma algo antes (ovos, fruta, ginguba): de est\xF4mago vazio bebe-se mais e mais depressa.",
    "Alterne: cerveja, \xE1gua, cerveja.",
    "Escolha dias sem cerveja na semana (ex.: segunda a quinta) em vez de cortar tudo de uma vez.",
    "Garrafa pequena em vez de grande. Cerveja sem \xE1lcool tamb\xE9m conta como boa troca.",
    "Cada cerveja de 330 ml tem cerca de 140 kcal \u2014 4 por dia s\xE3o quase uma refei\xE7\xE3o extra."
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
    const tick = (now) => {
      if (now - last > 33) {
        last = now;
        document.querySelectorAll("svg[data-anim]").forEach((svg) => {
          const a = ANIMS[svg.dataset.anim];
          if (!a) return;
          svg.innerHTML = drawFrame(svg.dataset.anim, now / a.dur);
        });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // src/notify.js
  init_dist();

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
    web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.LocalNotificationsWeb())
  });

  // src/notify.js
  var isNative = () => Capacitor.isNativePlatform();
  var CHANNELS = [
    { id: "treino", name: "Treinos", description: "Lembretes de treino" },
    { id: "agua", name: "\xC1gua", description: "Lembretes para beber \xE1gua" },
    { id: "peso", name: "Peso e cintura", description: "Registo de peso e cintura" },
    { id: "cerveja", name: "Fim do trabalho", description: "Troca da primeira cerveja" },
    { id: "chas", name: "Ch\xE1s e infus\xF5es", description: "Sugest\xF5es de ch\xE1s" }
  ];
  var parseT = (t) => {
    const [h, m] = t.split(":").map(Number);
    return { h, m };
  };
  var minus = (t, mins) => {
    let { h, m } = parseT(t);
    let total = h * 60 + m - mins;
    if (total < 0) total += 1440;
    return { h: Math.floor(total / 60), m: total % 60 };
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
  function buildNotifications(state2) {
    const s = state2.settings;
    const list = [];
    const base = { allowWhileIdle: true };
    if (s.notifTreino) {
      for (let d = 0; d < 7; d++) {
        for (const slot of ["am", "pm"]) {
          const day = state2.week[d][slot];
          if (!day || day.s === "REST") continue;
          const ses = SESSIONS[day.s];
          const { h, m } = minus(day.t, s.treinoAntes);
          list.push({
            id: 1e3 + d * 10 + (slot === "am" ? 1 : 2),
            title: `${slot === "am" ? "\u{1F305}" : parseInt(day.t) < 17 ? "\u2600\uFE0F" : "\u{1F319}"} ${ses.title}`,
            body: `\xC0s ${day.t} \xB7 ${ses.dur} \xB7 ${ses.place}`,
            channelId: "treino",
            actionTypeId: "TREINO",
            extra: { kind: "treino", slot },
            schedule: { ...base, on: { weekday: d + 1, hour: h, minute: m } }
          });
        }
      }
    }
    if (s.notifAgua) {
      const a = parseT(s.aguaInicio).h * 60 + parseT(s.aguaInicio).m;
      const b = parseT(s.aguaFim).h * 60 + parseT(s.aguaFim).m;
      let i = 0;
      for (let t = a; t <= b && i < 40; t += s.aguaIntervalo, i++) {
        list.push({
          id: 2e3 + i,
          title: "\u{1F4A7} Hora de beber \xE1gua",
          body: `Um copo de ${s.copoMl} ml. Meta de hoje: ${(s.metaAgua / 1e3).toFixed(1).replace(".", ",")} L.`,
          channelId: "agua",
          actionTypeId: "AGUA",
          extra: { kind: "agua" },
          schedule: { ...base, on: { hour: Math.floor(t / 60), minute: t % 60 } }
        });
      }
    }
    if (s.notifPeso) {
      const p = parseT(s.pesoHora);
      list.push({
        id: 3001,
        title: "\u2696\uFE0F Pesagem di\xE1ria",
        body: "Em jejum, depois da casa de banho e antes de beber \xE1gua.",
        channelId: "peso",
        extra: { kind: "peso" },
        schedule: { ...base, on: { hour: p.h, minute: p.m } }
      });
      const c = minus(s.pesoHora, -1);
      list.push({
        id: 3002,
        title: "\u{1F4CF} Medir a cintura",
        body: "Fita m\xE9trica \xE0 altura do umbigo, barriga relaxada, a expirar.",
        channelId: "peso",
        extra: { kind: "cintura" },
        schedule: { ...base, on: { weekday: Number(s.cinturaDia) + 1, hour: c.h, minute: c.m } }
      });
    }
    if (s.notifCerveja) {
      for (let d = 1; d <= 6; d++) {
        const t = parseT(d === 6 ? s.cervejaSabado : s.cervejaHora);
        list.push({
          id: 4e3 + d,
          title: "\u{1F37A} Antes da cerveja\u2026",
          body: "500 ml de \xE1gua ou infus\xE3o gelada primeiro. Depois decide.",
          channelId: "cerveja",
          extra: { kind: "cerveja" },
          schedule: { ...base, on: { weekday: d + 1, hour: t.h, minute: t.m } }
        });
      }
    }
    if (s.notifChas) {
      const m = parseT(s.chaManha), n = parseT(s.chaNoite);
      list.push({
        id: 5001,
        title: "\u{1F375} Ch\xE1 da manh\xE3",
        body: "Ch\xE1 verde, gengibre ou moringa \u2014 sem a\xE7\xFAcar.",
        channelId: "chas",
        extra: { kind: "cha" },
        schedule: { ...base, on: { hour: m.h, minute: m.m } }
      });
      list.push({
        id: 5002,
        title: "\u{1F33F} Infus\xE3o da noite",
        body: "Camomila, erva-pr\xEDncipe ou funcho. Ajuda a dormir e a desinchar.",
        channelId: "chas",
        extra: { kind: "cha" },
        schedule: { ...base, on: { hour: n.h, minute: n.m } }
      });
    }
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
    metaPeso: ""
  };
  var clone = (o) => JSON.parse(JSON.stringify(o));
  function load() {
    let s = null;
    try {
      s = JSON.parse(localStorage.getItem(KEY));
    } catch {
    }
    s = s || {};
    return {
      week: s.week || clone(DEFAULT_WEEK),
      settings: { ...DEFAULT_SETTINGS, ...s.settings || {} },
      water: s.water || {},
      weight: s.weight || {},
      waist: s.waist || {},
      beer: s.beer || {},
      log: s.log || {},
      shop: s.shop || { sel: [], checked: {} }
    };
  }
  var state = load();
  function save(resched = false) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
    }
    if (resched) scheduleSoon();
  }
  var schedTimer = null;
  var lastSched = null;
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
  var pad = (n) => String(n).padStart(2, "0");
  var dkey = (d = /* @__PURE__ */ new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  };
  var MONTHS = ["janeiro", "fevereiro", "mar\xE7o", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var num = (v, dec = 1) => Number(v).toFixed(dec).replace(".", ",");
  var waterToday = () => state.water[dkey()] || 0;
  function addWater(ml) {
    const k = dkey();
    state.water[k] = Math.max(0, (state.water[k] || 0) + ml);
    save();
  }
  function beerWeek(monday = mondayOf()) {
    let t = 0;
    for (let i = 0; i < 7; i++) t += state.beer[dkey(addDays(monday, i))] || 0;
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
    if (!dayDone(dkey(d))) d = addDays(d, -1);
    while (dayDone(dkey(d))) {
      n++;
      d = addDays(d, -1);
    }
    return n;
  }
  function avg7(endKey) {
    const end = fromKey(endKey);
    const vals = [];
    for (let i = 0; i < 7; i++) {
      const v = state.weight[dkey(addDays(end, -i))];
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
    const pad2 = (max - min) * 0.1;
    min -= pad2;
    max += pad2;
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
    ${isOpen ? `<div class="ses-b"><p class="note">${ses.note}</p>
      ${ses.items.map((it, i) => `<div class="ex"><div class="ex-row"><label class="chk"><input type="checkbox" ${editable ? "" : "disabled"} data-check="${k}|${slot}|${i}" ${lg.checks.includes(i) ? "checked" : ""}><span>${it}</span></label>${animBtn(it, `an-${id}-${i}`)}</div>${animBox(it, `an-${id}-${i}`)}</div>`).join("")}
      ${editable ? `<button class="btn ${lg.done ? "ghost" : ""}" data-done="${k}|${slot}">${lg.done ? "Desmarcar" : "Marcar treino como feito"}</button>` : ""}
    </div>` : ""}
  </div>`;
  }
  function banners() {
    let b = "";
    if (isNative() && !notifOk) b += `<div class="warn">As notifica\xE7\xF5es est\xE3o desligadas. <button class="link" data-act="perm">Ativar</button></div>`;
    if (isNative() && exactStatus !== "granted") b += `<div class="warn">Para os alarmes tocarem \xE0 hora certa, permita "Alarmes e lembretes". <button class="link" data-act="exact">Abrir defini\xE7\xE3o</button></div>`;
    return b;
  }
  function vHoje() {
    var _a;
    const now = /* @__PURE__ */ new Date(), k = dkey(now), cfg = state.week[now.getDay()];
    const s = state.settings;
    const w = waterToday(), pct = Math.min(100, Math.round(w / s.metaAgua * 100));
    const hr = now.getHours();
    const greet = hr < 12 ? "Bom dia" : hr < 19 ? "Boa tarde" : "Boa noite";
    const wt = state.weight[k];
    const prevKeys = sortedKeys(state.weight).filter((x) => x < k);
    const last = prevKeys.length ? state.weight[prevKeys[prevKeys.length - 1]] : null;
    const a7 = avg7(k), a7prev = avg7(dkey(addDays(now, -7)));
    const monday = dkey(mondayOf());
    const waistThisWeek = sortedKeys(state.waist).filter((x) => x >= monday);
    const showWaist = now.getDay() === Number(s.cinturaDia) || !waistThisWeek.length;
    const bw = beerWeek(), bt = state.beer[k] || 0;
    const tip = BEER_TIPS[now.getDate() % BEER_TIPS.length];
    const tea = hr < 12 ? TEAS[0] : hr < 16 ? TEAS[6] : hr < 19 ? TEAS[10] : TEAS[hr < 21 ? 5 : 4];
    const st = streak();
    return `<header><div><h1>${greet}, ${s.nome}</h1><div class="muted">${DAY_NAMES[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}</div></div>
    <div class="streak" title="Dias seguidos com treino">\u{1F525} ${st}</div></header>
    ${banners()}
    <section class="card"><h2>Treino de hoje</h2>${sessionCard(k, "am", cfg.am)}${sessionCard(k, "pm", cfg.pm)}</section>
    <section class="card"><h2>\u{1F4A7} \xC1gua <span class="right">${num(w / 1e3, 2)} / ${num(s.metaAgua / 1e3, 1)} L</span></h2>
      <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%"></div></div>
      <div class="row"><button class="btn sm ghost" data-water="-${s.copoMl}">\u2212${s.copoMl}</button><button class="btn sm" data-water="${s.copoMl}">+ copo ${s.copoMl} ml</button><button class="btn sm" data-water="500">+ garrafa 500 ml</button></div>
      <p class="muted small">Ch\xE1 e infus\xF5es sem a\xE7\xFAcar tamb\xE9m contam.</p></section>
    <section class="card"><h2>\u2696\uFE0F Peso de hoje</h2>
      <div class="row"><input id="inPeso" type="number" inputmode="decimal" step="0.1" placeholder="kg" value="${wt != null ? wt : ""}"><button class="btn sm" data-act="savePeso">Guardar</button></div>
      <p class="muted small">${a7 ? `M\xE9dia 7 dias: <b>${num(a7)} kg</b>${a7prev ? ` (${a7 - a7prev <= 0 ? "" : "+"}${num(a7 - a7prev)} vs. semana anterior)` : ""}` : last ? `\xDAltimo: ${num(last)} kg` : "O peso oscila de dia para dia \u2014 o que conta \xE9 a m\xE9dia semanal."}</p>
      ${showWaist ? `<h3>\u{1F4CF} Cintura (semanal)</h3><div class="row"><input id="inCintura" type="number" inputmode="decimal" step="0.5" placeholder="cm" value="${(_a = state.waist[k]) != null ? _a : ""}"><button class="btn sm" data-act="saveCintura">Guardar</button></div>
      <p class="muted small">\xC0 altura do umbigo, barriga relaxada, a expirar.</p>` : ""}
    </section>
    <section class="card"><h2>\u{1F37A} Cerveja <span class="right ${bw > s.metaCerveja ? "bad" : ""}">${bw} / ${s.metaCerveja} esta semana</span></h2>
      <div class="row"><button class="btn sm ghost" data-beer="-1">\u22121</button><div class="big">${bt} hoje</div><button class="btn sm" data-beer="1">+1</button></div>
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
      const d = addDays(start, i), k = dkey(d), l = state.log[k] || {};
      const c = (l.am && l.am.done ? 1 : 0) + (l.pm && l.pm.done ? 1 : 0);
      cells += `<div class="cell c${c} ${k === dkey() ? "today" : ""} ${d > today ? "fut" : ""}" title="${fmtShort(k)}">${d.getDate()}</div>`;
    }
    let weekDone = 0, weekPlanned = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(mondayOf(), i), l = state.log[dkey(d)] || {}, cfg = state.week[d.getDay()];
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
  <section class="card"><h2>Plano semanal</h2><p class="muted small">Toque num dia para editar a sess\xE3o ou a hora. Os alarmes atualizam-se sozinhos.</p>
    ${order.map((d) => {
      const c = state.week[d], id = `plan-${d}`;
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
      const l = state.log[k], c = state.week[fromKey(k).getDay()];
      const parts = ["am", "pm"].filter((sl) => l[sl] && l[sl].done).map((sl) => SESSIONS[l[sl].s || c[sl].s].title.split(" \u2014")[0]);
      return `<div class="hist"><span>${DAY_NAMES[fromKey(k).getDay()].slice(0, 3)} ${fmtShort(k)}</span><span>${parts.join(" + ")}</span></div>`;
    }).join("") : '<p class="muted">Ainda sem treinos registados. O primeiro \xE9 o mais dif\xEDcil \u{1F4AA}</p>'}</section>`;
  }
  function vProg() {
    const s = state.settings;
    const wk = sortedKeys(state.weight);
    const since = dkey(addDays(/* @__PURE__ */ new Date(), -120));
    const series = wk.filter((k) => k >= since).map((k) => ({ k, v: state.weight[k] }));
    const avgS = series.map((p) => ({ k: p.k, v: avg7(p.k) }));
    const first = wk.length ? state.weight[wk[0]] : null;
    const cur = wk.length ? avg7(wk[wk.length - 1]) : null;
    const ck = sortedKeys(state.waist);
    const cSeries = ck.map((k) => ({ k, v: state.waist[k] }));
    const waterBars = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(/* @__PURE__ */ new Date(), -i), v = state.water[dkey(d)] || 0;
      waterBars.push({ v: v / 1e3, label: DAY_NAMES[d.getDay()].slice(0, 3), label2: num(v / 1e3, 1) });
    }
    const beerBars = [];
    for (let i = 7; i >= 0; i--) {
      const m = addDays(mondayOf(), -7 * i), v = beerWeek(m);
      beerBars.push({ v, label: fmtShort(dkey(m)), over: v > s.metaCerveja });
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
  <section class="card"><h2>\u{1F37A} Cerveja por semana</h2>${barChart(beerBars, { goal: s.metaCerveja })}<p class="muted small">A linha \xE9 a sua meta semanal (${s.metaCerveja}).</p></section>`;
  }
  function vNutri() {
    const sub = { chas: "Ch\xE1s", receitas: "Receitas", compras: "Compras" };
    let body = "";
    if (nutriTab === "chas") {
      body = `<p class="note">${DETOX_NOTE}</p>${TEAS.map((t) => `<section class="card tea"><b>${t.name}</b><div class="muted small">\u23F0 ${t.when}</div><p class="small">${t.good}</p><p class="muted small">\u{1FAD6} ${t.how}</p></section>`).join("")}`;
    } else if (nutriTab === "receitas") {
      body = `<p class="muted small">Ingredientes f\xE1ceis de encontrar em Angola. Regra do prato: \xBD legumes, \xBC prote\xEDna, \xBC hidratos (funge, arroz, batata-doce, mandioca).</p>` + RECIPES.map((r) => {
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
        for (const ing of r.ing) {
          agg[ing.c] = agg[ing.c] || {};
          agg[ing.c][ing.i] = agg[ing.c][ing.i] || [];
          agg[ing.c][ing.i].push(ing.q);
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
    ${tg("notifCerveja", "\u{1F37A} Lembrete antes da cerveja")}${tm("cervejaHora", "Seg\u2013Sex")}${tm("cervejaSabado", "S\xE1bado")}
    ${tg("notifChas", "\u{1F375} Ch\xE1s")}${tm("chaManha", "Ch\xE1 da manh\xE3")}${tm("chaNoite", "Infus\xE3o da noite")}
    <p class="muted small">${lastSched ? lastSched.error ? `Erro ao agendar: ${lastSched.error}` : `${lastSched.count} lembretes agendados${lastSched.web ? " (pr\xE9-visualiza\xE7\xE3o web)" : ""}${lastSched.warning ? " \u2014 sem permiss\xE3o de alarme exato, podem atrasar" : ""}.` : ""}</p>
    <button class="btn" data-act="test">Enviar notifica\xE7\xE3o de teste (5 s)</button></section>
  <section class="card"><h2>Metas</h2>${nm("metaAgua", "\xC1gua por dia (ml)", 250)}${nm("copoMl", "Tamanho do copo (ml)", 50)}${nm("metaCerveja", "Cervejas por semana (m\xE1x.)")}${nm("metaPeso", "Peso objetivo (kg)", 0.5)}
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
  <p class="muted small center">KillBelly \xB7 os dados ficam s\xF3 no seu telem\xF3vel.</p>`;
  }
  app.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-tab],[data-toggle],[data-done],[data-water],[data-beer],[data-act],[data-nutri],[data-shop],[data-del]");
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
      l.s = state.week[fromKey(k).getDay()][sl].s;
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
    if (d.beer) {
      const k = dkey();
      state.beer[k] = Math.max(0, (state.beer[k] || 0) + Number(d.beer));
      save();
      render();
      return;
    }
    if (d.nutri) {
      nutriTab = d.nutri;
      render();
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
          state.weight[dkey()] = Math.round(v * 10) / 10;
          save();
          render();
        }
        break;
      }
      case "saveCintura": {
        const v = parseFloat(String(document.getElementById("inCintura").value).replace(",", "."));
        if (v > 40 && v < 250) {
          state.waist[dkey()] = v;
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
        if (confirm("Repor o plano semanal original?")) {
          state.week = clone(DEFAULT_WEEK);
          save(true);
          render();
        }
        break;
      case "test":
        await testNotification();
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
      l.s = state.week[fromKey(k).getDay()][sl].s;
      if (l.checks.length === SESSIONS[l.s].items.length) l.done = true;
      save();
      render();
    } else if (d.buy) {
      state.shop.checked[d.buy] = t.checked;
      save();
    } else if (d.planT) {
      const [day, sl] = d.planT.split("|");
      state.week[day][sl].t = t.value;
      save(true);
      render();
    } else if (d.planS) {
      const [day, sl] = d.planS.split("|");
      state.week[day][sl].s = t.value;
      save(true);
      render();
    } else if (d.set) {
      const k = d.set;
      let v;
      if (t.type === "checkbox") v = t.checked;
      else if (t.type === "number" || k === "aguaIntervalo" || k === "cinturaDia") v = t.value === "" ? "" : Number(t.value);
      else v = t.value;
      state.settings[k] = v;
      save(true);
    }
  });
  onAction((a) => {
    const n = a.notification, extra = n.extra || {};
    if (a.actionId === "drink") addWater(state.settings.copoMl);
    else if (a.actionId === "done" && extra.slot) {
      const k = dkey(), l = slotLog(k, extra.slot);
      l.done = true;
      l.s = state.week[(/* @__PURE__ */ new Date()).getDay()][extra.slot].s;
      l.checks = SESSIONS[l.s].items.map((_, i) => i);
      save();
    } else if (extra.kind) tab = "hoje";
    render();
  });
  document.addEventListener("visibilitychange", async () => {
    if (!document.hidden) {
      exactStatus = await exactAlarmStatus();
      render();
    }
  });
  (async function init() {
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
  })();
})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
