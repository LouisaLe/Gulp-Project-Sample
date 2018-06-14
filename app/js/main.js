/* globals getInternetExplorerVersion:true */
/* globals isMobile:true */

jQuery(function ($) {
    'use strict';
    var win = $(window);

    $(document).ready(function () {
        $(this).scrollTop();
        console.log('top'+$(this).scrollTop());
        i
        var _html =  $('html');
        // _html.addClass('overflow-hidden');

        setHeightVideo();

        var isSlick = false;
        var listSlick = $('.slick-wrapper');
        if (listSlick.length === 1 ) {
            $('.slick-wrapper').children().length > 1 ? isSlick = true : isSlick = false;
            if (isSlick) {
                $('.slick-wrapper').slick({
                    autoplay: true,
                    autoplaySpeed: 3000,
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
        setTimeout(function(){
            $('.section-video').find('.content-text-border').addClass('w3-animate-top');
            $('.section-video').addClass('visitted');
        },1000);
        
        $("#findow-button").on('click',function(e) {

            var _h = $('#header').outerHeight();

            // _html.removeClass('overflow-hidden');

            $('html, body').animate({
                'scrollTop' : $("[data-next-srcoll]").position().top - _h
            },1000);

            setTimeout(function(){
                $('.section-one').addClass('visitted').find('.content-text').addClass('w3-animate-left');
            },1250);
        });

        $("#back-to-top").on('click',function() {
            $('html, body').animate({
                'scrollTop' : 0
            },1000);
        });

        $('#header .item-social-network').on('click', function(e){
            e.preventDefault();
            var _el = $(this);
            _el.siblings('.social-tools').toggleClass('full-width');
        });

        addTextAmination();

        fixedMenu();

        if (win.outerWidth() > 751) {
            return false;
        } else {
            $('.mobile-menu').on('click', function(){
                if (!$(this).parent().hasClass('active')) {
                    var _leftSocialTool = (win.outerWidth() - 300)/2;
                    $(this).find('.social-tools').css({
                        'left':_leftSocialTool
                    });
                    $('html').addClass('overflow-hidden');
                    $(this).siblings('.menu-border').css({
                        'height': win.outerHeight()
                    });
                    $(this).parent().addClass('active');
                } else {
                    $(this).parent().removeClass('active');
                    $('html').removeClass('overflow-hidden');
                }
                
            })
        }
        
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

    function addTextAmination() {
        var s1 = $('.section-one');
        var s2 = $('.section-two');
        var s3 = $('.section-three');
        var s4 = $('.section-four');
        
        $(window).scroll(function(){
            var wS = $(this).scrollTop();

            if ((wS + s1.outerHeight()/2) > s1.offset().top && (!s1.hasClass('visitsed'))) {
                s1.addClass('visitted').find('.content-text-border').addClass('w3-animate-left');
            }
            if ((wS + s2.outerHeight()/2) > s2.offset().top && (!s2.hasClass('visitsed'))) {
                s2.addClass('visitted').find('.content-text-border').addClass('w3-animate-right');
            }
            if ((wS + s3.outerHeight()/2)> s3.offset().top && (!s3.hasClass('visitted'))) {
                s3.addClass('visitted').find('.content-text-border').addClass('w3-animate-right');
            }
            if ((wS + s4.outerHeight()/2) > s4.offset().top && (!s4.hasClass('visitted'))) {
                s4.addClass('visitted').find('.content-text-border').addClass('w3-animate-left');
            }
        });
    }

    function setHeightVideo() {
        var _video = $('.video');
        var _wVideo = _video.outerWidth();
        var _hVideo = _wVideo*0.666;
        
        _video.css({
            'height': _hVideo
        });
    }

});

