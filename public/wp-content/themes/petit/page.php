<?php get_header(); ?>

<div id="content-wrap">

	<div id="content">
	 
		<div class="post_content">
			<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
			
			<h1 class="title"><?php the_title(); ?></h1>
			<?php edit_post_link( __('Edit', 'wpzoom'), '', ''); ?>

			<div class="entry">
			
				<?php the_content(); ?>
			
				<?php wp_link_pages(array('before' => '<p class="pages"><strong>'.__('Pages', 'wpzoom').':</strong> ', 'after' => '</p>', 'next_or_number' => 'number')); ?>

			</div><!-- / .entry -->
 
 			<?php endwhile; else: ?>
			<p><?php _e('Sorry, no posts matched your criteria', 'wpzoom');?>.</p>
			<?php endif; ?>

			<div class="cleaner">&nbsp;</div>          
		</div><!-- / .post_content -->

		<?php if (option::get('comments_page') == 'on') { ?>
			<?php comments_template(); ?>  
		<?php } ?>

	</div><!-- / #content -->
	
	<?php get_sidebar(); ?>

</div>
 
<?php get_footer(); ?>