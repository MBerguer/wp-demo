<?php
/*
Template Name: Blog
*/
?>
 
<?php get_header(); ?>

<div id="content-wrap">

	<div id="content">

		<div class="post_content">

			<h1 class="archive_title"><?php the_title(); ?></h1>
	 
			<?php
			$query['post_type'] = 'post';

			// WP 3.0 PAGED BUG FIX
			if ( get_query_var('paged') )
				$paged = get_query_var('paged');
			elseif ( get_query_var('page') ) 
				$paged = get_query_var('page');
			else 
				$paged = 1;
			//$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
			$query['paged'] = $paged;

			$recipe_posts = new WP_Query( array( 'posts_per_page' => -1, 'meta_key' => 'wpzoom_is_recipe', 'meta_value' => 1 ) );
			$all_recipe_posts = array();
			while ( $recipe_posts->have_posts() ) { $recipe_posts->the_post(); $all_recipe_posts[] = get_the_ID(); }
			if ( !empty($all_recipe_posts) ) $query['post__not_in'] = $all_recipe_posts;

			query_posts($query);
				
			if (have_posts()) : ?>	
			
				<?php get_template_part('loop'); ?>
				
			<?php endif; ?>
	 
		</div><!-- / .post_content -->

	</div><!-- / #content -->

	<?php get_sidebar(); ?>

</div>

<?php get_footer(); ?>