const INDEX_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users/";
const names = JSON.parse(localStorage.getItem('followingChannels'))
const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector('#paginator')
const USERS_PER_PAGE = 20;
let filteredUsers = [];

function renderNameList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
    <div class="col-4 col-md-3 col-sm-4">
          <div class="mb-2">
            <div class="card p-2">
              <div class="row">
                <div class="col-sm-4 text-center">
                  <img src="${item.avatar}" class="user-card-img" data-toggle="modal" data-target="#name-card" data-id="${item.id}" alt="Img">
                  <h6 class="info mt-3" >${item.region},  ${item.age}</h6>
                </div>
                <div class="status col-sm-8 d-flex align-items-center">
                  <em>LIVE</em>
                  <h6 class="viewers">Viewers : ${Math.floor(Math.random() * 10000)}</h6>            
                </div>
              </div>
            </div>
            <div class="card-footer d-flex justify-content-between align-items-center" id="user-card-name">
              <h5>${item.name} ${item.surname}</h5>
              <button class="btn btn-un-follow" data-id="${item.id}">
                <i class="bi bi-person-x-fill" style="color:white;"></i>
              </button>
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
  paginator.firstChild.classList.add('active')
}

function addToFavorite(id) {
  console.log(id)
  const list = JSON.parse(localStorage.getItem('followingChannels')) || []
  let username = names.find(e => e.id === id)

  if (list.some(e => e.id === id)) {
    return alert('You are already following this channel !!!')
  }
  list.push(username)
  localStorage.setItem('followingChannels', JSON.stringify(list))
}

function removeFromFavorite (id) {
  if(!names) return
  const userIndex = names.findIndex((user) => user.id ===id)
  if (userIndex === -1) return
  names.splice(userIndex, 1) 
  localStorage.setItem('followingChannels', JSON.stringify(names))
  renderNameList(names)
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
    console.log('hi')
  } else if (event.target.matches('.bi-person-x-fill')) {
    removeFromFavorite(Number(event.target.parentElement.dataset.id))
  }
})


paginator.addEventListener('click', function onPaginationClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderNameList(getUsersByPage(page))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    renderPaginator(names.length)
    renderNameList(getUsersByPage(1));
  })

  .catch((err) => console.log(err));