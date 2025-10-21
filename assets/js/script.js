$(document).ready(function () {
  "use strict";
  // Scroll to top
  $("a[href='#top']").click(function () {
    $("html, body").animate({ scrollTop: 0 }, "slow");
    return false;
  });

  // Smooth scroll
  $('a.scroll-to').on('click', function (event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top - 50)
    }, 700);
    event.preventDefault();
  });

  $('.site-testimonial-item').on('mouseenter', function () {
    $('.site-testimonial-item').addClass('inactive');
    $(this).removeClass('inactive').addClass('active');
  });
  $('.site-testimonial-item').on('mouseleave', function () {
    $('.site-testimonial-item').removeClass('inactive');
    $('.site-testimonial-item').removeClass('active');
  });

});

// Toggle dropdown menu on mobile
document.addEventListener('DOMContentLoaded', () => {
  const menuItems = document.querySelectorAll('.nav-item.has-submenu');
  
  menuItems.forEach(menuItem => {
    const menuLink = menuItem.querySelector('.nav-link');
    const submenu = menuItem.querySelector('.submenu');
    
    if (menuLink && submenu) {
      menuLink.addEventListener('click', (e) => {
        const isMobile = window.matchMedia('(max-width: 991.98px)').matches;
        
        if (isMobile) {
          e.preventDefault();
          
          menuItems.forEach(otherMenuItem => {
            if (otherMenuItem !== menuItem) {
              const otherSubmenu = otherMenuItem.querySelector('.submenu');
              if (otherSubmenu) {
                otherSubmenu.classList.remove('open');
              }
            }
          });
          
          submenu.classList.toggle('open');
        }
      });
    }
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    const isMobile = window.matchMedia('(max-width: 991.98px)').matches;
    
    if (isMobile) {
      const clickedInsideMenu = e.target.closest('.nav-item.has-submenu');
      
      if (!clickedInsideMenu) {
        // Close all open submenus
        menuItems.forEach(menuItem => {
          const submenu = menuItem.querySelector('.submenu');
          if (submenu) {
            submenu.classList.remove('open');
          }
        });
      }
    }
  });
  
  // Close dropdowns when window is resized to desktop
  window.addEventListener('resize', () => {
    const isMobile = window.matchMedia('(max-width: 991.98px)').matches;
    
    if (!isMobile) {
      menuItems.forEach(menuItem => {
        const submenu = menuItem.querySelector('.submenu');
        if (submenu) {
          submenu.classList.remove('open');
        }
      });
    }
  });
});



$(window).on('scroll', function () {
  var windscroll = $(window).scrollTop();
  if (windscroll >= 100) {
    $('.site-navigation').addClass('nav-bg');
  } else {
    $('.site-navigation').removeClass('nav-bg');
  }
});

// Blocks certain e-mail domains
document.getElementById("email").addEventListener("input", function () {
  const blockedDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "gmx.de"];
  const emailInput = this.value;
  const emailDomain = emailInput.split("@")[1];

  if (emailDomain && blockedDomains.includes(emailDomain.toLowerCase())) {
    this.setCustomValidity("Please enter a company email.");
  } else {
    this.setCustomValidity("");
  }
});

//Adds http or https if user does not. 
document.getElementById("company-website").addEventListener("blur", function () {
  if (this.value && !this.value.startsWith("http://") && !this.value.startsWith("https://")) {
    this.value = "https://" + this.value;
  }
});

// Vercel analytics
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };






