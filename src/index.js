import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { lightbox } from './js/lightbox';

const form = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const target = document.querySelector('.js-guard');

let currentPage = 1;
let isReachedEnd = false;

loadMoreButton.classList.add('is-hidden');

const options = {
  rootMargin: '50px',
  root: null,
  threshold: 0.3,
};

const observer = new IntersectionObserver(handleLoadMoreButtonClick, options);

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
      page: currentPage,
      per_page: 40,
    },
  };
  return axios(fetchOptions);
}

async function handleFormSubmit(evt) {
  evt.preventDefault();

  try {
    currentPage = 1;

    // loadMoreButton.classList.remove('is-hidden');

    const query = form.elements.searchQuery.value.trim();
    const { data } = await fetchGallery(query);
    const arrHits = data.hits;
    const quantity = arrHits.length;

    if (!quantity) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    galleryEl.innerHTML = createMarkup(arrHits);

    observer.observe(target);
    lightbox.refresh();
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
        <a href="${largeImageURL}">
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
        </a>
      </div>`
    )
    .join('');
}

function handleLoadMoreButtonClick(entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      const query = form.elements.searchQuery.value.trim();

      try {
        if (isReachedEnd) { 
           observer.unobserve(target);
           return Notify.info(
             "We're sorry, but you've reached the end of search results."
           );
        }

        const { data } = await fetchGallery(query);
        const arrHits = data.hits;
        const currentQuantity = currentPage * arrHits.length;
        const total = data.totalHits;

        if (currentQuantity) {
          Notify.success(`Hooray! We found ${total} images.`);
        }

        galleryEl.insertAdjacentHTML('beforeend', createMarkup(arrHits));

        currentPage += 1;
        isReachedEnd = currentQuantity >= total;

        smoothScroll();
        lightbox.refresh();
      } catch (error) {
        console.log(error);
      }
    }
  });
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
