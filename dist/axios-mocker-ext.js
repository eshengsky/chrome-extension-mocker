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

	module.exports = __webpack_require__(4);


/***/ }),
/* 1 */,
/* 2 */,
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

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var handler = __webpack_require__(3);

	var AxiosMockerExt = function () {
	    function AxiosMockerExt(axiosInstance) {
	        _classCallCheck(this, AxiosMockerExt);

	        this.isCHN = (navigator.language || '').toLowerCase() === 'zh-cn';
	        if (!axiosInstance) {
	            console.error(this.isCHN ? 'new AxiosMockerExt() 必须传入一个axios实例！' : 'new AxiosMockerExt() must pass in an axios instance!');
	            return;
	        }
	        this.axios = axiosInstance;
	        this.init();
	    }

	    _createClass(AxiosMockerExt, [{
	        key: 'init',
	        value: function init() {
	            // 当AxiosMocker处于开启状态时，才重写适配器
	            if (window.__MOCKER_ENABLED) {
	                console.log(this.isCHN ? '%cAxiosMocker已开启！你可以在 Chrome开发者工具 -> AxiosMocker 中编辑mock数据了。' : '%cAxiosMocker now activated! You can edit the mock data in Chrome dev tools -> AxiosMocker tab.', 'color: green');
	                this.extensionId = window.__MOCKER_EXTENSIONID;
	                this.originAdapter = this.axios.defaults.adapter;
	                this.axios.defaults.adapter = this.mockerAdapter();
	            }
	        }
	    }, {
	        key: 'sentErrMsg',
	        value: function sentErrMsg() {
	            console.warn(this.isCHN ? '向AxiosMocker扩展程序发送消息时失败，可能是没有配置mock权限，点击这里查看如何配置: https://github.com/eshengsky/axios-mocker/blob/master/README-zh.md#权限问题' : 'Failed to send messages to AxiosMocker extension, probably without configuring mock permissions, click here to see how to configure: https://github.com/eshengsky/axios-mocker/blob/master/README.md#permission-issue');
	        }
	    }, {
	        key: 'mockerAdapter',
	        value: function mockerAdapter() {
	            var _this = this;

	            return function (config) {
	                return new Promise(function (resolve, reject) {
	                    try {
	                        // 向AxiosMocker扩展发送一个消息，将请求的url和method也发过去，在扩展端执行筛选
	                        chrome.runtime.sendMessage(_this.extensionId, {
	                            url: config.url,
	                            type: config.method.toUpperCase()
	                        }, function (mockResp) {
	                            // 检查是否发送消息失败
	                            if (chrome.runtime.lastError) {
	                                _this.sentErrMsg();
	                                _this.sendRequest(config, resolve, reject);
	                                return;
	                            }
	                            if (mockResp) {
	                                // 找到了匹配的mock数据，则自己模拟一个response，不再发送真实请求
	                                handler.handleMockData(mockResp, config, resolve, reject, _this.isCHN);
	                            } else {
	                                // 没有任何匹配的mock数据，只能发送真实请求
	                                _this.sendRequest(config, resolve, reject);
	                            }
	                        });
	                    } catch (err) {
	                        _this.sentErrMsg();
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

	    return AxiosMockerExt;
	}();

	window.AxiosMockerExt = AxiosMockerExt;

/***/ })
/******/ ]);