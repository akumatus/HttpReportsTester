/**
 * Created by wuyue07 on 16/11/28.
 */

Vue.config.devtools = true;

mocha.setup('bdd');

var assert = chai.assert;

var app = new Vue({
  el: '#app',

  template: '',

  data: {
    showResult: false,
    url: 'https://0.baidu.com/',
    reportUrl: 'http://dr.w.baidu.com/report*',
    map: [],
    code: '',
    reports: []
  },

  created: function () {
    this.webRequestListener();
  },

  methods: {
    chooseMapFile: function () {
      var event = new MouseEvent('click', {
        'view': window,
        'bubbles': true,
        'cancelable': true
      });
      var fileInput = document.getElementById('uploadMapFile');
      if (fileInput) {
        fileInput.dispatchEvent(event);
      }
    },

    saveMap: function (ev) {
      var _this = this;
      var file = ev.target.files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
        var code = e.target.result;
        eval(code);
        _this.map = map;
        _this.generateInsertCode();
      };
      reader.readAsText(file);
    },

    generateInsertCode: function () {
      var i, len = this.map.length;
      for(i = 0; i < len; i++){
        switch (this.map[i].event){
          case 'scroll':
            this.code.push(`
            var scrollDoms = document.querySelectorAll('` + this.map[i].dom + `');
            for (var i = 0; i < scrollDoms.length; i++){
              scrollDoms[i].scrollTop = scrollDoms[i].offsetHeight;
            }
            `);
            break;
          case 'click':
            this.code.push(`
            var clickDoms = document.querySelectorAll('` + this.map[i].dom + `');
            var event;
            for (var i = 0; i < clickDoms.length; i++){
              event = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': true
              });
              event.preventDefault();
              clickDoms[i].dispatchEvent(event);
            }
            `);
            break;
        }
      }
    },
    openWebsite: function () {
      var _this = this;
      chrome.tabs.create({
        url: this.url,
        active: false
      }, function (tab){
        chrome.tabs.executeScript(tab.id, {code: _this.code[0]})
      });
    },

    webRequestListener: function () {
      var _this = this;
      chrome.webRequest.onBeforeRequest.addListener(function(details) {
        var reports = details.url.split('?')[1].split('&');
        var report = {}, tempAry;
        var i, len = reports.length;
        for(i = 0; i < len; i++){
          tempAry = reports[i].split('=');
          if(tempAry[0] !== '_'){ //filter timestamp
            report[tempAry[0]] = tempAry[1];
          }
        }
        _this.reports.push(report);
        console.log(_this.reports);
        return {cancel: true};
      }, {
        urls: [this.reportUrl]
      },
      ['blocking']
      );
    },

    describe: function () {
      describe('Scroll', function() {
        it('should start empty', function() {
          var arr = [];

          assert.equal(arr.length, 0);
        });
      });
    },

    startTesting: function () {
      this.openWebsite();
      this.showResult = true;
      mocha.run();
    }
  }
});