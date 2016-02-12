<div class="posts">

	<?php while (have_posts()) : the_post();
		$is_recipe = get_post_meta( get_the_ID(), 'wpzoom_is_recipe', true ); ?>

		<div id="post-<?php the_ID(); ?>" <?php post_class('clearfix'); ?>>

			<?php if (option::get('index_thumb') == 'on') {

				get_the_image( array( 'size' => 'loop', 'width' => option::get('thumb_width'), 'height' => option::get('thumb_height'), 'before' => '<div class="post-thumb">', 'after' => '</div>' ) );

			} ?>

			<div class="details">
				<h2 class="title"><a href="<?php the_permalink() ?>" title="<?php the_title(); ?>"><?php the_title(); ?></a></h2>

				<?php 
				if ( option::get('display_meta') == 'on' ) {
					?><div class="meta">

						<?php
						if ( $is_recipe ) {
							$fields = get_fields();
							if ( !empty( $fields ) ) echo $fields;
						} else {
							?><p><strong><img src="<?php echo get_template_directory_uri() . '/images/person.png'; ?>" /> <?php _e('Author', 'wpzoom'); ?>:</strong> <?php the_author_posts_link(); ?></p>
							<p><strong><img src="<?php echo get_template_directory_uri() . '/images/clock.png'; ?>" /> <?php _e('Posted', 'wpzoom'); ?>:</strong> <?php echo get_the_date(); ?></p><?php
						}
						?>

					</div><?php
				} ?>

				<div class="entry">
					<?php if (option::get('display_content') == 'Full Content') {  the_content('<span>'.__('Read more', 'wpzoom').' &#8250;</span>'); } if (option::get('display_content') == 'Excerpt')  { the_excerpt(); } ?>
				</div>

				<p>
					<?php if ( option::get('display_readmore') == 'on' &&  (option::get('display_content') == 'Excerpt') ) { ?><a href="<?php the_permalink(); ?>" class="more-link"><?php echo $is_recipe ? __( 'View Recipe', 'wpzoom' ) : __( 'Read More', 'wpzoom' ); ?></a><?php } ?>
					<?php edit_post_link( __('Edit', 'wpzoom'), ' <small>', '</small>' ); ?>
				</p>
			</div>

			<div class="cleaner">&nbsp;</div>

		</div><!-- /.post -->

	<?php endwhile; ?>

</div>

<div class="cleaner">&nbsp;</div>
<?php get_template_part( 'pagination' ); ?>
<?php wp_reset_query(); ?>
<div class="cleaner">&nbsp;</div>