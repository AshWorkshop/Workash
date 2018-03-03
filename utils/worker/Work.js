var Loadable = require('./Loadable.js').Loadable;

export class Work extends Loadable {
  constructor(args) {
    super(args)
    const defaultProps = {
    };
    let props = args.instance || {};
    this.created = args.created || props.created || null;
    this.project = args.project || props.project || null;
    this.worker = args.worker || props.worker || null;
    this.name = args.name || props.name || null;
    this.content = args.content || props.content || null;
    this.date = args.date || props.date || null;
    this.hours = args.hours || props.hours || null;
    // this.loader = args.loader || props.loader || defaultProps.loader;
  }
}
