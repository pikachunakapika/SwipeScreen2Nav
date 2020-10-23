// Based on https://github.com/totu/Swipe2Nav
// and uses modified
// https://gist.github.com/AlexEmashev/ee8302b5036b01362f63dab35948401f

(function ($) {
    $.fn.swipeDetector = function (options) {
      // States: 0 - no swipe, 1 - swipe started, 2 - swipe released
      var swipeState = 0;
      // Coordinates when swipe started
      var startX = 0;
      var startY = 0;
      // Distance of swipe
      var pixelOffsetX = 0;
      var pixelOffsetY = 0;
      // Target element which should detect swipes.
      var swipeTarget = this;
      var defaultSettings = {
        indicatorThreshold: 200,
        // Amount of pixels, when swipe don't count.
        swipeThreshold: 500,
      };
      
      var self = this;

      // Initializer
      (function init() {
        options = $.extend(defaultSettings, options);
        // Support touch and mouse as well.
        swipeTarget.on('mousedown touchstart', swipeStart);
        $('html').on('mouseup touchend', swipeEnd);
        $('html').on('mousemove touchmove', swiping);

        self.indicatorLeft = $("<div />").css({
            'position': 'fixed',
            'opacity': 0,
            'top': '50%',
            'left': '1%',
            'background': '#2d9df4',
            'width': '30pt',
            'height': '30pt',
            'border-radius': '15pt'

        }).appendTo($("body"));

        self.indicatorRight = $("<div />").css({
            'position': 'fixed',
            'opacity': 0,
            'top': '50%',
            'right': '1%',
            'background': '#2d9df4',
            'color': '#d0efff',
            'width': '30pt',
            'height': '30pt',
            'border-radius': '15pt'
        }).appendTo($("body"));

        self.indicatorRight.append($("<div />").css({
            "width": 0,
            "height": 0,
            "left": "50%",
            "top": "50%",
            "transform": "translate(-0.5pt, -50%)",
            "position": "relative",
            "border-top": "5pt solid transparent",
            "border-bottom": "5pt solid transparent",
            "border-left": "5pt solid #d0efff"
        }));

        self.indicatorLeft.append($("<div />").css({
            "width": 0,
            "height": 0,
            "left": "50%",
            "top": "50%",
            "transform": "translate(-3pt, -50%)",
            "position": "relative",
            "border-top": "5pt solid transparent",
            "border-bottom": "5pt solid transparent",
            "border-right": "5pt solid #d0efff"
        }));

      })();
      
      function swipeStart(event) {
        if (!event.originalEvent.touches)
          return;
        
        if (event.originalEvent.touches)
          event = event.originalEvent.touches[0];
        
        if (swipeState === 0) {
          swipeState = 1;
          startX = event.clientX;
          startY = event.clientY;
        }
        
        

      }
      
      function swipeEnd(event) {
        if (swipeState === 2) {
          swipeState = 0;
          
          if (Math.abs(pixelOffsetX) > Math.abs(pixelOffsetY) &&
             Math.abs(pixelOffsetX) > options.swipeThreshold) { // Horizontal Swipe
            if (pixelOffsetX < 0) {
              swipeTarget.trigger($.Event('swipeLeft.sd'));
              console.log('Left');
            } else {
              swipeTarget.trigger($.Event('swipeRight.sd'));
              console.log('Right');
            }
          } else if (Math.abs(pixelOffsetY) > options.swipeThreshold) { // Vertical swipe
            if (pixelOffsetY < 0) {
              swipeTarget.trigger($.Event('swipeUp.sd'));
              console.log('Up');
            } else {
              swipeTarget.trigger($.Event('swipeDown.sd'));
              console.log('Down');
            }
          }
        }

        self.swipeState = 0;
        self.startX = 0;
        self.startY = 0;
        self.pixelOffsetX = 0;
        self.pixelOffsetY = 0;
  
        self.indicatorLeft.animate({opacity: 0, 'margin-left': 0}, 400);
        self.indicatorRight.animate({opacity: 0, 'margin-right': 0}, 400);
    }
      
      function swiping(event) {
                
        if (event.originalEvent.touches) {
          event = event.originalEvent.touches[0];
        }
        
        var swipeOffsetX = event.clientX - startX;
        var swipeOffsetY = event.clientY - startY;
        
        if (swipeState === 1) 
            if ((Math.abs(swipeOffsetX) > options.swipeThreshold) ||
                (Math.abs(swipeOffsetY) > options.swipeThreshold)) {
            swipeState = 2;
            pixelOffsetX = swipeOffsetX;
            pixelOffsetY = swipeOffsetY;
            }

        var opacityLimitX = 200;
        var normalizedX = Math.abs(swipeOffsetX);
   
        if (Math.abs(pixelOffsetX) > options.indicatorThreshold) {

            if (normalizedX > opacityLimitX) {
                normalizedX = opacityLimitX;
            }
            var opacity = (normalizedX / opacityLimitX);
            var offsetX = Math.round(Math.abs(swipeOffsetX / 10));
            
            if (swipeOffsetX < 0) {
                self.indicatorLeft.css({'opacity': 0, 'margin-left': 0});
                self.indicatorRight.css({'opacity': opacity});        
                self.indicatorRight.css({'margin-right': offsetX + 'pt'});
            } else {
                self.indicatorRight.css({'opacity': 0, 'margin-left': 0});
                self.indicatorLeft.css({'opacity': opacity});        
                self.indicatorLeft.css({'margin-left': offsetX + 'pt'});
            }
        }

        
      }
      
      return swipeTarget; // Return element available for chaining.
    }
  
  }(jQuery));
  
// Enable addon functionality
const enableNav = function()
{
    if ($("body").hasClass("swipe-detector"))
        return;
    
    var message = $(".message");
    $("body")
    .addClass("swipe-detector") 
    .swipeDetector()
    .on("swipeLeft.sd swipeRight.sd swipeUp.sd swipeDown.sd", function(event) {
        if (event.type === "swipeLeft") {
            history.go(1);
        } else if (event.type === "swipeRight") {
            history.go(-1);
        } else if (event.type === "swipeUp") {
            // nothing
        } else if (event.type === "swipeDown") {
            window.location.reload();
        }
    });
}

enableNav();
// Just incase some pages are doing weird things
$(document).ready(function() {
    setTimeout(enableNav, 100);
});