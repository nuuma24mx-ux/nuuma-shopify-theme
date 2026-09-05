# NUUMA: página de producto v2

## Base y arquitectura revisada

Base revisada: `develop`, commit `6aa7c86683959709fc80587e1204c0f2035a8e67`.
El metadato de `config/settings_schema.json` identifica **Refresh 15.1.0 de Shopify**.
La arquitectura es equivalente a Dawn: layouts Liquid, plantillas JSON de Online Store 2.0,
secciones con schema y bloques `@app`, snippets reutilizables y custom elements nativos.

- `layout/theme.liquid`: carga estilos, constantes, pub/sub y `global.js`; conserva `content_for_header`, `content_for_layout` y cart drawer condicionado por settings.
- `templates/`: plantillas JSON de producto, colección, carrito, contenido y clientes. Solo existe una plantilla de producto en esta base.
- `sections/main-product.liquid`: galería, bloques de información y formularios. Renderiza rating con los metafields nativos de reviews.
- `snippets/buy-buttons.liquid`: formulario Liquid de producto, input de variante, disponibilidad, errores, spinner, destinatario de tarjeta regalo, recogida y Dynamic Checkout.
- `assets/global.js`: selección de opciones, cantidades, foco, modales y componentes compartidos.
- `assets/product-info.js`: actualización de variantes mediante HTML de Shopify; sincroniza precio, inventario, inputs, cantidad, URL, medios y disponibilidad.
- `assets/product-form.js`: envía FormData al endpoint nativo del carrito; conserva loading, errores y actualización por secciones.
- `snippets/cart-drawer.liquid`, `sections/cart-drawer.liquid`, `assets/cart-drawer.js`, `assets/cart.js` y CSS de carrito: drawer, líneas, cantidades, totales, foco y actualización del carrito.
- `assets/base.css`: incluye personalización tipográfica global con numerosos `!important` previos. Se mantienen sus valores de reserva fuera de la sección v2.
- `config/` y `locales/`: configuración del editor y traducciones. El archivo `en.default.json` contiene actualmente el español de la tienda; se conserva esa convención y se añaden las etiquetas a todos los idiomas presentes.

Apps preservadas: Trust Badges Bear (bloque del producto), Shopify Inbox,
Judge.me, Planet Discounts/Upsells (smart cart y widgets) y Wizio Bundle.
No se elimina ningún bloque existente ni se modifica `config/settings_data.json`.

## Comportamiento

Orden del bloque de información: título, rating real cuando existe, precio,
beneficio y datos confirmados, variantes, cantidad, botones de compra,
mensaje de envío/soporte cuando existe, Trust Badges Bear, descripción larga,
proveedor y compartir. La galería nativa sigue antes de la información en móvil.

El diseño v2 se activa en la plantilla de producto mediante el setting
`enable_nuuma_product_v2`. Por defecto es falso para otras instancias de la sección.
Desactivar el setting revierte los estilos, pero no el orden ni los nuevos bloques;
para revertir toda la propuesta se debe revertir el cambio completo.

Se reducen espacios iniciales en móvil, se limita la altura de imágenes que ya
utilizan la opción nativa de ajuste al viewport, y se amplían precio, campos y
objetivos táctiles. Las variantes tipo botón tienen al menos 44px de alto y el CTA
48px. La galería mantiene zoom y selección de medios nativos. No se puede garantizar
que todo el bloque quepa en la primera pantalla: depende del dispositivo, cabecera,
título, cantidad de variantes, apps y contenido real.

Las seis declaraciones modificadas de `base.css` usan variables CSS con los mismos
valores de reserva que antes. Las variables se definen dentro de `.nuuma-product-v2`.
No se añade ningún `!important`; se conservan los ya existentes.

## Metafields de producto

Crear las definiciones en Shopify antes de cargar contenido. El código no crea
definiciones, no consulta el catálogo desde GitHub ni presupone que ya existen.
Usar exclusivamente información confirmada. Los campos vacíos no dejan filas ni
contenedores vacíos. Los textos se escapan como texto, sin ejecutar HTML.

| Namespace y key | Tipo | Uso |
| --- | --- | --- |
| `nuuma.primary_benefit` | `single_line_text_field` | Beneficio principal breve |
| `nuuma.coverage_m2` | `number_decimal` | Área en m², solo visible si es mayor que cero |
| `nuuma.app_scheduling` | `single_line_text_field` | Programación mediante app, solo cuando aplica |
| `nuuma.compatibility` | `single_line_text_field` | Compatibilidad confirmada, opcional |
| `nuuma.duration` | `single_line_text_field` | Duración con sus unidades y condiciones, opcional |
| `nuuma.features` | `list.single_line_text_field` | Características breves confirmadas, opcionales |
| `nuuma.purchase_reassurance` | `single_line_text_field` | Mensaje confirmado de envío, soporte o confianza |

Estos campos son **de producto**, no de variante. Completar únicamente datos válidos
para todas las variantes. Si cobertura, compatibilidad o duración cambian por variante,
dejar el campo de producto vacío hasta implementar y probar esa sincronización.
Evitar descripciones extensas en estos campos; mantener el detalle en la descripción
larga para no desplazar el CTA. No hay rating, cobertura o promesas de envío de ejemplo
en los archivos del theme.

Referencia: [metafields en Liquid](https://shopify.dev/docs/api/liquid/objects/metafield).

## Validaciones

- Theme Check mediante el motor oficial `@shopify/theme-check-node`, comparando
  la base sin cambios y la propuesta: **47 incidencias en ambos, 32 de severidad error,
  sin nuevas incidencias**. Se compara archivo, regla, mensaje y severidad.
- La CLI `@shopify/cli` 4.7.1 falló al arrancar con `uv_os_get_passwd / ENOMEM`;
  por eso se ejecutó directamente el motor oficial, sin autofix ni reglas desactivadas.
- Renderizados locales con LiquidJS: metafields ausentes, cobertura cero/negativa,
  cobertura decimal, datos parciales, escape de HTML y mensaje de confianza.
- Comprobación estructural de template/schema, claves de idiomas y conservación
  exacta de todos los bloques originales y archivos de lógica comercial.
- Fixture sintético en Chrome a 320, 390, 768 y 1440px: sin desbordamiento horizontal,
  variantes de al menos 44px, CTA de 48px, cantidad de 16px y precio de 20px.
  Es una prueba de CSS con datos de prueba locales; no es una vista previa de Shopify
  ni una validación de apps o compra real.
- `git diff --check` para los cambios.

En un entorno con la CLI operativa: `shopify theme check --path .`.
Referencia: [Shopify Theme Check](https://shopify.dev/docs/api/shopify-cli/theme/theme-check).

## Problemas previos y riesgos

La base tiene 29 referencias a **16 assets ausentes**, incluyendo estilos de medios,
recogida, descuentos, navegación y localización. También reporta un error de sintaxis
en `snippets/product-variant-options.liquid` (render de swatch-input) y un schema no
válido en `sections/email-signup-banner.liquid`. Estas incidencias ya estaban en
`develop` y requieren revisión antes de publicar. No se han corregido a ciegas dentro
de una mejora de presentación.

No cambia la lógica de checkout, descuentos, inventario, variantes, Add to Cart,
Dynamic Checkout, gift cards, recogida, errores o loading. El riesgo funcional nuevo
es principalmente visual y de integración: apps que insertan elementos en el bloque
de compra pueden reaccionar al nuevo orden, ancho o tipografía. Planet y Wizio pueden
interceptar el flujo de compra; su funcionamiento necesita pruebas en Shopify.

La propuesta no se ha desplegado en Shopify ni fusionado. El permiso de escritura
de la conexión a GitHub se habilitó al instalar ChatGPT Codex Connector en la cuenta propietaria.

## Pruebas manuales antes de publicar

1. Vista previa de Shopify sin publicar, en iOS Safari, Android Chrome y escritorio;
   revisar 320px, títulos largos, orientación horizontal, zoom de texto y navegación
   por teclado. Comprobar galería, zoom, vídeo, modelos 3D y cambio de imagen por variante.
2. Producto sin metafields ni reseñas: sin contenido inventado ni huecos. Producto con
   datos reales: unidades, acentos, campos parciales y textos largos correctos.
3. Variante única y múltiples opciones; botones, swatches y dropdown; variante agotada,
   combinación no disponible, preventa, enlace directo con `?variant=` y cambios rápidos.
   Verificar precio, imagen, ID enviado y estado del botón.
4. Cantidad mínima, máxima, incrementos, stock insuficiente, reglas B2B cuando apliquen;
   agregar varias unidades y confirmar variante y cantidad en el carrito.
5. Add to Cart con respuesta lenta y rechazo de Shopify: spinner, bloqueo de doble envío,
   error y recuperación. Drawer vacío y con productos, actualizar/eliminar líneas,
   total, contador, foco, Escape y regreso al botón que abrió el drawer.
6. Dynamic Checkout, tarjeta regalo y destinatario, recogida cuando aplique, carrito
   tipo notificación/página si se configura. Utilizar el modo de prueba de la tienda;
   no realizar cargos reales.
7. Trust Badges Bear, Judge.me, Inbox, Planet (smart cart y upsell) y Wizio: visualización,
   bundles, descuentos y que un clic no agregue el producto dos veces.
8. Editor: mover/seleccionar los bloques nuevos, desactivar el diseño y verificar otras
   plantillas, featured product y quick add sin regresiones de estilos.

## Revisión en GitHub

Rama: `feature/product-page-v2`, base: `develop`.
Revisar el PR y completar las pruebas manuales antes de fusionar. No hacer merge automático ni escribir en `main`.
