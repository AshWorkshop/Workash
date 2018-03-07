//index.js
var wxRequest = require('../../utils/wxRequest.js');
var wxApi = require('../../utils/wxApi.js');
var util = require('../../utils/util.js');
var config = require('../../utils/config.js').config;
var Promise = require('../../plugins/es6-promise.js');
var Worker = require('../../utils/worker/Worker.js').Worker;
var loaders = require('../../utils/worker/loaders.js');

//获取应用实例
const app = getApp()

Page({
  data: {
    totalHours: 0,
    userInfo: {},
    hasUserInfo: false,
    hasWorkerInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  hoursTap: function() {
    console.log('Going to works-view')
    wx.navigateTo({
      url: '../works/works',
    })
  },
  bindHoursChange: function(e) {
    if (this.data.totalHoursRange) {
      console.log('totalHours Change: ' + e.detail.value);
      this.setData({
        totalHours: this.data.totalHoursRange[e.detail.value].totalHours,
        partName: this.data.totalHoursRange[e.detail.value].name
      });
      if (e.detail.value != 0) {
        wx.setStorageSync('defaultPartUrl', this.data.totalHoursRange[e.detail.value].url);
      } else {
        wx.setStorageSync('defaultPartUrl', null);
      }
      
    }
  },
  addWorkTap: function () {
    console.log('Going to add-work-view')
    if (app.globalData.worker) {
      wx.navigateTo({
        url: '/pages/works/add/add',
      })
    } else {
      app.workerReadyCallback = () => {
        wx.navigateTo({
          url: '/pages/works/add/add',
        })
      }
    }
  },
  onLoad: function () {
    // wx.showToast({
    //   title: '正在加载数据...',
    //   icon: 'loading',
    //   duration: 10000
    // })
    wx.showLoading({
      title: '正在加载数据...',
    });
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    //-------------------- Get WorkerInfo --------------------
    var sessionid = app.globalData.sessionid
    app.globalData.worker = null;
    if (sessionid) {
      this.getWorkerInfo(sessionid)
    } else {
      app.loginCallback = sessionid => {
        this.getWorkerInfo(sessionid)
      }
    }
    //--------------------------------------------------------

  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getWorkerInfo: function(sessionid) {
    var host = config.host
    var that = this
    var workerInfo = null
    console.log('Start handling worker info...')
    wxRequest.getRequest(host + 'worker/getworker/', {}, sessionid).then(res => {
      workerInfo = res.data
      console.log('workerInfo: ' + workerInfo.url)
    }).catch(res => {
      if (res.statusCode == 404){
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

          this.setData({
            totalHours: parts[defaultIndex].totalHours,
            totalHoursRange: parts,
            totalHoursDefault: defaultIndex,
            partName: parts[defaultIndex].name
          });
          // ---------- Has worker info callback ----------
          if (app.workerReadyCallback) {
            app.workerReadyCallback();
          }
          // ----------------------------------------------
          wx.hideLoading();
          
        }).catch(res => {
          console.log(res);
        });
      }).catch(res => {
        console.log(res);
      });
      
    })
  }
})
