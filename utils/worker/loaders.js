// var Participation = require('./Participation.js').Participation;
var Project = require('./Project.js').Project;
var Worker = require('./Worker.js').Worker;
var Work = require('./Work.js').Work;
var WxUser = require('./WxUser.js').WxUser;

var Promise = require('../../plugins/es6-promise.js');
var wxRequest = require('../wxRequest.js');
var config = require('../config.js').config;

export function workerLoader (url, data) {
  return new Promise((resolve, reject) => {
    if (data.sessionid) {
      let workerInfo = null;
      // wx.showToast({
      //   title: '正在加载Worker...',
      //   icon: 'loading',
      //   duration: 10000
      // });
      wxRequest.getRequest(url, {}, data.sessionid).then(res => {
        workerInfo = res.data;
        console.log('Successfully get worker: ' + workerInfo.url);
        let wxUser = new WxUser({
          url: workerInfo.wxuser,
          loadData: this.loadData,
          loader: wxUserLoader
        });
        this.wxUser = wxUser;
        this.participations = [];
        for (let partInfo of workerInfo.participations) {
          let part = new Project({
            url: partInfo,
            loadData: this.loadData,
            loader: participationLoader,
            works: []
          });
          this.participations.push(part);
        }
        this.projects = [];
        for (let projectInfo of workerInfo.projects) {
          let project = new Project({
            url: projectInfo,
            loadData: this.loadData,
            loader: projectLoader,
          });
          this.projects.push(project);
        }
        this.works = [];
        for (let workInfo of workerInfo.works) {
          let work = new Work({
            url: workInfo,
            loadData: this.loadData,
            loader: workLoader,
          });
          this.works.push(work);
        }
        resolve(res);
      }).catch(res => {
        console.log(res);
        reject(res);
      }).finally(res => {
        // wx.hideToast();
      });
    } else {
      reject("No sessionid!");
    }
  });
}

export function participationLoader (url, data) {
  return new Promise((resolve, reject) => {
    if (data.sessionid) {
      let partInfo = null;
      // wx.showToast({
      //   title: '正在加载Participation...',
      //   icon: 'loading',
      //   duration: 10000
      // });
      wxRequest.getRequest(url, {}, data.sessionid).then(res => {
        partInfo = res.data;
        console.log('Successfully get participation: ' + partInfo.url);
        this.created = partInfo.created;
        this.manager = new Worker({
          url: partInfo.manager,
          loadData: this.loadData,
          loader: workerLoader
        });
        this.name = partInfo.name;
        this.detail = partInfo.detail;
        this.begin = partInfo.begin;
        this.end = partInfo.end;
        this.isActive = partInfo.is_active;
        this.totalHours = 0.0;
        resolve(res);
      }).catch(res => {
        console.log(res);
        reject(res);
      }).finally(res => {
        // wx.hideToast();
      });
    } else {
      reject("No sessionid!");
    }
  });
}

export function projectLoader(url, data) {
  return new Promise((resolve, reject) => {
    if (data.sessionid) {
      let projectInfo = null;
      // wx.showToast({
      //   title: '正在加载Project...',
      //   icon: 'loading',
      //   duration: 10000
      // });
      wxRequest.getRequest(url, {}, data.sessionid).then(res => {
        projectInfo = res.data;
        console.log('Successfully get project: ' + projectInfo.url);
        this.created = projectInfo.created;
        this.manager = new Worker({
          url: projectInfo.manager,
          loadData: this.loadData,
          loader: workerLoader
        });
        this.name = projectInfo.name;
        this.detail = projectInfo.detail;
        this.begin = projectInfo.begin;
        this.end = projectInfo.end;
        this.isActive = projectInfo.is_active;
        this.works = [];
        for (let workInfo of projectInfo.works) {
          let work = new Work({
            url: workInfo,
            loadData: this.loadData,
            loader: workLoader,
          });
          this.works.push(work);
        }
        this.actors = [];
        for (let actorInfo of projectInfo.actors) {
          let actor = new Worker({
            url: actorInfo,
            loadData: this.loadData,
            loader: workerLoader,
          });
          this.actors.push(actor);
        }
        resolve(res);
      }).catch(res => {
        console.log(res);
        reject(res);
      }).finally(res => {
        // wx.hideToast();
      });
    } else {
      reject("No sessionid!");
    }
  });
}


export function workLoader(url, data) {
  return new Promise((resolve, reject) => {
    if (data.sessionid) {
      let workInfo = null;
      // wx.showToast({
      //   title: '正在加载Work...',
      //   icon: 'loading',
      //   duration: 10000
      // });
      wxRequest.getRequest(url, {}, data.sessionid).then(res => {
        workInfo = res.data;
        console.log('Successfully get work: ' + workInfo.url);
        this.created = workInfo.created;
        this.worker = new Worker({
          url: workInfo.worker,
          loadData: this.loadData,
          loader: workerLoader
        });
        this.project = new Project({
          url: workInfo.project,
          loadData: this.loadData,
          loader: projectLoader
        });
        this.name = workInfo.name;
        this.content = workInfo.content;
        this.date = workInfo.date;
        this.hours = workInfo.hours;
        resolve(res);
      }).catch(res => {
        console.log(res);
        reject(res);
      }).finally(res => {
        // wx.hideToast();
      });
    } else {
      reject("No sessionid!");
    }
  });
}


export function wxUserLoader(url, data) {
  return new Promise((resolve, reject) => {
    if (data.sessionid) {
      let info = null;
      // wx.showToast({
      //   title: '正在加载Worker...',
      //   icon: 'loading',
      //   duration: 10000
      // });
      wxRequest.getRequest(url, {}, data.sessionid).then(res => {
        info = res.data;
        console.log('Successfully get info: ' + info.url);
        this.nickName = info.nickName;
        this.avatarUrl = info.avatarUrl;
        this.gender = info.gender;
        resolve(res);
      }).catch(res => {
        console.log(res);
        reject(res);
      }).finally(res => {
        // wx.hideToast();
      });
    } else {
      reject("No sessionid!");
    }
  });
}