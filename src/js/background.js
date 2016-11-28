/**
 * Created by wuyue07 on 16/11/27.
 */
chrome.browserAction.onClicked.addListener(function(tab){
  var url = chrome.extension.getURL("src/index.html");
  showIndex(url);
});

function showIndex(disUrl){
  chrome.windows.getAll({"populate": true}, function(window){
    var existTab = null,
      tabs = null;
    for(var i = 0; i < window.length; i++){
      tabs = window[i].tabs;
      for(var j = 0; j < tabs.length; j++){
        if(tabs[j].url === disUrl){
          existTab = tabs[j];
          break;
        }
      }
    }
    if(existTab){
      chrome.tabs.update(existTab.id, {"selected": true});
    }
    else{
      chrome.tabs.create({"url": disUrl, "selected": true});
    }
  });
}