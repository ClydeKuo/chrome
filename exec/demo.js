var robot = require("robotjs");

// Speed up the mouse.
/* robot.setMouseDelay(2);

var twoPI = Math.PI * 2.0;
var screenSize = robot.getScreenSize();
var height = (screenSize.height / 2) - 10;
var width = screenSize.width; */
robot.mouseClick('left',true)
/* for (var x = 0; x < width; x++)
{
	y = height * Math.sin((twoPI * x) / width) + height;
	robot.moveMouse(x, y);
} */
robot.mouseToggle("down");

setTimeout(function()
{
    robot.mouseToggle("up");

}, 2000);
