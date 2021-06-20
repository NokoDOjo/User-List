const INDEX_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users/";
const names = [];
const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector('#paginator');
const followBtn = document.querySelector('.btn-add-follow');
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#search-input');
const USERS_PER_PAGE = 20;
let currentPage = 1;
let filteredUsers = [];

function renderNameList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
    <div class="col-4 col-md-3 col-sm-4">
          <div class="mb-2">
            <div class="card p-2 " ">
              <div class="row">
                <div class="col-sm-4 text-center">
                  <img src="${item.avatar}" class="user-card-img" data-toggle="modal" data-target="#name-card" data-id="${item.id}" alt="Img">
                  <h6 class="info mt-3" >${item.region},  ${item.age}</h6>
                </div>
                <div class="status col-sm-8 d-flex align-items-center">
                  <em>LIVE</em>
                  <h6 class="viewers">Viewers : ${Math.floor(Math.random()*10000)}</h6>            
                </div>
              </div>
            </div>
            <div class="card-footer d-flex justify-content-between align-items-center" id="user-card-name">
              <h6>${item.name} ${item.surname}</h6>
              <button class="btn btn-add-follow" type="button" data-id="${item.id}"><i class="bi bi-heart-fill"></i></button>
            </div>
          </div>
        </div>
        `;
  });

  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
  paginator.children[JSON.parse(localStorage.getItem('currentPage')) - 1].classList.add('active')
}

function addToFavorite(id) {

  const list = JSON.parse(localStorage.getItem('followingChannels')) || []
  let username = names.find( e => e.id===id )

  if (list.some( e => e.id===id )) {
    return alert('You are already following this channel !!!')
  }
  alert(`You're now following ${username.name}'s channel!!!`)
  list.push(username)
  localStorage.setItem('followingChannels', JSON.stringify(list))
}

function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : names
  const startIndex = (page - 1) * USERS_PER_PAGE

  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
  
}

function showUserModal(id) {
  const modalName = document.querySelector("#user-modal-name");
  const modalImage = document.querySelector("#user-modal-image");
  const modalGender = document.querySelector("#user-modal-gender");
  const modalAge = document.querySelector("#user-modal-age");
  const modalBirthday = document.querySelector("#user-modal-birthday");
  const modalRegion = document.querySelector("#user-modal-region");
  const modalEmail = document.querySelector("#user-modal-email");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data;
    modalName.innerText = data.name + " " + data.surname;
    modalGender.innerText = `Gender : ${data.gender}`;
    modalAge.innerText = `Age : ${data.age}`;
    modalBirthday.innerText = `Birthday : ${data.birthday}`;
    modalEmail.innerText = `Email : ${data.email}`;
    modalRegion.innerText = `Region : ${data.region}`;
    modalImage.innerHTML = `<img src=${data.avatar} class="card-img-top" alt="user-img" class="img-fluid">`;
  });
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.user-card-img')) {
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.bi-heart-fill')) {
    event.target.parentElement.classList.toggle('btn-add-follow-after')
    addToFavorite(Number(event.target.parentElement.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredUsers = names.filter( e => 
    e.name.toLowerCase().includes(keyword) || e.surname.toLowerCase().includes(keyword)
  )

  if (filteredUsers.length === 0) {
    return alert('No results')
  }
  
  renderPaginator(filteredUsers.length)
  renderNameList(getUsersByPage(1))
})

paginator.addEventListener('click', function onPaginationClicked(event) {

  if (event.target.tagName !== 'A') return
  document.querySelectorAll('.page-item').forEach( e => {
    if (e.classList.contains('active')) {
      e.classList.remove('active')
    }
  })
  event.target.parentElement.classList.add('active')
  const page = Number(event.target.dataset.page)

  renderNameList(getUsersByPage(page))
  currentPage = page
  localStorage.clear()
  localStorage.setItem('currentPage', JSON.stringify(currentPage))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    names.push(...response.data.results);
    renderPaginator(names.length)
    renderNameList(getUsersByPage(JSON.parse(localStorage.getItem('currentPage'))));
  })

  .catch((err) => console.log(err));