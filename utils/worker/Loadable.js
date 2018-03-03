var Promise = require('../../plugins/es6-promise.js');
var utils = require('../util.js');

export class Loadable {
  constructor(args) {
    let props = args.instance || {};
    this.url = args.url || props.url || null;
    this.loader = args.loader || props.loader || null;
    this.loadData = args.loadData || props.loadData || null;
    this.isLoaded = false;
    this.isPropLoaded = false;
  }

  init() {

  }

  mapUrl2Index(loadables) {
    if (this.isLoaded) {
      let loads = {};
      loadables.forEach((item, index) => {
        loads[item.url] = index;
      });
      return loads;
    } else {
      console.log('You must load loadable first!');
    }
    
  }

  load() {
    return new Promise((resolve, reject) => {
      if (this.url && this.loadData) {
        if (this.loader) {
          this.isLoaded = false;
          this.loader(this.url, this.loadData).then(res => {
            this.isLoaded = true;
            resolve(res);
          }).catch(res => {
            reject(res);
          });
        } else {
          console.log('No loader!');
          reject("No loader!");
        }
      } else {
        console.log('No url or loadData!');
        reject("No url or loadData!");
      }
    });
  }

  loadProps() {
    return new Promise((resolve, reject) => {
      let promises = []
      for (let prop in this) {
        if (this[prop] instanceof Loadable) {
          console.log(this[prop])
          promises.push(() => {
            return this[prop].load.apply(this[prop]);
          });
        } else if (this[prop] && this[prop].__proto__ === Array.prototype) {
          for (let propItem of this[prop]) {
            if (propItem instanceof Loadable) {
              promises.push(() => {
                return propItem.load.apply(propItem);
              });
            }
          }
        }
      }
      this.isPropLoaded = false;
      utils.queue(promises, 5).then(res => {
        resolve(res);
        this.isPropLoaded = true;
        this.init();
      }).catch(res => {
        reject(res);
      });
    });
  }
}

function createLoadable(args) {
  return new Loadable(args || {});
}
