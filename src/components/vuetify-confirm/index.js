/* eslint-disable no-param-reassign */
import Confirm from './Confirm.vue';

function Install(Vue, options = {}) {
  const property = options.property || '$confirm';
  delete options.property;
  const { vuetify } = options;
  delete options.vuetify;
  if (!vuetify) {
    console.warn('Module vuetify-confirm needs vuetify instance. Use Vue.use(VuetifyConfirm, { vuetify })');
  }
  const Ctor = Vue.extend({ vuetify, ...Confirm });
  function createDialogCmp(opt) {
    const container = document.querySelector('[data-app=true]') || document.body;
    return new Promise((resolve) => {
      const cmp = new Ctor({
        propsData: { ...Vue.prototype[property].options, ...opt },
        destroyed: () => {
          container.removeChild(cmp.$el);
          resolve(cmp.value);
        },
      });
      container.appendChild(cmp.$mount().$el);
    });
  }

  function show(message, opt = {}) {
    opt.message = message;
    return createDialogCmp(opt);
  }

  Vue.prototype[property] = show;
  Vue.prototype[property].options = options || {};
}

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Install);
}

export default Install;
