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
        starfield, starfield2, starfield3, starfield4, starfield5, starfield6,
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
            fireMoreSpread: 87, // W
            fireLessSpread: 83, // S
            fire: 88,     // X
            fire2: 67,    // C
            increaseBullets: 73, // I
            decreaseBullets: 79, // O
            focus: 90, // Z
            speedUp: 34,  // Av Pag
            speedDown: 33, // Re Pag
            toggleMusic: 84, // T, toggle music
            spaceBar: 32, // Space, bombs
            mute: 77, // m key
            buggerMode: 49, // 1 key
            bossMode: 50, // 2 key
            clearEnemies: 48 // 0 key
        },
        nextShootTime = 0,
        shotDelay = 100,
        currentTime = 0,
        player, boss,
        buggers = [],
        buggersCount,
        audioCtx, audioBuffer, audioMusic, currentAudioMusic, gainNode,
        changingMusic = false,
        musicList = [
            'Music/MP3/16-bits-TFIV-Stand-Up-Against-Myself.mp3',
            'Music/MP3/32-bits-TFV-Steel-Of-Destiny.mp3',
            'Music/MP3/128-bits-Ikaruga-Ideal.mp3'
        ],
        fxList = [
            'Music/FX/bomb.mp3',
            'Music/FX/shot.mp3',
            'Music/FX/explosion.mp3'
        ],
        FX = {
            bomb: 0,
            shot: 1,
            explosion: 2
        };
        score = 0,
        buggerMode = false,
        bossMode = false;

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

    function resizeCanvas () {
        canvas.width = window.innerWidth * 0.85; // 85%
        canvas.height = window.innerHeight * 0.85;
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        loop();
    }

    function init () {
        canvas = document.getElementById( 'canvas' );
        ctx = canvas.getContext( '2d' );


        // Buffering
        buffer = document.createElement('canvas');
        bufferctx = buffer.getContext('2d');

        ctx.fillStyle = '#fff';
        ctx.font = 'italic 25px arial';
        ctx.textBaseline = 'bottom';
        ctx.fillText('Loading...', buffer.width - 200, buffer.height - 50);

        // Adjusting buggers
        buggersCount = ( canvas.height / 40 ) * 15;

        // Particle System
        fireParticle = new Image;
        fireParticle.src = "images/fire.png";
        particleManager = new ParticleManager( bufferctx );

        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new window.AudioContext();

        // Audio stuff
        audioBuffer = new BufferLoader(audioCtx, musicList.concat(fxList), createAudioSources);
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

            starfield3 = new Image();
            starfield3.src = 'images/starfield-2.png';
            starfield3.posX = starfield.width * 2;

            starfield4 = new Image();
            starfield4.src = 'images/starfield-2.png';
            starfield4.posX = starfield.width * 3;

            starfield5 = new Image();
            starfield5.src = 'images/starfield-2.png';
            starfield5.posX = starfield.width * 4;

            starfield6 = new Image();
            starfield6.src = 'images/starfield-2.png';
            starfield6.posX = starfield.width * 5;

            currentAudioMusic = 0;

            player = new Player();

            // Attach keyboard control
            addListener(document, 'keydown', keyDown);
            addListener(document, 'keyup', keyUp);

            // Resizing Event
            addListener(window, 'resize', resizeCanvas);

            // Gameloop
            var anim = function() {
                resizeCanvas();
                window.requestAnimFrame(anim);
            };
            anim();
        }, 3000);
    }

    function createAudioSources(list) {
        audioMusic = [];
        gainNode = audioCtx.createGain();
        for (var i = 0, n = musicList.length; i < n; i++) {
            setAudioSource(i);
        }
        for (var i = musicList.length, n = i + fxList.length; i < n; i++) {
            setAudioSource(i);
            audioMusic[i].loop = false;
        }
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0;
        audioMusic[0].start(0);
    }

    function setAudioSource(index) {
        audioMusic[ index ] = audioCtx.createBufferSource();
        audioMusic[ index ].buffer = audioBuffer.bufferList[ index ];
        audioMusic[ index ].connect(gainNode);
        audioMusic[ index ].loop = true;
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

    function playFx(index) {
        var audio = audioMusic[index];
        if (audio.playing) {
            audio.stop(0);
        }
        setAudioSource(index);
        audio.loop = false;
        audio.start(0);
        audio.playing = true;

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
        player.posX = player.width; // Dedault X position
        player.posY = (background.height / 2) - (player.height / 2); // Def Y pos
        player.centerX = player.posX + ( player.width / 2 );
        player.centerY = player.posY + ( player.height / 2 );
        player.rotate = 0;
        player.firing = false;
        player.bombing = false;
        player.cooldown = 0;

        player.weapon = {
           count: 1,
           chaos: 0,
           spreadBase: 9,
           spacing: 0,
           speed: 30,
           color: "#00ffff",
           shape: 0,
           firerate: 20
        };
        player.weapon.spread = Math.PI / player.weapon.spreadBase;

        player.increaseWeaponSpread = function ( ) {
            if ( player.weapon.spreadBase < 20 ) {
                player.weapon.spreadBase += 0.2;
                player.weapon.spread = Math.PI / player.weapon.spreadBase;
            }
        };

        player.decreaseWeaponSpread = function ( ) {
            if ( player.weapon.spreadBase > 2 ) {
                player.weapon.spreadBase -= 0.2;
                player.weapon.spread = Math.PI / player.weapon.spreadBase;
            }
        }

        player.increaseBullets = function ( ) {
            if ( player.weapon.count < 20 ) {
                player.weapon.count += 1;
            }
        };

        player.decreaseBullets = function ( ) {
            if ( player.weapon.count >= 2 ) {
                player.weapon.count -= 1;
            }
        };

        player.checkForFire = function () {
            player.cooldown -= 60; // FPS
            if ( player.firing ) {
                if ( player.cooldown <= 0 ) {
                    player.fire();
                    player.cooldown = player.weapon.firerate;
                }
            }
        }

        player.fire = function () {
            if ( player.weapon.count > 1 ) {
                var spreadStart = -player.weapon.spread / 2,
                    spacingStart = player.weapon.spacing / 2,
                    spreadStep = player.weapon.spread / (player.weapon.count - 1),
                    spacingStep = player.weapon.spacing / (player.weapon.count -1);
            } else {
                var spreadStart = 0,
                    spacingStart = 0,
                    spreadStep = 0,
                    spacingStep = 0;
            }

            var rotation = player.rotate * to_radians,
                gunX = player.posX + Math.cos( rotation ) * 34 - Math.sin( rotation ) * 5,
                gunY = player.posY + Math.sin( rotation ) * 34 + Math.cos( rotation ) * 5;

            for( var i = 0; i < this.weapon.count; i++ ) {
                var spacingOffsetX = Math.cos( rotation - Math.PI / 2) * ( spacingStart - i * spacingStep ),
                    spacingOffsetY = Math.sin( rotation - Math.PI / 2) * ( spacingStart - i * spacingStep );

                shot = new Shot( {
                    shot : this,
                    direction : rotation + spreadStart + i * spreadStep,
                    shotX : gunX + spacingOffsetX + Math.random() * player.weapon.chaos - player.weapon.chaos / 2,
                    shotY : gunY + spacingOffsetY + Math.random() * player.weapon.chaos - player.weapon.chaos / 2,
                    speed : player.weapon.speed
                } );
                shot.add();
            }
            playFx(musicList.length + FX.shot);
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

    function Shot( args ) {
        args.shot = new Image();
        args.shot.src = 'images/shot.png'; //12x12
        args.shot.posX = args.shotX;
        args.shot.posY = args.shotY;
        args.shot.direction = args.direction || 0;
        args.shot.speed = args.speed || 256;
        args.shot.color = args.color || "F00";

        args.shot.add = function() {
            shots.push( shot );
        };

        args.shot.del = function( id ) {
            arrayRemove( shots, id );
        };

        return args.shot;
    }

    function Boss(boss, _x, _y) {
        boss = new Image();
        boss.src = 'images/boss.png'; //128x128
        boss.posX = canvas.width - boss.width;
        boss.posY = canvas.height / 2 - boss.width / 2;
        boss.life = 700; //700 hits
        boss.backToLife = function() {
            particleManager.createExplosion( boss.posX, boss.posY, 130, 15, 70, 3, 0 );
            score += 1000;
            bossMode = false;
        };
        return boss;
    }

    function Bugger(bugger) {
        bugger = new Image();
        bugger.src = 'images/bugger.png';
        bugger.initPos = (Math.random() * ( background.height - 120 ) ) + 60;
        bugger.posX = canvas.width + (Math.random() * ( canvas.width / 2 ) ) + 1;
        bugger.posY = bugger.initPos;
        bugger.speed = 5;
        bugger.update = function() {
            bugger.posX -= bugger.speed;
            bugger.posY -= 3 * Math.sin(bugger.initPos * Math.PI / 64);
            bugger.initPos++;

            if ( bugger.posY < 0 ) { bugger.posY = 0; }
            if ( bugger.posY > background.height - 100 ) { bugger.posY = background.height - 100; }
        };
        bugger.add = function() {
            buggers.push(bugger);
        };
        bugger.del = function(id) {
            arrayRemove(buggers, id);
        };
        return bugger;
    }

    function checkCollision(a, b, callback) {
        var bX = b.posX, bY = b.posY, bW = b.width, bH = b.height;
        if (b.fire) {
            bX += 5;
            bY -= 15;
            bH = 15;
            bW = 20;
        }
        if (a.posX >= bX && a.posX <= (bX + bW)) {
            if ((a.posY >= bY && a.posY <= (bY + bH)) ||
                (a.posY <= bY && bY < (a.posY + a.width))) {
                callback();
                makeExplosion(a.posX, a.posY);
                playFx(musicList.length + FX.explosion);
                return true;
            }
        }
        return false;
    }

    function checkCollisionsShot(shot) {
        return checkCollision(shot, boss, function() {
            (boss.life > 1) ? boss.life-- : boss.backToLife();
            shot.del(parseInt(shot.id, 10));
            score += 10;
        });
    }

    function checkCollisionsBugger(bugger) {
        var ret;
        shots.forEach(function(shot, index) {
            ret = checkCollision(shot, bugger, function() {
                shot.del(parseInt(shot.id, 10));
                    bugger.del(parseInt(bugger.id, 10));
                    score += 50;
            });
            if (ret) {
                return true;
            }
        });
        return checkCollision(bugger, player, function() {
            // player.lifes--
            score -= 20;
            bugger.del(parseInt(bugger.id, 10));
        });
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
            index, axis, magnitude, displace, calculateNewMove, newPosition, repeatFactor;

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
                repeatFactor = canvas.width / settings.source[ index ][ magnitude ];

                displace === 'positive'
                    ? settings.source[ index ][ 'pos' + axis ] -= settings.speed
                    : settings.source[ index ][ 'pos' + axis ] += settings.speed;

                calculateNewMove = ( displace === 'positive' )
                    ? settings.source[ index ][ 'pos' + axis ] + settings.source[ index ][ magnitude ] > 0
                    : settings.source[ index ][ 'pos' + axis ] < settings.source[ index ][ magnitude ];

                if ( calculateNewMove ) {
                    newPosition = settings.source[ index ][ 'pos' + axis ];
                    bufferctx.drawImage( settings.source[ index ], ( axis === 'X' ) ? newPosition : 0, ( axis === 'Y' ) ? newPosition : 0 );
                } else {
                    newPosition = settings.source[ index ][ magnitude ] * ( layers.source.length - ( layers.source.length % 4 ? 1 : 2 ) );
                    settings.source[ index ][ 'pos' + axis ] = ( displace === 'positive' ) ? newPosition : Math.abs( newPosition ) * -1;
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

        if (keyPressed.spaceBar) {
            return false;
        }

        if (keyPressed.up && player.posY > ( player.height / 2 ) ) {
            playerUp();
        }
        if (keyPressed.down && player.posY < ( canvas.height - player.height / 2 ) &&
                player.posY < background.height) {
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
        if (keyPressed.fireMoreSpread) {
            player.increaseWeaponSpread();
        }
        if (keyPressed.fireLessSpread) {
            player.decreaseWeaponSpread();
        }
        if (keyPressed.increaseBullets) {
            player.increaseBullets();
        }
        if (keyPressed.decreaseBullets) {
            player.decreaseBullets();
        }
        if (keyPressed.fire) {
            player.firing = true;
        } else {
            player.firing = false;
        }
        if (keyPressed.fire2) {
            bomb();
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
        if (keyPressed.buggerMode) {
            if (!buggerMode) {
                buggerMode = true;
                bossMode = false;
                boss = null;
                createBuggers();
            }
        }
        if (keyPressed.bossMode) {
            if (!bossMode) {
                bossMode = true;
                buggerMode = false;
                destroyBuggers();
                boss = new Boss();
            }
        }
        if (keyPressed.clearEnemies) {
            if (bossMode) {
                bossMode = false;
                boss = null;
            }
            if (buggerMode) {
                buggerMode = false;
                destroyBuggers();
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
        if ( player.bombing ) {
            return;
        }

        player.bombing = true;

        playFx(musicList.length + FX.bomb);

        // BOMB
        particleManager.createExplosion( 0, 0, 130, 15, 70, 3, 0 );
        particleManager.createExplosion( canvas.width, 0, 130, 15, 70, 3, 0 );
        particleManager.createExplosion( 0, background.height, 130, 15, 70, 3, 0 );
        particleManager.createExplosion( canvas.width, background.height, 130, 15, 70, 3, 0 );
        particleManager.createExplosion( canvas.width / 2, background.height / 2, 100, 10, 70, 3, 0, function () {
            setTimeout( function () { player.bombing = false; }, 1500 );
        } );

        destroyBuggers();
    }

    function update() {
        scrollBackground( [ {
            source: [background, background2, background3, background4, background4Mirror, background3Mirror, background2Mirror, backgroundMirror ],
            speed: 0.5,
            orientation: 'horizontal',
            moveTo: 'left'
        }, {
            source: [foreground, foreground2, foreground3, foreground4, foreground, foreground2, foreground3, foreground4],
            speed: 3,
            orientation: 'horizontal',
            moveTo: 'left'
        }, {
            source: [starfield, starfield2, starfield3, starfield4, starfield5, starfield6],
            speed: 7,
            orientation: 'horizontal',
            moveTo: 'left'
        } ] );

        renderImage( player, bufferctx, player.posX, player.posY, player.rotate );

        if (bossMode) {
            bufferctx.drawImage(boss, boss.posX, boss.posY);
        }

        // Check for player shoots
        player.checkForFire();

        shots.length > 0 && shots.forEach( function ( shot, index ) {
            shot.id = index;
            if (!bossMode || !checkCollisionsShot( shot ) ) {
                shot.posX += Math.cos( shot.direction ) * shot.speed;
                shot.posY += Math.sin( shot.direction ) * shot.speed;

                // Remove if offcanvas
                if ( shot.posX < 0 || shot.posY < 0 || shot.posX > canvas.width || shot.posY > canvas.height ) {
                    shot.del( parseInt( shot.id, 10 ) );
                }

                bufferctx.drawImage( shot, shot.posX, shot.posY);
            }
        } );

        buggerMode && buggers.length > 0 && buggers.forEach(function(bugger, index) {
            bugger.id = index;
            //colisiones
            if (!checkCollisionsBugger(bugger)) {
                bugger.update();
                if (bugger.posX < 0 || bugger.posX > canvas.width) {
                    bugger.del(parseInt(bugger.id, 10));
                }
                bufferctx.drawImage(bugger, bugger.posX, bugger.posY);
            }
        });
        if (buggerMode && player.bombing === false) {
            createBuggers();
        }
        playerAction();

        particleManager.draw();

        bufferctx.font = 'italic 25px arial';

        if (bossMode) {
            bufferctx.fillStyle = "#f00";
            bufferctx.fillText(boss.life, boss.posX - 23 + boss.width / 2, boss.posY - 20);
        }

        bufferctx.fillStyle = '#fff';
        bufferctx.fillText('Score: ' + score, 50, 50);

        printHelp();

    }

    function makeExplosion (x, y) {
        // Parametros del particleManager: posX, posY, size, area, life, speed, gravity
        particleManager.createExplosion(x, y, 25, 4, 70, 3, 0.1 );
    }

    function ParticleManager(n) {
        var t = [],
            i = n;
        this.draw = function () {
            for (var r = [], n = t.length - 1; n >= 0; n--) t[n].moves++, t[n].x += t[n].xunits, t[n].y += t[n].yunits + t[n].gravity * t[n].moves, t[n].moves < t[n].life && (r.push(t[n]), i.globalAlpha = 5 / t[n].moves, i.drawImage(fireParticle, Math.floor(t[n].x), Math.floor(t[n].y), t[n].width, t[n].height), i.globalAlpha = 1);
            t = r;
        }, this.createExplosion = function (n, i, r, u, f, e, o, fn) {
            var e, s, h;
            for (n = n - r * .5, i = i - r * .5, e = r * e * .01, s = 1; s < u; s++) {
                for (h = 0; h < 10 * s; h++) {
                    t.push(particle(n, i, r, r, s * e, o, f))
                }
            }
            fn && fn();
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
        };
    };

    function createBuggers() {
        var b = null;
        for (var i = 0, n = buggersCount - buggers.length; i < n; i++) {
            b = new Bugger();
            b.add();
        }
    }

    function destroyBuggers() {
        buggers.forEach(function(bugger, index) {
            delete bugger;
        });
        buggers.length = 0;
    }

    function printHelp() {
        bufferctx.font = 'italic 15px arial';

        bufferctx.fillText('[Arrows] -> Move', 10, canvas.height - 70);
        bufferctx.fillText('[1] -> Buggers Mode', 10, canvas.height - 50);
        bufferctx.fillText('[2] -> Boss Mode', 10, canvas.height - 30);
        bufferctx.fillText('[X] -> Shoot', 10, canvas.height - 10);

        bufferctx.fillText('[C] -> Bombs', 150, canvas.height -70);
        bufferctx.fillText('[Z] -> Focus', 150, canvas.height - 50);
        bufferctx.fillText('[A] -> Rotate left', 150, canvas.height - 30);
        bufferctx.fillText('[D] -> Rotate right', 150, canvas.height - 10);

        bufferctx.fillText('[W] -> Fire more spread', 280, canvas.height - 70);
        bufferctx.fillText('[I] -> Increase bullets', 280, canvas.height - 50);
        bufferctx.fillText('[O] -> Decrease bullets', 280, canvas.height - 30);
        bufferctx.fillText('[T] -> Change music', 280, canvas.height - 10);

        bufferctx.fillText('[M] -> Mute', 450, canvas.height - 70);
        bufferctx.fillText('[Av Pag] -> Speed up', 450, canvas.height - 50);
        bufferctx.fillText('[Re Pag] -> Speed down', 450, canvas.height - 30);
        bufferctx.fillText('[0] -> Clear enemies', 450, canvas.height - 10);
    }

    // Public Methods
    return {
        init: init
    };

} ) ();
