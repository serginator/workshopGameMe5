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
        backgroundMirror, background2Mirror, background3Mirror, background4Mirror,
        foreground, foreground2, foreground3, foreground4,
        starfield, starfield2,
        particleManager, fireParticle,
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
            fire: 88,     // X
            fire2: 67,    // C
            focus: 90, // Z
            speedUp: 34,  // Av Pag
            speedDown: 33, // Re Pag
            toggleMusic: 84, // T, toggle music
            special: 32, // Space, bombs
            lshift: 304, // Left shift, slow down
            mute: 77 // m key
        },
        nextShootTime = 0,
        shotDelay = 100,
        currentTime = 0,
        player, enemy,
        audioCtx, audioBuffer, audioMusic, currentAudioMusic, gainNode,
        changingMusic = false,
        musicList = [
            'Music/MP3/16-bits-TFIV-Stand-Up-Against-Myself.mp3',
            'Music/MP3/32-bits-TFV-Steel-Of-Destiny.mp3',
            'Music/MP3/128-bits-Ikaruga-Ideal.mp3'
        ];

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

        // Particle System
        fireParticle = new Image;
        fireParticle.src = "images/fire.png";
        particleManager = new ParticleManager( bufferctx );

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new window.AudioContext();

        // Audio stuff
        audioBuffer = new BufferLoader(audioCtx, musicList, createAudioSources);
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

            backgroundMirror = new Image();
            backgroundMirror.src = 'images/background-4-mirror.jpg';
            backgroundMirror.posX = background.width * 4;

            background2Mirror = new Image();
            background2Mirror.src = 'images/background-3-mirror.jpg';
            background2Mirror.posX = background.width * 5;

            background3Mirror = new Image();
            background3Mirror.src = 'images/background-2-mirror.jpg';
            background3Mirror.posX = background.width * 6;

            background4Mirror = new Image();
            background4Mirror.src = 'images/background-1-mirror.jpg';
            background4Mirror.posX = 0;

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

            currentAudioMusic = 0;

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
        gainNode = audioCtx.createGain();
        for (var i = 0, n = musicList.length; i < n; i++) {
            setAudioSource(i);
        }
        gainNode.connect(audioCtx.destination);
        audioMusic[0].start(0);
    }

    function setAudioSource(index) {
        audioMusic[index] = audioCtx.createBufferSource();
        audioMusic[index].buffer = audioBuffer.bufferList[index];
        audioMusic[index].connect(gainNode);
        audioMusic[index].loop = true;
    }

    function changeAudioMusic() {
        audioMusic[currentAudioMusic].stop(0);
        currentAudioMusic++;
        if (currentAudioMusic > audioMusic.length - 1) {
            currentAudioMusic -= musicList.length;
        }
        setAudioSource(currentAudioMusic);
        audioMusic[currentAudioMusic].start(0);
    }

    function toggleMute() {
        if (gainNode.gain.value === 1) {
            gainNode.gain.value = 0;
        } else {
            gainNode.gain.value = 1;
        }
    }

    function Player ( player ) {
        player = new Image();
        player.src = 'images/ship.png';
        player.posX = 30; // Dedault X position
        player.posY = (canvas.height / 2) - (player.height / 2); // Def Y pos
        player.centerX = player.posX + ( player.width / 2 );
        player.centerY = player.posY + ( player.height / 2 );
        player.rotate = 0;
        player.isBombing = false;

        player.fire = function() {
            if (nextShootTime < currentTime || currentTime === 0) {
                var shot = new Shot( this, player.posX, player.posY, player.rotate, 5 );
                shot.add();
                currentTime += shotDelay;
                nextShootTime = currentTime + shotDelay;
            } else {
                currentTime = new Date().getTime();
            }
        };

        player.focusOn = function () {
            player.speed = 3;
            player.src = 'images/ship-focused.png';
        }

        player.focusOff = function () {
            player.speed = 7;
            player.src = 'images/ship.png';
        }

        return player;
    }

    function Shot(shot, _x, _y, _direction, _speed) {
        shot = new Image();
        shot.src = 'images/shot.png'; //12x12
        shot.posX = _x;
        shot.posY = _y;
        shot.direction = _direction * to_radians;
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
        if ( player.rotate <= -360 ) player.rotate = 0;
    }

    function rotateRight () {
        player.rotate += 5;
        if ( player.rotate >= 360 ) player.rotate = 0;
    }

    function playerAction() {
        if (keyPressed.focus) {
            player.focusOn();
        } else {
            player.focusOff();
        }

        if (keyPressed.up && player.posY > ( player.height / 2 ) ) {
            playerUp();
        }
        if (keyPressed.down && player.posY < ( canvas.height - player.height / 2 ) ) {
            player.posY += player.speed;
        }
        if (keyPressed.left && player.posX > ( player.width / 2 ) ) {
            player.posX -= player.speed;
        }
        if (keyPressed.right && player.posX < ( canvas.width - player.width / 2 ) ) {
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
        if (keyPressed.fire2) {
            bomb();
        }
        if (keyPressed.special) {
            special();
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
        for ( var inkey in keyMap ) {
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

    function bomb () {
        if ( player.isBombing ) {
            return;
        }

        player.isBombing = true;

        var ctx = bufferctx,
            dropCount = 3,
            drops = [],
            nextAdd = -1000000,
            maxVelocity = .1,
            width = canvas.width * 1.5,
            height = canvas.height * 1.5,
            addDrop = null;

        function rand ( max, min ) {
            min = min || 0;
            return Math.floor( Math.random() * ( max - min ) ) + min;
        }

        function gradient ( from,to ) {
            var grd = ctx.createLinearGradient( 0, 0, canvas.width, canvas.height );
            grd.addColorStop( 0, from );
            grd.addColorStop( 1, to );
            return grd;
        }

        var gradients = [
            gradient( 'rgb( 142, 214, 255 )', 'rgb( 179, 76, 0 )' )
        ];

        function compact( array ) {
            var index = -1,
                length = array ? array.length : 0,
                resIndex = 0,
                result = [];

            while ( ++index < length ) {
                var value = array[ index ];
                if ( value ) {
                    result[ resIndex++ ] = value;
                }
            }
            return result;
        }

        function updateDrops ( tm ) {

            if ( !addDrop && ( tm < nextAdd ) )
                return;

            var index = -1;

            nextAdd = tm + 400;

            if ( !tm ) {
                addDrop = null;
            }

            // remove the nulls
            drops = compact( drops );
            if ( addDrop ) {
                while ( ++index < dropCount ) {
                    var x = addDrop.x,
                        y = addDrop.y;

                    if ( dropCount > 1 ) {
                        x += rand( 200 );
                        y += rand( 200 );
                    }

                    drops.push( {
                        x: Math.ceil( x ),
                        y: Math.ceil( y ),
                        start: tm,
                        vx: Math.random() * maxVelocity * 2 - maxVelocity,
                        vy: Math.random() * maxVelocity * 2 - maxVelocity,
                        g: rand( gradients.length ),
                        r: canvas.width,
                        speed: 4
                    } );
                }
                addDrop = null;
            }
        }

        function renderDraw ( tm ) {
            // clear the field
            ctx.globalAlpha = 1;
            ctx.fillStyle = 'white';
            ctx.fillRect( 0, 0, canvas.width, canvas.height );

            // update the drops
            updateDrops( tm );

            // draw the drops
            drops.forEach( function ( drop, i ) {
            if ( drop ) {
                var erase = drawDrop( drop, tm, ctx, gradients[ 0 ] );
                if ( erase )
                    drops[ i ] = null;
                }
            } );

            if ( ! drops.length ) {
                player.isBombing = false;
            } else {
                requestAnimationFrame( renderDraw );
            }
        };


        function drawDrop ( drop, tm, ctx, grd ) {
            var r = ( ( tm - drop.start ) / drop.speed );
            if ( r > ( drop.r * 0.8 ) )
                return true;

            drop.x += drop.vx;
            drop.y += drop.vy;

            ctx.globalAlpha = Math.max(0,(1-(r/drop.r)))*1;
            ctx.strokeStyle = grd;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc( ( drop.x / width ) * canvas.width, ( drop.y / height ) * canvas.height, r, 0, 2 * Math.PI, false );
            ctx.stroke();
            ctx.lineWidth = 0;
            ctx.fill();
        }

        for ( var i=-10000; i < 0; i += 100 )
          updateDrops( i );

      requestAnimationFrame( renderDraw );

      addDrop = {
        x: player.posX + ( player.width ),
        y: player.posY + ( player.height )
      }
    }


    function update() {
        scrollBackground( [ {
            source: [background, background2, background3, background4, background4Mirror, background3Mirror, background2Mirror, backgroundMirror ],
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

        // bufferctx.drawImage(player, player.posX, player.posY);
        bufferctx.drawImage(enemy, enemy.posX, enemy.posY);

        ( shots.length > 0 ) && shots.forEach( function ( shot, index ) {
            shot.id = index;
            if ( checkCollisions( shot ) ) {
                shot.posX += Math.cos( shot.direction ) * shot.speed;
                shot.posY += Math.sin( shot.direction ) * shot.speed;

                // Remove if offcanvas
                if ( shot.posX < 0 || shot.posY < 0 || shot.posX > canvas.width || shot.posY > canvas.height ) {
                    shot.del( parseInt( shot.id, 10 ) );
                }

                bufferctx.drawImage( shot, shot.posX, shot.posY);
            }
        } );
        playerAction();

        particleManager.draw();
    }

    function special () {
        // Parametros del particleManager: posX, posY, size, area, life, speed, gravity
        particleManager.createExplosion( player.posX, player.posY, 60, 5, 70, 3, 0 );
    }

    function ParticleManager(n) {
        var t = [],
            i = n;
        this.draw = function () {
            for (var r = [], n = t.length - 1; n >= 0; n--) t[n].moves++, t[n].x += t[n].xunits, t[n].y += t[n].yunits + t[n].gravity * t[n].moves, t[n].moves < t[n].life && (r.push(t[n]), i.globalAlpha = 5 / t[n].moves, i.drawImage(fireParticle, Math.floor(t[n].x), Math.floor(t[n].y), t[n].width, t[n].height), i.globalAlpha = 1);
            t = r
        }, this.createExplosion = function (n, i, r, u, f, e, o) {
            var e, s, h;
            for (n = n - r * .5, i = i - r * .5, e = r * e * .01, s = 1; s < u; s++)
                for (h = 0; h < 10 * s; h++) t.push(particle(n, i, r, r, s * e, o, f))
        }
    }
    var particle = function (n, t, i, r, u, f, e) {
        var s = Math.floor(Math.random() * 360),
            o = s * Math.PI / 180;
        return {
            x: n,
            y: t,
            width: i,
            height: r,
            speed: u,
            life: e,
            gravity: f,
            xunits: Math.cos(o) * u,
            yunits: Math.sin(o) * u,
            moves: 0
        }
    }

    // Public Methods
    return {
        init: init
    };

} ) ();
