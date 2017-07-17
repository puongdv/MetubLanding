(function () {
    MODULE.exports("notify", {

        // render a notify
        render: function (opts) {
            let msg;            
            if(!opts) return;
            
            if(opts.status == 'success'){
                msg = '<div class="blockui-growl" style="display:block; background-color: #4caf50"><i class="icon-checkmark3"></i>&nbsp; '+ opts.msg +'</div>';
            }else if(opts.status == 'error'){
                msg = '<div class="blockui-growl" style="display:block; background-color: #f44336"><i class="icon-cancel-circle2"></i>&nbsp; '+ opts.msg +'</div>';
            }else{
                msg = '<div class="blockui-growl" style="display:block; background-color: #ff5722"><i class="icon-warning22"></i>&nbsp; '+ opts.msg +'</div>';                
            }
       
            $.blockUI({ 
                message: msg, 
                fadeIn: 700, 
                fadeOut: 700, 
                timeout: 3000, //unblock after 3 seconds
                showOverlay: false, 
                centerY: false, 
                css: { 
                    width: '250px',
                    top: '25px',
                    left: 'auto',
                    right: '25px',
                    border: 0,
                    opacity: .95
                } 
            });
        }
    });
})();


 