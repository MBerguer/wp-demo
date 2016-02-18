<?php
query_posts( array(
	'post__not_in' => get_option( 'sticky_posts' ),
	'posts_per_page' => option::get( 'featured_posts_posts' ),
	'meta_key' => 'wpzoom_is_featured',
	'meta_value' => 1
) );

if ( have_posts() ) :

	?><div id="slider_wrap">
		<div id="slider">
			<ul class="slides">
		 
				<?php  $m = 0; ?>

				<?php while ( have_posts() ) : the_post(); $m++; ?>

					<li class="post-<?php the_ID(); ?>">
						<div>
							<div class="thumb">
								<?php get_the_image( array( 'size' => 'featured',  'width' => 600, 'height' => 320 ) ); ?>
							</div>

							<a href="<?php the_permalink(); ?>" class="more-link"><?php _e('View Recipe', 'wpzoom'); ?></a>
							
							<?php the_title( '<h3 class="title"><a href="' . get_permalink() . '" rel="bookmark" title="' . the_title_attribute( 'echo=0' ) . '">', '</a></h3>' ); ?>

							<?php $fields = get_fields();
							if ( !empty( $fields ) ) {
								?><div class="meta">
									<?php echo $fields; ?>
								</div><?php
							} ?>

							<div class="excerpt">
								<?php the_excerpt(); ?>
							</div>
						</div>
					</li>
				<?php endwhile; ?>
				 
			</ul>

			<?php if ($m == 0) { echo '<div id="content-wrap"><p><strong>You are now ready to set-up your Slideshow content.</strong></p>
			<p>For more information about adding posts to the slider, please <strong><a href="http://www.wpzoom.com/documentation/petit/">read the documentation</a></strong> or <a href="'.home_url().'/wp-admin/post-new.php?post_type=slideshow">add a new post</a>.</p></div>'; } ?>

		</div>

		<div id="slider_nav">
			<div class="tiles">
				<?php
				$first = true;
				while ( have_posts() ) : the_post(); ?>

					<div class="item<?php echo $first ? ' current' : ''; ?> post-<?php the_ID(); ?>">
						<div class="thumb">
							<?php
							get_the_image( array( 'size' => 'featured-nav',  'width' => 105, 'height' => 75, 'link_to_post' => false ) );
							?>
						</div>

						<div class="details">
							<?php the_title( '<h4 class="title"><a rel="bookmark" title="' . the_title_attribute( 'echo=0' ) . '">', '</a></h4>' ); ?>

							<?php $fields = get_fields();
							if ( !empty( $fields ) ) {
								?><div class="meta">
									<?php echo $fields; ?>
								</div><?php
							} ?>
						</div>

						<div class="clear"></div>
					</div>
				<?php
				$first = false;
				endwhile; ?>
			</div>
		</div>
	</div><?php

endif;

wp_reset_query();
?>