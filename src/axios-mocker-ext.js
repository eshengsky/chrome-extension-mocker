const handler = require('./handler');
class AxiosMockerExt {
    constructor(axiosInstance) {
        this.isCHN = (navigator.language || '').toLowerCase() === 'zh-cn';
        if (!axiosInstance) {
            console.error(this.isCHN ? 'new AxiosMockerExt() 必须传入一个axios实例！' : 'new AxiosMockerExt() must pass in an axios instance!');
            return;
        }
        this.axios = axiosInstance;
        this.init();
    }

    init() {
        // 当AxiosMocker处于开启状态时，才重写适配器
        if (window.__MOCKER_ENABLED) {
            console.log(this.isCHN ? '%cAxiosMocker已开启！你可以在 Chrome开发者工具 -> AxiosMocker 中编辑mock数据了。' : '%cAxiosMocker now activated! You can edit the mock data in Chrome dev tools -> AxiosMocker tab.', 'color: green');
            this.extensionId = window.__MOCKER_EXTENSIONID;
            this.originAdapter = this.axios.defaults.adapter;
            this.axios.defaults.adapter = this.mockerAdapter();
        }
    }

    sentErrMsg() {
        console.warn(this.isCHN ? '向AxiosMocker扩展程序发送消息时失败，可能是没有配置mock权限，点击这里查看如何配置: https://github.com/eshengsky/axios-mocker/blob/master/README-zh.md#权限问题' : 'Failed to send messages to AxiosMocker extension, probably without configuring mock permissions, click here to see how to configure: https://github.com/eshengsky/axios-mocker/blob/master/README.md#permission-issue');
    }

    mockerAdapter() {
        return config => {
            return new Promise((resolve, reject) => {
                try {
                    // 向AxiosMocker扩展发送一个消息，将请求的url和method也发过去，在扩展端执行筛选
                    chrome.runtime.sendMessage(this.extensionId, {
                        url: config.url,
                        type: config.method.toUpperCase()
                    }, mockResp => {
                        // 检查是否发送消息失败
                        if (chrome.runtime.lastError) {
                            this.sentErrMsg();
                            this.sendRequest(config, resolve, reject);
                            return;
                        }
                        if (mockResp) {
                            // 找到了匹配的mock数据，则自己模拟一个response，不再发送真实请求
                            handler.handleMockData(mockResp, config, resolve, reject, this.isCHN);
                        } else {
                            // 没有任何匹配的mock数据，只能发送真实请求
                            this.sendRequest(config, resolve, reject);
                        }
                    });
                } catch (err) {
                    this.sentErrMsg();
                    this.sendRequest(config, resolve, reject);
                }
            });
        }
    }

    // 发送真实请求
    sendRequest(config, resolve, reject) {
        this.originAdapter(config).then(resolve, reject);
    }
}

window.AxiosMockerExt = AxiosMockerExt;
