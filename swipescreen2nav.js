// Based on https://github.com/totu/Swipe2Nav
// and uses modified
// https://gist.github.com/AlexEmashev/ee8302b5036b01362f63dab35948401f

(function ($) {
  $.fn.swipeDetector = function (options) {
    /* 
      States: 
          0 - no swipe, 
          1 - touch down, 
         10 - swiped horz
        100 - swiped horz action
       1000 - swipe vert
      10000 - swipe vert action 
      
      */

    const STATE_NONE = 0;
    const STATE_DOWN = 1;
    const STATE_HORZ = 1 << 1;
    const STATE_HORZ_ACTION = 1 << 2;
    const STATE_VERT = 1 << 3;
    const STATE_VERT_ACTION = 1 << 4;

    const COLOR_BRIGHT = '#e0e0e0';
    const COLOR_DARK = '#2d9df4';

    var swipeState = STATE_NONE;

    // Coordinates when swipe started
    var startX = 0;
    var startY = 0;
    // Distance of swipe
    var pixelOffsetX = 0;
    var pixelOffsetY = 0;
    // Target element which should detect swipes.
    var swipeTarget = this;

    var defaultSettings = {
      swipeActionThreshold: 300,
      indicatorThreshold: 50,
      swipeThreshold: 50,
    };

    var self = this;

    // Initializer
    (function init() {
      options = $.extend(defaultSettings, options);
      // Support touch and mouse as well.
      $('html').on('mousedown touchstart', swipeStart);
      $('html').on('mouseup touchend', swipeEnd);
      $('html').on('mousemove touchmove', swiping);

      self.indicatorLeft = $('<div />').css({
        'position': 'fixed',
        'opacity': 0,
        'top': '50%',
        'left': '1%',
        'background-color': '#2d9df4',
        'width': '30pt',
        'height': '30pt',
        'border-radius': '15pt'

      }).appendTo($('body'));


      self.indicatorRight = $('<div />').css({
        'position': 'fixed',
        'opacity': 0,
        'top': '50%',
        'right': '1%',
        'background-color': COLOR_BRIGHT,
        'width': '30pt',
        'height': '30pt',
        'border-radius': '15pt'
      }).appendTo($('body'));

      self.rightArrow = $('<div />').css({
        'width': 0,
        'height': 0,
        'left': '50%',
        'top': '50%',
        'transform': 'translate(-0.5pt, -50%)',
        'position': 'relative',
        'border-top': '5pt solid transparent',
        'border-bottom': '5pt solid transparent',
        'border-left': '5pt solid ' + COLOR_DARK
      });

      self.leftArrow = $('<div />').css({
        'width': 0,
        'height': 0,
        'left': '50%',
        'top': '50%',
        'transform': 'translate(-3pt, -50%)',
        'position': 'relative',
        'border-top': '5pt solid transparent',
        'border-bottom': '5pt solid transparent',
        'border-right': '5pt solid ' + COLOR_DARK
      });

      self.indicatorRight.append(self.rightArrow);

      self.indicatorLeft.append(self.leftArrow);

    })();

    function swipeStart(event) {

      if (event.originalEvent.touches)
        event = event.originalEvent.touches[0];

      if (swipeState === STATE_NONE) {
        swipeState |= STATE_DOWN;
        startX = event.clientX;
        startY = event.clientY;
      }
    }

    function swipeEnd(event) {

      if (swipeState & STATE_HORZ_ACTION) {

        if (pixelOffsetX < 0) {
          swipeTarget.trigger($.Event('swipeLeft.sd'));
          console.log('Left');
        } else {
          swipeTarget.trigger($.Event('swipeRight.sd'));
          console.log('Right');
        }

      } else if (swipeState & STATE_VERT_ACTION) {

        if (pixelOffsetY < 0) {
          swipeTarget.trigger($.Event('swipeUp.sd'));
          console.log('Up');
        } else {
          swipeTarget.trigger($.Event('swipeDown.sd'));
          console.log('Down');
        }
      }

      reset();
    }

    function reset() {
      swipeState = STATE_NONE;
      startX = 0;
      startY = 0;
      pixelOffsetX = 0;
      pixelOffsetY = 0;

      self.indicatorLeft.animate({ opacity: 0, 'margin-left': 0 }, 400, 'swing', function () {
        self.leftArrow.css({ 'border-right-color': COLOR_DARK });
        self.indicatorLeft.css({ 'background-color': COLOR_BRIGHT });
      });

      self.indicatorRight.animate({ opacity: 0, 'margin-right': 0 }, 400, 'swing', function () {
        self.rightArrow.css({ 'border-left-color': COLOR_DARK });
        self.indicatorRight.css({ 'background-color': COLOR_BRIGHT });
      });
    }

    function swiping(event) {

      if (!(swipeState & STATE_DOWN))
        return;

      
      if (event.changedTouches.length > 1) {
        reset();
        return;
      }

      if (event.originalEvent.touches) {
        event = event.originalEvent.touches[0];
      }

      var swipeOffsetX = event.clientX - startX;
      var swipeOffsetY = event.clientY - startY;

      pixelOffsetX = swipeOffsetX;
      pixelOffsetY = swipeOffsetY;

      if (Math.abs(swipeOffsetX) > options.swipeThreshold && !(swipeState & STATE_VERT)) {
        swipeState |= STATE_HORZ;
        if (Math.abs(swipeOffsetX) > options.swipeActionThreshold) {
          swipeState |= STATE_HORZ_ACTION;
        } else {
          swipeState &= ~STATE_HORZ_ACTION; 
        }
      }

      if (Math.abs(swipeOffsetY) > options.swipeThreshold && !(swipeState & STATE_HORZ)) {
        swipeState |= STATE_VERT;
        if (Math.abs(swipeOffsetY) > options.swipeActionThreshold) {
          swipeState |= STATE_VERT_ACTION;
        } else {
          swipeState &= ~STATE_VERT_ACTION;
        }
      }

      if (!(swipeState & STATE_VERT)) {

        var opacityLimitX = 200;
        var normalizedX = Math.abs(swipeOffsetX);

        if (Math.abs(pixelOffsetX) > options.indicatorThreshold) {

          if (normalizedX > opacityLimitX) {
            normalizedX = opacityLimitX;
          }
          var opacity = (normalizedX / opacityLimitX);
          var offsetX = Math.round(Math.abs(swipeOffsetX / 10));

          if (swipeOffsetX < 0) {
            self.indicatorLeft.css({ 'opacity': 0, 'margin-left': 0 });
            self.indicatorRight.css({ 'opacity': opacity });
            self.indicatorRight.css({ 'margin-right': offsetX + 'pt' });
          } else {
            self.indicatorRight.css({ 'opacity': 0, 'margin-left': 0 });
            self.indicatorLeft.css({ 'opacity': opacity });
            self.indicatorLeft.css({ 'margin-left': offsetX + 'pt' });
          }

          if (Math.abs(pixelOffsetX) > options.swipeActionThreshold) {

            self.rightArrow.css({ 'border-left-color': COLOR_BRIGHT });
            self.leftArrow.css({ 'border-right-color': COLOR_BRIGHT });
            self.indicatorRight.css({ 'background-color': COLOR_DARK });
            self.indicatorLeft.css({ 'background-color': COLOR_DARK });

          } else {
            self.rightArrow.css({ 'border-left-color': COLOR_DARK });
            self.leftArrow.css({ 'border-right-color': COLOR_DARK });
            self.indicatorRight.css({ 'background-color': COLOR_BRIGHT });
            self.indicatorLeft.css({ 'background-color': COLOR_BRIGHT });
          }

        }
      }


    }

    return swipeTarget; // Return element available for chaining.
  }

}(jQuery));

// Enable addon functionality
const enableNav = function () {
  if ($('body').hasClass('swipe-detector'))
    return;

  var message = $('.message');
  $('body')
    .addClass('swipe-detector')
    .swipeDetector()
    .on('swipeLeft.sd swipeRight.sd swipeUp.sd swipeDown.sd', function (event) {
      if (event.type === 'swipeLeft') {
        history.go(1);
      } else if (event.type === 'swipeRight') {
        history.go(-1);
      } else if (event.type === 'swipeUp') {
        // nothing
      } else if (event.type === 'swipeDown') {
        //window.location.reload();
      }
    });
}

enableNav();
// Just incase some pages are doing weird things
$(document).ready(function () {
  setTimeout(enableNav, 100);
});