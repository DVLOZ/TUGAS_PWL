import dog_env from './env.js';
const savedPetList = localStorage.getItem(`${dog_env.endpoint}/v1/images/search`);
const petList = JSON.parse(savedPetList);

const searchParams = new URLSearchParams(window.location.search);
const currentPage = searchParams.get("page") || 1;


const getBreedsImage = async (sortBy = 'asc', currentPage) => {
  try {
    const queryParams = new URLSearchParams({
      include_categories: true,
      include_breeds: true,
      has_breeds: true,
      order: sortBy,
      page: currentPage,
      limit: 10,
    });


    const apiUrl = `${dog_env.endpoint}/v1/images/search?${queryParams.toString()}`;
    console.log(apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': dog_env.API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Gagal mendapatkan data dari API');
    }


    return response.json();
  } catch (error) {

    console.error('Terjadi kesalahan dalam mengambil data:', error);
    throw error;
  }
};


const fetchImage = (sortBy) => {

  getBreedsImage(sortBy, currentPage)
    .then((images) => {

      localStorage.setItem('petList', JSON.stringify(images));


      renderComponent(images);
    })
    .catch((error) => {

      console.error('Terjadi kesalahan saat mengambil gambar:', error);
    });
};
fetchImage();


const dropdownElement = document.querySelector('.dropdownMenu');
const formElement = document.querySelector('.searchForm');
const searchInputElement = document.querySelector('.searchInput');


const prevPage = document.querySelector('.prevPagination');
const pageOne = document.querySelector('.pageOne');
const pageTwo = document.querySelector('.pageTwo');
const pageThree = document.querySelector('.pageThree');
const nextPage = document.querySelector('.nextPagination');


const PetCardComponent = (pet) => {
  const breedName = pet.breeds.length > 0 ? pet.breeds[0].name : 'Unknown';


  return `
    <div class="card my-3 mx-2" style="width: 20%">
      <img height="300" style="object-fit: cover" class="card-img-top" src="${pet.url}" alt="Card image cap" />
      <div class="card-body">
        <h5 class="card-title d-inline">${breedName}</h5>
        <p class="card-text">
          ${pet.description || 'No description available'}
        </p>
        <p>${pet.location || 'Location not specified'}</p>
        <span class="badge badge-pill badge-info">${pet.category || 'Category not specified'}</span>
        <span class="badge badge-pill badge-warning">Weight: ${pet.weight || 'Not specified'}</span>
        <span class="badge badge-pill badge-danger">Height: ${pet.height || 'Not specified'}</span>
      </div>
    </div>
  `;
};

const renderComponent = (filteredPet) => {
  document.querySelector(".petInfo").innerHTML = filteredPet
    .map((pet) => PetCardComponent(pet))
    .join("");
};


const sortPetById = (key) => {
  if (key === "ascending") {

    fetchImage("asc");
  }
  if (key === "descending") {

    fetchImage("desc");
  }
};


const searchPetByKey = (key) => {
  return petList.filter((pet) => {
    if (pet.breeds && Array.isArray(pet.breeds)) {
      return pet.breeds.length > 0 && pet.breeds[0].name.toLowerCase().includes(key);
    }
    return false;
  });
};

dropdownElement.addEventListener("change", (event) => {

  event.preventDefault();
  const value = event.target.value;
  sortPetById(value);
});

formElement.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = searchInputElement.value.trim().toLowerCase();

  // Clear previous search results
  document.querySelector(".petInfo").innerHTML = '';

  if (!petList) {
    console.error('Error: petList is null or undefined.');
    return
  }

  if (value === "") {
    renderComponent(petList);
  } else {
    // Filter the petList based on the search input
    const filteredPet = searchPetByKey(value);

    console.log('Filtered Pets:', filteredPet); // Debugging line to check filtered results

    if (filteredPet.length > 0) {
      renderComponent(filteredPet);
    } else {
      // Handle no matching results
      document.querySelector(".petInfo").innerHTML = '<p>No matching pets found.</p>';
    }
  }
});







const redirectTo = (page) => {
  searchParams.set("page", page);

  window.location.search = searchParams.toString();
};

prevPage.addEventListener("click", (event) => {
  event.preventDefault();
  const currentPage = parseInt(searchParams.get("page")) || 1; // Mendapatkan nilai currentPage dari parameter pencarian "page"

  if (currentPage > 1) {
    redirectTo(currentPage - 1);
  } else {
    redirectTo(1);
  }
});


pageOne.addEventListener("click", (event) => {
  event.preventDefault();
  redirectTo(1);
});

pageTwo.addEventListener("click", (event) => {
  event.preventDefault();
  redirectTo(2);
});

pageThree.addEventListener("click", (event) => {
  event.preventDefault();
  redirectTo(3);
});

nextPage.addEventListener("click", (event) => {
  event.preventDefault();
  const currentPage = parseInt(searchParams.get("page")) || 1;
  redirectTo(currentPage + 1);
});
