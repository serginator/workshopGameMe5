navecitas
=========

Repo privado para el juego del taller de GameMe5

### Resources
* [gamepad](http://html5gamepad.com/)
* [audio](http://forestmist.org/share/web-audio-api-demo/)
* [keypress](http://dmauro.github.io/Keypress/)
* [screen-size-management](http://html5hub.com/screen-size-management-in-mobile-html5-games/)
* [sprite-based-games-with-canvas](http://jlongster.com/Making-Sprite-based-Games-with-Canvas)
* [multiplayer](http://flippinawesome.org/2013/09/30/building-multiplayer-games-with-node-js-and-socket-io/)
* [timelapse](http://greweb.me/2013/09/timelapse/)
* [FX](http://ionden.com/a/plugins/ion.sound/en.html)


### Sprite (C)
- Sprite de la nave: 4 sprites; nave estática, nave arriba, nave abajo, y nave con 'focus'.

### Keypress and Touch (S, C)

### GamePad (S)

### Musica (C)
   - 8 Bits MP3 & WAV
   - 16 Bits
   - 128 Bits

   - Biblioteca (S)

### Redimensión del canvas
- Redimesionar viewport.
- Modificar todos los puntos (px) para pasarlos a porcentajes (%).

### Enemigos
- Sprites de enemigos: 3 enemigos y un jefe, ligeramente más grande pero con patrones frenéticos.
- Patrones de movimiento
- Patrones balísticos (tres patrones: disparo direccional, disparo hacia donde está el player, disparo predictivo y patrones geómetrico).
- Actualizar mapa colisiones.

- Enemigos: array con parámetros: tiempo de entrada, coordenada de entrada, de salida, puntos intermedios y tiempo que tarda en recorrer el camino.

- Puntuación: sistema simple.


### Gameplay
- Velocidad de la nave de usuario.(S)
- Bomba: fogonazo con FX que borre los proyectiles enemigos. (C)
- Mapa de colisiones: limitar el hitbox del protagonista al sprite del 'focus'. (S)