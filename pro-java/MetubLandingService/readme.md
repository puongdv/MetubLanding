# Server infomation

root folder: /home/pro-java/MetubLandingService

Server address: [0.0.0.0]

Port: 7070

Database: Mongodb

Database name: METUB_LANDING

Database port: 27017

# Download java jdk 8
```ssh
cd /home/pro-java/libs/
wget --no-cookies --no-check-certificate --header "Cookie: gpw_e24=http%3A%2F%2Fwww.oracle.com%2F; oraclelicense=accept-securebackup-cookie" "http://download.oracle.com/otn-pub/java/jdk/8u131-b11/d54c1d3a095b4ff2b6607d096fa80163/jdk-8u131-linux-x64.tar.gz"

tar xzf jdk-8u131-linux-x64.tar.gz
```

# Deployment
Run script to deploy 
```ssh
./runserver start || restart || stop
```

# General Information
Base-URL for our API is http://api.metub.net

# Nginx config
```nginx
upstream MeTubLandingService {
   server 127.0.0.1:7070 fail_timeout=0;
}

server {
	listen 80;
	server_name api.metub.net;
	client_max_body_size 20M;
	location / {	
		proxy_pass http://MeTubLandingService;
		proxy_set_header Host $http_host;
		add_header Access-Control-Allow-Origin *;
		add_header Access-Control-Allow-Headers "X-Auth";
	}	
		
}
```