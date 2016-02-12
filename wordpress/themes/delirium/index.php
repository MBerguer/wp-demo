<?php get_header(); ?>
	
	<?php if(is_home() && $paged < 2) { // Check if we're on the homepage
 
		if (option::get('featured_posts_show') == 'on' ) { // Is the Featured Slider enabled?
			
			get_template_part('wpzoom-slider'); 

		} ?>


		<?php if ( option::get('homepage_intro') == 'on'  ||  option::get('featured_products_enable') == 'on') { ?>
 	 
			<div id="featured-products">

				<div class="inner-wrap">
	 
					<?php if ( option::get('homepage_intro') == 'on' ) { ?>
						
						<div class="welcome_message">

							<h2><?php echo option::get('homepage_intro_headline'); ?></h2>
							 
							<p><?php echo option::get('homepage_intro_msg'); ?></p>
							 
						</div>

					<?php } ?>

					<?php if ( option::get('homepage_intro') == 'on'  &&  option::get('featured_products_enable') == 'on') { ?>

						<div class="featured-separator"></div>

					<?php } ?>


					<?php if (current_theme_supports('woocommerce') && option::get('featured_products_enable') == 'on') { // Is WooCommerce enabled and Featured Products enabled? ?>
		 
						<h3><?php echo option::get('featured_products_headline'); ?></h3>

						<ul class="featured-products">
							<?php
								$woo_args = array( 'post_type' => 'product', 'posts_per_page' => option::get('featured_products_number'), 'meta_key' => '_featured', 'meta_value' => 'yes' );
								$woo_loop = new WP_Query( $woo_args );
								$m = 0; 
								while ( $woo_loop->have_posts() ) : $woo_loop->the_post(); $_product; $m++; 
								if ( function_exists( 'get_product' ) ) {
									$_product = get_product( $woo_loop->post->ID );
								} else {
									$_product = new WC_Product( $woo_loop->post->ID );
								}
							?>
							<li<?php if ($m == 4) { $m = 0; echo ' class="last"'; } ?>>

								<?php $productPrice = $_product->get_price_html(); ?>
			 
			 					<?php get_the_image( array( 'size' => 'woo-featured', 'width' => 230, 'height' => 260, 'before' => '<div class="post-thumb">', 'after' => '<span class="price">'. $productPrice .'</span></div>' ) ); ?>

			 					<h3><a href="<?php the_permalink(); ?>" title="<?php the_title_attribute(); ?>"><?php the_title(); ?></a></h3>
			 					  
								<?php do_action( 'woocommerce_after_shop_loop_item' ); ?>
			 
							</li>
							<?php endwhile; ?>
						</ul>
						<div class="clear"></div>

					<?php } ?>
				
				</div><!--/#featured-products-->

			</div>

		<?php } ?>

		<?php wp_reset_query(); ?>
 

 		<?php if ( is_active_sidebar( 'home-1'  ) ||  is_active_sidebar( 'home-2'  )  ||  is_active_sidebar( 'home-3'  ) ) { ?>
	 
			<div class="home_widgets">

				<div class="inner-wrap">
	 			
					<div class="home_column">
						<?php dynamic_sidebar('Homepage (column 1)') ?>
					</div>
					
					<div class="home_column">
						<?php dynamic_sidebar('Homepage (column 2)') ?>
					</div>
					
					<div class="home_column last">
						<?php dynamic_sidebar('Homepage (column 3)') ?>
					</div>
				</div>

				<div class="clear"></div>
			
			</div>
		
		<?php } ?>

	<?php } ?>

	<div class="clear"></div>


	<div id="main" role="main">

		<div class="inner-wrap">
		
			<div id="content">
			
 		  
		 		<?php if ( $paged > 1 || option::get('recent_posts') == 'on') { ?>
				
				<div class="archiveposts">
			
				 
			 		<?php
						global $query_string; // required

						/* Exclude categories from Recent Posts */
						if (option::get('recent_part_exclude') != 'off') {
							if (count(option::get('recent_part_exclude'))){
								$exclude_cats = implode(",-", (array) option::get('recent_part_exclude'));
								$exclude_cats = '-' . $exclude_cats;
								$args['cat'] = $exclude_cats;
							}
						}

						/* Exclude featured posts from Recent Posts */
						if (option::get('hide_featured') == 'on') {
							
							$featured_posts = new WP_Query( 
								array( 
									'post__not_in' => get_option( 'sticky_posts' ),
									'posts_per_page' => option::get('featured_number'),
									'meta_key' => 'wpzoom_is_featured',
									'meta_value' => 1				
									) );
								
							while ($featured_posts->have_posts()) {
								$featured_posts->the_post();
								global $post;
								$postIDs[] = $post->ID;
							}
							$args['post__not_in'] = $postIDs;
						}

						$args['paged'] = $paged;
						if (count($args) >= 1) {
							query_posts($args);
						}
						?>

					<?php get_template_part('loop'); ?>
		   
		 		</div> <!-- /.archiveposts -->
				
				<?php } ?>

			</div><!-- /#content -->
		 
			<?php get_sidebar(); ?>

		</div>
		
	</div><!-- /#main -->
	 
<?php get_footer(); ?> 