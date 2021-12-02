import mockjs from 'better-mock';

const storageCache = {
  mockData: [],
  enabled: 'Y',
};

chrome.storage.sync.get((['mockData']), (result) => {
  storageCache.mockData = result.mockData || [];
});

chrome.storage.sync.get((['enabled']), (result) => {
  storageCache.enabled = result.enabled || 'Y';
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.mockData && changes.mockData.newValue) {
    storageCache.mockData = changes.mockData.newValue;
  }
  if (changes.enabled && changes.enabled.newValue) {
    storageCache.enabled = changes.enabled.newValue;
  }
  console.log('Update data:', storageCache);
});

function getMockData(url, method) {
  if (storageCache.enabled !== 'Y') {
    return null;
  }
  return (storageCache.mockData || []).find((rule) => {
    if (!rule.active) {
      return false;
    }
    if (rule.reqMethod && rule.reqMethod.toLowerCase() !== method.toLowerCase()) {
      // 如果规则配置了method，而当前请求的method与规则不一致，则不匹配
      return false;
    }
    if (rule.reqType === 2) {
      // 正则匹配
      return new RegExp(rule.reqUrl, 'gi').test(url);
    }
    // 模糊匹配
    return url.indexOf(rule.reqUrl) >= 0;
  });
}

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const { url } = details;
    const { method } = details;
    const mockData = getMockData(url, method);
    if (mockData) {
      let requestBody = '';

      // 尝试将原始的请求体转为支持中文的字符串
      try {
        const uint8array = new Uint8Array(details.requestBody.raw[0].bytes);
        requestBody = new TextDecoder('utf-8').decode(uint8array);
      } catch (e) {
        console.error('Prase requestBody failed!', e);
      }

      let { responseText } = mockData;
      try {
        if (mockData.contentType.indexOf('application/json') >= 0) {
          responseText = JSON.stringify(mockjs.mock(JSON.parse(responseText)));
        }
      } catch (err) {
        console.error('Error when use mockjs:', err);
      }
      mockData.responseText = responseText;

      const data = {
        message: 'The request returned mock data. Please view it in Console!',
        mock: true,
        mockData,
        reqData: {
          url: details.url,
          method: details.method,
          body: requestBody,
        },
      };
      return {
        // 注意这里必须要 encodeURIComponent 一下，否则特殊字符会丢失
        redirectUrl: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`,
      };
    }

    return {
      cancel: false,
    };
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'requestBody', 'extraHeaders'],
);
