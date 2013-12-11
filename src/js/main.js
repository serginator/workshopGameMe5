// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = ( function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/*function */callback, /* DOMElement*/element) {
            window.setTimeout(callback, 1000 / 60);
        };
} ) ();

var arrayRemove = function( array, from ) {
    var rest = array.slice( ( from ) + 1 || array.length );
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply( array, rest );
};

var game = ( function () {

    // Global vars
    var canvas, ctx, buffer, bufferctx,
        background, background2, background3, background4,
        foreground, foreground2, foreground3, foreground4,
        starfield, starfield2,
        bgSpeed = 2,
        to_radians = Math.PI / 180,
        shots = [],      //Array of shots
        keyPressed = {},
        keyMap = {
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            rotateLeft: 65, // A
            rotateRight: 68, // D
            fire: 32,     // Spacebar
            fire2: 17,    // Ctrl
            speedUp: 34,  // Av Pag
            speedDown: 33, // Re Pag
            toggleMusic: 84, // T, toggle music
            bombs: 98, // B, bombs
            lshift: 304, // Left shift, slow down
            mute: 77 // m key
        },
        nextShootTime = 0,
        shotDelay = 100,
        currentTime = 0,
        player, enemy,
        audioCtx, audioBuffer, audioMusic, currentAudioMusic,
        changingMusic = false;

    function loop () {
        update();
        draw();
    }

    function extend ( destination, source ) {
        for ( var property in source ) {
            destination[ property ] = source[ property ];
        }
        return destination;
    }

    function init () {
        canvas = document.getElementById( 'canvas' );
        ctx = canvas.getContext( '2d' );

        // Buffering
        buffer = document.createElement('canvas');
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        bufferctx = buffer.getContext('2d');

		ctx.fillStyle = '#fff';
		ctx.font = 'italic 25px arial';
		ctx.textBaseline = 'bottom';
		ctx.fillText('Loading...', buffer.width - 200, buffer.height - 50);

		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		audioCtx = new window.AudioContext();

		// Audio stuff
		audioBuffer = new BufferLoader(audioCtx, [
			'Music/MP3/16-bits-TFIV-Stand-Up-Against-Myself.mp3',
			'Music/MP3/32-bits-TFV-Steel-Of-Destiny.mp3',
			'Music/MP3/128-bits-Ikaruga-Ideal.mp3'
		], createAudioSources);
		audioBuffer.load();

		setTimeout(function() {
			// Load resources
			// Background pattern
			background = new Image();
			background.src = 'images/background-1.jpg';
			background.posX = 0;

			background2 = new Image();
			background2.src = 'images/background-2.jpg';
			background2.posX = background.width;

			background3 = new Image();
			background3.src = 'images/background-3.jpg';
			background3.posX = background.width * 2;

			background4 = new Image();
			background4.src = 'images/background-4.jpg';
			background4.posX = background.width * 3;

			foreground = new Image();
			foreground.src = 'images/foreground-1.png';
			foreground.posX = 0;

			foreground2 = new Image();
			foreground2.src = 'images/foreground-2.png';
			foreground2.posX = foreground.width;

			foreground3 = new Image();
			foreground3.src = 'images/foreground-3.png';
			foreground3.posX = foreground.width * 2;

			foreground4 = new Image();
			foreground4.src = 'images/foreground-4.png';
			foreground4.posX = foreground.width * 3;

			starfield = new Image();
			starfield.src = 'images/starfield-2.png';
			starfield.posX = 0;

			starfield2 = new Image();
			starfield2.src = 'images/starfield-2.png';
			starfield2.posX = starfield.width;

			player = new Player();
			enemy = new Enemy();

			// Attach keyboard control
			addListener(document, 'keydown', keyDown);
			addListener(document, 'keyup', keyUp);

			// Gameloop
			var anim = function() {
				loop();
				window.requestAnimFrame(anim);
			};
			anim();
		}, 10000);
    }

    function createAudioSources(list) {
        audioMusic = [];
        for (var i = 0; i < 3; i++) {
            setAudioSource(i);
        }
        audioMusic[0].start(0);
    }

    function setAudioSource(index) {
        audioMusic[index] = audioCtx.createBufferSource();
            audioMusic[index].buffer = audioBuffer.bufferList[index];
            audioMusic[index].connect(audioCtx.destination);
            audioMusic[index].loop = true;
    }

    function Player ( player ) {
        player = new Image();
        player.src = 'images/ship-2.png';
        player.posX = 30; // Dedault X position
        player.posY = (canvas.height / 2) - (player.height / 2); // Def Y pos
        player.speed = 5;
        player.rotate = 0;

        player.fire = function() {
            if (nextShootTime < currentTime || currentTime === 0) {
                var shot = new Shot(this, player.posX + 45,
                    player.posY + 23, 5);
                shot.add();
                currentTime += shotDelay;
                nextShootTime = currentTime + shotDelay;
            } else {
                currentTime = new Date().getTime();
            }
        };
        return player;
    }

    function Shot(shot, _x, _y, _speed) {
        shot = new Image();
        shot.src = 'images/shot.png'; //12x12
        shot.posX = _x;
        shot.posY = _y;
        shot.speed = _speed;
        shot.id = 0;
        shot.time = new Date().getTime();
        shot.add = function() {
            shots.push(shot);
        };
        shot.del = function(id) {
            arrayRemove(shots, id);
        };
        return shot;
    }

    function Enemy(enemy, _x, _y) {
        enemy = new Image();
        enemy.src = 'images/boss.png'; //128x128
        enemy.posX = canvas.width - enemy.width;
        enemy.posY = canvas.height / 2 - enemy.width / 2;
        enemy.life = 5; //5 hits
        enemy.backToLife = function() {
            this.life = 5;
            this.posY = Math.floor(Math.random() *
                (canvas.height - this.height));
            this.posX = Math.floor(Math.random() *
                (canvas.width - this.width - player.width)) + player.width;
        };
        return enemy;
    }

    function checkCollisions(shot) {
        if (shot.posX >= enemy.posX && shot.posX <=
            (enemy.posX + enemy.width)) {
            if (shot.posY >= enemy.posY && shot.posY <=
                (enemy.posY + enemy.height)) {
                (enemy.life > 1) ? enemy.life-- : enemy.backToLife();
                shot.del(parseInt(shot.id, 10));
                return false;
            }
        }
        return true;
    }

    /**
     * Scroll Background
     * @param {obj} layers An oject with the backgounds to slide and speed.
     */
    var scrollBackground = function ( layersGroup ) {
        if ( ! Array.isArray( layersGroup ) ) layersGroup = [ layersGroup ];

        layersGroup.forEach( function ( layers ) {
            var settings = {
                source: [],
                orientation: 'horizontal',
                moveTo: 'right'
            },
            originalLayersLength = layers.source.length,
            index, axis, magnitude, displace, calculateNewMove, newPosition;

            if ( layers.mirrorAtEnd ) {
                var mirror = background4;

                layers.source.push( mirror );
            }

            index = layers.source.length;
            extend( settings, layers );

            settings.speed = layers.speed ? bgSpeed * layers.speed : bgSpeed;

            while ( index-- ) {
                axis = ( settings.orientation === 'horizontal' ) ? 'X' : 'Y';
                magnitude = ( settings.orientation === 'horizontal' ) ? 'width' : 'height';
                displace = ( settings.moveTo === 'down' || settings.moveTo === 'right' ) ? 'negative' : 'positive';

                displace === 'positive'
                    ? settings.source[index][ 'pos' + axis ] -= settings.speed
                    : settings.source[index][ 'pos' + axis ] += settings.speed;

                calculateNewMove = ( displace === 'positive' )
                    ? settings.source[index][ 'pos' + axis ] > -( settings.source[ index ][ magnitude ] * ( originalLayersLength - 1 ) )
                    : settings.source[index][ 'pos' + axis ] < settings.source[ index ][ magnitude ];

                if ( calculateNewMove ) {
                    newPosition = settings.source[index][ 'pos' + axis ];
                    bufferctx.drawImage( settings.source[index], ( axis === 'X' ) ? newPosition : 0, ( axis === 'Y' ) ? newPosition : 0 );
                } else {
                    newPosition = settings.source[index][ magnitude ];
                    settings.source[index][ 'pos' + axis ] = ( displace === 'positive' ) ? newPosition : Math.abs( newPosition ) * -1;
                }
            }
        } );
    };

    function renderImage ( image, ctxTmp, x, y, angle ) {
        ctxTmp.save();
        ctxTmp.translate( x, y );
        ctxTmp.rotate( angle * to_radians );
        ctxTmp.drawImage( image, - ( image.width / 2 ), - ( image.height / 2 ) );
        ctxTmp.restore();
    }

    function playerUp() {
        player.posY -= player.speed;
    }

    function rotateLeft () {
        player.rotate -= 5;
    }

    function rotateRight () {
        player.rotate += 5;
    }

    function playerAction() {
        if (keyPressed.up && player.posY > 5) {
            playerUp();
        }
        if (keyPressed.down && player.posY <
            (canvas.height - player.height - 5)) {
            player.posY += player.speed;
        }
        if (keyPressed.left && player.posX > 5) {
            player.posX -= player.speed;
        }
        if (keyPressed.right && player.posX <
            (canvas.width - player.width - 5)) {
            player.posX += player.speed;
        }
        if (keyPressed.rotateLeft) {
            rotateLeft();
        }
        if (keyPressed.rotateRight) {
            rotateRight();
        }
        if (keyPressed.fire) {
            player.fire();
        }
        if (keyPressed.speedUp && bgSpeed < 10) {
            bgSpeed += 1;
            console.log(bgSpeed);
        }
        if (keyPressed.speedDown && bgSpeed >= 2) {
            bgSpeed -= 1;
            console.log(bgSpeed);
        }
        if (keyPressed.toggleMusic) {
            if (!changingMusic) {
                changingMusic = true;
                changeAudioMusic();
                console.log('Changing music');
            }
        }
        if (keyPressed.mute) {
            if (!changingMusic) {
                changingMusic = true;
                toggleMute();
                console.log('Mute');
            }
        }
    }

    /**
     * CrossBrowser implementation for a Event Listener
     */
    function addListener(element, type, expression, bubbling) {
        bubbling = bubbling || false;

        if (window.addEventListener) { // Standard
            element.addEventListener(type, expression, bubbling);
        } else if (window.attachEvent) { // IE
            element.attachEvent('on' + type, expression);
        } else {
            return false;
        }
    }

    function keyDown(e) {
        var key = (window.event ? e.keyCode : e.which);
        for (var inkey in keyMap) {
            if (key === keyMap[inkey]) {
                e.preventDefault();
                keyPressed[inkey] = true;
            }
        }
    }

    function keyUp(e) {
        var key = (window.event ? e.keyCode : e.which);
        if (key === 84 || key == 77) {
            changingMusic = false;
        }
        for (var inkey in keyMap) {
            if (key === keyMap[inkey]) {
                e.preventDefault();
                keyPressed[inkey] = false;
            }
        }
    }

    function draw() {
        // renderImage( buffer, 300, 300, 120 );
        ctx.drawImage(buffer, 0, 0);
    }

    function update() {
        scrollBackground( [ {
            source: [background, background2, background3/*, background4*/],
            orientation: 'horizontal',
            moveTo: 'left',
            speed: 0.5
        }, {
            source: [foreground, foreground2, foreground3, foreground4],
            speed: 3,
            orientation: 'horizontal',
            moveTo: 'left'
        }, {
            source: [starfield, starfield2],
            speed: 5,
            orientation: 'horizontal',
            moveTo: 'left'
        } ] );


        renderImage( player, bufferctx, player.posX, player.posY, player.rotate );
        // renderImage( enemy, bufferctx, enemy.posX, enemy.posY, player.rotate );

        // bufferctx.drawImage(player, player.posX, player.posY);
        bufferctx.drawImage(enemy, enemy.posX, enemy.posY);

        ( shots.length > 0 ) && shots.forEach( function ( shot, index ) {
            shot.id = index;
            if ( checkCollisions( shot ) ) {
                if ( shot.posX <= canvas.width ) {
                    shot.posX += shot.speed;
                    shot.posY += shot.speed;
                    renderImage( shot, bufferctx, shot.posX, shot.posY, player.rotate );
                } else {
                    shot.del( parseInt( shot.id, 10 ) );
                }
            }
        } );
        playerAction();
    }

    function changeAudioMusic() {
        toggleMute();
        currentAudioMusic++;
        if (currentAudioMusic > audioMusic.length - 1) {
            currentAudioMusic -= 3;
        }
        setAudioSource(currentAudioMusic);
        audioMusic[currentAudioMusic].start(0);
    }

    function toggleMute() {
        if (audioMusic[currentAudioMusic].playbackState === 2) {
            audioMusic[currentAudioMusic].stop(0);
        } else {
            setAudioSource(currentAudioMusic);
            audioMusic[currentAudioMusic].start(0);
        }
    }

    // Public Methods
    return {
        init: init
    }

} ) ();
