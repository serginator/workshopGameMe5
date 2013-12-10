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
        bgMain, bgMain2, bgMain3, bgMain4, bgSpeed = 2,
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
            t: 116, // T, toggle music
            b: 98, // B, bombs
            lshift: 304 // Left shift, slow down
        },
        nextShootTime = 0,
        shotDelay = 100,
        currentTime = 0,
        player, enemy,
        audioCtx, audioBuffer, audioMusic, currentAudioMusic;

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
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new window.AudioContext();

        // Buffering
        buffer = document.createElement('canvas');
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        bufferctx = buffer.getContext('2d');

        // Load resources
        // Background pattern
        bgMain = new Image();
        bgMain.src = 'images/starfield-1.jpg';
        bgMain.posX = bgMain.width;
        bgMain.posY = -bgMain.height;

        bgMain2 = new Image();
        bgMain2.src = 'images/starfield-1.jpg';
        bgMain2.posX = 0;
        bgMain2.posY = 0;

        bgMain3 = new Image();
        bgMain3.src = 'images/starfield-3.png';
        bgMain3.posX = bgMain3.width;
        bgMain3.posY = -bgMain3.height;

        bgMain4 = new Image();
        bgMain4.src = 'images/starfield-3.png';
        bgMain4.posX = 0;
        bgMain4.posY = 0;

        // Audio stuff
        audioBuffer = new window.BufferLoader(audioCtx, [
            '../Music/16-bits-TFIV-Stand-Up-Against-Myself.mp3',
            '../Music/32-bits-TFV-Steel-Of-Destiny.mp3',
            '../Music/128-bits-Ikaruga-Ideal.mp3'
        ], createAudioSources);

        audioBuffer.load();

        player = new Player();
        enemy = new Enemy();

        // Attach keyboard control
        addListener(document, 'keydown', keyDown);
        addListener(document, 'keyup', keyUp);

        audioMusic[0].play(0);
        currentAudioMusic = 0;

        // Gameloop
        var anim = function() {
            loop();
            window.requestAnimFrame(anim);
        };
        anim();
    }

    function createAudioSources(list) {
        audioMusic = []
        audioMusic[0] = audioCtx.createBufferSource();
        audioMusic[1] = audioCtx.createBufferSource();
        audioMusic[2] = audioCtx.createBufferSource();

        audioMusic[0].buffer = audioBuffer[0];
        audioMusic[1].buffer = audioBuffer[1];
        audioMusic[2].buffer = audioBuffer[2];

        audioMusic[0].connect(audioCtx.destination);
        audioMusic[1].connect(audioCtx.destination);
        audioMusic[2].connect(audioCtx.destination);
    }

    function Player ( player ) {
        player = new Image();
        player.src = 'images/ship-2.png';
        player.posX = 30; // Dedault X position
        player.posY = (canvas.height / 2) - (player.height / 2); // Def Y pos
        player.speed = 5;

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
        enemy.src = 'images/friday13.png'; //128x128
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
                var aux = (enemy.life > 1) ? enemy.life-- : enemy.backToLife();
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
            index = layers.source.length,
            axis, magnitude, displace, calculateNewMove, newPosition;

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
                    ? settings.source[index][ 'pos' + axis ] > -( settings.source[ index ][ magnitude ] )
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

    function rotateElement ( image, ctxTmp, x, y, angle ) {
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
        // rotateElement( player, player.posX, player.posY, 90 );
    }

    function rotateRight () {
        // rotateElement( player, player.posX, player.posY, -90 );
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
        if (keyPressed.t) {
            changeAudioMusic();
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
        for (var inkey in keyMap) {
            if (key === keyMap[inkey]) {
                e.preventDefault();
                keyPressed[inkey] = false;
            }
        }
    }

    function draw() {
        ctx.drawImage(buffer, 0, 0);
    }

    function update() {
        scrollBackground( [ {
            source: [bgMain, bgMain2],
            orientation: 'vertical',
            moveTo: 'up'
        }, {
            source: [bgMain3, bgMain4],
            speed: 3,
            orientation: 'vertical',
            moveTo: 'down'
        } ] );

        bufferctx.drawImage(player, player.posX, player.posY);
        bufferctx.drawImage(enemy, enemy.posX, enemy.posY);

        for (var x = 0, y = shots.length; x < y; x++) {
            var shot = shots[x];
            if (shot) {
                shot.id = x;
                if (checkCollisions(shot)) {
                    if (shot.posX <= canvas.width) {
                        shot.posX += shot.speed;
                        bufferctx.drawImage(shot, shot.posX, shot.posY);
                    } else {
                        shot.del(parseInt(shot.id, 10));
                    }
                }
            }
        }
        playerAction();
    }

    function changeAudioMusic() {
        audioMusic[currentAudioMusic].stop();
        currentAudioMusic++;
        if (currentAudioMusic <= audioMusic.length - 1) {
            audioMusic[currentAudioMusic].play(0);
        } else {
            audioMusic[currentAudioMusic - 3].play(0);
        }
    }

    // Public Methods
    return {
        init: init
    }

} ) ();
