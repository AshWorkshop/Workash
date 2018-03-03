// pages/projects/detail/detail.js
var Project = require('../../../utils/worker/Project.js').Project;
var Worker = require('../../../utils/worker/Worker.js').Worker;
var loaders = require('../../../utils/worker/loaders.js');
var config = require('../../../utils/config.js').config;
var wxRequest = require('../../../utils/wxRequest.js');
var wxApi = require('../../../utils/wxApi.js');
var util = require('../../../utils/util.js');
var Promise = require('../../../plugins/es6-promise.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShare: false,
    isActive: true,
    isCreate: false,
    isShareHidden: false,
    isManager: false,
    isReadOnly: true,
    begin: "2018-02-22",
    end: "2018-02-28",
    status: "进行中",
    submitText: "更新",
    submitType: "default",
    submitDisable: false,
    shareText: "分享",
    addPartText: "参与项目",
    addPartDisable: false,
    returnText: "返回主页",
    project: null,
    url: null
  },
  formSubmit: function(e) {
    var data = e.detail.value;
    var app = getApp();
    var sessionid = app.globalData.sessionid;
    data.begin = this.data.begin;
    data.end = this.data.end;
    data.is_active = this.data.isActive;
    console.log(data);
    this.setData({
      submitDisable: true,
      submitText: "提交中..."
    });
    if (this.data.isCreate) {
      wxRequest.postRequest(config.host + 'worker/projects/', data, sessionid).then(res => {
        console.log(res);
        wx.showToast({
          title: '创建成功！'
        });
        wx.redirectTo({
          url: '/pages/projects/detail/detail?url=' + res.data.url,
        })
      }).catch(res => {
        console.log(res);
        wx.showToast({
          title: '创建失败！'
        });
      }).finally(res => {
        this.setData({
          submitDisable: false,
          submitText: "创建"
        });
      });
    } else {
      wxRequest.putRequest(this.data.url, data, sessionid).then(res => {
        console.log(res);
        wx.showToast({
          title: '更新成功！'
        });
        wx.redirectTo({
          url: '/pages/projects/detail/detail?url=' + res.data.url,
        })
      }).catch(res => {
        console.log(res);
        wx.showToast({
          title: '更新失败！'
        });
      }).finally(res => {
        this.setData({
          submitDisable: false,
          submitText: "更新"
        });
      });
    }
  },
  bindReturnTap: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  bindBeginDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      begin: e.detail.value
    })
  },
  bindEndDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      end: e.detail.value
    })
  },
  switchChange: function (e) {
    console.log(e);
    this.setData({
      isActive: e.detail.value
    });
    if (this.data.isActive) {
      this.setData({
        status: "进行中"
      });
    } else {
      this.setData({
        status: "已结束"
      });
    }
  },
  bindAddPartTap: function (){
    var app = getApp();
    wx.showLoading({
      title: '正在加载数据...',
    })
    this.getWorkerInfo(app.globalData.sessionid);
    if (app.globalData.worker) {
      if (app.globalData.worker.isPropLoaded) {
        this.updateWorkerParts(app.globalData.worker.participations);
      } else {
        app.workerReadyCallback = () => {
          this.updateWorkerParts(app.globalData.worker.participations);
        }
      }
      
    } else {
      app.workerReadyCallback = () => {
        this.updateWorkerParts(app.globalData.worker.participations);
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var app = getApp();
    console.log(options);
    if (options.share) {
      this.setData({
        isShare: true,
        isShareHidden: true
      });
    }
    if (app.globalData.isLogin) {
      if (options.url) {
        this.setData({
          url: options.url
        });
        this.getProject(options.url);
      } else {
        this.showProjectForm();
      }
      
    } else {
      if (options.url){
        this.setData({
          url: options.url
        });
        app.loginCallback = () => {
          this.getProject(options.url);
        }
      } else {
        app.loginCallback = () => {
          this.showProjectForm();
        }
      }
      
    }
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title: '分享工作项目',
      path: '/pages/projects/detail/detail?url=' + this.data.url + '&share=true',
      success: function (res) {

      },
      fail: function (res) {

      }
    }
  },
  getProject: function (url) {
      let app = getApp();
      let project = new Project({
        url: url,
        loadData: { sessionid: app.globalData.sessionid },
        loader: loaders.projectLoader
      });
      this.setData({
        project: project
      });
      wx.showLoading({
        title: '正在加载数据...',
      })
      this.data.project.load().then(res => {
        console.log(project);
        this.data.project.loadProps().then(res => {
          console.log(project);
          this.setData({
            isActive: project.isActive,
            begin: project.begin,
            end: project.end,
            name: project.name,
            detail: project.detail
          });
          if (project.isActive) {
            this.setData({
              status: "进行中"
            });
          } else {
            this.setData({
              status: "已结束"
            });
          }
          if (project.manager.url == app.globalData.worker.url) {
            this.setData({
              isManager: true
            });
          } else {
            console.log('readonly')
            this.setData({
              isManager: false
            });
          }
          this.setData({
            isReadOnly: this.data.isShare || !this.data.isManager
          })
        }).catch(res => {
          console.log(res);
        })
      }).catch(res => {
        console.log(res);
      }).finally(res => {
        wx.hideLoading();
      })
    },
    showProjectForm: function () {
      this.setData({
        isShare: false,
        isCreate: true,
        isActive: true,
        isManager: true,
        isShareHidden: true,
        isReadOnly: false,
        begin: util.formatDate(new Date()),
        end: util.formatDate(new Date()),
        status: "进行中",
        submitText: "创建",
        submitType: "primary",
        shareText: "分享",
        addPartText: "参与项目",
        returnText: "返回主页",
        project: null
      })
    },
    getWorkerInfo: function (sessionid) {
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
    },
    updateWorkerParts: function (parts) {
      var app = getApp();
      let requestParts = [];
      console.log('参与项目');
      for (let part of parts) {
        requestParts.push(part.url);
      }
      requestParts.push(this.data.url);
      console.log(requestParts);
      this.setData({
        addPartDisable: true,
        addPartText: "提交中..."
      });
      wxRequest.putRequest(app.globalData.worker.url, { participations: requestParts }, app.globalData.sessionid).then(res => {
        console.log('Successfully update worker participations!');
        console.log(res);
        wx.switchTab({
          url: '/pages/index/index',
        });
      }).catch(res => {
        console.log('Update worker participations failed!');
        console.log(res);
      }).finally(res => {
        this.setData({
          addPartDisable: false,
          addPartText: "参与项目"
        });
      })
    }
})