import Vue from 'vue';
import Vuem from './Vuem';

Vue.use(Vuem);

export default new Vuem({
  data : {
  },
  computed : {},
  watch    : {},
  methods  : {},
  models   : {
    UI : {
      data : {
        toolbar : true,
        footer  : true,
      },
      computed : {},
      watch    : {},
      models   : {
      },
    },
  },
});
