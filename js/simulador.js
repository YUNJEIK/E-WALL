//  Estado de la aplicación 

let publicaciones = [];
let mostrandoSoloDestacadas = false;

//  Inicialización

document.addEventListener('DOMContentLoaded', () => {
  cargarPublicaciones();
  configurarEventos();
});

//  Carga inicial (fetch + JSON) 

async function cargarPublicaciones() {
  try {
    const respuesta = await fetch('./data/publicaciones.json');

    if (!respuesta.ok) {
      throw new Error('Error HTTP: ' + respuesta.status);
    }

    const data = await respuesta.json();
    publicaciones = data;
    renderizarPublicaciones(publicaciones);
  } catch (error) {
    mostrarError('No se pudieron cargar las publicaciones iniciales.');
  }
}

//  Configuración de eventos 

function configurarEventos() {
  const form = document.getElementById('formPublicacion');
  const buscador = document.getElementById('buscador');
  const btnOrdenarFecha = document.getElementById('ordenarFecha');
  const btnOrdenarLikes = document.getElementById('ordenarLikes');
  const btnMostrarDestacadas = document.getElementById('mostrarDestacadas');

  form.addEventListener('submit', manejarSubmit);
  buscador.addEventListener('input', manejarBusqueda);
  btnOrdenarFecha.addEventListener('click', manejarOrdenarPorFecha);
  btnOrdenarLikes.addEventListener('click', manejarOrdenarPorLikes);
  btnMostrarDestacadas.addEventListener('click', manejarMostrarDestacadas);

  const contenedor = document.getElementById('listaPublicaciones');
  contenedor.addEventListener('click', manejarClickEnPublicacion);
}

//  Handlers principales 

function manejarSubmit(evento) {
  evento.preventDefault();

  const tituloInput = document.getElementById('titulo');
  const contenidoInput = document.getElementById('contenido');
  const autorInput = document.getElementById('autor');

  const titulo = tituloInput.value.trim();
  const contenido = contenidoInput.value.trim();
  const autor = autorInput.value.trim();

  if (!titulo || !contenido || !autor) {
    mostrarError('Todos los campos del formulario son obligatorios.');
    return;
  }

  const nuevaPublicacion = {
    id: Date.now(),
    titulo,
    contenido,
    autor,
    fecha: new Date().toISOString(),
    likes: 0,
    destacada: false
  };

  publicaciones.push(nuevaPublicacion);
  aplicarFiltrosYRender();
  mostrarExito('Publicación creada correctamente.');
  evento.target.reset();
}

function manejarBusqueda(evento) {
  const termino = evento.target.value.toLowerCase();
  aplicarFiltrosYRender(termino);
}

function manejarOrdenarPorFecha() {
  const copia = [...publicaciones].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha)
  );
  renderizarPublicaciones(copia);
}

function manejarOrdenarPorLikes() {
  const copia = [...publicaciones].sort((a, b) => b.likes - a.likes);
  renderizarPublicaciones(copia);
}

function manejarMostrarDestacadas() {
  mostrandoSoloDestacadas = !mostrandoSoloDestacadas;
  const btn = document.getElementById('mostrarDestacadas');
  btn.textContent = mostrandoSoloDestacadas
    ? 'Mostrar todas'
    : 'Mostrar solo destacadas';

  aplicarFiltrosYRender();
}

//  Lógica de negocio 

function aplicarFiltrosYRender(terminoBusqueda = '') {
  let lista = [...publicaciones];

  if (terminoBusqueda) {
    const termino = terminoBusqueda.toLowerCase();
    lista = lista.filter((pub) =>
      pub.titulo.toLowerCase().includes(termino)
    );
  }

  if (mostrandoSoloDestacadas) {
    lista = lista.filter((pub) => pub.destacada);
  }

  renderizarPublicaciones(lista);
}

function manejarClickEnPublicacion(evento) {
  const likeBtn = evento.target.closest('.btn-like');
  const destacarBtn = evento.target.closest('.btn-destacar');

  if (likeBtn) {
    const id = Number(likeBtn.dataset.id);
    incrementarLike(id);
  }

  if (destacarBtn) {
    const id = Number(destacarBtn.dataset.id);
    toggleDestacada(id);
  }
}

function incrementarLike(id) {
  publicaciones = publicaciones.map((pub) =>
    pub.id === id ? { ...pub, likes: pub.likes + 1 } : pub
  );
  aplicarFiltrosYRender(
    document.getElementById('buscador').value.trim()
  );
}

function toggleDestacada(id) {
  publicaciones = publicaciones.map((pub) =>
    pub.id === id ? { ...pub, destacada: !pub.destacada } : pub
  );
  aplicarFiltrosYRender(
    document.getElementById('buscador').value.trim()
  );
}

//  Renderizado del DOM 

function renderizarPublicaciones(lista) {
  const contenedor = document.getElementById('listaPublicaciones');
  contenedor.innerHTML = '';

  if (!lista || lista.length === 0) {
    const mensaje = document.createElement('p');
    mensaje.className = 'lista-vacia';
    mensaje.textContent = 'No hay publicaciones para mostrar.';
    contenedor.appendChild(mensaje);
    return;
  }

  lista.forEach((pub) => {
    const card = document.createElement('article');
    card.className = 'card-publicacion';
    if (pub.destacada) {
      card.classList.add('card-publicacion--destacada');
    }

    const fechaFormateada = new Date(pub.fecha).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    card.innerHTML = `
      <header class="card-publicacion__header">
        <h3 class="card-publicacion__titulo">${pub.titulo}</h3>
        ${
          pub.destacada
            ? '<span class="badge badge--destacada">Destacada</span>'
            : ''
        }
      </header>
      <p class="card-publicacion__contenido">${pub.contenido}</p>
      <footer class="card-publicacion__footer">
        <div class="card-publicacion__meta">
          <span><strong>Autor:</strong> ${pub.autor}</span>
          <span class="card-publicacion__fecha">${fechaFormateada}</span>
        </div>
        <div class="card-publicacion__acciones">
          <span class="card-publicacion__likes">
            Likes:
            <span class="likes-count">${pub.likes}</span>
          </span>
          <button
            class="btn btn-sm btn-like"
            data-id="${pub.id}"
          >
            Like
          </button>
          <button
            class="btn btn-sm btn-destacar"
            data-id="${pub.id}"
          >
            ${pub.destacada ? 'Quitar destacado' : 'Destacar'}
          </button>
        </div>
      </footer>
    `;

    contenedor.appendChild(card);
  });
}

//  Helpers (SweetAlert2) 

function mostrarExito(mensaje) {
  Swal.fire({
    icon: 'success',
    title: 'Éxito',
    text: mensaje,
    timer: 1500,
    showConfirmButton: false
  });
}

function mostrarError(mensaje) {
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: mensaje
  });
}
