import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const form = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');

console.dir(form);

form.addEventListener('submit', handleFormSubmit);

function fetchGallery(query) {
  const fetchOptions = {
    method: 'GET',
    url: 'https://pixabay.com/api/',
    params: {
      key: '38235772-33311ad07fcdc3c53044fd6f6',
      q: `${query}`,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    },
  };
  return axios(fetchOptions);
}

async function handleFormSubmit(evt) {
  evt.preventDefault();

  try {
    const query = evt.currentTarget.elements.searchQuery.value.trim();

    const { data } = await fetchGallery(query);

    const arrHits = data.hits;

    if (arrHits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    galleryEl.insertAdjacentHTML('beforeend', createMarkup(arrHits));
  } catch (error) {
    console.log(error);
  }
}

function createMarkup(obj) {
  return obj
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item">
            <b>Likes ${likes}</b>
          </p>
          <p class="info-item">
            <b>Views ${views}</b>
          </p>
          <p class="info-item">
            <b>Comments ${comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads ${downloads}</b>
          </p>
        </div>
      </div>`
    )
    .join('');
}
