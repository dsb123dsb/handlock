// 私有方法
// 画实圆心
function drawSolidCircle(ctx, color,x,y,r){
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
}
//画空心圆
function drawHollowCircle(ctx, color, x, y, r){
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.stroke();
}
// 画线段
function drawLine(ctx,color,x1,y1,x2,y2){
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    ctx.closePath();
}
// 两点距离
function distance(p1, p2){
  let x = p2.x - p1.x, y = p2.y - p1.y;
  return Math.sqrt(x * x + y * y);
}
//获取 touch 相对canvas坐标
function getCanvasPoint(canvas, x, y){
    let rect = canvas.getBoundingClientRect();
    return {
        x: 2*(x-rect.left),
        y: 2*(y-rect.top),
    };
}
const defaultOptions = {
    container: null, // 创建canvas容器，如果不填，自动在body上创建覆盖全屏的层
    focusColor: '#e06555', // 当前选中的圆的颜色
    fgColor: '#d6dae5', // 未选中的圆的颜色
    bgColor:'#fff', // canvas背景颜色
    n: 3, //圆点数量：n*n
    innerRadius: 20, // 圆点的内半径
    outerRadius: 50, // 圆点的外半径，focus时显示
    touchRadius: 70, // 判定touch事件的圆半径
    render: true, // 自动渲染
    customStyle: false, // 自定义样式
    minPoints: 4, // 最小允许点数
};

export default class Demo{
    async test(){
 		return new Promise( (resolve) => {
      		setTimeout(resolve, 1000);
    	});   	
    }
    // 取值存值函数截器
    static get ERR_NOT_ENOUGH_POINTS(){
        return 'not enough points';
    }
    static get ERR_USER_CANCELED(){
        return 'user canceled';
    }
    static get ERR_NO_TASK(){
        return 'no task';
    }
    constructor(options){
        options = Object.assign({}, defaultOptions, options);
        this.options = options;
        this.path = [];

        if(options.render){
            this.render;
        }
    }
    render(){
        // 防止重复渲染
        if(this.circleCanvas) return false;

        let options = this.options;
        let container = options.container || document.createElement('div');

        if(!options.container && !options.customStyle){
            Object.assign(container.style, {
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                lineHeight: '100%',
                overflow: 'hidden',
                backgroundColor: options.bgColor
            });
            document.body.appendChild(container);
        }
        this.container = container;

        let {width, height} = container.getBoundingClientRect();

        // 画圆的canvas，也是最外层监听事件的canvas
        let circleCanvas =  document.createElement('canvas');

        // 2倍大小， 为了支持retina屏
        circleCanvas.width = circleCanvas.height = 2 * Math.min(height, width);
        if(!options.customStyle){
            Object.assign(circleCanvas.style, {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(0.5)',
            });
        }
        // 画固定线条的canvas
        let lineCanvas = circleCanvas.cloneNode(true);

        //画不固定线条的canvas
        let moveCanvas = circleCanvas.cloneNode(true);

        container.appendChild(lineCanvas);
        container.appendChild(moveCanvas);
        container.appendChild(circleCanvas);

        this.lineCanvas = lineCanvas;
        this.moveCanvas = moveCanvas;
        this.circleCanvas= circleCanvas;

        this.container.addEventListener('touchmove', 
            evt => {
                evt.preventDefault();
                // console.log('dd');
            }, 
            {passive:false}
        ); 

        this.clearPath();
        return true;
    }
    clearPath(){
        if(!this.circleCanvas) this.render();

        let {circleCanvas, lineCanvas, moveCanvas} = this,
            circlCtx = circleCanvas.getContext('2d'),
            lineCtx = lineCanvas.getContext('2d'),
            moveCtx = moveCanvas.getContext('2d'),
            width = circleCanvas.width,
            {n, fgColor, innerRadius} = this.options;

        circlCtx.clearRect(0,0,width,width);
        lineCtx.clearRect(0,0,width,width);
        moveCtx.clearRect(0,0,width,width);
    	console.log(width);

    	let range = Math.round(width / (n+1));

    	let circles = [];

        // drawCircleCenters 
    	for( let i =1; i<=n; i++){
    		for(var j=1; j<=n; j++){
    			let y = range * i, x = range *j;
    			drawSolidCircle(circlCtx, fgColor, x, y, innerRadius);
                let circlePoint = {x, y};
                circlePoint.pos = [i, j];
    			circles.push(circlePoint);
    		}
    	}
        this.circles = circles;
    	// let lineTo = drawLine.bind(null,circlCtx,'red');
    	// (function(...path){
    	// 	path.reduce((p1,p2) => {
    	// 		lineTo(p1.x,p1.y,p2.x,p2.y);
    	// 		return p2;
    	// 	});
    	// })(circles[0],circles[1],circles[3],circles[5],circles[8],circles[7]);
    }
    async cancel(){
        if(this.recordingTask){
            return this.recordingTask.cancel();
        }
        return Promise.resolve({err: new Error(demo.ERR_NO_TASK)});
    }
    async record(){
        if(this.recordingTask && this.recordingTask.promise!=null) return this.recordingTask.promise;

        let {circleCanvas, lineCanvas, moveCanvas} = this,
            circlCtx = circleCanvas.getContext('2d'),
            lineCtx = lineCanvas.getContext('2d'),
            moveCtx = moveCanvas.getContext('2d');

        // 记录选中的圆点
        let records = [];

        circleCanvas.addEventListener('touchstart', (event) =>{
            this.clearPath();
            event.preventDefault()
            records = [];
        });


        let handler = evt => {
            let {clientX, clientY} = evt.changedTouches[0],
                {bgColor, focusColor, innerRadius, outerRadius, touchRadius} = this.options,
                touchPoint = getCanvasPoint(moveCanvas, clientX, clientY);
            for(let i =0; i<this.circles.length; i++){
                let point = this.circles[i],
                    x0 = point.x,
                    y0 = point.y;
                // 遍历圆点比较和触摸点距离
                if(distance(point, touchPoint) < touchRadius){
                    drawSolidCircle(circlCtx, bgColor, x0, y0, outerRadius);
                    drawSolidCircle(circlCtx, focusColor, x0, y0, innerRadius);
                    drawHollowCircle(circlCtx, focusColor, x0, y0, outerRadius);
                    if(records.length){
                        let p2 = records[records.length-1],
                        x1 = p2.x,
                        y1 = p2.y;
                        // 画固定线段
                        drawLine(lineCtx, focusColor, x0, y0, x1, y1);
                    }

                    let circle =  this.circles.splice(i,1);
                    records.push(circle[0]);
                    break;
                }
            }
            // 画移动线段
            if(records.length){
                let point = records[records.length-1],
                    x0 = point.x,
                    y0 = point.y,
                    x1 = touchPoint.x,
                    y1 = touchPoint.y;

                moveCtx.clearRect(0, 0, moveCanvas.width, moveCanvas.height);
                drawLine(moveCtx, focusColor, x0, y0, x1, y1);
            }
        };

        // circleCanvas.addEventListener('touchstart', handler);
        circleCanvas.addEventListener('touchmove', handler);

        let recordingTask = {};
        // 定义异步对象
        let done;
        let promise = new Promise((resolve, reject) => {
            recordingTask.cancel = (res = {}) => {
                let promise = this.recordingTask.promise;

                res.err = res.err || new Error(Demo.ERR_USER_CANCELED);
                circleCanvas.removeEventListener('touchstart', handler);
                circleCanvas.removeEventListener('touchmoveh', handler);
                document.removeEventListener('touchend', done);
                resolve(res);
                // this.recordingTask = null;
                // cancel后返回当前异步对象
                return promise;
            };
            done = evt => {
                moveCtx.clearRect(0, 0, moveCanvas.width, moveCanvas.height);
                if(!records.length) return 

                circleCanvas.removeEventListener('touchstart', handler);
                circleCanvas.removeEventListener('touchmove', handler);
                document.removeEventListener('touchend', done);

                let err = null;

                if(records.length < this.options.minPoints){
                    err = new Error(Demo.ERR_NOT_ENOUGH_POINTS);
                }
                // 编码选取圆点i j 作为密码
                let res = {err ,records: records.map(o => o.pos.join('')).join('')};

                resolve(res);
                this.recordingTask.promise = null;
            };
            // 此处添加有bug
            // document.addEventListener('touchend', done);
        });

        recordingTask.promise = promise;
        // 添加touchend时间，传出res密码
        document.addEventListener('touchend', done);
        this.recordingTask = recordingTask;
        return promise;
    }
}
