<?php

get_header('shop'); ?>

<div id="main" role="main" class="full-width">

	<div class="inner-wrap">
 
		<div id="content">

			<h1 class="archive_title">
				<?php woocommerce_page_title(); ?>
			</h1>
   
			<div class="entry">

				<?php
					/**
					 * woocommerce_before_main_content hook
					 *
					 * @hooked woocommerce_output_content_wrapper - 10 (outputs opening divs for the content)
					 * @hooked woocommerce_breadcrumb - 20
					 */
					do_action('woocommerce_before_main_content');
				?>

					<?php while ( have_posts() ) : the_post(); ?>

						<?php woocommerce_get_template_part( 'content', 'single-product' ); ?>

					<?php endwhile; // end of the loop. ?>

				<?php
					/**
					 * woocommerce_after_main_content hook
					 *
					 * @hooked woocommerce_output_content_wrapper_end - 10 (outputs closing divs for the content)
					 */
					do_action('woocommerce_after_main_content');
				?>
 
				<div class="cleaner">&nbsp;</div>

			</div><!-- / .entry -->
 		 
 		</div> <!-- /#content -->  
		<div class="clear">&nbsp;</div>   
	</div><!-- /.inner-wrap -->
</div> <!-- /#main -->				
	 
<?php get_footer('shop'); ?>