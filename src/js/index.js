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
    dom: {},
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
        this.dom[this.map[i].event] = {
          selector: this.map[i].dom
        };
        switch (this.map[i].event){
          case 'init':
            this.code.push({
              name: this.map[i].event,
              reports: this.map[i].reports,
              code: ``
            });
            break;
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
              var clickEvent;
              for (var i = 0; i < clickDoms.length; i++){
                clickEvent = new MouseEvent('click', {
                  'view': window,
                  'bubbles': true,
                  'cancelable': true
                });
                clickEvent.preventDefault();
                clickDoms[i].dispatchEvent(clickEvent);
              }`
            });
            break;
          case 'hover':
            this.code.push({
              name: this.map[i].event,
              reports: this.map[i].reports,
              code: `
              var hoverDoms = document.querySelectorAll('${this.map[i].dom}');
              var hoverEvent;
              for (var i = 0; i < hoverDoms.length; i++){
                hoverEvent = new MouseEvent('mouseover', {
                  'view': window,
                  'bubbles': true,
                  'cancelable': true
                });
                hoverEvent.preventDefault();
                hoverDoms[i].dispatchEvent(hoverEvent);
              }`
            });
            break;
          default:
            break;
        }
      }
    },

    openWebsite: function () {
      var _this = this;

      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          if(request === 'ready' && _this.tabId){
            chrome.tabs.sendMessage(_this.tabId, _this.dom, function (response) {
              _this.dom = response; //get dom length, href, innerHTML and so on to help assertion
            });
          }
        }
      );

      chrome.tabs.create({
        url: this.url,
        active: true
      }, function (tab){
        _this.tabId = tab.id;

        function promiseLoop(index) {
          var promise = _this.executeScript(_this.code[index]);
          promise.then(function(value) {
            console.log(JSON.stringify(value));
            if(index + 1 < _this.code.length){
              promiseLoop(index + 1);
            }
            else{
              chrome.tabs.remove(_this.tabId, function () {
                _this.tabId = null;
              });
            }
          });
        }

        promiseLoop(0);
      });
    },

    executeScript: function (code) {
      return new Promise((resolve, reject) => {
        this.webRequestListener(code, resolve, reject);
        chrome.tabs.executeScript(this.tabId, {code: code.code});
      });
    },

    webRequestListener: function (code, resolve, reject) {
      var _this = this;
      var reports = [];
      var id;
      var handle = function(details) {
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

        clearTimeout(id);
        id = setTimeout(function () {
          var distNum = code.reports.length * _this.dom[code.name].length;
          var receivedNum = reports.length;
          console.log(code.name, receivedNum, distNum);
          
          resolve(reports);
          chrome.webRequest.onBeforeRequest.removeListener(handle);
        }, 1000);

        return {cancel: true}; //block http report sending
      };

      chrome.webRequest.onBeforeRequest.addListener(handle, {urls: [_this.reportUrl]}, ['blocking']);

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