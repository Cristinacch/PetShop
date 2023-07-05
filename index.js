//Variable que mantiene el estado visible del carrito
var carritoVisible = false;
let listaCarrito = [];
//Espermos que todos los elementos de la pàgina cargen para ejecutar el script
if(document.readyState == 'loading'){
    document.addEventListener('DOMContentLoaded', ready)
}else{
    ready();
}

function ready(){
    listaCarrito = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    tipocambio = JSON.parse(localStorage.getItem('tipocambio')) ?? '';
    if(tipocambio != 'ARS'){
        calculate();
    }
    //Agregremos funcionalidad a los botones eliminar del carrito
    var botonesEliminarItem = document.getElementsByClassName('btn-eliminar');
    for(var i=0;i<botonesEliminarItem.length; i++){
        var button = botonesEliminarItem[i];
        button.addEventListener('click',eliminarItemCarrito);
    }

    //Agrego funcionalidad al boton sumar cantidad
    var botonesSumarCantidad = document.getElementsByClassName('sumar-cantidad');
    for(var i=0;i<botonesSumarCantidad.length; i++){
        var button = botonesSumarCantidad[i];
        button.addEventListener('click',sumarCantidad);
    }

    //Agrego funcionalidad al buton restar cantidad
    var botonesRestarCantidad = document.getElementsByClassName('restar-cantidad');
    for(var i=0;i<botonesRestarCantidad.length; i++){
        var button = botonesRestarCantidad[i];
        button.addEventListener('click',restarCantidad);
    }

    //Agregamos funcionalidad al boton Agregar al carrito
    var botonesAgregarAlCarrito = document.getElementsByClassName('boton-item');
    for(var i=0; i<botonesAgregarAlCarrito.length;i++){
        var button = botonesAgregarAlCarrito[i];
        button.addEventListener('click', agregarAlCarritoClicked);
    }

    //Agregamos funcionalidad al botón comprar
    document.getElementsByClassName('btn-pagar')[0].addEventListener('click',pagarClicked)
}
// Fetch Exchange Rate and Update the DOM
async function calculate(){
    const monedaEl_one = document.getElementById('moneda-uno');
    const monedaEl_two = document.getElementById('moneda-dos');
    const moneda_one = monedaEl_one.value;
    const moneda_two = monedaEl_two.value;
    const cambioEl = document.getElementById('cambio');
    let item = document.querySelector('.item');
    var parent = item.parentElement;
    var siblings = parent.childElementCount; //12
    try{
        const reponse = await fetch(`https://api.exchangerate-api.com/v4/latest/${moneda_one}`);
        const data = await reponse.json();
        const taza = data.rates[moneda_two]; // 0.000388 * 1000
        cambioEl.innerText = `1 ${moneda_one} = ${taza} ${moneda_two}`;
        for (var i = 0; i < siblings; i++) {
            // var sibling = siblings[i];
            const itemCantidad = item.querySelector('.precio-item').innerText;
            const itemHtml = item.querySelector('.precio-item');
            const cantidadSinSimbolo = itemCantidad.replace('$', '');
            const cantidadNumerica = parseInt(cantidadSinSimbolo);
            const cantidadEl_two = (cantidadNumerica * taza).toFixed(2); //388
            itemHtml.innerHTML = `$${cantidadEl_two}`;
            console.log(cantidadNumerica);
            // console.log(itemCantidad);
            item = item.nextElementSibling;
            localStorage.setItem('tipocambio', JSON.stringify(moneda_two));
            const cambioactual = document.querySelector('#CambioActual');
            cambioactual.innerText = `El Cambio actual es ${moneda_two}`;
        }
    } catch (error) {
        console.log(error);
    }
}
function cambioMoneda(){
    const monedaEl_one = document.getElementById('moneda-uno');
    const monedaEl_two = document.getElementById('moneda-dos');
    const temp = monedaEl_one.value;
    monedaEl_one.value = monedaEl_two.value;
    monedaEl_two.value = temp;
    calculate();
}
//Eliminamos todos los elementos del carrito y lo ocultamos
function pagarClicked(){
    Swal.fire(
        'Compra Realizada con Exito!',
        'Gracias por su Compra!',
        )
    //alert("Gracias por la compra");
    //Elimino todos los elmentos del carrito
    var carritoItems = document.getElementsByClassName('carrito-items')[0];
    while (carritoItems.hasChildNodes()){
        carritoItems.removeChild(carritoItems.firstChild)
    }
    actualizarTotalCarrito();
    ocultarCarrito();
}
//Funciòn que controla el boton clickeado de agregar al carrito
function agregarAlCarritoClicked(event){
    var button = event.target;
    var item = button.parentElement;
    var titulo = item.getElementsByClassName('titulo-item')[0].innerText;
    var precio = item.getElementsByClassName('precio-item')[0].innerText;
    var imagenSrc = item.getElementsByClassName('img-item')[0].src;
    const producto = {
        nombre: titulo,
        precio: precio,
        imagen: imagenSrc,
        cantidad: 1
    }
    let bandera = true;
    listaCarrito.forEach(element => {
        if(element.nombre == producto.nombre){
            Swal.fire('El producto ya se encuentra en el carrito');
            bandera = false;
            //alert("El producto ya se encuentra en el carrito");
            return;
        }
    });
    if(bandera){
        listaCarrito.push(producto);
        agregarItemAlCarrito();
        hacerVisibleCarrito();
    }
    
}

//Funcion que hace visible el carrito
function hacerVisibleCarrito(){
    carritoVisible = true;
    var carrito = document.getElementsByClassName('carrito')[0];
    carrito.style.marginRight = '0';
    carrito.style.opacity = '1';

    var items =document.getElementsByClassName('contenedor-items')[0];
    items.style.width = '60%';
}

//Funciòn que agrega un item al carrito
function agregarItemAlCarrito() {
    var itemsCarrito = document.getElementsByClassName('carrito-items')[0];
    var firstchild = itemsCarrito.firstElementChild;
    while(firstchild.nextElementSibling){
        var nextchild = firstchild.nextElementSibling;
        itemsCarrito.removeChild(nextchild);
    }
    listaCarrito.forEach(producto => {
        var item = document.createElement('div');
        item.classList.add('item');
        var itemCarritoContenido = `
            <div class="carrito-item">
                <img src="${producto.imagen}" width="80px" alt="">
                <div class="carrito-item-detalles">
                <span class="carrito-item-titulo">${producto.nombre}</span>
                <div class="selector-cantidad">
                    <i class="fa-solid fa-minus restar-cantidad"></i>
                    <input type="text" value="${producto.cantidad}" class="carrito-item-cantidad" disabled>
                    <i class="fa-solid fa-plus sumar-cantidad"></i>
                </div>
                    <span class="carrito-item-precio">${producto.precio}</span>
                </div>
                <button class="btn-eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        item.innerHTML = itemCarritoContenido;
        itemsCarrito.append(item);
        // Añadimos los event listeners a los botones correspondientes
        item.getElementsByClassName('btn-eliminar')[0].addEventListener('click', eliminarItemCarrito);
        item.getElementsByClassName('restar-cantidad')[0].addEventListener('click', restarCantidad);
        item.getElementsByClassName('sumar-cantidad')[0].addEventListener('click', sumarCantidad);
    });
    actualizarTotalCarrito(); // Movido después de agregar los elementos al carrito
}
//Aumento en uno la cantidad del elemento seleccionado
function sumarCantidad(event){
    var buttonClicked = event.target;
    var selector = buttonClicked.parentElement;
    var selectorPadre = selector.parentElement;
    listaCarrito.forEach(element => {
        if(element.nombre == selectorPadre.getElementsByClassName('carrito-item-titulo')[0].innerText){
            element.cantidad++;
        }
    });
    console.log(listaCarrito);
    console.log(selector.getElementsByClassName('carrito-item-cantidad')[0].value);
    var cantidadActual = selector.getElementsByClassName('carrito-item-cantidad')[0].value;
    cantidadActual++;
    selector.getElementsByClassName('carrito-item-cantidad')[0].value = cantidadActual;
    actualizarTotalCarrito();
}
//Resto en uno la cantidad del elemento seleccionado
function restarCantidad(event){
    var buttonClicked = event.target;
    var selector = buttonClicked.parentElement;
    var selectorPadre = selector.parentElement;
    listaCarrito.forEach(element => {
        if(element.nombre == selectorPadre.getElementsByClassName('carrito-item-titulo')[0].innerText){
            element.cantidad--;
        }
    });
    console.log(selector.getElementsByClassName('carrito-item-cantidad')[0].value);
    var cantidadActual = selector.getElementsByClassName('carrito-item-cantidad')[0].value;
    cantidadActual--;
    if(cantidadActual>=1){
        selector.getElementsByClassName('carrito-item-cantidad')[0].value = cantidadActual;
        actualizarTotalCarrito();
    }
}

//Elimino el item seleccionado del carrito
function eliminarItemCarrito(event){
    var buttonClicked = event.target;
    listaCarrito.forEach(element => {
        if(element.nombre == buttonClicked.parentElement.getElementsByClassName('carrito-item-titulo')[0].innerText){
            listaCarrito.splice(listaCarrito.indexOf(element),1);
        }
    });
    buttonClicked.parentElement.remove();
    //Actualizamos el total del carrito
    actualizarTotalCarrito();
    ocultarCarrito();
}
//Funciòn que controla si hay elementos en el carrito. Si no hay oculto el carrito.
function ocultarCarrito(){
    var carritoItems = document.getElementsByClassName('carrito-items')[0];
    if(carritoItems.childElementCount==0){
        var carrito = document.getElementsByClassName('carrito')[0];
        carrito.style.marginRight = '-100%';
        carrito.style.opacity = '0';
        carritoVisible = false;
    
        var items =document.getElementsByClassName('contenedor-items')[0];
        items.style.width = '100%';
    }
}
function actualizarTotalCarrito() {
    var carritoContenedor = document.getElementsByClassName('carrito')[0];
    var carritoItems = carritoContenedor.getElementsByClassName('carrito-item');
    var total = 0;
    // Verificar si el elemento existe antes de acceder a su propiedad innerText
    var carritoPrecioTotal = document.getElementsByClassName('carrito-precio-total')[0];
    if (listaCarrito.length > 0) {
        for (var i = 0; i < listaCarrito.length; i++) {
            var item = carritoItems[i];
            console.log('entre');
            var precioElemento = item.getElementsByClassName('carrito-item-precio')[0];
            var precio = parseFloat(precioElemento.innerText.replace('$', ''));
            console.log(precio);
            var cantidadItem = item.getElementsByClassName('carrito-item-cantidad')[0];
            var cantidad = cantidadItem.value;
            total = total + (precio * cantidad);
        }
        total = Math.round(total * 100) / 100;
        carritoPrecioTotal.innerText = '$' + total.toLocaleString("es") + ".00";
    }
    else{
        carritoPrecioTotal.innerText = '$0';
    }
    localStorage.setItem('favoritos', JSON.stringify(listaCarrito));
}

