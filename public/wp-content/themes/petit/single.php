<?php
$template = get_post_meta( get_the_ID(), 'wpzoom_post_template', true );
$is_recipe = get_post_meta( get_the_ID(), 'wpzoom_is_recipe', true );

if ($template == 'full') {
	$media_width = 980;
	$media_height = 554;

	if (option::get('post_thumb_limit') == 'on') { $size = 'post-full-fixed'; } else { $size = 'post-full'; }

}
else {
	$media_width = 638;
	$media_height = 350;
	if (option::get('post_thumb_limit') == 'on') { $size = 'post-regular-fixed'; } else { $size = 'post-regular'; }
}

?>

<?php get_header(); ?>

<div id="content-wrap"<?php
		if ($template == 'side-left') { echo " class=\"side-left\""; }
		if ($template == 'full') { echo " class=\"full-width\""; }
		?>>

	<div id="content">

		<div class="post_content">

			<?php wp_reset_query(); if (have_posts()) : while (have_posts()) : the_post(); ?>

				<div id="post-<?php the_ID(); ?>" <?php post_class('clearfix'); ?>>

					<div class="hrecipe">

						<?php if ( ( option::get('post_thumb') == 'on' && $is_recipe ) || ( option::get('regular_post_thumb') == 'on' && !$is_recipe ) ) {

 		 						get_the_image( array( 'size' => $size, 'width' => $media_width, 'image_class' => 'photo', 'before' => '<div class="post-thumb">', 'after' => '<p>'.get_post(get_post_thumbnail_id())->post_excerpt.'</p></div>', 'link_to_post' => false  ) );

						} ?>

	 					<h1 class="title fn"><a href="<?php the_permalink() ?>" rel="bookmark" title="Permanent Link to <?php the_title_attribute(); ?>"><?php the_title(); ?></a></h1>

						<div class="entry">

							<?php if ( option::get('post_date') == 'on' || option::get('post_author') == 'on' || option::get('post_category') == 'on' ) {
								?><p class="post_meta">
									<?php
									_e('Posted', 'wpzoom');
									if ( option::get('post_date') == 'on' ) { _e(' on ', 'wpzoom'); echo '<strong class="published">' . get_the_date() . '</strong>'; }
									if ( option::get('post_author') == 'on' ) { _e(' by ', 'wpzoom'); echo '<strong class="author">'; the_author_posts_link(); echo '</strong>'; }
									if ( option::get('post_category') == 'on' ) { _e(' in ', 'wpzoom'); echo '<strong>'; the_category(', '); echo '</strong>'; }
									?>
									<?php edit_post_link( __('Edit', 'wpzoom'), ' <small>', '</small>' ); ?>
								</p><?php
							} ?>

							<?php the_content(); ?>
							<div class="cleaner">&nbsp;</div>

							<?php if (option::get('post_tags') == 'on') { ?><?php the_tags( '<div class="tags_list">Tags: ', ' ', '</div>'); ?><?php } ?>

							<?php wp_link_pages(array('before' => '<p class="pages"><strong>'.__('Pages', 'wpzoom').':</strong> ', 'after' => '</p>', 'next_or_number' => 'number')); ?>

						</div><!-- / .entry -->

					</div><!-- / .hrecipe -->

				</div><!-- #post-<?php the_ID(); ?> -->

				<?php if ( option::get('post_related') == 'on' ) {
					get_template_part('related-posts');
				} ?>

				<?php comments_template(); ?>

			<?php endwhile; else: ?>
			<p><?php _e('Sorry, no posts matched your criteria', 'wpzoom');?>.</p>
			<?php endif; ?>

			<div class="cleaner">&nbsp;</div>
		</div><!-- / .post_content -->
	</div><!-- / #content -->

	<?php if ($template != 'full') { get_sidebar(); } ?>
	<div class="cleaner">&nbsp;</div>

</div>

<?php get_footer(); ?>