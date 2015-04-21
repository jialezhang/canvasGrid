(function (window, document) {

  var canvasHeight = window.innerHeight,
      canvasWidth = window.innerWidth;
  var gridCanvas = document.querySelector("#grid"),
      gridContext = gridCanvas.getContext('2d');

  function drawGrid(canvas,ctx,unit){
    ctx.beginPath();
    for(var x = 0.5;x < canvas.width; x += unit){
      ctx.moveTo(x,0);
      ctx.lineTo(x,canvas.height);
    };
    for(var y = 0.5;y < canvas.height; y += unit){
      ctx.moveTo(0,y);
      ctx.lineTo(canvas.width,y);
    };
    // ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#A9A9A9";
    ctx.stroke();
  }



  function drawLine(lines,canvas){
    if(lineArray.length != null){

      var context = canvas.getContext('2d');


      for(var i = 0 ; i < lines.length ; i++){
        context.beginPath();
        context.lineWidth = lines[i].width;
        context.strokeStyle = lines[i].color;
        context.moveTo(lines[i].X,lines[i].Y);
        context.lineTo(lines[i].ToX,lines[i].ToY);
        context.stroke();
      }

    }
  }
  // console.log(gridContext);
  function drawShadow(){



    var temp = document.createElement('canvas'),
        tx = temp.getContext('2d');
    temp.width = gridCanvas.width;
    temp.height = gridCanvas.height;


      //   // 更改坐标
    tx.translate(-temp.width, 0);
    tx.shadowOffsetX = temp.width;
    tx.shadowOffsetY = 0;
    tx.shadowColor = "blue";
    tx.shadowBlur = 300;
    // tx.rect(0,0,temp.width,temp.height);
    // tx.fillStyle = "red";


    var k = (temp.width/0.75)/2,
        w = temp.width/2,
        h = temp.height/3,
        x = temp.width/2,
        y = temp.height/2;
    tx.beginPath();
    tx.moveTo(x, y-h);
    tx.bezierCurveTo(x+k, y-h, x+k, y+h, x, y+h);
    tx.bezierCurveTo(x-k, y+h, x-k, y-h, x, y-h);
    tx.closePath();
    tx.fillStyle = "white";
    tx.fill();
    tx.closePath();
  //   // console.log(ctx.canvas.width);


    gridContext.save();

    gridContext.globalCompositeOperation = "destination-in";

    gridContext.drawImage(temp,0,0);

    gridContext.restore();

  }


  function moveAll(lines,dots,canvas){
    var ctx = canvas.getContext('2d');
    var time = (new Date().getTime());
    // var lineSpeed = 80;
    if(lines.length){
      for(var i = 0 ; i < lines.length ; i++){
        // lines[i].timer += Math.random() * 1000;
        var newX = lines[i].speed * (time - lines[i].timer)  / 1000,
            newY = lines[i].speed * (time - lines[i].timer) / 1000;
        if(lines[i].direction == "horizontal"){
          if(newX < canvas.width){
            lines[i].X = newX;
            lines[i].ToX = newX + lines[i].length;
          }
          // 直线跑到底之后消失
          if(newX >= canvas.width ){
            lines.splice(i,1);
            lineFactory(1,dotCollection);
          }
        }
        if(lines[i].direction == "verticle"){
          if(newY < canvas.height ){
            lines[i].Y = newY;
            lines[i].ToY = newY + lines[i].length;
          }
          if(newY >= canvas.height ){
            lines.splice(i,1);
            lineFactory(1,dotCollection);
          }
        }
      }

    }
    if(dots.length){
      for(var i = 0 ; i < dots.length; i++){
        if(dots[i].opacity > 0){
          dots[i].opacity -= 0.06;
        }
        else{
          delete dots[i];
          var xyIndex = getIndex(dotCollection),
              dotsOpacity = getIndex(opacityCollection),
              config = {
                X : dotCollection[xyIndex][0],
                Y : dotCollection[xyIndex][1],
                radius : radius,
                opacity : opacityCollection[dotsOpacity],
                style : dotStyle
              };
          dots[i] = new DotBuild(config);
          // console.log('一个点点阵亡了');
        }
        // }
      }
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawGrid(gridCanvas,gridContext,dotUnit);
    // drawGrid(textCanvas,textContext,dotUnit);
    drawArc(dots,ctx);
    drawLine(lines, canvas);
    // var cf = new canvasFade(topCanvas);
    requestAnimFrame(function() {
      moveAll(lines,dots,canvas);
      drawShadow();
    });


  }
  function init(){
    //set the canvas size according to the viewport;
    // setSize(topCanvas);
    setSize(gridCanvas,0.9);
    // setSize(textCanvas);
    //get the coordination first
    dotCollection = getDotCollection(gridCanvas,dotUnit);

    //create some lines and dots
    lineFactory(20,dotCollection);

    DotFactory(16,dotCollection);

    //draw the coordination
    drawGrid(gridCanvas,gridContext,dotUnit);

    //let the line and the dots run
    // wait one second before starting animation
    setTimeout(function() {
      moveAll(lineArray,DotArray,gridCanvas);
    }, 10);
  }
  init();
  drawShadow();
  $(".noty").addClass("zoomInUp");
  $(".noty").on('webkitAnimationEnd',function(){
    $("#page1title").addClass("slideOutUp");
    $("#page1caption").addClass("slideOutDown");
  });
})(this, this.document);
