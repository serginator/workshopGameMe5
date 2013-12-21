/**
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * @return {[type]} [description]
 */
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/*function */callback, /* DOMElement*/element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = [];
    this.loadCount = 0;

    this.loadBuffer = function(url, index) {
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        var loader = this;

        request.onload = function() {
            // Asynchronously decode the audio file data in request.response
            loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount === loader.urlList.length) {
                    loader.onload(loader.bufferList);
                }
            },
            function(error) {
                console.error('decodeAudioData error', error);
            });
        };
        request.onerror = function() {
            alert('BufferLoader: XHR error');
        };
        request.send();
    };

    this.load = function() {
        for (var i = 0; i < this.urlList.length; ++i) {
            this.loadBuffer(this.urlList[i], i);
        }
    };
}


/**
 * Method to remove an item from an array
 * @param  {[type]} array
 * @param  {[type]} from
 * @return {[type]}
 */
var arrayRemove = function(array, from) {
    var rest = array.slice((from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
};

var game = (function() {

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
        imagesList = [
            'images/fire.png',
            'images/background-1.jpg',
            'images/background-2.jpg',
            'images/background-3.jpg',
            'images/background-4.jpg',
            'images/background-4-mirror.jpg',
            'images/background-3-mirror.jpg',
            'images/background-2-mirror.jpg',
            'images/background-1-mirror.jpg',
            'images/foreground-1.png',
            'images/foreground-2.png',
            'images/foreground-3.png',
            'images/foreground-4.png',
            'images/starfield-2.png',
            'images/ship.png',
            'images/ship-focused.png',
            'images/shot.png',
            'images/boss.png',
            'images/bugger.png'
        ],
        images = [],
        IMG = {
            fire: 0,
            background1: 1,
            background2: 2,
            background3: 3,
            background4: 4,
            background4m: 5,
            background3m: 6,
            background2m: 7,
            background1m: 8,
            foreground1: 9,
            foreground2: 10,
            foreground3: 11,
            foreground4: 12,
            starfield: 13,
            ship: 14,
            shipFocused: 15,
            shot: 16,
            boss: 17,
            bugger: 18
        },
        audioCtx, audioBuffer, audioMusic, currentAudioMusic, gainNode,
        changingMusic = false,
        musicList = [
            'music/16-bits-TFIV-Stand-Up-Against-Myself.ogg',
            'music/32-bits-TFV-Steel-Of-Destiny.ogg',
            'music/128-bits-Ikaruga-Ideal.ogg'
        ],
        fxList = [
            'music/FX/bomb.ogg',
            'music/FX/shot.ogg',
            'music/FX/explosion.ogg'
        ],
        FX = {
            bomb: 0,
            shot: 1,
            explosion: 2
        },
        score = 0,
        buggerMode = false,
        bossMode = false,
        allowMusicChange = false,
        touch = false;

    function preloadImages() {
        var loaded = 0,
            total = imagesList.length;
        for (var i = 0; i < total; i++) {
            var img = new Image();
            img.src = imagesList[i];
            img.onload = function() {
                loaded++;
                if (loaded === total) {
                    preloadMusic();
                }
            };
            images.push(img);
        }
    }

    function preloadMusic() {
        var loaded = 0,
            fxAndMusic = musicList.concat(fxList),
            total = fxAndMusic.length;
        for (var i = 0; i < total; i++) {
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() {
                loaded++;
                if (loaded === total) {
                    init(true);
                }
            }, false);
            audio.src = fxAndMusic[i];
        }
    }

    /**
     * Main game loop
     * @return {[type]}
     */
    function loop() {
        update();
        draw();
    }

    /**
     * Extend an object
     * @param  {[type]} destination
     * @param  {[type]} source
     * @return {[type]}
     */
    function extend(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    }

    /**
     * Method to resize the canvas to a percentage of the full screen
     * @return {[type]}
     */
    function resizeCanvas() {
        canvas.width = window.innerWidth * 0.85; // 85%
        canvas.height = window.innerHeight * 0.85;
        buffer.width = canvas.width;
        buffer.height = canvas.height;
        loop();
    }

    /**
     * Init vars, load assets and start the main animation.
     * @param {Boolean} ready If true, launch the app, if false, preload images
     * @return {[type]}
     */
    function init(ready) {
        if (!ready) {
            canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');

            // Buffering
            buffer = document.createElement('canvas');
            bufferctx = buffer.getContext('2d');

            ctx.fillStyle = '#fff';
            ctx.font = 'italic 25px arial';
            ctx.textBaseline = 'bottom';
            ctx.fillText('Loading...', buffer.width - 200, buffer.height - 50);

            preloadImages();
        } else {
            // Adjusting buggers
            buggersCount = (canvas.height / 40) * 15;

            // Particle System
            fireParticle = images[IMG.fire];
            particleManager = new ParticleManager(bufferctx);

            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new window.AudioContext();

            // Audio stuff
            audioBuffer = new window.BufferLoader(audioCtx, musicList.concat(fxList), createAudioSources);
            audioBuffer.load();

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

            document.addEventListener('touchstart', function(e) {
                player.moveTo(e.touches[0]);
                touch = true;
                player.firing = true;
                e.preventDefault();
            });
            document.addEventListener('touchmove', function(e) {
                player.moveTo(e.touches[0]);
                e.preventDefault();
            });
            document.addEventListener('touchend', function(e) {
                player.moveTo(e.touches[0]);
                touch = false;
                player.firing = false;
                e.preventDefault();
            });

            // Resizing Event
            addListener(window, 'resize', resizeCanvas);

            // Gameloop
            var anim = function() {
                resizeCanvas();
                window.requestAnimFrame(anim);
            };
            anim();
        }
    }

    /**
     * Method to create the audio sources and connect the gain to them
     * @param  {[type]} list
     * @return {[type]}
     */
    function createAudioSources(list) {
        var i, n;
        audioMusic = [];
        gainNode = audioCtx.createGain();
        for (i = 0, n = musicList.length; i < n; i++) {
            setAudioSource(i);
        }
        for (i = musicList.length, n = i + fxList.length; i < n; i++) {
            setAudioSource(i);
            audioMusic[i].loop = false;
        }
        gainNode.connect(audioCtx.destination);
        audioMusic[0].start(0);
        allowMusicChange = true;
    }

    /**
     * Set an audio source
     * @param {[type]} index
     */
    function setAudioSource(index) {
        audioMusic[index] = audioCtx.createBufferSource();
        audioMusic[index].buffer = audioBuffer.bufferList[index];
        audioMusic[index].connect(gainNode);
        audioMusic[index].loop = true;
    }

    /**
     * Method to change between music files
     * @return {[type]}
     */
    function changeAudioMusic() {
        audioMusic[currentAudioMusic].stop(0);
        currentAudioMusic++;
        if (currentAudioMusic > musicList.length - 1) {
            currentAudioMusic -= musicList.length;
        }
        setAudioSource(currentAudioMusic);
        audioMusic[currentAudioMusic].start(0);
    }

    /**
     * Method to play a FX
     * @param  {[type]} index
     * @return {[type]}
     */
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

    /**
     * Method to toggle mute
     * @return {[type]}
     */
    function toggleMute() {
        if (gainNode.gain.value === 1) {
            gainNode.gain.value = 0;
        } else {
            gainNode.gain.value = 1;
        }
    }

    /**
     * Player object
     * @param {[type]} player
     */
    function Player(player) {
        player = images[IMG.ship];
        player.posX = player.width; // Dedault X position
        player.posY = (background.height / 2) - (player.height / 2); // Def Y pos
        player.centerX = player.posX + (player.width / 2);
        player.centerY = player.posY + (player.height / 2);
        player.rotate = 0;
        player.firing = false;
        player.bombing = false;
        player.cooldown = 0;

        /**
         * Weapon of the player
         * @type {Object}
         */
        player.weapon = {
           count: 1,
           chaos: 0,
           spreadBase: 9,
           spacing: 0,
           speed: 30,
           color: '#00ffff',
           shape: 0,
           firerate: 20
        };
        player.weapon.spread = Math.PI / player.weapon.spreadBase;

        player.moveTo = function(data) {
            var x = data.pageX - player.width / 2,
                y = data.pageY - player.height / 2;
            if (x > 0 && x < canvas.width && y > 0 && y < canvas.height) {
                player.posX = x;
                player.posY = y;
            }
        };

        /**
         * Method to sread bullets
         * @return {[type]}
         */
        player.increaseWeaponSpread = function() {
            if (player.weapon.spreadBase < 20) {
                player.weapon.spreadBase += 0.2;
                player.weapon.spread = Math.PI / player.weapon.spreadBase;
            }
        };

        /**
         * Method to decrease bullets' spread
         * @return {[type]}
         */
        player.decreaseWeaponSpread = function() {
            if (player.weapon.spreadBase > 2) {
                player.weapon.spreadBase -= 0.2;
                player.weapon.spread = Math.PI / player.weapon.spreadBase;
            }
        };

        /**
         * Increase power fire
         * @return {[type]}
         */
        player.increaseBullets = function() {
            if (player.weapon.count < 20) {
                player.weapon.count += 1;
            }
        };

        /**
         * Decrease power fire
         * @return {[type]}
         */
        player.decreaseBullets = function() {
            if (player.weapon.count >= 2) {
                player.weapon.count -= 1;
            }
        };

        /**
         * Check for fire
         * @return {[type]}
         */
        player.checkForFire = function() {
            player.cooldown -= 60; // FPS
            if (player.firing) {
                if (player.cooldown <= 0) {
                    player.fire();
                    player.cooldown = player.weapon.firerate;
                }
            }
        };

        /**
         * Method to calculate position of the shoots and add more of them.
         * It also handles the sound of the shoot
         * @return {[type]}
         */
        player.fire = function() {
            var spreadStart = 0,
                spacingStart = 0,
                spreadStep = 0,
                spacingStep = 0;
            if (player.weapon.count > 1) {
                spreadStart = -player.weapon.spread / 2;
                spacingStart = player.weapon.spacing / 2;
                spreadStep = player.weapon.spread / (player.weapon.count - 1);
                spacingStep = player.weapon.spacing / (player.weapon.count - 1);
            }

            // Holy grial of the rotation
            var rotation = player.rotate * to_radians,
                gunX = player.posX + Math.cos(rotation) * 34 - Math.sin(rotation) * 5,
                gunY = player.posY + Math.sin(rotation) * 34 + Math.cos(rotation) * 5,
                shot;

            for (var i = 0, n = this.weapon.count; i < n; i++) {
                var spacingOffsetX = Math.cos(rotation - Math.PI / 2) * (spacingStart - i * spacingStep),
                    spacingOffsetY = Math.sin(rotation - Math.PI / 2) * (spacingStart - i * spacingStep);

                shot = new Shot({
                    shot: this,
                    direction: rotation + spreadStart + i * spreadStep,
                    shotX: gunX + spacingOffsetX + Math.random() * player.weapon.chaos - player.weapon.chaos / 2,
                    shotY: gunY + spacingOffsetY + Math.random() * player.weapon.chaos - player.weapon.chaos / 2,
                    speed: player.weapon.speed
                });
                shot.add();
            }
            if (allowMusicChange) {
                playFx(musicList.length + FX.shot);
            }
        };

        /**
         * Decrease speed of the ship
         * @return {[type]}
         */
        player.focusOn = function() {
            player.speed = 3;
            player.src = 'images/ship-focused.png';
        };

        /**
         * Restore normal speed of the ship
         * @return {[type]}
         */
        player.focusOff = function() {
            player.speed = 7;
            player.src = 'images/ship.png';
        };

        return player;
    }

    /**
     * Bullet object
     * @param {[type]} args
     */
    function Shot(args) {
        args.shot = new Image();
        args.shot.src = 'images/shot.png'; //12x12
        args.shot.posX = args.shotX;
        args.shot.posY = args.shotY;
        args.shot.direction = args.direction || 0;
        args.shot.speed = args.speed || 256;
        args.shot.color = args.color || 'F00';

        args.shot.add = function() {
            shots.push(args.shot);
        };

        args.shot.del = function(id) {
            arrayRemove(shots, id);
        };

        return args.shot;
    }

    /**
     * Boss example
     * @param {[type]} boss
     * @param {[type]} _x
     * @param {[type]} _y
     */
    function Boss(boss, _x, _y) {
        boss = images[IMG.boss]; //128x128
        boss.posX = canvas.width - boss.width;
        boss.posY = canvas.height / 2 - boss.width / 2;
        boss.life = 700; //700 hits

        /**
         * Method to destroy the boss and generate an explosion
         * @return {[type]}
         */
        boss.kill = function() {
            particleManager.createExplosion(boss.posX, boss.posY, 130, 15, 70, 3, 0);
            score += 1000;
            bossMode = false;
        };
        return boss;
    }

    /**
     * Enemies object
     * @param {[type]} bugger
     */
    function Bugger(bugger) {
        bugger = new Image();
        bugger.src = 'images/bugger.png';
        bugger.initPos = (Math.random() * (background.height - 120)) + 60;
        bugger.posX = canvas.width + (Math.random() * (canvas.width / 2)) + 1;
        bugger.posY = bugger.initPos;
        bugger.speed = 5;

        /**
         * Method to update the position of the bugger
         * @return {[type]}
         */
        bugger.update = function() {
            bugger.posX -= bugger.speed;
            bugger.posY -= 3 * Math.sin(bugger.initPos * Math.PI / 64);
            bugger.initPos++;

            if (bugger.posY < 0) { bugger.posY = 0; }
            if (bugger.posY > background.height - 100) { bugger.posY = background.height - 100; }
        };
        bugger.add = function() {
            buggers.push(bugger);
        };
        bugger.del = function(id) {
            arrayRemove(buggers, id);
        };
        return bugger;
    }

    /**
     * Method to check collisions between two objects and launch a callback
     * if the collision is done
     * @param  {[type]}   a
     * @param  {[type]}   b
     * @param  {Function} callback
     * @return {[type]}
     */
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
                if (allowMusicChange) {
                    playFx(musicList.length + FX.explosion);
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Check bullet colisions
     * @param  {[type]} shot
     * @return {[type]}
     */
    function checkCollisionsShot(shot) {
        return checkCollision(shot, boss, function() {
            if (boss.life > 1) {
                boss.life--;
            } else {
                boss.kill();
            }
            shot.del(parseInt(shot.id, 10));
            score += 10;
        });
    }

    /**
     * Check enemies collisions
     * @param  {[type]} bugger
     * @return {[type]}
     */
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
    var scrollBackground = function(layersGroup) {
        if (! Array.isArray(layersGroup)) {
            layersGroup = [layersGroup];
        }

        layersGroup.forEach(function(layers) {
            var settings = {
                source: [],
                orientation: 'horizontal',
                moveTo: 'right'
            },
            index, axis, magnitude, displace, calculateNewMove, newPosition, repeatFactor;

            if (layers.mirrorAtEnd) {
                var mirror = background4;

                layers.source.push(mirror);
            }

            index = layers.source.length;
            extend(settings, layers);

            settings.speed = layers.speed ? bgSpeed * layers.speed : bgSpeed;

            while (index--) {
                axis = (settings.orientation === 'horizontal') ? 'X' : 'Y';
                magnitude = (settings.orientation === 'horizontal') ? 'width' : 'height';
                displace = (settings.moveTo === 'down' || settings.moveTo === 'right') ? 'negative' : 'positive';
                repeatFactor = canvas.width / settings.source[index][magnitude];

                if (displace === 'positive') {
                    settings.source[index]['pos' + axis] -= settings.speed;
                } else {
                    settings.source[index]['pos' + axis] += settings.speed;
                }

                calculateNewMove = (displace === 'positive') ?
                    settings.source[index]['pos' + axis] + settings.source[index][magnitude] > 0 :
                    settings.source[index]['pos' + axis] < settings.source[index][magnitude];

                if (calculateNewMove) {
                    newPosition = settings.source[index]['pos' + axis];
                    bufferctx.drawImage(settings.source[index], (axis === 'X') ? newPosition : 0, (axis === 'Y') ? newPosition : 0);
                } else {
                    newPosition = settings.source[index][magnitude] * (layers.source.length - (layers.source.length % 4 ? 1 : 2));
                    settings.source[index]['pos' + axis] = (displace === 'positive') ? newPosition : Math.abs(newPosition) * -1;
                }
            }
        });
    };

    /**
     * Method to render and rotate an image
     * @param  {[type]} image
     * @param  {[type]} ctxTmp
     * @param  {[type]} x
     * @param  {[type]} y
     * @param  {[type]} angle
     * @return {[type]}
     */
    function renderImage(image, ctxTmp, x, y, angle) {
        ctxTmp.save();
        ctxTmp.translate(x, y);
        ctxTmp.rotate(angle * to_radians);
        ctxTmp.drawImage(image, - (image.width / 2), - (image.height / 2));
        ctxTmp.restore();
    }

    /**
     * Rotate player to the left
     * @return {[type]}
     */
    function rotateLeft() {
        player.rotate -= 5;
        if (player.rotate <= -360) {
            player.rotate = 0;
        }
    }

    /**
     * Rotate player to the right
     * @return {[type]}
     */
    function rotateRight() {
        player.rotate += 5;
        if (player.rotate >= 360) {
            player.rotate = 0;
        }
    }

    /**
     * Launch several actions depending on the key pressed
     * @return {[type]}
     */
    function playerAction() {
        if (keyPressed.focus) {
            player.focusOn();
        } else {
            player.focusOff();
        }

        if (keyPressed.spaceBar) {
            return false;
        }

        if (keyPressed.up && player.posY > (player.height / 2)) {
            player.posY -= player.speed;
        }
        if (keyPressed.down && player.posY < (canvas.height - player.height / 2) &&
                player.posY < background.height) {
            player.posY += player.speed;
        }
        if (keyPressed.left && player.posX > (player.width / 2)) {
            player.posX -= player.speed;
        }
        if (keyPressed.right && player.posX < (canvas.width - player.width / 2)) {
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
            touch = false;
        } else if (keyPressed.fire === false && !touch) {
            player.firing = false;
        }
        if (keyPressed.fire2) {
            bomb();
        }
        if (keyPressed.speedUp && bgSpeed < 10) {
            bgSpeed += 1;
        }
        if (keyPressed.speedDown && bgSpeed >= 2) {
            bgSpeed -= 1;
        }
        if (keyPressed.toggleMusic && allowMusicChange) {
            if (!changingMusic) {
                changingMusic = true;
                changeAudioMusic();
            }
        }
        if (keyPressed.mute && allowMusicChange) {
            if (!changingMusic) {
                changingMusic = true;
                toggleMute();
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
     * @param {[type]} element
     * @param {[type]} type
     * @param {[type]} expression
     * @param {[type]} bubbling
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

    /**
     * Handle keyDown
     * @param  {[type]} e
     * @return {[type]}
     */
    function keyDown(e) {
        var key = (window.event ? e.keyCode : e.which);
        for (var inkey in keyMap) {
            if (key === keyMap[inkey]) {
                e.preventDefault();
                keyPressed[inkey] = true;
            }
        }
    }

    /**
     * Handle keyUp
     * @param  {[type]} e
     * @return {[type]}
     */
    function keyUp(e) {
        var key = (window.event ? e.keyCode : e.which);
        if (key === 84 || key === 77) {
            changingMusic = false;
        }
        for (var inkey in keyMap) {
            if (key === keyMap[inkey]) {
                e.preventDefault();
                keyPressed[inkey] = false;
            }
        }
    }

    /**
     * Draw the buffer into the context
     * @return {[type]}
     */
    function draw() {
        ctx.drawImage(buffer, 0, 0);
    }

    /**
     * Create the bomb effect
     * @return {[type]}
     */
    function bomb() {
        if (player.bombing) {
            return;
        }

        player.bombing = true;

        if (allowMusicChange) {
            playFx(musicList.length + FX.bomb);
        }

        // BOMB
        particleManager.createExplosion(0, 0, 130, 15, 70, 3, 0);
        particleManager.createExplosion(canvas.width, 0, 130, 15, 70, 3, 0);
        particleManager.createExplosion(0, background.height, 130, 15, 70, 3, 0);
        particleManager.createExplosion(canvas.width, background.height, 130, 15, 70, 3, 0);
        particleManager.createExplosion(canvas.width / 2, background.height / 2, 100, 10, 70, 3, 0, function() {
            setTimeout(function() { player.bombing = false; }, 1500);
        });

        destroyBuggers();
    }

    /**
     * Update the main game scene
     * @return {[type]}
     */
    function update() {
        scrollBackground([{
            source: [background, background2, background3, background4, background4Mirror, background3Mirror, background2Mirror, backgroundMirror],
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
        }]);

        renderImage(player, bufferctx, player.posX, player.posY, player.rotate);

        if (bossMode) {
            bufferctx.drawImage(boss, boss.posX, boss.posY);
        }

        // Check for player shoots
        player.checkForFire();

        // Checks collisions of bullets, updates positions and draws the images
        if (shots.length > 0) {
            shots.forEach(function(shot, index) {
                shot.id = index;
                if (!bossMode || !checkCollisionsShot(shot)) {
                    shot.posX += Math.cos(shot.direction) * shot.speed;
                    shot.posY += Math.sin(shot.direction) * shot.speed;

                    // Remove if offcanvas
                    if (shot.posX < 0 || shot.posY < 0 || shot.posX > canvas.width || shot.posY > canvas.height) {
                        shot.del(parseInt(shot.id, 10));
                    }

                    bufferctx.drawImage(shot, shot.posX, shot.posY);
                }
            });
        }

        // Checks collisions of buggers, updates positions and draws the images
        if (buggerMode && buggers.length > 0) {
            buggers.forEach(function(bugger, index) {
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
        }

        // Create more buggers when they are destroyed
        if (buggerMode && player.bombing === false) {
            createBuggers();
        }
        playerAction();

        particleManager.draw();

        bufferctx.font = 'italic 25px arial';

        if (bossMode) {
            bufferctx.fillStyle = '#f00';
            bufferctx.fillText(boss.life, boss.posX - 23 + boss.width / 2, boss.posY - 20);
        }

        bufferctx.fillStyle = '#fff';
        bufferctx.fillText('Score: ' + score, 50, 50);

        if (!allowMusicChange) {
            bufferctx.fillText('Music still loading...', 50, 100);
        }

        printHelp();

    }

    /**
     * Makes an explosion
     * @param  {[type]} x
     * @param  {[type]} y
     * @return {[type]}
     */
    function makeExplosion(x, y) {
        // Parametros del particleManager: posX, posY, size, area, life, speed, gravity
        particleManager.createExplosion(x, y, 25, 4, 70, 3, 0.1);
    }

    /**
     * Manages the particles for the explosions
     * @param {[type]} n
     */
    function ParticleManager(n) {
        var t = [],
            i = n;
        this.draw = function() {
            for (var r = [], n = t.length - 1; n >= 0; n--) {
                t[n].moves++;
                t[n].x += t[n].xunits;
                t[n].y += t[n].yunits + t[n].gravity * t[n].moves;
                if (t[n].moves < t[n].life) {
                    r.push(t[n]);
                    i.globalAlpha = 5 / t[n].moves;
                    i.drawImage(fireParticle, Math.floor(t[n].x), Math.floor(t[n].y), t[n].width, t[n].height);
                    i.globalAlpha = 1;
                }
            }
            t = r;
        };
        this.createExplosion = function(n, i, r, u, f, e, o, fn) {
            var s, h;
            for (n = n - r * 0.5, i = i - r * 0.5, e = r * e * 0.01, s = 1; s < u; s++) {
                for (h = 0; h < 10 * s; h++) {
                    t.push(particle(n, i, r, r, s * e, o, f));
                }
            }
            if (fn) {
                fn();
            }
        };
    }

    /**
     * Particle object
     * @param  {[type]} n
     * @param  {[type]} t
     * @param  {[type]} i
     * @param  {[type]} r
     * @param  {[type]} u
     * @param  {[type]} f
     * @param  {[type]} e
     * @return {[type]}
     */
    function particle(n, t, i, r, u, f, e) {
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
    }

    /**
     * Method to create buggers
     * @return {[type]}
     */
    function createBuggers() {
        var b = null;
        for (var i = 0, n = buggersCount - buggers.length; i < n; i++) {
            b = new Bugger();
            b.add();
        }
    }

    /**
     * Method to destroy buggers
     * @return {[type]}
     */
    function destroyBuggers() {
        buggers.forEach(function(bugger, index) {
            bugger = null;
        });
        buggers.length = 0;
    }

    /**
     * Prints some help on screen
     * @return {[type]}
     */
    function printHelp() {
        bufferctx.font = 'italic 15px arial';

        bufferctx.fillText('[Arrows] -> Move', 10, canvas.height - 70);
        bufferctx.fillText('[1] -> Buggers Mode', 10, canvas.height - 50);
        bufferctx.fillText('[2] -> Boss Mode', 10, canvas.height - 30);
        bufferctx.fillText('[X] -> Shoot', 10, canvas.height - 10);

        bufferctx.fillText('[C] -> Bombs', 150, canvas.height - 70);
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

})();
