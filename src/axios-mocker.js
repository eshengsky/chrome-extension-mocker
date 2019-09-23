const handler = require('./handler');
class AxiosMocker {
    constructor(axiosInstance, localData = []) {
        const isNode = typeof process !== 'undefined' && process.release && process.release.name === 'node';
        let lang = '';
        if (isNode) {
            const env = process.env;
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
        const isValid = localData.every(item => {
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

    init() {
        console.log(this.isCHN ? `%cAxiosMocker已开启！当前一共配置了${this.localData.length}条mock数据：` : `%cAxiosMocker now activated! A total of ${this.localData.length} mock data is configured:`, 'color: green');
        console.log(this.localData);
        console.log(this.isCHN ? '%c警告：你通常需要在提交代码前移除相关mock代码！' : '%cWarning: You usually need to remove the relevant mock code before commit it!', 'color: #fff; background: orangered; font-size: 18px; padding: 6px; border-radius: 3px;');
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
                    handler.handleMockData(findOne, config, resolve, reject, this.isCHN);
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
if (typeof window !== "undefined") {
    window.AxiosMocker = AxiosMocker;
}
module.exports = AxiosMocker;
module.exports.default = AxiosMocker;
