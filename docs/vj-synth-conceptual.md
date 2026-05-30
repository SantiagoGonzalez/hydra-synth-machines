# Sintetizador visual (VJ synth): visión conceptual

Documento de contexto para diseño de interfaz y exploración en NotebookLM. Describe **qué es** un sintetizador de video por live-coding y **cómo piensa el usuario** al componer, sin entrar en la API función por función.

**Proyecto de referencia:** aplicación de aprendizaje *hydra-synth* (documentación interactiva + playground + retos creativos), basada en [Hydra](https://hydra.ojack.xyz/) de Olivia Jack.

**Detalle técnico por función:** [`docs/hydra-skills-index/`](hydra-skills-index/index.md) (índice de skills) y [`composition-guide.md`](hydra-skills-index/composition-guide.md) (modelo de composición).

---

## 1. Qué es un VJ synth en este contexto

Un **sintetizador visual** genera imágenes en tiempo real mediante reglas y parámetros que el usuario ajusta mientras la imagen se reproduce — igual que un sintetizador de audio produce sonido en vivo, no solo reproduce un archivo grabado.

En Hydra (y en este proyecto), esa “regla viva” es **código en cadena**: el usuario encadena operaciones que parten de una textura base y terminan en la pantalla. No hay timeline de clips como en un editor de video clásico; hay un **patch** (parche) que se reevalúa cada frame.

| Concepto audio | Equivalente visual |
|----------------|------------------|
| Oscilador | Generador de patrón (`osc`, ruido, formas, gradiente) |
| Filtro / efecto | Transformación de geometría o color |
| LFO / modulación | Otra textura que “empuja” o deforma la base |
| Mezclador | Fusión de capas (sumar, enmascarar, mezclar) |
| Salida / monitor | Pantalla o buffer intermedio |

El público objetivo de la interfaz de aprendizaje: personas que **componen imágenes** explorando, no necesariamente desarrolladores que memorizan una API completa.

---

## 2. Idea central: el patch como cableado modular

El modelo mental es **modular**: cada paso es un módulo; el orden de los cables importa.

```
[Fuentes] → [Geometría] → [Color] → [Fusión / salida]
              ↑
         [Modulación] (puede enlazarse en varios puntos)
```

- **Fuentes** crean materia prima visual (ondas, ruido, celdas, formas, color plano, cámara).
- **Geometría** mueve o repite el espacio (rotar, escalar, espejar en radial, pixelar, desplazar).
- **Color** altera la percepción cromática (matiz, contraste, máscaras por brillo, posterización).
- **Modulación** usa una segunda imagen para **deformar** o **pintar** la primera (el efecto más “sintetizador” del sistema).
- **Fusión** combina dos resultados (superponer con transparencia, mezclar, restar, enmascarar).

No es una pila de filtros intercambiables: cambiar el orden cambia la imagen de forma cualitativa (como reordenar módulos en un rack analógico).

---

## 3. Cómo experimenta el usuario (flujo de composición)

### 3.1 Exploración en vivo

1. Parte de algo simple que ya “se ve” (p. ej. bandas de un oscilador).
2. Añade un paso y observa el cambio inmediato en el canvas.
3. Ajusta un número (frecuencia, cantidad, intensidad) y percibe la relación causa–efecto.
4. Duplica la idea en otra “rama” (otro buffer) y la mezcla con la primera.

La interfaz debe reforzar **feedback visual instantáneo** y **historial reversible** (deshacer pasos o resetear el patch), porque el aprendizaje es trial-and-error, no lectura lineal de manual.

### 3.2 De lo simple a lo complejo

| Nivel | Intención del usuario | Qué necesita la UI |
|-------|----------------------|-------------------|
| Principiante | “Que se mueva y tenga color” | Pocos controles, presets, un generador + un efecto visible |
| Intermedio | “Patrones y simetría” | Geometría (espejo radial, repetición), paleta |
| Avanzado | “Texturas que evolucionan solas” | Buffers, retroalimentación, modulación entre capas |
| Performer | “Sincronía con música / tiempo” | Tiempo global, audio, secuencias de parámetros |

### 3.3 Errores y límites conceptuales (sin jerga técnica)

- Algunas fuentes producen rangos de color distintos; mezclar sin “normalizar” puede dar negros o magenta inesperados.
- Escribir en una memoria intermedia **recorta** valores extremos; lo que se ve después de guardar no siempre coincide con la cadena en bruto.
- Los bucles de **retroalimentación** (la imagen de ayer alimenta la de hoy) explotan en brillo si no hay “decaimiento” (mezcla parcial con el frame anterior).

La UI puede **avisar** o **atenuar** estos casos con presets seguros, no solo mostrar errores de código.

---

## 4. Capas, buffers y escena

Hydra piensa en **varias superficies de dibujo** (típicamente cuatro: `o0`–`o3`) además de la salida principal.

```
Buffer o0  ──►  textura A
Buffer o1  ──►  textura B  ──►  leer A y mezclar  ──►  pantalla
```

Conceptualmente para diseño de interfaz:

- Cada buffer es una **capa de trabajo** o un **bus auxiliar** (como un send en una mesa de mezclas).
- El usuario debe entender **qué capa está editando** y **qué capa consume otra** (dependencias).
- `render()` en modo multi-buffer es una vista de **monitor de escena** (varias salidas a la vez para depurar).

**Implicación UI:** panel de capas con nombres claros, miniaturas en vivo, indicador de “esta cadena escribe aquí” vs “esta cadena lee de allá”.

---

## 5. Modulación: el corazón expresivo

La modulación es el concepto más distintivo y el más difícil de explicar sin verlo.

Dos lecturas equivalentes (útiles para copy y tooltips):

1. **Distorsión:** la textura moduladora empuja cada píxel de la base según su claridad y color.
2. **Pintura:** la forma del modulador (p. ej. nubes de ruido) se rellena con los colores de la base (p. ej. bandas de un oscilador).

Para diseño de interfaz:

- Separar mentalmente **“qué deformo”** (base) y **“con qué mapa deformo”** (modulador).
- El control **intensidad** es el primer mando que debe ser grande y gradual (valores pequeños = sutil; valores grandes = caos).
- Opcional: vista dividida **base | modulador | resultado** (como en tutoriales del Hydra Book).

Variantes conceptuales (sin nombrar API): desplazamiento, escala del espacio, rotación del espacio, pixelación variable, desplazamiento “bidireccional” — son **familias** de modulación, no un solo knob.

---

## 6. Fusión: cómo se combinan mundos

| Intención | Metáfora UI |
|-----------|-------------|
| Superponer con transparencia | Capas de Photoshop |
| Mezclar con el anterior (feedback) | “Persistencia” o “trazo” |
| Restar / diferencia | Detección de bordes, vibración |
| Enmascarar por forma | Recorte suave (la forma define qué se ve) |
| Multiplicar colores | Tinte o oscurecimiento |

La interfaz no debe mostrar diez botones iguales “blend”: agrupar por **intención** (superponer, fundir en el tiempo, recortar, teñir).

---

## 7. Tiempo, movimiento y performance

El patch es **siempre en movimiento** salvo que el usuario congele parámetros.

- **Tiempo global** (`time`): motor de animación sinusoidal, pulsos, deriva lenta.
- **Velocidad / tempo**: acelerar o sincronizar todo el sketch con BPM.
- **Entradas externas**: ratón, audio (FFT), cámara — convierten el synth en instrumento reactivo.

Para diseño de UI de un **visualizador paso a paso** (trabajo futuro en este repo):

- Cada paso puede tener parámetros **estáticos** o **ligados al tiempo**; la UI debe distinguirlos (número fijo vs “oscila con el tiempo”).
- Controles de **play/pause** del tiempo global vs pausa solo del editor de código.
- Modo performance: sliders grandes, pocos parámetros mapeados, sin exponer la cadena completa.

---

## 8. Retroalimentación (feedback)

Patrón recurrente en VJ: **la salida de hace un frame es entrada del siguiente**.

```
Salida anterior → transformación suave → nueva capa encima → guardar de nuevo
```

Metáforas para el usuario:

- **Cámara con rastro** (scroll, rotación leve, zoom < 1).
- **Eco visual** (mezclar 90 % lo viejo + 10 % lo nuevo).
- **Auto-deformación** (la propia imagen modula la siguiente versión de sí misma).

Riesgo UX: sin decaimiento, la pantalla se blanquea o satura en segundos. Controles de **“memoria del frame”** o presets de feedback seguro son prioritarios en interfaz didáctica.

---

## 9. Live-coding vs controles visuales

Este proyecto combina dos modos que la interfaz debe integrar sin fricción:

| Modo | Rol |
|------|-----|
| **Editor de código** | Expresión completa, copy-paste de ejemplos, retos que verifican funciones |
| **Controles visuales** (futuro / parcial hoy) | Descubrimiento guiado, “añadir paso” sin escribir sintaxis |

Principio de diseño: **misma cadena conceptual**, dos representaciones:

- El usuario que aprende con botones debe ver **equivalente en código** (transparencia pedagógica).
- El usuario que escribe código debe poder **insertar un bloque** desde la referencia (como “play in playground” hoy).

Evitar dos apps separadas (editor vs synth); un solo canvas, un solo estado de patch.

---

## 10. Mapa de pantallas sugerido (contexto hydra-synth)

Estado actual aproximado de la app y oportunidades de diseño:

```
┌─────────────────────────────────────────────────────────┐
│  Cabecera: marca, enlace editor oficial, repo           │
├─────────────────────────────────────────────────────────┤
│  Pestañas:  [ Guía y API ]  [ Retos creativos ]         │
├──────────────────────────────┬──────────────────────────┤
│  Contenido didáctico         │  Playground (canvas +     │
│  - Conceptos                 │  editor, siempre visible) │
│  - Referencia por categoría  │                           │
│  - Ejemplos ejecutables      │                           │
└──────────────────────────────┴──────────────────────────┘
```

**Guía y API:** narrativa + referencia; el usuario lee y lanza snippets al playground.

**Retos:** objetivo claro, código inicial, verificación por presencia de funciones — gamificación sin juzgar estética.

**Playground:** núcleo performativo; debe permanecer visible al explorar la guía (aprendizaje lado a lado).

**Evolución planeada (documentada, no implementada):** sintetizador visual que aplica **cada transformación como un paso** en la cadena (wizard / rack), usando el índice de skills como catálogo de bloques.

---

## 11. Principios de diseño de interfaz (resumen para NotebookLM)

1. **Modular y ordenado** — Mostrar el patch como secuencia de pasos, no solo como texto plano.
2. **Causa–efecto inmediato** — Cualquier cambio de parámetro actualiza el canvas sin recarga de página.
3. **Capas explícitas** — Cuatro buffers máximo; nomenclatura humana (Capa A, Fondo, Modulador…).
4. **Modulación como par base** — Base + modulador + intensidad; vista previa opcional del modulador.
5. **Fusión por intención** — Agrupar operadores de mezcla por metáfora, no por nombre interno.
6. **Feedback con guardarraíles** — Presets de “eco seguro” y slider de decaimiento.
7. **Progresión pedagógica** — Fuente → geometría → color → fusión → modulación avanzada (alineado con retos del proyecto).
8. **Doble representación** — Bloques visuales ↔ código, siempre sincronizados cuando sea posible.
9. **Performance-first** — Controles grandes, pocos parámetros en modo vivo; detalle técnico bajo “avanzado”.
10. **No inventar semántica** — Los nombres de bloques deben alinearse con Hydra oficial para que tutoriales externos sigan valiendo.

---

## 12. Glosario mínimo (lenguaje de producto)

| Término | Significado para UI/copy |
|---------|-------------------------|
| **Patch / parche** | La composición completa que genera la imagen actual |
| **Cadena** | Secuencia de pasos enlazados |
| **Fuente** | Generador inicial de imagen |
| **Buffer / capa** | Superficie intermedia reutilizable |
| **Modulador** | Segunda imagen que controla deformación o mapeo |
| **Fusión** | Combinar dos imágenes en una |
| **Feedback** | Reinyectar la salida anterior en la entrada |
| **Live-coding** | Editar reglas mientras el video corre |
| **Sketch** | Una pieza visual guardada o en ejecución |

---

## 13. Relación con otros documentos del repo

| Documento | Uso |
|-----------|-----|
| Este archivo | Contexto conceptual para diseño de producto y NotebookLM |
| `hydra-skills-index/` | Referencia por función para agentes y documentación densa |
| `composition-guide.md` | Orden de operaciones y patrones de composición |
| `.cursorrules` | Reglas para que agentes consulten el índice al trabajar Hydra |

---

## 14. Preguntas abiertas de diseño (para sesiones en NotebookLM)

- ¿El usuario principiante empieza en **bloques** o en **plantillas de patch** completas?
- ¿Cómo se visualiza el **orden** de pasos (lista vertical, grafo, rack horizontal)?
- ¿Los buffers se muestran como **capas** (PS) o como **nodos** (patch bay)?
- ¿La modulación tiene un **modo asistente** (elegir base → elegir mapa → intensidad)?
- ¿Los retos migran a verificación visual o siguen con comprobación por texto?
- ¿Modo performance ocupa pantalla completa sin panel de código?

Estas preguntas no tienen respuesta única en la documentación oficial de Hydra; son decisiones de producto para *hydra-synth*.
