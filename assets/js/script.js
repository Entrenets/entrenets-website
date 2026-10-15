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

// Service navigation supports pointer, keyboard, and mobile controls.
document.addEventListener('DOMContentLoaded', () => {
  const navigationToggle = document.querySelector('.navbar-toggler');
  const navigation = document.getElementById('sitenavbar');
  const mobile = window.matchMedia('(max-width: 991.98px)');
  let focusedControl = null;
  if (navigationToggle && navigation) {
    const navigationRoot = navigationToggle.closest('nav');
    // CSS can hide the focused control before the breakpoint event arrives.
    document.addEventListener('focusin', event => {
      focusedControl = navigationRoot.contains(event.target) ? event.target : null;
    });
    document.addEventListener('pointerdown', event => {
      if (!navigationRoot.contains(event.target)) focusedControl = null;
    });
    const setNavigationOpen = open => {
      navigation.classList.toggle('show', open);
      navigationToggle.classList.toggle('collapsed', !open);
      navigationToggle.setAttribute('aria-expanded', String(open));
    };
    navigationToggle.addEventListener('click', () => {
      setNavigationOpen(navigationToggle.getAttribute('aria-expanded') !== 'true');
    });
    navigation.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !event.defaultPrevented && mobile.matches
          && navigationToggle.getAttribute('aria-expanded') === 'true') {
        setNavigationOpen(false);
        navigationToggle.focus();
        event.preventDefault();
      }
    });
    mobile.addEventListener('change', () => {
      const focusInNavigation = navigation.contains(focusedControl);
      const focusOnToggle = focusedControl === navigationToggle;
      setNavigationOpen(false);
      if (mobile.matches && focusInNavigation) navigationToggle.focus();
      else if (!mobile.matches && focusOnToggle) navigation.querySelector('a, button')?.focus();
    });
  }
  const menus = document.querySelectorAll('.nav-item.has-submenu');

  menus.forEach(menu => {
    const toggle = menu.querySelector('button.menu-link');
    const submenu = menu.querySelector('.submenu');
    if (!toggle || !submenu) return;

    const setOpen = open => {
      submenu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('mouseenter', () => { if (!mobile.matches) setOpen(true); });
    menu.addEventListener('mouseleave', () => {
      if (!mobile.matches && !menu.contains(document.activeElement)) setOpen(false);
    });
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
        event.preventDefault();
      }
    });
    menu.addEventListener('focusout', () => {
      window.setTimeout(() => { if (!menu.contains(document.activeElement)) setOpen(false); }, 0);
    });
    document.addEventListener('click', event => {
      if (!menu.contains(event.target)) setOpen(false);
    });
    mobile.addEventListener('change', () => {
      if (submenu.contains(focusedControl)) toggle.focus();
      setOpen(false);
    });
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

// Vercel analytics
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };





