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
	async update(){
		if(this.mode !==Locker.MODE_UPDATE){
			await this.cancel();
			this.mode = Locker.MODE_UPDATE;
		}
		let beforeRepeat = this.options.update.beforeRepeat,
			afterRepeat = this.options.update.afterRepeat;
		
		let first = await this.record();

		if(first.err && first.err.message ===Locker.ERR_USER_CANCELED){
			return Promise.resolve(first);
		}
	    if(first.err){
	      this.update();
	      beforeRepeat.call(this, first);
	      return Promise.resolve(first);   
	    }

	    beforeRepeat.call(this, first);

	    let second = await this.record();      
	  
	    if(second.err && second.err.message === Locker.ERR_USER_CANCELED){
	      return Promise.resolve(second);
	    }

	    if(!second.err && first.records !== second.records){
	      second.err = new Error(Locker.ERR_PASSWORD_MISMATCH);
	    }

	    this.update();
	    afterRepeat.call(this, second);
	    return Promise.resolve(second);
	}
	async check(password){
		if(this.mode !==Locker.MODE_CHECCK){
			await this.record();
			this.mode = Locker.MODE_CHECCK;
		}

		let checked = this.options.check.checked;

		let res = await this.record();

		if(res.err && res.err.message === Locker.ERR_USER_CANCELD){
			return Promise.resolve(res);
		}
		if(!res.err && password !==res.records){
			res.err = new Error(Locker.ERR_PASSWORD_MISMATCH);
		}

		checked.call(this, res);
		this.check(password);
		return Promise.resolve(res);
	}
}