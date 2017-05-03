import Demo from './demo.js';
console.log('tets done!1');
var demo  = new Demo();
demo.test().then (function () {
	console.log('tets done!3');
});
demo.render();
