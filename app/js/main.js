/* globals getInternetExplorerVersion:true */
/* globals isMobile:true */

jQuery(function ($) {
    'use strict';
    var win = $(window);

    var footer,
        header,
        windowWidth,
        windowHeight,
        viewPort,
        apiUpdateFavoriteItem = '/CustomApi/ContentApi/UpdateFavorite',
        apiGetAllFavoriteItem = '/CustomApi/ContentApi/GetFavoritesByUserKey',
        apiCountFavorite = '/CustomApi/ContentApi/CountFavorite',
        apiLogin = '/CustomApi/ContentApi/Login';

    window._isDev = false;
    window._userKey = null;
    window._favColorItems = [];
    window._favProductItems = [];
    window._isStorageAvailable = storageAvailable('localStorage');

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

    // Setup main menu
    function initMainMenu() {
        var _btnMenu = $('#btnMenu'),
            _menu = $('.main-menu');
        _btnMenu.bind('click', function (e) {
            if (window.innerWidth > 750) return;
            if (_btnMenu.hasClass('active')) {
                _btnMenu.removeClass('active');
                _menu.slideUp(300, function () {
                    $('html').removeClass('open-menu');
                });
            } else {
                _btnMenu.addClass('active');
                _menu.slideDown(300, function () {
                    $('html').addClass('open-menu');
                });
            }
        });

        // Show sub menu when hover on main navigation
        var _mainNav = $('#navMenu');
        _mainNav.on('mouseenter', '.dropdown', function (e) {
            if ($('html').hasClass('mode-desktop')) {
                if (window.innerWidth > 750) {
                    _mainNav.find('.dropdown.open').removeClass('open');
                    $(this).addClass('open');
                }
            }
        }).on('mouseleave', '.dropdown', function (e) {
            if ($('html').hasClass('mode-desktop')) {
                if (window.innerWidth > 750) {
                    $(this).removeClass('open');
                }
            }
        });

        _mainNav.on('click', '.dropdown > a', function (e) {
            if (window.innerWidth > 750 && !$('html').hasClass('mode-tablet')) return false;
        });

        // Search form focus: comment because https://jira.splashinteractive.sg/browse/PPGMM-980
        $('#dropdownMenuSearch').bind('click', function () {
            var _$t = $(this),
                _s = _$t.next();
            setTimeout(function () {
                _$t.next().find('.form-control').focus();
                if(_s.css('z-index')!=-1){
                    $('html').addClass('open-search');
                }else{
                    $('html').removeClass('open-search');
                }
            }, 300);
        });
        // https://jira.splashinteractive.sg/browse/PPGMM-980
        // $('#dropdownMenuSearch').bind('click', function () {
        //    window.open(window.location.protocol + '//' + window.location.host + '/search'); 
        // });
        $('.ico-search-input').on('click', function (e) {
            e.preventDefault();
            var el = $(this),
                form = el.parent(),
                value = form.find('input').val();
            if (value !== '') {
                window.open(window.location.protocol + '//' + window.location.host + '/search-results?key='+value+''); 
            }
        });
        $('.form-search input').on('keypress', function (e) {
            var key = e.which;
            if (key === 13) {
                if (navigator.userAgent.indexOf('MSIE') > 0 || navigator.userAgent.indexOf('Trident') > 0) {
                    $('.ico-search-input').trigger('click');
                }
                $(this).blur();
            }
        });
        $('#searchMenu').find('.dropdown').on('hide.bs.dropdown',function(){
            $('html').removeClass('open-search');
        });

        // Avoid scrolling when search top opening
        $('.overlay-search').on('touchmove',function(e){
            e.preventDefault();
        });
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

    // Setup on top video
    function initOnTopVideo() {
        var _videoSources = $('.banner-video-wrapper input[type="hidden"]'),
            _el = $('.banner-video-wrapper'),
            _src,
            _video,
            _skip;
        if (_videoSources.length) {
            _video = $('<video autoplay></video>');
            if (isFirstTimeVisit()) {
                _src = _videoSources[0].value;
            } else {
                var _intVideo = getRandomInt(0, _videoSources.length - 1);
                _src = _videoSources[_intVideo].value;

                _skip = $('<a class="skip" title="跳过视频" href="javascript:;">跳过视频 &gt;</a>');
                if (window.innerWidth < 1200) {
                    _skip.css({
                        'top': $('.top-slide-wrapper').height()-200
                    });
                }else {
                    _skip.css({
                        'top': window.innerHeight-200
                    });
                }
                if(_el.height()+$('#header').height()>=window.innerHeight){
                    _skip.css({
                        'top': 'auto'
                    });
                }
                // console.log( $('.top-slide-wrapper').height());
            }
            _video.attr('src', _src);
            _el.css('height', $('.top-slide-wrapper li').height()).append(_video);
            _video.get(0).onloadstart = function(){
                setTimeout(function(){
                    if(_el.height()>=window.innerHeight){
                        _el.css('height', window.innerHeight)
                    }
                },600);
            };
            
            if (_skip != null) {
                _el.append(_skip);
            }
            if(window._homeBanner!==undefined)window._homeBanner.stopAuto();
            _video[0].addEventListener("ended", function () {
                _el.fadeOut(300);
                if(window._homeBanner!==undefined){
                    setTimeout(function () {
                        window._homeBanner.startAuto();
                    }, 3000);
                }
            }, true);
            _el.on('click', '.skip', function (e) {
                _video[0].pause();
                _el.fadeOut(300);
                if(window._homeBanner!==undefined)window._homeBanner.startAuto();
                setTimeout(function(){
                    window._homeBanner.reloadSlider();
                },100);
            });
        }
    }

    function initIconMHtml(){
        // var _slides = $('.banner-slider').children();
        //desktop slides
        var _slides_desktop = $('.banner-slider').children('.slide-desktop');
        var _slides_mobile = $('.banner-slider').children('.slide-mobile');
        var _pa_desktop = $('.ico-m.hidden-phone');
        var _pa_mobile = $('.ico-m.visible-phone');
        var pre_html_icon_m = '';
        var temp_html = '';

        // We need render for both as the same time because it need support responsive mean user can resize to change the viewport
        //if(window.innerWidth>750){
            _slides_desktop.each(function(index){
                var html_icon_m = $(_slides_desktop[index]).find('.ico-m').html();
                if (index == 0){
                    pre_html_icon_m = '<div class="after-icon icon-0 active">' + html_icon_m + '</div>';
                } else {
                    pre_html_icon_m = '<div class="after-icon icon-' + index + '">' + html_icon_m + '</div>';
                }
                temp_html +=  pre_html_icon_m;
            });
            _pa_desktop.append(temp_html);
        //} else {
            //mobile slides
            pre_html_icon_m='';
            temp_html = '';
            _slides_mobile.each(function(index){
                var html_icon_m = $(_slides_mobile[index]).find('.ico-m').html();
                if (index == 0){
                    pre_html_icon_m = '<div class="after-icon icon-0 active">' + html_icon_m + '</div>';
                } else {
                    pre_html_icon_m = '<div class="after-icon icon-' + index + '">' + html_icon_m + '</div>';
                }
                temp_html +=  pre_html_icon_m;
            });
            _pa_mobile.append(temp_html);

        //}
    }

    // Setup home top banner
    function initHomeBanner() {
        var touchDevice = true;
        if (navigator.userAgent.indexOf('MSIE') > 0 || navigator.userAgent.indexOf('Trident') > 0) {
            touchDevice = false;
        }
        initSourceHomeBanner();
        var time = 0;
        var _ul = $('#topBanner');

        if (windowWidth > 751) {
            _ul.children('.slide-desktop');
        } else {
            _ul.children('.slide-mobile');
        }
        changePoster(_ul);

        if (_ul.children().length == 1) {
            if (windowWidth < 751) {
                _ul.css({'padding-bottom': 50});
            } else {
                _ul.css({'padding-bottom': 80});
            }
            $('#topBanner .slider-item').css({'width': '100%'});
            afterIconShow(0);
        } else if (_ul.children().length > 1) {
            window._homeBanner = _ul.bxSlider({
                auto: true,
                autoStart: true,
                pause: 5000,
                touchEnabled: touchDevice,
                adaptiveHeight: true,
                onSliderLoad: function (i) {
                    afterIconShow(0);
                    var _video = _ul.children('.video').find('video');
                    _ul.children('.video').on('click', '.btn-play', function (e) {
                        var _this = $(this);
                        _this.parent().children('video').get(0).play();
                        if (!$('html').hasClass('mode-iPhone')) {
                            _this.addClass('hide');
                        }
                        _this.parent().children('video').addClass('play');
                        if ($('html').hasClass('mode-desktop')) {
                           _this.hide(); 
                        }
                        window._homeBanner.stopAuto();
                    });
                    _video.on('click', function () {
                        var el = $(this),
                            parent = el.parent();

                        if (el.hasClass('play')) {
                            el.get(0).pause();
                            el.removeClass('play');
                            parent.find('span').removeClass('hide');
                        }
                    });
                    _video.each(function (i, x) {
                        x.addEventListener("ended", function () {
                            window._homeBanner.startAuto();
                            window._homeBanner.goToNextSlide();
                            x.load();
                            $(x).parent().find('.btn-play').show();
                        }, true);
                        if ($(window).width() > 750) {
                            $(x).height($('#topBanner .slider-item').find('img').eq(0).height());
                        } else {
                            $(x).height($(window).width() * 1000/750);
                        }
                    });
                    setTimeout(function () {
                        var bxviewPort = $('.top-slide-wrapper .bx-viewport');
                        bxviewPort.css('min-height', $(bxviewPort.find('video')[0]).height() + parseFloat(bxviewPort.css('padding-bottom')));
                    }, 1350);
                    
                },
                onSlideAfter: function ($slideElement, oldIndex, newIndex) {
                    window._homeBanner.startAuto();
                    var _video = _ul.children('.video').find('video');
                    _video.each(function (i, x) {
                        $(x).parent().find('.btn-play').show();
                        if ($(window).width() > 750) {
                            $(x).height($('#topBanner .slider-item').find('img').eq(0).height());
                        } else {
                            $(x).height($(window).width() * 1000/750);
                        }
                        if ($('html').hasClass('mode-desktop') || $('html').hasClass('mode-Android')) {
                            x.pause();
                            $(x).parent().find('span').removeClass('hide');
                        }
                    });
                    afterIconShow(newIndex);
                }
            });
        }
    }

    function initSourceHomeBanner(){
        var _ul = $('#topBanner'),
            _ulSrc= $('#topBannerData'),
            _lis;

        _ulSrc.children().each(function (i, x) {
            var img = $(x).find('img');
            if (img.length) {
                $(x).css('background-image', 'url("' + img.attr('src') + '")');
            }
        });

        if(window.innerWidth>750){
            _lis = _ulSrc.children('.slide-desktop').clone();
        }else{
            _lis = _ulSrc.children('.slide-mobile').clone();
        }
        _ul.html(_lis);
    }

    // Function for layout/behavior of section home - voice of color
    function initVoiceOfColor() {
        var _el = $('#voiceColor'),
            _img = _el.find('.img img'),
            _item = _el.find('.voice-color-item'),
            _desc = _el.find('.voice-color-list-desc'),
            _info = _el.find('.voice-color-list-info');
        _el.css('background-image', 'url(' + _img[0].src + ')');

        _el.on('click', '.voice-color-item a', function (e) {
            e.preventDefault();
            var _$t = $(this);
            if (!_$t.parent().hasClass('active')) {
                _item.removeClass('active');
                _$t.parent().addClass('active');
                _el.css('background-color', _$t.data('color'));
                _desc.text(_$t.data('desc'));
                _info.html('<a href="' + _$t.attr('href') + '" title="' + _$t.data('info') + '" target="_blank">' + _$t.data('info') + '</a>');
            }
        });

        var i = Math.floor(_item.length / 2);
        $(_item[i]).find('a').click();
    }

    // init slider for season color section
    function initSeasonColorSlider() {
        var _ul = $('#seasonColorSlider');
        if (_ul.children().length > 1) {
            _ul.bxSlider({
                auto: true,
                autoStart: true,
                pause: 5000
            });
        }
    }

    // Setup footer accordion
    function initFooter() {
        footer.on('click', '.accordion-m-heading', function (e) {
            if (window.innerWidth <= 750) {
                var _$t = $(this);
                if (_$t.hasClass('active')) {
                    _$t.removeClass('active');
                    _$t.next().stop(true, true).slideUp(300, function () {
                        _$t.next().removeClass('open');
                    });
                } else {
                    var _el = $('#footer').find('.accordion-m-heading.active');
                    if (_el.length) {
                        _el.removeClass('active');
                        _el.next().stop(true, true).slideUp(300, function () {
                            _$t.next().removeClass('open');
                            _$t.addClass('active');
                            _$t.next().stop(true, true).slideDown(300, function () {
                                _$t.next().addClass('open');
                            });
                        });
                    } else {
                        _$t.addClass('active');
                        _$t.next().stop(true, true).slideDown(300, function () {
                            _$t.next().addClass('open');
                        });
                    }
                }
            }
        });
    }

    // Init for custom select
    function initSelect() {
        // $('.selectpicker').select2({
        //     minimumResultsForSearch: -1,
        //     placeholder: function () {
        //         $(this).data('placeholder');
        //     },
        //     maximumSelectionLength: parseInt($(this).data('max'))
        // });
        $('.selectpicker').each(function(i,x){
            $(x).select2({
                minimumResultsForSearch: -1,
                placeholder: function () {
                    $(x).data('placeholder');
                },
                maximumSelectionLength: parseInt($(x).data('max'))
            });
            setTimeout(function(){
                $('.select2-search__field[type="search"]').prop('disabled',true);
            },100);
        });
    }

    // Init for float Toolbar
    function initFloatToolbar() {
        $('body').on('click', '.float-toolbar .dropdown-menu .form', function (e) {
            e.stopPropagation();
        });
        $('body').on('click', '.float-toolbar .close', function (e) {
            var _$t = $(this);
            _$t.parents('.dropup').find('.tool-item').click();
            $('.overPlay').removeClass('over-play-active');
        });

        $('body').on('click','.overPlay',function(e){
            e.preventDefault();
            //e.stopPropagation();
            $(this).removeClass('over-play-active');
        });

        // Fix select2 inside a dropdown menu
        $('#floatToolbar').on("select2:unselect", function (e) {
            if (!e.params.originalEvent) {
                return
            }
            e.params.originalEvent.stopPropagation();
        });


        // $('body').on('click', '#btnColorSearch', function (e) {
        //     e.preventDefault();
        //     if ($('#color_number_toolbar').val() !== undefined && $('#color_number_toolbar').val().trim() !== '') {
        //         var _this = $(this),
        //             _url = _this.attr('href') + '#search=' + $('#color_number_toolbar').val()
        //         window.open(_url);
        //     }
        // });
    }

    // Trigger for video component
    function initCMSVideo() {
        // QQ cover format://puui.qpic.cn/qqvideo/0/{video_id}/0
        var videos = $('.video-item');

        videos.each(function(i,x){
            var $x = $(x),
                _img = $x.children('img');
            if(_img.length==0||_img.attr('data-option')=='image-empty'){
                var _video =$x.children('a').data('video'),
                    _qqId = '';
                if(_video.indexOf('v.qq.com')!=-1) _qqId = _video.substring(_video.lastIndexOf('/')+1).split('.html')[0];
                if(_img.length!=0){
                    if(_qqId!=''){
                        _img.attr('src','//puui.qpic.cn/qqvideo/0/'+_qqId+'/0');
                    }else{
                        var html = '<video src="'+_video+'" controls></video>';
                        $x.append(html);
                        var _video = $x.children('video').get(0);
                        _video.addEventListener('loadeddata', function(){
                            setTimeout(function(){
                                var canvas = document.createElement("canvas");
                                canvas.width = _video.videoWidth;
                                canvas.height = _video.videoHeight;
                                canvas.classList.add('canvas-cover');
                                $x.append(canvas);
                                var ctx = canvas.getContext("2d");
                                ctx.drawImage(_video, 0, 0);
                                _img.attr('src',canvas.toDataURL());
                            });
                        },false);
                        _video.addEventListener('ended', function(){
                            _video.currentTime = 0;
                            _video.pause();
                        },false);
                    }
                }else{
                    if(_qqId!=''){
                        _img = $('<img/>').attr('src','//puui.qpic.cn/qqvideo/0/'+_qqId+'/0').attr('alt','QQ video '+_qqId);
                        $x.prepend(_img);
                    }else{
                        var html = '<video src="'+_video+'" controls></video>';
                        $x.append(html);
                        var _video = $x.children('video').get(0);
                        _video.addEventListener('loadeddata', function(){
                            setTimeout(function(){
                                var canvas = document.createElement("canvas");
                                canvas.width = _video.videoWidth;
                                canvas.height = _video.videoHeight;
                                canvas.classList.add('canvas-cover');
                                $x.append(canvas);
                                var ctx = canvas.getContext("2d");
                                ctx.drawImage(_video, 0, 0);
                                _img = $('<img/>').attr('src',canvas.toDataURL()).attr('alt',_video);
                                $x.prepend(_img);
                            });
                        },false);
                        _video.addEventListener('ended', function(){
                            _video.currentTime = 0;
                            _video.pause();
                        },false);
                    }
                }
            }
        });

        $('.video-item').on('click', '.btn-play', function (e) {
            var $this = $(this),
                _video = $this.data('video');
            if(_video.indexOf('v.qq.com')!=-1){
                var _$t = $this.next('iframe');
                if (_$t.length == 0) {
                    var _qqId = _video.substring(_video.lastIndexOf('/')+1).split('.html')[0];
                    var html = '<iframe frameborder="0" width="750" height="422" src="//v.qq.com/iframe/player.html?vid=' + _qqId + '&tiny=0&auto=1" allowfullscreen></iframe>';
                    $this.parent().append(html);
                    _$t = $this.next('iframe');
                    _$t.css('opacity', '1');
                    _$t.on('load', function (e) {

                    });
                }
                $this.animate({'opacity': '0'}, 300);
            }else{
                var _$t = $this.next('video');
                if (_$t.length == 0) {
                    var html = '<video src="'+_video+'" controls></video>';
                    $this.parent().append(html);
                    _$t = $this.next('video');
                    _$t.css('opacity', '1');
                    _$t[0].addEventListener('loadeddata', function (e) {
                        _$t[0].play();
                    },false);
                    _$t[0].addEventListener('ended', function(){
                        _$t[0].currentTime = 0;
                        _$t[0].pause();
                        _$t.css('opacity', '0');
                        $this.animate({'opacity': '1'}, 300);
                    },false);
                }else{
                    _$t.css('opacity', '1');
                    _$t.get(0).play();
                    _$t[0].addEventListener('ended', function(){
                        _$t.css('opacity', '0');
                        $this.animate({'opacity': '1'}, 300);
                        // alert('video ended');
                    },false);
                }
                $this.animate({'opacity': '0'}, 300);
            }
        });
        if (!$('html').hasClass('mode-desktop')) {
            $('.video-item').each(function () {
                var el = $(this),
                    src = el.find('.btn-play').data('video'),
                    img = el.find('img').attr('src');
                if(src.indexOf('v.qq.com')!==-1){
                    var _qqId = src.substring(src.lastIndexOf('/')+1).split('.html')[0];
                    var html = '<iframe frameborder="0" width="750" height="422" src="//v.qq.com/iframe/player.html?vid=' + _qqId + '&tiny=0&auto=0" allowfullscreen style=""></iframe>';
                    el.append(html);
                    if (img.indexOf('qqvideo')!==-1) {
                        el.find('.btn-play').hide()
                          .end().find('iframe').css('opacity', '1');
                    }
                    el.on('click', function () {
                        el.find('.btn-play').hide();;
                        el.find('iframe').css('opacity', '1');
                    });
                } else {
                    var html = '<video src="'+src+'" controls></video>';
                    el.append(html);
                }
                
            });
        }
    }

    // Init slider for mobile only
    function initSlickCenterMobile() {
        var sliders = $('[data-slick-center-mobile]'),
            len = sliders.children().length;

        $(window).on('resize.carousel', function () {
            var isInitialized = sliders.is('.owl-loaded');
            if (len > 1) {
                if (win.width() <= 750) {
                    if (!isInitialized) {
                        sliders.owlCarousel({
                            center: true,
                            items: 2,
                            loop: true,
                            nav: true
                        });
                    }
                } else {
                    if (isInitialized) {
                        sliders.owlCarousel('destroy');
                    }
                }
            }
        }).trigger('resize.carousel');
    }

    // Init carousel slider for both desktop and mobile
    // Carousel style only 1 active Item at center
    function initSlickCenter() {
        var sliders = $('[data-slick-center]');
        sliders.owlCarousel({
            center: true,
            items: 2,
            loop: true,
            nav: true
        });
    }

    function afterIconShow(index) {
        if (window.innerWidth > 750) {
            var icons = $('.top-slide-wrapper .ico-m.hidden-phone');
            icons.children().removeClass('active');
            var _ele = $(('.top-slide-wrapper .ico-m.hidden-phone .icon-'+index));
        } else {
            var icons = $('.top-slide-wrapper .ico-m.visible-phone');
            icons.children().removeClass('active');
            var _ele = $(('.top-slide-wrapper .ico-m.visible-phone .icon-'+index));
        }

        _ele.addClass('active');
        var _svg = _ele.find('.svg-resource');

        // _svg.each(function (i, x) {
        if(!_svg.find('svg').length){
            var _class = 'svg-index-' + index;
            _svg[0].classList.add(_class);
            var xhr = new XMLHttpRequest;
            xhr.open('get', _svg[0].getAttribute('data-svg'), true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState != 4) return;
                var _svgImg = xhr.responseXML.documentElement;
                _svgImg = document.importNode(_svgImg, true); // surprisingly optional in these browsers
                _svg[0].appendChild(_svgImg);
                //after append - need set background color and text-color
                var style = document.createElement('style');
                style = document.createElement('style');
                style.type = 'text/css';
                var css = '.' + _class + ' .st0 {fill: ' + _svg[0].getAttribute('data-color') + '}';
                css += '.' + _class + ' .st1 {fill: ' + _svg[0].getAttribute('data-text-color') + '}';
                if (style.styleSheet) {
                    style.styleSheet.cssText = css;
                } else {
                    style.appendChild(document.createTextNode(css));
                }
                _svg[0].appendChild(style);
            };
            xhr.send();
        }
        // });
    }

    //function to draw icon M of each section
    function drawSingleIconM () {
        //clear icon M before drawing again
        if ($('section').children('.ico-m.ico-m-section').find('.svg-resource svg').length) {
            $('section').children('.ico-m.ico-m-section').find('.svg-resource').html('');
        }
        
        var _eles = $('section').children('.ico-m.ico-m-section');
        _eles.each(function(index){
            var _svg = $(_eles[index]).find('.svg-resource');
            var _class = 'svg-index-' + index + '-single';
            if(_svg.length){
                _svg[0].classList.add(_class);
                var xhr = new XMLHttpRequest;
                if (window.innerWidth > 750){
                    xhr.open('get', _svg[0].getAttribute('data-svg'), true);
                } else {
                    xhr.open('get', _svg[0].getAttribute('data-svg-m'), true);
                }
                
                xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4) return;
                    var _svgImg = xhr.responseXML.documentElement;
                    _svgImg = document.importNode(_svgImg, true); // surprisingly optional in these browsers
                    _svg[0].appendChild(_svgImg);
                    //after append - need set background color and text-color
                    var style = document.createElement('style');
                    style = document.createElement('style');
                    style.type = 'text/css';
                    var css = '.' + _class + ' .st0 {fill: ' + _svg[0].getAttribute('data-color') + '}';
                    css += '.' + _class + ' .st1 {fill: ' + _svg[0].getAttribute('data-text-color') + '}';
                    if (style.styleSheet) {
                        style.styleSheet.cssText = css;
                    } else {
                        style.appendChild(document.createTextNode(css));
                    }
                    _svg[0].appendChild(style);
                };
                xhr.send();
            }
        });
    }

    //function to update Favourite number
    // function updateFavouriteNumber(){
    //     // var _number;
    //     // if(window._isStorageAvailable){
    //     //     _number = localStorage.getItem('numberOfFavorite');
    //     // }else{
    //     //     _number = getCookie('numberOfFavorite');
    //     // }
    //     // if(_number==null||_number=='')_number=0;
    //     // $('.fav-notify .number').text(_number);

    //     updateCountFavoriteServer();
    // }

    //function check login status
    function checkLoginStatus(){
        var _user;
        if(window._isStorageAvailable){
            _user = localStorage.getItem('userKey');
        }else{
            _user = getCookie('userKey');
        }
        if(_user!=''&&_user!=null){
            window._userKey = _user;
            // get favourite list from server
            loginToSiteSystem();
        }else{
            // get favourite list from client localStorage or Cookie
            updateFavItemsFromLocal();
        }
    }

    // login and get Favourite Number from server
    function loginToSiteSystem(callback){
        var server = window.location.origin;
        // if in dev environment
        if (window._isDev) server = '//mastermarkdev.splashinteractive.sg';
        var url = server + apiLogin;
        var obj = {
            'userKey': localStorage.getItem('userKey'),
            'source': localStorage.getItem('login_type'),
            'favoriteItems': window._favColorItems.concat(window._favProductItems)
        }
        //console.log(obj);
        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(obj),
            success: function(result,status,xhr){
                // console.log(result);
                if(result.result=='OK'){
                    if(window._isStorageAvailable){
                        localStorage.setItem('numberOfFavorite',result.data.numberOfFavorite);
                    }else{
                        setCookie('numberOfFavorite',result.data.numberOfFavorite,330);
                    }
                    $('.fav-notify .number').text(result.data.numberOfFavorite);
                    if($.isFunction(callback)){
                        //updateFavItemsFromServer(callback);
                        callback();
                    }else{
                        updateFavItemsFromServer();
                    }
                }
            },
            error: function(xhr,status,error){
                console.log(xhr);
            }
        });
    }

    // update Favourite items from client storage or cookie
    function updateFavItemsFromLocal(){
        try {
            if(window._isStorageAvailable){
                window._favColorItems = (JSON.parse(localStorage.getItem('favoriteColorItems'))||[]).filter(function(x){
                    return x.action =='add';
                });
                window._favProductItems = (JSON.parse(localStorage.getItem('favoriteProductItems'))||[]).filter(function(x){
                    return x.action =='add';
                });
            }else{
                if(getCookie('favoriteColorItems')!==''){
                    window._favColorItems = JSON.parse(getCookie('favoriteColorItems')).filter(function(x){
                        return x.action =='add';
                    });
                }else{
                    window._favColorItems = [];
                }
                if(getCookie('favoriteProductItems')!==''){
                    window._favProductItems = JSON.parse(getCookie('favoriteProductItems')).filter(function(x){
                        return x.action =='add';
                    });
                }else{
                    window._favProductItems = [];
                }
            }
            updateFavouriteNumber();
        } catch (err) {
            console.log(err);
        }
    }

    // update Favourite Items from server
    function updateFavItemsFromServer(callback){
        var server = window.location.origin;
        // if in dev environment
        if (window._isDev) server = '//mastermarkdev.splashinteractive.sg';
        var url = server + apiGetAllFavoriteItem;
        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify({'userKey':window._userKey}),
            success: function(res,status,xhr){
                console.log(res);
                if(res.result=='OK'){
                    if(res.data!==null){
                        for(var i=0,len=res.data.length;i<len;i++){
                            if(res.data[i].sectionType=='c'){
                                window._favColorItems = res.data[i].items||[];
                            }else if(res.data[i].sectionType=='p'){
                                window._favProductItems = res.data[i].items||[];
                            }
                        }
                        if(window._isStorageAvailable){
                            localStorage.setItem('favoriteColorItems',JSON.stringify(window._favColorItems));
                            localStorage.setItem('favoriteProductItems',JSON.stringify(window._favProductItems));
                        }else{
                            setCookie('favoriteColorItems',JSON.stringify(window._favColorItems),30);
                            setCookie('favoriteProductItems',JSON.stringify(window._favProductItems),30);
                        }
                    }
                }
            },
            error: function(xhr,status,error){
                console.log(xhr);
            },
            complete: function(){
                if($.isFunction(callback))callback();
            }
        });
    }
    //function to update Favourite number
    function updateFavouriteNumber(){
        var server = window.location.origin;
        // if in dev environment
        if (window._isDev) server = '//mastermarkdev.splashinteractive.sg';
        var url = server + apiCountFavorite;
        var _colorItems, 
            _productItems;

        if(window._isStorageAvailable){
            _colorItems = localStorage.getItem('favoriteColorItems');
            _productItems = localStorage.getItem('favoriteProductItems');
        }else{
            _colorItems = getCookie('favoriteColorItems');
            _productItems = getCookie('favoriteProductItems');
        }
        _colorItems = JSON.parse(_colorItems);
        _productItems = JSON.parse(_productItems);
        var obj = [];
        if (_colorItems !== null) {
            for (var i = 0; i < _colorItems.length; i++) {
                var data = {
                    'type': _colorItems[i].type,
                    'id': _colorItems[i].id
                }
                obj.push(data);
            }
        }
        if (_productItems !== null) {
            for (var j = 0; j< _productItems.length; j++) {
                var data = {
                    'type': _productItems[j].type,
                    'id': _productItems[j].id
                }
                obj.push(data);
            }
        }
        if (!obj.length) {
            return;
        }
       
        var dataFavorite = {
            'userKey': window._userKey,
            'favoriteItems': obj
        }
        $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(dataFavorite),
            success: function(res,status,xhr){
                if(res.result=='OK'){
                    $('.fav-notify .number').text(res.numberOfFavorite);
                }
            },
            error: function(xhr,status,error){
                console.log(xhr);
            },
            complete: function(){
                // if($.isFunction(callback))callback();
            }
        });
    }

    // Add event for button Add To Fav and button Add Comment
    function controlFavAction(){
        //First we need update FAV list exactly when user add/remove item - not depend on user comment or not
        $('body').on('click','.btn-fav',function(e){
            var _this = $(this);
            // console.log(_this.hasClass('active'));
            var _obj = {
                userKey: window._userKey,
                action: _this.hasClass('active')?'delete':'add',
                type: _this.attr('data-type')=='color'?'c':'p',
                id: _this.attr('data-id'),
                comment: ''
            };
            processFavList(_obj);
        });

        //Submit comment
        $('body').on('click','.product-review-component .btn-primary',function(e){
            var _this = $(this);
            //console.log(_this.hasClass('active'));
            var _obj = {
                userKey: window._userKey,
                action: 'add',
                type: _this.attr('data-type')=='color'?'c':'p',
                id: _this.attr('data-id'),
                comment: $('#product_review').val()
            }
            processFavList(_obj);
            var _form = $('.product-review-component.overlay-preview.open');
            $('#product_review').val('');
            if(_form.length){
                _form.fadeOut(300,function(e){
                    _form.removeClass('open');
                });
            }
            //Hide hover active
            $('.product-item').filter('.hover').removeClass('hover');
        });

        // Delete favourite item
        $('body').on('click','.btn-fav-trash',function(e){
            e.preventDefault();
            var _this = $(this);
            var _obj = {
                userKey: window._userKey,
                action: 'delete',
                type: _this.attr('data-type')=='color'?'c':'p',
                id: _this.attr('data-id'),
                comment: _this.parents('.desc').find('.comment').text()
            }
            processFavList(_obj);
            // hide item
            _this.parents('article.product-item').hide();
            $('.product-item.hover').removeClass('hover');
            $('.product-review-component.open').removeClass('open');
        });

        // Update favourite item's comment
        $('body').on('click','.btn-fav-edit',function(e){
            e.preventDefault();
            $(this).parent().find('textarea').remove();
            var _this = $(this),
                _input = $('<textarea type="text" maxlength="50" class="edit-mode"></textarea>'),
                _comment = _this.prev();
            _this.hide();
            _comment.hide();
            _input.insertAfter(_comment);
            //_input.attr('data-text',_input.text()).attr('contenteditable',true).attr('data-id',_this.attr('data-id')).attr('data-type',_this.attr('data-type')).addClass('edit-mode').focus();
            _input.val(_comment.text()).attr('data-text',_comment.text()).attr('data-id',_this.attr('data-id')).attr('data-type',_this.attr('data-type')).focus();
        });
        $('body').on('keydown paste','.product-item .edit-mode',function(e){
            var k = e.which || e.keyCode;
            if($(this).text().length >= 50 && k != 8 && k!= 13 && k!= 9 && k!= 27) { 
                e.preventDefault();
            }
        });
        // $('body')[0].addEventListener("paste", function(e){
        //     if(e.target.classList.contains('comment')){
        //         if(e.target.innerText.length>=50){
        //             e.preventDefault();
        //         }
        //     }
        // }, false);
        $('body').on('keydown paste','#product_review',function(e){
            var k = e.which || e.keyCode;
            if($(this).val().length >= 50 && k != 8 && k!= 13 && k!= 9 && k!= 27) { 
                e.preventDefault();
            }
        });
        $('body').on('keypress','.product-item .edit-mode',function(e){
            var k = e.which || e.keyCode;
            if(k == 13){
                if(e.shiftKey){
                    e.preventDefault();
                    return;
                }
                var _this = $(this);
                if(this.value.trim()==this.getAttribute('data-text')||k==27){
                    //_this.attr('contenteditable',false).removeClass('edit-mode').blur();
                    _this.addClass('hidden');
                    _this.prev().show();
                    _this.next().show();
                    //if(_this.length)_this.remove();
                    window._updateLayoutFav($('body').height());
                    return;
                }
                var _obj = {
                    userKey: window._userKey,
                    action: 'add',
                    type: _this.attr('data-type')=='color'?'c':'p',
                    id: _this.attr('data-id'),
                    comment: _this[0].value
                }
                processFavList(_obj);
                // _this.attr('contenteditable',false).removeClass('edit-mode').blur();
                // _this.next().show();
                _this.addClass('hidden');
                _this.prev().show();
                _this.next().show();
                //if(_this.length)_this.remove();
                window._updateLayoutFav($('body').height());
            }
        });
        $('body').on('blur','.product-item .edit-mode',function(e){
            var _this = $(this);
            var k = e.which || e.keyCode;
            if(this.value.trim()==this.getAttribute('data-text')||k==27){
                // _this.attr('contenteditable',false).removeClass('edit-mode');
                // _this.next().show();
                _this.addClass('hidden');
                _this.prev().show();
                _this.next().show();
                //if(_this.length)_this.remove();
                window._updateLayoutFav($('body').height());
                return;
            }
            var _obj = {
                userKey: window._userKey,
                action: 'add',
                type: _this.attr('data-type')=='color'?'c':'p',
                id: _this.attr('data-id'),
                comment: _this[0].value
            }
            processFavList(_obj);
            // _this.attr('contenteditable',false).removeClass('edit-mode');
            // _this.next().show();
            _this.addClass('hidden');
            _this.prev().show();
            _this.next().show();
            //if(_this.length)_this.remove();
            window._updateLayoutFav($('body').height());
        });
        $('body').on('focus','.product-item .edit-mode',function(e){
            var _this = this;
            $(this).parents('.bot').css('height','auto');
            // setTimeout(function(){
            //     //_this.selectionStart = _this.selectionEnd = _this.innerText.length;
            //     setEndOfContenteditable(_this);
            // },50);
        });

    }

    //function add item to fav list
    //this function will add product or item to user's fav list, if user not logged yet, 
    //it will set to localstorage/cookie and send to server after user login
    function processFavList(obj){
        var _type = obj.type,
            _isUpdate = false,
            _isAddBack = false,
            _isDelete = (obj.action=='delete')?true:false,
            arr = [],
            arr_deleted = [];
        if(_type=='c'){
            arr=window._favColorItems;
        }else{
            arr=window._favProductItems;
        }
        // console.log(obj);
        for(var i=0,len=arr.length;i<len;i++){
            if(arr[i].id==obj.id){
                arr[i].comment = obj.comment;
                if(arr[i].action=='delete'&&obj.action=='add')_isAddBack = true;
                arr[i].action = obj.action;
                _isUpdate = true;
                break;
            }
        }
        // console.log('update:'+_isUpdate);
        // console.log('addback:'+_isAddBack);
        // console.log('delete:'+_isDelete);
        if(!_isUpdate){
            arr.push(obj);
            if(window._isStorageAvailable){
                var _n = localStorage.getItem('numberOfFavorite')||0;
                localStorage.setItem('numberOfFavorite',parseInt(_n)+1);
            }else{
                var _n = getCookie('numberOfFavorite')||0;
                setCookie('numberOfFavorite',parseInt(_n)+1,30);
            }
        }else{
            if(_isDelete){
                arr_deleted = arr.filter(function(x){
                    return x.id!=obj.id;
                });
                if(window._isStorageAvailable){
                    var _n = localStorage.getItem('numberOfFavorite')||0;
                    localStorage.setItem('numberOfFavorite',parseInt(_n)-1);
                }else{
                    var _n = getCookie('numberOfFavorite')||0;
                    setCookie('numberOfFavorite',parseInt(_n)-1,30);
                }                
            }
            if(_isAddBack){
                if(window._isStorageAvailable){
                    var _n = localStorage.getItem('numberOfFavorite')||0;
                    localStorage.setItem('numberOfFavorite',parseInt(_n)+1);
                }else{
                    var _n = getCookie('numberOfFavorite')||0;
                    setCookie('numberOfFavorite',parseInt(_n)+1,30);
                }
            }
        }

        if(_isDelete&&window._userKey==null) {
            arr = arr_deleted;
        }
        //console.log(arr);
        if(window._isStorageAvailable){
            if(_type=='c'){
                window._favColorItems=arr;
                localStorage.setItem('favoriteColorItems',JSON.stringify(window._favColorItems));
            }else{
                window._favProductItems=arr;
                localStorage.setItem('favoriteProductItems',JSON.stringify(window._favProductItems));
            }
        }else{
            if(_type=='c'){
                window._favColorItems=arr;
                setCookie('favoriteColorItems',JSON.stringify(window._favColorItems),30);
            }else{
                window._favProductItems=arr;
                setCookie('favoriteProductItems',JSON.stringify(window._favProductItems),30);
            }
        }

        if(window._userKey!=null){
            requestAPI(apiUpdateFavoriteItem,window._isDev,'POST','application/json; charset=utf-8','json',obj,function(res,status,xhr){
                //console.log(res);
                if(res.result=='OK'){
                    if(window._isStorageAvailable){
                        localStorage.setItem('numberOfFavorite',res.data.numberOfFavorite);
                    }else{
                        setCookie('numberOfFavorite',res.data.numberOfFavorite,30);
                    }
                    updateFavouriteNumber();
                    if(window._isFavPage&&!_isDelete||(window._isFavPage&&_isAddBack)){
                        if($.isFunction(window._loadFavouriteItems)&&!window._isFavReadOnly)window._loadFavouriteItems(window._userKey);
                    }else if(window._isFavPage&&_isDelete){
                        setTimeout(function(){
                            if($.isFunction(window._loadFavouriteItems)&&!window._isFavReadOnly)window._loadFavouriteItems(window._userKey);
                            updateAllButtonFav();
                        },250);
                    }
                }
            },function(xhr,status,error){
                console.log(xhr);
            },function(){
                updateFavItemsFromServer();
            });
        }else{
            updateFavouriteNumber();
            updateFavItemsFromLocal();
            if(window._isFavPage&&!_isDelete||(window._isFavPage&&_isAddBack)){
                if($.isFunction(window._loadFavouriteItems)&&!window._isFavReadOnly)window._loadFavouriteItems(window._userKey);
            }else if(window._isFavPage&&_isDelete){
                //updateAllButtonFav();
                setTimeout(function(){
                    if($.isFunction(window._loadFavouriteItems)&&!window._isFavReadOnly)window._loadFavouriteItems(window._userKey);
                    updateAllButtonFav();
                },250);
            }
        }

    }
    
    // Request API
    function requestAPI(api,isDev,method,contentType,dataType,data,callbackSuccess,callbackError,callbackComplete){
        var server = window.location.origin;
        // if in dev environment
        if (isDev) server = '//mastermarkdev.splashinteractive.sg';
        var url = server + api;
        $.ajax({
            url: url,
            type: method,
            contentType: contentType,
            dataType: dataType,
            data: JSON.stringify(data),
            success: function(res,status,xhr){
                if($.isFunction(callbackSuccess))callbackSuccess(res,status,xhr);
            },
            error: function(xhr,status,error){
                if($.isFunction(callbackError))callbackError(xhr,status,error);
            },
            complete: function(){
                if($.isFunction(callbackComplete))callbackComplete();
            }
        });
    };

    // Check and update status for button add to fav in detail page(product, color)
    function updateButtonFav(){
        var favoriteSections = $('.switch-block [data-id]'),
            requestObject = [];
        
        for (var i = 0,len=favoriteSections.length; i < len ; i++) {
            var _it = favoriteSections[i];
            requestObject.push({ id: _it.getAttribute('data-id'), type: _it.getAttribute('data-type')=='color'?'c':'p' });
        }
        var obj = {
            userKey: window._userKey,
            itemIds: requestObject
        }
        $('.switch-block [data-id].active').removeClass('active');
        if (window._userKey) {
            if (requestObject.length) {
                var apiUrl = '/CustomApi/ContentApi/CheckFavoriteStatus';
                //window._ppgRequestAPI(api,isDev,method,contentType,dataType,data,callbackSuccess,callbackError,callbackComplete)
                window._ppgRequestAPI(apiUrl,window._isDev,'POST','application/json; charset=utf-8','json',obj,function(res,status,xhr){
                    for(var x=0,lenx=res.data.length;x<lenx;x++){
                        //console.log(res.data[x].id);
                        var searchKey = $('.switch-block [data-id="' + res.data[x].id + '"]');
                        //console.log(searchKey.attr('data-type').substring(0,1));
                        if(searchKey.length&&searchKey.attr('data-type').substring(0,1)==res.data[x].type){
                            searchKey.addClass('active');
                        }
                    }
                },function(){

                });
            }
        }else{
            var arrFavs = window._favColorItems.concat(window._favProductItems);
            if (requestObject.length) {
                for(var x=0,lenx=arrFavs.length;x<lenx;x++){
                    var searchKey = $('.switch-block [data-id="' + arrFavs[x].id + '"]');
                    if(searchKey.length&&arrFavs[x].action=='add'&&searchKey.attr('data-type').substring(0,1)==arrFavs[x].type){
                        searchKey.addClass('active');
                    }
                }
            }
        }
    }; 

    // Check and update status for button add to favorite product in other pages
    function updateAllButtonFav(){
        var _els = $('.product-item .btn-fav,.color-swatch .btn-fav'),
            requestObject = [];
        for (var i = 0,len=_els.length; i < len ; i++) {
            var _it = _els[i];
            requestObject.push({ id: _it.getAttribute('data-id'), type: _it.getAttribute('data-type')=='color'?'c':'p' });
        }
        var obj = {
            userKey: window._userKey,
            itemIds: requestObject
        }
        $('.product-item .btn-fav.active,.color-swatch .btn-fav.active').removeClass('active');
        if (window._userKey) {
            if (requestObject.length) {
                var apiUrl = '/CustomApi/ContentApi/CheckFavoriteStatus';
                
                //window._ppgRequestAPI(api,isDev,method,contentType,dataType,data,callbackSuccess,callbackError,callbackComplete)
                window._ppgRequestAPI(apiUrl,window._isDev,'POST','application/json; charset=utf-8','json',obj,function(res,status,xhr){
                    for(var x=0,lenx=res.data.length;x<lenx;x++){
                        //console.log($('.btn-fav[data-id="' + res.data[x].id + '"]'));
                        var searchKey = $('.btn-fav[data-id="' + res.data[x].id + '"]');
                        if(searchKey.length&&searchKey.attr('data-type').substring(0,1)==res.data[x].type){
                            searchKey.addClass('active');
                        }
                    }
                },function(){

                });
            }
        }else{
            var arrFavs = window._favColorItems.concat(window._favProductItems);
            if (requestObject.length) {
                for(var x=0,lenx=arrFavs.length;x<lenx;x++){
                    var searchKey = $('.btn-fav[data-id="' + arrFavs[x].id + '"]');
                    if(searchKey.length&&arrFavs[x].action=='add'&&searchKey.attr('data-type').substring(0,1)==arrFavs[x].type){
                        searchKey.addClass('active');
                    }
                }
            }
        }
    }

    // Check and update status for button add to favorite in other pages
    // function updateAllButtonColorFav(){
    //     var _els = $('.product-item .btn-fav'),
    //         requestObject = [];
    //     for (var i = 0,len=_els.length; i < len ; i++) {
    //         var _it = _els[i];
    //         requestObject.push({ id: _it.getAttribute('data-id'), type: _it.getAttribute('data-type')=='color'?'c':'p' });
    //     }
    //     var obj = {
    //         userKey: window._userKey,
    //         itemIds: requestObject
    //     }
    //     $('.product-item .btn-fav.active').removeClass('active');
    //     if (window._userKey) {
    //         if (requestObject.length) {
    //             var apiUrl = '/CustomApi/ContentApi/CheckFavoriteStatus';
                
    //             //window._ppgRequestAPI(api,isDev,method,contentType,dataType,data,callbackSuccess,callbackError,callbackComplete)
    //             window._ppgRequestAPI(apiUrl,window._isDev,'POST','application/json; charset=utf-8','json',obj,function(res,status,xhr){
    //                 for(var x=0,lenx=res.data.length;x<lenx;x++){
    //                     var searchKey = $('.product-item .btn-fav[data-id="' + res.data[x].id + '"]');
    //                     if(searchKey.length&&searchKey.attr('data-type').substring(0,1)==res.data[x].type){
    //                         searchKey.addClass('active');
    //                     }
    //                 }
    //             },function(){

    //             });
    //         }
    //     }else{
    //         var arrFavs = window._favColorItems.concat(window._favProductItems);
    //         if (requestObject.length) {
    //             for(var x=0,lenx=arrFavs.length;x<lenx;x++){
    //                 //console.log(arrFavs[x]);
    //                 var searchKey = $('.product-item .btn-fav[data-id="' + arrFavs[x].id + '"]');
    //                 if(searchKey.length&&arrFavs[x].action=='add'&&searchKey.attr('data-type').substring(0,1)==arrFavs[x].type){
    //                     searchKey.addClass('active');
    //                 }
    //             }
    //         }
    //     }
    // }

    function initOverPlayFloatTool() {
        $(".dropup").on("shown.bs.dropdown", function(event){
            $('.overPlay').addClass('over-play-active');
        });

        $(".dropup").on("hidden.bs.dropdown", function(event){
            $('.overPlay').removeClass('over-play-active');
        });
    }

    function changePoster(_ul) {
        _ul.find('video').each(function () {
            var el = $(this),
                posterDesk = el.data('poster-desktop'),
                posterMob = el.data('poster-mobile'),
                srcDesk = el.data('src-desktop'),
                srcMob = el.data('src-mobile');

            if (windowWidth > 751){
                if (posterDesk !== '') el.attr('poster', posterDesk)
                if (srcDesk !== '') el.attr('src', srcDesk)
            } else {
                if (posterMob !== '') el.attr('poster', posterMob)
                if (srcMob !== '') el.attr('src', srcMob) 
            }
        });
    }

    function setEndOfContenteditable(contentEditableElement){
        var range,selection;
        if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange();//Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }else if(document.selection) { 
            range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
            range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            range.select();//Select the range (make it the visible selection
        }
    }

    // make Global Function so any script can run when needed
    window._loginToSiteSystem = loginToSiteSystem;
    window._ppgRequestAPI = requestAPI;
    window._updateButtonFav = updateButtonFav;
    window._updateAllButtonFav = updateAllButtonFav;
    //window._updateAllButtonColorFav = updateAllButtonColorFav;

    $(document).ready(function () {
        window.scrollTo(0, 0);


        initBrowserInfo();

        //set path
        var hiddenPath = document.getElementById('templatePath');
        window._path = {
            root: hiddenPath.value,
            images: hiddenPath.getAttribute('data-images'),
            script: hiddenPath.getAttribute('data-script'),
            template: hiddenPath.getAttribute('data-template')
        };

        // Set global element to variable
        header = $('#header');
        footer = $('#footer');

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        if(windowWidth>750){
            viewPort = 1;
        }else{
            viewPort = 0;
        }

        initMainMenu();
        initFooter();

        // Check user
        checkLoginStatus();
        controlFavAction();

        // init some global plugin
        initSelect();
        initCMSVideo();
        initIconMHtml();

        checkConnectionSpeed(function (_internetSpeed) {
            if (_internetSpeed >= 1) {
                // Call video banner here
                if (window.innerWidth > 750) {
                    initOnTopVideo();
                }
            }
        });

        if ($('#floatToolbar').length) {
            initFloatToolbar();
        }

        if ($('#topBanner').length) {
            initHomeBanner();
        }

        if ($('#voiceColor').length) {
            initVoiceOfColor();
        }

        if ($('#seasonColorSlider').length) {
            initSeasonColorSlider();
        }
        var h_Header = $('#header').height();

        if ($('[data-slick-center]').length) {
            initSlickCenter();
        }

        drawSingleIconM();
        initOverPlayFloatTool();

        var list = $('.season-slider');
        list.each(function(index){
            if($(list[index]).children('li:not(".bx-clone")').length==1) {
                $(list[index]).parent('.bx-viewport').next('.bx-controls').css({
                    'display': 'none'
                })
            }
        })

        //For WCAG - active feature enable control click by press spacebar
        window.onkeydown = function(e) {
            return !(( e.keycode || e.which ) == 32 && (e.target.type != 'text' && e.target.type != 'textarea' && !e.target.getAttribute('contenteditable')));
        };
        document.body.addEventListener('keyup',function(e){
            var _el = document.activeElement;
            if(( e.keycode || e.which ) == 32 || ( e.keycode || e.which ) == 13){
                try {
                    //console.log(document.activeElement);
                    if(!_el.classList.contains('dropdown-toggle'))_el.click();
                    if(( e.keycode || e.which ) == 32) {
                        return !((e.target.type != 'text' && e.target.type != 'textarea'));
                    }
                }
                catch (e) {
                    // console.log(e);
                }            
            }
            //Tab moving on menu
            if((e.keycode || e.which) == 9){
                try {
                    if(_el.classList.contains('dropdown-toggle')){
                        if(_el.parentNode.parentNode.id=='navMenu'){
                            if(window.innerWidth<751){
                                $(_el).parent().trigger('click');
                            }else{
                                $(_el).parent().trigger('mouseenter');
                            }   
                        }
                    }
                }
                catch(e){

                }
            }

        },false);

        $('#header').find('[data-toggle="dropdown"]').bind('click',function(e){
            //console.log($(this).parent());
            if(window.innerWidth<751){
                $(this).parent().trigger('click');
            }else{
                $(this).parent().trigger('mouseenter');
            }
        });


        // Listening event of local storage
        window.addEventListener("storage", function(e){
            window._favColorItems = (JSON.parse(localStorage.getItem('favoriteColorItems'))||[]).filter(function(x){
                return x.action =='add';
            });
            window._favProductItems = (JSON.parse(localStorage.getItem('favoriteProductItems'))||[]).filter(function(x){
                return x.action =='add';
            });
            if(e.key=='numberOfFavorite')updateFavouriteNumber();
            if(window._isFavPage){
                if(e.key=='favoriteColorItems'||e.key=='favoriteProductItems'){
                    if(e.url!=window.location.href){
                        window.location.reload();
                    }
                }
            }else{
                if(e.key=='favoriteColorItems'||e.key=='favoriteProductItems'){
                    updateButtonFav();
                    updateAllButtonFav();
                    //$('.product-review-component.open').removeClass('open');
                    if(e.url!=window.location.href){
                        $('.product-review-component.open').removeClass('open');
                    }
                }
            }
        },false);

        if ($('[data-slick-center-mobile]').length) {
            initSlickCenterMobile();
        }
    });

    $(window).on('load', function (e) {
        window.scrollTo(0, 0);
        // init scrollbar for description of recommend product component
        // $('.product-item .info .desc').slimScroll({
        //     height: '110px'
        // });

    });

    window.addEventListener('resize', function (event) {
        var oldViewPort = viewPort;

        if(window.innerWidth>750){
            viewPort = 1;
        }else{
            viewPort = 0;
        }

        if(oldViewPort!=viewPort) {
            initSourceHomeBanner();
            setTimeout(function(){
                if (window._homeBanner) {
                    window._homeBanner.reloadSlider();
                }else{
                    initHomeBanner();
                }
                // Re-draw icon M of each section when resize
                drawSingleIconM();
            },200);
        }

        if (document.getElementsByTagName('html')[0].classList.contains('ie11')) {
            if (window._homeBanner) window._homeBanner.reloadSlider();
        }
        var _ul = $('#topBanner');
        var _video = _ul.children('.video').find('video');
        var timer = null;
        clearTimeout(timer);
        timer = setTimeout(function () {
            if (_ul.length) {
                if ($(window).width() > 750) {
                    _video.each(function (i, x) {
                        $(x).height($('#topBanner .slider-item').find('img').eq(0).height());
                    });
                } else {
                    _video.each(function (i, x) {
                        $(x).height($(window).width() * 1000/750);
                    });
                    window._homeBanner.startAuto();
                }
            }
        }, 500);
    });

    var bannerDrop = $('#banner-drop');

    $('#slick-banner').slick({
        slideToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: true,
        infinite: true,
        dots: true
    }).on('beforeChange', function(event, slick, currentSlide) {
        var slideItem = $(slick.$slides[currentSlide]);

        slideItem.find('[data-slick-video]').fadeIn();

        if(slideItem.find('video').length) {
            slideItem.find('video')
                .get(0)
                .pause();
        }

    }).on('afterChange', function(event, slick, currentSlide) {
        var slideItem = $(slick.$slides[currentSlide]);

        bannerDrop.find('.bgObj')
            .attr('fill', slideItem.attr('data-bg'));

        bannerDrop.find('.textObj')
            .attr('fill', slideItem.attr('data-color'));

    });


    $('[data-slick-video]').on('click', function() {
        var _self = $(this);
        var parent = _self.parent();
        var video  = parent.find('video');

        _self.fadeOut();

        if(!video.length) {
            parent.append('<video src="' + _self.attr('data-slick-video') + '"></video>');
            parent.find('video')
                .fadeIn(function() {
                    this.play();
                });
        } else {
            video.get(0).play();
        }
    });

});

