chrome.storage.local.get("active", value => {
    let txt = '';
    if (value.active === false) {
        document.querySelector('.outer-circle').classList.remove('active');
        txt = 'Off'
    } else {
        // active是true，或active是undefind，都认为是激活状态
        document.querySelector('.outer-circle').classList.add('active');
        txt = 'On';
    }
    document.querySelector('#statusText').textContent = txt;
});

document.querySelector('.outer-circle').addEventListener('click', event => {
    const el = event.currentTarget;
    const active = el.classList.contains('active');
    let cookieVal;
    let icon;
    let txt = '';
    if (active) {
        el.classList.remove('active');
        cookieVal = '0';
        icon = "../icons/icon_grey_128.png";
        txt = 'Off';
    } else {
        el.classList.add('active');
        cookieVal = '1';
        icon = "../icons/icon_128.png";
        txt = 'On';
    }
    chrome.storage.local.set({ active: !active });
    chrome.browserAction.setIcon({ path: { "128": icon } });
    document.querySelector('#statusText').textContent = txt;
});
