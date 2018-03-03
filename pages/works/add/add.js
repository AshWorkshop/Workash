// pages/works/add/add.js
var wxRequest = require('../../../utils/wxRequest.js')
var wxApi = require('../../../utils/wxApi.js')
var util = require('../../../utils/util.js')
var config = require('../../../utils/config.js').config
var Promise = require('../../../plugins/es6-promise.js')

//获取应用实例
const app = getApp()

Page({
  data: {
    date: "2018-02-22",
    submitDisabled: false,
    submitText: "提交",
  },
  formSubmit: function (e) {
    var data = e.detail.value;
    var app = getApp();
    data.date = this.data.date;
    data.project = this.data.rangeArray[1][this.data.indexArray[1]].url;
    console.log('form发生了submit事件，携带数据为：', data);
    if (data.project) {
      // wx.showLoading({
      //   title: '正在提交...',
      // });
      this.setData({
        submitDisabled: true,
        submitText: "提交中..."
      })
      wxRequest.postRequest(config.host + 'worker/works/', data, app.globalData.sessionid).then(res => {
        console.log(res);
        if (! (data.project in app.globalData.worker.participationUrls)) {
          let parts = [];
          for (let part of app.globalData.worker.participations) {
            parts.push(part.url);
          }
          parts.push(data.project);
          wxRequest.putRequest(app.globalData.worker.url, {participations: parts}, app.globalData.sessionid).then(res => {
            console.log('Successfully update worker parts');
          }).catch(res => {
            console.log('Update worker parts failed');
          }).finally(res => {
            wx.showToast({
              title: '提交成功！'
            });
            wx.switchTab({
              url: '../../index/index'
            });
          })
        } else {
          wx.showToast({
            title: '提交成功！'
          });
          wx.switchTab({
            url: '../../index/index'
          });
        }
        
      }).catch(res => {
        wx.showToast({
          title: '提交失败！',
          icon: 'fail'
        })
      }).finally(res => {
        // wx.hideLoading();
        this.setData({
          submitDisabled: false,
          submitText: "提交"
        });
      })
    } else {
      console.log('没有Project');
    }
    
  },
  formReset: function () {
    console.log('form发生了reset事件')
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  bindProjectChange: function (e){
    console.log('picker发送选择改变，携带值为', e);
    if (this.data.rangeArray[1].length == 0) {
      this.setData({
        indexArray: e.detail.value,
        defaulIndexArray: e.detail.value,
        projectName: "请添加或创建项目"
      })
    } else {
      this.setData({
        indexArray: e.detail.value,
        defaulIndexArray: e.detail.value,
        projectName: this.data.rangeArray[1][e.detail.value[1]].name
      });
      wx.setStorageSync('savedProjectUrl', this.data.rangeArray[1][e.detail.value[1]].url);
    }
    
  },
  bindProjectColumnChange: function (e){
    console.log('picker发送选择改变，携带值为', e);
    let col = e.detail.column;
    let index = e.detail.value;
    let rangeArray = this.data.rangeArray;
    if (col == 0) {
        if (index == this.data.defaultIndexArray[0]) {
          this.setData({
            indexArray: this.data.defaultIndexArray,
          });
          if (index == 0) {
            rangeArray[1] = this.data.parts;
          } else if (index == 1) {
            rangeArray[1] = this.data.projects;
          }
        } else {
          this.setData({
            indexArray: [index, 0],
          });
          if (index == 0) {
            rangeArray[1] = this.data.parts;
          } else if (index == 1) {
            rangeArray[1] = this.data.projects;
          }
        }
        this.setData({
          rangeArray: rangeArray.concat()
        })
    } else if (col == 1) {
    }
  },
  bindAddPartTap: function (){
    console.log('Going to add-part-page');
    wx.redirectTo({
      url: '../../projects/detail/detail',
    })
  },
  onLoad: function() {
    console.log('Add-View load')

    let rangeArray = [[{name: '已参加的'}, {name: '我创建的'}], []];
    let indexArray = [0, 0];
    let projectName = "请选择";
    let projects = app.globalData.worker.projects.concat();
    let parts = app.globalData.worker.participations.concat();
    let projectUrls = app.globalData.worker.projectUrls;
    let partUrls = app.globalData.worker.participationUrls;

    this.setData({
      parts: parts,
      projects: projects,
    });

    let savedProjectUrl = wx.getStorageSync('savedProjectUrl') || "None";

    if (savedProjectUrl in partUrls) {
      rangeArray[1] = parts;
      indexArray = [0, partUrls[savedProjectUrl]];
      projectName = rangeArray[1][indexArray[1]].name;
    } else if (savedProjectUrl in projectUrls) {
      rangeArray[1] = projects;
      indexArray = [1, projectUrls[savedProjectUrl]];
      projectName = rangeArray[1][indexArray[1]].name;
    } else {
      rangeArray[1] = parts;
      indexArray = [0, 0];
    }

    this.setData({
      date: util.formatDate(new Date()),
      projectName: projectName,
      rangeArray: rangeArray.concat(),
      indexArray: indexArray.concat(),
      defaultIndexArray: indexArray.concat(),
    })
  }
})