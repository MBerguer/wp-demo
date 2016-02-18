<?php
/**
 * @var $model N2SystemFontModel
 */

$sets = $model->getSets();

N2FontRenderer::$sets[] = $sets[0]['id'];

$fonts = array();
foreach (array_unique(N2FontRenderer::$sets) AS $setId) {
    $fonts[$setId] = $model->getVisuals($setId);
}

$fontSettings = N2Fonts::loadSettings();
N2JS::addFirstCode("
    new NextendFontManager({
        setsIdentifier: '" . $model->type . "set',
        sets: " . json_encode($sets) . ",
        visuals: " . json_encode($fonts) . ",
        renderer: {
            pre: '" . N2FontRenderer::$pre . "',
            usedFonts: " . json_encode(N2FontRenderer::$fonts) . ",
            modes: " . json_encode(N2FontRenderer::$mode) . "
        },
        ajaxUrl: '" . $this->appType->router->createAjaxUrl(array('font/index')) . "',
        defaultFamily: " . json_encode($fontSettings['default-family']) . "
    });
");
?>
    <div class="n2-form-tab ">
        <div class="n2-heading-controls n2-content-box-title-bg">
            <div class="n2-table n2-table-fixed">
                <div class="n2-tr">
                    <div class="n2-td n2-h2">
                        <?php n2_e('Font settings'); ?>
                    </div>

                    <div class="n2-td n2-last n2-visual-editor-tabs">
                        <a href="#"
                           class="n2-button n2-button-v n2-button-medium n2-button-grey n2-editor-clear-tab n2-h5 n2-uc"
                           style="display: none;"><?php n2_e('Clear tab'); ?></a>

                        <div class="n2-form-element-radio-tab">
                            <div class="n2-radio-option n2-h4 n2-first n2-last n2-active">
                                #0
                            </div>
                            <input type="hidden" autocomplete="off" value="0" name="n2-font-editor-tabs"
                                   id="n2-font-editor-tabs">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div>
            <?php
            $model->renderForm();
            ?>
        </div>
    </div>

    <div class="n2-form-tab n2-editor-preview-box">
        <div class="n2-heading-controls n2-content-box-title-bg">
            <div class="n2-table n2-table-fixed">
                <div class="n2-tr">
                    <div class="n2-td n2-h2">
                        <?php n2_e('Preview'); ?>
                    </div>

                    <div class="n2-td n2-last n2-visual-editor-preview-tab">
                        <div class="n2-form-element-radio-tab n2-expert">
                            <div class="n2-radio-option n2-h4 n2-first n2-last n2-active">
                                <?php n2_e('Default'); ?>
                            </div>
                            <input type="hidden" autocomplete="off" value="0" name="n2-font-editor-preview-mode"
                                   id="n2-font-editor-preview-mode">
                        </div>
                        <div class="n2-editor-background-color">
                            <div style="" class="n2-form-element-text n2-form-element-color n2-border-radius">
                                <div class="n2-sp-replacer">
                                    <div class="n2-sp-preview">
                                        <div class="n2-sp-preview-inner"></div>
                                    </div>
                                    <div class="n2-sp-dd">▲</div>
                                </div>
                                <input type="text" autocomplete="off" class="n2-h5" value="ced3d5"
                                       name="n2-font-editor-background-color" id="n2-font-editor-background-color">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="n2-font-editor-preview">
        </div>
    </div>

<?php
$model->renderFormExtra();
?>