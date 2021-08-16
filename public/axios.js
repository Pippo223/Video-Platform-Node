const parentDiv = document.querySelector(".admin");
window.addEventListener("load", async () => {
  try {
    let result = await axios({
      method: "GET",
      url: "/admin/dashboard",
    });
    let files = result.data.files;

    files.forEach((file) => {
      markup = `
            <div class="files__entity">
            <i class="files__icon fa fa-file-text" aria-hidden="true"></i>
            <span class="files__date">Date created:- ${file.createdAt}</span>
            <a href="${file.name}" class="files__link"><i class="fa fa-eye tests__icon" aria-hidden="true"></i></a>
          </div>
        `;
    parentDiv.insertAdjacentHTML("beforeend", markup);
  });
} catch (error) {
  console.log(error);
}
});