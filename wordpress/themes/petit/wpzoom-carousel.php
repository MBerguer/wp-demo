<?php
query_posts( array(
	'post__not_in' => get_option( 'sticky_posts' ),
	'posts_per_page' => option::get( 'carousel_posts_posts' ),
	'meta_key' => 'wpzoom_is_carousel',
	'meta_value' => 1
) );

if ( have_posts() ) :

	?><div id="carousel_wrap">
		<div id="carousel">
			<?php 
 			while ( have_posts() ) : the_post();
 			$is_recipe = get_post_meta( get_the_ID(), 'wpzoom_is_recipe', true );  


				?><div class="item">

					<div class="thumb">
						<?php get_the_image( array( 'size' => 'carousel',  'width' => 300, 'height' => 200 ) ); ?>
					</div>
 
					<?php the_title( '<h4 class="title"><a href="' . get_permalink() . '" rel="bookmark" title="' . the_title_attribute( 'echo=0' ) . '">', '</a></h4>' ); ?>


					<?php
					if ( option::get('carousel_more_btn') == 'on' && function_exists('polldaddy_get_rating_html') ) {
						?>

						<div class="meta">
							<?php if ( option::get('carousel_rating') == 'on' && function_exists('polldaddy_get_rating_html') ) { echo '<div class="rating">' . polldaddy_get_rating_html() . '</div>'; }
							?>

							<?php
							if ( option::get('carousel_more_btn') == 'on' ) { ?>
							<p class="buttons">

								<a href="<?php the_permalink(); ?>" class="more"><?php _e( ( $is_recipe ? 'View Recipe' : 'Read More' ), 'wpzoom' ); ?></a>
 
						   </p><?php }
		 
							?>
			 

							<div class="clear"></div>
						</div><?php
					}
					?>
 
				</div><?php

			endwhile;
			?>
		</div>
	</div><?php

endif;

wp_reset_query();
?>