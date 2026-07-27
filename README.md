# Gaddi — vista previa

Sitio estático de una sola página. Sin build, sin dependencias, sin backend: HTML, CSS y un archivo de JavaScript.

**Esto es una vista previa para revisar, no la versión final.** Ver "Antes de publicar de verdad" al final.

---

## Publicarlo en GitHub Pages

El contenido de esta carpeta va en la **raíz** del repositorio.

### Con la línea de comandos

```bash
cd deploy
git init -b main          # ya está hecho, saltear si el repo existe
git add -A
git commit -m "Vista previa de la home de Gaddi"

gh repo create gaddi-preview --public --source=. --push
gh api -X POST repos/:owner/gaddi-preview/pages -f 'source[branch]=main' -f 'source[path]=/'
```

Si no tenés `gh`, creá el repositorio desde la web y después:

```bash
git remote add origin https://github.com/USUARIO/gaddi-preview.git
git push -u origin main
```

Y activá Pages en **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.

La URL queda en `https://USUARIO.github.io/gaddi-preview/`. Tarda un minuto largo la primera vez.

---

## Volver a armarlo después de editar

No edites esta carpeta: se regenera entera y perdés los cambios. El original vive en `v6-referencia/`.

```bash
node build-deploy.mjs      # desde la raíz del proyecto
```

Eso copia sólo los assets que la página realmente usa, reescribe las rutas y vuelve a verificar may/minúsculas. Después, desde `deploy/`: `git add -A && git commit -m "..." && git push`.

---

## Qué trae

| | |
| --- | --- |
| Páginas | `index.html`, `terminos.html`, `privacidad.html` |
| Peso | 2,3 MB · 15 imágenes WebP + la miniatura de enlace |
| Tipografías | Petrona + Chivo, desde Google Fonts |
| Ancho probado | 1900 · 1440 · 1024 · 390 px |

`.nojekyll` está a propósito: sin ese archivo GitHub Pages pasa el sitio por Jekyll, que ignora todo lo que empieza con guión bajo.

`assets/og/gaddi_preview.jpg` es la miniatura que se ve al pegar el enlace en WhatsApp o Slack: es el propio hero a 1200×630. Va en JPEG y no en WebP porque varios clientes de mensajería no renderizan WebP en el preview y la miniatura queda vacía.

---

## Antes de publicar de verdad

Cinco cosas. Las tres primeras son bloqueantes.

1. **El formulario no envía.** No hay endpoint. Hoy valida, avisa por adelantado que no manda nada y, al completarlo, lo repite sin borrar lo escrito y deriva al distribuidor de la zona. Al conectar el endpoint hay que reemplazar el bloque `is-pending` de `main.js` y quitar el `<p class="form-pending">` del HTML.
2. **Los textos legales no están redactados.** `terminos.html` y `privacidad.html` existen para que los enlaces del pie no queden muertos, y lo avisan en la cara. Necesitan redacción y revisión legal.
3. **Sacar el `noindex`.** `index.html` trae `<meta name="robots" content="noindex, nofollow">` porque la URL de Pages es pública y esto todavía no es el sitio. Está marcado con un comentario justo arriba.
4. **Datos por confirmar**: correo, teléfono y WhatsApp de Gaddi. Aparecen marcados, no inventados.
5. **La firma de la transición** dice sólo "Villa Mazán, La Rioja" hasta validar el apellido.
6. **`og:image` con ruta absoluta.** Hoy es relativa y funciona en la mayoría de los clientes, pero varios scrapers no resuelven relativas. Cuando haya dominio, cambiarla a `https://…/assets/og/gaddi_preview.jpg`.

El detalle completo está en `v6-referencia/NOTAS.md`, en el proyecto.
