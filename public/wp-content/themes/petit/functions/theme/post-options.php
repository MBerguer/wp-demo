<?php

/*  Post Layouts
==================================== */

function wpzoom_post_layout_options() {
	global $post;
	$postLayouts = array('side-right' => 'Sidebar on the right', 'side-left' => 'Sidebar on the left', 'full' => 'Full Width');
	?>

	<style>
	.RadioClass { display: none !important; }
	.RadioLabelClass { margin-right: 10px; }
	img.layout-select { border: solid 4px #c0cdd6; border-radius: 5px; }
	.RadioSelected img.layout-select { border: solid 4px #3173b2; }

	.wpz_border {border-bottom: 1px solid #EEE;padding: 0 0 10px;}
	.wpzoom_panel input[type="text"],
	.wpzoom_panel textarea { width: 100%; }
	.wpzoom_panel .desc { text-align: right; }
 	.additional_details .postbox { border: none; background: none; box-shadow: none; }
	 #wpzoom_additional_default .inside, #wpzoom_additional_meta .inside { margin: 0; padding: 0; }
	.inside table.additional_details.widefat { border: 0; }
	.inside table.additional_details.widefat th { background: #ececec; padding-left: 15px; vertical-align: top; width: 150px; }
	.inside table.additional_details.widefat td { border-bottom: 1px solid #EFEFEF; vertical-align: middle; padding: 10px; }
	.inside table.additional_details.widefat textarea { width: 100%; }
	.inside table.additional_details.widefat .description { color: #C1C1C1; float: right; font-style: normal; padding: 5px 0; }
	.inside table.additional_details.widefat option { padding-right: 15px; }
	.inside table.additional_details.widefat input[type="text"] { width: 350px; }
	.additional_details select { width: 150px; }
	#location-add,#types-add,#status-add { width: 100%; }
	.additional_details div.tabs-panel { width: 60%; }
	.addicon { vertical-align: middle; margin-right: 5px; }
 	</style>

	<script type="text/javascript">
	jQuery(document).ready( function($) {
		$(".RadioClass").change(function(){
		    if($(this).is(":checked")){
		        $(".RadioSelected:not(:checked)").removeClass("RadioSelected");
		        $(this).next("label").addClass("RadioSelected");
		    }
		});
	});
	</script>

	<fieldset>
		<div>
 			<p>
 			<?php
			foreach ($postLayouts as $key => $value)
			{
				?>
				<input id="<?php echo $key; ?>" type="radio" class="RadioClass" name="wpzoom_post_template" value="<?php echo $key; ?>"<?php if (get_post_meta($post->ID, 'wpzoom_post_template', true) == $key) { echo' checked="checked"'; } ?> />
				<label for="<?php echo $key; ?>" class="RadioLabelClass<?php if (get_post_meta($post->ID, 'wpzoom_post_template', true) == $key) { echo' RadioSelected"'; } ?>">
				<img src="<?php echo wpzoom::$wpzoomPath; ?>/assets/images/layout-<?php echo $key; ?>.png" alt="<?php echo $value; ?>" title="<?php echo $value; ?>" class="layout-select" /></label>
			<?php
			}
			?>
 			</p>
   		</div>
	</fieldset>
	<?php
}


/* Additional Labels
==================================== */

function wpzoom_additional_options() {
	global $post;

	$options = array();
	foreach ( option::$options as $option => $val ) {
		if ( preg_match( '#additional_([1-9][0-9]*)_label#i', $option, $matches ) && trim($val) != '' ) {
			$number = $matches[1];
			$options[$number] = trim($val);
		}
	}

	foreach ( $options as $option => $val ) {
		$id = $option;
		$icon = isset(option::$options["additional_{$id}_icon"]) ? option::$options["additional_{$id}_icon"] : '';
		$img = trim($icon) != '' ? '<img src="' . $icon . '" class="addicon" /> ' : '';
	?>
	<fieldset>
		<table class="widefat additional_details">
			<tbody>
				<tr class="wpp_attribute_row">
					<th><label for="wpzoom_additional_<?php echo $id; ?>"><?php echo $img . $val; ?></label></th>
					
					<td class="wpp_attribute_cell">
						<input type="text" name="wpzoom_additional_<?php echo $id; ?>" id="wpzoom_additional_<?php echo $id; ?>" value="<?php echo get_post_meta($post->ID, 'wpzoom_additional_' . $id, true); ?>"/>
					</td>
				</tr>
			</tbody>
		</table>
 	</fieldset>
	<?php
    }
    ?>
	
	<p class="description">You can add more post details in <a href="admin.php?page=wpzoom_options" target="_blank">Theme Options &rarr; Additional Post Details</a></p>
	
	<?php 
}


/* Custom Posts Options	
==================================== */

function wpzoom_post_embed_info() {
	global $post;

	?>
	<fieldset>
		<p class="wpz_border">
			<?php $isChecked = ( get_post_meta($post->ID, 'wpzoom_is_recipe', true) == 1 ? 'checked="checked"' : '' ); // we store checked checkboxes as 1 ?>
			<input type="checkbox" name="wpzoom_is_recipe" id="wpzoom_is_recipe" value="1" <?php echo $isChecked; ?> /> <label for="wpzoom_is_recipe"><?php _e('This Post is a Recipe', 'wpzoom'); ?></label> 
		</p>
	</fieldset>

	<fieldset>
		<p class="wpz_border">
			<?php $isChecked = ( get_post_meta($post->ID, 'wpzoom_is_featured', true) == 1 ? 'checked="checked"' : '' ); // we store checked checkboxes as 1 ?>
			<input type="checkbox" name="wpzoom_is_featured" id="wpzoom_is_featured" value="1" <?php echo $isChecked; ?> /> <label for="wpzoom_is_featured"><?php _e('Feature on Homepage', 'wpzoom'); ?></label> 
		</p>
	</fieldset>

	<fieldset>
		<p class="wpz_border">
			<?php $isChecked = ( get_post_meta($post->ID, 'wpzoom_is_carousel', true) == 1 ? 'checked="checked"' : '' ); // we store checked checkboxes as 1 ?>
			<input type="checkbox" name="wpzoom_is_carousel" id="wpzoom_is_carousel" value="1" <?php echo $isChecked; ?> /> <label for="wpzoom_is_carousel"><?php _e('Feature in Homepage Carousel', 'wpzoom'); ?></label> 
		</p>
	</fieldset>
	<?php
}


/*
/* Registering metaboxes
============================================*/

add_action('admin_menu', 'wpzoom_options_box');

function wpzoom_options_box() {
 	add_meta_box('wpzoom_post_embed', 'Post Options', 'wpzoom_post_embed_info', 'post', 'side', 'high');
	add_meta_box('wpzoom_post_layout', 'Post Layout', 'wpzoom_post_layout_options', 'post', 'normal', 'high');
	add_meta_box('wpzoom_additional_meta', 'Additional Details', 'wpzoom_additional_options', 'post', 'normal', 'high');
}


add_action('save_post', 'custom_add_save');

function custom_add_save($postID){
   
	// called after a post or page is saved
	if($parent_id = wp_is_post_revision($postID))
	{
	  $postID = $parent_id;
	}

	if ($_POST['save'] || $_POST['publish']) {
		$options = array();
		foreach ( option::$options as $option => $val ) {
 			if ( preg_match( '#additional_([1-9][0-9]*)_label#i', $option, $matches ) && trim($val) != '' ) {
				$options[] = $matches[1];
			}
		}

		foreach ($options as $option) {
			$id = $option;
			update_custom_meta($postID, $_POST['wpzoom_additional_' . $id], 'wpzoom_additional_' . $id);
		}

		update_custom_meta($postID, $_POST['wpzoom_is_recipe'], 'wpzoom_is_recipe');
		update_custom_meta($postID, $_POST['wpzoom_is_featured'], 'wpzoom_is_featured');
		update_custom_meta($postID, $_POST['wpzoom_is_carousel'], 'wpzoom_is_carousel');
		update_custom_meta($postID, $_POST['wpzoom_post_template'], 'wpzoom_post_template');
 	}
}

function update_custom_meta($postID, $newvalue, $field_name) {
	// To create new meta
	if(!get_post_meta($postID, $field_name)){
	add_post_meta($postID, $field_name, $newvalue);
	}else{
	// or to update existing meta
	update_post_meta($postID, $field_name, $newvalue);
	}
}