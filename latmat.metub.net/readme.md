# Javascript config

root folder: /home/latmat.metub.net

Opent the file **/home/latmat.metub.net/index.html** and edit javascript config

```javascript
window.PCONF = {
	API_URL: 'latmat.metub.net',
	API_DB_URL: 'http://api.metub.net',
	PLAYLIST: {
		'PLGRd4Y_oqrRp1HW_dSH7cENV9kNCtde7F': 'Vai Diễn Tâm',
		'PLGRd4Y_oqrRp-lqsfT2v86Qh5-2NJWUb5': 'Vai Diễn Christe',
		'PLGRd4Y_oqrRrQHbbfxwxf0M5h5URFRD3V': 'Vai Diễn Lân',
		'PLGRd4Y_oqrRosdLzRFhGBOa1EvjJRDpv8': 'Vai Giang Hồ'
	}
}
```

Opent the file **/home/latmat.metub.net/admin/js/app.js** and edit javascript config

```javascript
MODULE.basePath = "http://admin.metub.net/";

API.basePath = "http://api.metub.net";
window.CONF = {            
	TITLE: 'Casting Online Phim Lật Mặt 3 | - Metub',
	COOKIE_NAME: 'METUB',
	MY_HOST: 'http://admin.metub.net',
	MY_STATIC: 'http://admin.metub.net',
	USER: {},
	LOAD: {
		navbar: false,
		sidebar: false
	},
	APP_NAME: 'METUB',
	APP_COPYRIGHT: '@ '+ (new Date()).getFullYear(),
	PLAYLIST: {
		'PLGRd4Y_oqrRp1HW_dSH7cENV9kNCtde7F': 'Vai Diễn Tâm',
		'PLGRd4Y_oqrRp-lqsfT2v86Qh5-2NJWUb5': 'Vai Diễn Christe',
		'PLGRd4Y_oqrRrQHbbfxwxf0M5h5URFRD3V': 'Vai Diễn Lân',
		'PLGRd4Y_oqrRosdLzRFhGBOa1EvjJRDpv8': 'Vai Giang Hồ'
	}
}
```


# Nginx config
```nginx
server {
	listen 80;
	server_name admin.metub.net;
	add_header Access-Control-Allow-Origin *;	
	root /home/latmat.metub.net/admin;
	autoindex on;
	location / {
		index index.html;
		try_files $uri /index.html;
	}
}

server {
	
	listen      80;
	server_name 80 latmat.metub.net;
	root        /home/latmat.metub.net;
	index       index.php index.html index.htm;
	charset     utf-8;	
	client_max_body_size 5G;
	
	location ~* \.(?:ico|css|js|gif|jpe?g|png)$ {
		expires 30d;
		add_header Vary Accept-Encoding;
		access_log off;
	}
	
	location / {				
		try_files $uri $uri/ /index.php?_url=$uri&$args;
	}			

	location ~ \.php$ {
		try_files     $uri =404;

		fastcgi_pass  127.0.0.1:9000;
		fastcgi_index /index.php;

		include fastcgi_params;
		fastcgi_split_path_info       ^(.+\.php)(/.+)$;
		fastcgi_param PATH_INFO       $fastcgi_path_info;
		fastcgi_param PATH_TRANSLATED $document_root$fastcgi_path_info;
		fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
		fastcgi_read_timeout 18000;
	}

	location ~ /\.ht {
		deny all;
	}  
}
```