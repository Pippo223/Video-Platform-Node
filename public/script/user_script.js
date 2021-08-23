 //Handle the behaviours of next and previous buttons
 const nextbtn = document.querySelector('#next');
 const prevbtn = document.querySelector('#prev');
 const btnHover = document.getElementById('c-l-btn');
 let noVideosDisplay = document.createElement('div')
 const video_div = document.querySelector('.video-div')


 let counter = +document.querySelector('#counter').textContent;
 const dbcount = +document.querySelector('#count').textContent;

  if(dbcount === 0) {
      noVideosDisplay.setAttribute('class', 'nvd')
     noVideosDisplay.innerHTML = 'No video uploaded by admin'
     video_div.appendChild(noVideosDisplay)
   
  }

console.log('counter '+ counter)
console.log('dbcount '+ dbcount)

 if(counter+1 >= dbcount)
 {
     nextbtn.style.display = 'none'
 }

 if(counter <= 0)
 {
     prevbtn.style.display = 'none'
 }

 nextbtn.addEventListener('click', getNextVideo)
 prevbtn.addEventListener('click', getPreviousVideo)

 function getNextVideo(){
     counter++;
     let url = 'http://localhost:3000/increment';
     let data = {data: counter}
     $.post(url, data, (data, status) => {

     })

     location.reload()
 }
 
 
 function getPreviousVideo() {
     counter--;
     let url = 'http://localhost:3000/decrement';
     let data = {data: counter}
     $.post(url, data, (data, status) => {
         
     })

     location.reload()   
 }

 btnHover.addEventListener('mouseover', outFunc)
 btnHover.addEventListener('click', copyLink)

 function copyLink() {
     let copyText = document.getElementById("copy-link");
         copyText.select();
         copyText.setSelectionRange(0, 99999);
         navigator.clipboard.writeText(copyText.value);

     let tooltip = document.getElementById("myTooltip");
     tooltip.innerHTML = "Copied";
     tooltip.style.visibility = 'visible'
 }

 function outFunc() {
 let tooltip = document.getElementById("myTooltip");
 tooltip.style.visibility = 'visible'
 }


