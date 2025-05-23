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





