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