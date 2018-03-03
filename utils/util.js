var Promise = require('../plugins/es6-promise.js')

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate()
  
  return [year, month, day].map(formatNumber).join('-');
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function queue(fns, count) {
  return new Promise((resolve, reject) => {
    let a = fns.slice(0, count)
    let b = fns.slice(count)
    let l = fns.length
    let runs = 0
    if (fns.length == 0) return resolve()
    for (let fn of a) {
      fn().then(() => {
        runs += 1
        if (runs == l) return resolve()
        let next = function () {
          let fn = b.shift()
          if (!fn) {
            return
          } 
          return fn().then(() => {
            runs += 1
            if (runs == l) return resolve()
            return next()
          }, reject)
        }
        return next()
      }, reject)
    }
  })
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  queue: queue
}
