<?php get_header(); ?>

<div id="main" role="main">

	<div class="inner-wrap">
 
		<div id="content">
  		
  			<h1 class="archive_title"><?php _e('Search Results for','wpzoom');?> <strong>"<?php the_search_query(); ?>"</strong> <?php $total_results = $wp_query->found_posts; echo ": " .$total_results. " "; ?></h1>
 
 			<?php get_template_part('loop'); ?>
	
		</div> <!-- /#content -->
		
		<?php get_sidebar(); ?> 
	
	</div><!-- /.inner-wrap -->

</div> <!-- /#main -->

<?php get_footer(); ?> 