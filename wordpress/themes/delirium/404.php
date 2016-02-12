<?php get_header(); ?>
<div id="main" role="main">

	<div class="inner-wrap">
 
		<div id="content">
 
	  		<div class="post">
				<div class="entry">
					<?php if ( have_posts() ) 	the_post(); ?>
					
					<h1><?php _e('Error 404 - Nothing Found', 'wpzoom'); ?></h1>
					
					<h3><?php _e('The page you are looking for could not be found.', 'wpzoom');?> </h3>
				</div><!-- / .entry -->
			</div><!-- /.post -->

		</div><!-- /#content -->
 
 		<?php get_sidebar(); ?>

	</div><!-- /.inner-wrap -->
   			
</div> <!-- /#main -->

<?php get_footer(); ?> 