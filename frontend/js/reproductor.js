console.log("✅ Script cargado correctamente desde reproductor.js");

// --- Elementos del DOM --- //
const data = JSON.parse(localStorage.getItem("contenidoSeleccionado"));
const contenedor = document.getElementById("contenedorIframe");
const error = document.getElementById("mensajeError");
const mensaje = document.getElementById("mensaje-disfruta");
const selector = document.getElementById("selector-capitulos");
const inputTemporada = document.getElementById("input-temporada");
const inputEpisodio = document.getElementById("input-episodio");

// --- Animación de mensaje --- //
setTimeout(() => 
{
    mensaje.style.animation = "tracking-out-contract 1.5s ease both";

    setTimeout(() => 
    {
        mensaje.style.display = "none";

        // Verifica contenido seleccionado
        if (!data || !data.id || !data.type) 
        {
            error.style.display = "block";
            return;
        }

        // Mostrar reproductor
        contenedor.style.display = "block";

        if (data.type === "tv") 
        {
            selector.classList.remove("d-none");
            mostrarIframe(Number(inputTemporada.value), Number(inputEpisodio.value));
        } 
        else 
        {
            selector.classList.add("d-none");
            mostrarIframe();
        }   
        
    }, 1500);
}, 3000);

// --- Mostrar el iframe embebido --- //
function mostrarIframe(temporada = 1, episodio = 1) {
    const src = data.type === "movie"
        ? `https://vidfast.pro/movie/${data.id}?autoPlay=true&poster=true`
        : `https://vidfast.pro/tv/${data.id}/${temporada}/${episodio}?autoPlay=true&poster=true`;

    contenedor.innerHTML = `
        <iframe 
            id="player"
            src="${src}"
            allowfullscreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-modals"
            allow="encrypted-media"
            style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;">
        </iframe>
    `;
}

// --- Actualización dinámica si cambia la selección de capítulo --- //
inputTemporada.addEventListener("change", () => {
    mostrarIframe(Number(inputTemporada.value), Number(inputEpisodio.value));
});

inputEpisodio.addEventListener("change", () => {
    mostrarIframe(Number(inputTemporada.value), Number(inputEpisodio.value));
});
