# Eigen Dashboard

## host
127.0.0.1  dev-deliver-secret.eigen.com
## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```


## Deploy

```
docker build -t secret:v1 . 
docker run -p 8090:80 -d --name secret secret:v1 
```
then access `http://$IP:8090` on your browser
