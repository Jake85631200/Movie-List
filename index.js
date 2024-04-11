// 定義會用到的網址、用來放入電影的movies array
const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;
const paginator = document.querySelector("#paginator");
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form"); //父元素
const searchInput = document.querySelector("#search-input"); //輸入搜尋字串的元素
const switchDisplay = document.querySelector(".switch-display");
//儲存電影內容
const movies = [];
//儲存符合篩選條件的項目
let filteredMovies = [];
// 紀錄點擊的頁數
let pageClicked = 1;

// api請求
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results); //將 資料push入movies array
    renderPaginator(movies.length); //依電影長度決定 paginator 長度
    dataPanel.dataset.display = "card";
    renderMovieList(getMovieByPage(pageClicked)); //初始畫面只要第 1 頁就好
  })
  .catch((error) => console.log(error));

// 監聽 data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  // more button （modal）
  if (event.target.matches(".btn-show-movie")) {
    //若event.target 含有 btn-show-movie 的class
    showMovieModal(event.target.dataset.id); // 呼叫函式showMovieModal
    // + button (favorite list)
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

// Search 事件
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault();
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase(); //trim(): 去掉頭尾的空格   toLowercase: 把value換成小寫
  //條件篩選
  filteredMovies = movies.filter(
    (
      movie //匿名的條件函式
    ) => movie.title.toLowerCase().includes(keyword) //若movies陣列中的item(movie)其title包含keyword的話，過濾出來並放進filteredMovies陣列中
  );
  //錯誤處理：輸入無效字串
  if (filteredMovies.length === 0) {
    return alert(`Result：${keyword} Not found`);
  }
  // 搜尋後的分頁器頁數
  renderPaginator(filteredMovies.length);
  // 預設顯示第 1 頁搜尋內容
  renderMovieList(getMovieByPage(pageClicked));
});

// paginator
function renderPaginator(amount) {
  // 計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  // 製作 template
  let rawHTML = ``;
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" style="" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

paginator.addEventListener("click", function onPaginatorClicked(event) {
  // 如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;
  // 透過 dataset 取得被點擊的頁數
  pageClicked = Number(event.target.dataset.page);
  // 提示目前所選取的page
  document.querySelectorAll(".page-link").forEach((element) => {
    if (element.style.backgroundColor != "rgb(201, 219, 247)") {
      event.target.style.backgroundColor = "rgb(201, 219, 247)";
    } else if (element.style.backgroundColor === "rgb(201, 219, 247)") {
      element.style.backgroundColor = "";
      event.target.style.backgroundColor = "rgb(201, 219, 247)";
    }
  });
  // 更新畫面
  renderMovieList(getMovieByPage(pageClicked));
});

//function
// 依 data 渲染網頁內容
function renderMovieList(data) {
  if (dataPanel.dataset.display === "card") {
    let rawHTML = "";
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
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
        }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id='${item.id
        }'>+</button>
        </div>
      </div>
    </div>
  </div>`;
    });
    dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.display === "list") {
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `
    <div class="list p-3" style="display: flex; justify-content: space-between; border-top: 1px solid #c9c5c5;">
          <h5 class="card-title">${item.title}</h5>
          <div class="function-btn" style="margin-right: 300px;">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
              data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
    `;
    });
    dataPanel.innerHTML = rawHTML;
  }
}

function showMovieModal(id) {
  //回到HTML將需要帶入資料的element加上id
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    console.log("response", response);
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release Date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src='${POSTER_URL + data.image
      }' alt='movie-poster' class='img-fluid'>`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  // ||：OR 兩邊的式子是true還是false，回傳 true 的那邊。若都是true，左邊優先。
  // parse：取出時，將 JSON 格式的字串轉回 JavaScript 原生物件。
  const movie = movies.find((movie) => movie.id === id); //find與filter一樣需條件函數當參數，但find在找到第一個符合條件的item後就會停下來並回傳該item
  if (list.some((movie) => movie.id === id)) {
    //some方法和find類似，不過some只會回報陣列裡有沒有item通過檢查條件，有回傳true，到最後都沒有回傳false。
    return alert("此電影已經在收藏清單中！");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list)); //localStorage 格式：(key: string, value: string)
}

// 依照 page 數，從分配每頁最多 12 個電影
function getMovieByPage(pageClicked) {
  // 1 -> 0 - 11
  // 2 -> 12 - 23
  // ...
  const data = filteredMovies.length ? filteredMovies : movies;
  // 三元（條件）運算子：  條件 ? 值1 : 值2    如果條件為 true，運算子回傳 值1， 否則回傳 值2。可以在任何使用標準運算子的地方改用條件運算子。
  const startIndex = (pageClicked - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

switchDisplay.addEventListener("click", (event) => {
  if (event.target.matches(".fa-th")) {
    dataPanel.dataset.display = "card";
    renderMovieList(getMovieByPage(pageClicked));
  } else if (event.target.matches(".fa-bars")) {
    dataPanel.dataset.display = "list";
    renderMovieList(getMovieByPage(pageClicked));
  }
});
