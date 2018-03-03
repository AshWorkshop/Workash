var Promise = require('../plugins/es6-promise.js')

function wxPromisify(f) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        if (res.statusCode == 200 || res.statusCode == 201){
          resolve(res)
        } else {
          reject(res)
        }
        
      }
      obj.fail = function (res) {
        reject(res)
      }
      f(obj)
    })
  }
}

Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => {throw reason})
  );
};

function getRequest(url, data, sessionid) {
  var getRequest = wxPromisify(wx.request)
  return getRequest({
    url: url,
    method: 'GET',
    data: data,
    header: {
      'Content-Type': 'application/json',
      'WXSESSION': sessionid
    }
  })
}

function postRequest(url, data, sessionid) {
  var postRequest = wxPromisify(wx.request)
  return postRequest({
    url: url,
    method: 'POST',
    data: data,
    header: {
      'Content-Type': 'application/json',
      'WXSESSION': sessionid
    }
  })
}

function putRequest(url, data, sessionid) {
  var putRequest = wxPromisify(wx.request);
  return putRequest({
    url: url,
    method: "PUT",
    data: data,
    header: {
      'Content-Type': 'application/json',
      'WXSESSION': sessionid
    }
  });
}

module.exports = {
  postRequest: postRequest,
  getRequest: getRequest,
  putRequest: putRequest
}
