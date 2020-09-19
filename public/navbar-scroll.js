var prevScrollpos = window.pageYOffset;
var navBarBottom = document.getElementById("navbar-bottom");
if (navBarBottom) {
  window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
      navBarBottom.style.bottom = "0";
    } else {
      navBarBottom.style.bottom = "-50px";
    }
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      navBarBottom.style.bottom = "0";
  }
  
  
    prevScrollpos = currentScrollPos;
  }
  window.onclick = function() {
    navBarBottom.style.bottom = "0";
  }
}
