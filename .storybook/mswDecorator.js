"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mswLoader = exports.mswDecorator = exports.getWorker = exports.initializeWorker = exports.initialize = void 0;
var is_node_process_1 = require("is-node-process");
var IS_BROWSER = !(0, is_node_process_1.isNodeProcess)();
var api;
var workerPromise;
function initialize(options, initialHandlers) {
    var _a;
    if (initialHandlers === void 0) { initialHandlers = []; }
    if (IS_BROWSER) {
        var setupWorker = require('msw/browser').setupWorker;
        var worker = setupWorker.apply(void 0, initialHandlers);
        workerPromise = worker.start(options);
        api = worker;
    }
    else {
        /**
         * Webpack 5 does not provide node polyfills as it did before.
         * Also, it can't tell whether a code will be executed at runtime, so it has to process everything.
         * This branch of the conditional statement will NEVER run in the browser, but Webpack can't know so
         * it breaks builds unless we start providing node polyfills.
         *
         * As a workaround, we use __non_webpack_require__ to tell Webpack to ignore this, and we define it
         * to globalThis so it works correctly when running in node.
         * @see https://github.com/webpack/webpack/issues/8826#issuecomment-660594260
         */
        var nodeVer = typeof process !== 'undefined' && ((_a = process.versions) === null || _a === void 0 ? void 0 : _a.node);
        var nodeRequire = nodeVer
            ? typeof __webpack_require__ === 'function'
                ? __non_webpack_require__
                : require
            : undefined;
        var setupServer = nodeRequire('msw/node').setupServer;
        var server = setupServer.apply(void 0, initialHandlers);
        workerPromise = server.listen(options);
        api = server;
    }
    return api;
}
exports.initialize = initialize;
function initializeWorker(options) {
    console.warn("[MSW] \"initializeWorker\" is now deprecated, please use \"initialize\" instead. This method will be removed in future releases.");
    return initialize(options);
}
exports.initializeWorker = initializeWorker;
function getWorker() {
    if (api === undefined) {
        throw new Error("[MSW] Failed to retrieve the worker: no active worker found. Did you forget to call \"initialize\"?");
    }
    return api;
}
exports.getWorker = getWorker;
var mswDecorator = function (storyFn, context) {
    var msw = context.parameters.msw;
    if (api) {
        api.resetHandlers();
        if (msw) {
            if (Array.isArray(msw) && msw.length > 0) {
                // Support an Array of request handlers (backwards compatability).
                api.use.apply(api, msw);
            }
            else if ('handlers' in msw && msw.handlers) {
                // Support an Array named request handlers handlers
                // or an Object of named request handlers with named arrays of handlers
                var handlers = Object.values(msw.handlers)
                    .filter(Boolean)
                    .reduce(function (handlers, handlersList) { return handlers.concat(handlersList); }, []);
                if (handlers.length > 0) {
                    api.use.apply(api, handlers);
                }
            }
        }
    }
    return storyFn();
};
exports.mswDecorator = mswDecorator;
var mswLoader = function (context) { return __awaiter(void 0, void 0, void 0, function () {
    var msw, handlers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                msw = context.parameters.msw;
                if (api) {
                    api.resetHandlers();
                    if (msw) {
                        if (Array.isArray(msw) && msw.length > 0) {
                            // Support an Array of request handlers (backwards compatability).
                            api.use.apply(api, msw);
                        }
                        else if ('handlers' in msw && msw.handlers) {
                            handlers = Object.values(msw.handlers)
                                .filter(Boolean)
                                .reduce(function (handlers, handlersList) { return handlers.concat(handlersList); }, []);
                            if (handlers.length > 0) {
                                api.use.apply(api, handlers);
                            }
                        }
                    }
                }
                if (!workerPromise) return [3 /*break*/, 2];
                return [4 /*yield*/, workerPromise];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/, {}];
        }
    });
}); };
exports.mswLoader = mswLoader;
