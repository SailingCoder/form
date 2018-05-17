function pushValue(obj, name, value, isArray) {
    if (obj[name]) {
        obj[name] =  (typeof obj[name] !== 'object') ? [obj[name]] : obj[name];
        obj[name].push(value);
    } else {
        obj[name] = isArray ? [value] : value;
    }
}

module.exports = {
    /**
     * 获取text文本
     **/
    findSelectText: function (container) {
        const obj = {};
        container.find('select[data-usr-field],select[data-usr-filter]').each(function (index, ctrl) {
            let $ctrl = $(ctrl),
                name = $ctrl.attr('data-usr-field') || $ctrl.attr('data-usr-filter'),
                text = $(':selected', $ctrl).text();

            obj[name] = text;
        });
        return obj;
    },

    /**
     * 获取form表单值
     **/
    serializeDataToObj: function (container) {
        const obj = {};
        container.find('[data-usr-field],[data-usr-filter],[data-usr-radio]:checked,[data-usr-checkbox]:checked').each(function (index, ctrl) {
            let $ctrl = $(ctrl),
                isArray = $ctrl.attr('data-usr-fieldIsArray'),
                type = $ctrl.attr('data-usr-fieldtype'),
                name = $ctrl.attr('data-usr-field') || $ctrl.attr('data-usr-filter') || $ctrl.attr('data-usr-radio') || $ctrl.attr('data-usr-checkbox'),
                value = $ctrl.val();

            switch (type) {
                case 'number':
                    value = /^-?\d+\.\d+$/.test(value) ? parseFloat(value) : parseInt(value, 10);
                    if (!isNaN(value)) {
                        pushValue(obj, name, value, isArray);
                    }
                    break;
                case 'date':
                    value = value ? new Date(value) : '';
                    pushValue(obj, name, value, isArray);
                    break;
                case 'boolean':
                    if (value) {
                        pushValue(obj, name, value === 'true', isArray);
                    }
                    break;
                default :
                    pushValue(obj, name, value, isArray);
            }
        });
        return obj;
    },

    /**
     * form表单赋值
     **/
    deserializeDataFromObj: function (obj, container) {
        for (const property in obj) {
            if ({}.hasOwnProperty.call(obj, property)) {
                const $targetCtrl = container.find(`[data-usr-field=${property}],[data-usr-filter=${property}],[data-usr-text=${property}],[data-usr-radio=${property}], [data-usr-checkbox=${property}]`);
                const value = obj[property];
                if ($targetCtrl.length > 0) {
                    if (value instanceof Date) {
                        $targetCtrl.kendoTimePicker({
                            value,
                        });
                    } else {
                        if ($targetCtrl.data('kendoDropDownList')) {
                            $targetCtrl.data('kendoDropDownList').value(value);
                        } else if ($targetCtrl.data('kendoComboBox')) {
                            $targetCtrl.data('kendoComboBox').value(value);
                        } else if ($targetCtrl.is(':radio')) {
                            $targetCtrl.each(function (index, ctrl) {
                                const $ctrl = $(ctrl);
                                $ctrl.prop('checked', $ctrl.val() == value);
                            });
                        } else if ($targetCtrl.is('input')) {
                            $targetCtrl.val(value);
                        } else if ($targetCtrl.is('select')) {
                            $targetCtrl.val(value);
                        } else{
                            $targetCtrl.text(value);
                        }
                    }
                }
            }
        }

        $('input.j-dateFormat', container).each((index, item) => {
            $(item).val($(item).val().replace(/T.*/, ''));
        });
        $('input.j-dateTimeFormat', container).each((index, item) => {
            $(item).val($(item).val().replace(/T/, ' ').replace(/\..*/, ''));
        });
        $('input.j-timeFormat', container).each((index, item) => {
            $(item).val($(item).val().replace(/.*T/, '').replace(/\..*/, ''));
        });

    },

    /**
     * form表单清空或赋默认值
     **/
    restoreDataToDefault: function ($container, initData) {
        initData = initData || '';
        let hasInitData = null;
        $container.find('[data-usr-field],[data-usr-filter],[data-usr-radio],[data-usr-checkbox]').each(function (index, ctrl) {
            let $ctrl = $(ctrl),
                name = $ctrl.attr('data-usr-field');
            if (initData !== '') {
                hasInitData = {}.hasOwnProperty.call(initData, name);
            }
            if (hasInitData) {
                if ($ctrl.is(':radio')) {
                    $ctrl.prop('checked', $ctrl.val() == initData[name]);
                } else {
                    $ctrl.val(initData[name]);
                }
            } else {
                if ($ctrl.data('kendoDropDownList')) {
                   $ctrl.data('kendoDropDownList').value('');
                } else if ($ctrl.data('kendoComboBox')) {
                    $ctrl.data('kendoComboBox').value('');
                } else if ($ctrl.is(':radio')) {
                    $ctrl.prop('checked', false);
                } else if ($ctrl.is(':checkbox')) {
                    $ctrl.prop('checked', false);
                } else {
                    $ctrl.val('');
                }
            }
        });
    },
};
