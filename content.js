chrome.storage.local.get("active", value => {
    const script1 = document.createElement("script");
    script1.textContent = `
    window.__MOCKER_EXTENSIONID = '${chrome.runtime.id}';
    window.__MOCKER_ENABLED = ${value.active !== false};
`;
    script1.async = false;
    document.documentElement.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = chrome.extension.getURL("dist/axios-mocker-ext.min.js");
    script2.async = false;
    document.documentElement.appendChild(script2);
});
