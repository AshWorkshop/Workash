//index.js
var wxRequest = require('../../utils/wxRequest.js');
var wxApi = require('../../utils/wxApi.js');
var util = require('../../utils/util.js');
var requests = require('../../utils/requests.js');
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
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载

    var sessionid = app.globalData.sessionid
    app.globalData.worker = null;
    if (sessionid) {
      requests.getWorker(sessionid)
    } else {
      app.loginCallback = sessionid => {
        requests.getWorker(sessionid)
      }
    }
  },
  onLoad: function () {
    // wx.showToast({
    //   title: '正在加载数据...',
    //   icon: 'loading',
    //   duration: 10000
    // })
    wx.showNavigationBarLoading(); //在标题栏中显示加载
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
    let data = null;
    app.globalData.worker = null;
    if (sessionid) {
      requests.getWorker(sessionid, this)
    } else {
      app.loginCallback = sessionid => {
        requests.getWorker(sessionid, this)
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
})
