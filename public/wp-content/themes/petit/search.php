<?php get_header(); ?>

<div id="content-wrap">

	<div id="content">
	 
		<div class="post_content">
 			
			<h1 class="archive_title"><?php _e('Search Results for','wpzoom');?> <em>"<?php the_search_query(); ?>"</em></h1>
			 

			<?php if (have_posts()) : ?>
 	 
				<?php get_template_part('loop'); ?>

			<?php else : ?>

				<p><?php _e('Sorry, no posts matched your criteria:', 'wpzoom'); ?> <em>"<?php the_search_query(); ?>"</em></p>
				<?php get_template_part('searchform'); ?>

			<?php endif; ?>
   

			<div class="cleaner">&nbsp;</div>          
		</div><!-- / .post_content -->

 
	</div><!-- / #content -->
	
	<?php get_sidebar(); ?>

</div>
 
<?php get_footer(); ?>