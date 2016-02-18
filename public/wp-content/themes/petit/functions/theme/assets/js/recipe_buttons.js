/* 
 TynyMCE buttons for [ingredients] and [directions] shortcodes
*/

(function(){
    // creates the plugin
    tinymce.create('tinymce.plugins.recipe', {

         init : function(ed, url, id, controlManager) {
            ed.addButton('ingredients', {
                title : wpzRecipeL10n.titleIngredients,
                image : url+'/../image/ingredients.png',
                onclick : function() {
                        ed.execCommand('mceInsertContent', 0, '[ingredients title="Ingredients"]<ul><li class="ingredient">' + wpzRecipeL10n.listItemsHere + '</li></ul>[/ingredients]');
                    }
            });
						ed.addButton('directions', {
                title : wpzRecipeL10n.titleDirections,
                image : url+'/../image/directions.png',
                onclick : function() {
                        ed.execCommand('mceInsertContent', 0, '[directions title="Directions"]<ol><li>' + wpzRecipeL10n.listItemsHere + '</li></ol>[/directions]');
                    }
            });
        },

        createControl : function(n, cm) {
            return null;
        },
    });
    
    // registers the plugin. 
    tinymce.PluginManager.add('recipe', tinymce.plugins.recipe);
})()
