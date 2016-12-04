/**
 * Created by wuyue07 on 16/11/28.
 */

Vue.config.devtools = true;

mocha.setup('bdd');

var expect = chai.expect;

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
    tabId: null,
    fileStatus: -99,
    decode: 0
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
      try{
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
        _this.fileStatus = 0;
      }
      catch (e){
        this.fileStatus = -1;
      }
    },

    generateInsertCode: function () {
      var i, j, k, len = this.map.length;
      for(i = 0; i < len; i++){
        this.dom[this.map[i].event] = {
          selector: this.map[i].dom
        };

        for(j = 0; j < this.map[i].reports.length; j++){
          for(k in this.map[i].reports[j]){
            if(this.map[i].reports[j].hasOwnProperty(k)){
              var match = this.map[i].reports[j][k].match(/{{(\w+)}}/);
              if(match){
                this.dom[this.map[i].event][match[1]] = []; //href, innerHTML and so on
              }
            }
          }
        }

        switch (this.map[i].event){
          case 'init':
            this.code.push({
              name: this.map[i].event,
              reports: this.map[i].reports,
              order: this.map[i].order,
              code: ``
            });
            break;
          case 'scroll':
            this.code.push({
              name: this.map[i].event,
              reports: this.map[i].reports,
              order: this.map[i].order,
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
              order: this.map[i].order,
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
              order: this.map[i].order,
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
          if(request === 'content script ready' && _this.tabId){
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
          promise.then(function(reports) {
            //console.log(JSON.stringify(reports));
            _this.mochaDescribe(reports, _this.code[index]);
            if(index + 1 < _this.code.length){
              promiseLoop(index + 1);
            }
            else{
              chrome.tabs.remove(_this.tabId, function () {
                _this.tabId = null;
              });
              mocha.run(); //need dom length ready
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
            report[tempAry[0]] = _this.decode ? decodeURI(tempAry[1]) : tempAry[1];
          }
        }
        reports.push(report);

        clearTimeout(id);
        id = setTimeout(function () {
          //var distNum = code.reports.length * _this.dom[code.name].length;
          //var receivedNum = reports.length;
          //console.log(code.name, receivedNum, distNum);
          
          resolve(reports);
          chrome.webRequest.onBeforeRequest.removeListener(handle);
        }, 1000);

        return {cancel: true}; //block http report sending
      };

      chrome.webRequest.onBeforeRequest.addListener(handle, {urls: [_this.reportUrl]}, ['blocking']);

    },

    mochaDescribe: function (reports, code) {
      var _this = this;
      var len = code.reports.length * _this.dom[code.name].length;
      var describeCode = `
      describe('${code.name} ${_this.dom[code.name].selector}', function() {
        it('should sending ${len} HTTP reports as expected', function() {
          expect(reports).to.have.length(len);
        });

        if(reports.length === len){
          it('should sending the same content as expected', function() {
            var i, findReport;

            if(_this.dom[code.name].length > 1){ //multiple dom condition

            }
            else{
              if(code.order){ //same order as expected
                for(i = 0; i < len; i ++){
                  console.log(code.name);
                  console.log(JSON.stringify(reports[i]), '\\n', JSON.stringify(code.reports[i]));
                  expect(reports[i]).to.deep.equal(code.reports[i]);
                }
              }
              else{ //do not need to have the same order
                for(i = 0; i < len; i ++){
                  findReport = function (reports) {
                    var key, codeArray = [];
                    for(key in code.reports[i]){
                      if(code.reports[i].hasOwnProperty(key)){
                        if(typeof code.reports[i][key] === 'string'){
                          codeArray.push('reports["' + key + '"] === "' + code.reports[i][key] + '"');
                        }
                        else{
                          codeArray.push('reports["' + key + '"] === ' + code.reports[i][key]);
                        }
                      }
                    }
                    return eval(codeArray.join('&&'));
                  };
                  console.log(code.name);
                  console.log(JSON.stringify(reports[i]), '\\n', JSON.stringify(code.reports[i]));
                  expect(reports.find(findReport)).to.not.equal(undefined);
                }
              }
            }
          });
        }
      });
      `;

      eval(describeCode);
    },

    startTesting: function () {
      this.openWebsite();
      this.showResult = true;
    }
  }
});