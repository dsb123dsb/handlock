export default class Demo{
    async test(){
 		return new Promise( (resolve) => {
      		setTimeout(resolve, 1000);
    	});   	
    }
    render(){
    	const canvas = document.querySelector('#container canvas');
    	const ctx = canvas.getContext('2d');

    	let width = 2*container.getBoundingClientRect().width;
    	canvas.width = canvas.height = width;
    	console.log(width);

    	let n = 3, r = Math.round(width / (n+1)/5),
    		color = '#676';
    	let range = Math.round(width / (n+1));

    	let circles = [];
    	for( var i =1; i<=n; i++){
    		for(var j=1; j<=n; j++){
    			let y = range * i,
    			x = range *j;
    			drawSolidCircle(ctx,color,x,y,r);
    			circles.push({x,y});
    		}
    	}
    	let lineTo = drawLine.bind(null,ctx,color);
    	(function(...path){
    		path.reduce((p1,p2) => {
    			lineTo(p1.x,p1.y,p2.x,p2.y);
    			return p2;
    		});
    	})(circles[0],circles[1],circles[3],circles[5],circles[8],circles[7]);
    }
}
// 画实圆心
function drawSolidCircle(ctx, color,x,y,r){
	ctx.fillStyle=color;
	ctx.beginPath();
	ctx.arc(x,y,r,0,Math.PI*2,true);
	ctx.closePath();
	ctx.fill();
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