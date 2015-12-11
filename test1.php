<?php 
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
?>
<html>
	<head>
		<meta name="viewport" content= "width=320 initial-scale=1.0 maximum-scale=1.0 minimum-scale=1.0 user-scalable=no" />
		<meta http-equiv="content-type" content="text/html;charset=ISO-8859-1"/>		
	    <style type="text/css">
	      body,html   			{ margin:0; padding: 0; }
			.loaderContainer { text-align: center; position: absolute; left: 0px; top: 0px; z-index: 9999999999999 !important; color: #ffffff !important; }
			.loaderData { color: #ffffff; }	      
	      body 
	      {
			    position: absolute; 
			    top: 0; 
			    left: 0; 
			    z-index: -1;
			    background: -moz-linear-gradient(top,  #173e57,  #000000);
			    background: -webkit-gradient(linear, left top, left bottom, from(#173e57), to(#000000));
			    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#173e57', endColorstr='#000000');
			    background: -o-linear-gradient(rgb(207,221,172),rgb(255,255,255));	      	
		  		overflow: hidden;
		}

		</style>		
		<script type="text/javascript" src="howler.js?v=<?php print rand(1, 10000000); print rand(1, 10000000);?>"></script>
		<script type="text/javascript" src="jquery-2.1.1.min.js"></script>

	</head>
	<body style="background-color: #173e57 !important;">
		<div id="theDebugConsole"></div>
		<div class="loaderContainer"><p style="font-family: verdana;">Ladattu <span id="loaderData">0</span> %</p></div>
		<div id="rendererContainer"></div>
		<!-- <script type="text/javascript" src="howler.js"></script>	-->
		<script type="text/javascript" src="pixi.min.js"></script>	
		<script type="text/javascript" src="main.min.js?v=<?php print rand(1, 10000000); print rand(1, 10000000);?>"></script>				
	</body>
</html>