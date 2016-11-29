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
    code: [],
    tabId: null
  },

  created: function () {},

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
            this.code.push({
              name: this.map[i].event,
              reports: this.map[i].reports,
              code: `
              var scrollDoms = document.querySelectorAll('${this.map[i].dom}');
              for (var i = 0; i < scrollDoms.length; i++){
                scrollDoms[i].scrollTop = scrollDoms[i].offsetHeight;
              }`
            });
            break;
          case 'click':
            this.code.push({
              name: this.map[i].event,
              reports: this.map[i].reports,
              code: `
              var clickDoms = document.querySelectorAll('${this.map[i].dom}');
              var event;
              for (var i = 0; i < clickDoms.length; i++){
                event = new MouseEvent('click', {
                  'view': window,
                  'bubbles': true,
                  'cancelable': true
                });
                event.preventDefault();
                clickDoms[i].dispatchEvent(event);
              }`
            });
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
        var i, len = _this.code.length;
        var promiseArray = [];
        this.tabId = tab.id;
        for(i = 0; i < len; i++){
          promiseArray.push(_this.executeScript(_this.code[i]));
        }
        Promise.all(promiseArray).then(function () {});
      });
    },

    executeScript: function (code) {
      return new Promise((resolve, reject) => {
        this.webRequestListener(code, resolve);
        chrome.tabs.executeScript(this.tabId, {code: code.code});
      });
    },

    webRequestListener: function (code, resolve) {
      var _this = this;
      var distNum = code.reports.length;
      var receivedNum = 0;
      var reports = [];

      chrome.webRequest.onBeforeRequest.addListener(function(details) {
        var reportRaw = details.url.split('?')[1].split('&');
        var report = {}, tempAry;
        var i, len = reportRaw.length;
        
        for(i = 0; i < len; i++){
          tempAry = reportRaw[i].split('=');
          if(tempAry[0] !== '_'){ //filter timestamp
            report[tempAry[0]] = tempAry[1];
          }
        }
        reports.push(report);

        receivedNum += 1;
        if (receivedNum === distNum){
          this.describe(reports, code); //mocha & chai assert
          resolve(); //promise
        }
        
        return {cancel: true}; //block http report sending
      }, {
        urls: [this.reportUrl]
      },
      ['blocking']
      );
    },

    describe: function (reports, code) {
      describe('scroll', function() {
        it('should sending the same length of reports as expected', function() {
          assert.lengthOf(reports.length, code.reports.length);
        });

        it('should sending the same content as expected', function() {
          
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