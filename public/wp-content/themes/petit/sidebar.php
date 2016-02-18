<div id="sidebar">

	<?php if ( is_single() && get_post_meta( get_the_ID(), 'wpzoom_is_recipe', true ) ) {
		?><div id="single-recipe" class="widget widget-recipe">
			<?php
			$fields = get_fields();
			if ( !empty( $fields ) ) echo $fields;

			if ( function_exists('polldaddy_get_rating_html') ) { echo '<div class="rating"><h4>'.__('Rate', 'wpzoom').'</h4> ' . polldaddy_get_rating_html() . '</div>'; }
			?>

			<div class="share">
 				<ul class="share-btn">
					<?php global $post; 
 			 
 			        $image = get_the_image( array( 'echo' => false, 'post_id' => $post->ID, 'format' => 'array' ) ); 
					  
					?>
					<li><iframe src="http://www.facebook.com/plugins/like.php?href=<?php echo urlencode(get_permalink($post->ID)); ?>&amp;layout=standard&amp;show_faces=false&amp;width=260&amp;action=like&amp;font=arial&amp;colorscheme=light&amp;height=28" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:260px; height:28px;" allowTransparency="true"></iframe></li>
					<li><a href="http://twitter.com/share" data-url="<?php echo get_permalink($post->ID); ?>" class="twitter-share-button" data-count="horizontal">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></li>
				 	<li><g:plusone size="medium"></g:plusone></li>
				 	<li><a href="http://pinterest.com/pin/create/button/?url=<?php echo get_permalink($post->ID); ?>&media=<?php if (!empty($image)) { $url = $image['src']; echo $url; } ?>&description=<?php echo get_the_title($post->ID); ?>" class="pin-it-button" count-layout="horizontal"><img border="0" src="//assets.pinterest.com/images/PinExt.png" title="Pin It" /></a></li>
				</ul>

				<div class="cleaner">&nbsp;</div>
 
			</div>

			<?php 
				if (function_exists('wpfp_link') && function_exists('wpfp_get_option')) {
					$showbkmkbtn = function_exists('wpfp_link') && function_exists('wpfp_get_option') ? ( wpfp_get_option('opt_only_registered') ? is_user_logged_in() : true ) : false;

					if ( $showbkmkbtn ) {  wpfp_link();  } 

				} ?>
 		</div><?php
	} ?>

	<?php if (!function_exists('dynamic_sidebar') || !dynamic_sidebar('Sidebar')) { } ?>

</div><!-- / #sidebar -->
<div class="cleaner">&nbsp;</div>
