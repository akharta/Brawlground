# Brawlground — Documento de diseño

> Estado: ficha cerrada. Pendiente: contenido inicial (unidades, héroes, primer mapa).

## Concepto

Batalla entre dos castillos sobre un terreno horizontal. Cada bando despliega cartas
de su mazo para destruir el castillo rival. Mejoras tu ejército coleccionando cartas
y generas recursos aunque no juegues.

## Batalla

- **Campo**: tu castillo a la izquierda, el de la IA a la derecha. Un único carril con
  profundidad: las unidades avanzan escalonadas (no en fila india) y combaten con lo que
  encuentran.
- **Mazo**: antes de cada batalla eliges 8 cartas. En partida tienes 4 en la mano; al
  jugar una entra la siguiente.
- **Cartas**: guerreros cuerpo a cuerpo, tiradores, máquinas de asedio… cada una con su
  coste de energía.
- **Energía**: se recarga sola con el tiempo y además da un extra por cada enemigo abatido.
- **Castillo**: tiene defensas propias (p. ej. torres que disparan) y mejoras propias.
- **Héroe** (uno por batalla):
  - Espera sentado en un trono sobre tu castillo.
  - Cada héroe tiene un objetivo de bajas enemigas. Al cumplirlo se habilita el
    **botón del héroe**.
  - Al pulsarlo (o automáticamente en modo auto) salta al campo y empieza a luchar.
  - Tiene una **habilidad pasiva** (siempre activa en el campo) y una **habilidad
    activa** con recarga en segundos, que empieza a contar cuando salta al campo.
  - Si muere, no vuelve en esa batalla.
- **Modo híbrido**: al principio despliegas tú. Más adelante se desbloquea el **modo
  automático**, que despliega cartas y usa al héroe por ti.

## Progresión

- **Campaña** por mapas con dificultad creciente, enemigos variados y un jefe al final
  de cada mapa.
- **Coleccionable**: cartas repetidas + oro para subir de nivel unidades, héroes y
  habilidades.
- **Cofres / sobres**: desbloquean unidades, héroes, skins y habilidades.
- **Idle**: generas recursos mientras no juegas.
- *Pendiente*: cómo avanzar la campaña sin jugar (partiendo del modo automático).

## Plataforma y aspecto

- **Móvil**, jugable en horizontal y en vertical.
  - Horizontal: campo completo.
  - Vertical: campo comprimido (escalado al ancho, unidades algo más grandes) con la
    interfaz y las cartas abajo.
- **Tecnología**: Phaser (HTML5), instalable como app (PWA) y jugable sin conexión.
- **Arte**: Tiny Swords (Pixel Frog) + interfaz y sonidos de Kenney.
- **Sensación**: partículas, números de daño, destellos al golpear, temblor de pantalla,
  animaciones suaves en la interfaz, sonido y música.

## Siguientes pasos

1. Contenido inicial: 6–8 unidades, 2 héroes con sus habilidades, mejoras del castillo,
   primer mapa con sus enemigos y su jefe.
2. Prototipo jugable de una batalla.
