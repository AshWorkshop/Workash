var Loadable = require('./Loadable.js').Loadable;

export class WxUser extends Loadable {
  constructor(args) {
    super(args)
    const defaultProps = {
    }
    let props = args.instance || {};
    this.nickName = args.nickName || props.nickName || null;
    this.avatarUrl = args.avatarUrl || props.avatarUrl || null;
    this.gender = args.gender || props.gender || 0;
    //this.loader = args.loader || props.loader || defaultProps.loader;
  }
}