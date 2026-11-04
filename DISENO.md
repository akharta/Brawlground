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
- **Jaulas de prisioneros** (sustituyen a los cofres): liberas a un preso y se une a
  tu ejército; si ya lo tenías, da copias de su carta. Ver «Conseguir personajes».
- **Taberna del Multiverso**: mercenarios que se compran con oro. Ver «Conseguir personajes».
- **Idle**: generas recursos mientras no juegas.
- *Pendiente*: cómo avanzar la campaña sin jugar (partiendo del modo automático).

## Conseguir personajes

### Jaulas de prisioneros

- Objeto portátil (celda pequeña con asa y candado). Se ve la silueta del preso dentro.
- Cuatro rarezas: común (madera), rara (hierro), épica (acero con runas), legendaria (oro).
- Cada jaula se abre con una **llave de su misma rareza**.
- Se consiguen al ganar batallas, en la tienda y en el modo idle (se acumulan mientras
  no juegas).
- Probabilidad de rareza (propuesta): común 70%, rara 22%, épica 7%, legendaria 1%.
- Apertura: tocar el candado varias veces → la jaula tiembla y se agrieta → los barrotes
  saltan y sale el preso.

### Taberna del Multiverso

- Se renueva cada **4 horas** con mercenarios de rareza aleatoria.
- **2 puestos** al principio, ampliables con mejoras hasta **6**.
- Mejorar la taberna también sube la probabilidad de mercenarios mejores.
- Se compran con oro; el precio depende de la rareza. Un repetido da copias de su carta.

### Ascendidos

- Nunca salen en jaulas ni en la taberna.
- *Pendiente*: cómo se consiguen.

## Plataforma y aspecto

- **Móvil**, jugable en horizontal y en vertical.
  - Horizontal: campo completo.
  - Vertical: campo comprimido (escalado al ancho, unidades algo más grandes) con la
    interfaz y las cartas abajo.
- **Tecnología**: Phaser (HTML5), instalable como app (PWA) y jugable sin conexión.
- **Arte propio**, original y exclusivo de Brawlground. Estilo cartoon chibi: cabeza
  grande, sin brazos (manos flotantes), contorno grueso azul marino, colores planos.
  - **ChatGPT (director gráfico)** dibuja todo: personajes por piezas, escenarios por
    capas, castillos, kit de interfaz, bocetos de pantallas, jaulas, llaves y taberna.
  - **Claude** lo monta y le da vida: pantallas reales, animación por código, efectos.
  - Reglas completas en la Biblia de arte (documento aparte).
- **Sensación**: partículas, números de daño, destellos al golpear, temblor de pantalla,
  animaciones suaves en la interfaz, sonido y música.

## Siguientes pasos

1. Generar el Legionario como patrón de estilo.
2. Prototipo jugable de una batalla con el arte aprobado.
