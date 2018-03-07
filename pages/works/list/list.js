// pages/works/list/list.js
var Project = require('../../../utils/worker/Project.js').Project;
var loaders = require('../../../utils/worker/loaders.js');
var util = require('../../../utils/util.js');

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      project: null,
      works: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let workerPromises = [];
    let wxUserPromises = [];
    if(options.url) {
      let project = new Project({
        url: options.url,
        loadData: {sessionid: app.globalData.sessionid},
        loader: loaders.projectLoader
      });
      let works = [];
      project.load().then(res => {
        project.loadProps().then(res => {
          if(options.isPart) {
            let workerUrl = app.globalData.worker.url;
            for (let work of project.works) {
              if(work.worker.url == workerUrl) {
                works.push(work);
              }
            }
          } else {
            works = project.works;
          }
          for (let work of works) {
            workerPromises.push(() => {
              return work.worker.load.apply(work.worker);
            })
            work.time = util.formatTime(new Date(work.created));
          }
          util.queue(workerPromises, 5).then(res => {
            for (let work of works) {
              wxUserPromises.push(() => {
                return work.worker.wxUser.load.apply(work.worker.wxUser);
              });
            }
            util.queue(wxUserPromises, 5).then(res => {
              this.setData({
                works: works
              });
            })
            
          });
          
        });
      })
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})