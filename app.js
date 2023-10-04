// Variables para elementos del DOM
const container = document.querySelector("#contenedor");
const modalBody = document.querySelector(".modal .modal-body");
const containerShoppingCart = document.querySelector("#carritoContenedor");
const removeAllProductsCart = document.querySelector("#vaciarCarrito");
const keepBuy = document.querySelector("#procesarCompra");
const totalPrice = document.querySelector("#precioTotal");
const activeFunction = document.querySelector('#activarFuncion');
const categoriesSelect = document.querySelector('#categories');
const sortProducts = document.querySelector('#sortProductsBtn');
const saveProductBtn = document.querySelector('#saveProductBtn');

// Endpoints de la API
const productsEndpoint = "https://fakestoreapi.com/products";
const categoriesEndpoint = "https://fakestoreapi.com/products/categories";

// Arreglos para almacenar productos
let shoppingCart = [];
let productList = [];

// Contadores
let counter = 0;
let quantity = [];

// Función para obtener datos de la API
const fetchData = async endpoint => {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error("no se pudo conectar");
    }
    return await response.json();
  } catch (error) {
    console.log(error.message);
  }
};

// Función para agregar productos al contenedor
const addProductsContainer = (product) => {
  const { id, title, image, price, description } = product;
  container.innerHTML += `
    <div class="card mt-3" style="width: 18rem;">
      <img class="card-img-top mt-2" src="${image}" alt="Card image cap">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text" style="font-weight: bold">$ ${price}</p>
        <p class="card-text">• ${description}</p>
        <button class="btn btn-primary" onclick="addProduct(${id})">Comprar producto</button>
        <button class="btn btn-secondary" onclick="editProduct(${id})">Editar producto</button>
        <button class="btn btn-secondary" onclick="removeProduct(${id})">Eliminar producto</button>
      </div>
    </div>
  `;
};

// Evento al cambiar la categoría
categoriesSelect.addEventListener('change', async (event) => {
  const category = event.target.value;
  const products = await fetchData(`${productsEndpoint}/category/${category}?sort=desc`);
  container.innerHTML = '';
  products.forEach(addProductsContainer);
});

// Evento al hacer clic en el botón de ordenamiento
sortProducts.addEventListener('click', async () => {
  const category = categoriesSelect.value;
  const sortingDirection = sortProducts.dataset.sortingdirection;
  const sortingDirectionEmoji = document.getElementById('sorting-direction-emoji');
  const products = await fetchData(`${productsEndpoint}/category/${category}${sortingDirection ? `?sort=${sortingDirection}` : ``}`);
  sortProducts.dataset.sortingdirection = sortingDirection === 'asc' ? 'desc' : 'asc';
  sortingDirectionEmoji.textContent = sortingDirection === 'asc' ? '⬇️' : '⬆️';  
  container.innerHTML = '';
  products.forEach(addProductsContainer);
});

// Evento al hacer clic en el botón de guardar producto
saveProductBtn.addEventListener('click', async () => {
  const product = {
    id: parseInt(document.getElementById('id').value || productList.length + 1, 10),
    title: document.getElementById('title').value,
    price: document.getElementById('price').value,
    description: document.getElementById('description').value,
    image: document.getElementById('image').value,
    category: document.getElementById('category').value,
  };
  if (document.getElementById('id').value) {
    const productIndex = productList.findIndex(item => item.id === parseInt(product.id, 10));
    productList[productIndex] = product;
    container.innerHTML = '';
    productList.forEach(addProductsContainer);
  } else {
    productList.push(product);
    addProductsContainer(product);
  }
  document.getElementById('id').value = '';
  document.getElementById('title').value = '';
  document.getElementById('price').value = '';
  document.getElementById('description').value = '';
  document.getElementById('image').value = '';
  document.getElementById('category').value = '';
});



// Se crea una funcion para llenar el dropdown de categorias
const getCategories = async () => {
  const categories = await fetchData(categoriesEndpoint);
  categoriesSelect.innerHTML = categories.map(category => `<option value="${category}">${category}</option>`).join('');
};

const getProducts = async () => {
  // Se obtiene la categoria seleccionada por defecto para llamar la lista de productos
 await getCategories();
  const category = categoriesSelect.value;
  const products = await fetchData(`${productsEndpoint}/category/${category}?sort=desc`);
  console.table(products);
  products.forEach(addProductsContainer);
  productList = products;
};

// agregando productos al carrito

const addProduct = (id) => {
  const testProductId = shoppingCart.some((item) => item.id === id);

  if (testProductId) {
    Swal.fire({
      title: "Este chunche ya fue seleccionado",
      text: "Por favor seleccione otra cosa",
      icon: "success",
    });
    return;
  }

  shoppingCart.push({
    ...productList.find((item) => item.id === id),
    quantity: 1,
  });

  showShoppingCart();
};

// Se crea una funcion para llenar el formulario con los datos del producto a editar
const editProduct = (id) => {
  document.getElementById('id').value = id;
  document.getElementById('title').value = productList.find((item) => item.id === id).title;
  document.getElementById('price').value = productList.find((item) => item.id === id).price;
  document.getElementById('description').value = productList.find((item) => item.id === id).description;
  document.getElementById('category').value = productList.find((item) => item.id === id).category;
  document.getElementById('image').value = productList.find((item) => item.id === id).image;
};

// Se crea funcion para elminar productos del carrito
const removeProduct = (id) => {
  const testProductId = shoppingCart.some((item) => item.id === id);

  if (!testProductId) {
    Swal.fire({
      title: "Este chunche no fue seleccionado",
      text: "Por favor seleccione otra cosa",
      icon: "success",
    });
    return;
  }

  shoppingCart.splice(shoppingCart.findIndex((item) => item.id === id), 1);

  showShoppingCart();
};

// carrito de compras
const showShoppingCart = () => {
  modalBody.innerHTML = "";

  shoppingCart.forEach((product) => {
    const { title, image, price, id } = product;

    modalBody.innerHTML += `
      <div class="modal-contenedor">
        <div>
          <img class="img-fluid img-carrito" src="${image}"/>
        </div>
        <div>
          <p style="font-weight: bold">${title}</p>
          <p style="font-weight: bold">Precio: R$ ${price}</p>
          <div>
            <button onclick="removeProducts(${id})" class="btn btn-danger">Eliminar produto</button>
          </div>
        </div>
      </div>
    `;
  });

  totalPriceInCart(totalPrice);
  messageEmptyShoppingCart();
  containerShoppingCart.textContent = shoppingCart.length;
  setItemInLocalStorage();
};

//quitar productos del carrito

const removeProducts = (id) => {
  const index = shoppingCart.findIndex((item) => item.id === id);

  if (index !== -1) {
    shoppingCart.splice(index, 1);
    showShoppingCart();
  }
};

// vaciar carrito de compras

removeAllProductsCart.addEventListener("click", () => {
  shoppingCart.length = [];
  showShoppingCart();
});

// mensagem carrinho vazio
const messageEmptyShoppingCart = () => {
  if (shoppingCart.length === 0) {
    modalBody.innerHTML = `
      <p class="text-center text-primary parrafo">No hay nada en el carrito!</p>
    `;
  }
};

// continuar comprando

keepBuy.addEventListener("click", () => {
  if (shoppingCart.length === 0) {
    Swal.fire({
      title: "su carrito está vacío",
      text: "Compre algo para continuar",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } else {
    location.href = "index.html";
    finalOrder()
  }
});

// precio total en el carrito
const totalPriceInCart = (totalPriceCart) => {
  totalPriceCart.innerText = shoppingCart.reduce((acc, prod) => {
    return acc + prod.price;
  }, 0);
}; 

// local storage
const setItemInLocalStorage = () => {
  localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
};

const addItemInLocalStorage = () => {
  shoppingCart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
  setItemInLocalStorage();
  showShoppingCart();
};

document.addEventListener("DOMContentLoaded", addItemInLocalStorage);
getProducts();