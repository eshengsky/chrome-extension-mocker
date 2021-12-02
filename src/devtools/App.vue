<template>
  <v-app>
    <v-main>
      <div>
        <v-app-bar
          fixed
          color="white"
        >
          <v-toolbar-title>
            Mocker
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon color="error" v-bind="attrs" v-on="on" @click="turnoff">
                  <v-icon>mdi-pause-circle</v-icon>
                </v-btn>
              </template>
              <span>Stop mock and reload</span>
            </v-tooltip>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="add">
                <v-icon>mdi-plus-circle-outline</v-icon>
              </v-btn>
            </template>
            <span>New</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="importData">
                <v-icon>mdi-import</v-icon>
              </v-btn>
            </template>
            <span>Import</span>
          </v-tooltip>
          <input type="file" ref="inputFile" accept=".json" style="display:none" @change="onChangeFile"/>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon color="primary" v-bind="attrs" v-on="on" @click="exportData">
                <v-icon>mdi-export</v-icon>
              </v-btn>
            </template>
            <span>Export</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon color="error" v-bind="attrs" v-on="on" @click="delAll">
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </template>
            <span>Delete all</span>
          </v-tooltip>
        </v-app-bar>
        <div class="body px-3">
          <template v-if="list.length > 0">
            <v-card
              class="d-flex mb-3 pa-3"
              :class="{ muted: !item.active }"
              outlined
              v-for="item in list"
              :key="item.id"
              @click="edit(item)"
            >
              <div class="left">
                <div class="line-1">
                  <span v-if="item.reqMethod" class="method">{{ item.reqMethod }}</span>
                  <template v-if="item.reqType === 2">
                    <span class="flag">/</span>{{ item.reqUrl }}<span class="flag">/gi</span>
                  </template>
                  <template v-else>
                    {{ item.reqUrl }}
                  </template>
                </div>
                <div class="line-2">
                  <span class="status" :class="(item.status >= 200 && item.status < 400) ? 'success--text' : 'error--text'">{{ item.status }}</span>
                  <span>{{ item.contentType }}</span>
                  <span v-if="item.delay"><v-icon>mdi-clock-outline</v-icon>{{ item.delay }}ms</span>
                </div>
              </div>
              <div class="d-flex align-center flex-grow-0 flex-shrink-0">
                <v-switch
                  v-model="item.active"
                  @click.native.stop
                  @change="onChangeActive(item.id, $event)"
                ></v-switch>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      icon
                      color="red"
                      v-bind="attrs"
                      v-on="on"
                      @click.native.stop="del(item.id)"
                    >
                      <v-icon>mdi-trash-can-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Delete</span>
                </v-tooltip>
              </div>
            </v-card>
          </template>
          <div v-else class="fixed-center">
            <div>No mock data</div>
            <v-btn depressed @click="add">
              CREATE ONE
            </v-btn>
          </div>
        </div>
        <div class="footer"></div>
      </div>
      <v-dialog v-model="dialog" fullscreen>
        <div class="d-flex flex-column" style="height: 100%">
          <div class="flex-grow-1 flex-shrink-0 white" style="padding: 16px 16px 82px;">
            <v-card outlined class="mt-3 px-4 pt-5 card-container">
              <h3>Match Request</h3>
              <div class="card-content">
                <label>URL</label>
                <div class="d-flex">
                  <v-select
                    v-model="details.reqType"
                    :items="matchType"
                    outlined
                    placeholder="All"
                    dense
                    class="req-type flex-grow-0 flex-shrink-0"
                  ></v-select>
                  <v-text-field
                    ref="reqUrl"
                    v-model="details.reqUrl"
                    placeholder="The url to be matched"
                    outlined
                    dense
                    :prefix="details.reqType === 2 ? '/' : ''"
                    :suffix="details.reqType === 2 ? '/gi' : ''"
                    class="req-url flex-grow-1 flex-shrink-0"
                  ></v-text-field>
                </div>
                <label>Method</label>
                <v-select
                  v-model="details.reqMethod"
                  :items="requestMethods"
                  outlined
                  dense
                  style="width: 300px"
                ></v-select>
              </div>
            </v-card>
            <v-alert
              v-if="details.reqUrl"
              icon="mdi-information-outline"
              border="left"
              dense
              text
              type="success"
              class="mt-4 tips"
              style="font-size: 14px;"
            >
              {{ matchTips }}
            </v-alert>
            <v-card outlined class="mt-6 px-4 pt-5 card-container">
              <h3>Mock Response</h3>
              <div class="card-content">
                <div class="d-flex">
                  <div class="flex-grow-0 flex-shrink-0" style="width: 300px;">
                    <label>Status</label>
                    <v-autocomplete
                      v-model="details.status"
                      :items="httpCodes"
                      item-text="code"
                      item-value="code"
                      outlined
                      dense
                      @change="onChangeStatus"
                    ></v-autocomplete>
                  </div>
                  <div class="pl-5 flex-grow-1 flex-shrink-0">
                    <label>Status Text</label>
                    <div class="text-body-1" style="padding-top: 7px;">
                      {{ details.statusText }}
                    </div>
                  </div>
                </div>
                <label>Content Type</label>
                <v-combobox
                  v-model="details.contentType"
                  :items="contentTypes"
                  outlined
                  dense
                  @change="onChangeContentType"
                ></v-combobox>
                <label>Response Headers</label>
                <v-textarea
                  v-model="details.responseHeaders"
                  outlined
                  placeholder="key: value format, support multi pairs with linebreak"
                ></v-textarea>
                <label>Response</label>
                <div class="editor-container" :class="editorCls">
                  <fieldset aria-hidden="true"></fieldset>
                  <div class="editor-wrap">
                    <monaco-editor
                      v-model="details.responseText"
                      :language="details.editorMode"
                      :options="editorOptions"
                      class="editor"
                      @editorDidMount="editorDidMount"
                      @focus="editorCls = 'focused'"
                      @blur="editorCls = ''"
                    />
                  </div>
                  <div class="editor-tool d-flex justify-space-between">
                    <div class="editor-desc flex-grow-1 flex-shrink-0">Support dynamic and random data with <a href="https://github.com/nuysoft/Mock" target="_blank">mock.js</a></div>
                    <div class="d-flex">
                      <div class="mode-label">Language Mode:</div>
                      <v-select
                        v-model="details.editorMode"
                        :items="editorMode"
                        outlined
                        dense
                        hide-details
                        class="select-mode flex-grow-0 flex-shrink-0"
                      ></v-select>
                    </div>
                  </div>
                </div>
                <label>Delay</label>
                <v-text-field
                    v-model="details.delay"
                    outlined
                    dense
                    type="number"
                    suffix="ms"
                    hide-spin-buttons
                    style="width: 300px"
                    @blur="onBlurDelay"
                  ></v-text-field>
              </div>
            </v-card>
          </div>
          <v-app-bar
            fixed
            bottom
            color="white"
            hide-on-scroll
            class="flex-grow-0 flex-shrink-0"
            style="top: auto !important;"
          >
            <v-btn color="primary" width="126" depressed class="mr-3" @click="save">{{ saveText }}</v-btn>
            <v-btn depressed @click="close">CLOSE</v-btn>
          </v-app-bar>
        </div>
        <v-snackbar
          v-model="showAlert"
          :timeout="2000"
        >
          {{ alertMsg }}
          <template v-slot:action="{ attrs }">
            <v-btn
              color="red"
              text
              v-bind="attrs"
              @click="showAlert = false"
            >
              CLOSE
            </v-btn>
          </template>
        </v-snackbar>
      </v-dialog>
      <div v-if="enabled === 'N'" class="enabled-wrap">
        <v-btn icon color="success" x-large @click="turnon">
          <v-icon>mdi-play-circle</v-icon>
        </v-btn>
        <div>Start mock and reload</div>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import MonacoEditor from '../components/MonacoEditor.vue';
import httpCodes from './http-codes.json';

export default {
  components: {
    MonacoEditor,
  },

  data() {
    return {
      dialog: false,
      enabled: 'Y',
      list: [],
      details: {},
      matchType: [{
        value: 1,
        text: 'Fuzzy matching',
      }, {
        value: 2,
        text: 'RegExp matching',
      }],
      requestMethods: [
        {
          value: '',
          text: '<any>',
        },
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'OPTIONS',
        'PATCH',
        'PUT',
        'HEAD',
      ],
      httpCodes: [],
      contentTypes: [
        'application/json;charset=utf-8',
        'text/plain;charset=utf-8',
        'text/html;charset=utf-8',
        'text/css;charset=utf-8',
        'application/javascript;charset=utf-8',
      ],
      editorMode: [{
        value: 'json',
        text: 'JSON',
      }, {
        value: 'plain',
        text: 'Plain Text',
      }, {
        value: 'html',
        text: 'HTML',
      }, {
        value: 'javascript',
        text: 'JavaScript',
      }, {
        value: 'css',
        text: 'CSS',
      }],
      editorOptions: {
        fontSize: 14,
        scrollBeyondLastLine: false,
        minimap: {
          enabled: false,
        },
        scrollbar: {
          // 鼠标放在editor上时依然允许外层滚动
          alwaysConsumeMouseWheel: false,
        },
      },
      editor: null,
      editorCls: '',
      showAlert: false,
      alertMsg: '',
      saveText: '',
    };
  },
  computed: {
    matchTips() {
      let tip = 'When request url ';
      if (this.details.reqType === 2) {
        tip += `match regular expression: /${this.details.reqUrl}/gi, `;
      } else {
        tip += `contains string: ${this.details.reqUrl}, `;
      }
      if (this.details.reqMethod) {
        tip += `and request method is ${this.details.reqMethod}, `;
      }
      tip += 'will send mock response as below.';
      return tip;
    },
  },
  mounted() {
    this.getList();
    this.getEnabled();
    this.httpCodes = httpCodes.sort((v1, v2) => v1.code - v2.code);
    // 窗口大小变化后修正editor
    window.onresize = () => {
      try {
        this.editor.layout();
      } catch (err) {
        console.error(err);
      }
    };
    this.bindShortcut();
    this.saveText = this.getSaveText();
  },
  methods: {
    getSaveText() {
      let saveText = 'SAVE';
      if (navigator.appVersion.indexOf('Win') !== -1) {
        saveText = 'SAVE (Ctrl+S)';
      } else if (navigator.appVersion.indexOf('Mac') !== -1) {
        saveText = 'SAVE (⌘+S)';
      }
      return saveText;
    },
    getList() {
      chrome.storage.sync.get((['mockData']), (result) => {
        this.list = result.mockData || [];
      });
    },
    getEnabled() {
      chrome.storage.sync.get((['enabled']), (result) => {
        this.enabled = result.enabled || 'Y';
      });
    },
    onChangeStatus(code) {
      const findOne = this.httpCodes.find((t) => t.code === code);
      if (findOne) {
        this.details.statusText = findOne.phrase;
      } else {
        this.details.statusText = '';
      }
    },
    onBlurDelay() {
      if (!this.details.delay) {
        this.details.delay = 0;
      }
    },
    add() {
      // 初始化新增弹窗中的数据
      this.details = {
        reqType: 1,
        reqMethod: '',
        status: 200,
        statusText: 'OK',
        contentType: 'application/json;charset=utf-8',
        editorMode: 'json',
        responseText: `{
  "message": "This is mock data!",
  "data|2-5": [{
    "id|+1": 1,
    "name": "@name",
    "email": "@email"
  }]
}`,
        delay: 0,
        active: true,
      };
      this.dialog = true;
      setTimeout(() => {
        this.$refs.reqUrl.focus();
      }, 300);
    },
    edit(item) {
      this.details = item;
      this.dialog = true;
    },
    del(id) {
      this.$confirm('Are you sure you want to delete this mock data?').then((confirm) => {
        if (confirm) {
          chrome.storage.sync.get((['mockData']), (result) => {
            let mockData = result.mockData || [];
            if (!Array.isArray(mockData)) {
              mockData = [mockData];
            }
            const idx = mockData.findIndex((t) => t.id === id);
            if (idx >= 0) {
              mockData.splice(idx, 1);
              chrome.storage.sync.set(({ mockData }), () => {
                console.log('Saved!');
                this.getList();
              });
            }
          });
        }
      });
    },
    close() {
      this.getList();
      this.dialog = false;
    },
    save() {
      if (!this.details.reqUrl) {
        this.alertMsg = 'URL is required!';
        this.showAlert = true;
        return;
      }
      if (!this.details.status) {
        this.alertMsg = 'Status is required!';
        this.showAlert = true;
        return;
      }
      if (!this.details.contentType) {
        this.alertMsg = 'Content Type is required!';
        this.showAlert = true;
        return;
      }
      if (this.details.delay < 0) {
        this.alertMsg = 'Delay value is invalid!';
        this.showAlert = true;
        return;
      }
      const done = () => {
        this.saveText = 'SAVED!';
        setTimeout(() => {
          this.saveText = this.getSaveText();
        }, 1000);
      };
      chrome.storage.sync.get((['mockData']), (result) => {
        let mockData = result.mockData || [];
        if (!Array.isArray(mockData)) {
          mockData = [mockData];
        }
        const { id } = this.details;
        if (!id) {
          // 新增
          this.details.id = Date.now();
          mockData.unshift(this.details);
          chrome.storage.sync.set(({ mockData }), () => {
            console.log('Saved!');
            done();
          });
        } else {
          // 更新
          const idx = mockData.findIndex((t) => t.id === id);
          if (idx >= 0) {
            mockData.splice(idx, 1, this.details);
          }
          chrome.storage.sync.set(({ mockData }), () => {
            console.log('Updated!');
            done();
          });
        }
      });
    },
    onChangeActive(id, active) {
      chrome.storage.sync.get((['mockData']), (result) => {
        const mockData = result.mockData || [];
        const findOne = mockData.find((t) => t.id === id);
        if (findOne) {
          findOne.active = active;
          chrome.storage.sync.set(({ mockData }), () => {
            this.getList();
          });
        }
      });
    },
    onChangeContentType(contentType) {
      if (contentType.indexOf('application/json') >= 0) {
        this.details.editorMode = 'json';
      } else if (contentType.indexOf('text/html') >= 0) {
        this.details.editorMode = 'html';
      } else if (contentType.indexOf('text/css') >= 0) {
        this.details.editorMode = 'css';
      } else if (contentType.indexOf('application/javascript') >= 0) {
        this.details.editorMode = 'javascript';
      } else {
        this.details.editorMode = 'plain';
      }
    },
    editorDidMount(editor) {
      this.editor = editor;
      editor.onDidContentSizeChange(this.updateEditorHeight);
    },
    updateEditorHeight() {
      const contentHeight = Math.max(200, this.editor.getContentHeight());
      document.querySelector('.editor').style.height = `${contentHeight}px`;
      try {
        this.editor.layout();
      } catch (err) {
        console.error(err);
      }
    },
    bindShortcut() {
      window.addEventListener('keydown', (event) => {
        if (this.dialog && (event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault();
          this.save();
        }
      });
    },
    turnoff() {
      this.enabled = 'N';
      chrome.storage.sync.set(({ enabled: 'N' }), () => {
        console.log('Saved!');
      });
    },
    turnon() {
      this.enabled = 'Y';
      chrome.storage.sync.set(({ enabled: 'Y' }), () => {
        console.log('Saved!');
      });
    },
    importData() {
      this.$refs.inputFile.click();
    },
    onChangeFile(e) {
      const { files } = e.target;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const mockData = JSON.parse(reader.result);
          chrome.storage.sync.set(({ mockData }), () => {
            this.getList();
          });
        } catch (err) {
          this.alertMsg = 'Import failed!';
          this.showAlert = true;
        }
      };
      reader.readAsText(files[0]);
    },
    exportData() {
      chrome.storage.sync.get((['mockData']), (result) => {
        const list = JSON.stringify(result.mockData || [], null, 4);
        const link = document.createElement('a');
        const blob = new Blob([list], { type: 'octet/stream' });
        const url = window.URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `mocker-data-${Date.now()}.json`);
        link.click();
      });
    },
    delAll() {
      this.$confirm('Are you sure you want to delete all?').then((confirm) => {
        if (confirm) {
          chrome.storage.sync.set(({ mockData: [] }), () => {
            console.log('Saved!');
            this.getList();
          });
        }
      });
    },
  },
};
</script>
<style lang="scss">
* {
  text-transform: none !important;
}
.v-card--link:before {
  background: transparent !important;
}
.fixed-center {
  position: fixed;
  top: 50%;
  left: 50%;
  text-align: center;
  opacity: .8;
  > div {
    margin-bottom: 4px;
  }
}
.tips .v-icon {
  font-size: 22px !important;
  margin-right: 8px !important;
}
.body {
  padding-top: 76px;
  .muted {
    opacity: .6;
  }
}
.left {
  overflow: hidden;
  flex: 1;
}
.line-1 {
  border-bottom: 1px dashed #ccc;
  font-size: 15px;
  line-height: 26px;
  padding-bottom: 6px;
  margin-right: 20px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  .method {
    font-size: 12px;
    font-weight: 500;
    margin-right: 4px;
    border: 1px solid #ccc;
    border-radius: 3px;
    padding: 1px 5px;
  }
  .flag {
    opacity: .7;
    padding: 0 2px;
  }
}
.line-2 {
  font-size: 14px;
  line-height: 22px;
  padding-top: 12px;
  opacity: .8;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  .status {
    font-weight: 600;
  }
  span {
    margin-right: 8px;
  }
  i {
    font-size: 15px !important;
    line-height: 14px !important;
    margin-right: 1px;
  }
}
.card-container {
  box-shadow: none;
  transition: box-shadow .3s ease;
  &:hover {
    box-shadow: 0 1px 4px rgb(0 0 0 / 30%);
  }
  h3 {
    font-size: 14px;
    font-weight: 500;
    opacity: .8;
    background: #fff;
    padding: 0 10px;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    user-select: none;
  }
  label {
    display: inline-block;
    font-weight: 500;
    font-size: 13px;
    margin-bottom: 8px;
    user-select: none;
    opacity: .8;
  }
  .req-type {
    width: 200px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .req-url {
    margin-left: -1px !important;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  .editor-container {
    position: relative;
    border: 1px solid rgba(0, 0, 0, 0.38);
    border-radius: 4px;
    margin-bottom: 24px;
    &.focused {
      fieldset {
        border: 2px solid #1976d2;
      }
    }
    fieldset {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      margin: -2px;
      border: 0;
      border-radius: 4px;
    }
    .editor-wrap {
      padding: 10px 0;
      .editor {
        width: 100%;
      }
    }
    .editor-tool {
      border-top: 1px solid rgba(0, 0, 0, 0.38);
      padding: 0 10px;
      height: 30px;
      user-select: none;
      .editor-desc,
      .mode-label {
        opacity: .8;
        line-height: 30px;
      }
      .select-mode {
        width: 120px;
        .v-input__control {
          height: 30px !important;
          .v-input__slot {
            min-height: 30px !important;
            fieldset {
              border: 0;
            }
            .v-select__selection--comma {
              font-size: 12px;
              margin-top: 2px;
            }
            .v-input__append-inner {
              margin-top: 3px;
            }
          }
        }
      }
    }
  }
}
.enabled-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 15px;
  background: #fff;
  z-index: 999;
  user-select: none;
}
</style>
