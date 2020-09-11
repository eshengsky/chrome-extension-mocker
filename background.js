chrome.storage.local.get("active", value => {
    const newIcon = value.active === false ? "../icons/icon_grey_128.png" : "../icons/icon_128.png";
    chrome.browserAction.setIcon({ path: { "128": newIcon } });
});
chrome.runtime.onMessageExternal.addListener(
    (message, sender, sendResponse) => {
        const url = message.url;
        const type = message.type;
        chrome.storage.local.get("data", value => {
            const items = value.data || [];
            const findOne = items.find(t => {
                if (t.active == false) {
                    return false;
                }
                if (url.indexOf(t.req.url) === -1) {
                    return false;
                }
                if (!t.req.method) {
                    return true;
                }
                return type === t.req.method;
            });
            sendResponse(findOne);
        });
        return true;
    });
    