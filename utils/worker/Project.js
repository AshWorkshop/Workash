var Loadable = require('./Loadable.js').Loadable;

export class Project extends Loadable {
  constructor(args) {
    super(args)
    const defaultProps = {
    }
    let props = args.instance || {};
    this.created = args.created || props.created || null;
    this.manager = args.manager || props.manager || null;
    this.name = args.name || props.name || null;
    this.detail = args.detail || props.detail || null;
    this.begin = args.begin || props.begin || null;
    this.end = args.end || props.end || null;
    this.isActive = args.isActive || props.isActive || null;
    this.totalHours = args.totalHours || props.totalHours || null;
    this.works = args.works || props.works || [];
    this.actors = args.actors || props.actors || [];
    // this.loader = args.loader || props.loader || defaultProps.loader;
  }
}
