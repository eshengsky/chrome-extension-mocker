/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var handler = __webpack_require__(3);

	var AxiosMocker = function () {
	    function AxiosMocker(axiosInstance) {
	        var localData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

	        _classCallCheck(this, AxiosMocker);

	        var isNode = typeof process !== 'undefined' && process.release && process.release.name === 'node';
	        var lang = '';
	        if (isNode) {
	            var env = process.env;
	            lang = env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE || '';
	        } else {
	            lang = navigator.language || '';
	        }
	        this.isCHN = lang.toLowerCase().indexOf('zh-cn') >= 0 || lang.toLowerCase().indexOf('zh_cn') >= 0;
	        if (!axiosInstance) {
	            console.error(this.isCHN ? 'new AxiosMocker() 第一个参数必须传入一个axios实例！' : 'new AxiosMocker() the first parameter must be an axios instance!');
	            return;
	        }
	        if (!Array.isArray(localData)) {
	            console.error(this.isCHN ? 'new AxiosMocker() 第二个参数必须是数组类型！' : 'new AxiosMocker() the second parameter must be array type!');
	            return;
	        }
	        var isValid = localData.every(function (item) {
	            if (item.req && item.req.url && item.res && item.res.statusCode) {
	                return true;
	            }
	            return false;
	        });
	        if (!isValid) {
	            console.error(this.isCHN ? 'new AxiosMocker() 第二个参数传入的数据格式不正确！格式参考: https://github.com/eshengsky/axios-mocker/blob/master/README-zh.md#使用-1' : 'new AxiosMocker() the second parameter is not in the correct format! Format reference: https://github.com/eshengsky/axios-mocker/blob/master/README.md#usage-1');
	            return;
	        }
	        this.axios = axiosInstance;
	        this.localData = localData;
	        this.init();
	    }

	    _createClass(AxiosMocker, [{
	        key: 'init',
	        value: function init() {
	            console.log(this.isCHN ? '%cAxiosMocker\u5DF2\u5F00\u542F\uFF01\u5F53\u524D\u4E00\u5171\u914D\u7F6E\u4E86' + this.localData.length + '\u6761mock\u6570\u636E\uFF1A' : '%cAxiosMocker now activated! A total of ' + this.localData.length + ' mock data is configured:', 'color: green');
	            console.log(this.localData);
	            console.log(this.isCHN ? '%c警告：你通常需要在提交代码前移除相关mock代码！' : '%cWarning: You usually need to remove the relevant mock code before commit it!', 'color: #fff; background: orangered; font-size: 18px; padding: 6px; border-radius: 3px;');
	            this.originAdapter = this.axios.defaults.adapter;
	            this.axios.defaults.adapter = this.mockerAdapter();
	        }
	    }, {
	        key: 'mockerAdapter',
	        value: function mockerAdapter() {
	            var _this = this;

	            return function (config) {
	                return new Promise(function (resolve, reject) {
	                    var findOne = _this.localData.find(function (t) {
	                        if (t.active === false) {
	                            return false;
	                        }
	                        if (config.url.indexOf(t.req.url) === -1) {
	                            return false;
	                        }
	                        if (!t.req.method) {
	                            return true;
	                        }
	                        return config.method.toUpperCase() === t.req.method.toUpperCase();
	                    });

	                    if (findOne) {
	                        // 找到了匹配的mock数据，则自己模拟一个response，不再发送真实请求
	                        handler.handleMockData(findOne, config, resolve, reject, _this.isCHN);
	                    } else {
	                        // 没有任何匹配的mock数据，只能发送真实请求
	                        _this.sendRequest(config, resolve, reject);
	                    }
	                });
	            };
	        }

	        // 发送真实请求

	    }, {
	        key: 'sendRequest',
	        value: function sendRequest(config, resolve, reject) {
	            this.originAdapter(config).then(resolve, reject);
	        }
	    }]);

	    return AxiosMocker;
	}();

	if (typeof window !== "undefined") {
	    window.AxiosMocker = AxiosMocker;
	}
	module.exports = AxiosMocker;
	module.exports.default = AxiosMocker;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	module.exports = {
	    // 处理mock数据
	    handleMockData: function handleMockData(mockResp, config, resolve, reject, isCHN) {
	        var _this = this;

	        var resp = {};
	        resp.data = mockResp.res.body;
	        var contentType = mockResp.res.contentType || 'application/json';
	        if (contentType.indexOf('json') >= 0 && _typeof(resp.data) !== 'object') {
	            try {
	                resp.data = JSON.parse(mockResp.res.body);
	            } catch (err) {}
	        }
	        resp.status = Number(mockResp.res.statusCode);
	        resp.statusText = '';

	        resp.headers = {
	            'x-mocker-data': 'true',
	            'content-type': contentType
	        };
	        if (mockResp.res.headers && _typeof(mockResp.res.headers) === 'object') {
	            Object.assign(resp.headers, mockResp.res.headers);
	        }
	        if (Number(mockResp.res.delay)) {
	            setTimeout(function () {
	                _this.mockDone(resp, config, resolve, reject, isCHN);
	            }, Number(mockResp.res.delay));
	        } else {
	            this.mockDone(resp, config, resolve, reject, isCHN);
	        }
	    },
	    mockDone: function mockDone(resp, config, resolve, reject, isCHN) {
	        this.printMockDetails(resp, config, isCHN);
	        var validFn = config.validateStatus;
	        if (validFn.call(null, resp.status)) {
	            // 视为正常的响应
	            resolve(resp);
	        } else {
	            // 异常响应，自定义一个错误对象，和axios尽量一致
	            var customErr = new Error('Request failed with status code ' + resp.status);
	            customErr.response = resp;
	            customErr.config = config;
	            reject(customErr);
	        }
	    },
	    printMockDetails: function printMockDetails(resp, config, isCHN) {
	        console.group('%cAxiosMocker Network', 'color: #8a2be2');

	        console.log(isCHN ? '💡%c该请求返回了模拟数据，请注意在Network面板或抓包工具中无法查看真实的网络请求。模拟数据的详情如下：' : '💡%cThe request returned mock data, note that the real request cannot be viewed in Network panel or capture tool. Mock data details are as follows:', 'color: #8a2be2; margin-left: 3px;');

	        // General
	        console.group('General');
	        var url = config.url;

	        if (typeof window !== 'undefined') {
	            if (url.indexOf('//') === 0) {
	                url = '' + location.protocol + url;
	            }
	            if (url.indexOf('http') !== 0) {
	                url = location.protocol + '//' + location.host + url;
	            }
	        }

	        var urlObj = void 0;
	        try {
	            urlObj = new URL(url);
	            Object.keys(config.params || {}).forEach(function (key) {
	                urlObj.searchParams.append(key, config.params[key]);
	            });
	            url = urlObj.href;
	        } catch (err) {}

	        console.log('%cRequest URL:', 'font-weight: bold;', url);
	        console.log('%cRequest Method:', 'font-weight: bold;', config.method.toUpperCase());
	        console.log('%cStatus Code: %c' + resp.status, 'font-weight: bold;', resp.status >= 200 && resp.status < 300 ? 'color: green; font-weight: bold;' : 'color: orangered; font-weight: bold;');
	        console.groupEnd();

	        // Response Headers
	        console.groupCollapsed('Response Headers (' + Object.keys(resp.headers).length + ')');
	        Object.keys(resp.headers).forEach(function (key) {
	            console.log('%c' + key + ':', 'font-weight: bold;', resp.headers[key]);
	        });
	        console.groupEnd();

	        // Request Headers
	        console.groupCollapsed('Request Headers (' + Object.keys(config.headers).length + ')');
	        Object.keys(config.headers).forEach(function (key) {
	            console.log('%c' + key + ':', 'font-weight: bold;', config.headers[key]);
	        });
	        console.groupEnd();

	        // Query String Parameters
	        if (urlObj) {
	            var paramsArray = Array.from(urlObj.searchParams);
	            if (paramsArray.length > 0) {
	                console.groupCollapsed('Query String Parameters (' + paramsArray.length + ')');
	                paramsArray.forEach(function (item) {
	                    console.log('%c' + item[0] + ':', 'font-weight: bold;', item[1]);
	                });
	                console.groupEnd();
	            }
	        }

	        // Request Payload
	        if (config.data) {
	            var payload = {};
	            try {
	                payload = JSON.parse(config.data);
	            } catch (err) {}
	            console.groupCollapsed('Request Payload');
	            console.log(payload);
	            console.groupEnd();
	        }

	        // Response
	        console.groupCollapsed('Response');
	        var data = resp.data;
	        try {
	            data = JSON.parse(data);
	        } catch (err) {}
	        console.log(data);
	        console.groupEnd();
	        console.groupEnd();
	    }
	};

/***/ })
/******/ ]);