var Promise = require('../plugins/es6-promise.js')
var config = require('../utils/config.js').config;
var wxRequest = require('../utils/wxRequest.js');
var wxApi = require('../utils/wxApi.js');
var Worker = require('../utils/worker/Worker.js').Worker;
var loaders = require('../utils/worker/loaders.js');

export function getWorker(sessionid, indexPage) {
  var app = getApp();
  var host = config.host
  var that = this
  var workerInfo = null
  console.log('Start handling worker info...')
  wxRequest.getRequest(host + 'worker/getworker/', {}, sessionid).then(res => {
    workerInfo = res.data
    console.log('workerInfo: ' + workerInfo.url)
  }).catch(res => {
    if (res.statusCode == 404) {
      console.log('Worker not exists, creating a new one...')
      return wxRequest.postRequest(host + 'worker/workers/', {}, sessionid).then(res => {
        console.log(res)
        console.log('Successfully created a new worker!')
        workerInfo = res.data
      })
    }
  }).finally(res => {
    console.log('Successfully got worker info!')
    console.log(workerInfo)
    app.globalData.workerInfo = workerInfo;
    app.globalData.worker = new Worker({
      url: workerInfo.url,
      loadData: {
        sessionid: app.globalData.sessionid
      },
      loader: loaders.workerLoader
    });
    app.globalData.worker.load().then(res => {
      console.log(app.globalData.worker);
      app.globalData.worker.loadProps().then(res => {
        console.log(app.globalData.worker);

        let total = 0.0;
        let defaultPartUrl = wx.getStorageSync('defaultPartUrl') || "None";
        let defaultIndex = 0;
        let parts = app.globalData.worker.participations.concat();

        if (defaultPartUrl in app.globalData.worker.participationUrls) {
          defaultIndex = app.globalData.worker.participationUrls[defaultPartUrl] + 1;
        }
        for (let part of parts) {
          total += part.totalHours;
        }
        parts.unshift({ name: "全部", totalHours: total });
        if(indexPage) {
          indexPage.setData({
            totalHours: parts[defaultIndex].totalHours,
            totalHoursRange: parts,
            totalHoursDefault: defaultIndex,
            partName: parts[defaultIndex].name
          });
        }
        // ---------- Has worker info callback ----------
        if (app.workerReadyCallback) {
          app.workerReadyCallback();
        }
        // ----------------------------------------------
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新

      }).catch(res => {
        console.log(res);
      });
    }).catch(res => {
      console.log(res);
    });

  })
}