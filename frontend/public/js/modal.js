(function ($) {
    $.popup = function (opt) {
        $.ajax({
            url: opt.url,
            data: opt.data,
            dataType: 'html',
            success: function (html) {
                $("<div class='modal_popup'>"+html+"</div>")
                    .appendTo('body')
                    .modal({
                        escapeClose: true,
                        clickClose: true,
						closeExisting: opt.closeExisting !== undefined ? opt.closeExisting : false, // close existing modal option
                    })
                    .addClass("animated faster").addClass(opt.animation || "jackInTheBox").addClass(opt.largeModal)
                    .on($.modal.CLOSE, function (event, modal) {
                        if (opt.close) opt.close(modal.result);

                        modal.elm.remove();
                    });
                // Add large-modal class option
            },
            error: function (res) {
                if (opt.error) opt.error(res.responseText);
                else {
                    alert("error");
                }
                throw "popup_error";
            }
        });
    };
})(jQuery);