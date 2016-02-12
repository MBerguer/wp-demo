<div id="footer">

	<div class="inner-wrap">

		<div class="widget-area">

			<div class="column">
				<?php dynamic_sidebar('Footer (column 1)'); ?>
			</div><!-- / .column -->

			<div class="column">
				<?php dynamic_sidebar('Footer (column 2)'); ?>
			</div><!-- / .column -->

			<div class="column last">
				<?php dynamic_sidebar('Footer (column 3)'); ?>
			</div><!-- / .column -->

   			<div class="clear"></div>
        </div><!-- /.widget-area-->

 	 	<div class="clear"></div>

	    <div class="copyright">

			<div class="left">
				<?php _e('Copyright', 'wpzoom'); ?> &copy; <?php echo date("Y",time()); ?> <?php bloginfo('name'); ?>. <?php _e('All Rights Reserved', 'wpzoom'); ?>.
			</div>

			<div class="right">
				<?php _e('Powered by WordPress', 'wpzoom'); ?>. <?php _e('Designed by', 'wpzoom'); ?> <a href="http://www.wpzoom.com" target="_blank" title="Premium WordPress Themes"><strong>WPZOOM</strong></a>
			</div>

		</div><!-- /.copyright -->

	</div>

</div>

<?php
wp_reset_query();
if (is_single()) { ?><script type="text/javascript" src="https://apis.google.com/js/plusone.js"></script><?php } // Google Plus button
?>
<?php wp_footer(); ?>
</body>
</html>