<div id="carousel-wrap">

	<div id="carousel">

		<?php

			if ( option::get( 'featured_type' ) == 'Posts' ) {
 				$FeaturedSource = 'post';
 			} else {
 				$FeaturedSource = 'page';
			}

 			$loop = new WP_Query( array(
				'post__not_in' => get_option( 'sticky_posts' ),
				'posts_per_page' => option::get('featured_number'),
				'meta_key' => 'wpzoom_is_featured',
				'meta_value' => 1,
				'post_type' => $FeaturedSource
			) );

			 $m = 0;
  		?>

 		<?php while ( $loop->have_posts() ) : $loop->the_post(); $m++;

 			$video = get_post_meta( $post->ID, 'wpzoom_post_embed_code', true );
 			$large_image_url = wp_get_attachment_image_src( get_post_thumbnail_id(), 'featured' );
  		?>

			<div>

				<?php if ( $video )  { ?>

					<div class="video_slide" style="background-image:url(<?php echo $large_image_url[0]; ?>)"></div>

					<div class="video_cover" data-embed="<?php echo esc_attr( embed_fix( $video, 800, 450 ) ); ?>"></div>

				<?php } else { ?>

					<div class="slide_content_wrap">
						<div class="slide_content">

							<span>
								<h3><a href="<?php the_permalink(); ?>" title="<?php the_title_attribute(); ?>"><?php the_title(); ?></a></h3>
							</span>

	 					</div>
					</div>

					<?php get_the_image( array( 'size' => 'featured', 'width' => 1030, 'height' => 520 ) );

				} ?>

 			</div>
		<?php endwhile; ?>

	</div><!-- /#carousel -->

	<a href="#" id="prev" title="Show previous"> </a>
	<a href="#" id="next" title="Show next"> </a>
	<div id="pager"></div>

	<?php if ( $m == 0 ) { echo '<div class="inner-wrap"><p><strong>Please mark at least 3 posts as Featured.</strong></p>
	<p>For more information about adding posts to the slider, please <strong><a href="http://www.wpzoom.com/documentation/delirium/">read the documentation</a></strong> or <a href="'.home_url().'/wp-admin/post-new.php?post_type=slideshow">add a new post</a>.</p></div>'; } ?>

</div><!-- /#carousel-wrap -->

<?php wp_reset_query(); ?>