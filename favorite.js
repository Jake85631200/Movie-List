// 定義會用到的網址、用來放入電影的movies array
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const dataPanel = document.querySelector('#data-panel')
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  // more button （modal）
  if (event.target.matches('.btn-show-movie')) {  //若event.target 含有 btn-show-movie的class
    showMovieModal(event.target.dataset.id)  // 呼叫函式showMovieModal
    // console.log(event.target.dataset.id)

    //remove button
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})
renderMovieList(movies)

//function
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image, id 隨著每個 item 改變
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-danger btn-remove-favorite" data-id='${item.id}'>X</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  //回到HTML將需要帶入資料的element加上id 
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    console.log('response', response)
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release Date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src='${POSTER_URL + data.image}' alt='movie-poster' class='img-fluid'>`
  })
}

function removeFromFavorite(id) {
  // findIndex: 回傳item的Index
  const movieIndex = movies.findIndex((movie) => movie.id === id)  
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}