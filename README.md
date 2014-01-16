# Workshop GameMe 5

Demo para el taller de GameMe5 2013
13-12-13
por [@EtnasSoft](http://twitter.com/etnassoft) y [@serginator](http://twitter.com/serginator)

## Ver la [demo online](http://serginator.github.io/workshopGameMe5/)

## Enhanced version
* Sonidos cambiados a OGG por compatibilidad
* Preloading de recursos en vez de timeouts (algo simple pero eficaz)
* Compatible con Chrome (online) y Firefox. No se ha probado en Safari.
* Touch events
* [TODO] Gamepad

## Resources
* Charla de [@EtnasSoft](http://twitter.com/etnassoft) y [@serginator](http://twitter.com/serginator) en Camon
   * [Video](http://vimeo.com/39259983)
   * [Slides](http://www.serginator.com/juegos-en-js)
* [gamepad](http://html5gamepad.com/)
* [audio](http://forestmist.org/share/web-audio-api-demo/)
* [keypress](http://dmauro.github.io/Keypress/)
* [screen-size-management](http://html5hub.com/screen-size-management-in-mobile-html5-games/)
* [sprite-based-games-with-canvas](http://jlongster.com/Making-Sprite-based-Games-with-Canvas)
* [multiplayer](http://flippinawesome.org/2013/09/30/building-multiplayer-games-with-node-js-and-socket-io/)
* [timelapse](http://greweb.me/2013/09/timelapse/)
* [FX](http://ionden.com/a/plugins/ion.sound/en.html)
* [Listado de Frameworks](https://gist.github.com/bebraw/768272)
* [Sprite Database](http://sdb.drshnaps.com/)
* [Megalista de recursos](http://www.mangatutorials.com/forum/showthread.php?742-The-Ultimate-Indie-Game-Developer-Resource-List)

## Para lanzar la demo
Conviene ejecutarla en un servidor web por la carga de recursos por XHR. En Chrome en local da fallos visuales, online se ve correctamente (habrá que investigar por qué)
```bash
npm install -g grunt-cli
npm install
grunt
```

## Contenido de la demo
* Sprites
* Keypress
* Musica y FX en MP3
   - 8 Bits
   - 16 Bits
   - 128 Bits
   - Biblioteca
* Redimesión viewport.
* Puntos como porcentajes
* Enemigos
   * Horda y boss
   * Patrones de movimiento
   * Colisiones.
* Enemigos: array de enemigos, patrón de movimiento sinusoidal, colisiones
* Puntuación: sistema simple.
* Velocidad de la nave de usuario.
* Explosiones, sistema de partículas
* Bomba: fogonazo con FX que borre los enemigos.
* Mapa de colisiones: limitar el hitbox del protagonista al sprite del 'focus'.

## Para hacer deploy en gh-pages
```
# Chuletilla para que no se me olvide
# desde la raíz del proyecto
git clone git@github.com:serginator/workshopGameMe5.git dist
cd dist
git checkout --orphan gh-pages
git rm -rf .
grunt deploy # hará linteo, la distribución y luego lanzará el paquete grunt-github-pages
```

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/serginator/workshopgameme5/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
