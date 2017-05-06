import Demo from './demo.js';

// 验证设置密码
const defaultOptions = {
	update: {
		beforeRepeat: function(){},
		afterRepeat: function(){}
	},
	check: {
		checked: function(){}
	}
};

export default class Locker extends Demo{
	static get ERR_PASSWORD_MISMATCH(){
		return 'password mismatch';
	}
	static get MODE_UPDATE(){
		return 'update';
	}
	static get MODE_CHECCK(){
		return 'check';
	}
	constructor(options = {}){
		options.update = Object.assign({}, defaultOptions.update, options.update);
		options.check = Object.assign({}, defaultOptions.check, options.check);
		super(options);
	}
	
}