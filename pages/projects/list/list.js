// pages/projects/list/list.js
var util = require('../../../utils/util.js');
var requests = require('../../../utils/requests.js');
var app = getApp();
Page({
  data: {
    /** 
        * 页面配置 
        */
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    parts: [],
    projects: [],
    part_ends: [],
  },
  onProjectTap: function (e) {
    console.log(e);
    wx.navigateTo({
      url: '../detail/detail?url=' + e.currentTarget.id,
    })
  },
  onLoad: function () {
    var that = this;

    /** 
     * 获取系统信息 
     */
    wx.getSystemInfo({

      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }

    });
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;
    var sessionid = app.globalData.sessionid
    app.globalData.worker = null;
    if (sessionid) {
      requests.getWorker(sessionid)
    } else {
      app.loginCallback = sessionid => {
        requests.getWorker(sessionid)
      }
    }
    if (app.globalData.worker) {
      that.getDatas();
    } else {
      app.workerReadyCallback = () => {
        that.getDatas();
      }
    }
  },
  onShow: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var that = this;
    var sessionid = app.globalData.sessionid
    app.globalData.worker = null;
    if (sessionid) {
      requests.getWorker(sessionid)
    } else {
      app.loginCallback = sessionid => {
        requests.getWorker(sessionid)
      }
    }
    if (app.globalData.worker) {
      that.getDatas();
    } else {
      app.workerReadyCallback = () => {
        that.getDatas();
      }
    }
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {

    var that = this;
    that.setData({ currentTab: e.detail.current });

  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {

    var that = this;

    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  getDatas: function () {
    let raw_parts = app.globalData.worker.participations.concat();
    let projects = app.globalData.worker.projects.concat();
    let parts = [];
    let part_ends = [];
    let managerPromises = [];
    let wxUserPromises = [];
    wx.showNavigationBarLoading() //在标题栏中显示加载
    for (let part of raw_parts){
      managerPromises.push(() => {
        return part.manager.load.apply(part.manager)
      })
      if (part.isActive) {
        parts.push(part);
      } else {
        part_ends.push(part);
      }
    }

    for (let project of projects) {
      managerPromises.push(() => {
        return project.manager.load.apply(project.manager)
      })
    }

    util.queue(managerPromises, 5).then(res => {
      for (let part of raw_parts) {
        wxUserPromises.push(() => {
          return part.manager.wxUser.load.apply(part.manager.wxUser)
        })
      }
      for (let part of projects) {
        wxUserPromises.push(() => {
          return part.manager.wxUser.load.apply(part.manager.wxUser)
        })
      }

      util.queue(wxUserPromises, 5).then(res => {
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
        this.setData({
          parts: parts,
          part_ends: part_ends,
          projects: projects
        });
      })
    }).catch(res => {
      console.log(res)
    })

    
  }
})