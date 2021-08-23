const video_div_admin = document.querySelector('#nvd')
const dbcount = +document.querySelector('#count').textContent;

if (dbcount > 0) {
    video_div_admin.style.display = 'none'
}
else {
    video_div_admin.style.display = 'block'
}