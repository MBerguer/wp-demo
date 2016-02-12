<?php $paged = (get_query_var('paged')) ? get_query_var('paged') : 1; // gets current page number ?>
<?php get_header(); ?>
	
	<?php if (option::get('featured_posts_show') == 'on' && $paged < 2) { // Show the Featured Slider
		get_template_part('wpzoom-slider'); 
	} ?>

	<div id="content-wrap">
		<?php if ( option::get('carousel_posts_show') == 'on' && $paged < 2 ) {
			get_template_part('wpzoom-carousel');
		} ?>

		<?php if ( option::get('recent_posts') == 'on' ) {
			?><div id="content">
				<h3 class="archive_title"><?php echo option::get('recent_title'); ?></h3>

				<?php
				 

				global $query_string; // required

				$exclude_posts = array();

				$type = option::get('recent_part_type');
				if ( $type == 'Recipe Posts' || $type == 'Regular Posts' ) {
					$recipe_posts = new WP_Query( array(
						'posts_per_page' => -1,
						'meta_key' => 'wpzoom_is_recipe',
						'meta_value' => 1
					) );
					$all_recipe_posts = array();
					while ( $recipe_posts->have_posts() ) {
						$recipe_posts->the_post();
						global $post;
						$all_recipe_posts[] = $post->ID;
					}

					if ( !empty( $all_recipe_posts ) ) {
						if ( $type == 'Recipe Posts' ) {
							$query['post__in'] = $all_recipe_posts;
						} elseif ( $type == 'Regular Posts' ) {
							$exclude_posts = $all_recipe_posts;
						}
					}
				}

				if ( 'off' != ( $cats = option::get('recent_part_exclude') ) && is_array( $cats ) && count( $cats ) > 0 ) {
					$query['category__not_in'] = $cats;
				}

				
				if ( option::get('hide_featured') == 'on' ) {
					$featured_posts = new WP_Query( array(
						'posts_per_page' => -1,
						'meta_key' => 'wpzoom_is_featured',
						'meta_value' => 1
					) );
					while ( $featured_posts->have_posts() ) {
						$featured_posts->the_post();
						global $post;
						$exclude_posts[] = $post->ID;
					}
				}
				if ( option::get('hide_carousel') == 'on' ) {
					$carousel_posts = new WP_Query( array(
						'posts_per_page' => -1,
						'meta_key' => 'wpzoom_is_carousel',
						'meta_value' => 1
					) );
					while ( $carousel_posts->have_posts() ) {
						$carousel_posts->the_post();
						global $post;
						$exclude_posts[] = $post->ID;
					}
				}
				if ( !empty($exclude_posts) ) $query['post__not_in'] = array_unique($exclude_posts);

				$query['paged'] = $paged;
				
				wp_reset_query();
				query_posts( $query );
				get_template_part('loop');
				wp_reset_query();
				?>
			</div><?php
		} ?>

		<?php get_sidebar(); ?>
	</div>

<?php get_footer(); ?>
