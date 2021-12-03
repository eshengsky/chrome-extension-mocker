import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@mdi/font/css/materialdesignicons.css';
import Vuetify from 'vuetify/lib/framework';
import VuetifyConfirm from '../components/vuetify-confirm';

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
});

Vue.use(Vuetify);
Vue.use(VuetifyConfirm, {
  vuetify,
  buttonTrueText: 'OK',
  buttonFalseText: 'CANCEL',
  buttonTrueColor: 'error',
  buttonTrueFlat: false,
  color: 'warning',
  width: 350,
});

export default vuetify;
