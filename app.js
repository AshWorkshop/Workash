var wxRequest = require('./utils/wxRequest.js')
var wxApi = require('./utils/wxApi.js')
var config = require('./utils/config.js').config

//app.js
App({
  onLaunch: function () {
    wx.setEnableDebug({
      enableDebug: false,
    });
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var that = this;
    var host = config.host;
    // 登录
    wx.showLoading({
      title: '正在获取登录信息...',
    })
    var wxLogin = wxApi.wxLogin()
    wxLogin().then(res => {
      var code = res.code
      console.log('code: ' + code)
      return wxRequest.postRequest(host + 'wx/login/', {code: code})
    }).then(res => {
      var sessionid = res.data
      console.log('sessionid: ' + sessionid)
      that.globalData.sessionid = sessionid
      that.globalData.isLogin = true;
      if (that.loginCallback) {
        that.loginCallback(sessionid);
      }

      // 获取用户信息
      var wxGetSetting = wxApi.wxGetSetting()
      wxGetSetting().then(res => {
        console.log('Getting userinfo')
        if (res.authSetting['scope.userInfo']) {
          that.getUserInfo(sessionid);
        } else {
          that.getUserInfo(sessionid);
        }
        // } else {
        //   console.log('Not auth');
        //   wx.openSetting({
        //     success: res => {
        //       console.log(res);
        //       if(res.authSetting['scop.userInfo']) {
        //         that.getUserInfo(sessionid);
        //       }
        //     }
        //   })
        // }
      }).catch(res => {
        console.log(res);
      })
    }).catch(res => {
      console.log('login failed');
      console.log(res);
    }).finally(res => {
      wx.hideLoading();
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              //console.log(this.globalData.sessionid)

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  getUserInfo: function (sessionid) {
    var wxGetUserInfo = wxApi.wxGetUserInfo({ withCredentials: true })
    var that = this;
    wxGetUserInfo().then(res => {
      wxRequest.postRequest(config.host + 'wx/wxuserinfo/', {
        encryptedData: res.encryptedData,
        iv: res.iv
      }, sessionid).then(res => {
        console.log('Successfully update WxUser Info');
        that.globalData.isUserInfoUpdated = true;
        if (that.userInfoUpdateCallback) {
          that.userInfoUpdateCallback();
        }
      }).catch(res => {
        console.log('Get wxuser info failed');
        console.log(res);
      })
    }).catch(res => {
      console.log('Get userinfo failed');
      console.log(res);
    })
  },
  globalData: {
    userInfo: null,
    sessionid: null,
    workerInfo: null,
    worksInfoReady: false,
    isLogin: false
  }
})