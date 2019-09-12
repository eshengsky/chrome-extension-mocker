import handler from "./handler";
class AxiosMocker {
    constructor(axiosInstance, localData = []) {
        if (!axiosInstance) {
            console.error('new AxiosMocker() 第一个参数必须传入一个axios实例！');
            return;
        }
        if (!Array.isArray(localData)) {
            console.error('new AxiosMocker() 第二个参数必须是数组类型！');
            return;
        }
        const isValid = localData.every(item => {
            if (item.req && item.req.url && item.res && item.res.statusCode) {
                return true;
            }
            return false;
        });
        if (!isValid) {
            console.error('new AxiosMocker() 第二个参数传入的数据格式不正确！格式参考：https://baidu.com');
            return;
        }
        this.axios = axiosInstance;
        this.localData = localData;
        this.init();
    }

    init() {
        console.log(`%cAxiosMocker已开启！当前一共配置了${this.localData.length}条mock数据：`, 'color: green');
        console.log(this.localData);
        console.log('%c警告：你通常需要在提交代码前移除相关mock代码！', 'color: #fff; background: orangered; font-size: 18px; padding: 6px; border-radius: 3px;');
        this.originAdapter = this.axios.defaults.adapter;
        this.axios.defaults.adapter = this.mockerAdapter();
    }

    mockerAdapter() {
        return config => {
            return new Promise((resolve, reject) => {
                const findOne = this.localData.find(t => {
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
                    handler.handleMockData(findOne, config, resolve, reject);
                } else {
                    // 没有任何匹配的mock数据，只能发送真实请求
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

window.AxiosMocker = AxiosMocker;
