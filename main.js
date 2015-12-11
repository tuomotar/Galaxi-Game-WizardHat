Tuomo


Search Drive

Drive
.
Folder Path
My Drive
tuomo_only
uudet_koodit
NEW 
Folders and views
My DriveCollapsed
Shared with me
Google Photos
Recent
Starred
Trash
12 GB of 15 GB used
Upgrade storage
.

Javascript
main.js

Javascript
main.min.js

Unknown File
settings.json
Get Drive for Mac
All selections cleared


﻿/* USES pixi.js and howler.js */
(function(tt, $) {

	$(".loaderContainer").css("left", window.innerWidth / 2 + "px"); 
	
	var helperCanvas;
	var helperCanvasContext;
	helperCanvas 							= document.createElement('canvas');
	helperCanvas.id     					= "helperCanvas";
	helperCanvas.style.position 			= "absolute";
	document.body.appendChild(helperCanvas);
	helperCanvas.style.visibility			= "hidden";

	var mainRenderer;
	var rendererContainer;
	var rendererGraphicsObjects = [];
	var debugLinesGO = new PIXI.Graphics();
	rendererGraphicsObjects.push(debugLinesGO);

	var globalSettings 			= { 
		"gameState": "init html", 
		"sprites": {}, 
		"points": 0,
		"loadedAssets": {}, 
		"mainUrl": "http://yle.fi/galaxi/mazq/2015/peli2/", 
		"jsonUrl": "http://yle.fi/galaxi/mazq/2015/peli2/settings.json", 
		"mainRendererTransparent": true, 
		"mainRendererId": "rendererContainer", 
		"current": {"time": {}}
	};
	var physicsSpriteArray 		= [];
	var collisionsSpriteArray	= [];

	var tmpTexture;

	//AUDIOS ARRAY
	var audiosArray = [];

	//SCORE TEXT
	var scoreText = new PIXI.Text('0', { font : '144px Arial', dropShadow: true, dropShadowDistance: 5, dropShadowColor: 0x000000, stroke: 0xffffff, strokeThickness: 10, fill : 0xffffff, align : 'center'});
	globalSettings.texts = {};
	globalSettings.texts.scoreText = scoreText;

	//HIGH SCORE TEXT
	var highScoreTextFontSize 				= 60;	
	var highScoreTopLevel 					= 100;
	globalSettings.texts.highScoreTexts = [];
	var hsTemp;
	for (var q = 0; q < 10; q++)
	{
		hsTemp = new PIXI.Text('0', { font : highScoreTextFontSize + 'px Arial', dropShadow: true, dropShadowDistance: 5, dropShadowColor: 0x000000, stroke: 0x000000, strokeThickness: 10, fill : 0xffffff, align : 'center'});
		globalSettings.texts.highScoreTexts.push(hsTemp);
	}
			
	//Keyboard commands
	var keyLeft 	= keyboard(37);
	var keyUp 		= keyboard(38);				
	var keyRight 	= keyboard(39);	
	var keyDown		= keyboard(40);	
	var keyW 		= keyboard(87);
	var keyA 		= keyboard(65);
	var keyS 		= keyboard(83);	
	var keyD 		= keyboard(68);		
	
	var keyU		= keyboard(85);		
	var keySpace	= keyboard(32);		

	$(window).load(function()       
	{ 
		globalSettings.gameState = "html done, loading settings json";

		// 1. Load settings json
        $.getJSON(globalSettings.jsonUrl, function(json) {
			  
			globalSettings.gameState 		= "json done, load assets";  
			globalSettings.s 				= json;
			highScoreTopLevel 				= highScoreTopLevel + globalSettings.s.designDim.h / 2;

			//Set main renderer, dimensions and scaling factor (but don't show it yet!)
			$("#" + globalSettings.mainRendererId).css("display", "none");
			rendererContainer 				= new PIXI.Stage(0xFF0000);
			//mainRenderer 					= new PIXI.CanvasRenderer(globalSettings.s.designDim.w, globalSettings.s.designDim.h, {transparent: globalSettings.mainRendererTransparent});
			mainRenderer 					= new PIXI.autoDetectRenderer(globalSettings.s.designDim.w, globalSettings.s.designDim.h, {transparent: globalSettings.mainRendererTransparent});

			//Helpercanvas stuff
			helperCanvas.width  			= globalSettings.s.designDim.w;
			helperCanvas.height 			= globalSettings.s.designDim.h;
			helperCanvasContext 			= helperCanvas.getContext("2d");

			globalSettings.mainRendererDim 	= ttScalingManager.initRendererDimensions(mainRenderer, globalSettings.s.designDim.w, globalSettings.s.designDim.h, globalSettings.mainRendererId, globalSettings.s.nonGameArea.w, globalSettings.s.nonGameArea.h);
			document.getElementById(globalSettings.mainRendererId).appendChild(mainRenderer.view);

			//LOAD ASSETS
			var assetsLoader = createPixiLoader();
			function onProgressCallback(e)
			{
				$("#loaderData").html(Math.round(e.progress));
			}			
			assetsLoader.on('progress', onProgressCallback).load(function (loader, resources) {
        		// resources is an object containing the loaded resources, keyed by the names you used above.
		        //var sprite = new PIXI.Sprite(resources.name1.texture);
		        $("#loaderData").html(Math.round(loader.progress));
		        $(".loaderContainer").css("display", "none");
		        	globalSettings.loadedAssets = resources;
		        	var tmpSprite;
		        	for(var z in resources)
		        	{
		        		if(resources[z].name == "roller")
		        		{
		        			var frames 			= ["g1.png", "g2.png", "g3.png", "g4.png", "g5.png", "g6.png", "g7.png", "g8.png", "g9.png", "g10.png", "g11.png", "g12.png", "g13.png", "g14.png", "g15.png", "g16.png", "g17.png", "g18.png", "g19.png", "g20.png", "g21.png", "g22.png", "g23.png", "g24.png", "g25.png", "g26.png", "g27.png", "g28.png", "g29.png", "g30.png", "g31.png", "g32.png", "g33.png", "g34.png", "g35.png", "g36.png"];
							var tmpSprite 		= PIXI.extras.MovieClip.fromFrames(frames);
							tmpSprite.name 		= resources[z].name;
							globalSettings.sprites[resources[z].name] = tmpSprite;
		        		}
		        		else
		        		{
		        			if(resources[z].name != "character1")
		        			{
			        			tmpSprite 			= new PIXI.Sprite(resources[z].texture);
			        			tmpSprite.name 		= resources[z].name;
			        			tmpSprite.cacheAsBitmap = true;
			        			globalSettings.sprites[resources[z].name] = tmpSprite;
								tmpTexture 			= resources[z].texture; 		//FOR EMPTY SPRITE
							}
							else
							{
			        			tmpSprite 			= new PIXI.Sprite(resources[z].texture);
			        			tmpSprite.name 		= resources[z].name;
			        			globalSettings.sprites[resources[z].name] = tmpSprite;
								tmpTexture 			= resources[z].texture; 		//FOR EMPTY SPRITE								
							}
		        		}
		        	}

					//LOAD AUDIOS
					var audiosDataArray = new Array();
					audiosDataArray.push({ "audioName": "piste", "audioFile": ["game_assets/piste.mp3"], "audioData": {volume: 0.2, loop: false, format: "mp3", buffer: false}});
					audiosDataArray.push({ "audioName": "game_start", "audioFile": ["game_assets/game_start.mp3"], "audioData": {volume: 0.1, loop: false, format: "mp3", buffer: false}}); 
					audiosDataArray.push({ "audioName": "game_over", "audioFile": ["game_assets/game_over.mp3"], "audioData": {volume: 0.1, loop: false, format: "mp3", buffer: false}}); 
					audiosDataArray.push({ "audioName": "G_pomp", "audioFile": ["game_assets/G_pomp.mp3"], "audioData": {volume: 0.3, loop: false, format: "mp3", buffer: false}}); 
					audiosDataArray.push({ "audioName": "metsa", "audioFile": ["game_assets/tausta_metsa.mp3"], "audioData": {volume: 0.07, loop: false, format: "mp3", buffer: false}}); 

					audiosDataArray.push({ "audioName": "ujellus_1_d", "audioFile": ["game_assets/ujellus_1_d.mp3"], "audioData": {volume: 0.02, loop: false, format: "mp3", buffer: false}}); 
					audiosDataArray.push({ "audioName": "ujellus_1_a", "audioFile": ["game_assets/ujellus_1_a.mp3"], "audioData": {volume: 0.02, loop: false, format: "mp3", buffer: false}}); 
					audiosDataArray.push({ "audioName": "ujellus_1_f_sharp", "audioFile": ["game_assets/ujellus_1_f_sharp.mp3"], "audioData": {volume: 0.02, loop: false, format: "mp3", buffer: false}}); 

					audiosDataArray.push({ "audioName": "ujellus_2_b", "audioFile": ["game_assets/ujellus_2_b.mp3"], "audioData": {volume: 0.02, loop: false, format: "mp3", buffer: false}}); 
					audiosDataArray.push({ "audioName": "ujellus_2_d", "audioFile": ["game_assets/ujellus_2_d.mp3"], "audioData": {volume: 0.02, loop: false, format: "mp3", buffer: false}}); 
					audiosDataArray.push({ "audioName": "ujellus_2_g", "audioFile": ["game_assets/ujellus_2_g.mp3"], "audioData": {volume: 0.02, loop: false, format: "mp3", buffer: false}}); 

					audiosDataArray.push({ "audioName": "ujellus_3_b", "audioFile": ["game_assets/ujellus_3_b.mp3"], "audioData": {volume: 0.05, loop: false, format: "mp3", buffer: false}}); 
					audiosDataArray.push({ "audioName": "ujellus_3_d", "audioFile": ["game_assets/ujellus_3_d.mp3"], "audioData": {volume: 0.05, loop: false, format: "mp3", buffer: false}}); 
					audiosDataArray.push({ "audioName": "ujellus_3_g", "audioFile": ["game_assets/ujellus_3_g.mp3"], "audioData": {volume: 0.05, loop: false, format: "mp3", buffer: false}}); 


		            audiosArray = ttAudioLoader.loadAudios(audiosDataArray);

					globalSettings.gameState = globalSettings.s.GAME_STATES.ALL_LOADED; 

					//START MAIN LOOP
					ttMain.initMainLoop();

		    });	

		});		

		function createPixiLoader()
		{
			var retVal = new PIXI.loaders.Loader();
			retVal.baseUrl = globalSettings.s.urls.assets;
			//Bitmaps
    		for(var i in globalSettings.s.assets_bitmap)
    		{
    			retVal.add(globalSettings.s.assets_bitmap[i].spriteName, globalSettings.s.assets_bitmap[i].filename)
    		}

    		//Spritesheets
    		for(var j in globalSettings.s.assets_animated_spritesheet)
    		{
    			retVal.add(globalSettings.s.assets_animated_spritesheet[j].spriteName, globalSettings.s.assets_animated_spritesheet[j].filename);
    		}
    		return retVal;
    	}

	});

	$(window).resize(function()     
	{ 		
		var gameStateTemporary 		= globalSettings.gameState;
		globalSettings.gameState 	= globalSettings.s.GAME_STATES.SCALING;  
		ttScalingManager.scaleRenderer();
		globalSettings.gameState 	= gameStateTemporary;  
	});


/* HIGH SCORE MANAGER*/
(function( ttHighScoreManager, $) {

	ttHighScoreManager.highScoreTexts 		= [];

	ttHighScoreManager.loadTop10 = function()
    {
    			//console.log(globalSettings.s.urls.top10ajax);
				var ajax = $.getJSON(globalSettings.s.urls.top10ajax + "?get_top_10=true", function(data) {
				});
                ajax.fail(function(data){
                    console.log("Ajax fail.");
                }) ;
                ajax.done(function(data){
					//console.log(data);
			    	for(var i in data)
			    	{
			    		ttHighScoreManager.highScoreTexts[i] = { "points": data[i][1] , "nick": data[i][0] }
			    	}		
			    	ttHighScoreManager.setHighScores();
                });		

	}

    ttHighScoreManager.setHighScores = function()
    {
    	for(var i in ttHighScoreManager.highScoreTexts)
    	{
    		globalSettings.texts.highScoreTexts[i].text = ttHighScoreManager.highScoreTexts[i].nick + " " + ttHighScoreManager.highScoreTexts[i].points;
    	}    	
    }

	ttHighScoreManager.saveTop10 = function(score)
    {
    	if(score > ttHighScoreManager.highScoreTexts[9].points)
    	{
			var userDataLength = 5;
			var nick = "ABC";
			
			while(userDataLength > 3 && nick != null)
			{
				nick = prompt("Pääsit Top 10 -listalle. Anna nimimerkki jonka pituus on 1 - 3 merkkiä.", nick);
				if(nick != null)
				{
				  userDataLength = nick.length;
				}
				else
				{
					nick = "ABC";
					userDataLength = nick.length;
				}
				if(userDataLength < 1) { userDataLength = 5; }
			}
			if (nick != null) {
			
	                var ajax = jQuery.ajax({
	                    method : 'POST',
	                    url : globalSettings.s.urls.top10ajax,
	                    data : { 'save_top_10' : score, 'nick' : nick }
	                });
	                ajax.fail(function(data){
	                    console.log("Ajax fail.");
	                }) ;
	                ajax.done(function(data){
	                	var dataJson = eval(data);
				    	for(var i in dataJson)
				    	{
							ttHighScoreManager.highScoreTexts[i] = { "points": dataJson[i][1] , "nick": dataJson[i][0] }
				    	}		
				    	ttHighScoreManager.setHighScores();
	                }) ;	
			}
			else
			{
				//Do not save
			}
		}
	}

}( window.ttHighScoreManager = window.ttHighScoreManager || {}, jQuery ));	

/* AUDIO LOADER */
(function( ttAudioLoader, $) {

    ttAudioLoader.loadAudios = function(audiosDataArray)
    {

        var audiosLoaderCounter  	= 0;
        var audiosCounter       	= 0;
        var loadedAudiosArray 		= new Array();
        for(var i in audiosDataArray)
        {   
            loadedAudiosArray[audiosDataArray[i].audioName]             = new Object();
			audiosCounter++;
            loadedAudiosArray[audiosDataArray[i].audioName].audio       = new Howl({urls: audiosDataArray[i].audioFile, loop: audiosDataArray[i].audioData.loop, volume: audiosDataArray[i].audioData.volume, format: audiosDataArray[i].audioData.format});
			loadedAudiosArray[audiosDataArray[i].audioName].playing 	= false;
			loadedAudiosArray[audiosDataArray[i].audioName].currentTime	= 0;
			audiosLoaderCounter++;
        }
		//document.dispatchEvent(new CustomEvent( "allAudiosLoaded", { detail: { loaded: audiosCounter, loadedAudiosArray: loadedAudiosArray }, bubbles: true, cancelable: true }));
		return loadedAudiosArray;
    }

}( window.ttAudioLoader = window.ttAudioLoader || {}, jQuery ));	

	/* MAIN */
	/* ----------------------- */	

	(function(ttMain, $) {		


		ttMain.ujellus_1_randomTriggerCounter 	= 0;
		ttMain.ujellus_1_randomTime 			= Math.floor((Math.random() * 25)) * 1000;
		ttMain.ujellus_1_soundsPlaying 			= 0;
		ttMain.ujellus_1_RandomFactor 			= 0;
		ttMain.ujellus_1_a_playing 				= false;
		ttMain.ujellus_1_d_playing 				= false;
		ttMain.ujellus_1_f_sharp_playing 		= false;
		ttMain.ujellus_1_EngineRun = function(timeDiffTmp)
		{

			if(timeDiffTmp < 0) { timeDiffTmp = 1; }
			if(timeDiffTmp > 0)
			{
				ttMain.ujellus_1_randomTriggerCounter = ttMain.ujellus_1_randomTriggerCounter + timeDiffTmp;
			}

			if(ttMain.ujellus_1_randomTriggerCounter > ttMain.ujellus_1_randomTime)
			{
				ujellus_1_randomTime = Math.floor((Math.random() * 25)) * 1000;
				ttMain.ujellus_1_randomTriggerCounter = 0;
			}

			if(ttMain.ujellus_1_randomTriggerCounter == 0)
			{
				ttMain.ujellus_1_RandomFactor = Math.floor((Math.random() * 3));
				if(ttMain.ujellus_1_RandomFactor == 0)  { audiosArray["ujellus_1_a"].audio.play(); ttMain.ujellus_1_a_playing = true; }
				if(ttMain.ujellus_1_RandomFactor == 1)  { audiosArray["ujellus_1_d"].audio.play(); ttMain.ujellus_1_d_playing = true; }
				if(ttMain.ujellus_1_RandomFactor == 2)  { audiosArray["ujellus_1_f_sharp"].audio.play();ttMain.ujellus_1_f_sharp_playing = true; }
			}
		}

		ttMain.ujellus_2_randomTriggerCounter 	= 0;
		ttMain.ujellus_2_randomTime 			= Math.floor((Math.random() * 25)) * 1000;
		ttMain.ujellus_2_soundsPlaying 			= 0;
		ttMain.ujellus_2_RandomFactor 			= 0;
		ttMain.ujellus_2_b_playing 				= false;
		ttMain.ujellus_2_d_playing 				= false;
		ttMain.ujellus_2_g_playing 				= false;
		ttMain.ujellus_2_EngineRun = function(timeDiffTmp)
		{

			if(timeDiffTmp < 0) { timeDiffTmp = 1; }
			if(timeDiffTmp > 0)
			{
				ttMain.ujellus_2_randomTriggerCounter = ttMain.ujellus_2_randomTriggerCounter + timeDiffTmp;
			}

			if(ttMain.ujellus_2_randomTriggerCounter > ttMain.ujellus_2_randomTime)
			{
				ujellus_2_randomTime = Math.floor((Math.random() * 25)) * 1000;
				ttMain.ujellus_2_randomTriggerCounter = 0;
			}

			if(ttMain.ujellus_2_randomTriggerCounter == 0)
			{
				ttMain.ujellus_2_RandomFactor = Math.floor((Math.random() * 3));
				if(ttMain.ujellus_2_RandomFactor == 0)  { audiosArray["ujellus_2_b"].audio.play(); ttMain.ujellus_2_b_playing = true; }
				if(ttMain.ujellus_2_RandomFactor == 1)  { audiosArray["ujellus_2_d"].audio.play(); ttMain.ujellus_2_d_playing = true; }
				if(ttMain.ujellus_2_RandomFactor == 2)  { audiosArray["ujellus_2_g"].audio.play();ttMain.ujellus_2_g_playing = true; }
			}
		}		


		ttMain.ujellus_3_randomTriggerCounter 	= 0;
		ttMain.ujellus_3_randomTime 			= Math.floor((Math.random() * 25)) * 1000;
		ttMain.ujellus_3_soundsPlaying 			= 0;
		ttMain.ujellus_3_RandomFactor 			= 0;
		ttMain.ujellus_3_b_playing 				= false;
		ttMain.ujellus_3_d_playing 				= false;
		ttMain.ujellus_3_g_playing 				= false;
		ttMain.ujellus_3_EngineRun = function(timeDiffTmp)
		{

			if(timeDiffTmp < 0) { timeDiffTmp = 1; }
			if(timeDiffTmp > 0)
			{
				ttMain.ujellus_3_randomTriggerCounter = ttMain.ujellus_3_randomTriggerCounter + timeDiffTmp;
			}

			if(ttMain.ujellus_3_randomTriggerCounter > ttMain.ujellus_3_randomTime)
			{
				ujellus_3_randomTime = Math.floor((Math.random() * 25)) * 1000;
				ttMain.ujellus_3_randomTriggerCounter = 0;
			}

			if(ttMain.ujellus_3_randomTriggerCounter == 0)
			{
				ttMain.ujellus_3_RandomFactor = Math.floor((Math.random() * 3));
				if(ttMain.ujellus_3_RandomFactor == 0)  { audiosArray["ujellus_3_b"].audio.play(); ttMain.ujellus_3_b_playing = true; }
				if(ttMain.ujellus_3_RandomFactor == 1)  { audiosArray["ujellus_3_d"].audio.play(); ttMain.ujellus_3_d_playing = true; }
				if(ttMain.ujellus_3_RandomFactor == 2)  { audiosArray["ujellus_3_g"].audio.play(); ttMain.ujellus_3_g_playing = true; }
			}
		}	

		ttMain.loopCalculateTime = function()
		{
			globalSettings.current.time.timeNowMs         					= new Date().getTime();
			globalSettings.current.time.timeDiffNowMs     					= globalSettings.current.time.timeNowMs - globalSettings.current.time.timePast1Ms;
			if(globalSettings.current.time.timeDiffNowMs > 1384410000000)    { globalSettings.current.time.timeDiffNowMs = 1; }
			
			//Limit time step
			if(globalSettings.current.time.timeDiffNowMs > globalSettings.s.physics.deltaTMax)	{	globalSettings.current.time.timeDiffNowMs = globalSettings.s.physics.deltaTMax;	}
			if(globalSettings.current.time.timeDiffNowMs < globalSettings.s.physics.deltaTMin)	{ globalSettings.current.time.timeDiffNowMs = globalSettings.s.physics.deltaTMin; }


			globalSettings.current.time.timePast1Ms                         = globalSettings.current.time.timeNowMs;             //FOR CALCULATING HOW LONG THIS FRAME TOOK (in next frame)
			globalSettings.current.time.finalCountdownCounterMs             = globalSettings.current.time.finalCountdownCounterMs + globalSettings.current.time.timeDiffNowMs;   
			globalSettings.current.time.timeNowAsSeconds                    = Math.round(globalSettings.current.time.finalCountdownCounterMs / 1000);
			globalSettings.current.time.currentFrameRate                    = Math.round(1000 / globalSettings.current.time.timeDiffNowMs);
			globalSettings.current.time.framerateUpdateCounterMs            = globalSettings.current.time.framerateUpdateCounterMs + globalSettings.current.time.timeDiffNowMs;
		}

		ttMain.initMainLoop = function()
		{
			//Show main renderer
			$("#" + globalSettings.mainRendererId).css("display", "block");

			//CREATE SPRITES, LOCATE THEM ETC
			ttMain.addSpritesToStage();


			//Add graphics objects to stage / container
			for(var a in rendererGraphicsObjects)
			{
				rendererContainer.addChild(rendererGraphicsObjects[a]);
			}

			//Do the first scale
			ttScalingManager.scaleRenderer();

			//Set the game state
			globalSettings.gameState = globalSettings.s.GAME_STATES.START_START_SCREEN

			//Load high scores
			ttHighScoreManager.loadTop10();

			//Run main loop
			ttMain.runMainLoop();
		}

		ttMain.addSpritesToStage = function()
		{
			//Start screen background
			globalSettings.sprites.background1.anchor.x 	= 0.5;
			globalSettings.sprites.background1.anchor.y 	= 0.5;
			globalSettings.sprites.background1.visible		= false;
			globalSettings.sprites.background1.position.x 	= globalSettings.s.designDim.w / 2;
			globalSettings.sprites.background1.position.y	= globalSettings.s.designDim.h / 2;	
			globalSettings.sprites.background1.interactive	= true;		
			rendererContainer.addChild(globalSettings.sprites.background1);

			globalSettings.sprites.background1.mousedown 	= globalSettings.sprites.background1.touchstart = function(data) {	
				this.isdown = true;
				//this.alpha 	= 0.5;
			}

			globalSettings.sprites.background1.mouseup 	= globalSettings.sprites.background1.touchend  = function(data) {	
				this.isdown = false;
				//this.alpha 	= 1.0;			
				globalSettings.gameState = globalSettings.s.GAME_STATES.START_GAME;			
			}				


			//Start screen background
			globalSettings.sprites.background2.anchor.x 	= 0.5;
			globalSettings.sprites.background2.anchor.y 	= 0.5;
			globalSettings.sprites.background2.visible		= false;
			globalSettings.sprites.background2.position.x 	= globalSettings.s.designDim.w / 2;
			globalSettings.sprites.background2.position.y	= globalSettings.s.designDim.h / 2;		
			rendererContainer.addChild(globalSettings.sprites.background2);	

			//Button up
			globalSettings.sprites.buttonUp.anchor.x 	= 0.5;
			globalSettings.sprites.buttonUp.anchor.y 	= 0.5;
			globalSettings.sprites.buttonUp.visible		= false;
			globalSettings.sprites.buttonUp.position.x 	= globalSettings.s.designDim.w / 2;
			globalSettings.sprites.buttonUp.position.y	= globalSettings.s.virtualKeyboardContainerLeftTopCorner.y + 75;	
			globalSettings.sprites.buttonUp.interactive = true; 				
			rendererContainer.addChild(globalSettings.sprites.buttonUp);	

			globalSettings.sprites.buttonUp.mousedown 	= globalSettings.sprites.buttonUp.touchstart = keyUp.press = keyW.press = function(data) {	
					globalSettings.sprites.buttonUp.isdown = true;
					globalSettings.sprites.buttonUp.alpha 	= 0.5;
					globalSettings.sprites.character1.onSurface = false;
					globalSettings.sprites.character1.temporaryVelocityImpulse("up");
			}

			globalSettings.sprites.buttonUp.mouseup 	= globalSettings.sprites.buttonUp.touchend  = keyUp.release = keyW.release  = function(data) {	
					globalSettings.sprites.buttonUp.isdown = false;
					globalSettings.sprites.buttonUp.alpha 	= 1.0;
			}				

			//Button down
			globalSettings.sprites.buttonDown.anchor.x 		= 0.5;
			globalSettings.sprites.buttonDown.anchor.y 		= 0.5;
			globalSettings.sprites.buttonDown.visible		= false;
			globalSettings.sprites.buttonDown.position.x 	= globalSettings.s.designDim.w / 2;
			globalSettings.sprites.buttonDown.position.y	= globalSettings.s.virtualKeyboardContainerLeftTopCorner.y + 275;	
			globalSettings.sprites.buttonDown.interactive	= true;			
			rendererContainer.addChild(globalSettings.sprites.buttonDown);	
			globalSettings.sprites.buttonDown.mousedown 	= globalSettings.sprites.buttonDown.touchstart = keyDown.press = keyS.press = function(data) {	

					globalSettings.sprites.buttonDown.isdown = true;
					globalSettings.sprites.buttonDown.alpha 	= 0.5;
					globalSettings.sprites.character1.temporaryVelocityImpulse("down");
			}

			globalSettings.sprites.buttonDown.mouseup 	= globalSettings.sprites.buttonDown.touchend  = keyDown.release = keyS.release = function(data) {	
					globalSettings.sprites.buttonDown.isdown = false;
					globalSettings.sprites.buttonDown.alpha 	= 1.0;
			}				

			//Button left
			globalSettings.sprites.buttonLeft.anchor.x 		= 0.5;
			globalSettings.sprites.buttonLeft.anchor.y 		= 0.5;
			globalSettings.sprites.buttonLeft.visible		= false;
			globalSettings.sprites.buttonLeft.position.x 	= globalSettings.s.designDim.w / 2 - globalSettings.sprites.buttonLeft.width;
			globalSettings.sprites.buttonLeft.position.y	= globalSettings.s.virtualKeyboardContainerLeftTopCorner.y + 175;		
			globalSettings.sprites.buttonLeft.interactive	= true;
			rendererContainer.addChild(globalSettings.sprites.buttonLeft);	

			globalSettings.sprites.buttonLeft.mousedown 	= globalSettings.sprites.buttonLeft.touchstart = keyLeft.press = keyA.press = function(data) {	
					globalSettings.sprites.buttonLeft.isdown = true;
					globalSettings.sprites.buttonLeft.alpha 	= 0.5;
					globalSettings.sprites.character1.temporaryVelocityImpulse("left");
			}

			globalSettings.sprites.buttonLeft.mouseup 	= globalSettings.sprites.buttonLeft.touchend  = keyLeft.release = keyA.release = function(data) {	
					globalSettings.sprites.buttonLeft.isdown = false;
					globalSettings.sprites.buttonLeft.alpha 	= 1.0;
			}				

			//Button right
			globalSettings.sprites.buttonRight.anchor.x 		= 0.5;
			globalSettings.sprites.buttonRight.anchor.y 		= 0.5;
			globalSettings.sprites.buttonRight.visible			= false;
			globalSettings.sprites.buttonRight.position.x 		= globalSettings.s.designDim.w / 2 + globalSettings.sprites.buttonLeft.width;
			globalSettings.sprites.buttonRight.position.y		= globalSettings.s.virtualKeyboardContainerLeftTopCorner.y + 175;		
			globalSettings.sprites.buttonRight.interactive		= true;			
			rendererContainer.addChild(globalSettings.sprites.buttonRight);	

			globalSettings.sprites.buttonRight.mousedown 	= globalSettings.sprites.buttonRight.touchstart = keyRight.press = keyD.press = function(data) {	
					globalSettings.sprites.buttonRight.isdown = true;
					globalSettings.sprites.buttonRight.alpha 	= 0.5;
					globalSettings.sprites.character1.temporaryVelocityImpulse("right");
			}

			globalSettings.sprites.buttonRight.mouseup 	= globalSettings.sprites.buttonRight.touchend  = keyRight.release = keyD.release = function(data) {	
					globalSettings.sprites.buttonRight.isdown = false;
					globalSettings.sprites.buttonRight.alpha 	= 1.0;
			}			

			//Wall bottom
			globalSettings.sprites.wallBottom.anchor.x 			= 0;
			globalSettings.sprites.wallBottom.anchor.y 			= 0;			
			globalSettings.sprites.wallBottom.visible			= false;
			globalSettings.sprites.wallBottom.position.x 		= globalSettings.s.nonGameArea.x;
			globalSettings.sprites.wallBottom.position.y		= globalSettings.s.nonGameArea.y;		
			globalSettings.sprites.wallBottom.moveDirection 	= "up";			
			globalSettings.sprites.wallBottom.staticInCollision = true;			
			rendererContainer.addChild(globalSettings.sprites.wallBottom);
			
			//Wall left
			globalSettings.sprites.wallLeft.anchor.x 		= 0.5;
			globalSettings.sprites.wallLeft.anchor.y 		= 0.5;
			globalSettings.sprites.wallLeft.yMovement 		= 400;				
			globalSettings.sprites.wallLeft.visible			= false;
			globalSettings.sprites.wallLeft.position.x 		= globalSettings.sprites.wallLeft.width / 2;
			globalSettings.sprites.wallLeft.position.y		= globalSettings.sprites.wallLeft.height / 2 + globalSettings.sprites.wallLeft.yMovement;		
			globalSettings.sprites.wallLeft.moveDirection 	= "up";			
			globalSettings.sprites.wallLeft.staticInCollision = true;	
			globalSettings.sprites.wallLeft.speed 				= globalSettings.s.physics.wallLeftOriginalSpeed;
			globalSettings.sprites.wallLeft.hitsCount			= 0;				
			globalSettings.sprites.wallLeft.move = function()
			{
				if(this.position.y <= ((this.height / 2))) 					{ this.moveDirection = "down";  globalSettings.sprites.wallLeft.hitsCount++; }
				if(this.position.y >= ((this.height / 2) + this.yMovement)) { this.moveDirection = "up";  globalSettings.sprites.wallLeft.hitsCount++; }
				if(globalSettings.sprites.wallLeft.hitsCount == globalSettings.s.physics.wallLeftSpeedHitsCountMax)
				{
					globalSettings.sprites.wallLeft.hitsCount 	= 0;
					globalSettings.sprites.wallLeft.speed 		= Math.floor(Math.random() * globalSettings.s.physics.wallLeftSpeedRandomMax + globalSettings.s.physics.wallLeftSpeedRandomMin);
				}				

				if(this.moveDirection == "up")
				{
					//Move up
					this.position = new Vector(this.position.x, this.position.y - 1);
				}
				else
				{
					//Move down
					this.position = new Vector(this.position.x, this.position.y + 1);
				}
			}	
			rendererContainer.addChild(globalSettings.sprites.wallLeft);

			//Wall right
			globalSettings.sprites.wallRight.anchor.x 		= 0.5;
			globalSettings.sprites.wallRight.anchor.y 		= 0.5;
			globalSettings.sprites.wallRight.yMovement 		= 400;			
			globalSettings.sprites.wallRight.visible		= false;
			globalSettings.sprites.wallRight.position.x 	= globalSettings.s.designDim.w - globalSettings.sprites.wallRight.width / 2;
			globalSettings.sprites.wallRight.position.y		= globalSettings.sprites.wallRight.height / 2 + globalSettings.sprites.wallRight.yMovement;

			globalSettings.sprites.wallRight.moveDirection 		= "up";			
			globalSettings.sprites.wallRight.staticInCollision 	= true;		
			globalSettings.sprites.wallRight.speed 				= globalSettings.s.physics.wallLeftOriginalSpeed;
			globalSettings.sprites.wallRight.hitsCount			= 0;
			globalSettings.sprites.wallRight.move = function()
			{
				if(this.position.y <= ((this.height / 2))) 	{ this.moveDirection = "down"; globalSettings.sprites.wallRight.hitsCount++;  }
				if(this.position.y >= ((this.height / 2) + this.yMovement)) { this.moveDirection = "up"; globalSettings.sprites.wallRight.hitsCount++; }
				
				if(globalSettings.sprites.wallRight.hitsCount == globalSettings.s.physics.wallRightSpeedHitsCountMax)
				{
					globalSettings.sprites.wallRight.hitsCount 	= 0;
					globalSettings.sprites.wallRight.speed 		= Math.floor(Math.random() * globalSettings.s.physics.wallRightSpeedRandomMax + globalSettings.s.physics.wallRightSpeedRandomMin);
				}

				if(this.moveDirection == "up")
				{
					//Move up
					this.position = new Vector(this.position.x, this.position.y - globalSettings.sprites.wallRight.speed);
				}
				else
				{
					//Move down
					this.position = new Vector(this.position.x, this.position.y + globalSettings.sprites.wallRight.speed);
				}
			}
			rendererContainer.addChild(globalSettings.sprites.wallRight);	
			
			//Character
			globalSettings.sprites.character1.anchor.x 		= 0.5;
			globalSettings.sprites.character1.anchor.y 		= 0.5;
			globalSettings.sprites.character1.visible		= false;
			globalSettings.sprites.character1.position.x 	= globalSettings.s.designDim.w / 4 * 3;
			globalSettings.sprites.character1.position.y	= globalSettings.s.designDim.h + 100;		
			rendererContainer.addChild(globalSettings.sprites.character1);	
			physicsSpriteArray.push(globalSettings.sprites.character1);
			collisionsSpriteArray.push(globalSettings.sprites.character1);
			//console.log(globalSettings.sprites.character1);
			globalSettings.sprites.character1.movementTextures = [];
			globalSettings.sprites.character1.movementTextures[0] = globalSettings.sprites.character1.texture;
			globalSettings.sprites.character1.movementTextures[1] = globalSettings.sprites.character2.texture;
			globalSettings.sprites.character1.movementTextures[2] = globalSettings.sprites.character3.texture;			
			globalSettings.sprites.character1.checkMovementTexture = function()
			{
				if(this.velocity.x == 0) 
				{
					//Character's face follows the roller
					if(this.position.x > globalSettings.sprites.roller.position.x)
					{
						this.texture = (globalSettings.sprites.character1.movementTextures[1]);
					}
					else
					{
						this.texture = (globalSettings.sprites.character1.movementTextures[2]);
					}
				}
				if(this.velocity.x < 0) 
				{
					if(this.texture != globalSettings.sprites.character1.movementTextures[1])
					{
						this.texture = (globalSettings.sprites.character1.movementTextures[1]);
					}
				}
				if(this.velocity.x > 0) 
				{
					if(this.texture != globalSettings.sprites.character1.movementTextures[2])
					{
						this.texture = (globalSettings.sprites.character1.movementTextures[2]);
					}
				}				
			}

			//Roller
			globalSettings.sprites.roller.anchor.x 		= 0.5;
			globalSettings.sprites.roller.anchor.y 		= 0.5;
			globalSettings.sprites.roller.visible		= false;
			globalSettings.sprites.roller.loop			= true;
			globalSettings.sprites.roller.position.x 	= globalSettings.s.designDim.w / 2;
			globalSettings.sprites.roller.position.y	= globalSettings.sprites.roller.height / 2;		
			rendererContainer.addChild(globalSettings.sprites.roller);
			globalSettings.sprites.roller.bounce 		= globalSettings.s.physics.rollerBounce;
			globalSettings.sprites.roller.checkMovementTexture = function()
			{
				if(this.velocity.x == 0)  	{ if(this.animationSpeed != 0) 		{ this.animationSpeed = 0; } }
				if(this.velocity.x < 0) 	{ this.animationSpeed = -1.8 * Math.abs(this.velocity.x); }
				if(this.velocity.x > 0) 	{ this.animationSpeed = 1.8 * Math.abs(this.velocity.x); }	

				/*
				if(this.velocity.x < 0) 	{ if(this.animationSpeed != -0.4) 	{ this.animationSpeed = -1.8 * Math.abs(this.velocity.x); } }
				if(this.velocity.x > 0) 	{ if(this.animationSpeed != 0.4) 	{ this.animationSpeed = 1.8 * Math.abs(this.velocity.x); } }	
				*/
			}
			physicsSpriteArray.push(globalSettings.sprites.roller);	
			collisionsSpriteArray.push(globalSettings.sprites.roller);
			globalSettings.sprites.roller.play();
			
			globalSettings.sprites.roller.checkIfOutside = function()
			{
				if(this.position.x < 0 || this.position.x  > globalSettings.s.designDim.w)
				{
					ttMain.destoryOldRoller();
				}
				/* FULL ROLLER OUTSIDE
				if(this.position.x + this.width / 2 < 0 || this.position.x - this.width / 2 > globalSettings.s.designDim.w)
				{
					ttMain.destoryOldRoller();
				}
				*/
			}

			//Add walls to collisionarray
			collisionsSpriteArray.push(globalSettings.sprites.wallLeft);
			collisionsSpriteArray.push(globalSettings.sprites.wallRight);				
			
			//Test text
			//var text = new PIXI.Text("Test test test", {font:"120px Arial", fill:"red"});
			//TEXTS
			globalSettings.texts.scoreText.anchor.x = 0.5;
			globalSettings.texts.scoreText.anchor.y = 0.5;
			globalSettings.texts.scoreText.position.x = globalSettings.s.designDim.w / 2;
			globalSettings.texts.scoreText.position.y = globalSettings.s.designDim.h / 2;

			rendererContainer.addChild(globalSettings.texts.scoreText);

			//HIGHSCORE TEXTS
			for(var aa in globalSettings.texts.highScoreTexts)
			{
				globalSettings.texts.highScoreTexts[aa].anchor.x = 0.5;
				globalSettings.texts.highScoreTexts[aa].anchor.y = 0.5;
				globalSettings.texts.highScoreTexts[aa].alpha = 0.08 * (9 - aa) + 0.15;
				globalSettings.texts.highScoreTexts[aa].position.x = globalSettings.s.designDim.w / 2;
				globalSettings.texts.highScoreTexts[aa].position.y = highScoreTopLevel + aa * (highScoreTextFontSize + highScoreTextFontSize / 4);				
				rendererContainer.addChild(globalSettings.texts.highScoreTexts[aa]);
			}

			
		}

		ttMain.doPhysicsPart1 = function()
		{
			//Check BB collisions by using Minkowski difference (and if minkowski, then pixel perfect check)
			for(var a in physicsSpriteArray)
			{
				//console.log(physicsSpriteArray[a]);
				physicsSpriteArray[a].calculatePhysics();
				physicsSpriteArray[a].solvedCollisions = [];
				for(var b in collisionsSpriteArray)
				{					
					physicsSpriteArray[a].checkIfCollision(collisionsSpriteArray[b]);
				}
			}
		}	

		ttMain.doPhysicsPart2 = function()
		{
			//Check ground hit, left, right, top and show right texture of the sprite (ie. left, right and so on)
			for(var a in physicsSpriteArray)
			{
				physicsSpriteArray[a].checkBottomHit();
				if(physicsSpriteArray[a] === globalSettings.sprites.character1)
				{
					if(physicsSpriteArray[a].checkLeftFull())
					{
						if(physicsSpriteArray[a].y > globalSettings.s.designDim.h / 2)
						{
							physicsSpriteArray[a].onSurface = false;
							physicsSpriteArray[a].velocity = new Vector(0, 0);
							physicsSpriteArray[a].position = new Vector(globalSettings.s.designDim.w / 2, globalSettings.s.designDim.w / 4);
						}
						else
						{
							physicsSpriteArray[a].position = new Vector(physicsSpriteArray[a].position.x + (globalSettings.sprites.wallRight.width / 2, physicsSpriteArray[a].position.y));							
							physicsSpriteArray[a].velocity = new Vector(physicsSpriteArray[a].velocity.x * -1, physicsSpriteArray[a].velocity.y);
							physicsSpriteArray[a].position = new Vector(0 + (physicsSpriteArray[a].width / 2), physicsSpriteArray[a].position.y);
						}
					}
					if(physicsSpriteArray[a].checkRightFull())
					{
						if(physicsSpriteArray[a].y > globalSettings.s.designDim.h / 2)
						{
							physicsSpriteArray[a].onSurface = false;
							physicsSpriteArray[a].velocity = new Vector(0, 0);
							physicsSpriteArray[a].position = new Vector(globalSettings.s.designDim.w / 2, globalSettings.s.designDim.w / 4);
						}
						else
						{
							physicsSpriteArray[a].position = new Vector(physicsSpriteArray[a].position.x - (globalSettings.sprites.wallRight.width / 2, physicsSpriteArray[a].position.y));
							physicsSpriteArray[a].velocity = new Vector(physicsSpriteArray[a].velocity.x * -1, physicsSpriteArray[a].velocity.y);
							physicsSpriteArray[a].position = new Vector(globalSettings.s.designDim.w - (physicsSpriteArray[a].width / 2), physicsSpriteArray[a].position.y);
						}

					}			
					if(physicsSpriteArray[a].checkTop())
					{
						//console.log("top hit");
						physicsSpriteArray[a].velocity = new Vector(physicsSpriteArray[a].velocity.x, physicsSpriteArray[a].velocity.y * globalSettings.s.physics.characterTopBounce);
						physicsSpriteArray[a].position = new Vector(physicsSpriteArray[a].position.x, physicsSpriteArray[a].height / 2);
					}							
						
				}

				if(typeof physicsSpriteArray[a].checkMovementTexture != "undefined")
				{
					physicsSpriteArray[a].checkMovementTexture();
				}
			}
			
		}			

		ttMain.createNewCharacter = function(randomDirection)
		{
			if(randomDirection == 2)
			{				
				globalSettings.sprites.character1.position.x 	= (globalSettings.s.designDim.w / 4) * 3 + globalSettings.sprites.character1.width / 2;
				globalSettings.sprites.character1.position.y	= (globalSettings.s.designDim.h / 2) + globalSettings.sprites.character1.height / 2;			
			}
			else
			{
				globalSettings.sprites.character1.position.x 	= (globalSettings.s.designDim.w / 4) * 0.5 + globalSettings.sprites.character1.width / 2;
				globalSettings.sprites.character1.position.y	= (globalSettings.s.designDim.h / 2) + globalSettings.sprites.character1.height / 2;				
			}
		}
		
		var randomQwery = 0;
		var xPosTmp = 0;
		
		ttMain.createNewRoller = function(randomDirection)
		{
				randomQwery = Math.floor(Math.random() * 3) + 1;
				if(randomQwery == 1) { xPosTmp = globalSettings.s.designDim.w / 2 - 200; }
				if(randomQwery == 2) { xPosTmp = globalSettings.s.designDim.w / 2; }
				if(randomQwery == 3) { xPosTmp = globalSettings.s.designDim.w / 2 + 200; }			
			
			
				globalSettings.sprites.roller.position.x 		= xPosTmp;
				globalSettings.sprites.roller.position.y		= globalSettings.sprites.roller.height / 2;
				globalSettings.sprites.roller.onSurface 		= false;	

				if(randomDirection == 1)
				{	
					globalSettings.sprites.roller.velocity		 	= new Vector(globalSettings.s.physics.rollerOriginalXVelocity + globalSettings.points  * globalSettings.s.physics.rollerPointsVelocityMultiplier, 0);	
				}
				else
				{
					globalSettings.sprites.roller.velocity		 	= new Vector(-1 * globalSettings.s.physics.rollerOriginalXVelocity - globalSettings.points * globalSettings.s.physics.rollerPointsVelocityMultiplier, 0);	
				}				
		}

		ttMain.destoryOldRoller = function()
		{
			//Destory old and set wait
			audiosArray["piste"].audio.play();
			globalSettings.points++;
			globalSettings.texts.scoreText.text = globalSettings.points;
			ttMain.createNewRoller(Math.floor(Math.random() * 2) + 1);
		}	
		

		ttMain.runStartStartScreen = function()
		{
				//Check high scores 

				globalSettings.sprites.background1.visible 		= true;
				globalSettings.sprites.background2.visible 		= false;
				globalSettings.sprites.buttonUp.visible 		= false;
				globalSettings.sprites.buttonDown.visible 		= false;
				globalSettings.sprites.buttonLeft.visible 		= false;
				globalSettings.sprites.wallBottom.visible 		= false;
				globalSettings.sprites.buttonRight.visible 		= false;
				globalSettings.sprites.wallLeft.visible 		= false;
				globalSettings.sprites.wallRight.visible 		= false;
				globalSettings.sprites.character1.visible 		= false;	
				globalSettings.sprites.roller.visible 			= false;	
				globalSettings.texts.scoreText.visible			= false;

				//HIGHSCORE TEXTS
				for(var aa in globalSettings.texts.highScoreTexts)
				{
					globalSettings.texts.highScoreTexts[aa].visible = true;			
				}									
								
				globalSettings.gameState = globalSettings.s.GAME_STATES.START_SCREEN;
		}

		ttMain.runStartScreen = function()
		{
			ttMain.ujellus_1_EngineRun(globalSettings.current.time.timeDiffNowMs);
			ttMain.ujellus_3_EngineRun(globalSettings.current.time.timeDiffNowMs);
		}

		ttMain.runStartGame = function()
		{
				globalSettings.sprites.background1.visible 		= false;
				globalSettings.sprites.background2.visible 		= true;
				globalSettings.sprites.buttonUp.visible 		= true;
				globalSettings.sprites.buttonDown.visible 		= true;
				globalSettings.sprites.buttonLeft.visible 		= true;
				globalSettings.sprites.buttonRight.visible 		= true;
				globalSettings.sprites.wallLeft.visible 		= true;
				globalSettings.sprites.wallRight.visible 		= true;
				globalSettings.sprites.wallBottom.visible 		= false;
				globalSettings.sprites.character1.visible 		= true;	
				globalSettings.sprites.roller.visible 			= true;		

				//HIGHSCORE TEXTS
				for(var aa in globalSettings.texts.highScoreTexts)
				{
					globalSettings.texts.highScoreTexts[aa].visible = false;			
				}	

				//Reset score
				globalSettings.points 							= 0;				
				globalSettings.texts.scoreText.text 			= 0;
				globalSettings.texts.scoreText.visible			= true;	

				var randomDirection = Math.floor(Math.random() * 2) + 1;
				ttMain.createNewRoller(randomDirection);
				ttMain.createNewCharacter(randomDirection);
		
				globalSettings.sprites.character1.velocity		= new Vector(0, 0);
				globalSettings.sprites.character1.onSurface 	= false;		

				

				globalSettings.gameState = globalSettings.s.GAME_STATES.GAME_ON;
				audiosArray["game_start"].audio.play();
		}	

		ttMain.runGameFrame = function()
		{
			ttMain.ujellus_1_EngineRun(globalSettings.current.time.timeDiffNowMs);		
			ttMain.ujellus_2_EngineRun(globalSettings.current.time.timeDiffNowMs);	
			ttMain.ujellus_3_EngineRun(globalSettings.current.time.timeDiffNowMs);

			if(!audiosArray["metsa"].audio.playing) 
			{ 
				audiosArray["metsa"].currentTime = 0;
				audiosArray["metsa"].audio.playing = true; 
				audiosArray["metsa"].audio.play(); 
			}
			else
			{
				audiosArray["metsa"].currentTime = audiosArray["metsa"].currentTime + globalSettings.current.time.timeDiffNowMs;
				if(audiosArray["metsa"].currentTime > 24000) { audiosArray["metsa"].currentTime = 0; audiosArray["metsa"].audio.play(); }				
			}
			globalSettings.sprites.wallRight.move();
			globalSettings.sprites.wallLeft.move();
			globalSettings.sprites.roller.checkIfOutside();

			//Calculate new positions
			ttMain.doPhysicsPart1();

			//Check collisions and do position and velocity corrections
			ttMain.doPhysicsPart2();


		}

		ttMain.runGamePaused = function()
		{

		}	

		ttMain.runStartGameOver = function()
		{
			audiosArray["game_over"].audio.play();
			audiosArray["metsa"].audio.playing = false;
			audiosArray["metsa"].audio.stop();
			audiosArray["metsa"].currentTime = 0;
			ttHighScoreManager.saveTop10(globalSettings.points);
			globalSettings.gameState = globalSettings.s.GAME_STATES.GAME_OVER;
		}	

		var waitMS = 0;
		ttMain.runGameOver = function()
		{
			
			if(waitMS > globalSettings.s.wait.gameOver)
			{
				waitMS = 0;
				globalSettings.gameState = globalSettings.s.GAME_STATES.START_START_SCREEN;
			}
			else
			{
				globalSettings.sprites.roller.animationSpeed = 0;
				waitMS = waitMS + globalSettings.current.time.timeDiffNowMs;
			}
		}											

		ttMain.runMainLoop = function()
		{
			function queue()        { window.requestAnimationFrame(loop); }   
			function loop()
			{
				ttMain.loopCalculateTime();		//THIS HAS TO BE IN THE BEGINNING OF THE LOOP!!!

				//START START_SCREEN (1 frame)
				if(globalSettings.gameState == globalSettings.s.GAME_STATES.START_START_SCREEN) { ttMain.runStartStartScreen(); }

				//START_SCREEN
				if(globalSettings.gameState == globalSettings.s.GAME_STATES.START_SCREEN) { ttMain.runStartScreen(); }

				//START GAME (1 frame)
				if(globalSettings.gameState == globalSettings.s.GAME_STATES.START_GAME) { ttMain.runStartGame(); }				

				//GAME ON
				if(globalSettings.gameState == globalSettings.s.GAME_STATES.GAME_ON) { ttMain.runGameFrame(); }	

				//GAME PAUSED
				if(globalSettings.gameState == globalSettings.s.GAME_STATES.GAME_PAUSED) { ttMain.runGamePaused(); }	

				//GAME OVER (1 frame)
				if(globalSettings.gameState == globalSettings.s.GAME_STATES.START_GAME_OVER) { ttMain.runStartGameOver(); }

				//GAME OVER SCREEN / HIGH SCORE SCREEN
				if(globalSettings.gameState == globalSettings.s.GAME_STATES.GAME_OVER) { ttMain.runGameOver(); }

				//RENDER
				mainRenderer.render(rendererContainer);
			
				queue();
			}		

			/* Main loop function definitions end here! */
			loop();	//1st call of the loop!
		}
	}( window.ttMain = window.ttMain || {}, jQuery )); 


	/* HELPERS BELOW THIS LINE */
	/* ----------------------- */

		/* SCALING MANAGER */
		(function(ttScalingManager, $ ) {

			ttScalingManager.mainRenderer;
			ttScalingManager.windowDim 					= { "w": 0, "h": 0 };
			ttScalingManager.gameArea 					= { "w": 0, "h": 0, "l": 0, "r": 0, "t": 0, "b": 0 };
			ttScalingManager.designDim 					= { "w": 0, "h": 0 };
			ttScalingManager.renderObjectId 			= "not_defined";  
			ttScalingManager.scalingFactor	 			= 1; 
			ttScalingManager.nonGameArea 				= { "w": 0, "h": 0}

			ttScalingManager.initRendererDimensions = function(mainRendererTmp, designDimW, designDimH, renderObjectIdTmp, nonGameAreaW, nonGameAreaH)
			{
	
				//SET ONLY ONCE IN THE BEGINNING
				ttScalingManager.mainRenderer 		= mainRendererTmp;
				ttScalingManager.designDim.w 		= designDimW;
				ttScalingManager.designDim.h 		= designDimH;
				ttScalingManager.renderObjectId 	= renderObjectIdTmp;
				ttScalingManager.nonGameArea.w 		= nonGameAreaW;
				ttScalingManager.nonGameArea.h 		= nonGameAreaH;			


				ttScalingManager.calculateRendererDimensions();
				ttScalingManager.scalingFactor = ttScalingManager.gameArea.w / ttScalingManager.designDim.w;	
		
				return {"w": ttScalingManager.gameArea.w, "h": ttScalingManager.gameArea.h, "l": ttScalingManager.gameArea.l, "r": ttScalingManager.gameArea.r, "t": ttScalingManager.gameArea.t, "b": ttScalingManager.gameArea.b, "scalingFactor": ttScalingManager.scalingFactor};

			}

			ttScalingManager.calculateRendererDimensions = function()
			{		
				ttScalingManager.windowDim.w 	= window.innerWidth;
				ttScalingManager.windowDim.h 	= window.innerHeight;


				if((ttScalingManager.windowDim.h / ttScalingManager.designDim.h) >= 1)
				{
					ttScalingManager.gameArea.h = ttScalingManager.designDim.h;
				}
				else
				{
					ttScalingManager.gameArea.h = ttScalingManager.windowDim.h;
				}

				ttScalingManager.gameArea.w = (ttScalingManager.designDim.w / ttScalingManager.designDim.h) * ttScalingManager.gameArea.h;
				
				//Keep centered
				document.getElementById(ttScalingManager.renderObjectId).setAttribute("style", "width:" + ttScalingManager.gameArea.w + "px; height:" + ttScalingManager.gameArea.h + "px; position:absolute;");
				ttScalingManager.gameArea.l 	= (ttScalingManager.windowDim.w / 2) - (ttScalingManager.gameArea.w / 2);
				ttScalingManager.gameArea.r 	= ttScalingManager.gameArea.l  + ttScalingManager.gameArea.w;
				ttScalingManager.gameArea.t		= 0;
				ttScalingManager.gameArea.b 	= ttScalingManager.gameArea.t + ttScalingManager.gameArea.h;			
				document.getElementById(ttScalingManager.renderObjectId).style.left = ttScalingManager.gameArea.l;				
			}


			ttScalingManager.scaleRenderer = function()
			{
				//Scale the renderer
				ttScalingManager.calculateRendererDimensions();
				mainRenderer.view.style.width 			= ttScalingManager.gameArea.w + "px";
				mainRenderer.view.style.height 			= ttScalingManager.gameArea.h + "px";
				
			}

		}( window.ttScalingManager = window.ttScalingManager || {}, jQuery ));		


	/* Extend PIXI Sprite */
	PIXI.Sprite.prototype.name 								= "";
	PIXI.Sprite.prototype.acceleration 						= new Vector(0, 0); 
	PIXI.Sprite.prototype.pastAcceleration 					= new Vector(0, 0); 
	PIXI.Sprite.prototype.velocity 							= new Vector(0, 0); 
	PIXI.Sprite.prototype.pastVelocity 						= new Vector(0, 0);
	PIXI.Sprite.prototype.pastPosition 						= new Vector(0, 0); 
	PIXI.Sprite.prototype.temporaryAccelerationImpulseX		= 0;
	PIXI.Sprite.prototype.temporaryAccelerationImpulseY		= 0;
	PIXI.Sprite.prototype.temporaryVelocityImpulseX			= 0;
	PIXI.Sprite.prototype.temporaryVelocityImpulseY			= 0;
	PIXI.Sprite.prototype.onSurface							= false;
	PIXI.Sprite.prototype.affectedByGravity 				= true;
	PIXI.Sprite.prototype.bounce 							= 0;
	PIXI.Sprite.prototype.solvedCollisions					= [];
	PIXI.Sprite.prototype.staticInCollision					= false;

	var tmpCounter = 0;
	PIXI.Sprite.prototype.checkLeft = function()
	{
		if(this.position.x - this.width / 2 <= 0 ) { return true; }
		return false;
	}

	PIXI.Sprite.prototype.checkLeftFull = function()
	{
		if(this.position.x + this.width / 2 <= 0 ) { return true; }
		return false;
	}	

	PIXI.Sprite.prototype.checkRight = function()
	{
		if(this.position.x + this.width / 2 >= globalSettings.s.designDim.w ) { return true; }
		return false;
	}

	PIXI.Sprite.prototype.checkRightFull = function()
	{
		if(this.position.x - this.width / 2 >= globalSettings.s.designDim.w ) { return true; }
		return false;
	}	

	PIXI.Sprite.prototype.checkTop = function()
	{
		if(this.position.y - this.height / 2 <= 0) { return true; }
		return false;
	}	

 	PIXI.Sprite.prototype.checkBottomHit = function () 
	{	
		if(this.bounce == 10000) { this.bounce = 0; }

		if(this.position.y + this.height / 2 >= globalSettings.sprites.wallBottom.y)
		{
			if(!this.onSurface)
			{		
				if(this === globalSettings.sprites.roller)		{ audiosArray["G_pomp"].audio.play();	}
				this.position.x  	= this.position.x;
				this.position.y  	= globalSettings.sprites.wallBottom.position.y - (this.height/ 2) - 0.1;
				this.velocity 		= new Vector(this.velocity.x, -1 * this.bounce * this.velocity.y);					
				if(this.bounce == 0)
				{
					this.onSurface 		= true;
					this.acceleration 	= new Vector(this.acceleration.x, 0);
					this.velocity 		= new Vector(this.velocity.x, 0);
				}
				else
				{
					if(Math.abs(this.velocity.y) < 2) 
					{ 

						this.onSurface 			= true;
						this.acceleration 		= new Vector(this.acceleration.x, 0);
						this.velocity 			= new Vector(this.velocity.x, 0); 	
					}
				}
			}
		}	
	}	

 	PIXI.Sprite.prototype.calculateAcceleration = function () 
    {
        
        var totalAccelerationX = 0;
        var totalAccelerationY = 0;
     
        if(this.affectedByGravity == true)
        {
        	if(!this.onSurface)
        	{
				if(this === globalSettings.sprites.character1)
				{
					totalAccelerationY += ((globalSettings.s.designDim.h - globalSettings.sprites.character1.position.y) / globalSettings.s.designDim.h + globalSettings.s.physics.gravityOrigUser) * globalSettings.s.physics.gravityOrigUser;
				}
				else
				{
					totalAccelerationY += globalSettings.s.physics.gravityOrig;					
				}
            }
        }
        
        //Change the acceleration
        this.acceleration = new Vector(this.acceleration.x + totalAccelerationX * globalSettings.current.time.timeDiffNowMs , this.acceleration.y + totalAccelerationY * globalSettings.current.time.timeDiffNowMs); 
                
        //Check limits     
        if(this.acceleration.x > globalSettings.s.physics.limitAccelerationX) { this.acceleration = new Vector(globalSettings.s.physics.limitAccelerationX, this.acceleration.y); }
        if(this.acceleration.y > globalSettings.s.physics.limitAccelerationY) { this.acceleration = new Vector(this.acceleration.x, globalSettings.s.physics.limitAccelerationY); }        
        
    };     

 	PIXI.Sprite.prototype.calculateVelocity = function()
    {
    
    	var userAdditionX = 0;
    	var userAdditionY = 0;

    	if(this.temporaryVelocityImpulseX != 0) 	{ userAdditionX = this.temporaryVelocityImpulseX; } 
    	if(this.temporaryVelocityImpulseY != 0) 	{ userAdditionY = this.temporaryVelocityImpulseY; }  		

        this.velocity.add(new Vector(this.acceleration.x * globalSettings.current.time.timeDiffNowMs + userAdditionX, this.acceleration.y * globalSettings.current.time.timeDiffNowMs + userAdditionY));
        
    	if(this.tempVelocityImpulseY != 0) 			{ userAdditionY = 0; this.temporaryVelocityImpulseY = 0; }
    	if(this.tempVelocityImpulseX != 0)  		{ userAdditionX = 0; this.temporaryVelocityImpulseX = 0; } 

        if(this.velocity.x > globalSettings.s.physics.limitVelocityX)            { this.velocity = new Vector(globalSettings.s.physics.limitVelocityX, this.velocity.y); }
        if(this.velocity.x < (-1 * globalSettings.s.physics.limitVelocityX))     { this.velocity = new Vector((-1 * globalSettings.s.physics.limitVelocityX), this.velocity.y); }
        if(this.velocity.y > globalSettings.s.physics.limitVelocityY)            { this.velocity = new Vector(this.velocity.x, globalSettings.s.physics.limitVelocityY); }
        if(this.velocity.y < (-1 * globalSettings.s.physics.limitVelocityY))     { this.velocity = new Vector(this.velocity.x, (-1 * globalSettings.s.physics.limitVelocityY)); }
    }; 	

 	PIXI.Sprite.prototype.calculatePhysics = function()
    {
        //Calculate
        this.pastAcceleration = new Vector(this.acceleration.x, this.acceleration.y);
        this.calculateAcceleration();
        this.pastVelocity = new Vector(this.velocity.x, this.velocity.y);
        this.calculateVelocity();
        this.pastPosition = new Vector(this.position.x, this.position.y);
        this.setPhysicsCalculatedPosition(new Vector(this.position.x + this.velocity.x * globalSettings.current.time.timeDiffNowMs, this.position.y + this.velocity.y * globalSettings.current.time.timeDiffNowMs));
    }; 


 	PIXI.Sprite.prototype.setPhysicsCalculatedPosition =  function(positionTmp)
	{
		this.position.x = positionTmp.x;
		this.position.y = positionTmp.y;
	}	
 
 	PIXI.Sprite.prototype.temporaryVelocityImpulse = function(direction)
 	{
 		if(direction == "up")		{ this.temporaryVelocityImpulseY  = globalSettings.s.physics.userSpeedUp; }
		if(direction == "left")		{ this.temporaryVelocityImpulseX  = globalSettings.s.physics.userSpeedLeft; }
		if(direction == "right")	{ this.temporaryVelocityImpulseX  = globalSettings.s.physics.userSpeedRight; }
		if(direction == "down")		{ this.zeroAccelerationAndVelocity(); }
 	}

 	PIXI.Sprite.prototype.zeroAccelerationAndVelocity = function(direction)
 	{
 		this.acceleration.x = 0;
 		this.acceleration.y = 0;
 		this.velocity.x = 0;
 		this.velocity.y = 0;
 	}
	
	PIXI.Sprite.prototype.checkIfCollision = function(otherSprite)
	{
		var alreadySolved = false;		
		if(otherSprite !== this)
		{
			//DO NOT CHECK ALL THE COLLISIONS TWICE!!!
			for(var g in otherSprite.solvedCollisions)
			{
				if(otherSprite.solvedCollisions[g] === this) { alreadySolved = true; }
			}

			if(!alreadySolved)
			{
				var md 		= this.minkowskiDifference(otherSprite);
				var minTmp 	= new Vector(md.position.x - (md.width / 2), md.position.y - (md.height / 2));
				var maxTmp 	= new Vector(md.position.x + (md.width / 2), md.position.y + (md.height / 2));
				
				//If minkowski difference overlaps origin, bounding boxes collide
				if (minTmp.x <= 0 && maxTmp.x >= 0 && minTmp.y <= 0 && maxTmp.y >= 0)
				{
					//Get bitmapdatas using hidden canvas (for the pixel perfect collision check)
					helperCanvasContext.clearRect(0, 0, helperCanvas.width, helperCanvas.height);
					helperCanvasContext.drawImage(this.texture.baseTexture.source, 0, 0);
					bitmapData1 = helperCanvasContext.getImageData(0, 0, this.width, this.height);
					helperCanvasContext.clearRect(0, 0, helperCanvas.width, helperCanvas.height);
					helperCanvasContext.drawImage(otherSprite.texture.baseTexture.source, 0, 0);
					bitmapData2 = helperCanvasContext.getImageData(0, 0, otherSprite.width, otherSprite.height);

					if(isPixelCollision(bitmapData1, this.position.x, this.position.y, bitmapData2, otherSprite.position.x, otherSprite.position.y, true))
					{
						//console.log("True collision! (BB & pixel)");
							if(this === globalSettings.sprites.character1)
							{	
								if(otherSprite === globalSettings.sprites.wallRight)
								{
									this.position = new Vector(globalSettings.sprites.wallRight.position.x - globalSettings.sprites.wallRight.width / 2 - (this.width / 2), this.pastPosition.y);
									this.velocity = new Vector(this.velocity.x * -1, this.velocity.y);
									if(otherSprite.moveDirection == "up") { otherSprite.moveDirection = "down"; } else { otherSprite.moveDirection = "up"; }							
								}

								if(otherSprite === globalSettings.sprites.wallLeft)
								{
									this.position = new Vector(globalSettings.sprites.wallLeft.position.x + globalSettings.sprites.wallLeft.width / 2 + (this.width / 2), this.pastPosition.y);
									this.velocity = new Vector(this.velocity.x * -1, this.velocity.y);
									if(otherSprite.moveDirection == "up") { otherSprite.moveDirection = "down"; } else { otherSprite.moveDirection = "up"; }									
								}	

								if(otherSprite === globalSettings.sprites.roller)
								{
									globalSettings.gameState = globalSettings.s.GAME_STATES.START_GAME_OVER;
								}
															
							}

							if(this === globalSettings.sprites.roller)
							{
							
								if(otherSprite === globalSettings.sprites.wallRight || otherSprite === globalSettings.sprites.wallLeft)
								{
									audiosArray["G_pomp"].audio.play();
									this.position = new Vector(this.pastPosition.x, this.pastPosition.y);
									this.velocity = new Vector(this.velocity.x * -1, this.velocity.y);
									otherSprite.moveDirection = "up";
								}		


								if(otherSprite === globalSettings.sprites.character1)
								{
									globalSettings.gameState = globalSettings.s.GAME_STATES.START_GAME_OVER;
								}																						
							}
							
						}

						this.solvedCollisions.push(otherSprite);
					}
					else
					{
						//console.log("Collision but no collision (only BB)");	
						//globalSettings.gameState = globalSettings.s.GAME_STATES.GAME_PAUSED;
					}
			}
		}
				
	}
	
	PIXI.Sprite.prototype.minkowskiDifference = function(otherSprite)
    {
		if(otherSprite !== this)
		{
			//MIN 1
			var tempVect1 		= new Vector(this.position.x - (this.width / 2), this.position.y - (this.height / 2));
			
			//MAX 2
			var tempVect2 		= new Vector(otherSprite.position.x + (otherSprite.width / 2), otherSprite.position.y + (otherSprite.height / 2));
			
			//AREA 1
			var tempVect3 		= new Vector(this.width, this.height);
			
			//AREA 2
			var tempVect4 		= new Vector(otherSprite.width, otherSprite.height);
			

			var topLeft 		= new Vector(tempVect1.x - tempVect2.x, tempVect1.y - tempVect2.y);

			var fullSize   		= new Vector(tempVect3.x + tempVect4.x, tempVect3.y + tempVect4.y);

			var res 			= new PIXI.Sprite(tmpTexture);
			res.width			= fullSize.x;
			res.height 			= fullSize.y;
			res.position.x 		= topLeft.x + res.width / 2;
			res.position.y 		= topLeft.y + res.height / 2;

			
			return res;
		}
    }
	
	PIXI.Sprite.prototype.getMinVector = function()		{ return new Vector(this.position.x - (this.width / 2), this.position.y - (this.height / 2)); }
	PIXI.Sprite.prototype.getMaxVector = function()		{ return new Vector(this.position.x + (this.width / 2), this.position.y + (this.height / 2));	}	
	PIXI.Sprite.prototype.getSizeVector = function()	{ return new Vector(this.width, this.height); }
	
	/* Vector */
	function Vector(x, y)                           { this.x = x || 0; this.y = y || 0; }
	Vector.prototype.add = function(vector)         { this.x += vector.x; this.y += vector.y; } 
	Vector.prototype.substract = function(vector)   { this.x -= vector.x; this.y -= vector.y; } 
	Vector.prototype.multiply = function(theScalar) { this.x = theScalar * this.x; this.y = theScalar * this.y; }
	Vector.prototype.getMagnitude = function ()     { return Math.sqrt(this.x * this.x + this.y * this.y); };
	Vector.prototype.getAngle = function ()         { return Math.atan2(this.y,this.x); };
	Vector.fromAngle = function (angle, magnitude)  { return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle)); };

	/* Helper keys */	
	keyU.press = keySpace.press = function(data) {	
			globalSettings.gameState = globalSettings.s.GAME_STATES.START_GAME;
	}

	keyU.release = keySpace.release = function(data) {	
	}				

	
	function keyboard(keyCode) 
	{
	  var key = {};
	  key.code = keyCode;
	  key.isDown = false;
	  key.isUp = true;
	  key.press = undefined;
	  key.release = undefined;
	  //The `downHandler`
	  key.downHandler = function(event) {
	    if (event.keyCode === key.code) {
	      if (key.isUp && key.press) key.press();
	      key.isDown = true;
	      key.isUp = false;
	    }
	    event.preventDefault();
	  };

	  //The `upHandler`
	  key.upHandler = function(event) {
	    if (event.keyCode === key.code) {
	      if (key.isDown && key.release) key.release();
	      key.isDown = false;
	      key.isUp = true;
	    }
	    event.preventDefault();
	  };

	  //Attach event listeners
	  window.addEventListener(
	    "keydown", key.downHandler.bind(key), false
	  );
	  window.addEventListener(
	    "keyup", key.upHandler.bind(key), false
	  );
	  return key;
	}

	function checkLineIntersection(line1, line2) {
	   var line1StartX 	= line1.x1;
	   var line1StartY 	= line1.y1;
	   var line1EndX 	= line1.x2;
	   var line1EndY	= line1.y2;
	   var line2StartX 	= line2.x1;
	   var line2StartY 	= line2.y1;
	   var line2EndX 	= line2.x2;
	   var line2EndY	= line2.y2;			   
	    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
	    var denominator, a, b, numerator1, numerator2, result = {
	        x: null,
	        y: null,
	        onLine1: false,
	        onLine2: false
	    };
	    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
	    if (denominator == 0) {
	        return result;
	    }
	    a = line1StartY - line2StartY;
	    b = line1StartX - line2StartX;
	    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
	    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
	    a = numerator1 / denominator;
	    b = numerator2 / denominator;

	    // if we cast these lines infinitely in both directions, they intersect here:
	    result.x = line1StartX + (a * (line1EndX - line1StartX));
	    result.y = line1StartY + (a * (line1EndY - line1StartY));

	    if (a > 0 && a < 1) {
	        result.onLine1 = true;
	    }
	    // if line2 is a segment and line1 is infinite, they intersect if:
	    if (b > 0 && b < 1) {
	        result.onLine2 = true;
	    }
	    // if line1 and line2 are segments, they intersect if both of the above are true
	    return result;
	};	

	function isPixelCollision( first, x, y, other, x2, y2, isCentred )
	{
	    x  = Math.round( x );
	    y  = Math.round( y );
	    x2 = Math.round( x2 );
	    y2 = Math.round( y2 );

	    var w  = first.width,
	        h  = first.height,
	        w2 = other.width,
	        h2 = other.height ;

	    if ( isCentred ) {
	        x  -= ( w/2 + 0.5) << 0
	        y  -= ( h/2 + 0.5) << 0
	        x2 -= (w2/2 + 0.5) << 0
	        y2 -= (h2/2 + 0.5) << 0
	    }

	    var xMin = Math.max( x, x2 ),
	        yMin = Math.max( y, y2 ),
	        xMax = Math.min( x+w, x2+w2 ),
	        yMax = Math.min( y+h, y2+h2 );

	    if ( xMin >= xMax || yMin >= yMax ) {
	        return false;
	    }

	    var xDiff = xMax - xMin,
	        yDiff = yMax - yMin;

	    var pixels  = first.data,
	        pixels2 = other.data;

	    if ( xDiff < 4 && yDiff < 4 ) {
	        for ( var pixelX = xMin; pixelX < xMax; pixelX++ ) {
	            for ( var pixelY = yMin; pixelY < yMax; pixelY++ ) {
	                if (
	                        ( pixels [ ((pixelX-x ) + (pixelY-y )*w )*4 + 3 ] !== 0 ) &&
	                        ( pixels2[ ((pixelX-x2) + (pixelY-y2)*w2)*4 + 3 ] !== 0 )
	                ) {
	                    return true;
	                }
	            }
	        }
	    } else {
	        var incX = xDiff / 3.0,
	            incY = yDiff / 3.0;
	        incX = (~~incX === incX) ? incX : (incX+1 | 0);
	        incY = (~~incY === incY) ? incY : (incY+1 | 0);

	        for ( var offsetY = 0; offsetY < incY; offsetY++ ) {
	            for ( var offsetX = 0; offsetX < incX; offsetX++ ) {
	                for ( var pixelY = yMin+offsetY; pixelY < yMax; pixelY += incY ) {
	                    for ( var pixelX = xMin+offsetX; pixelX < xMax; pixelX += incX ) {
	                        if (
	                                ( pixels [ ((pixelX-x ) + (pixelY-y )*w )*4 + 3 ] !== 0 ) &&
	                                ( pixels2[ ((pixelX-x2) + (pixelY-y2)*w2)*4 + 3 ] !== 0 )
	                        ) {
	                            return true;
	                        }
	                    }
	                }
	            }
	        }
	    }

	    return false;
	}

}( window.tt = window.tt || {}, jQuery ));  