jQuery(document).ready(function($) {
    featured_slider = JSON.parse(featured_slider);

    var prevWidth;
    var prevSlide;
    var breakpoint = 1030;

    $(window).on('resize', function() {
        initCarouFredSel();
    });

    function initCarouFredSel() {
        var windowWidth = $(window).width();

        if (prevWidth) {
            if (prevWidth < breakpoint && windowWidth < breakpoint) return;
            if (prevWidth > breakpoint && windowWidth > breakpoint) return;
        }

        var defaultOptions = {
            width: '100%',
            items: {
                visible: 3,
                start: -1,
                height: "50%"
            },
            scroll: {
                items: 1,
                duration: 600,
                timeoutDuration: featured_slider.slideshow_speed,
                onBefore: beforeSliding
            },
            swipe: {
                onTouch: true
            },
            prev: '#prev',
            next: '#next',
            pagination: {
                container: '#pager',
                deviation:1
            },
            auto: {
                play: featured_slider.autoplay
            },
            onCreate: function() {
                beforeSliding();
                $('#carousel-wrap').addClass('carousel--loaded');
            }
        };

        var smallScreenOptions = $.extend(true, {}, defaultOptions);;
        smallScreenOptions.responsive = true;
        smallScreenOptions.items.visible = 1;
        smallScreenOptions.items.start = 0;
        smallScreenOptions.pagination.deviation = 0;

        if (windowWidth > breakpoint) {
            $('#carousel').carouFredSel(defaultOptions);
            $('#carousel').trigger('slideTo', -1);
        } else {
            $('#carousel').carouFredSel(smallScreenOptions);
            $('#carousel').trigger('slideTo', 0);
        }

        prevWidth = windowWidth;
    }

    function beforeSliding(data) {
        var $carousel = $('#carousel');
        var $items;
        $carousel.children().removeClass('active');
        $carousel.find('.video_cover').empty();

        if (data) {
            $items = data.items.visible;
        } else {
            $items = $carousel.triggerHandler('currentVisible');
        }

        var slide;
        if ($items.length == 3) {
            slide = $items.get(1);
        } else {
            slide = $items.get(0);
        }

        $(slide).addClass('active');
        var videoCover = $(slide).find('.video_cover');
        var embedCode = videoCover.data('embed');

        if (embedCode) {
            videoCover.html(embedCode);

            /* Enable Video API if autoplay is enabled */
            if (featured_slider.autoplay) {
                var youtubeSelectors = [
                    "iframe[src*='youtube.com']",
                    "iframe[src*='youtube-nocookie.com']",
                ];

                var vimeoSelectors = [
                    "iframe[src*='player.vimeo.com']"
                ];

                var $ytVideo = videoCover.find(youtubeSelectors.join(','));
                var $vimeoVideo = videoCover.find(vimeoSelectors.join(','));

                if ($ytVideo.length) {
                    var src = $ytVideo.prop('src');
                    if (src.indexOf("?") > -1) {
                        $ytVideo.prop('src', src + '&enablejsapi=1');
                    } else {
                        $ytVideo.prop('src', src + '?enablejsapi=1');
                    }

                    new YT.Player($ytVideo.get(0), {
                        events: {
                            'onStateChange' : onYoutubeStateChange
                        }
                    })
                }

                if ($vimeoVideo.length) {
                    var src = $vimeoVideo.prop('src');
                    if (!$vimeoVideo.prop('id')) {
                        $vimeoVideo.prop('id', 'vimeo' + Math.floor(Math.random()*999999));
                    }
                    $vimeoVideo.prop('src', src + '&api=1&player_id=' + $vimeoVideo.prop('id'));

                    var player = $f($vimeoVideo.get(0));
                    player.addEvent('ready', function() {
                        player.addEvent('play', stopFeaturedSlider);
                    });
                }
            }
        }
    }

    /* First init on after page load */
    initCarouFredSel();
});
