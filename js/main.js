
var sphere;
window.addEventListener("load", function () {

	// initialize the sphere
	sphere = new RealSphere(renderer, "wss://echo.websocket.org");

	setTimeout(function () {
		sphere.connect();
	}, 1000);

});