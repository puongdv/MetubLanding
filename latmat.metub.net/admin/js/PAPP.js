/**
 * Sorting.
 */

(function (window, document) {

    if (window.PAPP) return;
    
    window.PAPP = {
        renderPaginate: function(total, size, list, page, model){
            if(total <= 0){
                $("#paginate").remove();
            }

            let pageSize = Math.ceil(total/size);
            let pageContent = "<span>";
            let pageFirst = "";
            let pageEnd = "";
            if(pageSize > 5){
                pageFirst = '<a class="paginate_button previous" href="/'+ model +'?page=1&limit='+size+'">?</a>';
                offset = (pageSize - 1) * size;
                pageEnd = '<a class="paginate_button previous" href="/'+ model +'?page='+ pageSize +'&limit='+size+'">?</a>';
            }
            for(let i = 1; i <= pageSize; i++){
                let current = i == page ? "current" : "";
                pageContent += '<a class="paginate_button '+ current +'" href="/'+ model +'?page='+ i +'&limit='+size+'">1</a>';
            }
            pageContent += "</span>";
            if(model == 'home') model = 'user';
            $('#page-info').html('Showing '+ list.length +' of '+ total +' ' + model + '\'s');
            $('#page-paginate-info').html(pageFirst + pageContent + pageEnd);
        },
        renderUser: function(list){
            let trContent = "";
            if(!list) return '<tr colspan="5">Not found data</tr>';
            for(let i=0; i<list.length; i++){
                let u = list[i];
                trContent+= '<tr>' +
                    '<td>'+ u.ID +'</td>' +
                    '<td>'+ u.fullname +'</td>' +
                    '<td>'+ u.email +'</td>' +
                    '<td>'+ u.phone +'</td>' +
                    '<td>'+ u.createdTime +'</td>' +
                    '</tr>';
            }
            $('#table-body-content').html(trContent);
        },
        renderVideo: function(list){
            console.log(CONF.PLAYLIST)
            let trContent = "";
            if(!list) return '<tr colspan="4">Not found data</tr>';
            for(let i=0; i<list.length; i++){
                let v = list[i];
                trContent+= '<tr>' +
                    '<td>'+ v.userId +'</td>' +
                    '<td>'+ v.title +'</td>' +
                    '<td>'+ CONF.PLAYLIST[v.playlistId] +'</td>' +
                    '<td>'+ v.createdTime +'</td>' +
                    '</tr>';
            }
            $('#table-body-content').html(trContent);
        }
    }
})(window, document);