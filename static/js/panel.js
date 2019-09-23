require.config({ paths: { 'vs': './monaco-editor/vs' } });

const isCHN = (navigator.language || '').toLowerCase() === 'zh-cn';
if (isCHN) {
    require.config({
        'vs/nls': {
            availableLanguages: {
                '*': 'zh-cn'
            }
        }
    });
}

class Mocker {
    constructor() {
        this.$btnImport = $('#btn-import');
        this.$editPanel = $('.edit-panel');
        this.$textUri = $('#text-uri');
        this.$formUri = $('#form-uri');
        this.$selectMethod = $('#select-method');
        this.$textStatus = $('#text-status');
        this.$selectStatus = $('#select-status');
        this.$textMime = $('#text-mime');
        this.$selectMime = $('#select-mime');
        this.$textHeader = $('#text-header');
        this.$selectMode = $('#select-mode');
        this.$textDelay = $('#text-delay');
        this.$btnSave = $('.btn-save');
        this.uid = "";
        this.scrollTop = 0;
        this.version = chrome.app.getDetails().version;
        this.init();
    }

    init() {
        this.initUI();
        this.checkActive();
        this.initMockList();
        this.bindEvents();
        this.checkUpdate();
    }

    checkActive() {
        try {
            chrome.storage.local.get("active", value => {
                if (value.active !== false) {
                    document.body.classList.add('active');
                } else {
                    document.body.classList.remove('active');
                }
            });
        } catch (err) { }

    }

    initUI() {
        document.querySelectorAll('[data-content]').forEach(el => {
            const msg = el.dataset.content;
            el.textContent = chrome.i18n.getMessage(msg);
        });
        document.querySelectorAll('[data-title]').forEach(el => {
            const msg = el.dataset.title;
            el.setAttribute('title', chrome.i18n.getMessage(msg));
        });
        document.querySelectorAll('[data-placeholder]').forEach(el => {
            const msg = el.dataset.placeholder;
            el.setAttribute('placeholder', chrome.i18n.getMessage(msg));
        });
        $('#curr-version').html(`<a href="https://github.com/eshengsky/axios-mocker/releases/tag/v${this.version}" target="_blank">v${this.version}</a>`);
        document.body.style.display = 'block';
    }

    /**
     * 初始化列表
     */
    initMockList() {
        this.getSettings().then(data => {
            if (Array.isArray(data)) {
                let html = '';
                data.forEach(item => {
                    html +=
                        `
<li class="data-li ${item.active === false ? 'inactive' : ''}">
    <div class="div-left" data-uid="${item.id}">
        <div class="div-top">
            <span class="list-method ${item.req.method}" title="${!item.req.method ? chrome.i18n.getMessage('All2') : item.req.method}">${item.req.method ? item.req.method.toUpperCase() : 'All'}</span>
            <span title="${item.req.url}" class="list-uri">${item.req.url}</span>
        </div>
        <div class="div-bottom">
            <span class="list-status ${(Number(item.res.statusCode) >= 200 && Number(item.res.statusCode) < 300) ? 'success-status' : 'error-status'}" title="${item.res.statusCode}">${item.res.statusCode}</span>
            <span title="${item.res.contentType}" class="list-mime">${item.res.contentType}</span>
        </div>
    </div>
    <div class="div-right">
        <div class="switcher-wrap" title="${chrome.i18n.getMessage('Active')}"><input data-uid="${item.id}" type="checkbox" class="cb-active" ${item.active !== false ? 'checked' : ''}></div>
        <button class="btn-del" title="${chrome.i18n.getMessage('Delete')}" data-uid="${item.id}"><i class="far fa-times-circle"></i></button>
    </div>
</li>
`;
                });
                $('#data').html(html);
                document.querySelectorAll('.cb-active').forEach(el => {
                    const switchery = new Switchery(el, {
                        color: '#56CC9D',
                        size: 'small'
                    });
                });
            }
        }).catch();
    }

    /**
     * 初始化编辑器
     */
    initEditor({ text, mode }) {
        require(['vs/editor/editor.main'], () => {
            if (!this.editor) {
                this.editor = monaco.editor.create(document.getElementById('text-body'), {
                    model: null
                });
            }
            const newModel = monaco.editor.createModel(text, mode);
            this.editor.setModel(newModel);
            this.editor.layout();
        });
    }

    generateId() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }

    /**
     * 获取设置
     */
    getSettings() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get('data', value => {
                resolve(value.data || []);
            });
        });
    }

    /**
     * 保存详情设置
     */
    saveSettings() {
        if (!this.$textUri.val().trim()) {
            this.$formUri.addClass('has-error');
            window.scrollTo(0, 0);
            this.$textUri.focus();
            return;
        }

        const headersToSave = {};
        const headersInputTxt = this.$textHeader.val().trim();
        if (headersInputTxt) {
            try {
                const arr = headersInputTxt.split('\n');
                arr.forEach(item => {
                    const pair = item.split(':');
                    headersToSave[pair[0].trim()] = pair[1].trim();
                });
            } catch (err) { }


        }
        let body = this.editor.getValue();
        try {
            body = JSON.parse(body);
        } catch (err) { }
        const entity = {
            req: {
                url: this.$textUri.val().trim(),
                method: this.$selectMethod.selectlist('selectedItem').value
            },
            res: {
                statusCode: Number(this.$selectStatus.combobox('selectedItem').text),
                contentType: this.$selectMime.combobox('selectedItem').text,
                headers: headersToSave,
                editorMode: this.$selectMode.val(),
                body,
                delay: Number(this.$textDelay.val().trim()),
            },
            id: this.uid || this.generateId(),
            active: true,
            comments: ""
        };

        this.getSettings().then(data => {
            if (this.uid) {
                // 更新
                const findOne = data.find(t => t.id === this.uid);
                if (findOne) {
                    // id 和 active 不做更新
                    findOne.comments = entity.comments;
                    findOne.req.url = entity.req.url;
                    findOne.req.method = entity.req.method;
                    findOne.res.statusCode = entity.res.statusCode;
                    findOne.res.contentType = entity.res.contentType;
                    findOne.res.headers = entity.res.headers;
                    findOne.res.editorMode = entity.res.editorMode;
                    findOne.res.body = entity.res.body;
                    findOne.res.delay = entity.res.delay;
                }
            } else {
                // 新建
                data.unshift(entity);
            }
            chrome.storage.local.set({ data }, () => {
                this.$btnSave.html(`<i class="fas fa-check"></i> ${chrome.i18n.getMessage('Saved')}`);
                setTimeout(() => {
                    this.$btnSave.html(chrome.i18n.getMessage('Save'));
                }, 1000);

                // 如果保存成功，则对 id 重新赋值
                this.uid = entity.id;
            });
        });
    }

    /**
     * 重置详情
     */
    resetMockDetails() {
        this.uid = '';
        this.$textUri.val('');
        this.$selectMethod.selectlist('selectByValue', 'GET');
        this.$selectStatus.combobox('selectByValue', '200');
        this.$selectMime.combobox('selectByValue', 'application/json');
        this.$textHeader.val('');
        this.$selectMode.val('json');
        this.initEditor({
            text: `{
    "code": "1"
}`,
            mode: 'json'
        });
        this.$textDelay.val('0');
    }

    /**
     * 初始化详情
     * @param {string} [uid] - 唯一id，为空则来自新建
     */
    initMockDetails(uid) {
        document.body.classList.add('noscroll');
        document.querySelector('.edit-panel').scrollTo(0, 0);
        this.$formUri.removeClass('has-error');
        if (!uid) {
            // 没有 uid，说明是新建
            this.resetMockDetails();
            this.$textUri.focus();
        } else {
            // 编辑
            this.uid = uid;
            this.getSettings().then(data => {
                const findOne = data.find(t => t.id === uid);
                this.$textUri.val(findOne.req.url);
                this.$selectMethod.selectlist('selectByValue', findOne.req.method);
                this.$selectStatus.combobox('selectByValue', findOne.res.statusCode);
                this.$selectMime.combobox('selectByValue', findOne.res.contentType || 'application/json');

                let headersInputTxt = '';
                const headers = findOne.res.headers;
                if (typeof headers === 'object') {
                    const headersArr = [];
                    Object.keys(headers).forEach(key => {
                        headersArr.push(`${key}: ${headers[key]}`);
                    });
                    headersInputTxt = headersArr.join('\n');
                }

                let body = findOne.res.body;
                if (typeof body === 'object') {
                    body = JSON.stringify(body, null, 4);
                }

                this.$textHeader.val(headersInputTxt);
                this.$selectMode.val(findOne.res.editorMode || 'json');
                this.initEditor({
                    text: body,
                    mode: findOne.res.editorMode || 'json'
                });
                this.$textDelay.val(findOne.res.delay);
            });
        }
    }

    deleteMockItem(uid) {
        swal({
            text: chrome.i18n.getMessage('DelTip'),
            type: 'warning',
            showCancelButton: true,
            cancelButtonText: chrome.i18n.getMessage('Cancel'),
            confirmButtonText: chrome.i18n.getMessage('Confirm')
        }).then(result => {
            if (result.value) {
                this.getSettings().then(data => {
                    const index = data.findIndex(t => t.id === uid);
                    if (index >= 0) {
                        data.splice(index, 1);
                        chrome.storage.local.set({ data }, () => {
                            this.initMockList();
                            swal({
                                text: chrome.i18n.getMessage('DelDone'),
                                type: 'success',
                                showConfirmButton: false,
                                timer: 1200
                            });
                        });
                    }
                });
            }
        });
    }

    /**
     * 导出mock数据
     */
    exportData(exportObj, exportName) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", exportName + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        $('#btn-new').on('click', () => {
            this.scrollTop = window.scrollY;
            this.$editPanel.css('left', '0');
            setTimeout(() => {
                this.initMockDetails();
            }, 500);
        });

        $('#btn-export').on('click', () => {
            this.getSettings().then(data => {
                this.exportData(data, 'axios_mocker_data');
            });
        });

        this.$btnImport.on('click', () => {
            // 确保选中相同文件时也会触发change事件
            this.$btnImport.val('');
        });

        $('#btn-clear').on('click', () => {
            swal({
                text: chrome.i18n.getMessage('ClearTip'),
                type: 'warning',
                showCancelButton: true,
                cancelButtonText: chrome.i18n.getMessage('Cancel'),
                confirmButtonText: chrome.i18n.getMessage('Confirm')
            }).then(result => {
                if (result.value) {
                    chrome.storage.local.set({ data: [] }, () => {
                        this.initMockList();
                        swal({
                            text: chrome.i18n.getMessage('ClearDone'),
                            type: 'success',
                            showConfirmButton: false,
                            timer: 1200
                        });
                    });
                }
            })
        });

        this.$btnImport.on('change', () => {
            swal({
                text: chrome.i18n.getMessage('ImportTip'),
                type: 'warning',
                showCancelButton: true,
                cancelButtonText: chrome.i18n.getMessage('Cancel'),
                confirmButtonText: chrome.i18n.getMessage('Continue')
            }).then(result => {
                if (result.value) {
                    const file = this.$btnImport[0].files[0];
                    const reader = new FileReader();
                    reader.readAsText(file);
                    reader.onload = () => {
                        const fileContent = reader.result;
                        try {
                            const data = JSON.parse(fileContent);
                            if (!Array.isArray(data)) {
                                return swal({
                                    text: chrome.i18n.getMessage('ArrayTip'),
                                    type: 'error'
                                });
                            }
                            if (!data.every(item => {
                                if (item.req && item.req.url && item.res && item.res.statusCode) {
                                    return true;
                                }
                                return false;
                            })) {
                                return swal({
                                    text: chrome.i18n.getMessage('FormatTip'),
                                    type: 'error'
                                });
                            }

                            // 对数据进行处理
                            data.forEach(item => {
                                item.id = item.id || this.generateId();
                                item.active = item.active !== false;
                                item.comments = item.comments || "";
                                item.req.url = item.req.url.trim();
                                item.req.method = item.req.method ? item.req.method.toUpperCase() : 'GET';
                                item.res.contentType = item.res.contentType || 'application/json';
                                item.res.headers = item.res.headers || {};
                                item.res.editorMode = item.res.editorMode || 'json';
                                item.res.body = item.res.body || (item.res.contentType.indexOf('json') > 0 ? {} : "");
                                item.res.delay = typeof item.res.delay === 'undefined' ? 0 : item.res.delay;
                            });

                            chrome.storage.local.set({ data }, () => {
                                this.initMockList();
                                swal({
                                    text: chrome.i18n.getMessage('ImportDone'),
                                    type: 'success',
                                    showConfirmButton: false,
                                    timer: 1200
                                });
                            });
                        } catch (err) {
                            console.error(err);
                            swal({
                                text: chrome.i18n.getMessage('FormatTip'),
                                type: 'error'
                            });
                        }
                    };
                }
            });

        });

        $('#data').on('change', '.cb-active', event => {
            const el = event.currentTarget;
            const li = el.parentElement.parentElement.parentElement;
            if (el.checked) {
                li.classList.remove('inactive');
            } else {
                li.classList.add('inactive');
            }
            const uid = el.dataset.uid;
            this.getSettings().then(data => {
                const findOne = data.find(t => t.id === uid);
                if (findOne) {
                    findOne.active = el.checked;
                    chrome.storage.local.set({ data });
                }
            });
        });

        $('#data').on('click', '.div-left', event => {
            this.scrollTop = window.scrollY;
            this.$editPanel.css('left', '0');
            setTimeout(() => {
                const el = event.currentTarget;
                const uid = el.dataset.uid;
                this.initMockDetails(uid);
            }, 500);
        });

        $('#data').on('click', '.btn-del', event => {
            const el = event.currentTarget;
            const uid = el.dataset.uid;
            this.deleteMockItem(uid);
        });

        window.onresize = () => {
            if (this.editor && this.$editPanel.is(':visible')) {
                this.editor.layout();
            }
        };

        $('.btn-back').on('click', () => {
            this.$editPanel.css('left', '100%');
            setTimeout(() => {
                this.resetMockDetails();
            }, 500);
            this.initMockList();
            document.body.classList.remove('noscroll');
            window.scrollTo(0, this.scrollTop);
        });

        this.$textStatus.on('blur', () => {
            // 如果没有填写或选中，则默认200
            if (!this.$selectStatus.combobox('selectedItem').text) {
                this.$selectStatus.combobox('selectByValue', '200');
            }
        });

        this.$textMime.on('blur', () => {
            // 如果没有填写或选中，则默认json
            if (!this.$selectMime.combobox('selectedItem').text) {
                this.$selectMime.combobox('selectByValue', 'application/json');
            }
        });

        this.$textDelay.on('blur', () => {
            // 如果没有填写，则默认0
            if (!this.$textDelay.val().trim()) {
                this.$textDelay.val('0');
            }
        });

        this.$btnSave.on('click', () => {
            this.saveSettings();
        });

        this.$textUri.on('input', () => {
            if (this.$textUri.val().trim()) {
                this.$formUri.removeClass('has-error');
            }
        });

        this.$selectMode.on('change', () => {
            const text = this.editor.getValue();
            const mode = this.$selectMode.children('option:selected').val();
            this.initEditor({
                text,
                mode
            });
        });

        this.$selectMime.on('changed.fu.combobox', (event, data) => {
            const mime = data.text;
            switch (mime) {
                case 'application/json':
                    this.$selectMode.val('json').change();
                    break;
                case 'text/html':
                    this.$selectMode.val('html').change();
                    break;
                case 'application/javascript':
                    this.$selectMode.val('javascript').change();
                    break;
                case 'text/css':
                    this.$selectMode.val('css').change();
                    break;
                default:
                    this.$selectMode.val('plaintext').change();
            }
        });

        // Ctrl+S 保存修改
        $(window).on('keydown', event => {
            if (event.ctrlKey || event.metaKey) {
                if (String.fromCharCode(event.which).toLowerCase() === 's') {
                    event.preventDefault();
                    this.$btnSave.click();
                }
            }
        });

        chrome.storage.local.onChanged.addListener(changes => {
            if (changes.active) {
                if (changes.active.newValue) {
                    document.body.classList.add('active');
                } else {
                    document.body.classList.remove('active');
                }
            }
        });
    }

    /**
     * 比较版本号大小
     * a大于b，则返回1
     * a小于b，则返回-1
     * a=b，则返回0
     *
     * @param {*} a
     * @param {*} b
     * @returns
     * @memberof Mocker
     */
    versionCompare(a, b) {
        if (a === b) {
            return 0;
        }

        const a_components = a.split(".");
        const b_components = b.split(".");

        const len = Math.min(a_components.length, b_components.length);

        for (let i = 0; i < len; i++) {
            if (parseInt(a_components[i]) > parseInt(b_components[i])) {
                return 1;
            }

            if (parseInt(a_components[i]) < parseInt(b_components[i])) {
                return -1;
            }
        }

        if (a_components.length > b_components.length) {
            return 1;
        }

        if (a_components.length < b_components.length) {
            return -1;
        }

        return 0;
    }

    /**
     * 检查更新
     *
     * @memberof Mocker
     */
    checkUpdate() {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status >= 200 && xhr.status < 400) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        const latestVersion = data[0].tag_name.replace('v', '');
                        if (this.versionCompare(latestVersion, this.version) === 1) {
                            document.querySelector('#update-info').innerHTML = `<a class="text-danger" href="https://github.com/eshengsky/axios-mocker/releases/tag/v${latestVersion}" target="_blank">${chrome.i18n.getMessage("checkedNew")}</a>`;
                        }
                    } catch (err) { }
                }
            }
        };
        xhr.open('GET', 'https://api.github.com/repos/eshengsky/axios-mocker/releases', true);
        xhr.send();
    }
}

new Mocker();
