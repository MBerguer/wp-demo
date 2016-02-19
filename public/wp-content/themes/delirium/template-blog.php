<?php
/*
Template Name: Blog
*/
?>

<?php get_header(); ?>


<div id="main">

	<div class="inner-wrap">

		<div id="content">

			<h1 class="archive_title"><?php the_title(); ?></h1>

			<?php
				if ( get_query_var('paged') )
					$paged = get_query_var('paged');
				elseif ( get_query_var('page') )
					$paged = get_query_var('page');
				else
					$paged = 1;

				query_posts("post_type=post&paged=$paged"); if (have_posts()) :
			?>

				<?php get_template_part('loop'); ?>

			<?php endif; ?>

		</div><!-- / #content -->

		<?php get_sidebar(); ?>

	</div><!-- /.inner-wrap -->

</div> <!-- /#main -->

<?php get_footer(); ?>