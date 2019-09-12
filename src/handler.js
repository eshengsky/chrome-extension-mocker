export default {
    // 处理mock数据
    handleMockData(mockResp, config, resolve, reject) {
        const resp = {};
        resp.data = mockResp.res.body;
        if (mockResp.res.contentType.indexOf('json') >= 0 && typeof resp.data !== 'object') {
            try {
                resp.data = JSON.parse(mockResp.res.body);
            } catch (err) { }
        }
        resp.status = Number(mockResp.res.statusCode);
        resp.statusText = '';

        resp.headers = {
            'x-mocker-data': 'true',
            'content-type': mockResp.res.contentType
        };
        if (mockResp.res.headers && typeof mockResp.res.headers === 'object') {
            Object.assign(resp.headers, mockResp.res.headers);
        }
        if (Number(mockResp.res.delay)) {
            setTimeout(() => {
                this.mockDone(resp, config, resolve, reject);
            }, Number(mockResp.res.delay));
        } else {
            this.mockDone(resp, config, resolve, reject);
        }
    },

    mockDone(resp, config, resolve, reject) {
        this.printMockDetails(resp, config);
        const validFn = config.validateStatus;
        if (validFn.call(null, resp.status)) {
            // 视为正常的响应
            resolve(resp);
        } else {
            // 异常响应，自定义一个错误对象，和axios尽量一致
            const customErr = new Error(`Request failed with status code ${resp.status}`);
            customErr.response = resp;
            customErr.config = config;
            reject(customErr);
        }
    },

    printMockDetails(resp, config) {
        console.group('%cAxiosMocker', 'color: #8a2be2');
        console.log('💡%c该请求返回了模拟数据，请注意在Network面板或抓包工具中无法查看真实的网络请求。模拟数据的详情如下：', 'color: #8a2be2; margin-left: 3px;');

        // General
        console.group('General');
        let url = config.url;
        if (url.indexOf('//') === 0) {
            url = `http:${url}`;
        }
        const urlObj = new URL(url);
        Object.keys(config.params || {}).forEach(key => {
            urlObj.searchParams.append(key, config.params[key]);
        });
        url = urlObj.href;
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
        const paramsArray = Array.from(urlObj.searchParams);
        if (paramsArray.length > 0) {
            console.groupCollapsed(`Query String Parameters (${paramsArray.length})`);
            paramsArray.forEach(item => {
                console.log(`%c${item[0]}:`, 'font-weight: bold;', item[1]);
            });
            console.groupEnd();
        }

        // Request Payload
        if (config.data) {
            let payload = {};
            try {
                payload = JSON.parse(config.data);
            } catch (err) { }
            console.groupCollapsed('Request Payload');
            console.log(payload);
            console.groupEnd();
        }

        // Response
        console.groupCollapsed('Response');
        let data = resp.data;
        try {
            data = JSON.parse(data);
        } catch (err) { }
        console.log(data);
        console.groupEnd();
        console.groupEnd();
    }
}
