var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-4AmPiU/bundledWorker-0.39261246336958844.mjs
import { Writable } from "node:stream";
import { EventEmitter } from "node:events";
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
__name2(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name2(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
__name2(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");
__name2(notImplementedClass, "notImplementedClass");
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  static {
    __name2(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark2");
  }
  static {
    __name2(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  static {
    __name2(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  static {
    __name2(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  static {
    __name2(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  static {
    __name2(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  static {
    __name2(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
var noop_default = Object.assign(() => {
}, { __unenv__: true });
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;
globalThis.console = console_default;
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name2(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime2"), "hrtime"), { bigint: /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint"), "bigint") });
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  static {
    __name2(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  static {
    __name2(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};
var NODE_VERSION = "22.14.0";
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "_Process");
  }
  static {
    __name2(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw /* @__PURE__ */ createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name2(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;
globalThis.process = process_default;
var Q = Object.defineProperty;
var u = /* @__PURE__ */ __name2((t, n) => Q(t, "name", { value: n, configurable: true }), "u");
var N = [{ id: 10000067, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-10-04 09:00:00", end_date: "2026-10-04 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-10-04/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000875, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-10-04 11:30:00", end_date: "2026-10-04 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-10-04/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000328, title: "Connect Friday", description: "", start_date: "2026-10-09 22:00:00", end_date: "2026-10-09 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-10-09/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000068, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-10-11 09:00:00", end_date: "2026-10-11 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-10-11/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000876, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-10-11 11:30:00", end_date: "2026-10-11 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-10-11/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000329, title: "Connect Friday", description: "", start_date: "2026-10-16 22:00:00", end_date: "2026-10-16 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-10-16/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000069, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-10-18 09:00:00", end_date: "2026-10-18 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-10-18/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000877, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-10-18 11:30:00", end_date: "2026-10-18 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-10-18/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000330, title: "Connect Friday", description: "", start_date: "2026-10-23 22:00:00", end_date: "2026-10-23 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-10-23/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000070, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-10-25 09:00:00", end_date: "2026-10-25 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-10-25/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000878, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-10-25 11:30:00", end_date: "2026-10-25 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-10-25/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000331, title: "Connect Friday", description: "", start_date: "2026-10-30 22:00:00", end_date: "2026-10-30 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-10-30/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000071, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-11-01 09:00:00", end_date: "2026-11-01 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-11-01/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000879, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-11-01 11:30:00", end_date: "2026-11-01 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-11-01/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000332, title: "Connect Friday", description: "", start_date: "2026-11-06 22:00:00", end_date: "2026-11-06 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-11-06/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000072, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-11-08 09:00:00", end_date: "2026-11-08 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-11-08/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000880, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-11-08 11:30:00", end_date: "2026-11-08 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-11-08/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000333, title: "Connect Friday", description: "", start_date: "2026-11-13 22:00:00", end_date: "2026-11-13 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-11-13/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000073, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-11-15 09:00:00", end_date: "2026-11-15 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-11-15/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000881, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-11-15 11:30:00", end_date: "2026-11-15 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-11-15/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000334, title: "Connect Friday", description: "", start_date: "2026-11-20 22:00:00", end_date: "2026-11-20 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-11-20/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000074, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-11-22 09:00:00", end_date: "2026-11-22 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-11-22/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000882, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-11-22 11:30:00", end_date: "2026-11-22 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-11-22/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000335, title: "Connect Friday", description: "", start_date: "2026-11-27 22:00:00", end_date: "2026-11-27 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-11-27/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000075, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-11-29 09:00:00", end_date: "2026-11-29 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-11-29/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000883, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-11-29 11:30:00", end_date: "2026-11-29 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-11-29/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000336, title: "Connect Friday", description: "", start_date: "2026-12-04 22:00:00", end_date: "2026-12-04 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-12-04/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000076, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-12-06 09:00:00", end_date: "2026-12-06 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-12-06/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000884, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-12-06 11:30:00", end_date: "2026-12-06 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-12-06/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000337, title: "Connect Friday", description: "", start_date: "2026-12-11 22:00:00", end_date: "2026-12-11 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-12-11/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000077, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-12-13 09:00:00", end_date: "2026-12-13 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-12-13/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000885, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-12-13 11:30:00", end_date: "2026-12-13 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-12-13/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000338, title: "Connect Friday", description: "", start_date: "2026-12-18 22:00:00", end_date: "2026-12-18 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-12-18/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000078, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-12-20 09:00:00", end_date: "2026-12-20 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-12-20/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000886, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-12-20 11:30:00", end_date: "2026-12-20 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-12-20/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000339, title: "Connect Friday", description: "", start_date: "2026-12-25 22:00:00", end_date: "2026-12-25 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2026-12-25/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000079, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2026-12-27 09:00:00", end_date: "2026-12-27 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2026-12-27/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000887, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2026-12-27 11:30:00", end_date: "2026-12-27 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2026-12-27/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000340, title: "Connect Friday", description: "", start_date: "2027-01-01 22:00:00", end_date: "2027-01-01 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2027-01-01/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000080, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2027-01-03 09:00:00", end_date: "2027-01-03 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2027-01-03/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000888, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2027-01-03 11:30:00", end_date: "2027-01-03 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2027-01-03/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000341, title: "Connect Friday", description: "", start_date: "2027-01-08 22:00:00", end_date: "2027-01-08 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2027-01-08/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000081, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2027-01-10 09:00:00", end_date: "2027-01-10 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2027-01-10/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000889, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2027-01-10 11:30:00", end_date: "2027-01-10 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2027-01-10/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000342, title: "Connect Friday", description: "", start_date: "2027-01-15 22:00:00", end_date: "2027-01-15 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2027-01-15/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000082, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2027-01-17 09:00:00", end_date: "2027-01-17 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2027-01-17/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000890, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2027-01-17 11:30:00", end_date: "2027-01-17 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2027-01-17/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000343, title: "Connect Friday", description: "", start_date: "2027-01-22 22:00:00", end_date: "2027-01-22 23:30:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/connect-friday/2027-01-22/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000083, title: "Sunday Service", description: "<p>Sunday Service</p>", start_date: "2027-01-24 09:00:00", end_date: "2027-01-24 11:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/sunday-service/2027-01-24/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }, { id: 10000891, title: "2nd Service &#8211; Sunday", description: "<p>Sunday Service</p>", start_date: "2027-01-24 11:30:00", end_date: "2027-01-24 14:00:00", timezone: "Europe/London", url: "https://codcanterburychurch.org/index.php/event/2nd-service-sunday/2027-01-24/", venue: { id: 6116, author: "1", status: "publish", date: "2025-06-22 20:54:09", date_utc: "2025-06-22 19:54:09", modified: "2025-06-22 20:54:09", modified_utc: "2025-06-22 19:54:09", url: "https://codcanterburychurch.org/index.php/venue/function-hall/", venue: "Function Hall", slug: "function-hall", address: "St. John\u2019s Church of England Primary School", city: "Canterbury", country: "United Kingdom", show_map: true, show_map_link: true, global_id: "codcanterburychurch.org?id=6116", global_id_lineage: ["codcanterburychurch.org?id=6116"] } }];
function te(t = /* @__PURE__ */ new Date()) {
  let n = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(t), e = u((r) => n.find((a) => a.type === r).value, "part");
  return `${e("year")}-${e("month")}-${e("day")}`;
}
__name(te, "te");
__name2(te, "te");
u(te, "londonDate");
async function K(t = fetch, n = /* @__PURE__ */ new Date()) {
  let e = te(n), r = N, a = "saved";
  try {
    let i = await t(`https://codcanterburychurch.org/wp-json/tribe/events/v1/events?per_page=50&start_date=${e}`, { signal: AbortSignal.timeout(8e3), headers: { Accept: "application/json" } });
    if (!i.ok) throw new Error("Calendar unavailable");
    let o = await i.json();
    if (!Array.isArray(o.events)) throw new Error("Invalid calendar");
    let c = o.events.filter((d) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(d.start_date) && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(d.end_date) && typeof d.title == "string" && Number.isInteger(d.id) && d.id > 0 && d.timezone === "Europe/London").map((d) => ({ id: d.id, title: d.title.slice(0, 300), start_date: d.start_date, end_date: d.end_date, url: "https://codcanterburychurch.org/events/" }));
    c.length && (r = c, a = "live");
  } catch {
  }
  return { events: r.filter((i) => i.start_date.slice(0, 10) >= e).sort((i, o) => i.start_date.localeCompare(o.start_date)), source: a };
}
__name(K, "K");
__name2(K, "K");
u(K, "getEvents");
function O(t) {
  let n = u((r) => String(r).replaceAll("\\", "\\\\").replaceAll(`
`, "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("\r", ""), "esc"), e = u((r) => r.replaceAll("-", "").replaceAll(":", "").replace(" ", "T"), "date");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//City of David Canterbury//Church Calendar//EN", "CALSCALE:GREGORIAN", ...t.flatMap((r) => ["BEGIN:VEVENT", `UID:cod-${r.id}@codcanterburychurch.org`, `DTSTART;TZID=Europe/London:${e(r.start_date)}`, `DTEND;TZID=Europe/London:${e(r.end_date)}`, `SUMMARY:${n(r.title)}`, "LOCATION:St. John\u2019s Church of England Primary School\\, Canterbury", "END:VEVENT"]), "END:VCALENDAR"].join(`\r
`) + `\r
`;
}
__name(O, "O");
__name2(O, "O");
u(O, "calendar");
async function $({ request: t }) {
  return t.method !== "GET" ? new Response("Method not allowed", { status: 405 }) : Response.json(await K(), { headers: { "cache-control": "public, max-age=300" } });
}
__name($, "$");
__name2($, "$");
u($, "onRequest");
var L = { url: "https://fgkckneijlceqfwkheij.supabase.co", publishableKey: "sb_publishable_F7l0XAPkElrJ38lagPwp0Q_VPvs3-rV", anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZna2NrbmVpamxjZXFmd2toZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNzg5MjQsImV4cCI6MjEwNjk1NDkyNH0.xgfx6NbsuJkYahn0kEuVxPlqoupF8d2DYwOAU1YCYNs" };
async function j({ request: t }) {
  let n = { "content-type": "application/json", "cache-control": "no-store" };
  if (t.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: n });
  let e = t.headers.get("origin");
  if (e && e !== new URL(t.url).origin) return Response.json({ error: "Please use the church website form." }, { status: 403, headers: n });
  if (!t.headers.get("content-type")?.includes("application/json")) return Response.json({ error: "Please use the church website form." }, { status: 415, headers: n });
  if (Number(t.headers.get("content-length")) > 2e4) return Response.json({ error: "Your message is too long." }, { status: 413, headers: n });
  let r = await t.text();
  if (new TextEncoder().encode(r).length > 2e4) return Response.json({ error: "Your message is too long." }, { status: 413, headers: n });
  try {
    let a = await fetch(`${L.url}/functions/v1/church-intake`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${L.anonKey}`, apikey: L.anonKey }, body: r, signal: AbortSignal.timeout(12e3) }), i = await a.json();
    return Response.json(i, { status: a.status, headers: n });
  } catch {
    return Response.json({ error: "Your message was not saved. Please try again or email the church office." }, { status: 503, headers: n });
  }
}
__name(j, "j");
__name2(j, "j");
u(j, "onRequest");
var E = u((t, n) => Response.json(n, { status: t, headers: { "cache-control": "no-store" } }), "json");
var re = /* @__PURE__ */ new Set(["submitted", "in_review", "changes_requested", "approved", "declined", "scheduled", "delivered", "shared"]);
async function q({ request: t, env: n }) {
  let e = { httpMethod: t.method, headers: Object.fromEntries(t.headers), body: t.method === "POST" ? await t.text() : "" };
  if (e.httpMethod !== "POST") return E(405, { error: "Method not allowed" });
  let r = (e.headers?.authorization || e.headers?.Authorization || "").replace(/^Bearer\s+/i, ""), a = L.publishableKey, i = L.url;
  if (!r || !a || !i) return E(401, { error: "Sign in to the church office first." });
  let o;
  try {
    o = JSON.parse(e.body || "{}");
  } catch {
    return E(400, { error: "Invalid review request." });
  }
  if (!/^[0-9a-f-]{36}$/i.test(o.testimony_id || "") || !/^[0-9a-f-]{36}$/i.test(o.review_key || "") || !re.has(o.status)) return E(400, { error: "Invalid review update." });
  let c = { apikey: a, authorization: `Bearer ${r}`, "content-type": "application/json" }, d;
  try {
    let p = await fetch(`${i}/auth/v1/user`, { headers: c });
    if (!p.ok) return E(401, { error: "Your sign-in has expired. Sign in again." });
    d = await p.json();
  } catch {
    return E(503, { error: "Could not verify your church office sign-in." });
  }
  let y = o.status === "in_review" ? "review_started" : o.status === "submitted" ? "reopened" : o.status;
  try {
    let p = await fetch(`${i}/rest/v1/rpc/record_testimony_review`, { method: "POST", headers: c, body: JSON.stringify({ p_testimony_id: o.testimony_id, p_review_key: o.review_key, p_status: o.status, p_action: y, p_member_message: String(o.member_message || "").trim().slice(0, 3e3) || null, p_proposed_wording: String(o.proposed_wording || "").trim().slice(0, 8e3) || null, p_member_confirmed_wording: o.member_confirmed_wording === true }) });
    if (!p.ok) return E(p.status === 401 ? 401 : 403, { error: "Could not save this review. Check your church staff role and try again." });
  } catch {
    return E(503, { error: "The review was not saved. Please try again." });
  }
  let s;
  try {
    s = (await (await fetch(`${i}/rest/v1/testimonies?id=eq.${encodeURIComponent(o.testimony_id)}&select=id,email,full_name,online_sharing_consent,name_sharing_consent`, { headers: c })).json())?.[0];
  } catch {
  }
  if (!s) return E(200, { ok: true, notificationSent: false });
  let h = n.RESEND_API_KEY, f = n.RESEND_FROM;
  if (!h || !f) return E(200, { ok: true, notificationSent: false });
  let g = { in_review: "Your testimony is being reviewed", submitted: "Your testimony review has been reopened", changes_requested: "A note about your testimony submission", approved: "Your testimony has been approved for sharing at a service", declined: "An update on your testimony submission", scheduled: "Your testimony has been scheduled", delivered: "A testimony update from the church team", shared: "An update about your testimony" }, C = { in_review: "The church team has started reviewing your testimony. We will contact you when there is an update.", submitted: "The church team has reopened the review of your testimony.", changes_requested: "The church team has reviewed your testimony and would like to discuss a change before it can be shared at a service.", approved: "The church team has approved your testimony for sharing at a service. This approval does not automatically publish it online.", declined: "The church team has reviewed your testimony and is unable to approve it for sharing at a service at this time.", scheduled: "The church team has scheduled your testimony for sharing at a service.", delivered: "The church team has marked the service testimony process as complete.", shared: "The church team has recorded an online sharing update for your testimony." }, v = false;
  try {
    let p = String(o.proposed_wording || "").trim().slice(0, 8e3);
    v = (await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${h}`, "content-type": "application/json", "Idempotency-Key": `cod-review-${o.review_key}` }, body: JSON.stringify({ from: f, to: [s.email], subject: g[o.status] || "An update about your testimony", text: `Hello ${s.full_name},

${C[o.status] || "The church team has updated the status of your submission."}${o.member_message ? `

A note from the church team:
${String(o.member_message).trim().slice(0, 3e3)}` : ""}${p ? `

Proposed wording for you to review:

${p}

Please reply to confirm or suggest changes. This wording will not be shared online unless you have also given online sharing permission.` : ""}

If you have a question, reply to this email or contact rccgcodcanterbury@gmail.com.

RCCG City of David Canterbury` }) })).ok;
  } catch {
  }
  return E(200, { ok: true, notificationSent: v });
}
__name(q, "q");
__name2(q, "q");
u(q, "onRequest");
var M = [{ id: "VZtbXlE1h3I", title: "Thanksgiving Sunday | First Service | RCCG City of David Canterbury | 4 October 2026", duration: "1:37:00" }, { id: "KLf976yU2nE", title: "Thanksgiving Sunday | Second Service | RCCG City of David Canterbury | 4 October 2026", duration: "1:24:00" }, { id: "yHBNqXx-Cbg", title: "Love Conquers All | Pastor Ossai Chegwe | 13 September 2026", duration: "38:00" }, { id: "coB8luVK36c", title: "Perfect Unity | Pastor Akin Kunlipe | 6 September 2026", duration: "29:00" }, { id: "QVijwAEr-Fo", title: "Living Limitless: Jabez\u2019s Prayer | Pastor Akin Kunlipe | 30 August 2026", duration: "42:00" }, { id: "DKq6mqeMgfU", title: "Live Complete | Pastor Akin Kunlipe | 16 August 2026", duration: "26:00" }];
var z = "UCOBJendA58WmfmZADo_Ey1w";
var V = `https://www.youtube.com/feeds/videos.xml?channel_id=${z}`;
var J = u((t, n) => t.match(new RegExp(`<${n}>([\\s\\S]*?)</${n}>`))?.[1] || "", "value");
function ie(t) {
  return t.replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1").replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (n, e) => {
    let r = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
    if (!e.startsWith("#")) return r[e.toLowerCase()] || n;
    let a = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1));
    return a > 0 && a <= 1114111 && !(a >= 55296 && a <= 57343) ? String.fromCodePoint(a) : "";
  }).trim();
}
__name(ie, "ie");
__name2(ie, "ie");
u(ie, "decode");
function Y(t) {
  if (typeof t != "string" || t.length > 5e5 || !t.includes("<feed")) throw new Error("Invalid YouTube feed");
  let n = /* @__PURE__ */ new Set(), e = [...t.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g)].flatMap(([, r]) => {
    let a = J(r, "yt:videoId"), i = J(r, "yt:channelId"), o = ie(J(r, "title")).slice(0, 300), c = J(r, "published");
    return !/^[\w-]{11}$/.test(a) || i !== z || !o || !Number.isFinite(Date.parse(c)) || n.has(a) ? [] : (n.add(a), [{ id: a, title: o, published: new Date(c).toISOString() }]);
  });
  if (!e.length) throw new Error("No valid channel videos");
  return e.sort((r, a) => Date.parse(a.published) - Date.parse(r.published)).slice(0, 12);
}
__name(Y, "Y");
__name2(Y, "Y");
u(Y, "parseFeed");
async function B({ request: t }) {
  if (t.method !== "GET") return new Response("Method not allowed", { status: 405, headers: { Allow: "GET" } });
  let n = M, e = "saved";
  try {
    let r = await fetch(V, { headers: { Accept: "application/atom+xml" }, signal: AbortSignal.timeout(6e3) });
    if (!r.ok) throw new Error("Feed unavailable");
    n = Y(await r.text()), e = "youtube";
  } catch {
  }
  return Response.json({ videos: n, source: e, channelId: z }, { headers: { "cache-control": `public, max-age=${e === "youtube" ? 300 : 60}`, "x-content-type-options": "nosniff" } });
}
__name(B, "B");
__name2(B, "B");
u(B, "onRequest");
async function G({ request: t }) {
  return t.method !== "GET" ? new Response("Method not allowed", { status: 405 }) : new Response(O((await K()).events), { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": 'attachment; filename="canterbury-events.ics"', "cache-control": "public, max-age=300" } });
}
__name(G, "G");
__name2(G, "G");
u(G, "onRequest");
var w = [{ routePath: "/api/events", mountPath: "/api", method: "", middlewares: [], modules: [$] }, { routePath: "/api/intake", mountPath: "/api", method: "", middlewares: [], modules: [j] }, { routePath: "/api/review-testimony", mountPath: "/api", method: "", middlewares: [], modules: [q] }, { routePath: "/api/youtube-feed", mountPath: "/api", method: "", middlewares: [], modules: [B] }, { routePath: "/events.ics", mountPath: "/", method: "", middlewares: [], modules: [G] }];
function ae(t) {
  for (var n = [], e = 0; e < t.length; ) {
    var r = t[e];
    if (r === "*" || r === "+" || r === "?") {
      n.push({ type: "MODIFIER", index: e, value: t[e++] });
      continue;
    }
    if (r === "\\") {
      n.push({ type: "ESCAPED_CHAR", index: e++, value: t[e++] });
      continue;
    }
    if (r === "{") {
      n.push({ type: "OPEN", index: e, value: t[e++] });
      continue;
    }
    if (r === "}") {
      n.push({ type: "CLOSE", index: e, value: t[e++] });
      continue;
    }
    if (r === ":") {
      for (var a = "", i = e + 1; i < t.length; ) {
        var o = t.charCodeAt(i);
        if (o >= 48 && o <= 57 || o >= 65 && o <= 90 || o >= 97 && o <= 122 || o === 95) {
          a += t[i++];
          continue;
        }
        break;
      }
      if (!a) throw new TypeError("Missing parameter name at ".concat(e));
      n.push({ type: "NAME", index: e, value: a }), e = i;
      continue;
    }
    if (r === "(") {
      var c = 1, d = "", i = e + 1;
      if (t[i] === "?") throw new TypeError('Pattern cannot start with "?" at '.concat(i));
      for (; i < t.length; ) {
        if (t[i] === "\\") {
          d += t[i++] + t[i++];
          continue;
        }
        if (t[i] === ")") {
          if (c--, c === 0) {
            i++;
            break;
          }
        } else if (t[i] === "(" && (c++, t[i + 1] !== "?")) throw new TypeError("Capturing groups are not allowed at ".concat(i));
        d += t[i++];
      }
      if (c) throw new TypeError("Unbalanced pattern at ".concat(e));
      if (!d) throw new TypeError("Missing pattern at ".concat(e));
      n.push({ type: "PATTERN", index: e, value: d }), e = i;
      continue;
    }
    n.push({ type: "CHAR", index: e, value: t[e++] });
  }
  return n.push({ type: "END", index: e, value: "" }), n;
}
__name(ae, "ae");
__name2(ae, "ae");
u(ae, "lexer");
function ue(t, n) {
  n === void 0 && (n = {});
  for (var e = ae(t), r = n.prefixes, a = r === void 0 ? "./" : r, i = n.delimiter, o = i === void 0 ? "/#?" : i, c = [], d = 0, y = 0, s = "", h = u(function(b) {
    if (y < e.length && e[y].type === b) return e[y++].value;
  }, "tryConsume"), f = u(function(b) {
    var m = h(b);
    if (m !== void 0) return m;
    var x = e[y], k = x.type, X = x.index;
    throw new TypeError("Unexpected ".concat(k, " at ").concat(X, ", expected ").concat(b));
  }, "mustConsume"), g = u(function() {
    for (var b = "", m; m = h("CHAR") || h("ESCAPED_CHAR"); ) b += m;
    return b;
  }, "consumeText"), C = u(function(b) {
    for (var m = 0, x = o; m < x.length; m++) {
      var k = x[m];
      if (b.indexOf(k) > -1) return true;
    }
    return false;
  }, "isSafe"), v = u(function(b) {
    var m = c[c.length - 1], x = b || (m && typeof m == "string" ? m : "");
    if (m && !x) throw new TypeError('Must have text between two parameters, missing text after "'.concat(m.name, '"'));
    return !x || C(x) ? "[^".concat(R(o), "]+?") : "(?:(?!".concat(R(x), ")[^").concat(R(o), "])+?");
  }, "safePattern"); y < e.length; ) {
    var p = h("CHAR"), _ = h("NAME"), A = h("PATTERN");
    if (_ || A) {
      var S = p || "";
      a.indexOf(S) === -1 && (s += S, S = ""), s && (c.push(s), s = ""), c.push({ name: _ || d++, prefix: S, suffix: "", pattern: A || v(S), modifier: h("MODIFIER") || "" });
      continue;
    }
    var l = p || h("ESCAPED_CHAR");
    if (l) {
      s += l;
      continue;
    }
    s && (c.push(s), s = "");
    var F = h("OPEN");
    if (F) {
      var S = g(), P = h("NAME") || "", U = h("PATTERN") || "", T = g();
      f("CLOSE"), c.push({ name: P || (U ? d++ : ""), pattern: P && !U ? v(S) : U, prefix: S, suffix: T, modifier: h("MODIFIER") || "" });
      continue;
    }
    f("END");
  }
  return c;
}
__name(ue, "ue");
__name2(ue, "ue");
u(ue, "parse");
function H(t, n) {
  var e = [], r = W(t, e, n);
  return ce(r, e, n);
}
__name(H, "H");
__name2(H, "H");
u(H, "match");
function ce(t, n, e) {
  e === void 0 && (e = {});
  var r = e.decode, a = r === void 0 ? function(i) {
    return i;
  } : r;
  return function(i) {
    var o = t.exec(i);
    if (!o) return false;
    for (var c = o[0], d = o.index, y = /* @__PURE__ */ Object.create(null), s = u(function(f) {
      if (o[f] === void 0) return "continue";
      var g = n[f - 1];
      g.modifier === "*" || g.modifier === "+" ? y[g.name] = o[f].split(g.prefix + g.suffix).map(function(C) {
        return a(C, g);
      }) : y[g.name] = a(o[f], g);
    }, "_loop_1"), h = 1; h < o.length; h++) s(h);
    return { path: c, index: d, params: y };
  };
}
__name(ce, "ce");
__name2(ce, "ce");
u(ce, "regexpToFunction");
function R(t) {
  return t.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(R, "R");
__name2(R, "R");
u(R, "escapeString");
function Z(t) {
  return t && t.sensitive ? "" : "i";
}
__name(Z, "Z");
__name2(Z, "Z");
u(Z, "flags");
function de(t, n) {
  if (!n) return t;
  for (var e = /\((?:\?<(.*?)>)?(?!\?)/g, r = 0, a = e.exec(t.source); a; ) n.push({ name: a[1] || r++, prefix: "", suffix: "", modifier: "", pattern: "" }), a = e.exec(t.source);
  return t;
}
__name(de, "de");
__name2(de, "de");
u(de, "regexpToRegexp");
function he(t, n, e) {
  var r = t.map(function(a) {
    return W(a, n, e).source;
  });
  return new RegExp("(?:".concat(r.join("|"), ")"), Z(e));
}
__name(he, "he");
__name2(he, "he");
u(he, "arrayToRegexp");
function se(t, n, e) {
  return le(ue(t, e), n, e);
}
__name(se, "se");
__name2(se, "se");
u(se, "stringToRegexp");
function le(t, n, e) {
  e === void 0 && (e = {});
  for (var r = e.strict, a = r === void 0 ? false : r, i = e.start, o = i === void 0 ? true : i, c = e.end, d = c === void 0 ? true : c, y = e.encode, s = y === void 0 ? function(m) {
    return m;
  } : y, h = e.delimiter, f = h === void 0 ? "/#?" : h, g = e.endsWith, C = g === void 0 ? "" : g, v = "[".concat(R(C), "]|$"), p = "[".concat(R(f), "]"), _ = o ? "^" : "", A = 0, S = t; A < S.length; A++) {
    var l = S[A];
    if (typeof l == "string") _ += R(s(l));
    else {
      var F = R(s(l.prefix)), P = R(s(l.suffix));
      if (l.pattern) if (n && n.push(l), F || P) if (l.modifier === "+" || l.modifier === "*") {
        var U = l.modifier === "*" ? "?" : "";
        _ += "(?:".concat(F, "((?:").concat(l.pattern, ")(?:").concat(P).concat(F, "(?:").concat(l.pattern, "))*)").concat(P, ")").concat(U);
      } else _ += "(?:".concat(F, "(").concat(l.pattern, ")").concat(P, ")").concat(l.modifier);
      else {
        if (l.modifier === "+" || l.modifier === "*") throw new TypeError('Can not repeat "'.concat(l.name, '" without a prefix and suffix'));
        _ += "(".concat(l.pattern, ")").concat(l.modifier);
      }
      else _ += "(?:".concat(F).concat(P, ")").concat(l.modifier);
    }
  }
  if (d) a || (_ += "".concat(p, "?")), _ += e.endsWith ? "(?=".concat(v, ")") : "$";
  else {
    var T = t[t.length - 1], b = typeof T == "string" ? p.indexOf(T[T.length - 1]) > -1 : T === void 0;
    a || (_ += "(?:".concat(p, "(?=").concat(v, "))?")), b || (_ += "(?=".concat(p, "|").concat(v, ")"));
  }
  return new RegExp(_, Z(e));
}
__name(le, "le");
__name2(le, "le");
u(le, "tokensToRegexp");
function W(t, n, e) {
  return t instanceof RegExp ? de(t, n) : Array.isArray(t) ? he(t, n, e) : se(t, n, e);
}
__name(W, "W");
__name2(W, "W");
u(W, "pathToRegexp");
var I = /[.+?^${}()|[\]\\]/g;
function* pe(t) {
  let n = new URL(t.url).pathname;
  for (let e of [...w].reverse()) {
    if (e.method && e.method !== t.method) continue;
    let r = H(e.routePath.replace(I, "\\$&"), { end: false }), a = H(e.mountPath.replace(I, "\\$&"), { end: false }), i = r(n), o = a(n);
    if (i && o) for (let c of e.middlewares.flat()) yield { handler: c, params: i.params, path: o.path };
  }
  for (let e of w) {
    if (e.method && e.method !== t.method) continue;
    let r = H(e.routePath.replace(I, "\\$&"), { end: true }), a = H(e.mountPath.replace(I, "\\$&"), { end: false }), i = r(n), o = a(n);
    if (i && o && e.modules.length) {
      for (let c of e.modules.flat()) yield { handler: c, params: i.params, path: i.path };
      break;
    }
  }
}
__name(pe, "pe");
__name2(pe, "pe");
u(pe, "executeRequest");
var nt = { async fetch(t, n, e) {
  let r = t, a = pe(r), i = {}, o = false, c = u(async (d, y) => {
    if (d !== void 0) {
      let h = d;
      typeof d == "string" && (h = new URL(d, r.url).toString()), r = new Request(h, y);
    }
    let s = a.next();
    if (s.done === false) {
      let { handler: h, params: f, path: g } = s.value, C = { request: new Request(r.clone()), functionPath: g, next: c, params: f, get data() {
        return i;
      }, set data(p) {
        if (typeof p != "object" || p === null) throw new Error("context.data must be an object");
        i = p;
      }, env: n, waitUntil: e.waitUntil.bind(e), passThroughOnException: u(() => {
        o = true;
      }, "passThroughOnException") }, v = await h(C);
      if (!(v instanceof Response)) throw new Error("Your Pages function should return a Response");
      return D(v);
    } else {
      let h = await n.ASSETS.fetch(r);
      return D(h);
    }
  }, "next");
  try {
    return await c();
  } catch (d) {
    if (o) {
      let y = await n.ASSETS.fetch(r);
      return D(y);
    }
    throw d;
  }
} };
var D = u((t) => new Response([101, 204, 205, 304].includes(t.status) ? null : t.body, t), "cloneResponse");

// node_modules/wrangler/templates/pages-dev-util.ts
function isRoutingRuleMatch(pathname, routingRule) {
  if (!pathname) {
    throw new Error("Pathname is undefined.");
  }
  if (!routingRule) {
    throw new Error("Routing rule is undefined.");
  }
  const ruleRegExp = transformRoutingRuleToRegExp(routingRule);
  return pathname.match(ruleRegExp) !== null;
}
__name(isRoutingRuleMatch, "isRoutingRuleMatch");
function transformRoutingRuleToRegExp(rule) {
  let transformedRule;
  if (rule === "/" || rule === "/*") {
    transformedRule = rule;
  } else if (rule.endsWith("/*")) {
    transformedRule = `${rule.substring(0, rule.length - 2)}(/*)?`;
  } else if (rule.endsWith("/")) {
    transformedRule = `${rule.substring(0, rule.length - 1)}(/)?`;
  } else if (rule.endsWith("*")) {
    transformedRule = rule;
  } else {
    transformedRule = `${rule}(/)?`;
  }
  transformedRule = `^${transformedRule.replaceAll(/\./g, "\\.").replaceAll(/\*/g, ".*")}$`;
  return new RegExp(transformedRule);
}
__name(transformRoutingRuleToRegExp, "transformRoutingRuleToRegExp");

// .wrangler/tmp/pages-4AmPiU/7o002llcaq4.js
var define_ROUTES_default = { version: 1, include: ["/api/*", "/events.ics"], exclude: [] };
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env2, context2) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env2.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = nt;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env2, context2);
      }
    }
    return env2.ASSETS.fetch(request);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    const body = JSON.stringify(error3);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-KBMjVG/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_dev_pipeline_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-KBMjVG/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=7o002llcaq4.js.map
