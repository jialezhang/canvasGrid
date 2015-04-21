var canvasHeight = window.innerHeight,
    canvasWidth = window.innerWidth;
var direction = ["horizontal","verticle"],
    color = ["#32CD32"],
    lineLength = [80,90,100,120,140,160],
    lineSpeed = [500,550,600],
    lineWidth = 2,
    lineArray =[],
    dotUnit = 20,
    dotCollection = [],
    DotArray =[],
    opacityCollection = [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1],
    radius = 10,
    dotStyle = "rgba(50, 205, 50,";

window.requestAnimFrame = (function(callback){
  return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    function(callback){
      window.setTimeout(callback, 1000 / 60);
    };
})();
function getIndex(collection){
  return Math.floor(Math.random()*(collection.length));
}

function getDotCollection(grid,unit){
  var dotCollection = [];
  for(var x = 0.5;x < grid.width ; x += unit){
    for(var y = 0.5;y < grid.height; y += unit){
      dotCollection.push([x,y]);
    }
  }
  return dotCollection;
}
function drawArc(dots,context){
  for(var i = 1 ; i < dots.length; i++){
    context.beginPath();
    context.arc(dots[i].X,dots[i].Y,dots[i].radius,0,Math.PI*2,true);
    // "rgba(118, 205, 106," + 1 + ")" =  "rgba(118, 205, 106,1)";
    context.fillStyle = dots[i].style + dots[i].opacity + ")";
    context.closePath();
    context.fill();
  }
};
function gaussBlur(image, width, height, radius, sigma) {
  var gaussMatrix = [],
      gaussSum = 0,
      x, y,
      r, g, b, a,
      i, j, k, len;
  var pixes = image.data;

  radius = Math.floor(radius) || 3;
  sigma = sigma || radius / 3;

  a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
  b = -1 / (2 * sigma * sigma);
  //生成高斯矩阵
  for (i = 0, x = -radius; x <= radius; x++, i++){
    g = a * Math.exp(b * x * x);
    gaussMatrix[i] = g;
    gaussSum += g;

  }
  //归一化, 保证高斯矩阵的值在[0,1]之间
  for (i = 0, len = gaussMatrix.length; i < len; i++) {
    gaussMatrix[i] /= gaussSum;
  }
  //x 方向一维高斯运算
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      r = g = b = a = 0;
      gaussSum = 0;
      for(j = -radius; j <= radius; j++){
        k = x + j;
        if(k >= 0 && k < width){//确保 k 没超出 x 的范围
          //r,g,b,a 四个一组
          i = (y * width + k) * 4;
          r += pixes[i] * gaussMatrix[j + radius];
          g += pixes[i + 1] * gaussMatrix[j + radius];
          b += pixes[i + 2] * gaussMatrix[j + radius];
          // a += pixes[i + 3] * gaussMatrix[j];
          gaussSum += gaussMatrix[j + radius];
        }
      }
      i = (y * width + x) * 4;
      // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
      // console.log(gaussSum)
      pixes[i] = r / gaussSum;
      pixes[i + 1] = g / gaussSum;
      pixes[i + 2] = b / gaussSum;
      // pixes[i + 3] = a ;
    }
  }
  //y 方向一维高斯运算
  for (x = 0; x < width; x++) {
    for (y = 0; y < height; y++) {
      r = g = b = a = 0;
      gaussSum = 0;
      for(j = -radius; j <= radius; j++){
        k = y + j;
        if(k >= 0 && k < height){//确保 k 没超出 y 的范围
          i = (k * width + x) * 4;
          r += pixes[i] * gaussMatrix[j + radius];
          g += pixes[i + 1] * gaussMatrix[j + radius];
          b += pixes[i + 2] * gaussMatrix[j + radius];
          // a += pixes[i + 3] * gaussMatrix[j];
          gaussSum += gaussMatrix[j + radius];
        }
      }
      i = (y * width + x) * 4;
      pixes[i] = r / gaussSum;
      pixes[i + 1] = g / gaussSum;
      pixes[i + 2] = b / gaussSum;
    }
  }
  //end
  return image;
}
function Ellipse(context, x, y, a, b)
{
  context.save();
  //选择a、b中的较大者作为arc方法的半径参数
  var r = (a > b) ? a : b;
  var ratioX = a / r; //横轴缩放比率
  var ratioY = b / r; //纵轴缩放比率
  context.scale(ratioX, ratioY); //进行缩放（均匀压缩）
  context.beginPath();
  //从椭圆的左端点开始逆时针绘制
  context.moveTo((x + a) / ratioX, y / ratioY);
  context.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI);
  context.closePath();
  context.stroke();
  context.restore();
};
function setSize(canvas,rate){
  canvas.width = canvasWidth * rate;
  canvas.height = canvasHeight * rate;
}

function Builder(config){
  this.X = config.X;
  this.Y = config.Y;
}

function LineBuild(config){
  Builder.call(this,config);
  this.ToX = config.ToX;
  this.ToY = config.ToY;
  this.direction = config.direction;
  this.width = config.width;
  this.color = config.color;
  this.length = config.length;
  this.speed = config.speed;
  this.timer = new Date().getTime();
}

function lineFactory(numbers,collection){
  for(var i = 0; i < numbers; i++){
    var xyIndex = getIndex(collection),
        colorIndex = getIndex(color),
        lengthIndex = getIndex(lineLength),
        speedIndex = getIndex(lineSpeed),
        directionIndex = getIndex(direction),
        line,
        config = {
          X : collection[xyIndex][0],
          Y : collection[xyIndex][1],
          direction : direction[directionIndex],
          width : lineWidth,
          length : lineLength[lengthIndex],
          speed : lineSpeed[speedIndex],
          color : color[colorIndex]
        };
    if(config.direction  == "horizontal"){
      config.ToX = config.X + config.length;
      config.ToY = config.Y;
      line = new LineBuild(config);
      lineArray.push(line);
    }
    if(direction[directionIndex] == "verticle"){
      config.ToX = config.X;
      config.ToY = config.Y + config.length;
      line = new LineBuild(config);
      lineArray.push(line);
    }
  }
  // console.log(lineArray);
};
function DotBuild(config){
  Builder.call(this,config);
  this.radius = config.radius;
  this.opacity = config.opacity;
  this.style = config.style;
  // this.timer = new Date().getTime();
}
function DotFactory(numbers,collection){
  for(var i = 0; i < numbers; i++){
    var xyIndex = getIndex(collection),
        dotsOpacity = getIndex(opacityCollection),
        config = {
          X : collection[xyIndex][0],
          Y : collection[xyIndex][1],
          radius : radius,
          opacity : opacityCollection[dotsOpacity],
          style : dotStyle
        };
    var dot = new DotBuild(config);
    DotArray.push(dot);
  }
}
