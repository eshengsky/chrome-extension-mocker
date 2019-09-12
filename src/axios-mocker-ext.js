import handler from "./handler";
class AxiosMockerExt {
    constructor(axiosInstance) {
        if (!axiosInstance) {
            console.error('new AxiosMockerExt() 必须传入一个axios实例！');
            return;
        }
        this.axios = axiosInstance;
        this.init();
    }

    init() {
        // 只有安装了AxiosMocker，才去重写适配器
        if (window.__MOCKER_ENABLED) {
            console.log('%cAxiosMocker已开启！你可以在 Chrome开发者工具 -> AxiosMocker 中编辑mock数据了。', 'color: green');
            this.extensionId = window.__MOCKER_EXTENSIONID;
            this.originAdapter = this.axios.defaults.adapter;
            this.axios.defaults.adapter = this.mockerAdapter();
        }
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
                        if (mockResp) {
                            // 找到了匹配的mock数据，则自己模拟一个response，不再发送真实请求
                            handler.handleMockData(mockResp, config, resolve, reject);
                        } else {
                            // 没有任何匹配的mock数据，只能发送真实请求
                            this.sendRequest(config, resolve, reject);
                        }
                    });
                } catch (err) {
                    console.error('向AxiosMocker扩展程序发送消息时失败，可能是没有配置mock权限，点击这里查看如何配置：https://m.baidu.com');
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
