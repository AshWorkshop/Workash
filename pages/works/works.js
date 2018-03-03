// pages/works/works.js
var wxRequest = require('../../utils/wxRequest.js')
var wxApi = require('../../utils/wxApi.js')
var util = require('../../utils/util.js')
var config = require('../../utils/config.js').config
var Promise = require('../../plugins/es6-promise.js')

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    works: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    var that = this
    if (app.globalData.worker.isPropLoaded) {
      that.getWorks()
    } else {
      app.workerReadyCallback = () => {
        that.getWorks()
      }
    }
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
  
  },

  getWorks: function () {
    console.log('Showing works info')
    this.setData({
      works: (app.globalData.worker.works).sort((a, b) => {
        let ta = (new Date(a.created)).getTime()
        let tb = (new Date(b.created)).getTime()
        if (ta > tb) {
          return 1;
        } else if (ta < tb) {
          return -1;
        } else {
          return 0;
        }
      }).reverse()
    })
  }
})