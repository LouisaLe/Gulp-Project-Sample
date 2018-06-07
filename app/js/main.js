/* globals getInternetExplorerVersion:true */
/* globals isMobile:true */

jQuery(function ($) {
    'use strict';
    var win = $(window);

    // Get browser information and add corresponding class for tag HTML
    function initBrowserInfo() {
        var $el = $('html');
        if ($.browser.msie) {
            if (parseInt($.browser.version) >= 10) {
                $el.addClass('ie10');
            } else if (parseInt($.browser.version) === 9) {
                $el.addClass('ie9');
            } else if (parseInt($.browser.version) <= 8) {
                $el.addClass('ie8');
            }
        } else if ($.browser.trident) {
            var i = 'ie' + getInternetExplorerVersion();
            $el.addClass(i);
        }

        if ($.browser.safari) {
            $el.addClass('safari');
        }
        if ($.browser.chrome) {
            $el.addClass('chrome');
        }
        if (isMobile.phone) {
            $el.addClass('mode-phone');
            if (isMobile.apple.device) {
                $el.addClass('mode-iOS');
                var _ver = iOSVersion();
                if(!isNaN(parseInt(_ver))){
                    $el.addClass('iOS-'+parseInt(_ver));
                }
                if (isMobile.apple.phone) {
                    $el.addClass('mode-iPhone');
                }
            }
            if (isMobile.android.device) {
                $el.addClass('mode-Android');
            }
        } else if (isMobile.tablet) {
            $el.addClass('mode-tablet');
            if (isMobile.apple.tablet) {
                $el.addClass('mode-iPad');
            }
            if (isMobile.android.device) {
                $el.addClass('mode-Android');
            }
        } else {
            $el.addClass('mode-desktop');
        }
    }

    // function check connection speed
    function checkConnectionSpeed(callback) {
        var _xhr = new XMLHttpRequest;
        var _randomNum = Math.round(Math.random() * 10000);
        _xhr.open('get', window.location.origin + window._path.root + window._path.images + '/upload/check_connection.jpg?v=' + _randomNum, true);
        var _time = new Date();
        _xhr.onreadystatechange = function () {
            if (_xhr.readyState != 4) return;
            var _length = _xhr.getResponseHeader("Content-Length"),
                _timeDone = new Date(),
                _speed;
            _speed = (_length * 8 / (1024 * 1024)) / ((_timeDone - _time) / 1000);
            console.log(_speed + ' Mbps');
            callback(_speed);
        };
        _xhr.send();
    }

    // check is first time user visit?
    function isFirstTimeVisit() {
        var _isFirstTimeVisit = false;
        if (localStorage.getItem("time_visit") == null) {
            _isFirstTimeVisit = true;
        }
        localStorage.setItem("time_visit", new Date());
        return _isFirstTimeVisit;
    }   
    //window._updateAllButtonColorFav = updateAllButtonColorFav;

    $(document).ready(function () {
        window.scrollTo(0, 0);
        console.log("I am ready!!");
        var isSlick = false;
        var listSlick = $('.slick-wrapper');
        if (listSlick.length === 1 ) {
            $('.slick-wrapper').children().length > 1 ? isSlick = true : isSlick = false;
            if (isSlick) {
                $('.slick-wrapper').slick({
                    autoplay: true,
                    autoplaySpeed: 10000,
                    dots: true
                });
            }
            
        } else if (listSlick !== 0) {
            
            for (var i = 0; i < listSlick.length; i++) {
                $(listSlick[i]).children().length > 1 ? isSlick = true : isSlick = false;
                if (isSlick) {
                    $(listSlick[i]).slick({
                        autoplay: true,
                        autoplaySpeed: 3000,
                        dots: true
                    });
                }
                
            }
        }

        $("#findow-button").on('click',function() {
            var _h = $('#header').outerHeight();
            $('html, body').animate({
                'scrollTop' : $("[data-next-srcoll]").position().top - _h*2
            },1000);
        });

        $("#back-to-top").on('click',function() {
            $('html, body').animate({
                'scrollTop' : 0
            },1000);
        });

        

        fixedMenu();
        
    });

    $(window).on('load', function (e) {
        window.scrollTo(0, 0);
    });

    function fixedMenu() {
        var _header = $('#header');
        var _h = _header.outerHeight();
        $(window).scroll(function(){
            if ($(this).scrollTop() > _h) {
                if (!_header.hasClass('fixed')) {
                    _header.addClass('fixed');
                }
            } else {
                if (_header.hasClass('fixed')) {
                    _header.removeClass('fixed');
                }
            }
        });
    }

});

