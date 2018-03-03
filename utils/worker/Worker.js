var Loadable = require('./Loadable.js').Loadable;

export class Worker extends Loadable {
  constructor(args) {
    super(args)
    const defaultProps = {
    }
    let props = args.instance || {};
    this.participations = args.participations || props.participations || [];
    this.projects = args.projects || props.projects || [];
    this.works = args.works || props.works || [];
    this.wxUser = args.wxUser || props.wxUser || null;
    //this.loader = args.loader || props.loader || defaultProps.loader;
  }

  
  // 将在loadProps后执行
  init() {
    if (this.isLoaded && this.isPropLoaded) {
      this.participationUrls = this.mapUrl2Index(this.participations);
      this.projectUrls = this.mapUrl2Index(this.projects);
      this.workUrls = this.mapUrl2Index(this.works);

      this.setTotalHours();
    } else {
      console.log('You must load worker and its props first!');
    }
  }

  setTotalHours() {
    if (this.isLoaded && this.isPropLoaded){
      if (this.participationUrls) {
        let parts = this.participationUrls;
        this.participations.forEach((part, index) => {
          part.totalHours = 0.0;
          part.works = [];
        });
        for (let work of this.works) {
          let partUrl = work.project.url;
          if (partUrl in parts) {
            this.participations[parts[partUrl]].works.push(work);
            this.participations[parts[partUrl]].totalHours += work.hours;
          }

        }
      } else {
        console.log('You must run mapUrl2Index first!');
      }
      
    } else {
      console.log('You must load worker and its props first!');
    }
  }
}
