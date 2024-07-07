# DESCRIPCIÓN DEL PROYECTO

Este proyecto se ha ideado para disfrutar de las canciones "karaoke" que hay en youtube como si de un auténtico karaoke
se tratara. No trata de ser un ejemplo de código limpio ni de buenas prácticas, sino de un proyecto para disfrutar de la música.

El proyecto no usa API de youtube si no una librería que permite buscar en youtube y obtener los resultados (youtube-search-without-api-key).
Para reproducir usa http://www.youtube.com/player_api. En resumen, mientras youtube no haga cambios que invaliden estas librerías, 
este proyecto debe seguir funcionando

Dispones de:
- Buscador de canciones (/): Tienes un formulario para poner tu nombre y el texto por el que quires buscar. 
El sistema busca en youtube el texto que indicas (autor, título, etc.) y te muestra los resultados.
Automáticamente añadimos a los términos de busqueda "karaokemedia" para que los resultados sean más precisos en el ámbito
del karaoke.
- Página de resultados (/search): Aquí se muestran los resultados de tu búsqueda y puedes clickar en cada uno para que se añada a la lista.
- Canciones pedidas (/canciones-pedidas): Aparece las canciones que hay en cola para cantar con el nombre de la persona/as que lo van a cantar.
- Reproductor (/play): Esta página va comprobando si hay canciones en cola y las va reproduciendo una tras otras.

# QUÉ HEMOS USADO
El proyecto se desarrolla en node.js con express. 
Durante el desarrollo la versión de node usada ha sido la 20.11.0 y la de npm la 10.2.4.

# CÓMO DEBES USARLO

Ten en una table u ordenador la página del player.
Desde otros dispositivos acceder a la página principal y buscar las canciones que quieras cantar. Ir añadiendo a la lista
e irán reproduciéndose en el player.

El proyecto usa la "web speech api" pero los navegadores, restringen que no se reproduza el audio si no es en respuesta a una acción del usuario.
Normalmente esta restricción puedes configurarla en el navegador. No obstante  he creado una app muy sencilla para usarlo de player
pero no la voy a publicar en stores porque es muy sencilla y no tiene sentido. Publicaré el repo para quien quiera usarla.

# CÓMO INSTALARLO

1. Clona el repositorio
2. Instala las dependencias con `npm install`
3. Arranca el servidor con `node index.js`

Si lo quieres usar en producción necesitarás un hosting que permita ejecutar node.js.

# CONCLUSIÓN

Disfruta de la música y canta todo lo que puedas. Si te gusta el proyecto, compártelo con tus amigos y disfrutad juntos y
si quieres colaborar estaré encantado de recibir tus pull requests.


