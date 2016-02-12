	<div class="cleaner">&nbsp;</div>      

 	</div><!-- / #inner-wrap -->
</div><!-- / #wrapper -->

<div id="footer">
	<div class="wrap">

		<?php if ( is_active_sidebar( 'footer_1' ) ||  is_active_sidebar( 'footer_2' )  ||  is_active_sidebar( 'footer_3' ) ) : ?>
				<div class="widgets">
		<?php endif; ?>

			<?php if ( is_active_sidebar( 'footer_1' ) ) { ?>
				<div class="column">
					<?php dynamic_sidebar('footer_1'); ?> 
				</div><!-- / .column -->
			<?php } ?>

			<?php if ( is_active_sidebar( 'footer_2' ) ) { ?>
				<div class="column">
					<?php dynamic_sidebar('footer_2'); ?> 
				</div><!-- / .column -->
			<?php } ?>

			<?php if ( is_active_sidebar( 'footer_3' ) ) { ?>
				<div class="column">
					<?php dynamic_sidebar('footer_3'); ?> 
				</div><!-- / .column -->
			<?php } ?>

		<?php if ( is_active_sidebar( 'footer_1' ) ||  is_active_sidebar( 'footer_2' )  ||  is_active_sidebar( 'footer_3' ) ) : ?>
				<div class="cleaner">&nbsp;</div>
			</div>
		<?php endif; ?>

		<div class="copyright">
			<p class="copy"><?php _e('Copyright', 'wpzoom'); ?> &copy; <?php echo date("Y",time()); ?> <?php bloginfo('name'); ?>. <?php _e('All Rights Reserved', 'wpzoom'); ?>.</p>
			<p class="wpzoom"><?php _e('Designed by', 'wpzoom'); ?> <strong><a href="http://www.wpzoom.com" target="_blank"><?php _e('WPZOOM', 'wpzoom'); ?></a></strong></p>
			<div class="cleaner">&nbsp;</div>
		</div>

	</div>
</div><!-- / #footer -->

<?php if ( option::get('featured_posts_show') == 'on' ) { ui::js("flexslider"); } ?>

<script type="text/javascript">
jQuery(window).load(function(){

	<?php
	if ( is_home() ) {

		if ( option::get('featured_posts_show') == 'on' ) {

			?>if ( jQuery('#slider li').length > 0 ) {
				jQuery('#slider').flexslider({
					controlNav: false,
					directionNav: false,
					animationLoop: true,
					animation: '<?php echo option::get('slideshow_effect') == 'Slide' ? 'slide' : 'fade'; ?>',
					useCSS: true,
					smoothHeight: false,
					touch: false,
					slideshow: <?php echo option::get('slideshow_auto') == 'on' ? 'true' : 'false'; ?>,
					<?php if ( option::get('slideshow_auto') == 'on' ) echo 'slideshowSpeed: ' . option::get('slideshow_speed') . ','; ?>
					pauseOnAction: true,
					animationSpeed: 600,
					start: function(slider){
						jQuery('#slider_nav .item').click(function(){
							var id = getPostIdClass(this);
							if ( id <= 0 ) return;

							var index = slider.slides.index( slider.slides.filter('.' + id) );

							slider.direction = (index > slider.currentSlide) ? 'next' : 'prev';
							slider.flexAnimate(index, slider.pauseOnAction);
						});
					},
					before: function(slider){
						var id = getPostIdClass( slider.slides.eq(slider.animatingTo) );
						if ( id <= 0 ) return;

						jQuery('#slider_nav .item').removeClass('current');
						jQuery('#slider_nav .item.' + id).addClass('current');

						if ( jQuery('#slider_nav .row').length > 1 ) {
							var navSlider = jQuery('#slider_nav').data('flexslider'),
							    currPage = navSlider.slides.index( navSlider.slides.find('.item.' + id).parent('.row') );
							navSlider.direction = (currPage > navSlider.currentSlide) ? 'next' : 'prev';
							navSlider.flexAnimate(currPage, navSlider.pauseOnAction);
						}
					}
				});

				jQuery('#slider_nav .item').wrapInChunks('<div class="row" />', 4);

				jQuery('#slider_nav').flexslider({
					selector: '.tiles > .row',
					direction: 'vertical',
					controlNav: true,
					directionNav: false,
					animationLoop: false,
					animation: 'slide',
					useCSS: true,
					smoothHeight: false,
					touch: false,
					slideshow: false,
					pauseOnAction: true,
					animationSpeed: 600
				});
			}<?php

		}

		if ( option::get('carousel_posts_show') == 'on' ) {

			?>if ( jQuery('#carousel .item').length > 0 ) {
				jQuery('#carousel .item').wrapInChunks('<div class="row" />', 3);
				jQuery('#carousel .row').append('<div class="clear" />');

				if ( jQuery('#carousel .item').length > 3 ) {
					jQuery('#carousel_wrap').append('<div id="carousel_nav"><div class="prev">Prev</div><div class="next">Next</div></div>');

					jQuery('#carousel .row').each(function(){
						var max = Math.max.apply(null, jQuery('h4.title',this).map(function(){return jQuery(this).height()}).get());
						jQuery('h4.title', this).css('min-height', max);
					});
					jQuery('#carousel').height(jQuery('#carousel .row').height());

					jQuery('#carousel').serialScroll({
						axis: 'y',
						cycle: false,
						constant: false,
						force: true,
						items: '.row',
						prev: '#carousel_nav .prev',
						next: '#carousel_nav .next',
						onBefore: function(e,elem,$pane,$items,pos){
							$pane.height(jQuery(elem).height());
						}
					});
				}
			}<?php

		}

	}
	?>

});
</script>

<?php if (is_single()) { ?><script type="text/javascript" src="https://apis.google.com/js/plusone.js"></script><?php } // Google Plus button ?>
 
<?php wp_footer(); ?>
</body>
</html>