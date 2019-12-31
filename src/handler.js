module.exports = {
    // 处理mock数据
    handleMockData(mockResp, config, resolve, reject, isCHN) {
        const resp = {};
        resp.data = mockResp.res.body;
        const contentType = mockResp.res.contentType || 'application/json';
        if (contentType.indexOf('json') >= 0 && typeof resp.data !== 'object') {
            try {
                resp.data = JSON.parse(mockResp.res.body);
            } catch (err) { }
        }
        resp.status = Number(mockResp.res.statusCode);
        resp.statusText = '';

        resp.headers = {
            'x-mocker-data': 'true',
            'content-type': contentType
        };
        if (mockResp.res.headers && typeof mockResp.res.headers === 'object') {
            Object.assign(resp.headers, mockResp.res.headers);
        }
        resp.config = config;
        resp.request = null;
        if (Number(mockResp.res.delay)) {
            setTimeout(() => {
                this.mockDone(resp, config, resolve, reject, isCHN);
            }, Number(mockResp.res.delay));
        } else {
            this.mockDone(resp, config, resolve, reject, isCHN);
        }
    },

    mockDone(resp, config, resolve, reject, isCHN) {
        this.printMockDetails(resp, config, isCHN);
        const validFn = config.validateStatus;
        if (validFn.call(null, resp.status)) {
            // 视为正常的响应
            resolve(resp);
        } else {
            // 异常响应，自定义一个错误对象，和axios尽量一致
            const customErr = new Error(`Request failed with status code ${resp.status}`);
            customErr.response = resp;
            customErr.request = null;
            customErr.config = config;
            reject(customErr);
        }
    },

    printMockDetails(resp, config, isCHN) {
        console.group('%cAxiosMocker Network', 'color: #8a2be2');

        console.log(isCHN ? '💡%c该请求返回了模拟数据，请注意在Network面板或抓包工具中无法查看真实的网络请求。模拟数据的详情如下：' : '💡%cThe request returned mock data, note that the real request cannot be viewed in Network panel or capture tool. Mock data details are as follows:', 'color: #8a2be2; margin-left: 3px;');

        // General
        console.group('General');
        let url = config.url;

        if (typeof window !== 'undefined') {
            if (url.indexOf('//') === 0) {
                url = `${location.protocol}${url}`;
            }
            if (url.indexOf('http') !== 0) {
                url = `${location.protocol}//${location.host}${url}`;
            }
        }

        let urlObj;
        try {
            urlObj = new URL(url);
            Object.keys(config.params || {}).forEach(key => {
                urlObj.searchParams.append(key, config.params[key]);
            });
            url = urlObj.href;
        } catch (err) { }

        console.log('%cRequest URL:', 'font-weight: bold;', url);
        console.log('%cRequest Method:', 'font-weight: bold;', config.method.toUpperCase());
        console.log(`%cStatus Code: %c${resp.status}`, 'font-weight: bold;', (resp.status >= 200 && resp.status < 300) ? 'color: green; font-weight: bold;' : 'color: orangered; font-weight: bold;');
        console.groupEnd();

        // Response Headers
        console.groupCollapsed(`Response Headers (${Object.keys(resp.headers).length})`);
        Object.keys(resp.headers).forEach(key => {
            console.log(`%c${key}:`, 'font-weight: bold;', resp.headers[key]);
        });
        console.groupEnd();

        // Request Headers
        console.groupCollapsed(`Request Headers (${Object.keys(config.headers).length})`);
        Object.keys(config.headers).forEach(key => {
            console.log(`%c${key}:`, 'font-weight: bold;', config.headers[key]);
        });
        console.groupEnd();

        // Query String Parameters
        if (urlObj) {
            const paramsArray = Array.from(urlObj.searchParams);
            if (paramsArray.length > 0) {
                console.groupCollapsed(`Query String Parameters (${paramsArray.length})`);
                paramsArray.forEach(item => {
                    console.log(`%c${item[0]}:`, 'font-weight: bold;', item[1]);
                });
                console.groupEnd();
            }
        }

        // Request Payload
        if (config.data) {
            let payload;
            let headerName;
            try {
                if (typeof config.data === 'string') {
                    // Form Data
                    headerName = 'Form Data';
                    payload = JSON.parse('{"' + decodeURI(config.data).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
                    payload.__proto__ = null;
                } else {
                    // Request Payload
                    headerName = 'Request Payload';
                    payload = JSON.parse(config.data);
                    payload.__proto__ = null;
                }
            } catch(err) {}
            console.groupCollapsed(headerName);
            if (payload) {
                console.log(payload);
            } else {
                // Parse Error print
                console.log('%cParse Error!', 'color: #888; font-style: italic;');
            }
            console.groupEnd();
        }

        // Response
        console.groupCollapsed('Response');
        let data = resp.data;
        try {
            data = JSON.parse(data);
        } catch (err) { }
        if (data && data.__proto__) {
            data.__proto__ = null;
        }
        console.log(data);
        console.groupEnd();
        console.groupEnd();
    }
}
