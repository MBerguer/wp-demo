<div id="related">

	<?php $category = get_the_category(); 
	$is_recipe = get_post_meta( get_the_ID(), 'wpzoom_is_recipe', true ); ?>

	<ul class="posts">

		<?php  
		
		$exclude = get_option( 'sticky_posts' );
		$exclude[] = $post->ID;

		$loop = new WP_Query( 
			array( 
				'post__not_in' => $exclude,
				'posts_per_page' => 4,
				'cat' => $category[0]->term_id
				) );

		$m = 0;

		if ( $loop->have_posts() ) {
			if ($is_recipe) { echo '<h3 class="title">'. __('Similar Recipes', 'wpzoom'). '</h3>';  }
				else { echo '<h3 class="title">'. __('Related Posts', 'wpzoom'). '</h3>'; }
		}
 
		while ( $loop->have_posts() ) : $loop->the_post(); $m++;
 		?>

		<li class="secondary<?php if (($m % 4) == 0) { echo ' secondary-last';} ?>">
			<article>

				<?php 
				$image = get_the_image( array( 'size' => 'post-related', 'width' => 140, 'height' => 130, 'before' => '<div class="cover">', 'after' => '</div>', 'echo' => false ) ); 
				echo $image; 
				?>

				<div class="postmeta<?php if (!$image) {echo ' postmeta-noimage';} ?>">
					<h2 class="small"><a href="<?php the_permalink(); ?>" title="<?php printf( esc_attr__( 'Permalink to %s', 'wpzoom' ), the_title_attribute( 'echo=0' ) ); ?>" rel="bookmark"><?php the_title_attribute();  ?></a></h2>
				</div>
				<div class="cleaner">&nbsp;</div>
			</article>
		</li>
		
		<?php endwhile; ?>
		
	</ul>
	
	<div class="cleaner">&nbsp;</div>
	
	<?php wp_reset_query(); ?>

</div>